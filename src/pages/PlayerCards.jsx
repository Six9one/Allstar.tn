import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';

export default function PlayerCards(props) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');

  // 3D Tilt & Holographic Foil States
  const [tilt, setTilt] = useState({ x: 0, y: 0, shineX: 50, shineY: 50 });
  const cardRef = useRef(null);

  useEffect(() => {
    const list = db.getPlayers();
    setPlayers(list);
    if (list.length > 0) {
      setSelectedPlayerId(list[0].id);
    }

    db.getPlayersAsync().then((liveList) => {
      setPlayers(liveList);
      if (liveList.length > 0) {
        setSelectedPlayerId(prev => prev || liveList[0].id);
      }
    });

    const unsub = db.subscribeToRealtime(null, (livePlayers) => {
      setPlayers(livePlayers);
    });

    // Mobile Gyroscope Listener
    const handleDeviceOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        // gamma: left-to-right tilt (-90 to 90), beta: front-to-back tilt (-180 to 180)
        const rotY = Math.min(25, Math.max(-25, e.gamma / 2.5));
        const rotX = Math.min(25, Math.max(-25, (e.beta - 45) / 2.5));
        setTilt({
          x: rotX,
          y: rotY,
          shineX: 50 + rotY * 1.5,
          shineY: 50 + rotX * 1.5
        });
      }
    };

    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleDeviceOrientation);
    }
    return () => {
      if (unsub) unsub();
      if (window.DeviceOrientationEvent) {
        window.removeEventListener('deviceorientation', handleDeviceOrientation);
      }
    };
  }, []);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = ((y - centerY) / centerY) * -18;
    const rotY = ((x - centerX) / centerX) * 18;

    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;

    setTilt({ x: rotX, y: rotY, shineX, shineY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0, shineX: 50, shineY: 50 });
  };

  const currentPlayer = players.find(p => p.id === selectedPlayerId) || players[0] || {
    id: 'ALLSTAR-101',
    name: 'يوسف المنصوري',
    sport: 'Football',
    group: 'U12',
    photoUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&auto=format&fit=crop&q=80',
    stats: { speed: 88, puissance: 82, stamina: 75, shooting: 85, passing: 80, technique: 78, defense: 72, mental: 80 },
    matchStats: { goals: 5, assists: 3, points: 150 }
  };

  const statsObj = currentPlayer.stats || { speed: 80, puissance: 80, stamina: 80, shooting: 80, passing: 80, technique: 80, defense: 75, mental: 80 };
  const statValues = Object.values(statsObj);
  const ovr = Math.round(statValues.reduce((a, b) => a + b, 0) / statValues.length);
  const cardTier = ovr >= 85 ? { name: 'GOLD 🥇', color: '#FFC107', bg: 'linear-gradient(135deg, #FFC107, #FF9500)' } : ovr >= 75 ? { name: 'SILVER 🥈', color: '#E0E0E0', bg: 'linear-gradient(135deg, #E0E0E0, #9E9E9E)' } : { name: 'BRONZE 🥉', color: '#CD7F32', bg: 'linear-gradient(135deg, #CD7F32, #8D6E63)' };

  // Generate SVG Radar Chart Points
  const renderRadarChart = () => {
    const categories = ['Speed', 'Power', 'Shoot', 'Pass', 'Stamina', 'Def', 'Mental', 'Tech'];
    const values = [
      statsObj.speed || 80,
      statsObj.puissance || 80,
      statsObj.shooting || 80,
      statsObj.passing || 80,
      statsObj.stamina || 78,
      statsObj.defense || 72,
      statsObj.mental || 80,
      statsObj.technique || 78
    ];
    const center = 75;
    const radius = 55;
    const angleStep = (Math.PI * 2) / categories.length;

    const points = values.map((val, i) => {
      const r = (val / 100) * radius;
      const angle = i * angleStep - Math.PI / 2;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');

    const webPoints = [1, 0.7, 0.4].map(level => {
      return categories.map((_, i) => {
        const r = level * radius;
        const angle = i * angleStep - Math.PI / 2;
        return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
      }).join(' ');
    });

    return (
      <svg viewBox="0 0 150 150" style={{ width: '130px', height: '130px', margin: '0 auto' }}>
        {/* Background Web */}
        {webPoints.map((pts, idx) => (
          <polygon key={idx} points={pts} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        ))}

        {/* Axes */}
        {categories.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          return (
            <line
              key={i}
              x1={center} y1={center}
              x2={center + radius * Math.cos(angle)}
              y2={center + radius * Math.sin(angle)}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth="1"
            />
          );
        })}

        {/* Player Skill Polygon */}
        <polygon points={points} fill="rgba(255,193,7,0.35)" stroke="#FFC107" strokeWidth="2.5" />
      </svg>
    );
  };

  return (
    <div style={{
      backgroundColor: '#08090C',
      minHeight: '100vh',
      color: '#FFFFFF',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      direction: 'rtl',
      paddingBottom: '40px'
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        paddingTop: '16px',
        paddingLeft: '16px',
        paddingRight: '16px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{
            color: '#FFC107',
            fontSize: '28px',
            fontWeight: '900',
            margin: '0 0 8px 0'
          }}>
            بطاقات اللاعبين الـ 3D 🎴
          </h1>
          <p style={{ color: '#8E9BAE', margin: '0', fontSize: '15px' }}>
            بطاقة FUT تفاعلية مع انعكاس هولوغرام وحساس التدوير 📱
          </p>
        </div>

        {/* Player Selector Dropdown */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <label style={{ display: 'block', marginBottom: '8px', color: '#FFC107', fontWeight: 800, fontSize: '0.9rem' }}>
            اختر اللاعب لعرض بطاقته التفاعلية 🏆
          </label>
          <select
            value={selectedPlayerId}
            onChange={e => setSelectedPlayerId(e.target.value)}
            style={{
              padding: '12px 20px', borderRadius: '16px',
              background: 'rgba(255,255,255,0.08)', border: '1.5px solid #FFC107',
              color: '#FFF', fontWeight: 900, fontSize: '1rem', outline: 'none',
              cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif', width: '100%', maxWidth: '320px'
            }}
          >
            {players.map(p => (
              <option key={p.id} value={p.id} style={{ color: '#000' }}>
                {p.name.split('(')[0].trim()} ({p.sport} - {p.group})
              </option>
            ))}
          </select>
        </div>

        {/* 3D Holographic FUT Featured Card */}
        <div style={{
          marginBottom: '32px',
          display: 'flex',
          justifyContent: 'center',
          perspective: '1200px'
        }}>
          <div 
            ref={cardRef}
            onClick={() => setIsFlipped(!isFlipped)}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              width: '100%',
              maxWidth: '320px',
              aspectRatio: '2.5 / 3.8',
              transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y + (isFlipped ? 180 : 0)}deg)`,
              transformStyle: 'preserve-3d',
              transition: isFlipped ? 'transform 0.8s cubic-bezier(0.4, 0.2, 0.2, 1)' : 'transform 0.1s ease-out',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {/* Front side */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, rgba(25,29,42,0.98), rgba(14,16,24,0.99))',
              border: `2.5px solid ${cardTier.color}`,
              borderRadius: '26px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: `0 20px 40px rgba(0,0,0,0.6), 0 0 30px ${cardTier.color}40`,
              overflow: 'hidden'
            }}>
              {/* Dynamic Holographic Foil Overlay */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
                background: `radial-gradient(circle at ${tilt.shineX}% ${tilt.shineY}%, rgba(255,255,255,0.4) 0%, rgba(255,215,0,0.2) 25%, rgba(0,229,255,0.15) 50%, transparent 75%)`,
                mixBlendMode: 'overlay', opacity: 0.8
              }} />

              {/* Gold Banner */}
              <div style={{
                background: cardTier.bg,
                color: '#08090C',
                textAlign: 'center',
                fontWeight: '900',
                padding: '8px 14px',
                fontSize: '14px',
                letterSpacing: '1px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span>OVR: {ovr}</span>
                <span style={{ fontSize: '12px' }}>ALL-STAR FUT</span>
                <span>{cardTier.name}</span>
              </div>

              <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 2 }}>
                <div style={{ fontSize: '26px', marginBottom: '4px' }}>🛡️</div>
                <img
                  src={currentPlayer.photoUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&auto=format&fit=crop&q=80'}
                  alt={currentPlayer.name}
                  style={{
                    width: '115px',
                    height: '115px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: '12px',
                    border: `3px solid ${cardTier.color}`,
                    boxShadow: `0 0 25px ${cardTier.color}60`
                  }}
                />
                
                <h2 style={{ margin: '0 0 4px 0', fontSize: '20px', fontWeight: '900', textAlign: 'center' }}>{currentPlayer.name.split('(')[0]}</h2>
                <p style={{ margin: '0', color: cardTier.color, fontSize: '14px', fontWeight: 'bold' }}>
                  {currentPlayer.sport} — {currentPlayer.group}
                </p>
                <div style={{ marginTop: '10px', fontSize: '0.78rem', color: '#00E676', fontWeight: 800, background: 'rgba(0,230,118,0.1)', padding: '4px 12px', borderRadius: '12px' }}>
                  ⚽ أهداف: {currentPlayer.matchStats?.goals || 0} | 🎯 تمريرات: {currentPlayer.matchStats?.assists || 0}
                </div>
              </div>

              <div style={{
                background: 'rgba(0,0,0,0.6)',
                padding: '12px',
                textAlign: 'center',
                fontSize: '12px',
                color: '#8E9BAE',
                borderTop: '1px solid rgba(255,255,255,0.08)',
                zIndex: 2
              }}>
                المدرب: {currentPlayer.coachName || 'الكابتن أحمد'} • تطاوين 🇹🇳
              </div>
            </div>

            {/* Back side */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              backfaceVisibility: 'hidden',
              background: 'linear-gradient(145deg, rgba(25,29,42,0.98), rgba(14,16,24,0.99))',
              border: `2.5px solid ${cardTier.color}`,
              borderRadius: '26px',
              transform: 'rotateY(180deg)',
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              boxSizing: 'border-box'
            }}>
              <h3 style={{ margin: '0 0 10px 0', color: '#FFC107', textAlign: 'center', fontSize: '16px', fontWeight: 900 }}>رادار مهارات اللاعب 🎯</h3>
              
              {/* Skill Radar Chart */}
              <div style={{ margin: '0 auto 10px auto' }}>
                {renderRadarChart()}
              </div>

              {/* Stats Grid */}
              <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                {[
                  { label: 'السرعة', val: statsObj.speed || 80, color: '#00E5FF' },
                  { label: 'القوة', val: statsObj.puissance || 80, color: '#FF9500' },
                  { label: 'التسديد', val: statsObj.shooting || 80, color: '#FF3D00' },
                  { label: 'التمرير', val: statsObj.passing || 80, color: '#00E676' },
                ].map(stat => (
                  <div key={stat.label} style={{ background: 'rgba(255,255,255,0.04)', padding: '6px 8px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                      <span style={{ color: '#8E9BAE' }}>{stat.label}</span>
                      <span style={{ fontWeight: 900, color: stat.color }}>{stat.val}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ margin: '8px 0 0 0', border: '1px solid rgba(255,193,7,0.3)', padding: '6px', textAlign: 'center', borderRadius: '12px', background: 'rgba(0,0,0,0.4)' }}>
                <div style={{ fontSize: '10px', color: '#FFC107', fontWeight: 800 }}>رمز QR الرسمي 📱 (ID: {currentPlayer.id})</div>
              </div>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px', color: '#5A677B', fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <span>اضغط على البطاقة للقلب 👆 • حرك الهاتف لـ 3D Tilt 📱</span>
          <a
            href="https://wa.me/21658263467?text=*طلب%20بطاقة%20لاعب%20مطبوعة%20FUT*%20اسم%20اللاعب:%20يوسف%20المنصوري"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: 'linear-gradient(135deg, #FFC107, #FF9500)',
              color: '#08090C',
              padding: '8px 18px',
              borderRadius: '20px',
              fontWeight: 900,
              fontSize: '0.85rem',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(255,193,7,0.3)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🏷️ طلب بطاقة بلاستيكية مطبوعة عبر WhatsApp
          </a>
        </div>

        {/* Card Tier Legend */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#FFFFFF' }}>مستويات البطاقات</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', marginLeft: '12px' }}>🥇</span>
              <div>
                <div style={{ fontWeight: 'bold', color: '#FFC107', fontSize: '14px' }}>الذهبية (GOLD)</div>
                <div style={{ fontSize: '12px', color: '#8E9BAE' }}>لاعب متميز ومثالي في الحضور والتطور</div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', marginLeft: '12px' }}>🥈</span>
              <div>
                <div style={{ fontWeight: 'bold', color: '#E0E0E0', fontSize: '14px' }}>الفضية (SILVER)</div>
                <div style={{ fontSize: '12px', color: '#8E9BAE' }}>لاعب مجتهد ذو أداء منتظم</div>
              </div>
            </div>
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '20px', marginLeft: '12px' }}>🥉</span>
              <div>
                <div style={{ fontWeight: 'bold', color: '#CD7F32', fontSize: '14px' }}>البرونزية (BRONZE)</div>
                <div style={{ fontSize: '12px', color: '#8E9BAE' }}>لاعب في بداية مسيرة التطور</div>
              </div>
            </div>
          </div>
        </div>

        {/* Team Cards Grid */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', margin: '0 0 12px 0', color: '#FFFFFF' }}>
            بطاقات أبطال الأكاديمية ({players.length}) ⚽
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            {players.map((p) => {
              const pStats = p.stats || { speed: 80, puissance: 80, stamina: 80 };
              const pOvr = Math.round(Object.values(pStats).reduce((a, b) => a + b, 0) / Object.values(pStats).length);
              const pTier = pOvr >= 85 ? { name: 'GOLD 🥇', color: '#FFC107' } : pOvr >= 75 ? { name: 'SILVER 🥈', color: '#E0E0E0' } : { name: 'BRONZE 🥉', color: '#CD7F32' };

              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlayerId(p.id)}
                  style={{
                    background: selectedPlayerId === p.id ? 'linear-gradient(145deg, rgba(255,193,7,0.15), rgba(14,16,24,0.98))' : 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
                    border: selectedPlayerId === p.id ? '2px solid #FFC107' : '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <img
                    src={p.photoUrl || p.photourl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=120&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px', border: `2px solid ${pTier.color}` }}
                  />
                  <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '2px', color: '#FFF' }}>
                    {p.name.split('(')[0].trim()}
                  </div>
                  <div style={{ fontSize: '12px', color: '#8E9BAE', marginBottom: '8px' }}>
                    {p.sport} — {p.group}
                  </div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: pTier.color,
                    fontSize: '11px',
                    fontWeight: 'bold',
                    padding: '4px 10px',
                    borderRadius: '9999px',
                    border: `1px solid ${pTier.color}40`
                  }}>
                    OVR {pOvr} • {pTier.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* QR Scanner Section */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '26px',
          padding: '24px',
          textAlign: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>مسح بطاقة للحضور 📷</h3>
          <p style={{ color: '#8E9BAE', fontSize: '14px', marginBottom: '20px' }}>
            استخدم كاميرا الهاتف لتسجيل حضور اللاعب عبر رمز QR الخاص به.
          </p>
          <button style={{
            background: 'linear-gradient(135deg, #00E5FF, #00B8D4)',
            color: '#08090C',
            border: 'none',
            borderRadius: '9999px',
            padding: '14px 24px',
            fontSize: '16px',
            fontWeight: '900',
            width: '100%',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span>مسح البطاقة</span>
            <span style={{ fontSize: '20px' }}>📷</span>
          </button>
        </div>

        {/* Download/Share Section */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button style={{
            flex: 1,
            background: 'linear-gradient(135deg, #FFC107, #FF9500)',
            color: '#08090C',
            border: 'none',
            borderRadius: '9999px',
            padding: '14px 0',
            fontSize: '15px',
            fontWeight: '900',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>طباعة البطاقة</span>
            <span>🖨️</span>
          </button>
          
          <button style={{
            flex: 1,
            background: 'transparent',
            color: '#FFFFFF',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '9999px',
            padding: '14px 0',
            fontSize: '15px',
            fontWeight: 'bold',
            cursor: 'pointer',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '6px'
          }}>
            <span>مشاركة</span>
            <span>📤</span>
          </button>
        </div>
      </div>
    </div>
  );
}
