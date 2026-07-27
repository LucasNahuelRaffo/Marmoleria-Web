const { useState, useEffect } = React;

const SECONDS_PER_ITEM = 3.6;

function ProductCard({ item, context, onProductClick, isMobile }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={() => onProductClick(context)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Cotizar ${item.name}`}
      style={{
        position: 'relative', flexShrink: 0,
        width: isMobile ? '148px' : '196px',
        aspectRatio: '4/5',
        borderRadius: '18px', overflow: 'hidden',
        cursor: 'pointer', padding: 0, textAlign: 'left',
        background: '#0e0c09',
        border: `1px solid ${hovered ? 'rgba(212,175,55,0.65)' : 'rgba(255,255,255,0.10)'}`,
        boxShadow: hovered
          ? '0 22px 44px rgba(0,0,0,0.55), 0 0 0 1px rgba(212,175,55,0.15)'
          : '0 8px 20px rgba(0,0,0,0.3)',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.35s cubic-bezier(0.16,1,0.3,1), box-shadow 0.35s ease, border-color 0.3s ease',
        willChange: 'transform',
      }}
    >
      <img src={item.img} alt={item.name} loading="lazy" style={{
        position: 'absolute', inset: 0, width: '100%', height: '100%',
        objectFit: item.fit || 'cover', objectPosition: 'center',
        transform: hovered ? 'scale(1.09)' : 'scale(1)',
        transition: 'transform 0.6s cubic-bezier(0.16,1,0.3,1)',
        display: 'block',
      }} />

      {/* Degradé para legibilidad del nombre */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to bottom, transparent 45%, rgba(8,6,4,0.55) 78%, rgba(6,5,3,0.92) 100%)',
      }} />

      {/* Halo dorado sutil al hover */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(160deg, rgba(212,175,55,0.16) 0%, transparent 45%)',
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.35s ease',
      }} />

      <div style={{
        position: 'absolute', left: '12px', right: '12px', bottom: '12px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '6px',
      }}>
        <p style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: isMobile ? '12px' : '13px', fontWeight: 600, color: '#F5F0E6',
          lineHeight: 1.25, textShadow: '0 2px 10px rgba(0,0,0,0.6)',
        }}>{item.name}</p>
        <span style={{
          flexShrink: 0, width: '22px', height: '22px', borderRadius: '50%',
          border: `1px solid ${hovered ? '#D4AF37' : 'rgba(255,255,255,0.3)'}`,
          color: hovered ? '#D4AF37' : 'rgba(255,255,255,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '11px', transition: 'border-color 0.25s, color 0.25s, transform 0.3s',
          transform: hovered ? 'translateX(0)' : 'translateX(2px)',
          background: 'rgba(8,6,4,0.4)', backdropFilter: 'blur(4px)',
        }}>→</span>
      </div>
    </button>
  );
}

function ProductRow({ label, icon, items, context, direction, onProductClick, isMobile }) {
  // Duplicamos los items para el loop continuo sin salto visual.
  const track = [...items, ...items];
  const duration = Math.max(items.length * SECONDS_PER_ITEM, 20);

  return (
    <div className="marquee-row" style={{ marginBottom: isMobile ? '34px' : '44px' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: isMobile ? '0 4% 16px' : '0 5.5% 20px',
      }}>
        <span style={{
          width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
          border: '1px solid rgba(212,175,55,0.35)',
          background: 'linear-gradient(160deg, rgba(212,175,55,0.14) 0%, rgba(212,175,55,0.03) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#D4AF37', fontSize: '15px',
        }}>{icon}</span>
        <h3 style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: isMobile ? '16px' : '19px', fontWeight: 600,
          color: '#F5F0E6', letterSpacing: '0.01em', whiteSpace: 'nowrap',
        }}>{label}</h3>
        <span style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: '11px', color: 'rgba(245,240,230,0.35)',
          letterSpacing: '0.06em', whiteSpace: 'nowrap',
        }}>{items.length} productos</span>
        <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, rgba(212,175,55,0.28), transparent)' }} />
      </div>

      <div style={{
        overflow: 'hidden',
        WebkitMaskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
        maskImage: 'linear-gradient(to right, transparent, black 4%, black 96%, transparent)',
      }}>
        <div
          className="marquee-track"
          style={{
            display: 'flex', gap: isMobile ? '14px' : '18px',
            width: 'max-content',
            padding: isMobile ? '4px 4%' : '4px 5.5%',
            animation: `${direction === 'right' ? 'marqueeRight' : 'marqueeLeft'} ${duration}s linear infinite`,
          }}
        >
          {track.map((item, i) => (
            <ProductCard
              key={item.id + '-' + i}
              item={item} context={context}
              onProductClick={onProductClick} isMobile={isMobile}
            />
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
      padding: isMobile ? '64px 0 76px' : '96px 0 112px',
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
        <div style={{ textAlign: 'center', marginBottom: isMobile ? '44px' : '68px', padding: '0 5.5%' }}>
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
          <div style={{
            width: '60px', height: '1px', margin: '22px auto 24px',
            background: 'linear-gradient(to right, transparent, #D4AF37, transparent)',
          }} />
          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '14px', color: 'rgba(245,240,230,0.5)',
            maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto',
          }}>Tocá cualquier producto para armar tu proyecto con esa categoría ya seleccionada.</p>
        </div>

        {rows.map((row) => (
          <ProductRow key={row.label} {...row} onProductClick={onProductClick} isMobile={isMobile} />
        ))}
      </div>
    </section>
  );
}

Object.assign(window, { ProductsMarquee, ProductRow, ProductCard });
