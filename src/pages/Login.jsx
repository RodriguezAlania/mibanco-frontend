import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, guardarSesion } from '../services/authService'

function Login() {
  const navigate = useNavigate()
  const [tab, setTab] = useState('login')
  const [showPw, setShowPw] = useState(false)
  const [username, setUsername] = useState('')
  const [pw, setPw] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    if (!username || !pw) {
      setError('Completa todos los campos')
      return
    }
    setCargando(true)
    try {
      const data = await login(username, pw)
      guardarSesion(data.token, data.usuario)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Credenciales incorrectas')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div id="page-login">
      {/* Lado verde – branding */}
      <div className="login-brand">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="brand-logo">
          <div className="sun">☀️</div>
          <h1>Mi<span>Banco</span></h1>
          <p>Tu banco de confianza, siempre contigo</p>
        </div>
        <div className="brand-stats">
          <div className="brand-stat">
            <strong>2.4M</strong>
            <span>Clientes</span>
          </div>
          <div className="brand-stat">
            <strong>99.9%</strong>
            <span>Disponibilidad</span>
          </div>
          <div className="brand-stat">
            <strong>S/ 0</strong>
            <span>Comisión</span>
          </div>
        </div>
      </div>

      {/* Lado blanco – formulario */}
      <div className="login-panel">
        <div className="login-tabs">
          <button
            className={`login-tab${tab === 'login' ? ' active' : ''}`}
            onClick={() => { setTab('login'); setError('') }}
          >
            Iniciar sesión
          </button>
          <button
            className={`login-tab${tab === 'register' ? ' active' : ''}`}
            onClick={() => { setTab('register'); setError('') }}
          >
            Registrarse
          </button>
        </div>

        {tab === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <h2>¡Bienvenido de vuelta!</h2>
            <p>Ingresa tus credenciales para acceder a tu cuenta</p>

            <div className="form-group">
              <label>Usuario o DNI</label>
              <div className="input-wrap">
                <span className="ico">👤</span>
                <input
                  type="text"
                  placeholder="Ej: juanperez o 12345678"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrap">
                <span className="ico">🔒</span>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={pw}
                  onChange={e => setPw(e.target.value)}
                />
                <button
                  type="button"
                  className="toggle-pw"
                  onClick={() => setShowPw(v => !v)}
                >
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Mensaje de error visible */}
            {error && (
              <div style={{
                background: '#ffebee',
                border: '1px solid #e53935',
                borderRadius: '8px',
                padding: '0.75rem 1rem',
                color: '#e53935',
                fontSize: '0.88rem',
                fontWeight: 600,
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                ⚠️ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={cargando}
              style={{ opacity: cargando ? 0.7 : 1 }}
            >
              {cargando ? '⏳ Verificando...' : 'Ingresar a mi cuenta'}
            </button>

            <p className="login-footer">
              ¿No tienes cuenta?{' '}
              <a href="#" onClick={e => { e.preventDefault(); setTab('register'); setError('') }}>
                Ábrela gratis
              </a>
            </p>
          </form>
        ) : (
          <form className="auth-form" onSubmit={e => { e.preventDefault(); setTab('login') }}>
            <h2>Crear cuenta</h2>
            <p>Únete a MiBanco y empieza a ahorrar hoy</p>

            <div className="form-group">
              <label>Nombre completo</label>
              <div className="input-wrap">
                <span className="ico">👤</span>
                <input type="text" placeholder="Juan Pérez García" />
              </div>
            </div>

            <div className="form-group">
              <label>DNI</label>
              <div className="input-wrap">
                <span className="ico">🪪</span>
                <input type="text" placeholder="12345678" />
              </div>
            </div>

            <div className="form-group">
              <label>Correo electrónico</label>
              <div className="input-wrap">
                <span className="ico">📧</span>
                <input type="email" placeholder="juan@correo.com" />
              </div>
            </div>

            <div className="form-group">
              <label>Contraseña</label>
              <div className="input-wrap">
                <span className="ico">🔒</span>
                <input type="password" placeholder="Mínimo 8 caracteres" />
              </div>
            </div>

            <button type="submit" className="btn-secondary">
              Crear mi cuenta gratis
            </button>

            <p className="login-footer">
              ¿Ya tienes cuenta?{' '}
              <a href="#" onClick={e => { e.preventDefault(); setTab('login'); setError('') }}>
                Inicia sesión
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}

export default Login
