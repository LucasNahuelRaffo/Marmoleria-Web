const { useState, useEffect } = React;

function ValueCard({ card, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '24px',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.16)'}`,
        padding: isMobile ? '22px 20px' : '28px 26px',
        willChange: 'transform', backfaceVisibility: 'hidden',
        transform: hovered && !isMobile ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.32s ease, box-shadow 0.32s ease, border-color 0.25s',
        boxShadow: hovered
          ? '0 28px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)'
          : '0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}>
      <div style={{
        fontFamily: "'Figtree', sans-serif",
        fontSize: '10px', fontWeight: 600,
        letterSpacing: '0.16em', color: '#D4AF37',
        marginBottom: '16px',
      }}>{card.code}</div>
      <h3 style={{
        fontFamily: "'Figtree', sans-serif",
        fontSize: isMobile ? '17px' : '19px', fontWeight: 600,
        lineHeight: 1.2, color: '#F5F0E6', marginBottom: '14px',
        letterSpacing: '-0.01em',
      }}>{card.title}</h3>
      <div style={{
        width: '40px', height: '2px',
        background: 'linear-gradient(to right, #D4AF37, transparent)',
        marginBottom: '14px',
      }} />
      <p style={{
        fontFamily: "'Figtree', sans-serif",
        fontSize: '13px', lineHeight: 1.6,
        color: 'rgba(245,240,230,0.55)',
      }}>{card.desc}</p>
    </div>
  );
}

function AboutSection() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section id="about" style={{
      position: 'relative',
      padding: isMobile ? '60px 4%' : '120px 5.5%',
      overflow: 'hidden'
    }}>
      {/* Bg image very subtle */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(images/taller-1.jpg)',
        backgroundSize: 'cover', backgroundPosition: 'center',
        opacity: 0.06
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(135deg, rgba(11,9,6,0.98) 0%, rgba(20,16,10,0.92) 100%)'
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1280px', margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: isMobile ? '48px' : '60px',
        alignItems: 'center'
      }}>

        {/* Left — image in glass frame */}
        <div style={{ 
          position: 'relative', 
          width: isMobile ? '92%' : '85%', 
          justifySelf: 'center',
          marginBottom: isMobile ? '16px' : '0'
        }}>
          {/* Glass frame behind */}
          <div style={{
            position: 'absolute',
            top: '20px', left: '20px', right: '-20px', bottom: '-20px',
            borderRadius: '28px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(212,175,55,0.18)',
            backdropFilter: 'blur(12px)'
          }} />
          {/* Image card */}
          <div style={{
            position: 'relative', borderRadius: '24px', overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.12)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.55)'
          }}>
            <img src="images/familia.webp" alt="Nuestro equipo" style={{
              width: '100%', aspectRatio: isMobile ? '1.2/1' : '4/5',
              objectFit: 'cover', objectPosition: 'center top',
              display: 'block'
            }} />
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to bottom, transparent 50%, rgba(8,6,4,0.65) 100%)'
            }} />
          </div>

          {/* Gold badge */}
          <div style={{
            position: 'absolute',
            bottom: isMobile ? '-15px' : '-10px',
            right: isMobile ? '-5px' : '-10px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: isMobile ? '12px 18px' : '20px 26px',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            border: "1px solid rgba(212, 175, 55, 0.15)"
          }}>
            <div style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: isMobile ? '38px' : '52px', fontWeight: 700,
              lineHeight: 1, color: "#F5F0E6", opacity: "1"
            }}>90+</div>
            <div style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: '11px', fontWeight: 500,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              color: 'rgba(245,240,230,0.6)', marginTop: '5px'
            }}>Años</div>
          </div>
        </div>

        {/* Right — glass text card */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)',
          backdropFilter: 'blur(24px)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '28px',
          padding: isMobile ? '32px 24px' : '52px 48px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)'
        }}>
          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '11px', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#D4AF37',
            marginBottom: '18px'
          }}>Sobre nosotros</p>

          <h2 style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: isMobile ? '28px' : 'clamp(30px, 3.2vw, 48px)',
            fontWeight: 600, lineHeight: 1.2,
            color: '#F5F0E6', marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Tu único interlocutor<br />para toda la obra
          </h2>

          <div style={{
            width: '48px', height: '2px',
            background: 'linear-gradient(to right, #D4AF37, transparent)',
            marginBottom: '24px'
          }} />

          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '15px', lineHeight: 1.8,
            color: 'rgba(245,240,230,0.62)', marginBottom: '18px'
          }}>
            Nos asociamos estratégicamente con las industrias metalúrgicas, marmolerías y talleres
            madereros más sólidos de la región, empresas que suman más de 90 años refinando la calidad
            premium de cada material. Unificamos esa tradición en un solo lugar.
          </p>

          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '15px', lineHeight: 1.8,
            color: 'rgba(245,240,230,0.62)', marginBottom: isMobile ? '32px' : '40px'
          }}>
            Entendemos que tu verdadero problema en obra no es solo el producto, sino la gestión. Por eso
            actuamos como tu único interlocutor y facilitador técnico, involucrándonos de principio a fin:
            desde la compatibilidad de planos hasta la logística en el sitio de construcción. Más de 50
            proyectos coordinados con éxito lo respaldan.
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: '0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '32px'
          }}>
            {[
              { num: '50+', label: 'Proyectos' },
              { num: '90+', label: 'Años' },
              { num: '100%', label: 'Garantía' }
            ].map((s, i) => (
              <div key={s.label} style={{
                textAlign: 'center',
                borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
                padding: '0 4px'
              }}>
                <div style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: isMobile ? '24px' : '34px', fontWeight: 700,
                  lineHeight: 1,
                  letterSpacing: '-0.02em', color: "rgba(235, 233, 227, 0.87)"
                }}>{s.num}</div>
                <div style={{
                  fontFamily: "'Figtree', sans-serif",
                  fontSize: isMobile ? '10px' : '11px', color: 'rgba(245,240,230,0.4)',
                  marginTop: '6px', letterSpacing: '0.06em', textTransform: 'uppercase'
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Value cards — por qué elegirnos */}
      <div style={{
        position: 'relative', zIndex: 1,
        maxWidth: '1280px', margin: isMobile ? '48px auto 0' : '72px auto 0',
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? '14px' : '20px',
      }}>
        {[
          { code: 'FÁB — 01', title: 'Directo de fábrica', desc: 'Sin intermediarios: mejores precios y tiempos de entrega más cortos.' },
          { code: 'INT — 02', title: 'Todo en un lugar', desc: 'Marmolería, iluminación, herrajes y muebles, coordinados para tu obra.' },
          { code: 'MED — 03', title: 'Diseño a medida', desc: 'Cada proyecto es distinto. Lo resolvemos a la medida exacta que necesita.' },
          { code: 'PRE — 04', title: 'Calidad premium', desc: 'Materiales y terminaciones pensadas para durar en el tiempo.' },
        ].map((c) => (
          <ValueCard key={c.code} card={c} isMobile={isMobile} />
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { AboutSection });