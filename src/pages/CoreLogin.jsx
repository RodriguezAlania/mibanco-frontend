import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CoreLogin() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const res = await axios.post('http://localhost:3000/api/core/login', { username, password })
      localStorage.setItem('core_token', res.data.token)
      localStorage.setItem('core_usuario', JSON.stringify(res.data.usuario))
      navigate('/core-dashboard')
    } catch (err) {
      setError(err.response?.data?.mensaje || 'Error al iniciar sesión.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0d3b24, #145c36)'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '2.5rem',
        width: '380px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '2.2rem' }}>🏦</div>
          <h2 style={{ margin: '0.5rem 0 0', color: '#0d3b24' }}>Core Bancario</h2>
          <p style={{ color: '#888', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>Acceso para personal autorizado</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#444' }}>USUARIO</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="DNI o usuario"
              style={{
                width: '100%', padding: '0.7rem 1rem', marginTop: '0.3rem',
                borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.95rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ fontSize: '0.78rem', fontWeight: 700, color: '#444' }}>CONTRASEÑA</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%', padding: '0.7rem 1rem', marginTop: '0.3rem',
                borderRadius: '8px', border: '1px solid #ddd', outline: 'none', fontSize: '0.95rem'
              }}
            />
          </div>

          {error && (
            <div style={{
              background: '#ffebee', border: '1px solid #e53935', color: '#e53935',
              padding: '0.6rem 0.9rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1rem'
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            style={{
              width: '100%', padding: '0.8rem', background: '#f5a623', border: 'none',
              borderRadius: '8px', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              color: '#1a1a1a', opacity: cargando ? 0.7 : 1
            }}
          >
            {cargando ? 'Ingresando...' : 'Ingresar al Core'}
          </button>
        </form>
      </div>
    </div>
  )
}