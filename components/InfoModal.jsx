const { useEffect } = React;

function InfoModal({ section, onClose, onCotizar }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!section) return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(8,6,4,0.85)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '20px',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: 'linear-gradient(145deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1px solid rgba(255,255,255,0.14)',
        borderRadius: '28px',
        width: '100%', maxWidth: '960px',
        maxHeight: '88vh', display: 'flex', overflow: 'hidden',
        boxShadow: '0 40px 80px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.1)',
      }}>
        {/* Left — image */}
        <div style={{ flex: '0 0 46%', position: 'relative', overflow: 'hidden', borderRadius: '28px 0 0 28px' }}>
          <img src={section.img} alt={section.title} style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to right, transparent 55%, rgba(14,11,7,0.7) 100%)',
          }} />
          {/* Bottom gold line */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            height: '2px', background: 'linear-gradient(to right, #D4AF37, transparent 60%)',
          }} />
        </div>

        {/* Right — info */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          padding: '36px 36px 32px',
          borderLeft: '1px solid rgba(255,255,255,0.07)',
          overflow: 'auto',
        }}>
          {/* Header row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
            <div style={{
              padding: '5px 16px', borderRadius: '50px',
              background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.25)',
              fontFamily: "'Figtree', sans-serif",
              fontSize: '10px', fontWeight: 600,
              letterSpacing: '0.16em', textTransform: 'uppercase',
              color: '#D4AF37',
            }}>Nuestros servicios</div>
            <button onClick={onClose} style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '50%', width: '34px', height: '34px',
              cursor: 'pointer', color: 'rgba(245,240,230,0.5)', fontSize: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'color 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#F5F0E6'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(245,240,230,0.5)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
            >✕</button>
          </div>

          <h2 style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: 'clamp(28px, 3vw, 42px)',
            fontWeight: 700, color: '#F5F0E6',
            letterSpacing: '-0.02em', lineHeight: 1.1, marginBottom: '8px',
          }}>{section.title}</h2>

          <div style={{ width: '40px', height: '2px', background: '#D4AF37', marginBottom: '20px' }} />

          <p style={{
            fontFamily: "'Figtree', sans-serif", fontSize: '14px',
            lineHeight: 1.8, color: 'rgba(245,240,230,0.6)',
            marginBottom: '24px',
          }}>{section.description}</p>

          {/* Features */}
          <ul style={{ listStyle: 'none', marginBottom: '28px', flex: 1 }}>
            {section.features.map((feat, i) => (
              <li key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}>
                <span style={{ color: '#D4AF37', fontSize: '10px', flexShrink: 0 }}>◈</span>
                <span style={{
                  fontFamily: "'Figtree', sans-serif", fontSize: '14px',
                  color: 'rgba(245,240,230,0.7)',
                }}>{feat}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <button
            onClick={() => { onClose(); onCotizar(section.cotizadorContext); }}
            style={{
              background: '#D4AF37', color: '#0B0B0F',
              border: 'none', borderRadius: '50px',
              padding: '13px 32px', cursor: 'pointer',
              fontFamily: "'Figtree', sans-serif",
              fontSize: '14px', fontWeight: 600,
              letterSpacing: '0.02em',
              alignSelf: 'flex-start',
              boxShadow: '0 6px 20px rgba(212,175,55,0.3)',
              transition: 'background 0.2s, transform 0.15s, box-shadow 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#e8c44a';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#D4AF37';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Cotizar este servicio →
          </button>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { InfoModal });
