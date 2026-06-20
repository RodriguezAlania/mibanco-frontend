import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const BANDAS = ['Preventiva', 'Temprana', 'Tardía', 'Judicial', 'Castigo']

const BANDA_COLOR = {
  Preventiva: '#43a047',
  Temprana:   '#fbc02d',
  'Tardía':   '#fb8c00',
  Judicial:   '#e53935',
  Castigo:    '#6d4c41',
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
      const res = await axios.get('http://localhost:3000/api/mora/cartera', {
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
      const res = await axios.get(`http://localhost:3000/api/mora/gestiones/${cuenta.pkcuentacredito}`, {
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
      const res = await axios.post('http://localhost:3000/api/mora/gestion', {
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
      const res = await axios.patch(`http://localhost:3000/api/mora/transicion/${modalCuenta.pkcuentacredito}`, {
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

  if (cargando) return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando cartera de mora...</div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f4f6f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#0d3b24', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>🏦 Core Bancario</strong> — Módulo de Mora
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>{usuario?.nombre} · {usuario?.cargo}</span>
          <button onClick={salir} style={{ background: '#e53935', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {error && <div style={{ background: '#ffebee', color: '#e53935', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>⚠️ {error}</div>}

        {data && (
          <>
            {/* KPI General */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem 1.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.78rem', color: '#888', fontWeight: 700 }}>TOTAL CRÉDITOS EN MORA</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{data.kpiGeneral.totalCreditosEnMora}</div>
              </div>
              <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem 1.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                <div style={{ fontSize: '0.78rem', color: '#888', fontWeight: 700 }}>MONTO TOTAL EN MORA</div>
                <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>S/ {Number(data.kpiGeneral.montoTotalEnMora).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</div>
              </div>
            </div>

            {/* Tabs por banda */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
              {BANDAS.map(b => {
                const kpi = data.kpis.find(k => k.banda === b)
                const activo = bandaActiva === b
                return (
                  <button
                    key={b}
                    onClick={() => setBandaActiva(b)}
                    style={{
                      padding: '0.6rem 1.1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                      fontWeight: 700, fontSize: '0.85rem',
                      background: activo ? BANDA_COLOR[b] : '#fff',
                      color: activo ? '#fff' : '#333',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                    }}
                  >
                    {b} · {kpi?.cantidad || 0} · S/ {Number(kpi?.montoTotal || 0).toLocaleString('es-PE', { minimumFractionDigits: 0 })}
                  </button>
                )
              })}
            </div>

            {/* Tabla de cartera filtrada */}
            <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ background: '#f0f2f1', textAlign: 'left' }}>
                    <th style={{ padding: '0.8rem' }}>Cliente</th>
                    <th style={{ padding: '0.8rem' }}>DNI</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Días atraso</th>
                    <th style={{ padding: '0.8rem', textAlign: 'right' }}>Saldo vencido</th>
                    <th style={{ padding: '0.8rem' }}>Estado</th>
                    <th style={{ padding: '0.8rem' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {data.cartera.filter(c => c.banda === bandaActiva).map(c => (
                    <tr key={c.pkcuentacredito} style={{ borderTop: '1px solid #eee' }}>
                      <td style={{ padding: '0.7rem' }}>{c.nomcliente}</td>
                      <td style={{ padding: '0.7rem' }}>{c.dni}</td>
                      <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: 700, color: BANDA_COLOR[c.banda] }}>{c.diasatrasocredito}</td>
                      <td style={{ padding: '0.7rem', textAlign: 'right' }}>S/ {Number(c.montosaldovencido).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</td>
                      <td style={{ padding: '0.7rem' }}>{c.desestadocredito}</td>
                      <td style={{ padding: '0.7rem' }}>
                        <button
                          onClick={() => abrirGestion(c)}
                          style={{ background: '#0d3b24', color: '#fff', border: 'none', padding: '0.4rem 0.9rem', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}
                        >
                          Gestionar
                        </button>
                      </td>
                    </tr>
                  ))}
                  {data.cartera.filter(c => c.banda === bandaActiva).length === 0 && (
                    <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No hay cuentas en esta banda.</td></tr>
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
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '1.8rem', width: '520px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <h3 style={{ margin: 0 }}>{modalCuenta.nomcliente}</h3>
                <span style={{ fontSize: '0.82rem', color: '#888' }}>
                  DNI: {modalCuenta.dni} · {modalCuenta.diasatrasocredito} días · Banda: <strong style={{ color: BANDA_COLOR[modalCuenta.banda] }}>{modalCuenta.banda}</strong>
                </span>
              </div>
              <button onClick={() => setModalCuenta(null)} style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer' }}>✕</button>
            </div>

            {/* Botones de transición R3 */}
            <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem' }}>
              <button
                onClick={() => transicionar('judicial')}
                style={{ flex: 1, padding: '0.6rem', background: '#e53935', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
              >
                ⚖️ Derivar a Judicial
              </button>
              <button
                onClick={() => transicionar('castigo')}
                style={{ flex: 1, padding: '0.6rem', background: '#6d4c41', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.82rem' }}
              >
                🔥 Castigar cuenta
              </button>
            </div>

            {msgGestion && (
              <div style={{
                padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem',
                background: msgGestion.tipo === 'ok' ? '#e8f5e9' : '#ffebee',
                color: msgGestion.tipo === 'ok' ? '#2e7d32' : '#e53935',
                border: `1px solid ${msgGestion.tipo === 'ok' ? '#43a047' : '#e53935'}`
              }}>
                {msgGestion.tipo === 'ok' ? '✅' : '⚠️'} {msgGestion.texto}
              </div>
            )}

            {/* Formulario de gestión R2 */}
            <div style={{ marginBottom: '1.2rem' }}>
              <h4 style={{ margin: '0 0 0.6rem' }}>Nueva gestión de cobranza</h4>

              <select
                value={formGestion.pktipogestion}
                onChange={e => setFormGestion(f => ({ ...f, pktipogestion: e.target.value }))}
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
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
                style={{ width: '100%', padding: '0.5rem', marginBottom: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
              />

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  type="date"
                  value={formGestion.compromisopago}
                  onChange={e => setFormGestion(f => ({ ...f, compromisopago: e.target.value }))}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                />
                <input
                  type="number"
                  placeholder="Monto comprometido"
                  value={formGestion.montocomprometido}
                  onChange={e => setFormGestion(f => ({ ...f, montocomprometido: e.target.value }))}
                  style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #ddd' }}
                />
              </div>

              <button
                onClick={enviarGestion}
                disabled={enviandoGestion || !formGestion.pktipogestion || !formGestion.resultado}
                style={{
                  width: '100%', padding: '0.65rem', background: '#f5a623', border: 'none', borderRadius: '8px',
                  fontWeight: 700, cursor: 'pointer', opacity: enviandoGestion ? 0.7 : 1
                }}
              >
                {enviandoGestion ? 'Guardando...' : 'Registrar gestión'}
              </button>
            </div>

            {/* Historial */}
            <div>
              <h4 style={{ margin: '0 0 0.6rem' }}>Historial de gestiones</h4>
              {historial.length === 0 ? (
                <p style={{ color: '#999', fontSize: '0.85rem' }}>Sin gestiones registradas.</p>
              ) : (
                historial.map(h => (
                  <div key={h.pkgestion} style={{ padding: '0.6rem 0', borderTop: '1px solid #eee', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>{h.destipogestion}</strong>
                      <span style={{ color: '#888' }}>{new Date(h.fechagestion).toLocaleDateString('es-PE')}</span>
                    </div>
                    <div>{h.resultado} · Gestor: {h.gestor}</div>
                    {h.compromisopago && <div style={{ color: '#43a047' }}>Compromiso: {new Date(h.compromisopago).toLocaleDateString('es-PE')} · S/ {h.montocomprometido}</div>}
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