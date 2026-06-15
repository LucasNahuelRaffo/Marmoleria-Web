const { useState } = React;

function ServiceCard({ section, onInfoClick }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onInfoClick(section)}
      style={{
        position: 'relative', cursor: 'pointer',
        borderRadius: '24px', overflow: 'hidden',
        background: 'linear-gradient(160deg, rgba(255,255,255,0.09) 0%, rgba(255,255,255,0.02) 50%, rgba(255,255,255,0.05) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: `1px solid ${hovered ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.12)'}`,
        display: 'flex', flexDirection: 'column',
        transition: 'transform 0.32s ease, box-shadow 0.32s ease, border-color 0.25s',
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        boxShadow: hovered ?
        '0 28px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)' :
        '0 8px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.1)'
      }}>
      
      {/* Image top */}
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden', flexShrink: 0 }}>
        <img src={section.img} alt={section.title} style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transition: 'transform 0.65s cubic-bezier(0.25,0.46,0.45,0.94)',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          display: 'block'
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to bottom, rgba(8,6,4,0.05) 0%, rgba(8,6,4,0.12) 50%, rgba(14,11,7,0.9) 100%)'
        }} />
        {/* Tag */}
        <div style={{
          position: 'absolute', top: '16px', left: '16px',
          padding: '5px 14px', borderRadius: '50px',
          background: 'rgba(11,9,6,0.55)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(212,175,55,0.3)',
          fontFamily: "'Figtree', sans-serif",
          fontSize: '10px', fontWeight: 600,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: "rgb(255, 255, 255)"

        }}>
          {section.id === 'sec-marmoleria' ? 'Materiales' :
          section.id === 'sec-electricidad' ? 'Instalaciones' :
          section.id === 'sec-muebles' ? 'A medida' : 'Accesorios'}
        </div>
        {/* Title over image */}
        <h3 style={{
          position: 'absolute', left: '20px', right: '20px', bottom: '16px',
          fontFamily: "'Figtree', sans-serif",
          fontSize: '26px', fontWeight: 700,
          color: '#F5F0E6', lineHeight: 1.1,
          letterSpacing: '-0.02em',
          textShadow: '0 2px 20px rgba(0,0,0,0.7)'
        }}>{section.title}</h3>
      </div>

      {/* Body */}
      <div style={{ padding: '22px 22px 24px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <p style={{
          fontFamily: "'Figtree', sans-serif",
          fontSize: '14px', lineHeight: 1.7,
          color: 'rgba(245,240,230,0.58)',
          marginBottom: '18px',
          flex: 1
        }}>
          {section.description.length > 110 ? section.description.slice(0, 110) + '…' : section.description}
        </p>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: `rgba(255,255,255,${hovered ? '0.12' : '0.06'})`,
          marginBottom: '16px',
          transition: 'background 0.3s'
        }} />

        {/* Features */}
        <ul style={{ listStyle: 'none', marginBottom: '20px' }}>
          {section.features.slice(0, 3).map((f, i) =>
          <li key={i} style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            fontFamily: "'Figtree', sans-serif",
            fontSize: '13px', color: 'rgba(245,240,230,0.65)',
            marginBottom: '8px'
          }}>
              <span style={{ color: '#D4AF37', fontSize: '10px', flexShrink: 0 }}>◈</span>
              {f}
            </li>
          )}
        </ul>

        {/* Footer row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={(e) => {e.stopPropagation();onInfoClick(section);}}
            style={{
              background: 'none', border: 'none', padding: 0, cursor: 'pointer',
              fontFamily: "'Figtree', sans-serif",
              fontSize: '12px', fontWeight: 600,
              letterSpacing: '0.1em', textTransform: 'uppercase',
              color: '#F5F0E6',
              display: 'flex', alignItems: 'center', gap: '6px',
              transition: 'gap 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.gap = '10px'}
            onMouseLeave={(e) => e.currentTarget.style.gap = '6px'}>
            
            Ver más <span style={{ fontSize: '14px' }}>›</span>
          </button>

          {/* Arrow circle */}
          <div style={{
            width: '34px', height: '34px', borderRadius: '50%',
            border: `1px solid ${hovered ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.12)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: hovered ? '#D4AF37' : 'rgba(245,240,230,0.35)',
            fontSize: '14px',
            transition: 'border-color 0.25s, color 0.25s'
          }}>›</div>
        </div>
      </div>
    </div>);

}

function InfoSections({ onInfoClick }) {
  return (
    <section style={{
      position: 'relative',
      padding: '80px 5.5% 120px',
      overflow: 'hidden'
    }}>
      {/* Subtle bg */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, #0B0B0F 0%, #0e0c09 50%, #0B0B0F 100%)'
      }} />

      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1280px', margin: '0 auto' }}>
        {/* Section header */}
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <p style={{
            fontFamily: "'Figtree', sans-serif",
            fontSize: '11px', letterSpacing: '0.22em',
            textTransform: 'uppercase', color: '#D4AF37',
            marginBottom: '14px'
          }}>Lo que hacemos</p>
          <h2 style={{
            fontFamily: "'Figtree', sans-serif",

            color: '#F5F0E6',
            fontWeight: "400", fontSize: "45px", lineHeight: "0.85", letterSpacing: "1px"
          }}>Nuestros servicios</h2>
        </div>

        {/* 2×2 Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '18px'
        }}>
          {INFO_SECTIONS_DATA.map((section) =>
          <section key={section.id} id={section.id}>
              <ServiceCard section={section} onInfoClick={onInfoClick} />
            </section>
          )}
        </div>
      </div>
    </section>);

}

Object.assign(window, { InfoSections, ServiceCard });