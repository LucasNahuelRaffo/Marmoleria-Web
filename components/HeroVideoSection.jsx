const { useState, useEffect, useRef } = React;

const HERO_QUESTIONS = [
  { pre: '¿Listo para ', bold: 'transformar tu obra', post: '?' },
  { pre: '¿Soñás con una ', bold: 'cocina a medida', post: '?' },
  { pre: '¿Buscás calidad premium ', bold: 'sin intermediarios', post: '?' },
  { pre: '¿Tu obra necesita ', bold: 'un solo proveedor', post: '?' },
];

function HeroVideoSection({ onCotizarClick }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [hoveredCta, setHoveredCta] = useState(false);
  const [hoveredWa, setHoveredWa] = useState(false);
  const [qIndex, setQIndex] = useState(0);
  const [qVisible, setQVisible] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Rotación del titular: fundido de salida, cambio de pregunta, fundido de entrada.
  // Se salta el trabajo si la pestaña está oculta (nadie la ve, no vale la pena animarla).
  useEffect(() => {
    let fadeTimeout;
    const interval = setInterval(() => {
      if (document.hidden) return;
      setQVisible(false);
      fadeTimeout = setTimeout(() => {
        setQIndex(i => (i + 1) % HERO_QUESTIONS.length);
        setQVisible(true);
      }, 500);
    }, 5000);
    return () => { clearInterval(interval); clearTimeout(fadeTimeout); };
  }, []);

  // El video nunca debe quedar pausado: los navegadores mobile lo pausan solo al
  // minimizar la app / bloquear pantalla, y no lo reanudan solos al volver.
  useEffect(() => {
    const resume = () => {
      const v = videoRef.current;
      if (v && v.paused) v.play().catch(() => {});
    };
    document.addEventListener('visibilitychange', resume);
    window.addEventListener('pageshow', resume);
    window.addEventListener('focus', resume);
    return () => {
      document.removeEventListener('visibilitychange', resume);
      window.removeEventListener('pageshow', resume);
      window.removeEventListener('focus', resume);
    };
  }, []);

  return (
    <section id="hero" style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Video de fondo */}
      <video
        ref={videoRef}
        autoPlay muted loop playsInline webkit-playsinline="true" preload="auto"
        poster="images/hero-bg.webp"
        onPause={(e) => { e.currentTarget.play().catch(() => {}); }}
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'cover', objectPosition: 'center',
        }}
      >
        <source src="images/videos/Luxury_marble_website_hero_video_202607272226.mp4" type="video/mp4" />
      </video>

      {/* Overlays para legibilidad del texto */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(170deg, rgba(8,6,4,0.55) 0%, rgba(8,6,4,0.42) 40%, rgba(6,5,3,0.88) 100%)',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 35%, rgba(4,3,2,0.6) 100%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1,
        flex: 1, display: 'flex', flexDirection: 'column',
        padding: isMobile ? '0 4% 32px' : '0 5.5%',
      }}>
        <div style={{ height: '82px', flexShrink: 0 }} />

        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '11px', fontWeight: 500,
            letterSpacing: '0.24em', textTransform: 'uppercase',
            color: '#D4AF37', marginBottom: isMobile ? '18px' : '24px',
          }}>Homeconnect · Proveedor integral</p>

          <h1 style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: isMobile ? '36px' : 'clamp(38px, 5.4vw, 74px)', fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#F5F0E6', lineHeight: 1.12,
            marginBottom: isMobile ? '20px' : '26px',
            maxWidth: '920px',
            textShadow: '0 2px 40px rgba(0,0,0,0.5)',
          }}>
            <span style={{
              display: 'inline-block',
              opacity: qVisible ? 1 : 0,
              transform: qVisible ? 'translateY(0)' : 'translateY(10px)',
              transition: 'opacity 0.5s ease, transform 0.5s ease',
            }}>
              {HERO_QUESTIONS[qIndex].pre}
              <span style={{ fontWeight: 700 }}>{HERO_QUESTIONS[qIndex].bold}</span>
              {HERO_QUESTIONS[qIndex].post}
            </span>
          </h1>

          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: isMobile ? '15px' : '18px', fontWeight: 400,
            color: 'rgba(255,255,255,0.92)',
            letterSpacing: '0.01em',
            maxWidth: '540px', lineHeight: 1.55,
            marginBottom: isMobile ? '30px' : '38px',
            textShadow: '0 1px 20px rgba(0,0,0,0.4)',
          }}>
            Marmolería, muebles, herrajes e iluminación a medida. Calidad premium, directo de fábrica.
          </p>

          {/* CTAs */}
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            gap: isMobile ? '12px' : '16px',
            justifyContent: 'center',
          }}>
            <button
              onClick={onCotizarClick}
              onMouseEnter={() => setHoveredCta(true)}
              onMouseLeave={() => setHoveredCta(false)}
              style={{
                background: '#D4AF37', color: '#0B0B0F',
                border: '1.5px solid #D4AF37', borderRadius: '4px',
                padding: isMobile ? '14px 30px' : '16px 40px', cursor: 'pointer',
                fontFamily: "'Figtree', sans-serif",
                fontSize: '13px', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                boxShadow: hoveredCta ? '0 14px 36px rgba(212,175,55,0.4)' : '0 8px 28px rgba(212,175,55,0.25)',
                transform: hoveredCta ? 'translateY(-2px)' : 'translateY(0)',
                transition: 'box-shadow 0.25s, transform 0.25s',
              }}>
              Cotizar
            </button>
            <a
              href={`https://wa.me/${window.WA_NUMBER || '5491125062187'}`}
              target="_blank" rel="noopener noreferrer"
              onMouseEnter={() => setHoveredWa(true)}
              onMouseLeave={() => setHoveredWa(false)}
              style={{
                background: hoveredWa ? 'rgba(245,240,230,0.12)' : 'transparent',
                color: '#F5F0E6',
                border: `1.5px solid ${hoveredWa ? 'rgba(245,240,230,0.9)' : 'rgba(245,240,230,0.55)'}`,
                borderRadius: '4px',
                padding: isMobile ? '14px 30px' : '16px 40px',
                fontFamily: "'Figtree', sans-serif",
                fontSize: '13px', fontWeight: 600,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
                transition: 'background 0.25s, border-color 0.25s',
              }}>
              Hablar con un asesor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

Object.assign(window, { HeroVideoSection });
