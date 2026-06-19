const { useState, useEffect, useCallback } = React;

function CotizadorModal({ context = 'all', onClose }) {
  const tabs = window.COTIZADOR_TABS[context] || window.COTIZADOR_TABS.all;
  const firstKey = tabs[0].key;
  const firstItems = window.MATERIALS_DATA[firstKey] || [];

  const [activeTab, setActiveTab]   = useState(firstKey);
  const [focused,   setFocused]     = useState(firstItems[0] || null);
  const [selections, setSelections] = useState({});   // { tabKey: item }
  const [step,      setStep]        = useState('select');
  const [form,      setForm]        = useState({ nombre: '', telefono: '', email: '', metros: '', descripcion: '' });
  const [sent,      setSent]        = useState(false);
  const [isMobile,  setIsMobile]    = useState(window.innerWidth <= 768);

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('resize', onResize);
      document.body.style.overflow = '';
    };
  }, []);

  const currentItems = window.MATERIALS_DATA[activeTab] || [];
  const selForTab    = selections[activeTab] || null;
  const allSelected  = Object.entries(selections).filter(([, v]) => v);
  const totalSel     = allSelected.length;

  const handleTabChange = (key) => {
    setActiveTab(key);
    const items = window.MATERIALS_DATA[key] || [];
    setFocused(selections[key] || items[0] || null);
  };

  const handleItemClick = (item) => {
    setSelections(prev => ({ ...prev, [activeTab]: item }));
    setFocused(item);
  };

  const removeSelection = (key) => {
    setSelections(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = (e) => { e.preventDefault(); setSent(true); };

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

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(11,11,15,0.9)', backdropFilter: 'blur(12px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '8px' : '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0F0F13', border: '1px solid rgba(212,175,55,0.18)',
        borderRadius: '8px', width: '100%',
        maxWidth: '1100px',
        height: isMobile ? '92vh' : '680px',
        maxHeight: '94vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '14px 18px' : '16px 26px',
          borderBottom: '1px solid rgba(212,175,55,0.1)', flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '17px' : '22px', fontWeight: 600, color: '#F5F0E6', letterSpacing: '-0.01em' }}>
              Armá tu proyecto
            </h2>
            <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', color: 'rgba(245,240,230,0.4)', marginTop: '2px' }}>
              {step === 'select'
                ? `Elegí de cada categoría · ${totalSel} ítem${totalSel !== 1 ? 's' : ''} seleccionado${totalSel !== 1 ? 's' : ''}`
                : 'Completá tus datos y te cotizamos'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer', color: 'rgba(245,240,230,0.5)',
            fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s, border-color 0.2s', flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.borderColor = '#D4AF37'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,230,0.5)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; }}
          >✕</button>
        </div>

        {/* ── Body ── */}
        <div style={{
          display: 'flex', flexDirection: isMobile ? 'column' : 'row',
          flex: 1, overflow: isMobile ? 'auto' : 'hidden', minHeight: 0,
        }}>

          {/* ── SUCCESS ── */}
          {sent ? (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', border: '2px solid #D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', color: '#D4AF37', marginBottom: '24px' }}>✓</div>
              <h3 style={{ fontFamily: "'Figtree', sans-serif", fontSize: '28px', fontWeight: 600, color: '#F5F0E6', marginBottom: '10px' }}>Solicitud enviada</h3>
              <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '14px', color: 'rgba(245,240,230,0.55)', lineHeight: 1.7, maxWidth: '380px' }}>
                Recibimos tu proyecto. Nos pondremos en contacto a la brevedad.
              </p>
              <button onClick={onClose} style={{ marginTop: '32px', background: '#D4AF37', color: '#0B0B0F', border: 'none', borderRadius: '4px', padding: '12px 36px', cursor: 'pointer', fontFamily: "'Figtree', sans-serif", fontSize: '13px', fontWeight: 700, letterSpacing: '0.1em' }}>
                Cerrar
              </button>
            </div>

          /* ── FORM ── */
          ) : step === 'form' ? (
            <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '20px 16px' : '36px 48px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '600px' }}>
                <button onClick={() => setStep('select')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4AF37', fontFamily: "'Figtree', sans-serif", fontSize: '12px', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '24px', padding: 0 }}>
                  ← Volver al configurador
                </button>

                {/* Resumen de selecciones */}
                {totalSel > 0 && (
                  <div style={{ marginBottom: '28px' }}>
                    <p style={{ ...sLabel, marginBottom: '12px' }}>Tu selección ({totalSel} ítem{totalSel !== 1 ? 's' : ''})</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {allSelected.map(([key, item]) => {
                        const tabLabel = tabs.find(t => t.key === key)?.label || key;
                        return (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(212,175,55,0.07)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '8px', padding: '8px 12px', maxWidth: '200px' }}>
                            <div style={{ width: '36px', height: '36px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0, border: '1.5px solid rgba(212,175,55,0.4)' }}>
                              <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
                            </div>
                            <div>
                              <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', color: '#D4AF37', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: '2px' }}>{tabLabel}</p>
                              <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '12px', fontWeight: 600, color: '#F5F0E6', lineHeight: 1.2 }}>{item.name}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', width: '100%' }}>
                    {[
                      { key: 'nombre',   label: 'Nombre completo',       placeholder: 'Tu nombre',          type: 'text',  full: false },
                      { key: 'telefono', label: 'Teléfono',              placeholder: '+54 11 0000-0000',   type: 'tel',   full: false },
                      { key: 'email',    label: 'Email',                 placeholder: 'email@ejemplo.com',  type: 'email', full: true  },
                      { key: 'metros',   label: 'Metros cuadrados aprox.', placeholder: 'Ej: 4.5 m²',      type: 'text',  full: false },
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
                        onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}
                      >Enviar cotización</button>
                    </div>
                  </div>
                </form>
              </div>
            </div>

          /* ── SELECTOR ── */
          ) : (
            <>
              {/* Panel izquierdo — imagen en contexto */}
              <div style={{
                flex: isMobile ? 'none' : '0 0 58%',
                height: isMobile ? '240px' : 'auto',
                position: 'relative', overflow: 'hidden',
                background: '#080604', flexShrink: 0,
              }}>
                {focused && (
                  <>
                    <img
                      key={focused.id}
                      src={focused.mesa || focused.img}
                      alt={focused.name}
                      loading="lazy"
                      style={{
                        width: '100%', height: '100%',
                        objectFit: focused.fit || 'cover', objectPosition: 'center',
                        display: 'block', animation: 'fadein 0.35s ease',
                      }}
                    />
                    {/* Overlay inferior */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(to top, rgba(6,5,3,0.95) 0%, rgba(6,5,3,0.4) 60%, transparent 100%)',
                      padding: isMobile ? '20px 16px 16px' : '40px 28px 24px',
                    }}>
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '10px', color: '#D4AF37', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '5px' }}>
                        {tabs.find(t => t.key === activeTab)?.label}
                      </p>
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '22px' : '32px', fontWeight: 700, color: '#F5F0E6', lineHeight: 1.1, letterSpacing: '-0.02em' }}>
                        {focused.name}
                      </p>
                      {selForTab?.id === focused.id && (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', marginTop: '8px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.4)', borderRadius: '50px', padding: '4px 10px', fontFamily: "'Figtree', sans-serif", fontSize: '10px', color: '#D4AF37', letterSpacing: '0.08em' }}>
                          ✓ Seleccionado
                        </span>
                      )}
                    </div>

                    {/* Mini barra de selecciones sobre la imagen */}
                    {totalSel > 0 && (
                      <div style={{
                        position: 'absolute', top: '14px', left: '14px', right: '14px',
                        display: 'flex', flexWrap: 'wrap', gap: '6px',
                      }}>
                        {allSelected.map(([key, item]) => (
                          <div key={key}
                            onClick={() => { handleTabChange(key); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              background: 'rgba(11,11,15,0.75)', backdropFilter: 'blur(8px)',
                              border: key === activeTab ? '1px solid #D4AF37' : '1px solid rgba(255,255,255,0.12)',
                              borderRadius: '50px', padding: '4px 10px 4px 4px',
                              cursor: 'pointer', transition: 'border-color 0.2s',
                            }}>
                            <div style={{ width: '22px', height: '22px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                              <img src={item.img} alt={item.name} style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
                            </div>
                            <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '10px', color: '#F5F0E6', whiteSpace: 'nowrap', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</span>
                            <span
                              onClick={e => { e.stopPropagation(); removeSelection(key); }}
                              style={{ color: 'rgba(245,240,230,0.4)', fontSize: '11px', lineHeight: 1, cursor: 'pointer', marginLeft: '2px' }}>✕</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Panel derecho */}
              <div style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                borderLeft: isMobile ? 'none' : '1px solid rgba(212,175,55,0.08)',
                borderTop: isMobile ? '1px solid rgba(212,175,55,0.08)' : 'none',
                overflow: 'hidden', background: '#0F0F13',
              }}>
                {/* Tabs pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px 14px', flexShrink: 0, borderBottom: '1px solid rgba(212,175,55,0.08)' }}>
                  {tabs.map(tab => {
                    const active  = activeTab === tab.key;
                    const hasSel  = !!selections[tab.key];
                    return (
                      <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
                        background: active ? 'rgba(212,175,55,0.14)' : hasSel ? 'rgba(212,175,55,0.06)' : 'rgba(255,255,255,0.04)',
                        border: active ? '1px solid rgba(212,175,55,0.6)' : hasSel ? '1px solid rgba(212,175,55,0.3)' : '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '50px',
                        color: active ? '#D4AF37' : hasSel ? 'rgba(212,175,55,0.8)' : 'rgba(245,240,230,0.45)',
                        padding: '6px 14px', cursor: 'pointer',
                        fontFamily: "'Figtree', sans-serif", fontSize: '10px', fontWeight: active ? 700 : 400,
                        letterSpacing: '0.08em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                        transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '5px',
                      }}>
                        {hasSel && <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#D4AF37', flexShrink: 0 }} />}
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Swatches */}
                <div style={{ flex: 1, overflow: 'auto', padding: '14px' }}>
                  <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.25)', marginBottom: '12px' }}>
                    {selForTab ? `Seleccionado: ${selForTab.name}` : 'Tocá para seleccionar'}
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(68px, 1fr))' : 'repeat(3, 1fr)', gap: '10px' }}>
                    {currentItems.map(item => {
                      const isSel = selForTab?.id === item.id;
                      const isFoc = focused?.id === item.id;
                      return (
                        <div key={item.id} onClick={() => handleItemClick(item)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                          <div style={{
                            width: isMobile ? '52px' : '60px',
                            height: isMobile ? '52px' : '60px',
                            borderRadius: '50%', overflow: 'hidden',
                            border: isSel ? '2.5px solid #D4AF37' : isFoc ? '2px solid rgba(212,175,55,0.4)' : '2px solid rgba(255,255,255,0.08)',
                            margin: '0 auto 5px',
                            transition: 'border-color 0.18s, transform 0.18s, box-shadow 0.18s',
                            transform: isSel ? 'scale(1.1)' : isFoc ? 'scale(1.04)' : 'scale(1)',
                            boxShadow: isSel ? '0 0 0 3px rgba(212,175,55,0.2)' : 'none',
                            position: 'relative',
                          }}>
                            <img src={item.img} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
                          </div>
                          <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '9px', lineHeight: 1.3, color: isSel ? '#D4AF37' : 'rgba(245,240,230,0.45)', fontWeight: isSel ? 700 : 400 }}>
                            {item.name}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(212,175,55,0.08)', flexShrink: 0, background: '#0F0F13' }}>
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
                    {totalSel > 0 ? `Cotizar proyecto (${totalSel} ítem${totalSel !== 1 ? 's' : ''})` : 'Seleccioná al menos un ítem'}
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
