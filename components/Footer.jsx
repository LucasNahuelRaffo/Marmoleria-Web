const { useState, useEffect } = React;

function Footer({ onCotizarClick }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const linkBtn = (label) =>
  <button key={label} style={{
    background: 'none', border: 'none', padding: '0 0 10px',
    cursor: 'pointer', fontFamily: "'Figtree', sans-serif",
    fontSize: '14px', color: 'rgba(245,240,230,0.5)',
    display: 'block', textAlign: isMobile ? 'center' : 'left', letterSpacing: '0.01em',
    transition: 'color 0.2s',
    margin: isMobile ? '0 auto' : '0'
  }}
  onMouseEnter={(e) => e.currentTarget.style.color = '#F5F0E6'}
  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245,240,230,0.5)'}>
    {label}</button>;

  return (
    <footer id="contact" style={{
      position: 'relative', overflow: 'hidden'
    }}>
      {/* Bg */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(images/disena-espacio.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.04
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #0B0B0F 0%, #080604 100%)'
      }} />

      {/* CTA Band */}
      <div style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        padding: isMobile ? '40px 4%' : '56px 5.5%'
      }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: isMobile ? '28px' : '40px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '28px',
          padding: isMobile ? '32px 24px' : '44px 52px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.07)',
          textAlign: isMobile ? 'center' : 'left'
        }}>
          <div>
            <p style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: '11px', letterSpacing: '0.22em',
              textTransform: 'uppercase', color: '#D4AF37',
              marginBottom: '12px'
            }}>¿Tenés un proyecto?</p>
            <h3 style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: isMobile ? '24px' : 'clamp(26px, 3vw, 44px)',
              fontWeight: 600, color: '#F5F0E6',
              letterSpacing: '-0.02em', lineHeight: 1.2
            }}>Convertí tu espacio<br />en algo extraordinario</h3>
          </div>
          <button onClick={onCotizarClick} style={{
            flexShrink: 0,
            background: '#D4AF37', color: '#0B0B0F',
            border: 'none', borderRadius: '50px',
            padding: isMobile ? '14px 32px' : '16px 40px', 
            cursor: 'pointer',
            fontFamily: "'Figtree', sans-serif",
            fontSize: '15px', fontWeight: 600,
            letterSpacing: '0.02em',
            boxShadow: '0 8px 28px rgba(212,175,55,0.3)',
            transition: 'background 0.2s, transform 0.2s, box-shadow 0.2s',
            width: isMobile ? '100%' : 'auto'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#e8c44a';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 14px 36px rgba(212,175,55,0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#D4AF37';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 28px rgba(212,175,55,0.3)';
          }}>
            Cotizar ahora →</button>
        </div>
      </div>

      {/* Main grid */}
      <div style={{
        position: 'relative', zIndex: 1,
        padding: isMobile ? '48px 4% 36px' : '72px 5.5% 48px',
        maxWidth: '1280px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr',
        gap: isMobile ? '36px' : '48px',
        textAlign: isMobile ? 'center' : 'left'
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
          <div style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '22px',
            letterSpacing: '0.12em',
            marginBottom: '18px', color: "rgba(235, 233, 227, 0.87)", fontWeight: "400"
          }}>MARMOLERÍA</div>
          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '14px', lineHeight: 1.75,
            color: 'rgba(245,240,230,0.4)', maxWidth: '270px',
            marginBottom: '28px'
          }}>
            Más de 90 años transformando espacios con materiales nobles,
            diseño y precisión artesanal.
          </p>
          {/* Socials */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {[
              { label: 'IG', title: 'Instagram', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> },
              { label: 'FB', title: 'Facebook', svg: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg> },
              { label: 'WA', title: 'WhatsApp', svg: <svg width="18" height="18" viewBox="0 0 448 512" fill="currentColor"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157.1zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg> }
            ].map((s) =>
              <a key={s.label} href="#" title={s.title} style={{
                width: '38px', height: '38px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none',
                color: 'rgba(245,240,230,0.45)',
                transition: 'border-color 0.2s, color 0.2s, transform 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D4AF37';
                e.currentTarget.style.color = '#D4AF37';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                e.currentTarget.style.color = 'rgba(245,240,230,0.45)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}>
                {s.svg}</a>
            )}
          </div>
        </div>

        {/* Servicios */}
        <div>
          <h4 style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(245,240,230,0.3)', marginBottom: '20px'
          }}>Servicios</h4>
          {['Marmolería', 'Electricidad y luminación', 'Muebles a medida', 'Herrajes'].map(linkBtn)}
        </div>

        {/* Empresa */}
        <div>
          <h4 style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(245,240,230,0.3)', marginBottom: '20px'
          }}>Empresa</h4>
          {['Inicio', 'Sobre Nosotros', 'Proyectos', 'Contacto'].map(linkBtn)}
        </div>

        {/* Contacto */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: isMobile ? 'center' : 'flex-start' }}>
          <h4 style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '10px', fontWeight: 700,
            letterSpacing: '0.18em', textTransform: 'uppercase',
            color: 'rgba(245,240,230,0.3)', marginBottom: '20px'
          }}>Contacto</h4>
          {[
            { label: 'Teléfono', value: '+54 11 0000-0000' },
            { label: 'Email', value: 'info@marmoleria.com' },
            { label: 'Dirección', value: 'Buenos Aires, Argentina' },
            { label: 'Horario', value: 'Lun–Vie 9:00–18:00' }
          ].map((item) =>
            <div key={item.label} style={{ marginBottom: '14px', textAlign: isMobile ? 'center' : 'left' }}>
              <p style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: '10px', letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'rgba(245,240,230,0.22)', marginBottom: '3px'
              }}>{item.label}</p>
              <p style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: '13px', color: 'rgba(245,240,230,0.55)'
              }}>{item.value}</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom */}
      <div style={{
        position: 'relative', zIndex: 1,
        borderTop: '1px solid rgba(255,255,255,0.05)',
        padding: '24px 5.5%',
        maxWidth: '1280px', margin: '0 auto',
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: 'center', 
        justifyContent: 'space-between',
        gap: isMobile ? '14px' : '0',
        textAlign: 'center'
      }}>
        <p style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: '12px', color: 'rgba(245,240,230,0.18)'
        }}>© 2025 Marmolería. Todos los derechos reservados.</p>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '40px', height: '1px', background: 'linear-gradient(to right, transparent, rgba(212,175,55,0.4))' }} />
          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '11px', letterSpacing: '0.14em',
            textTransform: 'uppercase', color: 'rgba(245,240,230,0.18)'
          }}>Diseño · Calidad · Tradición</p>
        </div>
      </div>
    </footer>);

}

Object.assign(window, { Footer });