const { useState, useEffect } = React;

function Navbar({ onCotizarClick }) {
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile && menuOpen) {
      document.body.style.overflow = 'hidden';
      // Wait for CSS visibility/transform transition to expose elements
      const t = setTimeout(() => {
        gsap.killTweensOf('.mobile-menu-link');
        gsap.fromTo('.mobile-menu-link',
          { y: 28, autoAlpha: 0 },
          { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.07, ease: 'power3.out' }
        );
      }, 50);
      return () => clearTimeout(t);
    } else {
      document.body.style.overflow = '';
    }
  }, [menuOpen, isMobile]);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const navLink = {
    background: 'none', border: 'none', cursor: 'pointer',
    color: 'rgba(245,240,230,0.82)',
    fontFamily: "'Figtree', sans-serif",
    fontSize: '14px', fontWeight: 400,
    letterSpacing: '0.03em',
    padding: '4px 2px', transition: 'color 0.2s'
  };

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      height: '68px', padding: '0 5%',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: scrolled || menuOpen ?
      'rgba(11,9,6,0.95)' :
      'transparent',
      backdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'blur(0px)',
      WebkitBackdropFilter: scrolled || menuOpen ? 'blur(20px)' : 'blur(0px)',
      borderBottom: scrolled || menuOpen ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      transition: 'background 0.5s, backdrop-filter 0.5s, border-color 0.5s'
    }}>
      {/* Brand */}
      <div style={{
        fontFamily: "'Figtree', sans-serif",
        fontSize: '21px',
        letterSpacing: '0.18em',
        userSelect: 'none', fontWeight: "400", color: "rgb(218, 218, 218)",
        zIndex: 1100
      }}>
        MARMOLERÍA
      </div>

      {/* Center links - Hidden on mobile */}
      {!isMobile && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '38px' }}>
          {[['Inicio', 'hero'], ['Sobre Nosotros', 'about'], ['Contacto', 'contact']].map(([label, id]) =>
          <button key={id} style={navLink}
          onClick={() => scrollTo(id)}
          onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245,240,230,0.82)'}>
            {label}</button>
          )}
        </div>
      )}

      {/* Cotizar pill - Hidden on mobile, handled in drawer */}
      {!isMobile && (
        <button
          onClick={onCotizarClick}
          style={{
            background: 'transparent',
            border: '1.5px solid rgba(245,240,230,0.55)',
            borderRadius: '50px',
            padding: '9px 26px', cursor: 'pointer',
            fontFamily: "'Figtree', sans-serif",
            color: '#F5F0E6',
            fontSize: '14px', fontWeight: 400,
            letterSpacing: '0.04em',
            transition: 'background 0.25s, border-color 0.25s, color 0.25s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(245,240,230,0.12)';
            e.currentTarget.style.borderColor = 'rgba(245,240,230,0.9)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'rgba(245,240,230,0.55)';
          }}>
          
          Cotizar
        </button>
      )}

      {/* Hamburger Icon - Only on Mobile */}
      {isMobile && (
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menú de navegación"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            position: 'relative',
            width: '28px',
            height: '20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            zIndex: 1100,
            padding: 0
          }}
        >
          <div style={{
            width: '28px', height: '2px', background: '#F5F0E6', borderRadius: '2px',
            transition: 'transform 0.3s, top 0.3s, background-color 0.3s',
            position: 'absolute',
            top: menuOpen ? '9px' : '0px',
            transform: menuOpen ? 'rotate(45deg)' : 'none'
          }} />
          <div style={{
            width: '28px', height: '2px', background: '#F5F0E6', borderRadius: '2px',
            transition: 'opacity 0.3s',
            position: 'absolute',
            top: '9px',
            opacity: menuOpen ? 0 : 1
          }} />
          <div style={{
            width: '28px', height: '2px', background: '#F5F0E6', borderRadius: '2px',
            transition: 'transform 0.3s, top 0.3s, background-color 0.3s',
            position: 'absolute',
            top: menuOpen ? '9px' : '18px',
            transform: menuOpen ? 'rotate(-45deg)' : 'none'
          }} />
        </button>
      )}

      {/* Mobile Drawer menu */}
      {isMobile && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100vh',
            background: 'rgba(11,9,6,0.98)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            zIndex: 1050,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '32px',
            transform: menuOpen ? 'translateY(0)' : 'translateY(-100%)',
            opacity: menuOpen ? 1 : 0,
            visibility: menuOpen ? 'visible' : 'hidden',
            transition: 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.4s ease, visibility 0.4s',
            pointerEvents: menuOpen ? 'auto' : 'none',
          }}
        >
          {[['Inicio', 'hero'], ['Sobre Nosotros', 'about'], ['Contacto', 'contact']].map(([label, id]) => (
            <button
              key={id}
              className="mobile-menu-link"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'rgba(245,240,230,0.9)',
                fontFamily: "'Figtree', sans-serif",
                fontSize: '22px',
                fontWeight: 400,
                letterSpacing: '0.05em',
                padding: '10px'
              }}
              onClick={() => {
                setMenuOpen(false);
                scrollTo(id);
              }}
            >
              {label}
            </button>
          ))}
          <button
            className="mobile-menu-link"
            onClick={() => {
              setMenuOpen(false);
              onCotizarClick();
            }}
            style={{
              background: '#D4AF37',
              border: 'none',
              borderRadius: '50px',
              padding: '14px 38px',
              cursor: 'pointer',
              fontFamily: "'Figtree', sans-serif",
              color: '#0B0B0F',
              fontSize: '18px',
              fontWeight: 600,
              letterSpacing: '0.04em',
              marginTop: '10px',
              boxShadow: '0 8px 24px rgba(212,175,55,0.25)',
            }}
          >
            Cotizar
          </button>
        </div>
      )}
    </nav>);

}

Object.assign(window, { Navbar });