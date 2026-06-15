const { useState, useEffect } = React;

function Navbar({ onCotizarClick }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handle = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', handle);
    return () => window.removeEventListener('scroll', handle);
  }, []);

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
      background: scrolled ?
      'rgba(11,9,6,0.88)' :
      'transparent',
      backdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
      WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'blur(0px)',
      borderBottom: scrolled ? '1px solid rgba(255,255,255,0.07)' : '1px solid transparent',
      transition: 'background 0.5s, backdrop-filter 0.5s, border-color 0.5s'
    }}>
      {/* Brand */}
      <div style={{
        fontFamily: "'Figtree', sans-serif",
        fontSize: '21px',
        letterSpacing: '0.18em',
        userSelect: 'none', fontWeight: "400", color: "rgb(218, 218, 218)"
      }}>
        MARMOLERÍA
      </div>

      {/* Center links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '38px' }}>
        {[['Inicio', 'hero'], ['Sobre Nosotros', 'about'], ['Contacto', 'contact']].map(([label, id]) =>
        <button key={id} style={navLink}
        onClick={() => scrollTo(id)}
        onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(245,240,230,0.82)'}>
          {label}</button>
        )}
      </div>

      {/* Cotizar pill */}
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
    </nav>);

}

Object.assign(window, { Navbar });