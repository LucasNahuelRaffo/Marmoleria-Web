const { useState, useEffect, useRef } = React;

const CARD_FEATURES = {
  marmoleria: ['Mármoles importados', 'Granitos nacionales', 'Purastone y Purastone Prima'],
  electricidad: ['Instalaciones completas', 'Luminación de diseño LED', 'Automatización del hogar'],
  muebles: ['Cocinas a medida', 'Vanitorys y muebles de baño', 'Diseño personalizado 100%'],
  herrajes: ['Tiraderas y manijas premium', 'Sistemas corredizos', 'Marcas líderes del mercado'],
};

function GlassCard({ card, index, onCardClick, onVerMasClick }) {
  const [hovered, setHovered] = useState(false);
  const features = CARD_FEATURES[card.id] || [];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onCardClick(card.cotizadorContext)}
      style={{
        position: 'relative', cursor: 'pointer',
        borderRadius: '24px', overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        willChange: 'backdrop-filter',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.16)'}`,
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.32s ease, box-shadow 0.32s ease, border-color 0.25s',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered
          ? '0 28px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.25)'
          : '0 6px 24px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.15)',
      }}>

      {/* Image area — tall, title overlaid */}
      <div style={{
        position: 'relative', height: '210px',
        overflow: 'hidden', flexShrink: 0,
      }}>
        <img src={card.img} alt={card.title} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          display: 'block',
        }} />
        {/* Gradient fade to glass body */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,6,4,0.05) 0%, rgba(8,6,4,0.1) 50%, rgba(16,13,9,0.85) 100%)',
        }} />
        {/* Title on image */}
        <h3 style={{
          position: 'absolute', left: '20px', right: '20px', bottom: '16px',
          fontFamily: "'Figtree', sans-serif",
          fontSize: '21px', fontWeight: 700,
          color: '#F5F0E6', lineHeight: 1.15,
          letterSpacing: '-0.01em',
          textShadow: '0 2px 20px rgba(0,0,0,0.7)',
        }}>{card.title}</h3>
      </div>

      {/* Body */}
      <div style={{
        padding: '18px 20px 22px',
        display: 'flex', flexDirection: 'column', flex: 1,
      }}>
        {/* Subtitle */}
        <p style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: '13px', fontWeight: 400,
          color: 'rgba(245,240,230,0.55)',
          lineHeight: 1.5, marginBottom: '16px',
        }}>{card.subtitle}</p>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: `rgba(255,255,255,${hovered ? '0.14' : '0.07'})`,
          marginBottom: '14px',
          transition: 'background 0.3s',
        }} />

        {/* Features */}
        <ul style={{ listStyle: 'none', marginBottom: '20px', flex: 1 }}>
          {features.map((f, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              fontFamily: "'Figtree', sans-serif",
              fontSize: '13px', color: 'rgba(245,240,230,0.7)',
              lineHeight: 1.4, marginBottom: '9px',
            }}>
              <span style={{
                color: '#D4AF37', fontSize: '14px',
                lineHeight: 1.4, flexShrink: 0,
              }}>◈</span>
              {f}
            </li>
          ))}
        </ul>

        {/* Ver más button */}
        <button
          onClick={(e) => { e.stopPropagation(); onVerMasClick(card.sectionId); }}
          style={{
            background: 'rgba(212,175,55,0.12)',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '50px',
            padding: '10px 20px',
            cursor: 'pointer', color: '#D4AF37',
            fontFamily: "'Figtree', sans-serif",
            fontSize: '12px', fontWeight: 600,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'background 0.2s, gap 0.2s', alignSelf: 'stretch',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.22)'; e.currentTarget.style.gap = '10px'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(212,175,55,0.12)'; e.currentTarget.style.gap = '6px'; }}>
          Ver detalles <span style={{ fontSize: '14px' }}>→</span>
        </button>
      </div>
    </div>
  );
}

function HeroSection({ onCardClick, onVerMasClick }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const touchStartX = useRef(null);
  const total = window.HERO_CARDS_DATA.length;

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) {
      // La opacidad la maneja CSS transition (ya pre-computada)
      // GSAP solo anima scale y y para el efecto de entrada
      gsap.killTweensOf(`.hero-mobile-slide.slide-${activeIndex}`);
      gsap.fromTo(`.hero-mobile-slide.slide-${activeIndex}`,
        { scale: 0.96, y: 12 },
        { scale: 1, y: 0, duration: 0.4, ease: 'power3.out', force3D: true }
      );
    }
  }, [activeIndex, isMobile]);

  const handleTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const handleTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const delta = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(delta) > 40) {
      if (delta > 0) setActiveIndex(prev => (prev + 1) % total);
      else setActiveIndex(prev => (prev - 1 + total) % total);
    }
    touchStartX.current = null;
  };

  return (
    <section id="hero" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Fallback Main Background */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(images/hero-bg.png)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />

      {/* Dynamic Slide Background (Only on mobile to fit the active card content) */}
      {isMobile && window.HERO_CARDS_DATA.map((card, idx) => (
        <div
          key={card.id + '-bg'}
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${card.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: activeIndex === idx ? 0.35 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
      ))}

      {/* Overlays */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(170deg, rgba(8,6,4,0.38) 0%, rgba(8,6,4,0.22) 40%, rgba(8,6,4,0.82) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(4,3,2,0.55) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: isMobile ? '0 4% 32px' : '0 5.5%',
      }}>
        <div style={{ height: '68px', flexShrink: 0 }} />

        {/* Center headline */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: isMobile ? '36px 0 24px' : '24px 0 32px',
        }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <h1 style={{
              fontFamily: "'Figtree', sans-serif",
              fontSize: isMobile ? '38px' : '76px', fontWeight: 300,
              letterSpacing: '-0.02em',
              color: '#F5F0E6', lineHeight: 1.1,
              marginBottom: '18px', whiteSpace: isMobile ? 'normal' : 'nowrap',
              textShadow: '0 2px 40px rgba(0,0,0,0.45)',
            }}>
              Diseñá tu espacio ideal
            </h1>
          </div>

          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: isMobile ? '15px' : '18px', fontWeight: 400,
            color: 'rgba(245,240,230,0.75)',
            letterSpacing: '0.01em', marginBottom: '0',
            maxWidth: '540px', lineHeight: 1.55,
            textShadow: '0 1px 20px rgba(0,0,0,0.4)',
          }}>
            Materiales premium y soluciones a medida para cada rincón de tu hogar
          </p>
        </div>

        {/* Cards view */}
        {isMobile ? (
          <div className="hero-slider-touch" style={{ display: 'flex', flexDirection: 'column', width: '100%', zIndex: 2 }}>
            {/* Slider container */}
            <div
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{
              position: 'relative',
              height: '430px',
              width: '100%',
              maxWidth: '400px',
              margin: '0 auto',
            }}>
              {window.HERO_CARDS_DATA.map((card, i) => (
                <div
                  key={card.id}
                  className={`hero-mobile-slide slide-${i}`}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    // Siempre display:flex — el blur se pre-computa en GPU
                    // y no hay reflow costoso al cambiar de slide
                    display: 'flex',
                    flexDirection: 'column',
                    opacity: i === activeIndex ? 1 : 0,
                    pointerEvents: i === activeIndex ? 'auto' : 'none',
                    // Promover a capa GPU propia para que backdropFilter
                    // no se recalcule en cada cambio
                    willChange: 'opacity, transform',
                    transform: 'translateZ(0)',
                    transition: 'opacity 0.35s ease',
                  }}
                >
                  <GlassCard
                    card={card}
                    index={i}
                    onCardClick={onCardClick}
                    onVerMasClick={onVerMasClick}
                  />
                </div>
              ))}
            </div>

            {/* Slider Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '24px',
              marginTop: '20px',
            }}>
              <button
                onClick={() => setActiveIndex(prev => (prev === 0 ? window.HERO_CARDS_DATA.length - 1 : prev - 1))}
                aria-label="Tarjeta anterior"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: '#F5F0E6',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  padding: 0
                }}
              >
                ‹
              </button>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {window.HERO_CARDS_DATA.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveIndex(idx)}
                    aria-label={`Ir a tarjeta ${idx + 1}`}
                    style={{
                      background: activeIndex === idx ? '#D4AF37' : 'rgba(255,255,255,0.2)',
                      border: 'none',
                      borderRadius: '50px',
                      width: activeIndex === idx ? '20px' : '8px',
                      height: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      padding: 0,
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setActiveIndex(prev => (prev === window.HERO_CARDS_DATA.length - 1 ? 0 : prev + 1))}
                aria-label="Siguiente tarjeta"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '50%',
                  width: '40px',
                  height: '40px',
                  color: '#F5F0E6',
                  fontSize: '20px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 0.2s',
                  padding: 0
                }}
              >
                ›
              </button>
            </div>
          </div>
        ) : (
          /* 4 Glass Cards Grid on Desktop */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '14px',
            paddingBottom: '44px',
            maxWidth: '1280px', margin: '0 auto', width: '100%',
          }}>
            {window.HERO_CARDS_DATA.map((card, i) => (
              <GlassCard
                key={card.id}
                card={card}
                index={i}
                onCardClick={onCardClick}
                onVerMasClick={onVerMasClick} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

Object.assign(window, { HeroSection, GlassCard });
