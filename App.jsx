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

function App() {
  const [cotizadorOpen, setCotizadorOpen] = useState(false);
  const [cotizadorContext, setCotizadorContext] = useState('all');
  const [infoSection, setInfoSection] = useState(null);

  const openCotizador = (context = 'all') => {
    setInfoSection(null);
    setCotizadorContext(context || 'all');
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
      React.createElement(Footer, { onCotizarClick: () => openCotizador('all') }),
      cotizadorOpen && React.createElement(CotizadorModal, {
        context: cotizadorContext,
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
