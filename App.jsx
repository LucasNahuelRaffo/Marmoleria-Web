const { useState, useEffect, useRef } = React;

const WA_NUMBER = '5491100000000';

function WhatsAppButton() {
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <a
      href={`https://wa.me/${WA_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Contactar por WhatsApp"
      style={{
        position: 'fixed',
        bottom: '28px',
        right: '24px',
        zIndex: 9999,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: hovered ? '#1ebe57' : '#25D366',
        boxShadow: hovered
          ? '0 8px 32px rgba(37,211,102,0.55), 0 2px 8px rgba(0,0,0,0.18)'
          : '0 4px 20px rgba(37,211,102,0.38), 0 2px 8px rgba(0,0,0,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none',
        transform: visible
          ? (hovered ? 'scale(1.1)' : 'scale(1)')
          : 'scale(0)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.25s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease, background 0.2s, box-shadow 0.2s',
      }}
    >
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15 2.5C8.096 2.5 2.5 8.096 2.5 15c0 2.198.592 4.258 1.625 6.031L2.5 27.5l6.656-1.594A12.432 12.432 0 0015 27.5c6.904 0 12.5-5.596 12.5-12.5S21.904 2.5 15 2.5z" fill="white"/>
        <path d="M21.094 17.938c-.313-.157-1.844-.906-2.131-1.01-.287-.104-.495-.156-.703.157-.208.312-.807 1.01-.989 1.218-.182.208-.364.234-.677.078-.312-.156-1.322-.487-2.518-1.553-.93-.83-1.558-1.855-1.74-2.168-.182-.312-.02-.48.137-.636.14-.14.312-.364.469-.547.156-.182.208-.312.312-.52.104-.209.052-.391-.026-.547-.078-.157-.703-1.693-.963-2.318-.254-.609-.51-.527-.703-.537-.182-.009-.39-.01-.599-.01-.208 0-.546.078-.832.39-.286.313-1.093 1.068-1.093 2.604 0 1.537 1.119 3.022 1.275 3.23.156.208 2.202 3.36 5.334 4.713.745.322 1.327.514 1.78.658.748.238 1.43.204 1.968.124.6-.09 1.844-.754 2.105-1.483.26-.729.26-1.353.182-1.484-.078-.13-.286-.208-.599-.364z" fill="#25D366"/>
      </svg>
    </a>
  );
}

const RUBROS = [
  { label: 'Marmolería',   icon: '◈' },
  { label: 'Iluminación',  icon: '◎' },
  { label: 'Muebles',      icon: '▣' },
  { label: 'Herrajes',     icon: '◆' },
];

function PersonalizaTodo({ onCotizarClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <section style={{
      background: 'linear-gradient(160deg, #0d0d11 0%, #0B0B0F 60%, #0e0c09 100%)',
      borderTop: '1px solid rgba(212,175,55,0.1)',
      borderBottom: '1px solid rgba(212,175,55,0.1)',
      padding: '88px 5.5%',
      textAlign: 'center',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Glow de fondo */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: '600px', height: '300px',
        background: 'radial-gradient(ellipse, rgba(212,175,55,0.07) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Eyebrow */}
        <p style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: '11px', fontWeight: 500,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: '#D4AF37', marginBottom: '20px',
        }}>Personalización completa</p>

        <h2 style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: 'clamp(28px, 5vw, 52px)', fontWeight: 300,
          color: '#F5F0E6', letterSpacing: '-0.02em',
          lineHeight: 1.1, marginBottom: '18px',
        }}>
          Diseñá cada rincón<br />
          <span style={{ fontWeight: 700 }}>de tu hogar</span>
        </h2>

        <p style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: '16px', fontWeight: 400,
          color: 'rgba(245,240,230,0.55)',
          maxWidth: '480px', margin: '0 auto 40px',
          lineHeight: 1.65,
        }}>
          Combiná materiales, herrajes, iluminación y muebles en una sola experiencia de diseño.
        </p>

        {/* Chips de rubros */}
        <div style={{
          display: 'flex', flexWrap: 'wrap',
          justifyContent: 'center', gap: '10px',
          marginBottom: '44px',
        }}>
          {RUBROS.map(r => (
            <span key={r.label} style={{
              display: 'inline-flex', alignItems: 'center', gap: '7px',
              background: 'rgba(212,175,55,0.07)',
              border: '1px solid rgba(212,175,55,0.2)',
              borderRadius: '50px',
              padding: '7px 16px',
              fontFamily: "'Figtree', sans-serif",
              fontSize: '12px', fontWeight: 500,
              color: 'rgba(245,240,230,0.7)',
              letterSpacing: '0.04em',
            }}>
              <span style={{ color: '#D4AF37', fontSize: '11px' }}>{r.icon}</span>
              {r.label}
            </span>
          ))}
        </div>

        {/* CTA */}
        <button
          onClick={onCotizarClick}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          style={{
            background: hovered ? '#D4AF37' : 'transparent',
            color: hovered ? '#0B0B0F' : '#D4AF37',
            border: '1.5px solid #D4AF37',
            borderRadius: '4px',
            padding: '16px 44px',
            cursor: 'pointer',
            fontFamily: "'Figtree', sans-serif",
            fontSize: '13px', fontWeight: 600,
            letterSpacing: '0.12em', textTransform: 'uppercase',
            transition: 'background 0.25s, color 0.25s',
          }}
        >
          Empezar a personalizar →
        </button>
      </div>
    </section>
  );
}

function App() {
  const [cotizadorOpen, setCotizadorOpen] = useState(false);
  const [cotizadorContext, setCotizadorContext] = useState('all');
  const [cotizadorView, setCotizadorView] = useState('images');
  const [infoSection, setInfoSection] = useState(null);

  // view: 'images' (cards del hero, navbar, footer, info) | '3d' (sección "Diseñá cada rincón")
  const openCotizador = (context = 'all', view = 'images') => {
    setInfoSection(null);
    setCotizadorContext(context || 'all');
    setCotizadorView(view || 'images');
    setCotizadorOpen(true);
  };

  const closeCotizador = () => setCotizadorOpen(false);

  const openInfo = (section) => setInfoSection(section);
  const closeInfo = () => setInfoSection(null);

  const handleVerMas = (sectionId) => {
    const el = document.getElementById(sectionId);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  // Lock scroll when any modal is open
  useEffect(() => {
    if (cotizadorOpen || infoSection) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [cotizadorOpen, infoSection]);

  return (
    React.createElement(React.Fragment, null,
      React.createElement(Navbar, { onCotizarClick: () => openCotizador('all') }),
      React.createElement(HeroSection, {
        onCardClick: openCotizador,
        onVerMasClick: handleVerMas,
      }),
      React.createElement(AboutSection, null),
      React.createElement(InfoSections, { onInfoClick: openInfo }),
      React.createElement(PersonalizaTodo, { onCotizarClick: () => openCotizador('all', '3d') }),
      React.createElement(Footer, { onCotizarClick: () => openCotizador('all') }),
      cotizadorOpen && React.createElement(CotizadorModal, {
        context: cotizadorContext,
        view: cotizadorView,
        onClose: closeCotizador,
      }),
      infoSection && React.createElement(InfoModal, {
        section: infoSection,
        onClose: closeInfo,
        onCotizar: openCotizador,
      }),
      React.createElement(WhatsAppButton, null)
    )
  );
}

const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(React.createElement(App));
