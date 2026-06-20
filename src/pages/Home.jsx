import { useNavigate } from 'react-router-dom'

export default function Home() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', fontFamily: "'Segoe UI', sans-serif" }}>

      {/* NAVBAR */}
      <nav style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '1rem 2rem', backgroundColor: '#1a5c2e', color: 'white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.6rem' }}>☀️</span>
          <span style={{ fontSize: '1.3rem', fontWeight: 700 }}>
            Mi<span style={{ color: '#f5c518' }}>Banco</span>
          </span>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <span style={{ cursor: 'pointer', opacity: 0.9 }}>Créditos</span>
          <span style={{ cursor: 'pointer', opacity: 0.9 }}>Ahorros</span>
          <span style={{ cursor: 'pointer', opacity: 0.9 }}>Servicios</span>
          <button
            onClick={() => navigate('/banca')}
            style={{
              background: '#f5c518', color: '#1a5c2e', border: 'none',
              padding: '0.6rem 1.4rem', borderRadius: '6px',
              fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem'
            }}
          >
            Banca por Internet
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{
        background: 'linear-gradient(135deg, #1a5c2e, #2d8a4e)',
        color: 'white', padding: '5rem 2rem', textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2.8rem', marginBottom: '1rem', fontWeight: 800 }}>
          Tu dinero, tu futuro 🌱
        </h1>
        <p style={{ maxWidth: 600, margin: '0 auto 2rem', fontSize: '1.15rem', opacity: 0.9 }}>
          Créditos rápidos y ahorros seguros para el microempresario peruano.
          Más de 2.4 millones de clientes confían en nosotros.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/banca')}
            style={{
              background: '#f5c518', color: '#1a5c2e', border: 'none',
              padding: '0.9rem 2rem', borderRadius: '8px',
              fontWeight: 700, cursor: 'pointer', fontSize: '1rem'
            }}
          >
            Ingresar a mi cuenta
          </button>
          <button
            style={{
              background: 'transparent', color: 'white',
              border: '2px solid white', padding: '0.9rem 2rem',
              borderRadius: '8px', fontWeight: 600,
              cursor: 'pointer', fontSize: '1rem'
            }}
          >
            Conocer más
          </button>
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex', gap: '3rem', justifyContent: 'center',
          marginTop: '3rem', flexWrap: 'wrap'
        }}>
          {[
            { valor: '2.4M', label: 'Clientes' },
            { valor: '99.9%', label: 'Disponibilidad' },
            { valor: 'S/ 0', label: 'Comisión' },
            { valor: '15 años', label: 'De experiencia' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#f5c518' }}>{s.valor}</div>
              <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTOS */}
      <section style={{ padding: '4rem 2rem', background: '#f8f9fa', textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', color: '#1a5c2e', marginBottom: '0.5rem' }}>
          Nuestros productos
        </h2>
        <p style={{ color: '#666', marginBottom: '2.5rem' }}>
          Diseñados para el emprendedor peruano
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.5rem', maxWidth: 900, margin: '0 auto'
        }}>
          {[
            { ico: '💰', titulo: 'Crédito MYPE',        desc: 'Desde S/ 500 hasta S/ 50,000 con cuotas flexibles.' },
            { ico: '🏦', titulo: 'Ahorro Plus',          desc: 'La mejor tasa del mercado, sin comisiones ocultas.' },
            { ico: '🌾', titulo: 'Crédito Agropecuario', desc: 'Para productores del campo con gracia de 6 meses.' },
            { ico: '🏠', titulo: 'Crédito Hipotecario',  desc: 'Financia tu vivienda con tasas preferenciales.' },
          ].map((p, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: 12,
              padding: '1.8rem 1.5rem', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
              borderTop: '4px solid #1a5c2e', textAlign: 'left',
              transition: 'transform 0.2s',
            }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.8rem' }}>{p.ico}</div>
              <h3 style={{ color: '#1a5c2e', marginBottom: '0.4rem' }}>{p.titulo}</h3>
              <p style={{ color: '#666', fontSize: '0.9rem', lineHeight: 1.5 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* BANCA POR INTERNET BANNER */}
      <section style={{
        background: '#1a5c2e', color: 'white',
        padding: '3rem 2rem', textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '1.8rem', marginBottom: '1rem' }}>
          🔐 Banca por Internet
        </h2>
        <p style={{ opacity: 0.9, marginBottom: '1.5rem', maxWidth: 500, margin: '0 auto 1.5rem' }}>
          Accede a tu cuenta desde cualquier lugar, las 24 horas del día.
          Zona segura con cifrado SSL de 256 bits.
        </p>
        <button
          onClick={() => navigate('/banca')}
          style={{
            background: '#f5c518', color: '#1a5c2e', border: 'none',
            padding: '1rem 2.5rem', borderRadius: '8px',
            fontWeight: 700, cursor: 'pointer', fontSize: '1.05rem'
          }}
        >
          Ingresar ahora →
        </button>
      </section>

      {/* FOOTER */}
      <footer style={{
        backgroundColor: '#111', color: '#aaa',
        textAlign: 'center', padding: '1.5rem', fontSize: '0.85rem'
      }}>
        MiBanco S.A. | Supervisada por la SBS | 📞 0800-00-123 | © 2026
      </footer>

    </div>
  )
}