const { useState, useEffect } = React;

const SURF_TABS = [
  { key: 'marmoles',  label: 'Mármoles'  },
  { key: 'granitos',  label: 'Granitos'  },
  { key: 'purastone', label: 'Purastone' },
];

const MBL_TABS = [
  { key: 'cocinas',   label: 'Cocinas'   },
  { key: 'vanitorys', label: 'Vanitorys' },
  { key: 'living',    label: 'Living/TV' },
];

const COT_GUIDE_KEY = 'marmoleria_cotizador_guide_seen';

const COT_TOUR_STEPS = [
  {
    target: null,
    title: 'Armá tu proyecto 🛠️',
    text: 'Este es el cotizador: elegí los productos que te gusten de cada categoría y al final envianos la consulta. Te mostramos cómo funciona.',
  },
  {
    target: 'cot-slots', scroll: true,
    title: 'Las categorías',
    text: 'Superficie, Muebles, Herrajes e Iluminación. Tocá cada una para desplegarla y ver todos sus productos.',
  },
  {
    target: 'cot-swatches', scroll: true,
    title: 'Elegí tus productos',
    text: 'Tocá los que te gusten para agregarlos al proyecto — podés elegir varios, se marcan con un tilde dorado. Tocalos de nuevo para quitarlos.',
  },
  {
    target: 'cot-preview', scroll: true,
    title: 'Vista previa',
    text: 'Acá ves en grande el último producto que agregaste, con su foto en ambiente real.',
  },
  {
    target: 'cot-cta', scroll: true,
    title: '¿Listo? Cotizá tu proyecto',
    text: 'Cuando hayas elegido todo, tocá este botón, completá tus datos y te enviamos la cotización.',
  },
];

/* ── Componentes auxiliares (nivel módulo, sin remount) ─────────────────── */

function SubTabs({ tabs, active, onChange, isMobile }) {
  return (
    <div style={{ display: 'flex', gap: isMobile ? '6px' : '4px', padding: isMobile ? '12px 14px 0' : '10px 14px 0', flexWrap: 'wrap' }}>
      {tabs.map(t => {
        const isA = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{
            background: isA ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.06)',
            border: `1px solid ${isA ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.12)'}`,
            borderRadius: '50px', color: isA ? '#D4AF37' : 'rgba(245,240,230,0.75)',
            padding: isMobile ? '7px 15px' : '5px 12px', cursor: 'pointer',
            fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '12px' : '10px',
            fontWeight: isA ? 700 : 500, letterSpacing: '0.06em', transition: 'all 0.15s',
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

function SwatchGrid({ items, selectedIds, activeId, onPick, isMobile }) {
  const sz = isMobile ? '62px' : '56px';
  return (
    <div data-guide="cot-swatches" style={{
      display: 'grid',
      gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(76px, 1fr))' : 'repeat(auto-fill, minmax(64px, 1fr))',
      gap: isMobile ? '14px' : '10px', padding: '14px',
    }}>
      {items.map(item => {
        const isSel = selectedIds.includes(item.id);
        const isActive = activeId === item.id;
        return (
          <div key={item.id}
            onClick={() => onPick(item)}
            style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{ width: sz, height: sz, margin: '0 auto 6px', position: 'relative' }}>
              <div style={{
                width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden',
                border: `${isActive ? '2.5px' : '2px'} solid ${isActive ? '#D4AF37' : isSel ? 'rgba(212,175,55,0.55)' : 'rgba(255,255,255,0.14)'}`,
                transform: isActive ? 'scale(1.1)' : 'scale(1)',
                boxShadow: isActive ? '0 0 0 3px rgba(212,175,55,0.2)' : 'none',
                transition: 'all 0.18s',
              }}>
                <img src={item.img} alt={item.name} loading="lazy"
                  style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
              </div>
              {isSel && (
                <div style={{
                  position: 'absolute', bottom: '-4px', right: '-4px', width: isMobile ? '20px' : '18px', height: isMobile ? '20px' : '18px',
                  borderRadius: '50%', background: '#D4AF37', border: '2px solid #0F0F13',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '9px', color: '#0B0B0F', fontWeight: 700, lineHeight: 1, zIndex: 1,
                }}>✓</div>
              )}
            </div>
            <p style={{
              fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '11.5px' : '9px', lineHeight: 1.3,
              color: isSel ? '#D4AF37' : 'rgba(245,240,230,0.78)', fontWeight: isSel ? 700 : 500,
            }}>{item.name}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */

function CotizadorModal({ context = 'all', onClose }) {
  const initSlot = context === 'muebles'      ? 'mueble'
                 : context === 'herrajes'     ? 'herraje'
                 : context === 'electricidad' ? 'ilum'
                 : 'surf';

  // Cada categoría admite ahora más de un producto seleccionado (multi-selección).
  const [surface,  setSurface]  = useState([]); // [{ tabKey, item }]
  const [surfTab,  setSurfTab]  = useState('marmoles');
  const [mueble,   setMueble]   = useState([]); // [item]
  const [mblTab,   setMblTab]   = useState('cocinas');
  const [herraje,  setHerraje]  = useState([]); // [item]
  const [ilum,     setIlum]     = useState([]); // [item]
  const [openSlot, setOpenSlot] = useState(initSlot);
  const [step,     setStep]     = useState('select');
  const [form,     setForm]     = useState({ nombre: '', telefono: '', email: '', metros: '', descripcion: '' });
  const [sent,     setSent]     = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showCart, setShowCart] = useState(false);
  const [tourActive, setTourActive] = useState(false);

  // Guía del cotizador: arranca sola la primera vez que se abre el modal
  // (recordado en localStorage); el botón "?" del header la relanza.
  useEffect(() => {
    if (localStorage.getItem(COT_GUIDE_KEY)) return;
    const t = setTimeout(() => {
      localStorage.setItem(COT_GUIDE_KEY, '1');
      setTourActive(true);
    }, 900);
    return () => clearTimeout(t);
  }, []);

  // Si el usuario avanza al formulario, la guía ya no aplica
  useEffect(() => { if (step !== 'select') setTourActive(false); }, [step]);

  // El panel grande / la escena 3D muestran el último producto tocado dentro
  // de cada categoría (el resto queda igual de seleccionado, solo cambia cuál
  // se previsualiza en grande).
  const activeSurfaceEntry = surface[surface.length - 1] || null; // { tabKey, item }
  const activeMueble       = mueble[mueble.length - 1]   || null;
  const activeHerraje      = herraje[herraje.length - 1] || null;
  const activeIlum         = ilum[ilum.length - 1]       || null;

  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onR);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('resize', onR); document.body.style.overflow = ''; };
  }, []);

  const D        = window.MATERIALS_DATA;
  const surfItems = D[surfTab]      || [];
  const mblItems  = D[mblTab]      || [];
  const hrjItems  = D.herrajes     || [];
  const ilmItems  = D.iluminacion  || [];

  const totalSel = surface.length + mueble.length + herraje.length + ilum.length;
  const toggle   = (id) => setOpenSlot(p => p === id ? null : id);

  // Click en un swatch = agregar/quitar del proyecto (multi-selección)
  const pickSurf = (item) => {
    setSurface(prev => prev.some(s => s.item.id === item.id)
      ? prev.filter(s => s.item.id !== item.id)
      : [...prev, { tabKey: surfTab, item }]);
  };
  const toggleMueble  = (item) => setMueble(prev  => prev.some(m => m.id === item.id) ? prev.filter(m => m.id !== item.id) : [...prev, item]);
  const toggleHerraje = (item) => setHerraje(prev => prev.some(h => h.id === item.id) ? prev.filter(h => h.id !== item.id) : [...prev, item]);
  const toggleIlum    = (item) => setIlum(prev    => prev.some(i => i.id === item.id) ? prev.filter(i => i.id !== item.id) : [...prev, item]);

  const sInput = {
    width: '100%', background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(212,175,55,0.2)', borderRadius: '2px',
    padding: '11px 14px', color: '#F5F0E6',
    fontFamily: "'Figtree', sans-serif", fontSize: '14px', outline: 'none',
    transition: 'border-color 0.2s',
  };
  const sLabel = {
    display: 'block', fontFamily: "'Figtree', sans-serif",
    fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'rgba(245,240,230,0.4)', marginBottom: '7px',
  };

  const selSummary = [
    ...surface.map(s => ({ key: 'surf-' + s.item.id,     label: 'Superficie',  item: s.item })),
    ...mueble.map(item => ({ key: 'mueble-' + item.id,   label: 'Mueble',      item })),
    ...herraje.map(item => ({ key: 'herraje-' + item.id, label: 'Herraje',     item })),
    ...ilum.map(item => ({ key: 'ilum-' + item.id,       label: 'Iluminación', item })),
  ];

  const slotHeader = (id, icon, label, arr) => {
    const open     = openSlot === id;
    const count    = arr.length;
    const hasSel   = count > 0;
    const selItem  = arr[count - 1];
    return (
      <button onClick={() => toggle(id)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '12px',
        background: hasSel ? 'rgba(212,175,55,0.05)' : open ? 'rgba(255,255,255,0.02)' : 'transparent',
        border: 'none', borderBottom: '1px solid rgba(212,175,55,0.08)',
        padding: isMobile ? '13px 14px' : '15px 20px',
        cursor: 'pointer', transition: 'background 0.2s', textAlign: 'left',
      }}>
        <span style={{ fontSize: '15px', color: hasSel ? '#D4AF37' : 'rgba(245,240,230,0.22)', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{
            fontFamily: "'Figtree', sans-serif", fontSize: '11px', letterSpacing: '0.1em',
            textTransform: 'uppercase', fontWeight: 600, margin: 0,
            color: hasSel ? '#D4AF37' : 'rgba(245,240,230,0.5)',
            marginBottom: hasSel ? '2px' : 0,
          }}>{label}</p>
          <p style={{
            fontFamily: "'Figtree', sans-serif", margin: 0,
            fontSize: hasSel ? '13px' : '11px',
            color: hasSel ? '#F5F0E6' : 'rgba(245,240,230,0.2)',
            fontWeight: hasSel ? 600 : 400,
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>{hasSel ? (count === 1 ? selItem.name : `${count} productos seleccionados`) : 'Sin seleccionar'}</p>
        </div>
        {hasSel && (
          <div style={{ width: '34px', height: '34px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid rgba(212,175,55,0.4)', flexShrink: 0 }}>
            <img src={selItem.img} alt={selItem.name} style={{ width: '100%', height: '100%', objectFit: selItem.fit || 'cover' }} />
          </div>
        )}
        <span style={{
          color: 'rgba(245,240,230,0.22)', fontSize: '9px', flexShrink: 0,
          display: 'inline-block', transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>▼</span>
      </button>
    );
  };

  // El panel grande sigue la sección que el usuario tiene abierta; si cerró
  // todos los acordeones, muestra la última selección disponible (para no
  // perder de vista lo elegido al agregar más de un elemento al proyecto).
  const currentFocus = ['herraje', 'ilum', 'mueble', 'surf'].includes(openSlot)
    ? openSlot
    : (herraje.length ? 'herraje' : ilum.length ? 'ilum' : mueble.length ? 'mueble' : surface.length ? 'surf' : null);

  const isHerrajeView = currentFocus === 'herraje';
  const isIlumView = currentFocus === 'ilum';
  const isMuebleView = currentFocus === 'mueble';
  const envItem = isHerrajeView ? activeHerraje : isIlumView ? activeIlum : isMuebleView ? activeMueble : activeSurfaceEntry?.item;
  const colorList  = envItem?.colors;
  const activeColor = colorList ? colorList[colorIdx % colorList.length] : null;
  const envImg  = envItem ? (activeColor?.mesa || envItem.mesa || envItem.img) : null;

  // Resetear el color activo cuando cambia el item mostrado
  useEffect(() => { setColorIdx(0); }, [envItem?.id]);

  /* ── Render ─────────────────────────────────────────────────────────────── */
  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(11,11,15,0.92)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: isMobile ? '8px' : '16px' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: '#0F0F13', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '8px', width: '100%', maxWidth: '1100px', height: isMobile ? '92dvh' : '700px', maxHeight: '94dvh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: isMobile ? '14px 18px' : '16px 26px', borderBottom: '1px solid rgba(212,175,55,0.1)', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '17px' : '22px', fontWeight: 600, color: '#F5F0E6', letterSpacing: '-0.01em' }}>Armá tu proyecto</h2>
            <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', color: 'rgba(245,240,230,0.4)', marginTop: '2px' }}>
              {step === 'select'
                ? (totalSel > 0 ? `${totalSel} elemento${totalSel !== 1 ? 's' : ''} seleccionado${totalSel !== 1 ? 's' : ''}` : 'Personalizá cada elemento de tu espacio')
                : 'Completá tus datos y te cotizamos'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
            {step === 'select' && (
              <button onClick={() => setTourActive(true)}
                aria-label="Ver guía del cotizador"
                title="¿Cómo funciona?"
                style={{ background: 'none', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: 'rgba(212,175,55,0.7)', fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, border-color 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.borderColor = '#D4AF37'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(212,175,55,0.7)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; }}>
                ?
              </button>
            )}
            <button onClick={onClose}
              style={{ background: 'none', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: 'rgba(245,240,230,0.5)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, border-color 0.2s', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.borderColor = '#D4AF37'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,230,0.5)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; }}>
              ✕
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, overflow: isMobile ? 'auto' : 'hidden', overscrollBehavior: isMobile ? 'contain' : 'auto', minHeight: 0 }}>

          {/* SUCCESS */}
          {sent ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', border: '2px solid #D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#D4AF37', marginBottom: '24px' }}>✓</div>
              <h3 style={{ fontFamily: "'Figtree', sans-serif", fontSize: '28px', fontWeight: 600, color: '#F5F0E6', marginBottom: '10px' }}>Te abrimos WhatsApp</h3>
              <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '14px', color: 'rgba(245,240,230,0.55)', lineHeight: 1.7, maxWidth: '400px' }}>Te preparamos el mensaje con tu proyecto cargado. Solo tenés que <strong style={{ color: '#D4AF37', fontWeight: 600 }}>enviarlo</strong> y te respondemos a la brevedad. ¿No se abrió? Revisá que no se haya bloqueado la ventana emergente.</p>
              <button onClick={onClose} style={{ marginTop: '32px', background: '#D4AF37', color: '#0B0B0F', border: 'none', borderRadius: '4px', padding: '12px 36px', cursor: 'pointer', fontFamily: "'Figtree', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em' }}>Cerrar</button>
            </div>

          /* FORM */
          ) : step === 'form' ? (
            <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '20px 16px' : '36px 48px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '600px' }}>
                <button onClick={() => setStep('select')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4AF37', fontFamily: "'Figtree', sans-serif", fontSize: '12px', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>
                  ← Volver al configurador
                </button>

                {selSummary.length > 0 && (
                  <div style={{ marginBottom: '28px' }}>
                    <p style={{ ...sLabel, marginBottom: '12px' }}>Tu selección ({selSummary.length} elemento{selSummary.length !== 1 ? 's' : ''})</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {selSummary.map(({ key, label, item }) => (
                        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '8px 12px', maxWidth: '200px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(212,175,55,0.4)' }}>
                            <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
                          </div>
                          <div>
                            <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', color: '#D4AF37', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>{label}</p>
                            <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '12px', fontWeight: 600, color: '#F5F0E6', lineHeight: 1.2 }}>{item.name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <form onSubmit={e => {
                  e.preventDefault();
                  const lines = [
                    '¡Hola HOMECONNECT! Quiero cotizar mi proyecto.',
                    '',
                    '*Mis datos:*',
                    `• Nombre: ${form.nombre}`,
                    `• Teléfono: ${form.telefono}`,
                    `• Email: ${form.email}`,
                    `• Metros² aprox.: ${form.metros}`,
                  ];
                  if (selSummary.length) {
                    lines.push('', `*Productos seleccionados (${selSummary.length}):*`);
                    selSummary.forEach(({ label, item }) => lines.push(`• ${label}: ${item.name}`));
                  }
                  if (form.descripcion.trim()) {
                    lines.push('', '*Descripción del proyecto:*', form.descripcion.trim());
                  }
                  lines.push('', 'Leí y acepté los Términos y Condiciones ✔');
                  const num = window.WA_NUMBER || '5491125062187';
                  window.open(`https://wa.me/${num}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener,noreferrer');
                  setSent(true);
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px' }}>
                    {[
                      { key: 'nombre',   label: 'Nombre completo',         placeholder: 'Tu nombre',         type: 'text',  full: false },
                      { key: 'telefono', label: 'Teléfono',                placeholder: '+54 11 0000-0000',  type: 'tel',   full: false },
                      { key: 'email',    label: 'Email',                   placeholder: 'email@ejemplo.com', type: 'email', full: true  },
                      { key: 'metros',   label: 'Metros cuadrados aprox.', placeholder: 'Ej: 4.5 m²',       type: 'text',  full: false },
                    ].map(f => (
                      <div key={f.key} style={{ gridColumn: isMobile ? 'auto' : (f.full ? '1 / -1' : 'auto') }}>
                        <label style={sLabel}>{f.label}</label>
                        <input type={f.type} placeholder={f.placeholder} value={form[f.key]} required
                          onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                          style={sInput}
                          onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)'}
                          onBlur={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'}
                        />
                      </div>
                    ))}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={sLabel}>Descripción del proyecto</label>
                      <textarea placeholder="Contanos sobre tu proyecto..." value={form.descripcion} rows={3}
                        onChange={e => setForm(p => ({ ...p, descripcion: e.target.value }))}
                        style={{ ...sInput, resize: 'vertical' }}
                        onFocus={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.6)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'}
                      />
                    </div>
                    {/* Info importante */}
                    <div style={{ gridColumn: '1 / -1', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '14px 16px' }}>
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#D4AF37', marginBottom: '8px' }}>Información importante</p>
                      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {[
                          'Plazo estimado: ~20 días hábiles desde la compra hasta la entrega.',
                          'Piezas a medida: no se aceptan devoluciones por errores de medición.',
                          'El precio se confirma al momento de la seña (puede variar hasta entonces).',
                        ].map((t, i) => (
                          <li key={i} style={{ display: 'flex', gap: '8px', fontFamily: "'Figtree', sans-serif", fontSize: '12px', lineHeight: 1.5, color: 'rgba(245,240,230,0.7)' }}>
                            <span style={{ color: '#D4AF37', flexShrink: 0 }}>◈</span>{t}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Aceptación de T&C */}
                    <label style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                      <input type="checkbox" checked={acceptedTerms} onChange={e => setAcceptedTerms(e.target.checked)}
                        style={{ width: '18px', height: '18px', accentColor: '#D4AF37', marginTop: '1px', flexShrink: 0, cursor: 'pointer' }} />
                      <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '12.5px', lineHeight: 1.5, color: 'rgba(245,240,230,0.7)' }}>
                        Leí y acepto los{' '}
                        <a href="terminos-y-condiciones.html" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37', textDecoration: 'underline' }}>Términos y Condiciones</a>
                        {' '}y confirmo que la información ingresada es correcta.
                      </span>
                    </label>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" disabled={!acceptedTerms}
                        style={{ width: '100%', background: acceptedTerms ? '#D4AF37' : 'rgba(212,175,55,0.15)', color: acceptedTerms ? '#0B0B0F' : 'rgba(245,240,230,0.35)', border: 'none', borderRadius: '4px', padding: '14px', cursor: acceptedTerms ? 'pointer' : 'not-allowed', fontFamily: "'Figtree', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s, color 0.2s' }}
                        onMouseEnter={e => { if (acceptedTerms) e.currentTarget.style.background = '#c9a42e'; }}
                        onMouseLeave={e => { if (acceptedTerms) e.currentTarget.style.background = '#D4AF37'; }}>
                        Enviar cotización
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          /* SELECTOR */
          ) : (
            <>
              {/* Panel izquierdo — foto del material seleccionado */}
              <div data-guide="cot-preview" style={{
                flex: isMobile ? 'none' : '0 0 52%',
                height: isMobile ? '260px' : 'auto',
                position: 'relative', overflow: 'hidden',
                background: '#08060A', flexShrink: 0,
              }}>
                {envImg && (
                  <img
                    key={envItem.id + '-' + colorIdx}
                    src={envImg} alt={envItem.name}
                    style={{ width: '100%', height: '100%', objectFit: envItem.mesaFit || 'cover', objectPosition: envItem.mesaPosition || 'center', display: 'block', animation: 'fadein 0.35s ease' }}
                  />
                )}

                {/* Switcher de colores (ej: Manijón) */}
                {colorList && colorList.length > 1 && (
                  <>
                    <button
                      onClick={() => setColorIdx(i => (i - 1 + colorList.length) % colorList.length)}
                      aria-label="Color anterior"
                      style={{
                        position: 'absolute', top: '50%', left: '12px', transform: 'translateY(-50%)',
                        width: '36px', height: '36px', borderRadius: '50%', zIndex: 3, cursor: 'pointer',
                        background: 'rgba(11,11,15,0.7)', backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37',
                        fontSize: '18px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.background = 'rgba(11,11,15,0.9)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'; e.currentTarget.style.background = 'rgba(11,11,15,0.7)'; }}
                    >‹</button>
                    <button
                      onClick={() => setColorIdx(i => (i + 1) % colorList.length)}
                      aria-label="Color siguiente"
                      style={{
                        position: 'absolute', top: '50%', right: '12px', transform: 'translateY(-50%)',
                        width: '36px', height: '36px', borderRadius: '50%', zIndex: 3, cursor: 'pointer',
                        background: 'rgba(11,11,15,0.7)', backdropFilter: 'blur(6px)',
                        border: '1px solid rgba(212,175,55,0.35)', color: '#D4AF37',
                        fontSize: '18px', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'border-color 0.2s, background 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; e.currentTarget.style.background = 'rgba(11,11,15,0.9)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.35)'; e.currentTarget.style.background = 'rgba(11,11,15,0.7)'; }}
                    >›</button>
                  </>
                )}

                {/* Gradiente inferior para legibilidad de texto */}
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(6,5,3,0.82) 0%, rgba(6,5,3,0.1) 45%, transparent 100%)', pointerEvents: 'none' }} />

                {/* Nombre del material seleccionado */}
                {envItem && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: isMobile ? '20px 16px 14px' : '36px 28px 22px', pointerEvents: 'none' }}>
                    <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
                      {isHerrajeView
                        ? 'Herraje Premium'
                        : isIlumView
                        ? 'Electricidad y Luminación'
                        : isMuebleView
                        ? 'Mueble'
                        : (activeSurfaceEntry ? (activeSurfaceEntry.tabKey === 'marmoles' ? 'Mármol' : activeSurfaceEntry.tabKey === 'granitos' ? 'Granito' : 'Purastone') : '')}
                    </p>
                    {activeColor && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '8px', background: 'rgba(11,11,15,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '50px', padding: '4px 12px', fontFamily: "'Figtree', sans-serif", fontSize: '10px', letterSpacing: '0.08em', color: '#D4AF37' }}>
                        Color: {activeColor.name} ({(colorIdx % colorList.length) + 1}/{colorList.length})
                      </span>
                    )}
                    <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '20px' : '28px', fontWeight: 700, color: '#F5F0E6', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                      {envItem.name}
                    </p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '50px', padding: '4px 10px', fontFamily: "'Figtree', sans-serif", fontSize: '10px', color: '#D4AF37' }}>
                      ✓ Seleccionado
                    </span>
                  </div>
                )}

                {/* Placeholder cuando no hay nada elegido */}
                {!envItem && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '52px', opacity: 0.12, marginBottom: '16px', lineHeight: 1 }}>◈</div>
                    <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '13px', color: 'rgba(245,240,230,0.22)', lineHeight: 1.7 }}>
                      {isHerrajeView
                        ? 'Elegí un herraje\npara ver el detalle en la puerta'
                        : isIlumView
                        ? 'Elegí un producto\npara ver el detalle'
                        : isMuebleView
                        ? 'Elegí un mueble\npara ver el detalle'
                        : 'Elegí una superficie\npara ver el material'}
                    </p>
                  </div>
                )}

                {/* Icono de carrito con el total de productos seleccionados */}
                {selSummary.length > 0 && (
                  <div style={{ position: 'absolute', top: '12px', left: '12px', zIndex: 4, pointerEvents: 'auto' }}>
                    <button
                      onClick={e => { e.stopPropagation(); setShowCart(v => !v); }}
                      aria-label="Ver productos seleccionados"
                      style={{
                        position: 'relative', width: '38px', height: '38px', borderRadius: '50%',
                        background: 'rgba(11,11,15,0.75)', backdropFilter: 'blur(8px)',
                        border: `1px solid ${showCart ? '#D4AF37' : 'rgba(212,175,55,0.35)'}`, color: '#D4AF37',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                        transition: 'border-color 0.2s',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = '#D4AF37'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = showCart ? '#D4AF37' : 'rgba(212,175,55,0.35)'; }}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                      </svg>
                      <span style={{
                        position: 'absolute', top: '-4px', right: '-4px', minWidth: '17px', height: '17px', padding: '0 3px',
                        borderRadius: '50%', background: '#D4AF37', color: '#0B0B0F', fontFamily: "'Figtree', sans-serif",
                        fontSize: '9px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid #0B0B0F', lineHeight: 1,
                      }}>{selSummary.length}</span>
                    </button>

                    {showCart && (
                      <div style={{
                        marginTop: '8px', width: '220px', maxHeight: '260px', overflowY: 'auto',
                        background: 'rgba(11,11,15,0.94)', backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(212,175,55,0.25)', borderRadius: '10px', padding: '8px',
                        display: 'flex', flexDirection: 'column', gap: '6px', boxShadow: '0 12px 30px rgba(0,0,0,0.5)',
                      }}>
                        {selSummary.map(({ key, item, label }) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '8px', color: '#D4AF37', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '1px' }}>{label}</p>
                              <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', color: '#F5F0E6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

              </div>

              {/* Panel derecho — acordeón */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: isMobile ? 'none' : '1px solid rgba(212,175,55,0.08)', borderTop: isMobile ? '1px solid rgba(212,175,55,0.08)' : 'none', overflow: 'hidden', background: '#0F0F13' }}>
                <div data-guide="cot-slots" style={{ flex: 1, overflow: 'auto' }}>

                  {/* Slot: Superficie */}
                  {slotHeader('surf', '◈', 'Superficie', surface.map(s => s.item))}
                  {openSlot === 'surf' && (
                    <div>
                      <SubTabs tabs={SURF_TABS} active={surfTab} onChange={setSurfTab} isMobile={isMobile} />
                      <SwatchGrid
                        items={surfItems} selectedIds={surface.map(s => s.item.id)} activeId={activeSurfaceEntry?.item.id}
                        onPick={pickSurf} isMobile={isMobile}
                      />
                    </div>
                  )}

                  {/* Slot: Muebles */}
                  {slotHeader('mueble', '▣', 'Muebles', mueble)}
                  {openSlot === 'mueble' && (
                    <div>
                      {MBL_TABS.length > 1 && <SubTabs tabs={MBL_TABS} active={mblTab} onChange={setMblTab} isMobile={isMobile} />}
                      <SwatchGrid items={mblItems} selectedIds={mueble.map(m => m.id)} activeId={activeMueble?.id} onPick={toggleMueble} isMobile={isMobile} />
                    </div>
                  )}

                  {/* Slot: Herrajes */}
                  {slotHeader('herraje', '◆', 'Herrajes', herraje)}
                  {openSlot === 'herraje' && (
                    <SwatchGrid items={hrjItems} selectedIds={herraje.map(h => h.id)} activeId={activeHerraje?.id} onPick={toggleHerraje} isMobile={isMobile} />
                  )}

                  {/* Slot: Iluminación */}
                  {slotHeader('ilum', '◎', 'Iluminación', ilum)}
                  {openSlot === 'ilum' && (
                    <SwatchGrid items={ilmItems} selectedIds={ilum.map(i => i.id)} activeId={activeIlum?.id} onPick={toggleIlum} isMobile={isMobile} />
                  )}

                </div>

                {/* CTA */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(212,175,55,0.08)', flexShrink: 0, background: '#0F0F13' }}>
                  <button
                    onClick={() => totalSel > 0 && setStep('form')}
                    disabled={totalSel === 0}
                    data-guide="cot-cta"
                    style={{
                      width: '100%',
                      background: totalSel > 0 ? '#D4AF37' : 'rgba(212,175,55,0.1)',
                      color: totalSel > 0 ? '#0B0B0F' : 'rgba(245,240,230,0.2)',
                      border: 'none', borderRadius: '4px', padding: '13px',
                      cursor: totalSel > 0 ? 'pointer' : 'not-allowed',
                      fontFamily: "'Figtree', sans-serif", fontSize: '12px', fontWeight: 700,
                      letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => { if (totalSel > 0) e.currentTarget.style.background = '#c9a42e'; }}
                    onMouseLeave={e => { if (totalSel > 0) e.currentTarget.style.background = '#D4AF37'; }}
                  >
                    {totalSel > 0
                      ? `Cotizar proyecto (${totalSel} elemento${totalSel !== 1 ? 's' : ''})`
                      : 'Seleccioná al menos un elemento'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Guía interactiva del cotizador (motor compartido en GuideTour.jsx) */}
      {window.SpotlightTour && (
        <window.SpotlightTour
          steps={COT_TOUR_STEPS}
          active={tourActive && step === 'select'}
          onEnd={() => setTourActive(false)}
        />
      )}
    </div>
  );
}

Object.assign(window, { CotizadorModal });
