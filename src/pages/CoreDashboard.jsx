import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const BANDAS = ['Preventiva', 'Temprana', 'Tardía', 'Judicial', 'Castigo']

const BANDA_COLOR = {
  Preventiva: '#4ade80',
  Temprana:   '#fbbf24',
  'Tardía':   '#fb923c',
  Judicial:   '#f87171',
  Castigo:    '#9ca3af',
}

const BANDA_GLOW = {
  Preventiva: 'rgba(74,222,128,0.25)',
  Temprana:   'rgba(251,191,36,0.25)',
  'Tardía':   'rgba(251,146,60,0.25)',
  Judicial:   'rgba(248,113,113,0.25)',
  Castigo:    'rgba(156,163,175,0.25)',
}

export default function CoreDashboard() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)

  const [data, setData] = useState(null)
  const [bandaActiva, setBandaActiva] = useState('Preventiva')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modalCuenta, setModalCuenta] = useState(null)
  const [historial, setHistorial] = useState([])
  const [formGestion, setFormGestion] = useState({ pktipogestion: '', resultado: '', compromisopago: '', montocomprometido: '' })
  const [enviandoGestion, setEnviandoGestion] = useState(false)
  const [msgGestion, setMsgGestion] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('core_token')
    const u = localStorage.getItem('core_usuario')
    if (!t || !u || u === 'undefined') {
      navigate('/core-login')
      return
    }
    setToken(t)
    setUsuario(JSON.parse(u))
    cargarCartera(t)
  }, [])

  async function cargarCartera(t) {
    setCargando(true)
    setError('')
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/mora/cartera`, {
        headers: { Authorization: `Bearer ${t}` }
      })
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar la cartera de mora.')
    } finally {
      setCargando(false)
    }
  }

  async function abrirGestion(cuenta) {
    setModalCuenta(cuenta)
    setMsgGestion(null)
    setFormGestion({ pktipogestion: '', resultado: '', compromisopago: '', montocomprometido: '' })
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/mora/gestiones/${cuenta.pkcuentacredito}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setHistorial(res.data)
    } catch {
      setHistorial([])
    }
  }

  async function enviarGestion() {
    setEnviandoGestion(true)
    setMsgGestion(null)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/mora/gestion`, {
        pkcuentacredito: modalCuenta.pkcuentacredito,
        pktipogestion: Number(formGestion.pktipogestion),
        diasatrasoalmomento: modalCuenta.diasatrasocredito,
        resultado: formGestion.resultado,
        compromisopago: formGestion.compromisopago || null,
        montocomprometido: formGestion.montocomprometido || null,
      }, { headers: { Authorization: `Bearer ${token}` } })

      setMsgGestion({ tipo: 'ok', texto: res.data.mensaje })
      abrirGestion(modalCuenta) // recarga historial
    } catch (err) {
      setMsgGestion({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al registrar gestión.' })
    } finally {
      setEnviandoGestion(false)
    }
  }

  async function transicionar(accion) {
    try {
      const res = await axios.patch(`${import.meta.env.VITE_API_URL}/api/mora/transicion/${modalCuenta.pkcuentacredito}`, {
        accion
      }, { headers: { Authorization: `Bearer ${token}` } })

      setMsgGestion({ tipo: 'ok', texto: res.data.mensaje })
      cargarCartera(token)
    } catch (err) {
      setMsgGestion({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error en la transición.' })
    }
  }

  function salir() {
    localStorage.removeItem('core_token')
    localStorage.removeItem('core_usuario')
    navigate('/core-login')
  }

  if (cargando) {
    return (
      <div style={{ background: '#0b0e0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Cargando cartera de mora...</div>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    )
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: '#0b0e0d', minHeight: '100vh', color: '#fff' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        ::selection { background: #f5a623; color: #0b0e0d; }
      `}</style>

      {/* Header */}
      <div style={{
        background: '#0f1512',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        padding: '1.1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.4rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem' }}>
            <div style={{
              width: '40px', height: '40px',
              background: 'linear-gradient(150deg, #f5c863, #f5a623 45%, #c97f0f)',
              borderRadius: '11px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem',
              boxShadow: '0 0 0 1px rgba(245,166,35,0.3), 0 4px 14px rgba(245,166,35,0.35)'
            }}>
              🏦
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.01em', lineHeight: 1.1 }}>
                Core Bancario
              </div>
              <div style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', textTransform: 'uppercase', marginTop: '2px' }}>
                Módulo de Mora
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '26px', background: 'rgba(255,255,255,0.1)' }} />

          <Link to="/core-solicitudes" style={{
            color: '#f5a623',
            fontSize: '0.84rem',
            fontWeight: 600,
            textDecoration: 'none',
            padding: '0.45rem 1rem',
            borderRadius: '8px',
            background: 'rgba(245,166,35,0.1)',
            border: '1px solid rgba(245,166,35,0.25)',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.2)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,166,35,0.1)' }}
          >
            Solicitudes de Crédito →
          </Link>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{usuario?.nombre}</div>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{usuario?.cargo}</div>
          </div>
          <button
            onClick={salir}
            style={{
              background: 'transparent',
              color: '#f87171',
              border: '1px solid rgba(248,113,113,0.35)',
              padding: '0.5rem 1.1rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 700,
              fontSize: '0.8rem',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f87171'; e.currentTarget.style.color = '#0b0e0d' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#f87171' }}
          >
            Salir
          </button>
        </div>
      </div>

      <div style={{ padding: '2.2rem' }}>
        {error && (
          <div style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', padding: '1rem 1.2rem', borderRadius: '10px', marginBottom: '1.4rem', fontSize: '0.88rem' }}>
            ⚠ {error}
          </div>
        )}

        {data && (
          <>
            {/* KPI General */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.8rem' }}>
              <div style={{
                background: 'linear-gradient(155deg, #14201b, #0f1714)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px', padding: '1.4rem 1.8rem', flex: '0 0 220px'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  CRÉDITOS EN MORA
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>
                  {data.kpiGeneral.totalCreditosEnMora}
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(155deg, #1f1812, #16110d)',
                border: '1px solid rgba(245,166,35,0.2)',
                borderRadius: '16px', padding: '1.4rem 1.8rem', flex: '0 0 320px'
              }}>
                <div style={{ fontSize: '0.72rem', color: 'rgba(245,166,35,0.7)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>
                  MONTO TOTAL EN MORA
                </div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#f5c863', fontFamily: "'JetBrains Mono', monospace" }}>
                  S/ {Number(data.kpiGeneral.montoTotalEnMora).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>

            {/* Tabs por banda - escalera de riesgo */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
              {BANDAS.map(b => {
                const kpi = data.kpis.find(k => k.banda === b)
                const activo = bandaActiva === b
                const color = BANDA_COLOR[b]
                return (
                  <button
                    key={b}
                    onClick={() => setBandaActiva(b)}
                    style={{
                      padding: '0.7rem 1.2rem', borderRadius: '10px', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.83rem',
                      background: activo ? color : 'rgba(255,255,255,0.04)',
                      color: activo ? '#0b0e0d' : 'rgba(255,255,255,0.75)',
                      border: activo ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: activo ? `0 4px 18px ${BANDA_GLOW[b]}` : 'none',
                      transition: 'all 0.15s ease',
                      display: 'flex', alignItems: 'center', gap: '0.5rem'
                    }}
                  >
                    <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: activo ? '#0b0e0d' : color, flexShrink: 0 }} />
                    {b}
                    <span style={{ opacity: 0.7, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem' }}>
                      {kpi?.cantidad || 0}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Tabla de cartera filtrada */}
            <div style={{ background: '#0f1512', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                    <th style={thStyle}>Cliente</th>
                    <th style={thStyle}>DNI</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Días atraso</th>
                    <th style={{ ...thStyle, textAlign: 'right' }}>Saldo vencido</th>
                    <th style={thStyle}>Estado</th>
                    <th style={thStyle}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.cartera.filter(c => c.banda === bandaActiva).map(c => (
                    <tr key={c.pkcuentacredito} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={tdStyle}>{c.nomcliente}</td>
                      <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.82rem' }}>{c.dni}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, color: BANDA_COLOR[c.banda], fontFamily: "'JetBrains Mono', monospace" }}>{c.diasatrasocredito}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace" }}>S/ {Number(c.montosaldovencido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      <td style={tdStyle}>
                        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>{c.desestadocredito}</span>
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => abrirGestion(c)}
                          style={{ background: '#f5a623', color: '#0b0e0d', border: 'none', padding: '0.45rem 1rem', borderRadius: '7px', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 700 }}
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.cartera.filter(c => c.banda === bandaActiva).length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>No hay cuentas en esta banda.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modal de gestión */}
      {modalCuenta && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#111714', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.8rem', width: '520px', maxHeight: '85vh', overflowY: 'auto', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{modalCuenta.nomcliente}</h3>
                <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>
                  DNI: {modalCuenta.dni} · {modalCuenta.diasatrasocredito} días · <strong style={{ color: BANDA_COLOR[modalCuenta.banda] }}>{modalCuenta.banda}</strong>
                </span>
              </div>
              <button onClick={() => setModalCuenta(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.3rem' }}>
              <button
                onClick={() => transicionar('judicial')}
                style={{ flex: 1, padding: '0.65rem', background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
              >
                ⚖ Derivar a Judicial
              </button>
              <button
                onClick={() => transicionar('castigo')}
                style={{ flex: 1, padding: '0.65rem', background: 'rgba(156,163,175,0.12)', color: '#d1d5db', border: '1px solid rgba(156,163,175,0.3)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.8rem' }}
              >
                ☒ Castigar cuenta
              </button>
            </div>

            {msgGestion && (
              <div style={{
                padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem',
                background: msgGestion.tipo === 'ok' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                color: msgGestion.tipo === 'ok' ? '#4ade80' : '#f87171',
                border: `1px solid ${msgGestion.tipo === 'ok' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`
              }}>
                {msgGestion.tipo === 'ok' ? '✓' : '⚠'} {msgGestion.texto}
              </div>
            )}

            <div style={{ marginBottom: '1.3rem' }}>
              <h4 style={{ margin: '0 0 0.7rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>Nueva gestión de cobranza</h4>

              <select
                value={formGestion.pktipogestion}
                onChange={e => setFormGestion(f => ({ ...f, pktipogestion: e.target.value }))}
                style={inputStyle}
              >
                <option value="">Tipo de gestión...</option>
                <option value="1">Envío de SMS</option>
                <option value="2">Llamada telefónica</option>
                <option value="3">Visita domiciliaria</option>
                <option value="4">Carta / notificación</option>
                <option value="5">Compromiso de pago</option>
                <option value="6">Derivación judicial</option>
              </select>

              <input
                type="text"
                placeholder="Resultado de la gestión"
                value={formGestion.resultado}
                onChange={e => setFormGestion(f => ({ ...f, resultado: e.target.value }))}
                style={inputStyle}
              />

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.6rem' }}>
                <input
                  type="date"
                  value={formGestion.compromisopago}
                  onChange={e => setFormGestion(f => ({ ...f, compromisopago: e.target.value }))}
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                />
                <input
                  type="number"
                  placeholder="Monto comprometido"
                  value={formGestion.montocomprometido}
                  onChange={e => setFormGestion(f => ({ ...f, montocomprometido: e.target.value }))}
                  style={{ ...inputStyle, flex: 1, marginBottom: 0 }}
                />
              </div>

              <button
                onClick={enviarGestion}
                disabled={enviandoGestion || !formGestion.pktipogestion || !formGestion.resultado}
                style={{
                  width: '100%', padding: '0.7rem', background: '#f5a623', color: '#0b0e0d', border: 'none', borderRadius: '8px',
                  fontWeight: 700, cursor: 'pointer', opacity: enviandoGestion ? 0.6 : 1, fontSize: '0.88rem'
                }}
              >
                {enviandoGestion ? 'Guardando...' : 'Registrar gestión'}
              </button>
            </div>

            <div>
              <h4 style={{ margin: '0 0 0.7rem', fontSize: '0.88rem', color: 'rgba(255,255,255,0.7)' }}>Historial de gestiones</h4>
              {historial.length === 0 ? (
                <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.85rem' }}>Sin gestiones registradas.</p>
              ) : (
                historial.map(h => (
                  <div key={h.pkgestion} style={{ padding: '0.7rem 0', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{h.destipogestion}</strong>
                      <span style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(h.fechagestion).toLocaleDateString('es-PE')}</span>
                    </div>
                    <div style={{ color: 'rgba(255,255,255,0.6)' }}>{h.resultado} · Gestor: {h.gestor}</div>
                    {h.compromisopago && <div style={{ color: '#4ade80' }}>Compromiso: {new Date(h.compromisopago).toLocaleDateString('es-PE')} · S/ {h.montocomprometido}</div>}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const thStyle = { padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }
const tdStyle = { padding: '0.85rem 1rem' }
const inputStyle = { width: '100%', padding: '0.6rem 0.7rem', marginBottom: '0.6rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.85rem' }
