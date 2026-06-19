const { useState, useEffect } = React;

function CotizadorModal({ context = 'all', onClose }) {
  const tabs = window.COTIZADOR_TABS[context] || window.COTIZADOR_TABS.all;

  const [activeTab, setActiveTab] = useState(tabs ? tabs[0].key : null);
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState('select');
  const [form, setForm] = useState({ nombre: '', telefono: '', email: '', metros: '', descripcion: '' });
  const [sent, setSent] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const currentItems = tabs && activeTab ? (window.MATERIALS_DATA[activeTab] || []) : [];

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (currentItems.length > 0 && !selected) setSelected(currentItems[0]);
  }, [activeTab]);

  useEffect(() => {
    if (tabs && currentItems.length > 0) setSelected(currentItems[0]);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
    const items = window.MATERIALS_DATA[key] || [];
    setSelected(items[0] || null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
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

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(11,11,15,0.88)', backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '8px' : '16px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#0F0F13', border: '1px solid rgba(212,175,55,0.18)',
        borderRadius: '6px', width: '100%',
        maxWidth: '1080px',
        height: isMobile ? '85vh' : '650px',
        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
        overflow: 'hidden', boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '14px 18px' : '18px 26px', borderBottom: '1px solid rgba(212,175,55,0.12)',
          flexShrink: 0,
        }}>
          <div>
            <h2 style={{ fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '18px' : '24px', fontWeight: 500, color: '#F5F0E6', letterSpacing: '0.05em' }}>
              Diseñá con confianza
            </h2>
            <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', color: 'rgba(245,240,230,0.4)', marginTop: '3px' }}>
              {'Seleccioná la textura y cotizá tu proyecto'}
            </p>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: '1px solid rgba(212,175,55,0.2)', borderRadius: '50%',
            width: '32px', height: '32px', cursor: 'pointer', color: 'rgba(245,240,230,0.5)',
            fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'color 0.2s, border-color 0.2s',
            flexShrink: 0,
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#D4AF37'; e.currentTarget.style.borderColor = '#D4AF37'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,230,0.5)'; e.currentTarget.style.borderColor = 'rgba(212,175,55,0.2)'; }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          flex: 1, 
          overflow: isMobile ? 'auto' : 'hidden', 
          minHeight: 0 
        }}>
          {sent ? (
            /* Success */
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px', textAlign: 'center' }}>
              <div style={{ width: '70px', height: '70px', border: '2px solid #D4AF37', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px', color: '#D4AF37', marginBottom: '24px' }}>✓</div>
              <h3 style={{ fontFamily: "'Figtree', sans-serif", fontSize: '30px', color: '#F5F0E6', marginBottom: '12px' }}>Solicitud enviada</h3>
              <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '14px', color: 'rgba(245,240,230,0.55)', lineHeight: 1.7, maxWidth: '380px' }}>
                Recibimos tu cotización. Nos pondremos en contacto a la brevedad.
              </p>
              <button onClick={onClose} style={{ marginTop: '32px', background: '#D4AF37', color: '#0B0B0F', border: 'none', borderRadius: '2px', padding: '12px 36px', cursor: 'pointer', fontFamily: "'Figtree', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em' }}>
                Cerrar
              </button>
            </div>
          ) : step === 'form' ? (
            /* Form step */
            <div style={{ flex: 1, overflow: 'auto', padding: isMobile ? '24px 16px' : '40px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: '100%', maxWidth: '580px' }}>
                <button onClick={() => setStep('select')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#D4AF37', fontFamily: "'Figtree', sans-serif", fontSize: '12px', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', padding: 0 }}>
                  ← Volver a materiales
                </button>
                {selected && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '26px', padding: '0', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)' }}>
                    <div style={{ width: '100px', height: '80px', flexShrink: 0, overflow: 'hidden' }}>
                      <img src={selected.mesa || selected.img} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div style={{ padding: '0 16px 0 0' }}>
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '10px', color: '#D4AF37', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '4px' }}>Material seleccionado</p>
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '16px' : '20px', fontWeight: 600, color: '#F5F0E6', letterSpacing: '-0.01em' }}>{selected.name}</p>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                    gap: '16px', 
                    width: '100%' 
                  }}>
                  {[
                    { key: 'nombre', label: 'Nombre completo', placeholder: 'Tu nombre', type: 'text', full: false },
                    { key: 'telefono', label: 'Teléfono', placeholder: '+54 11 0000-0000', type: 'tel', full: false },
                    { key: 'email', label: 'Email', placeholder: 'email@ejemplo.com', type: 'email', full: true },
                    { key: 'metros', label: 'Metros cuadrados aprox.', placeholder: 'Ej: 4.5 m²', type: 'text', full: false },
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
                    <button type="submit" style={{ width: '100%', background: '#D4AF37', color: '#0B0B0F', border: 'none', borderRadius: '2px', padding: '14px', cursor: 'pointer', fontFamily: "'Figtree', sans-serif", fontSize: '13px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#c9a42e'}
                      onMouseLeave={e => e.currentTarget.style.background = '#D4AF37'}
                    >Enviar cotización</button>
                  </div>
                  </div>
                </form>
              </div>
            </div>
          ) : (
            /* Material select */
            <>
              {/* Left visualizer — mesa renderizada */}
              <div style={{ 
                flex: isMobile ? 'none' : '0 0 60%', 
                height: isMobile ? '220px' : 'auto',
                position: 'relative', 
                overflow: 'hidden', 
                background: '#0a0804',
                flexShrink: 0
              }}>
                {selected && (
                  <>
                    {/* Mesa image — fades between selections */}
                    <img
                      key={selected.id}
                      src={selected.mesa || selected.img}
                      alt={selected.name}
                      loading="lazy"
                      style={{
                        width: '100%', height: '100%',
                        objectFit: selected.fit || 'cover', objectPosition: 'center',
                        display: 'block',
                        animation: 'fadein 0.4s ease',
                      }}
                    />
                    {/* Bottom overlay with name */}
                    <div style={{
                      position: 'absolute', bottom: 0, left: 0, right: 0,
                      background: 'linear-gradient(to top, rgba(8,6,4,0.92) 0%, transparent 80%)',
                      padding: isMobile ? '16px' : '32px 28px 26px',
                    }}>
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '10px', color: '#D4AF37', letterSpacing: '0.18em', textTransform: 'uppercase', marginBottom: '4px' }}>
                        {tabs.find(t => t.key === activeTab)?.label}
                      </p>
                      <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: isMobile ? '20px' : '30px', fontWeight: 600, color: '#F5F0E6', lineHeight: 1.1, letterSpacing: '-0.01em' }}>
                        {selected.name}
                      </p>
                      {/* Swatch circle */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', overflow: 'hidden', border: '1.5px solid #D4AF37', flexShrink: 0 }}>
                          <img src={selected.img} alt={selected.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                        <span style={{ fontFamily: "'Figtree', sans-serif", fontSize: '11px', color: 'rgba(245,240,230,0.5)' }}>Textura de referencia</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Right panel */}
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column', 
                borderLeft: isMobile ? 'none' : '1px solid rgba(212,175,55,0.1)', 
                borderTop: isMobile ? '1px solid rgba(212,175,55,0.1)' : 'none',
                overflow: isMobile ? 'visible' : 'hidden',
                background: '#0F0F13'
              }}>
                {/* Tabs */}
                <div style={{
                  display: 'flex', flexWrap: 'wrap', gap: '8px',
                  padding: '14px 16px', flexShrink: 0,
                  borderBottom: '1px solid rgba(212,175,55,0.1)',
                }}>
                  {tabs.map(tab => {
                    const active = activeTab === tab.key;
                    return (
                      <button key={tab.key} onClick={() => handleTabChange(tab.key)} style={{
                        background: active ? 'rgba(212,175,55,0.14)' : 'rgba(255,255,255,0.04)',
                        border: active ? '1px solid rgba(212,175,55,0.55)' : '1px solid rgba(255,255,255,0.09)',
                        borderRadius: '50px',
                        color: active ? '#D4AF37' : 'rgba(245,240,230,0.5)',
                        padding: '7px 16px', cursor: 'pointer',
                        fontFamily: "'Figtree', sans-serif", fontSize: '11px', fontWeight: active ? 600 : 400,
                        letterSpacing: '0.07em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                        transition: 'all 0.2s',
                      }}>{tab.label}</button>
                    );
                  })}
                </div>

                {/* Swatches */}
                <div style={{ 
                  flex: isMobile ? 'none' : 1, 
                  overflow: isMobile ? 'visible' : 'auto', 
                  padding: isMobile ? '16px 12px' : '18px 16px' 
                }}>
                  <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(245,240,230,0.3)', marginBottom: '14px' }}>
                    Seleccioná el material
                  </p>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: isMobile ? 'repeat(auto-fill, minmax(72px, 1fr))' : 'repeat(3, 1fr)', 
                    gap: '12px' 
                  }}>
                    {currentItems.map(item => (
                      <div key={item.id} onClick={() => setSelected(item)} style={{ cursor: 'pointer', textAlign: 'center' }}>
                        <div style={{
                          width: isMobile ? '56px' : '64px', 
                          height: isMobile ? '56px' : '64px', 
                          borderRadius: '50%', overflow: 'hidden',
                          border: selected?.id === item.id ? '2.5px solid #D4AF37' : '2px solid rgba(212,175,55,0.15)',
                          margin: '0 auto 5px',
                          transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
                          transform: selected?.id === item.id ? 'scale(1.08)' : 'scale(1)',
                          boxShadow: selected?.id === item.id ? '0 4px 14px rgba(212,175,55,0.25)' : 'none',
                        }}>
                          <img src={item.img} alt={item.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: item.fit || 'cover' }} />
                        </div>
                        <p style={{ fontFamily: "'Figtree', sans-serif", fontSize: '10px', lineHeight: 1.3, color: selected?.id === item.id ? '#D4AF37' : 'rgba(245,240,230,0.5)', fontWeight: selected?.id === item.id ? 600 : 400 }}>
                          {item.name}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div style={{ 
                  padding: '14px 16px', 
                  borderTop: '1px solid rgba(212,175,55,0.1)', 
                  flexShrink: 0,
                  position: isMobile ? 'sticky' : 'static',
                  bottom: 0,
                  background: '#0F0F13',
                  zIndex: 10
                }}>
                  <button onClick={() => setStep('form')} disabled={!selected} style={{
                    width: '100%', background: selected ? '#D4AF37' : 'rgba(212,175,55,0.15)',
                    color: selected ? '#0B0B0F' : 'rgba(245,240,230,0.25)',
                    border: 'none', borderRadius: '2px', padding: '13px',
                    cursor: selected ? 'pointer' : 'not-allowed',
                    fontFamily: "'Figtree', sans-serif", fontSize: '12px', fontWeight: 600,
                    letterSpacing: '0.1em', textTransform: 'uppercase', transition: 'background 0.2s',
                  }}
                  onMouseEnter={e => { if (selected) e.currentTarget.style.background = '#c9a42e'; }}
                  onMouseLeave={e => { if (selected) e.currentTarget.style.background = '#D4AF37'; }}
                  >
                    Cotizar mi proyecto
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
