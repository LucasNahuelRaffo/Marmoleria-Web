const { useState, useEffect } = React;

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
      })
    )
  );
}

const rootEl = document.getElementById('root');
ReactDOM.createRoot(rootEl).render(React.createElement(App));
