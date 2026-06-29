import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axios from 'axios'

const ESTADOS = ['Todos', 'Pendiente', 'En Revision', 'Aprobado', 'Rechazado', 'Desembolsado']

const ESTADO_COLOR = {
  Pendiente:     '#1976d2',
  'En Revision': '#f5a623',
  Aprobado:      '#43a047',
  Rechazado:     '#e53935',
  Desembolsado:  '#0d3b24',
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

  if (cargando) return <div style={{ padding: '3rem', textAlign: 'center' }}>Cargando solicitudes de crédito...</div>

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', background: '#f4f6f5', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#0d3b24', color: '#fff', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <strong>🏦 Core Bancario</strong> — Solicitudes de Crédito
          <Link to="/core-dashboard" style={{ color: '#cfe8d8', fontSize: '0.85rem', textDecoration: 'none' }}>
            ← Ir a Módulo de Mora
          </Link>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span>{usuario?.nombre} · {usuario?.cargo}</span>
          <button onClick={salir} style={{ background: '#e53935', color: '#fff', border: 'none', padding: '0.4rem 1rem', borderRadius: '6px', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={{ padding: '2rem' }}>
        {error && <div style={{ background: '#ffebee', color: '#e53935', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>⚠️ {error}</div>}

        {/* KPI rápido */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem 1.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: '#888', fontWeight: 700 }}>TOTAL SOLICITUDES</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{solicitudes.length}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem 1.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: '#888', fontWeight: 700 }}>EN REVISIÓN</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: ESTADO_COLOR['En Revision'] }}>{conteoPorEstado['En Revision']}</div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '1.2rem 1.8rem', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            <div style={{ fontSize: '0.78rem', color: '#888', fontWeight: 700 }}>APROBADAS</div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: ESTADO_COLOR['Aprobado'] }}>{conteoPorEstado['Aprobado']}</div>
          </div>
        </div>

        {/* Tabs por estado */}
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {ESTADOS.map(e => {
            const activo = estadoActivo === e
            const color = ESTADO_COLOR[e] || '#555'
            return (
              <button
                key={e}
                onClick={() => setEstadoActivo(e)}
                style={{
                  padding: '0.6rem 1.1rem', borderRadius: '20px', border: 'none', cursor: 'pointer',
                  fontWeight: 700, fontSize: '0.85rem',
                  background: activo ? color : '#fff',
                  color: activo ? '#fff' : '#333',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.08)'
                }}
              >
                {e} · {conteoPorEstado[e]}
              </button>
            )
          })}
        </div>

        {/* Tabla de solicitudes */}
        <div style={{ background: '#fff', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.83rem' }}>
            <thead>
              <tr style={{ background: '#f0f2f1', textAlign: 'left' }}>
                <th style={{ padding: '0.8rem' }}>Cliente</th>
                <th style={{ padding: '0.8rem' }}>DNI</th>
                <th style={{ padding: '0.8rem' }}>Producto</th>
                <th style={{ padding: '0.8rem', textAlign: 'right' }}>Monto</th>
                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Plazo</th>
                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Seguro</th>
                <th style={{ padding: '0.8rem', textAlign: 'right' }}>TEA</th>
                <th style={{ padding: '0.8rem', textAlign: 'center' }}>Score</th>
                <th style={{ padding: '0.8rem' }}>Estado</th>
                <th style={{ padding: '0.8rem' }}></th>
              </tr>
            </thead>
            <tbody>
              {filtradas.map(s => (
                <tr key={s.id} style={{ borderTop: '1px solid #eee' }}>
                  <td style={{ padding: '0.7rem' }}>{s.nombre_cliente}</td>
                  <td style={{ padding: '0.7rem' }}>{s.dni_cliente}</td>
                  <td style={{ padding: '0.7rem' }}>{s.producto}</td>
                  <td style={{ padding: '0.7rem', textAlign: 'right', fontWeight: 700 }}>
                    {s.moneda === 'USD' ? 'US$' : 'S/'} {Number(s.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ padding: '0.7rem', textAlign: 'center' }}>{s.plazo} m.</td>
                  <td style={{ padding: '0.7rem', textAlign: 'center' }}>{s.con_seguro === 'S' ? 'Sí' : 'No'}</td>
                  <td style={{ padding: '0.7rem', textAlign: 'right' }}>{Number(s.tea).toFixed(2)}%</td>
                  <td style={{ padding: '0.7rem', textAlign: 'center' }}>{s.score_crediticio}</td>
                  <td style={{ padding: '0.7rem' }}>
                    <span style={{
                      padding: '0.25rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 700,
                      background: `${ESTADO_COLOR[s.estado] || '#999'}1a`, color: ESTADO_COLOR[s.estado] || '#555'
                    }}>
                      {s.estado}
                    </span>
                  </td>
                  <td style={{ padding: '0.7rem', whiteSpace: 'nowrap' }}>
                    {s.estado === 'En Revision' && (
                      <>
                        <button onClick={() => abrirAccion(s, 'aprobar')} style={btnAccion('#43a047')}>Aprobar</button>
                        <button onClick={() => abrirAccion(s, 'rechazar')} style={btnAccion('#e53935')}>Rechazar</button>
                      </>
                    )}
                    {s.estado === 'Pendiente' && (
                      <button onClick={() => abrirAccion(s, 'rechazar')} style={btnAccion('#e53935')}>Rechazar</button>
                    )}
                    {s.estado === 'Aprobado' && (
                      <button onClick={() => abrirAccion(s, 'desembolsar')} style={btnAccion('#0d3b24')}>Desembolsar</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtradas.length === 0 && (
                <tr><td colSpan={10} style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>No hay solicitudes en este estado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de acción */}
      {modal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: '14px', padding: '1.8rem', width: '420px' }}>
            <h3 style={{ marginTop: 0 }}>
              {modal.accion === 'aprobar' && '✅ Aprobar solicitud'}
              {modal.accion === 'rechazar' && '⛔ Rechazar solicitud'}
              {modal.accion === 'desembolsar' && '💸 Desembolsar crédito'}
            </h3>
            <p style={{ color: '#555', fontSize: '0.9rem' }}>
              Cliente: <strong>{modal.solicitud.nombre_cliente}</strong><br />
              Monto: <strong>{modal.solicitud.moneda === 'USD' ? 'US$' : 'S/'} {Number(modal.solicitud.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
            </p>

            {modal.accion === 'rechazar' && (
              <input
                type="text"
                placeholder="Motivo del rechazo (opcional)"
                value={motivoRechazo}
                onChange={e => setMotivoRechazo(e.target.value)}
                style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', borderRadius: '6px', border: '1px solid #ddd' }}
              />
            )}

            {msgAccion && (
              <div style={{
                padding: '0.6rem 0.9rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem',
                background: msgAccion.tipo === 'ok' ? '#e8f5e9' : '#ffebee',
                color: msgAccion.tipo === 'ok' ? '#2e7d32' : '#e53935',
                border: `1px solid ${msgAccion.tipo === 'ok' ? '#43a047' : '#e53935'}`
              }}>
                {msgAccion.tipo === 'ok' ? '✅' : '⚠️'} {msgAccion.texto}
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.6rem' }}>
              <button
                onClick={() => setModal(null)}
                style={{ flex: 1, padding: '0.65rem', background: '#eee', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmarAccion}
                disabled={procesando}
                style={{
                  flex: 1, padding: '0.65rem', background: '#f5a623', border: 'none', borderRadius: '8px',
                  cursor: 'pointer', fontWeight: 700, opacity: procesando ? 0.7 : 1
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
    background: color, color: '#fff', border: 'none', padding: '0.35rem 0.7rem',
    borderRadius: '6px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 700, marginRight: '0.4rem'
  }
}
