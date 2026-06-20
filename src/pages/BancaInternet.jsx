import { useNavigate } from 'react-router-dom'

export default function BancaInternet() {
  const navigate = useNavigate()

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1a5c2e, #2d8a4e)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Segoe UI', sans-serif"
    }}>
      <div style={{
        background: 'white', borderRadius: 16,
        padding: '3rem', maxWidth: 440, width: '90%',
        textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>☀️</div>
        <h1 style={{ color: '#1a5c2e', fontSize: '1.8rem', fontWeight: 800, marginBottom: '.5rem' }}>
          Mi<span style={{ color: '#f5c518' }}>Banco</span>
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem', fontSize: '0.95rem' }}>
          🔐 Zona segura · Cifrado SSL 256 bits
        </p>
        <p style={{ color: '#444', marginBottom: '2rem', lineHeight: 1.6 }}>
          Bienvenido a tu banca por internet. Accede de forma segura a tu cuenta.
        </p>
        <button
          onClick={() => navigate('/login')}
          style={{
            width: '100%', padding: '1rem',
            background: '#1a5c2e', color: 'white',
            border: 'none', borderRadius: 50, fontWeight: 800,
            fontSize: '1rem', cursor: 'pointer', marginBottom: '1rem'
          }}
        >
          Ingresar a mi cuenta
        </button>
        <button
          onClick={() => navigate('/')}
          style={{
            background: 'none', color: '#1a5c2e',
            border: 'none', cursor: 'pointer', fontSize: '.9rem', fontWeight: 600
          }}
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}