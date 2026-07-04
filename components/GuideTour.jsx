const { useState, useEffect, useRef } = React;

const GUIDE_KEY = 'marmoleria_guide_seen';

const GUIDE_STEPS = [
  {
    target: null,
    title: '¡Bienvenido! 👋',
    text: 'Te mostramos en 30 segundos cómo aprovechar la página: explorar los productos, ver los detalles de cada servicio y cotizar tu proyecto.',
  },
  {
    target: 'hero-cards', scroll: true,
    title: 'Nuestros rubros',
    text: 'Estas son nuestras categorías: marmolería, electricidad, muebles y herrajes. Tocá cualquier tarjeta para armar tu proyecto con productos de esa categoría.',
  },
  {
    target: 'ver-detalles', scroll: true,
    title: '¿Querés saber más de los productos?',
    text: 'Tocá "Ver detalles" en cualquier tarjeta para conocer toda la info del servicio: qué incluye, materiales y garantía.',
  },
  {
    target: 'personalizar', scroll: true,
    title: '¿Querés cotizar tu pedido?',
    text: 'Tocá acá y combiná mármoles, muebles, herrajes e iluminación en un solo proyecto. Elegís con fotos, paso a paso, y al final nos mandás la consulta.',
  },
  {
    target: 'nav-cotizar',
    title: 'Cotizá cuando quieras',
    text: 'Este botón está siempre visible arriba: podés abrir el cotizador en cualquier momento, desde cualquier parte de la página.',
  },
  {
    target: 'whatsapp',
    title: '¿Dudas? Escribinos',
    text: 'Si preferís hablar directo con nosotros, tocá el botón de WhatsApp y te respondemos a la brevedad.',
  },
];

function GuideTour({ hidden }) {
  const [active,  setActive]  = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect,    setRect]    = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const rafRef = useRef(null);

  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onR);
    return () => window.removeEventListener('resize', onR);
  }, []);

  // Auto-inicio en la primera visita. Se marca como vista apenas arranca,
  // así nunca se relanza sola (aunque el usuario la abandone a mitad).
  useEffect(() => {
    if (localStorage.getItem(GUIDE_KEY)) return;
    const t = setTimeout(() => {
      localStorage.setItem(GUIDE_KEY, '1');
      setStepIdx(0);
      setActive(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  // Si se abre un modal (cotizador / info), la guía se cierra: el usuario ya
  // está interactuando con lo que le señalamos.
  useEffect(() => { if (hidden && active) setActive(false); }, [hidden, active]);

  const getTargetEl = (idx) => {
    const step = GUIDE_STEPS[idx];
    if (!step || !step.target) return null;
    return document.querySelector(`[data-guide="${step.target}"]`);
  };

  const isStepValid = (idx) => {
    const step = GUIDE_STEPS[idx];
    if (!step) return false;
    if (!step.target) return true;
    const el = getTargetEl(idx);
    if (!el) return false;
    const r = el.getBoundingClientRect();
    return r.width > 4 && r.height > 4;
  };

  // Busca el próximo paso mostrable en la dirección dada (saltea targets
  // inexistentes u ocultos, ej. el botón Cotizar del navbar en mobile).
  const goToStep = (from, dir) => {
    let idx = from;
    while (idx >= 0 && idx < GUIDE_STEPS.length && !isStepValid(idx)) idx += dir;
    if (idx < 0) return;
    if (idx >= GUIDE_STEPS.length) { setActive(false); return; }

    const step = GUIDE_STEPS[idx];
    if (step.scroll) {
      const el = getTargetEl(idx);
      if (el) {
        const top = el.getBoundingClientRect().top + window.scrollY - 150;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      }
    }
    setRect(null);
    setStepIdx(idx);
  };

  // Mide el rect del target continuamente mientras la guía está activa
  // (cubre el scroll suave, resize y cualquier reflow sin timeouts frágiles).
  useEffect(() => {
    if (!active) return;
    const measure = () => {
      const el = getTargetEl(stepIdx);
      if (el) {
        const r = el.getBoundingClientRect();
        setRect(prev => {
          if (prev && Math.abs(prev.top - r.top) < 1 && Math.abs(prev.left - r.left) < 1 &&
              Math.abs(prev.width - r.width) < 1 && Math.abs(prev.height - r.height) < 1) return prev;
          return { top: r.top, left: r.left, width: r.width, height: r.height };
        });
      } else {
        setRect(null);
      }
      rafRef.current = requestAnimationFrame(measure);
    };
    rafRef.current = requestAnimationFrame(measure);
    return () => cancelAnimationFrame(rafRef.current);
  }, [active, stepIdx]);

  const launch = () => {
    localStorage.setItem(GUIDE_KEY, '1');
    setStepIdx(0);
    setActive(true);
  };

  const step = GUIDE_STEPS[stepIdx];
  const isLast = !GUIDE_STEPS.slice(stepIdx + 1).some((_, i) => isStepValid(stepIdx + 1 + i));

  /* ── Estilos compartidos ── */
  const fontFam = "'Figtree', sans-serif";
  const btnPrimary = {
    background: '#D4AF37', color: '#0B0B0F', border: 'none', borderRadius: '50px',
    padding: '9px 22px', cursor: 'pointer', fontFamily: fontFam,
    fontSize: '12px', fontWeight: 700, letterSpacing: '0.06em',
  };
  const btnGhost = {
    background: 'none', border: '1px solid rgba(245,240,230,0.25)', borderRadius: '50px',
    padding: '9px 18px', cursor: 'pointer', color: 'rgba(245,240,230,0.7)',
    fontFamily: fontFam, fontSize: '12px', fontWeight: 500,
  };

  /* ── Posición del tooltip ── */
  let tooltipStyle = null;
  if (active && step) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const w = Math.min(360, vw - 32);
    if (!step.target || !rect) {
      tooltipStyle = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: w, zIndex: 10001 };
    } else {
      const below = rect.top + rect.height + 190 < vh;
      const left = Math.min(Math.max(16, rect.left + rect.width / 2 - w / 2), vw - w - 16);
      tooltipStyle = below
        ? { position: 'fixed', top: Math.min(rect.top + rect.height + 16, vh - 180), left, width: w, zIndex: 10001 }
        : { position: 'fixed', bottom: Math.min(vh - rect.top + 16, vh - 100), left, width: w, zIndex: 10001 };
    }
  }

  return (
    <>
      {/* Botón flotante de ayuda (oculto durante el tour o con modales abiertos) */}
      {!hidden && !active && (
        <button
          onClick={launch}
          aria-label="Ver guía de uso de la página"
          title="¿Necesitás ayuda?"
          style={{
            position: 'fixed', bottom: '96px', right: '24px', zIndex: 9998,
            width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
            background: 'rgba(11,11,15,0.85)', backdropFilter: 'blur(8px)',
            border: '1.5px solid rgba(212,175,55,0.55)', color: '#D4AF37',
            fontFamily: fontFam, fontSize: '19px', fontWeight: 700, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: 'border-color 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.55)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >?</button>
      )}

      {/* Tour activo */}
      {!hidden && active && step && (
        <>
          {/* Backdrop: si hay target, el recorte del spotlight lo ilumina;
              si no (bienvenida), oscurece todo */}
          {step.target && rect ? (
            <div style={{
              position: 'fixed',
              top: rect.top - 7, left: rect.left - 7,
              width: rect.width + 14, height: rect.height + 14,
              borderRadius: '16px', zIndex: 10000, pointerEvents: 'none',
              boxShadow: '0 0 0 9999px rgba(4,3,2,0.72)',
            }}>
              {/* Borde con pulso dorado sobre el recorte */}
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '16px',
                border: '2px solid rgba(212,175,55,0.9)',
                animation: 'guidePulse 1.6s ease-in-out infinite',
              }} />
            </div>
          ) : (
            <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,3,2,0.72)', zIndex: 10000, pointerEvents: 'none' }} />
          )}

          {/* Burbuja del paso */}
          <div style={{
            ...tooltipStyle,
            background: '#12100C',
            border: '1px solid rgba(212,175,55,0.35)',
            borderRadius: '16px',
            padding: '20px 22px 16px',
            boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
            animation: 'fadein 0.3s ease',
          }}>
            <p style={{
              fontFamily: fontFam, fontSize: '9px', letterSpacing: '0.18em',
              textTransform: 'uppercase', color: '#D4AF37', marginBottom: '8px',
            }}>Guía · {stepIdx + 1}/{GUIDE_STEPS.length}</p>
            <h4 style={{
              fontFamily: fontFam, fontSize: '17px', fontWeight: 700,
              color: '#F5F0E6', marginBottom: '8px', letterSpacing: '-0.01em',
            }}>{step.title}</h4>
            <p style={{
              fontFamily: fontFam, fontSize: '13px', lineHeight: 1.65,
              color: 'rgba(245,240,230,0.65)', marginBottom: '16px',
            }}>{step.text}</p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {stepIdx > 0 && (
                <button style={btnGhost} onClick={() => goToStep(stepIdx - 1, -1)}>← Anterior</button>
              )}
              <button style={btnPrimary} onClick={() => isLast ? setActive(false) : goToStep(stepIdx + 1, 1)}>
                {isLast ? '¡Entendido!' : 'Siguiente →'}
              </button>
              <button
                onClick={() => setActive(false)}
                style={{
                  marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: fontFam, fontSize: '11px', color: 'rgba(245,240,230,0.35)',
                  textDecoration: 'underline', padding: '4px',
                }}>
                Saltar guía
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

Object.assign(window, { GuideTour });
