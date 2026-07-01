const { useState, useEffect, useRef, useCallback } = React;

const SURF_TABS = [
  { key: 'marmoles',  label: 'Mármoles'  },
  { key: 'granitos',  label: 'Granitos'  },
  { key: 'purastone', label: 'Purastone' },
];

const MBL_TABS = [
  { key: 'cocinas',   label: 'Cocinas'   },
];

/* ── Componentes auxiliares (nivel módulo, sin remount) ─────────────────── */

function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px', padding: '10px 14px 0', flexWrap: 'wrap' }}>
      {tabs.map(t => {
        const isA = active === t.key;
        return (
          <button key={t.key} onClick={() => onChange(t.key)} style={{
            background: isA ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isA ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.06)'}`,
            borderRadius: '50px', color: isA ? '#D4AF37' : 'rgba(245,240,230,0.4)',
            padding: '5px 12px', cursor: 'pointer',
            fontFamily: "'Figtree', sans-serif", fontSize: '10px',
            fontWeight: isA ? 700 : 400, letterSpacing: '0.06em', transition: 'all 0.15s',
          }}>{t.label}</button>
        );
      })}
    </div>
  );
}

function SwatchGrid({ items, selected, onPick, onEnter, onLeave, isMobile }) {
  const sz = isMobile ? '50px' : '56px';
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(64px, 1fr))', gap: '10px', padding: '14px' }}>
      {items.map(item => {
        const isSel = selected?.id === item.id;
        return (
          <div key={item.id}
            onClick={() => onPick(item)}
            onMouseEnter={() => onEnter && onEnter(item)}
            onMouseLeave={() => onLeave && onLeave()}
            style={{ cursor: 'pointer', textAlign: 'center' }}>
            <div style={{
              width: sz, height: sz, borderRadius: '50%', overflow: 'hidden',
              margin: '0 auto 5px',
              border: `${isSel ? '2.5px' : '2px'} solid ${isSel ? '#D4AF37' : 'rgba(255,255,255,0.08)'}`,
              transform: isSel ? 'scale(1.1)' : 'scale(1)',
              boxShadow: isSel ? '0 0 0 3px rgba(212,175,55,0.2)' : 'none',
              transition: 'all 0.18s',
            }}>
              <img src={item.img} alt={item.name} loading="lazy"
                style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
            </div>
            <p style={{
              fontFamily: "'Figtree', sans-serif", fontSize: '9px', lineHeight: 1.3,
              color: isSel ? '#D4AF37' : 'rgba(245,240,230,0.4)', fontWeight: isSel ? 700 : 400,
            }}>{item.name}</p>
          </div>
        );
      })}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */

function CotizadorModal({ context = 'all', view = '3d', onClose }) {
  const is3D = view === '3d';
  const initSlot = context === 'muebles'      ? 'mueble'
                 : context === 'herrajes'     ? 'herraje'
                 : context === 'electricidad' ? 'ilum'
                 : 'surf';

  const [surface,  setSurface]  = useState(null);
  const [surfTab,  setSurfTab]  = useState('marmoles');
  const [preview,  setPreview]  = useState(null);
  const [mueble,   setMueble]   = useState(null);
  const [mblTab,   setMblTab]   = useState('cocinas');
  const [herraje,  setHerraje]  = useState(null);
  const [ilum,     setIlum]     = useState(null);
  const [openSlot, setOpenSlot] = useState(initSlot);
  const [step,     setStep]     = useState('select');
  const [form,     setForm]     = useState({ nombre: '', telefono: '', email: '', metros: '', descripcion: '' });
  const [sent,     setSent]     = useState(false);
  const [colorIdx, setColorIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  /* ── Three.js refs ── */
  const sceneInstRef     = useRef(null);
  const currentSelRef    = useRef({ surface: null, mueble: null, herraje: null, ilum: null });
  const sceneRetryRef    = useRef(null);

  // Actualizar ref en cada render para que el callback ref lea valores frescos
  currentSelRef.current = { surface, mueble, herraje, ilum };

  // Callback ref: se ejecuta cuando el div del canvas monta/desmonta
  const setSceneContainer = useCallback((node) => {
    if (!node) {
      if (sceneRetryRef.current) { clearTimeout(sceneRetryRef.current); sceneRetryRef.current = null; }
      sceneInstRef.current?.destroy();
      sceneInstRef.current = null;
      return;
    }
    // KitchenScene es un módulo ES que carga async; reintentar hasta que esté listo
    let tries = 0;
    const tryInit = () => {
      if (!node.isConnected) return;                 // el modal se cerró mientras esperaba
      if (!window.KitchenScene) {
        if (tries++ < 40) { sceneRetryRef.current = setTimeout(tryInit, 150); }
        return;
      }
      const scene = new window.KitchenScene(node);
      sceneInstRef.current = scene;
      // Aplicar selecciones actuales (orden: mueble → superficie → herraje → luz)
      const s = currentSelRef.current;
      if (s.mueble)             scene.setFurniture(s.mueble.id);
      if (s.surface?.item)      scene.setStoneMaterial(s.surface.item);
      if (s.herraje)            scene.setHerraje(s.herraje.id);
      if (s.ilum)               scene.setIluminacion(s.ilum.id);
    };
    tryInit();
  }, []);

  useEffect(() => {
    const onR = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onR);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('resize', onR); document.body.style.overflow = ''; };
  }, []);

  // Actualizar escena cuando cambian mueble / herraje / ilum
  useEffect(() => { if (mueble)  sceneInstRef.current?.setFurniture(mueble.id);   }, [mueble]);
  useEffect(() => { if (herraje) sceneInstRef.current?.setHerraje(herraje.id);     }, [herraje]);
  useEffect(() => { if (ilum)    sceneInstRef.current?.setIluminacion(ilum.id);    }, [ilum]);

  const D        = window.MATERIALS_DATA;
  const surfItems = D[surfTab]      || [];
  const mblItems  = D[mblTab]      || [];
  const hrjItems  = D.herrajes     || [];
  const ilmItems  = D.iluminacion  || [];

  const totalSel = [surface, mueble, herraje, ilum].filter(Boolean).length;
  const toggle   = (id) => setOpenSlot(p => p === id ? null : id);

  const pickSurf = (item) => {
    setSurface({ tabKey: surfTab, item });
    setPreview(null);
    if (is3D) sceneInstRef.current?.setStoneMaterial(item);
  };

  const hoverSurf = (item) => {
    if (!isMobile) {
      setPreview(item);
      if (is3D) sceneInstRef.current?.setStoneMaterial(item);
    }
  };

  const leaveSurf = () => {
    if (!isMobile) {
      setPreview(null);
      if (is3D) sceneInstRef.current?.setStoneMaterial(surface?.item || null);
    }
  };

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
    surface  && { label: 'Superficie',  item: surface.item },
    mueble   && { label: 'Mueble',      item: mueble       },
    herraje  && { label: 'Herraje',     item: herraje      },
    ilum     && { label: 'Iluminación', item: ilum         },
  ].filter(Boolean);

  const slotHeader = (id, icon, label, selItem) => {
    const open   = openSlot === id;
    const hasSel = !!selItem;
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
          }}>{hasSel ? selItem.name : 'Sin seleccionar'}</p>
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

  const isHerrajeView = context === 'herrajes' || openSlot === 'herraje';
  const envItem = preview || (isHerrajeView ? herraje : surface?.item);
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
      <div style={{ background: '#0F0F13', border: '1px solid rgba(212,175,55,0.18)', borderRadius: '8px', width: '100%', maxWidth: '1100px', height: isMobile ? '92vh' : '700px', maxHeight: '94vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.8)' }}>

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
          <button onClick={onClose}
            style={{ background: 'none', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: 'rgba(245,240,230,0.5)', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.2s, border-color 0.2s', flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.borderColor = '#D4AF37'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,230,0.5)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; }}>
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', flex: 1, overflow: isMobile ? 'auto' : 'hidden', minHeight: 0 }}>

          {/* SUCCESS */}
          {sent ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', border: '2px solid #D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#D4AF37', marginBottom: '24px' }}>✓</div>
              <h3 style={{ fontFamily: "'Figtree', sans-serif", fontSize: '28px', fontWeight: 600, color: '#F5F0E6', marginBottom: '10px' }}>Solicitud enviada</h3>
              <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '14px', color: 'rgba(245,240,230,0.55)', lineHeight: 1.7, maxWidth: '380px' }}>Recibimos tu proyecto. Nos pondremos en contacto a la brevedad.</p>
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
                      {selSummary.map(({ label, item }) => (
                        <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '8px 12px', maxWidth: '200px' }}>
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

                <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
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
                    <div style={{ gridColumn: '1 / -1' }}>
                      <button type="submit" style={{ width: '100%', background: '#D4AF37', color: '#0B0B0F', border: 'none', borderRadius: '4px', padding: '14px', cursor: 'pointer', fontFamily: "'Figtree', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#c9a42e'}
                        onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}>
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
              {/* Panel izquierdo — escena 3D (sección diseño) o foto del material (cards) */}
              <div style={{
                flex: isMobile ? 'none' : '0 0 52%',
                height: isMobile ? '260px' : 'auto',
                position: 'relative', overflow: 'hidden',
                background: is3D ? '#1a1612' : '#08060A', flexShrink: 0,
              }}>
                {is3D ? (
                  /* Canvas Three.js — callback ref monta/desmonta la escena */
                  <div ref={setSceneContainer} style={{ width: '100%', height: '100%' }} />
                ) : (
                  envImg && (
                    <img
                      key={envItem.id + (preview ? '-p' : '-s') + '-' + colorIdx}
                      src={envImg} alt={envItem.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center', display: 'block', animation: 'fadein 0.35s ease' }}
                    />
                  )
                )}

                {/* Switcher de colores (ej: Manijón) — solo modo cards */}
                {!is3D && colorList && colorList.length > 1 && (
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

                {/* Nombre del material seleccionado / en preview */}
                {envItem && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: isMobile ? '20px 16px 14px' : '36px 28px 22px', pointerEvents: 'none' }}>
                    {!preview && (
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {isHerrajeView
                          ? 'Herraje Premium'
                          : (surface ? (surface.tabKey === 'marmoles' ? 'Mármol' : surface.tabKey === 'granitos' ? 'Granito' : 'Purastone') : '')}
                      </p>
                    )}
                    {!is3D && activeColor && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginBottom: '8px', background: 'rgba(11,11,15,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '50px', padding: '4px 12px', fontFamily: "'Figtree', sans-serif", fontSize: '10px', letterSpacing: '0.08em', color: '#D4AF37' }}>
                        Color: {activeColor.name} ({(colorIdx % colorList.length) + 1}/{colorList.length})
                      </span>
                    )}
                    <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '20px' : '28px', fontWeight: 700, color: '#F5F0E6', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                      {envItem.name}
                    </p>
                    {preview && (
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '10px', color: 'rgba(245,240,230,0.4)', marginTop: '4px', letterSpacing: '0.06em' }}>
                        Vista previa · click para seleccionar
                      </p>
                    )}
                    {((isHerrajeView && herraje) || (!isHerrajeView && surface)) && !preview && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '50px', padding: '4px 10px', fontFamily: "'Figtree', sans-serif", fontSize: '10px', color: '#D4AF37' }}>
                        ✓ Seleccionado
                      </span>
                    )}
                  </div>
                )}

                {/* Placeholder cuando no hay nada elegido */}
                {!envItem && (
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center', pointerEvents: 'none' }}>
                    <div style={{ fontSize: '52px', opacity: 0.12, marginBottom: '16px', lineHeight: 1 }}>◈</div>
                    <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '13px', color: 'rgba(245,240,230,0.22)', lineHeight: 1.7 }}>
                      {isHerrajeView
                        ? 'Elegí un herraje\npara ver el detalle en la puerta'
                        : `Elegí una superficie\npara ver el material${is3D ? ' en la cocina' : ''}`}
                    </p>
                  </div>
                )}

                {/* Chips selecciones activas (mueble/herraje/ilum) */}
                {[mueble && { item: mueble, label: 'Mueble' }, herraje && { item: herraje, label: 'Herraje' }, ilum && { item: ilum, label: 'Iluminación' }].filter(Boolean).length > 0 && (
                  <div style={{ position: 'absolute', top: '12px', left: '12px', display: 'flex', flexDirection: 'column', gap: '5px', pointerEvents: 'none' }}>
                    {[
                      mueble  && { item: mueble,  label: 'Mueble'      },
                      herraje && { item: herraje, label: 'Herraje'     },
                      ilum    && { item: ilum,    label: 'Iluminación' },
                    ].filter(Boolean).map(({ item, label }) => (
                      <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(11,11,15,0.75)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '50px', padding: '4px 10px 4px 4px' }}>
                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
                        </div>
                        <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', color: 'rgba(245,240,230,0.65)', whiteSpace: 'nowrap' }}>{item.name}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Badge 3D (solo en modo escena) */}
                {is3D && (
                  <div style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(11,11,15,0.65)', backdropFilter: 'blur(6px)', border: '1px solid rgba(212,175,55,0.25)', borderRadius: '50px', padding: '4px 10px', pointerEvents: 'none' }}>
                    <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', color: 'rgba(212,175,55,0.8)', letterSpacing: '0.12em' }}>VISTA 3D</span>
                  </div>
                )}
              </div>

              {/* Panel derecho — acordeón */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderLeft: isMobile ? 'none' : '1px solid rgba(212,175,55,0.08)', borderTop: isMobile ? '1px solid rgba(212,175,55,0.08)' : 'none', overflow: 'hidden', background: '#0F0F13' }}>
                <div style={{ flex: 1, overflow: 'auto' }}>

                  {/* Slot: Superficie */}
                  {slotHeader('surf', '◈', 'Superficie', surface?.item)}
                  {openSlot === 'surf' && (
                    <div>
                      <SubTabs tabs={SURF_TABS} active={surfTab} onChange={setSurfTab} />
                      <SwatchGrid
                        items={surfItems} selected={surface?.item} onPick={pickSurf}
                        onEnter={hoverSurf} onLeave={leaveSurf}
                        isMobile={isMobile}
                      />
                    </div>
                  )}

                  {/* Slot: Muebles */}
                  {slotHeader('mueble', '▣', 'Muebles', mueble)}
                  {openSlot === 'mueble' && (
                    <div>
                      {MBL_TABS.length > 1 && <SubTabs tabs={MBL_TABS} active={mblTab} onChange={setMblTab} />}
                      <SwatchGrid items={mblItems} selected={mueble} onPick={setMueble} isMobile={isMobile} />
                    </div>
                  )}

                  {/* Slot: Herrajes */}
                  {slotHeader('herraje', '◆', 'Herrajes', herraje)}
                  {openSlot === 'herraje' && (
                    <SwatchGrid items={hrjItems} selected={herraje} onPick={setHerraje} isMobile={isMobile} />
                  )}

                  {/* Slot: Iluminación */}
                  {slotHeader('ilum', '◎', 'Iluminación', ilum)}
                  {openSlot === 'ilum' && (
                    <SwatchGrid items={ilmItems} selected={ilum} onPick={setIlum} isMobile={isMobile} />
                  )}

                </div>

                {/* CTA */}
                <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(212,175,55,0.08)', flexShrink: 0, background: '#0F0F13' }}>
                  <button
                    onClick={() => totalSel > 0 && setStep('form')}
                    disabled={totalSel === 0}
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
    </div>
  );
}

Object.assign(window, { CotizadorModal });
