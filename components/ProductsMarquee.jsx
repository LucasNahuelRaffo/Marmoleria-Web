const { useState, useEffect } = React;

const SECONDS_PER_ITEM = 3.4;

function ProductRow({ label, icon, items, context, direction, onProductClick, isMobile }) {
  // Duplicamos los items para el loop continuo sin salto visual.
  const track = [...items, ...items];
  const duration = Math.max(items.length * SECONDS_PER_ITEM, 18);

  return (
    <div className="marquee-row" style={{ marginBottom: isMobile ? '28px' : '36px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '10px',
        padding: isMobile ? '0 4% 14px' : '0 5.5% 16px',
      }}>
        <span style={{ color: '#D4AF37', fontSize: '15px' }}>{icon}</span>
        <h3 style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: isMobile ? '15px' : '17px', fontWeight: 600,
          color: '#F5F0E6', letterSpacing: '0.02em',
        }}>{label}</h3>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(212,175,55,0.25), transparent)' }} />
      </div>

      <div style={{
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
      }}>
        <div
          className="marquee-track"
          style={{
            display: 'flex', gap: isMobile ? '12px' : '16px',
            width: 'max-content',
            padding: isMobile ? '0 4%' : '0 5.5%',
            animation: `${direction === 'right' ? 'marqueeRight' : 'marqueeLeft'} ${duration}s linear infinite`,
          }}
        >
          {track.map((item, i) => (
            <button
              key={item.id + '-' + i}
              onClick={() => onProductClick(context)}
              aria-label={`Cotizar ${item.name}`}
              style={{
                flexShrink: 0, width: isMobile ? '116px' : '150px',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '14px', overflow: 'hidden',
                cursor: 'pointer', padding: 0, textAlign: 'left',
                transition: 'border-color 0.25s, transform 0.25s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(212,175,55,0.55)'; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div style={{ width: '100%', aspectRatio: '1/1', background: '#0e0c09', overflow: 'hidden' }}>
                <img src={item.img} alt={item.name} loading="lazy" style={{
                  width: '100%', height: '100%', objectFit: item.fit || 'cover', display: 'block',
                }} />
              </div>
              <p style={{
                fontFamily: "'Figtree', sans-serif",
                fontSize: '11.5px', fontWeight: 500, color: 'rgba(245,240,230,0.75)',
                padding: '9px 10px', lineHeight: 1.3,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{item.name}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProductsMarquee({ onProductClick }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const D = window.MATERIALS_DATA;
  const rows = [
    { label: 'Marmolería',  icon: '◈', items: [...D.marmoles, ...D.granitos, ...D.purastone], context: 'stone',        direction: 'left'  },
    { label: 'Muebles',     icon: '▣', items: [...D.cocinas, ...D.vanitorys, ...D.living],     context: 'muebles',      direction: 'right' },
    { label: 'Herrajes',    icon: '◆', items: D.herrajes,                                      context: 'herrajes',     direction: 'left'  },
    { label: 'Iluminación', icon: '◎', items: D.iluminacion,                                   context: 'electricidad', direction: 'right' },
  ];

  return (
    <section style={{
      position: 'relative',
      padding: isMobile ? '60px 0 70px' : '80px 0 100px',
      overflow: 'hidden',
    }}>
      {/* Subtle bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #0B0B0F 0%, #12100b 50%, #0B0B0F 100%)'
      }} />
      <div style={{
        position: 'absolute', top: '2%', left: '-80px',
        width: '640px', height: '640px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(224,180,74,0.18) 0%, rgba(212,175,55,0.07) 40%, transparent 72%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'absolute', bottom: '0%', right: '-90px',
        width: '680px', height: '680px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(224,180,74,0.17) 0%, rgba(212,175,55,0.06) 40%, transparent 72%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '36px' : '56px', padding: '0 5.5%' }}>
          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '11px', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#D4AF37',
            marginBottom: '14px'
          }}>Catálogo</p>
          <h2 style={{
            fontFamily: "'Figtree', sans-serif",
            color: '#F5F0E6',
            fontWeight: '400', fontSize: isMobile ? '30px' : '42px', lineHeight: '1.1', letterSpacing: '1px'
          }}>Nuestros productos</h2>
          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '14px', color: 'rgba(245,240,230,0.5)',
            marginTop: '14px', maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',
          }}>Tocá cualquier producto para armar tu proyecto con esa categoría ya seleccionada.</p>
        </div>

        {rows.map((row) => (
          <ProductRow key={row.label} {...row} onProductClick={onProductClick} isMobile={isMobile} />
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { ProductsMarquee, ProductRow });
