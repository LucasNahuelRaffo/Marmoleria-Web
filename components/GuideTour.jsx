const { useState, useEffect, useRef } = React;

const GUIDE_KEY = 'homeconnect_guide_seen_v2';

const GUIDE_STEPS = [
  {
    target: null,
    title: '¡Bienvenido! 👋',
    text: 'Te mostramos en 30 segundos cómo aprovechar la página: explorá los rubros, mirá el detalle de cada servicio, armá tu cotización y hablá con un asesor.',
  },
  {
    target: 'hero-cards', scroll: true,
    title: 'Nuestros rubros',
    text: 'Estas son nuestras líneas: marmolería, muebles, herrajes e iluminación. Tocá cualquier tarjeta para armar tu proyecto con productos de esa categoría.',
  },
  {
    target: 'ver-detalles', scroll: true,
    title: '¿Querés saber más de los productos?',
    text: 'Tocá "Ver detalles" en cualquier tarjeta para conocer toda la info del servicio: qué incluye, materiales y tiempos.',
  },
  {
    target: 'personalizar', scroll: true,
    title: '¿Querés cotizar tu pedido?',
    text: 'Tocá acá y combiná mármoles, muebles, herrajes e iluminación en un solo proyecto. Elegís con fotos, paso a paso, y al final nos mandás la consulta.',
  },
  {
    target: 'nav-cotizar',
    title: 'Hablá con un asesor',
    text: 'Arriba a la derecha tenés este botón: te comunica directo por WhatsApp con un asesor para resolver dudas o pedir tu presupuesto.',
  },
  {
    target: 'whatsapp',
    title: '¿Dudas? Escribinos',
    text: 'Este botón de WhatsApp está siempre visible: tocalo cuando quieras y te respondemos a la brevedad.',
  },
];

/* ── Motor genérico del tour (spotlight + burbuja) ──────────────────────────
   Reutilizable: la guía de la página y la del cotizador definen sus propios
   pasos y montan este componente. `pageScroll` indica si los pasos scrollean
   la ventana (página) o su contenedor más cercano (modales). */
function SpotlightTour({ steps, active, onEnd, pageScroll }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [rect,    setRect]    = useState(null);
  const rafRef = useRef(null);

  // Reiniciar al (re)activarse
  useEffect(() => { if (active) { setStepIdx(0); setRect(null); } }, [active]);

  const getTargetEl = (idx) => {
    const step = steps[idx];
    if (!step || !step.target) return null;
    return document.querySelector(`[data-guide="${step.target}"]`);
  };

  const isStepValid = (idx) => {
    const step = steps[idx];
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
    while (idx >= 0 && idx < steps.length && !isStepValid(idx)) idx += dir;
    if (idx < 0) return;
    if (idx >= steps.length) { onEnd(); return; }

    const step = steps[idx];
    if (step.scroll) {
      const el = getTargetEl(idx);
      if (el) {
        if (pageScroll) {
          const top = el.getBoundingClientRect().top + window.scrollY - 150;
          window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
        } else {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
    setRect(null);
    setStepIdx(idx);
  };

  // Mide el rect del target continuamente mientras el tour está activo
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

  if (!active) return null;
  const step = steps[stepIdx];
  if (!step) return null;
  const isLast = !steps.slice(stepIdx + 1).some((_, i) => isStepValid(stepIdx + 1 + i));

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

  /* Posición de la burbuja: abajo → arriba → costado → centrada.
     Los targets muy altos (paneles enteros) no dejan lugar ni arriba ni
     abajo; ahí la burbuja va al costado con más espacio, y si tampoco hay
     (mobile, targets de ancho completo) queda centrada en pantalla. */
  const vw = window.innerWidth, vh = window.innerHeight;
  const w = Math.min(360, vw - 32);
  const EST_H = 215; // alto estimado de la burbuja
  const centered = { position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: w, zIndex: 10001 };
  let tooltipStyle;
  if (!step.target || !rect) {
    tooltipStyle = centered;
  } else {
    const spaceBelow = vh - (rect.top + rect.height);
    const spaceAbove = rect.top;
    const spaceLeft  = rect.left;
    const spaceRight = vw - (rect.left + rect.width);
    const clampLeft  = Math.min(Math.max(16, rect.left + rect.width / 2 - w / 2), vw - w - 16);
    if (spaceBelow >= EST_H + 30) {
      tooltipStyle = { position: 'fixed', top: rect.top + rect.height + 16, left: clampLeft, width: w, zIndex: 10001 };
    } else if (spaceAbove >= EST_H + 30) {
      tooltipStyle = { position: 'fixed', bottom: vh - rect.top + 16, left: clampLeft, width: w, zIndex: 10001 };
    } else if (spaceLeft >= w + 32 || spaceRight >= w + 32) {
      const left = spaceLeft >= spaceRight ? rect.left - w - 16 : rect.left + rect.width + 16;
      const top = Math.max(16, Math.min(rect.top + 16, vh - EST_H - 16));
      tooltipStyle = { position: 'fixed', top, left, width: w, zIndex: 10001 };
    } else {
      tooltipStyle = centered;
    }
  }

  return (
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
        }}>Guía · {stepIdx + 1}/{steps.length}</p>
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
          <button style={btnPrimary} onClick={() => isLast ? onEnd() : goToStep(stepIdx + 1, 1)}>
            {isLast ? '¡Entendido!' : 'Siguiente →'}
          </button>
          <button
            onClick={onEnd}
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
  );
}

/* ── Guía de la página principal ────────────────────────────────────────── */
function GuideTour({ hidden }) {
  const [active, setActive] = useState(false);

  // Auto-inicio en la primera visita. Se marca como vista apenas arranca,
  // así nunca se relanza sola (aunque el usuario la abandone a mitad).
  useEffect(() => {
    if (localStorage.getItem(GUIDE_KEY)) return;
    const t = setTimeout(() => {
      localStorage.setItem(GUIDE_KEY, '1');
      setActive(true);
    }, 2500);
    return () => clearTimeout(t);
  }, []);

  // Si se abre un modal (cotizador / info), la guía se cierra: el usuario ya
  // está interactuando con lo que le señalamos.
  useEffect(() => { if (hidden && active) setActive(false); }, [hidden, active]);

  const launch = () => {
    localStorage.setItem(GUIDE_KEY, '1');
    setActive(true);
  };

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
            fontFamily: "'Figtree', sans-serif", fontSize: '19px', fontWeight: 700, lineHeight: 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            transition: 'border-color 0.2s, transform 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.transform = 'scale(1.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.55)'; e.currentTarget.style.transform = 'scale(1)'; }}
        >?</button>
      )}

      <SpotlightTour
        steps={GUIDE_STEPS}
        active={!hidden && active}
        onEnd={() => setActive(false)}
        pageScroll
      />
    </>
  );
}

Object.assign(window, { GuideTour, SpotlightTour });
