import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const ESTADOS = ['Todos', 'Pendiente', 'En Revision', 'Aprobado', 'Rechazado', 'Desembolsado']

const ESTADO_COLOR = {
  Pendiente:     '#60a5fa',
  'En Revision': '#fbbf24',
  Aprobado:      '#4ade80',
  Rechazado:     '#f87171',
  Desembolsado:  '#f5a623',
}

export default function CoreSolicitudes() {
  const navigate = useNavigate()
  const [usuario, setUsuario] = useState(null)
  const [token, setToken] = useState(null)

  const [solicitudes, setSolicitudes] = useState([])
  const [estadoActivo, setEstadoActivo] = useState('Todos')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')

  const [modal, setModal] = useState(null) // { solicitud, accion }
  const [motivoRechazo, setMotivoRechazo] = useState('')
  const [procesando, setProcesando] = useState(false)
  const [msgAccion, setMsgAccion] = useState(null)

  useEffect(() => {
    const t = localStorage.getItem('core_token')
    const u = localStorage.getItem('core_usuario')
    if (!t || !u || u === 'undefined') {
      navigate('/core-login')
      return
    }
    setToken(t)
    setUsuario(JSON.parse(u))
    cargarSolicitudes(t)
  }, [])

  async function cargarSolicitudes(t) {
    setCargando(true)
    setError('')
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/core/solicitudes`, {
        headers: { Authorization: `Bearer ${t}` }
      })
      setSolicitudes(res.data)
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al cargar las solicitudes de crédito.')
    } finally {
      setCargando(false)
    }
  }

  function abrirAccion(solicitud, accion) {
    setModal({ solicitud, accion })
    setMotivoRechazo('')
    setMsgAccion(null)
  }

  async function confirmarAccion() {
    if (!modal) return
    setProcesando(true)
    setMsgAccion(null)
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/core/solicitudes/${modal.solicitud.id}/resolver`,
        {
          accion: modal.accion,
          motivo_rechazo: modal.accion === 'rechazar' ? motivoRechazo : undefined
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setMsgAccion({ tipo: 'ok', texto: res.data.mensaje })
      await cargarSolicitudes(token)
      setTimeout(() => setModal(null), 900)
    } catch (err) {
      setMsgAccion({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al procesar la acción.' })
    } finally {
      setProcesando(false)
    }
  }

  function salir() {
    localStorage.removeItem('core_token')
    localStorage.removeItem('core_usuario')
    navigate('/core-login')
  }

  const filtradas = estadoActivo === 'Todos'
    ? solicitudes
    : solicitudes.filter(s => s.estado === estadoActivo)

  const conteoPorEstado = ESTADOS.reduce((acc, e) => {
    acc[e] = e === 'Todos' ? solicitudes.length : solicitudes.filter(s => s.estado === e).length
    return acc
  }, {})

  if (cargando) {
    return (
      <div style={{ background: '#0b0e0d', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '36px', height: '36px', border: '3px solid rgba(245,166,35,0.2)', borderTopColor: '#f5a623', borderRadius: '50%', margin: '0 auto 1rem', animation: 'spin 0.8s linear infinite' }} />
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>Cargando solicitudes de crédito...</div>
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
                Solicitudes de Crédito
              </div>
            </div>
          </div>

          <div style={{ width: '1px', height: '26px', background: 'rgba(255,255,255,0.1)' }} />

          <Link to="/core-dashboard" style={{
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
            ← Módulo de Mora
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

        {/* KPI rápido */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.8rem' }}>
          <div style={{ background: 'linear-gradient(155deg, #14201b, #0f1714)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.4rem 1.8rem', flex: '0 0 220px' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>TOTAL SOLICITUDES</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: "'JetBrains Mono', monospace" }}>{solicitudes.length}</div>
          </div>
          <div style={{ background: 'linear-gradient(155deg, #1f1c12, #16140d)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '16px', padding: '1.4rem 1.8rem', flex: '0 0 220px' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(251,191,36,0.7)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>EN REVISIÓN</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fbbf24', fontFamily: "'JetBrains Mono', monospace" }}>{conteoPorEstado['En Revision']}</div>
          </div>
          <div style={{ background: 'linear-gradient(155deg, #142016, #0f140f)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '16px', padding: '1.4rem 1.8rem', flex: '0 0 220px' }}>
            <div style={{ fontSize: '0.72rem', color: 'rgba(74,222,128,0.7)', fontWeight: 700, letterSpacing: '0.06em', marginBottom: '0.4rem' }}>APROBADAS</div>
            <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#4ade80', fontFamily: "'JetBrains Mono', monospace" }}>{conteoPorEstado['Aprobado']}</div>
          </div>
        </div>

        {/* Tabs por estado */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem', flexWrap: 'wrap' }}>
          {ESTADOS.map(e => {
            const activo = estadoActivo === e
            const color = ESTADO_COLOR[e] || '#9ca3af'
            return (
              <button
                key={e}
                onClick={() => setEstadoActivo(e)}
                style={{
                  padding: '0.7rem 1.2rem', borderRadius: '10px', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.83rem',
                  background: activo ? color : 'rgba(255,255,255,0.04)',
                  color: activo ? '#0b0e0d' : 'rgba(255,255,255,0.75)',
                  border: activo ? `1px solid ${color}` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: activo ? `0 4px 18px ${color}40` : 'none',
                  transition: 'all 0.15s ease',
                  display: 'flex', alignItems: 'center', gap: '0.5rem'
                }}
              >
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: activo ? '#0b0e0d' : color, flexShrink: 0 }} />
                {e}
                <span style={{ opacity: 0.7, fontFamily: "'JetBrains Mono', monospace", fontSize: '0.78rem' }}>{conteoPorEstado[e]}</span>
              </button>
            )
          })}
        </div>

        {/* Tabla de solicitudes */}
        <div style={{ background: '#0f1512', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.03)', textAlign: 'left' }}>
                <th style={thStyle}>Cliente</th>
                <th style={thStyle}>DNI</th>
                <th style={thStyle}>Producto</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Monto</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Plazo</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Seguro</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>TEA</th>
                <th style={{ ...thStyle, textAlign: 'center' }}>Score</th>
                <th style={thStyle}>Estado</th>
                <th style={thStyle}></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(s => (
                <tr key={s.id} style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                  <td style={tdStyle}>{s.nombre_cliente}</td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.5)', fontFamily: "'JetBrains Mono', monospace", fontSize: '0.8rem' }}>{s.dni_cliente}</td>
                  <td style={{ ...tdStyle, color: 'rgba(255,255,255,0.6)' }}>{s.producto}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, fontFamily: "'JetBrains Mono', monospace" }}>
                    {s.moneda === 'USD' ? 'US$' : 'S/'} {Number(s.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{s.plazo} m.</td>
                  <td style={{ ...tdStyle, textAlign: 'center', color: 'rgba(255,255,255,0.6)' }}>{s.con_seguro === 'S' ? 'Sí' : 'No'}</td>
                  <td style={{ ...tdStyle, textAlign: 'right', color: 'rgba(255,255,255,0.6)', fontFamily: "'JetBrains Mono', monospace" }}>{Number(s.tea).toFixed(2)}%</td>
                  <td style={{ ...tdStyle, textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", color: 'rgba(255,255,255,0.6)' }}>{s.score_crediticio}</td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '0.3rem 0.7rem', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 700,
                      background: `${ESTADO_COLOR[s.estado] || '#9ca3af'}1f`, color: ESTADO_COLOR[s.estado] || '#9ca3af',
                      border: `1px solid ${ESTADO_COLOR[s.estado] || '#9ca3af'}40`
                    }}>
                      {s.estado}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: 'nowrap' }}>
                    {s.estado === 'En Revision' && (
                      <>
                        <button onClick={() => abrirAccion(s, 'aprobar')} style={btnAccion('#4ade80')}>Aprobar</button>
                        <button onClick={() => abrirAccion(s, 'rechazar')} style={btnAccion('#f87171')}>Rechazar</button>
                      </>
                    )}
                    {s.estado === 'Pendiente' && (
                      <button onClick={() => abrirAccion(s, 'rechazar')} style={btnAccion('#f87171')}>Rechazar</button>
                    )}
                    {s.estado === 'Aprobado' && (
                      <button onClick={() => abrirAccion(s, 'desembolsar')} style={btnAccion('#f5a623')}>Desembolsar</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr><td colSpan={10} style={{ padding: '2.5rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>No hay solicitudes en este estado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de acción */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(2px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#111714', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '1.8rem', width: '420px', color: '#fff' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.05rem' }}>
              {modal.accion === 'aprobar' && '✓ Aprobar solicitud'}
              {modal.accion === 'rechazar' && '⛔ Rechazar solicitud'}
              {modal.accion === 'desembolsar' && '$ Desembolsar crédito'}
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              Cliente: <strong style={{ color: '#fff' }}>{modal.solicitud.nombre_cliente}</strong><br />
              Monto: <strong style={{ color: '#f5c863' }}>{modal.solicitud.moneda === 'USD' ? 'US$' : 'S/'} {Number(modal.solicitud.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
            </p>

            {modal.accion === 'rechazar' && (
              <input
                type="text"
                placeholder="Motivo del rechazo (opcional)"
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                style={inputStyle}
              />
            )}

            {msgAccion && (
              <div style={{
                padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem',
                background: msgAccion.tipo === 'ok' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                color: msgAccion.tipo === 'ok' ? '#4ade80' : '#f87171',
                border: `1px solid ${msgAccion.tipo === 'ok' ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`
              }}>
                {msgAccion.tipo === 'ok' ? '✓' : '⚠'} {msgAccion.texto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setModal(null)}
                style={{ flex: 1, padding: '0.7rem', background: 'rgba(255,255,255,0.06)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                disabled={procesando}
                style={{
                  flex: 1, padding: '0.7rem', background: '#f5a623', color: '#0b0e0d', border: 'none', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 700, opacity: procesando ? 0.6 : 1
                }}
              >
                {procesando ? 'Procesando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function btnAccion(color) {
  return {
    background: `${color}1f`, color: color, border: `1px solid ${color}50`, padding: '0.4rem 0.85rem',
    borderRadius: '7px', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 700, marginRight: '0.4rem'
  }
}

const thStyle = { padding: '0.85rem 1rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.05em', textTransform: 'uppercase' }
const tdStyle = { padding: '0.85rem 1rem' }
const inputStyle = { width: '100%', padding: '0.6rem 0.7rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', color: '#fff', fontSize: '0.85rem' }
