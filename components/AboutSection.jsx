const { useState } = React;

function AboutSection() {
  return (
    <section id="about" style={{
      position: 'relative',
      padding: '120px 5.5%',
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
        display: 'grid', gridTemplateColumns: '1fr 1fr',
        gap: '60px', alignItems: 'center'
      }}>

        {/* Left — image in glass frame */}
        <div style={{ position: 'relative', width: '85%', justifySelf: 'center' }}>
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
            <img src="images/familia.jpg" alt="Nuestra familia" style={{
              width: '100%', aspectRatio: '4/5',
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
            position: 'absolute', bottom: '-10px', right: '-10px',
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
            backdropFilter: 'blur(20px)',

            borderRadius: '20px',
            padding: '20px 26px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)', border: "1px solid rgba(212, 175, 55, 0.15)"
          }}>
            <div style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: '52px', fontWeight: 700,
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
          padding: '52px 48px',
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
            fontSize: 'clamp(30px, 3.2vw, 48px)',
            fontWeight: 600, lineHeight: 1.12,
            color: '#F5F0E6', marginBottom: '24px',
            letterSpacing: '-0.02em'
          }}>
            Una tradición<br />hecha con dedicación
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
            Somos una empresa familiar con más de 90 años en el rubro de la marmolería.
            Nacimos con la pasión por los materiales nobles y la convicción de que cada espacio merece lo mejor.
          </p>

          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '15px', lineHeight: 1.8,
            color: 'rgba(245,240,230,0.62)', marginBottom: '40px'
          }}>
            Desde mármoles importados hasta soluciones integrales de cocina y baño,
            acompañamos a nuestros clientes con asesoramiento personalizado e instalación profesional.
          </p>

          {/* Stats */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3,1fr)',
            gap: '0',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            paddingTop: '32px'
          }}>
            {[
            { num: '500+', label: 'Proyectos' },
            { num: '90+', label: 'Años' },
            { num: '100%', label: 'Garantía' }].
            map((s, i) =>
            <div key={s.label} style={{
              textAlign: 'center',
              borderRight: i < 2 ? '1px solid rgba(255,255,255,0.08)' : 'none',
              padding: '0 8px'
            }}>
                <div style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: '34px', fontWeight: 700,
                lineHeight: 1,
                letterSpacing: '-0.02em', color: "rgba(235, 233, 227, 0.87)"
              }}>{s.num}</div>
                <div style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: '11px', color: 'rgba(245,240,230,0.4)',
                marginTop: '6px', letterSpacing: '0.06em', textTransform: 'uppercase'
              }}>{s.label}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>);

}

Object.assign(window, { AboutSection });