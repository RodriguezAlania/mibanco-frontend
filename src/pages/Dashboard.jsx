import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { obtenerSesion, cerrarSesion } from '../services/authService'
import axios from 'axios'

const NAV_ITEMS = [
  { id: 'dashboard',        ico: '🏠', label: 'Inicio' },
  { id: 'ahorros',          ico: '💳', label: 'Mis Ahorros' },
  { id: 'creditos',         ico: '📄', label: 'Créditos', badge: '2' },
  { id: 'solicitar-credito', ico: '➕', label: 'Solicitar Crédito' },
  { id: 'transferencias',   ico: '↔️',  label: 'Transferir' },
  { id: 'pagos',            ico: '⚡', label: 'Pagar servicios' },
  { id: 'perfil',           ico: '👤', label: 'Mi Perfil' },
]

const TRANSACTIONS = [
  { id: 1, type: 'in',  ico: '💰', desc: 'Depósito en efectivo',  date: 'Hoy, 09:14',    amount: '+S/ 1,200.00' },
  { id: 2, type: 'out', ico: '🛒', desc: 'Supermercado Wong',      date: 'Hoy, 08:32',    amount: '-S/ 87.50' },
  { id: 3, type: 'pay', ico: '💡', desc: 'Pago Luz del Sur',       date: 'Ayer, 18:05',   amount: '-S/ 95.00' },
  { id: 4, type: 'in',  ico: '📲', desc: 'Transferencia recibida', date: 'Ayer, 12:20',   amount: '+S/ 500.00' },
  { id: 5, type: 'out', ico: '🚗', desc: 'Combustible Primax',     date: '15 may, 11:00', amount: '-S/ 120.00' },
]

function Dashboard() {
  const navigate = useNavigate()
  const [active, setActive] = useState('dashboard')
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [cuentas, setCuentas] = useState([])
  const [formCredito, setFormCredito]           = useState({ monto: '', moneda: 'PEN', plazo: '' })
  const [solicitudes, setSolicitudes]           = useState([])
  const [enviandoCredito, setEnviandoCredito]   = useState(false)
  const [mensajeCredito, setMensajeCredito]     = useState(null)
  const [cronogramaActivo, setCronogramaActivo] = useState(null)
  const sesion = obtenerSesion()
  const usuario = sesion?.usuario

  // Iniciales del avatar
  const iniciales = usuario
    ? `${usuario.first_name?.[0] || ''}${usuario.last_name?.[0] || ''}`.toUpperCase() || usuario.username?.[0]?.toUpperCase()
    : 'U'

  // Nombre para el saludo
  const nombre = usuario?.first_name || usuario?.username || 'Usuario'

  useEffect(() => {
    // Cargar cuentas del usuario
    async function cargarCuentas() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/cuentas/mias`, {
          headers: { Authorization: `Bearer ${sesion?.token}` }
        })
        setCuentas(res.data)
      } catch (err) {
        console.error('Error cargando cuentas:', err)
      }
    }
    if (sesion?.token) {
      cargarCuentas()
      cargarSolicitudes()
    }
  }, [])

  function handleLogout() {
    cerrarSesion()
    navigate('/login')
  }

  // Saldo total de cuentas
  const saldoTotal = cuentas.reduce((acc, c) => acc + parseFloat(c.saldo || 0), 0)
  const saldoFormateado = saldoTotal.toLocaleString('es-PE', { minimumFractionDigits: 2 })

  async function enviarSolicitud() {
    setMensajeCredito(null)
    setEnviandoCredito(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/creditos/solicitar`, {
        monto:  Number(formCredito.monto),
        moneda: formCredito.moneda,
        plazo:  Number(formCredito.plazo),
      }, { headers: { Authorization: `Bearer ${sesion?.token}` } })

      setMensajeCredito({ tipo: 'ok', texto: res.data.mensaje })
      setFormCredito({ monto: '', moneda: 'PEN', plazo: '' })
      cargarSolicitudes()
    } catch (err) {
      setMensajeCredito({ tipo: 'error', texto: err.response?.data?.mensaje || 'Error al enviar la solicitud.' })
    } finally {
      setEnviandoCredito(false)
    }
  }

  async function verCronograma(id) {
    if (cronogramaActivo?.solicitud?.id === id) {
      setCronogramaActivo(null)
      return
    }
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/creditos/cronograma/${id}`, {
        headers: { Authorization: `Bearer ${sesion?.token}` }
      })
      setCronogramaActivo(res.data)
    } catch (err) {
      console.error('Error cronograma:', err)
    }
  }

  async function cargarSolicitudes() {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/creditos/mis-solicitudes`, {
        headers: { Authorization: `Bearer ${sesion?.token}` }
      })
      setSolicitudes(res.data)
    } catch (err) {
      console.error('Error cargando solicitudes:', err)
    }
  }


  return (
    <div id="page-app">
      {/* TOPBAR */}
      <header className="topbar">
        <div className="topbar-brand">
          <span className="brand-icon">☀️</span>
          <span className="brand-name">Mi<span>Banco</span></span>
        </div>
        <div className="topbar-right">
          <span id="topbar-clock">
            {new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button className="topbar-notif">
            🔔 <span className="notif-badge">3</span>
          </button>
          <div className="topbar-user">
            <div className="avatar">{iniciales}</div>
            <span>{nombre}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Principal</div>
          {NAV_ITEMS.slice(0, 4).map(item => (
            <div
              key={item.id}
              className={`nav-item${active === item.id ? ' active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="nav-ico">{item.ico}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </div>
          ))}
        </div>
        <div className="sidebar-section">
          <div className="sidebar-section-title">Cuenta</div>
          {NAV_ITEMS.slice(4).map(item => (
            <div
              key={item.id}
              className={`nav-item${active === item.id ? ' active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="nav-ico">{item.ico}</span>
              {item.label}
            </div>
          ))}
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="main-content">

        {/* ── DASHBOARD ── */}
        <div className={`module${active === 'dashboard' ? ' active' : ''}`}>
          <div className="page-header">
            <h2>Buenos días, {nombre} 👋</h2>
            <p>Aquí está el resumen de tu cuenta · DNI: {usuario?.dni || '—'}</p>
          </div>

          {/* Balance hero */}
          <div className="balance-hero">
            <div className="balance-hero-label">Saldo total disponible</div>
            <div className={`balance-hero-amount${balanceVisible ? '' : ' balance-blur'}`}>
              <sup>S/</sup> {balanceVisible ? saldoFormateado : '••••••'}
              <span className="balance-pulse" />
            </div>
            <div className="balance-hero-sub">
              {cuentas.map(c => (
                <span key={c.id}>💳 {c.tipo}: S/ {parseFloat(c.saldo).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</span>
              ))}
              {cuentas.length === 0 && <span>Sin cuentas registradas</span>}
            </div>
            <div className="balance-hero-actions">
              <button className="btn-hero eye-toggle" onClick={() => setBalanceVisible(v => !v)}>
                {balanceVisible ? '🙈 Ocultar' : '👁️ Mostrar'}
              </button>
              <button className="btn-hero" onClick={() => setActive('transferencias')}>↔️ Transferir</button>
              <button className="btn-hero" onClick={() => setActive('pagos')}>⚡ Pagar</button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid-4" style={{ marginBottom: '1.2rem' }}>
            <div className="stat-card">
              <div className="stat-card-label">Ingresos mes</div>
              <div className="stat-card-value">S/ 3,800</div>
              <div className="stat-card-delta">↑ +12% vs mes ant.</div>
            </div>
            <div className="stat-card yellow">
              <div className="stat-card-label">Gastos mes</div>
              <div className="stat-card-value">S/ 1,240</div>
              <div className="stat-card-delta neg">↑ +5% vs mes ant.</div>
            </div>
            <div className="stat-card blue">
              <div className="stat-card-label">Cuota crédito</div>
              <div className="stat-card-value">S/ 480</div>
              <div className="stat-card-delta">Vence: 25 may</div>
            </div>
            <div className="stat-card red">
              <div className="stat-card-label">Servicios</div>
              <div className="stat-card-value">S/ 244</div>
              <div className="stat-card-delta neg">3 pendientes</div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="quick-actions">
            {[
              { ico: '📲', label: 'Transferir', mod: 'transferencias' },
              { ico: '⚡', label: 'Pagar',      mod: 'pagos' },
              { ico: '💳', label: 'Ahorros',    mod: 'ahorros' },
              { ico: '📄', label: 'Créditos',   mod: 'creditos' },
            ].map(a => (
              <button key={a.mod} className="quick-btn" onClick={() => setActive(a.mod)}>
                <span className="qico">{a.ico}</span>
                {a.label}
              </button>
            ))}
          </div>

          {/* Transactions */}
          <div className="card">
            <div className="card-title">Movimientos recientes</div>
            <div className="tx-list">
              {TRANSACTIONS.map(tx => (
                <div key={tx.id} className="tx-item">
                  <div className={`tx-ico ${tx.type}`}>{tx.ico}</div>
                  <div className="tx-info">
                    <strong>{tx.desc}</strong>
                    <span>{tx.date}</span>
                  </div>
                  <div className={`tx-amount ${tx.type}`}>{tx.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── AHORROS ── */}
        <div className={`module${active === 'ahorros' ? ' active' : ''}`}>
          <div className="page-header">
            <h2>💳 Mis Ahorros</h2>
            <p>Gestiona y visualiza tus cuentas de ahorro</p>
          </div>
          {cuentas.length > 0 ? cuentas.map(c => (
            <div key={c.id} className="account-card" style={{ marginBottom: '1rem' }}>
              <div className="account-card-label">{c.tipo}</div>
              <div className="account-card-number">• • • •  {c.numero_cuenta?.slice(-4)}</div>
              <div className="account-card-balance">
                {c.moneda} {parseFloat(c.saldo).toLocaleString('es-PE', { minimumFractionDigits: 2 })}
              </div>
              <div className="account-card-row">
                <span>📋 N°: {c.numero_cuenta}</span>
              </div>
            </div>
          )) : (
            <div className="card" style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '3rem' }}>
              Sin cuentas registradas aún
            </div>
          )}
          <div className="grid-2">
            <div className="card">
              <div className="card-title">Depositar</div>
              <div className="form-group">
                <label>Monto (S/)</label>
                <div className="input-wrap">
                  <span className="ico">💰</span>
                  <input type="number" placeholder="0.00" />
                </div>
              </div>
              <button className="btn-primary" style={{ marginTop: '.5rem' }}>Depositar ahora</button>
            </div>
            <div className="card">
              <div className="card-title">Retirar</div>
              <div className="form-group">
                <label>Monto (S/)</label>
                <div className="input-wrap">
                  <span className="ico">💸</span>
                  <input type="number" placeholder="0.00" />
                </div>
              </div>
              <button className="btn-secondary" style={{ marginTop: '.5rem' }}>Retirar fondos</button>
            </div>
          </div>
        </div>

        {/* ── CRÉDITOS ── */}
        <div className={`module${active === 'creditos' ? ' active' : ''}`}>
          <div className="page-header">
            <h2>📄 Créditos</h2>
            <p>Administra tus préstamos activos</p>
          </div>
          {[
            { tipo: 'Crédito Personal',   monto: 'S/ 10,000', pagado: 60, cuota: 'S/ 480', vence: '25 may 2026' },
            { tipo: 'Crédito Vehicular',  monto: 'S/ 25,000', pagado: 30, cuota: 'S/ 890', vence: '10 jun 2026' },
          ].map((l, i) => (
            <div key={i} className="loan-card">
              <div className="loan-header">
                <div className="loan-type">{l.tipo}</div>
                <span className="chip green">● Activo</span>
              </div>
              <div className="loan-progress">
                <div className="loan-progress-bar" style={{ width: `${l.pagado}%` }} />
              </div>
              <div className="loan-meta">
                <div><span>Monto total</span><strong>{l.monto}</strong></div>
                <div><span>Cuota mensual</span><strong>{l.cuota}</strong></div>
                <div><span>Próx. vencimiento</span><strong>{l.vence}</strong></div>
                <div><span>Progreso</span><strong>{l.pagado}% pagado</strong></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* ── SOLICITAR CRÉDITO ── */}
        <div className={`module${active === 'solicitar-credito' ? ' active' : ''}`}>
          <div className="page-header">
            <h2>➕ Solicitar Crédito</h2>
            <p>Producto: Capital de Trabajo</p>
          </div>

          {/* Formulario */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div className="card-title">Nueva solicitud</div>

            <div className="form-group">
              <label>Moneda</label>
              <div className="input-wrap">
                <span className="ico">💱</span>
                <select
                  value={formCredito.moneda}
                  onChange={e => setFormCredito(f => ({ ...f, moneda: e.target.value }))}
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: 'inherit' }}
                >
                  <option value="PEN">Soles (PEN)</option>
                  <option value="USD">Dólares (USD)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Monto ({formCredito.moneda === 'PEN' ? 'S/ mín. 300' : 'US$ mín. 100'})</label>
              <div className="input-wrap">
                <span className="ico">💰</span>
                <input
                  type="number"
                  placeholder={formCredito.moneda === 'PEN' ? '300' : '100'}
                  value={formCredito.monto}
                  onChange={e => setFormCredito(f => ({ ...f, monto: e.target.value }))}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Plazo en meses ({formCredito.moneda === 'PEN' ? 'máx. 24' : 'máx. 12'})</label>
              <div className="input-wrap">
                <span className="ico">📅</span>
                <input
                  type="number"
                  placeholder={formCredito.moneda === 'PEN' ? '1 - 24' : '1 - 12'}
                  value={formCredito.plazo}
                  onChange={e => setFormCredito(f => ({ ...f, plazo: e.target.value }))}
                />
              </div>
            </div>

            {mensajeCredito && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontWeight: 600,
                fontSize: '0.88rem',
                background: mensajeCredito.tipo === 'ok' ? '#e8f5e9' : '#ffebee',
                border: `1px solid ${mensajeCredito.tipo === 'ok' ? '#43a047' : '#e53935'}`,
                color: mensajeCredito.tipo === 'ok' ? '#2e7d32' : '#e53935',
              }}>
                {mensajeCredito.tipo === 'ok' ? '✅' : '⚠️'} {mensajeCredito.texto}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={enviarSolicitud}
              disabled={enviandoCredito}
              style={{ opacity: enviandoCredito ? 0.7 : 1 }}
            >
              {enviandoCredito ? '⏳ Enviando...' : 'Enviar solicitud'}
            </button>
          </div>

          {/* Historial de solicitudes */}
          <div className="card">
            <div className="card-title">Mis solicitudes</div>
            {solicitudes.length === 0 ? (
              <p style={{ color: 'var(--gray-400)', textAlign: 'center', padding: '2rem' }}>
                No tienes solicitudes aún
              </p>
            ) : (
              <div className="tx-list">
                {solicitudes.map(s => (
                  <div key={s.id} className="tx-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <strong>{s.producto} — {s.moneda} {parseFloat(s.monto).toLocaleString('es-PE', { minimumFractionDigits: 2 })}</strong>
                      <span className={`chip ${s.estado === 'Aprobado' || s.estado === 'Desembolsado' ? 'green' : s.estado === 'Rechazado' ? 'red' : ''}`}>
                        ● {s.estado}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--gray-400)' }}>
                      Plazo: {s.plazo} meses · TEA: {s.tea}% · Score: {s.score_crediticio}
                    </div>
                    {s.motivo_rechazo && (
                      <div style={{ fontSize: '0.82rem', color: '#e53935' }}>⚠️ {s.motivo_rechazo}</div>
                    )}
                    {(s.estado === 'Aprobado' || s.estado === 'Desembolsado') && (
                      <button
                        className="btn-secondary"
                        style={{ marginTop: '0.4rem', padding: '0.3rem 0.8rem', fontSize: '0.82rem' }}
                        onClick={() => verCronograma(s.id)}
                      >
                        📅 Ver cronograma
                      </button>
                    )}
                    {cronogramaActivo?.solicitud?.id === s.id && (
                      <div style={{ width: '100%', overflowX: 'auto', marginTop: '0.5rem' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                          <thead>
                            <tr style={{ background: 'var(--gray-100)' }}>
                              <th style={{ padding: '0.4rem', textAlign: 'center' }}>#</th>
                              <th style={{ padding: '0.4rem' }}>Fecha</th>
                              <th style={{ padding: '0.4rem', textAlign: 'right' }}>Cuota</th>
                              <th style={{ padding: '0.4rem', textAlign: 'right' }}>Interés</th>
                              <th style={{ padding: '0.4rem', textAlign: 'right' }}>Amort.</th>
                              <th style={{ padding: '0.4rem', textAlign: 'right' }}>Saldo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cronogramaActivo.cronograma.map(c => (
                              <tr key={c.nro} style={{ borderBottom: '1px solid var(--gray-100)' }}>
                                <td style={{ padding: '0.4rem', textAlign: 'center' }}>{c.nro}</td>
                                <td style={{ padding: '0.4rem' }}>{c.fecha}</td>
                                <td style={{ padding: '0.4rem', textAlign: 'right' }}>{c.cuota}</td>
                                <td style={{ padding: '0.4rem', textAlign: 'right' }}>{c.interes}</td>
                                <td style={{ padding: '0.4rem', textAlign: 'right' }}>{c.amort}</td>
                                <td style={{ padding: '0.4rem', textAlign: 'right' }}>{c.saldo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── TRANSFERENCIAS ── */}
        <div className={`module${active === 'transferencias' ? ' active' : ''}`}>
          <div className="page-header">
            <h2>↔️ Transferencias</h2>
            <p>Envía dinero de forma rápida y segura</p>
          </div>
          <div className="card">
            <div className="form-group">
              <label>Cuenta destino</label>
              <div className="input-wrap">
                <span className="ico">🏦</span>
                <input type="text" placeholder="Número de cuenta o CCI" />
              </div>
            </div>
            <div className="form-group">
              <label>Nombre del beneficiario</label>
              <div className="input-wrap">
                <span className="ico">👤</span>
                <input type="text" placeholder="Nombre completo" />
              </div>
            </div>
            <div className="form-group">
              <label>Monto (S/)</label>
              <div className="input-wrap">
                <span className="ico">💰</span>
                <input type="number" placeholder="0.00" />
              </div>
            </div>
            <div className="form-group">
              <label>Motivo</label>
              <div className="input-wrap">
                <span className="ico">📝</span>
                <input type="text" placeholder="Ej: Pago de alquiler" />
              </div>
            </div>
            <button className="btn-primary">Continuar transferencia</button>
          </div>
        </div>

        {/* ── PAGOS ── */}
        <div className={`module${active === 'pagos' ? ' active' : ''}`}>
          <div className="page-header">
            <h2>⚡ Pago de Servicios</h2>
            <p>Paga tus servicios sin salir de casa</p>
          </div>
          <div className="pago-categories">
            {[
              { ico: '💡', label: 'Electricidad' },
              { ico: '💧', label: 'Agua' },
              { ico: '📱', label: 'Teléfono' },
              { ico: '🌐', label: 'Internet' },
              { ico: '📺', label: 'Cable TV' },
              { ico: '🏠', label: 'Alquiler' },
              { ico: '🎓', label: 'Educación' },
              { ico: '🏥', label: 'Salud' },
            ].map((c, i) => (
              <div key={i} className="pago-cat">
                <div className="pico">{c.ico}</div>
                <span>{c.label}</span>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="card-title">Pago rápido</div>
            <div className="form-group">
              <label>Código de servicio</label>
              <div className="input-wrap">
                <span className="ico">🔢</span>
                <input type="text" placeholder="Ingresa el código de suministro" />
              </div>
            </div>
            <div className="form-group">
              <label>Monto (S/)</label>
              <div className="input-wrap">
                <span className="ico">💰</span>
                <input type="number" placeholder="0.00" />
              </div>
            </div>
            <button className="btn-primary">Pagar servicio</button>
          </div>
        </div>

        {/* ── PERFIL ── */}
        <div className={`module${active === 'perfil' ? ' active' : ''}`}>
          <div className="page-header">
            <h2>👤 Mi Perfil</h2>
            <p>Información y seguridad de tu cuenta</p>
          </div>
          <div className="profile-hero">
            <div className="profile-avatar-lg">{iniciales}</div>
            <div className="profile-hero-info">
              <h3>{usuario?.first_name} {usuario?.last_name}</h3>
              <p>DNI: {usuario?.dni} · Cliente desde {usuario?.cliente_desde || '—'}</p>
              <div className="chips">
                <span className="chip">✅ Verificado</span>
                <span className="chip">⭐ Cliente Premium</span>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="card-title">Datos personales</div>
            <div className="profile-grid">
              {[
                ['Nombre completo', `${usuario?.first_name || ''} ${usuario?.last_name || ''}`],
                ['DNI',             usuario?.dni || '—'],
                ['Correo',          usuario?.email || '—'],
                ['Teléfono',        usuario?.telefono || '—'],
                ['Usuario',         usuario?.username || '—'],
                ['Cliente desde',   usuario?.cliente_desde || '—'],
              ].map(([label, val]) => (
                <div key={label} className="profile-field">
                  <label>{label}</label>
                  <div className="value">{val}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </main>

      {/* Mobile nav */}
      <nav className="mobile-nav">
        <div className="mobile-nav-inner">
          {NAV_ITEMS.slice(0, 5).map(item => (
            <button
              key={item.id}
              className={`mob-nav-btn${active === item.id ? ' active' : ''}`}
              onClick={() => setActive(item.id)}
            >
              <span className="mn-ico">{item.ico}</span>
              {item.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

export default Dashboard

