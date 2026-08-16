import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { notificationService } from '../services/notifications';

const Portal = () => {
  const [activeTab, setActiveTab] = useState('player');
  const [parentLoggedIn, setParentLoggedIn] = useState(true);
  const [coachLoggedIn, setCoachLoggedIn] = useState(true);
  
  // Database States
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [qrScanInput, setQrScanInput] = useState('');
  const [scanMessage, setScanMessage] = useState(null);
  
  // Attendance & Evaluations
  const [attendanceList, setAttendanceList] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  
  // Form State
  const [evalData, setEvalData] = useState({
    technical: 5,
    tactical: 4,
    discipline: 5,
    notes: ''
  });

  useEffect(() => {
    setPlayers(db.getPlayers());
    setAttendanceList(db.getAttendance());
    setEvaluations(db.getEvaluations());
  }, []);

  const handleQRScan = (e) => {
    e.preventDefault();
    if (!qrScanInput.trim()) return;
    
    const code = qrScanInput.trim().toUpperCase();
    const player = db.getPlayerById(code);
    
    if (player) {
      db.recordAttendance(player.id, 'Present');
      setAttendanceList(db.getAttendance());
      setScanMessage({ type: 'success', text: `✅ تم تسجيل الحضور: ${player.name}` });
      notificationService.sendLocalNotification(
        `✅ تسجيل حضور: ${player.name}`,
        `تم تسجيل حضور المشترك بنجاح في حصة التدريب اليوم.`
      );
    } else {
      setScanMessage({ type: 'error', text: `❌ رمز غير صالح (${code})` });
    }
    setQrScanInput('');
    setTimeout(() => setScanMessage(null), 4000);
  };

  const handleSaveReport = (e) => {
    e.preventDefault();
    if (!selectedPlayerId) {
      alert('يرجى اختيار اللاعب أولاً');
      return;
    }
    const player = db.getPlayerById(selectedPlayerId);
    db.saveEvaluation({
      playerId: player.id,
      playerName: player.name,
      technical: Number(evalData.technical),
      tactical: Number(evalData.tactical),
      discipline: Number(evalData.discipline),
      notes: evalData.notes
    });
    setEvaluations(db.getEvaluations());
    alert(`💾 تم حفظ التقييم لـ ${player.name}!`);
    setEvalData({ technical: 5, tactical: 4, discipline: 5, notes: '' });
  };

  return (
    <div style={{ 
      paddingTop: '16px', 
      paddingBottom: '24px', 
      minHeight: '100vh',
      background: '#08090C',
      color: '#FFF',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      direction: 'rtl'
    }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Role Switcher */}
        <div style={{ 
          display: 'flex', 
          background: 'rgba(255,255,255,0.05)', 
          borderRadius: '9999px',
          padding: '6px',
          marginBottom: '24px'
        }}>
          <button 
            onClick={() => setActiveTab('player')}
            style={{ 
              flex: 1, 
              padding: '10px 0', 
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'player' ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'transparent',
              color: activeTab === 'player' ? '#08090C' : '#8E9BAE',
              fontWeight: activeTab === 'player' ? 900 : 600,
              transition: 'all 0.3s ease',
              fontSize: '0.95rem'
            }}
          >
            🏆 لاعب
          </button>
          <button 
            onClick={() => setActiveTab('coach')}
            style={{ 
              flex: 1, 
              padding: '10px 0', 
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'coach' ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'transparent',
              color: activeTab === 'coach' ? '#08090C' : '#8E9BAE',
              fontWeight: activeTab === 'coach' ? 900 : 600,
              transition: 'all 0.3s ease',
              fontSize: '0.95rem'
            }}
          >
            👨‍🏫 مدرب
          </button>
          <button 
            onClick={() => setActiveTab('parent')}
            style={{ 
              flex: 1, 
              padding: '10px 0', 
              borderRadius: '9999px',
              border: 'none',
              background: activeTab === 'parent' ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'transparent',
              color: activeTab === 'parent' ? '#08090C' : '#8E9BAE',
              fontWeight: activeTab === 'parent' ? 900 : 600,
              transition: 'all 0.3s ease',
              fontSize: '0.95rem'
            }}
          >
            👨‍👩‍👧 ولي أمر
          </button>
        </div>

        {/* NOTIFICATION PERMISSION STATUS BAR */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '16px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
            <span>🔔</span>
            <span style={{ color: '#B0BEC5' }}>إشعارات الهاتف (PWA Web Push):</span>
          </div>
          {'Notification' in window && Notification.permission === 'granted' ? (
            <span style={{
              background: 'rgba(0, 230, 118, 0.15)',
              border: '1px solid #00E676',
              color: '#00E676',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '0.75rem',
              fontWeight: 800
            }}>
              ✅ مفعلة بنجاح
            </span>
          ) : (
            <button
              onClick={async () => {
                const granted = await notificationService.requestPermission();
                if (granted) {
                  alert('✅ تم تفعيل إشعارات الهاتف بنجاح!');
                  window.location.reload();
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                border: 'none',
                color: '#08090C',
                padding: '6px 14px',
                borderRadius: '10px',
                fontWeight: 900,
                fontSize: '0.78rem',
                cursor: 'pointer',
                fontFamily: 'inherit',
                boxShadow: '0 4px 12px rgba(255,193,7,0.3)'
              }}
            >
              ⚡ تفعيل الإشعارات الآن
            </button>
          )}
        </div>

        {/* PLAYER VIEW */}
        {activeTab === 'player' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ color: '#FFF', fontSize: '1.4rem', margin: 0 }}>Hi 👋 يوسف</h2>
              <div style={{ background: 'rgba(255,255,255,0.1)', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                🔔
              </div>
            </div>
            
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '24px', marginBottom: '20px' }}>
              <h3 style={{ color: '#FFF', fontSize: '1.6rem', marginBottom: '16px', lineHeight: '1.3' }}>مرحباً بعودتك،<br/>تتبع أداءك!</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <span style={{ color: '#8E9BAE', fontSize: '1rem' }}>فريق أولستار U14</span>
                <span style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107', padding: '6px 14px', borderRadius: '12px', fontWeight: 'bold', fontSize: '0.9rem' }}>78/100</span>
              </div>
              
              <div style={{ height: '10px', background: 'rgba(255,255,255,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: '67%', background: 'linear-gradient(135deg, #FFC107, #FF9500)', borderRadius: '5px' }}></div>
              </div>
              <div style={{ textAlign: 'left', marginTop: '8px', color: '#5A677B', fontSize: '0.85rem' }}>67% نحو المستوى التالي</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              {/* ⚡ Speed */}
              <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
                  <span style={{ color: '#FFF', fontSize: '0.95rem' }}>⚡ السرعة</span>
                  <span style={{ color: '#00E676', fontWeight: 'bold', fontSize: '1.1rem' }}>82</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '82%', background: '#00E676', borderRadius: '3px' }}></div>
                </div>
              </div>
              {/* 🎯 Passing */}
              <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
                  <span style={{ color: '#FFF', fontSize: '0.95rem' }}>🎯 التمرير</span>
                  <span style={{ color: '#FFC107', fontWeight: 'bold', fontSize: '1.1rem' }}>82</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '82%', background: '#FFC107', borderRadius: '3px' }}></div>
                </div>
              </div>
              {/* 💪 Stamina */}
              <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
                  <span style={{ color: '#FFF', fontSize: '0.95rem' }}>💪 اللياقة</span>
                  <span style={{ color: '#FF3D00', fontWeight: 'bold', fontSize: '1.1rem' }}>75</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '75%', background: '#FF3D00', borderRadius: '3px' }}></div>
                </div>
              </div>
              {/* ⚽ Shooting */}
              <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px', alignItems: 'center' }}>
                  <span style={{ color: '#FFF', fontSize: '0.95rem' }}>⚽ التسديد</span>
                  <span style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: '1.1rem' }}>85</span>
                </div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '85%', background: '#00E5FF', borderRadius: '3px' }}></div>
                </div>
              </div>
            </div>

            {/* STREAK & ACHIEVEMENTS BADGES */}
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,193,7,0.3)', borderRadius: '20px', padding: '18px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ color: '#FFC107', margin: 0, fontSize: '1rem', fontWeight: 900 }}>🔥 شارات التميز وسلسلة التثبيت (Streaks)</h4>
                <span style={{ fontSize: '0.78rem', background: '#FFC107', color: '#08090C', padding: '2px 8px', borderRadius: '10px', fontWeight: 900 }}>3 أوسمة</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1.6rem' }}>🔥</div>
                  <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#FFF', marginTop: '4px' }}>سلسلة 5 حصص</div>
                  <div style={{ fontSize: '0.68rem', color: '#00E676' }}>مكتملة 100%</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1.6rem' }}>⚡</div>
                  <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#FFF', marginTop: '4px' }}>حضور شهري</div>
                  <div style={{ fontSize: '0.68rem', color: '#FFC107' }}>مثالي (12/12)</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', padding: '10px 6px', borderRadius: '14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '1.6rem' }}>🎯</div>
                  <div style={{ fontWeight: 800, fontSize: '0.78rem', color: '#FFF', marginTop: '4px' }}>دقة التسديد</div>
                  <div style={{ fontSize: '0.68rem', color: '#00E5FF' }}>وسام ماسي</div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ color: '#FFC107', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '2px' }}>12</div>
                <div style={{ color: '#8E9BAE', fontSize: '0.85rem' }}>أهداف</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ color: '#00E5FF', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '2px' }}>48h</div>
                <div style={{ color: '#8E9BAE', fontSize: '0.85rem' }}>ساعات تدريب</div>
              </div>
              <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)' }}></div>
              <div style={{ textAlign: 'center', flex: 1 }}>
                <div style={{ color: '#00E676', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '2px' }}>#1</div>
                <div style={{ color: '#8E9BAE', fontSize: '0.85rem' }}>الترتيب</div>
              </div>
            </div>

            <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '16px' }}>النشاطات الأخيرة</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(0,230,118,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>🏆</div>
                <div>
                  <div style={{ color: '#FFF', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.95rem' }}>فوز بالمباراة ضد النجم</div>
                  <div style={{ color: '#8E9BAE', fontSize: '0.85rem' }}>السبت الماضي • 3-1</div>
                </div>
              </div>
              <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ background: 'rgba(0,229,255,0.1)', width: '48px', height: '48px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>⚽</div>
                <div>
                  <div style={{ color: '#FFF', fontWeight: 'bold', marginBottom: '4px', fontSize: '0.95rem' }}>حصة تدريبية مكتملة</div>
                  <div style={{ color: '#8E9BAE', fontSize: '0.85rem' }}>الأمس • حضور تام</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* COACH VIEW */}
        {activeTab === 'coach' && (
          <div>
            <h2 style={{ color: '#FFF', fontSize: '1.6rem', marginBottom: '24px' }}>لوحة المدرب</h2>

            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '20px', marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '6px' }}>حصة اليوم ⚽</h3>
                <div style={{ color: '#8E9BAE', fontSize: '0.9rem' }}>16:00 - 18:00 • الفئة U14</div>
              </div>
              <div style={{ background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '16px', padding: '12px 20px', textAlign: 'center' }}>
                <div style={{ color: '#00E5FF', fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '2px' }}>24/28</div>
                <div style={{ color: '#8E9BAE', fontSize: '0.8rem' }}>حضور اليوم</div>
              </div>
            </div>

            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '16px', textAlign: 'center' }}>تسجيل الحضور</h3>
              <form onSubmit={handleQRScan}>
                <input 
                  type="text" 
                  value={qrScanInput} 
                  onChange={e => setQrScanInput(e.target.value)}
                  placeholder="أدخل رمز QR هنا..." 
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', fontSize: '1rem', textAlign: 'center', marginBottom: '16px', outline: 'none' }}
                />
                <button type="submit" style={{ background: 'linear-gradient(135deg, #FFC107, #FF9500)', color: '#08090C', fontWeight: 900, borderRadius: '9999px', width: '100%', padding: '16px', fontSize: '1.1rem', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                  مسح بطاقة الحضور 📷
                </button>
              </form>
              {scanMessage && (
                <div style={{ marginTop: '16px', padding: '12px', borderRadius: '12px', background: scanMessage.type === 'success' ? 'rgba(0,230,118,0.1)' : 'rgba(255,61,0,0.1)', color: scanMessage.type === 'success' ? '#00E676' : '#FF3D00', fontSize: '0.9rem', textAlign: 'center' }}>
                  {scanMessage.text}
                </div>
              )}
            </div>

            {/* Player evaluation form */}
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '20px' }}>تقييم اللاعبين</h3>
              <form onSubmit={handleSaveReport}>
                <select 
                  value={selectedPlayerId} 
                  onChange={e => setSelectedPlayerId(e.target.value)}
                  style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', marginBottom: '20px', outline: 'none' }}
                >
                  <option value="" style={{ color: '#000' }}>-- اختر اللاعب --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id} style={{ color: '#000' }}>{p.name} ({p.sport})</option>
                  ))}
                </select>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', color: '#8E9BAE', fontSize: '0.85rem', marginBottom: '8px', textAlign: 'center' }}>فني</label>
                    <input type="number" min="1" max="5" value={evalData.technical} onChange={e => setEvalData({...evalData, technical: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', textAlign: 'center', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#8E9BAE', fontSize: '0.85rem', marginBottom: '8px', textAlign: 'center' }}>تكتيكي</label>
                    <input type="number" min="1" max="5" value={evalData.tactical} onChange={e => setEvalData({...evalData, tactical: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', textAlign: 'center', outline: 'none' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', color: '#8E9BAE', fontSize: '0.85rem', marginBottom: '8px', textAlign: 'center' }}>انضباط</label>
                    <input type="number" min="1" max="5" value={evalData.discipline} onChange={e => setEvalData({...evalData, discipline: e.target.value})} style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', textAlign: 'center', outline: 'none' }} />
                  </div>
                </div>

                <textarea 
                  rows="3" 
                  value={evalData.notes}
                  onChange={e => setEvalData({...evalData, notes: e.target.value})}
                  placeholder="ملاحظات المدرب..." 
                  style={{ width: '100%', padding: '16px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', marginBottom: '20px', resize: 'none', outline: 'none' }} 
                />

                <button type="submit" style={{ background: 'rgba(255,255,255,0.08)', color: '#FFF', fontWeight: 'bold', borderRadius: '9999px', width: '100%', padding: '16px', border: '1px solid rgba(255,255,255,0.2)', cursor: 'pointer', transition: 'all 0.3s' }}>
                  حفظ التقييم
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PARENT VIEW */}
        {activeTab === 'parent' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ color: '#FFF', fontSize: '1.4rem', margin: 0, marginBottom: '4px' }}>متابعة ابنك 👨‍👦</h2>
                <div style={{ color: '#8E9BAE', fontSize: '0.9rem' }}>يوسف المنصوري - U14</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.1)', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                ⚙️
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
              <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(0,230,118,0.2)', borderRadius: '20px', padding: '20px' }}>
                <div style={{ color: '#8E9BAE', fontSize: '0.9rem', marginBottom: '10px' }}>نسبة الحضور</div>
                <div style={{ color: '#00E676', fontSize: '1.6rem', fontWeight: 'bold', marginBottom: '10px' }}>92%</div>
                <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: '92%', background: '#00E676', borderRadius: '3px' }}></div>
                </div>
              </div>
              
              <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,193,7,0.2)', borderRadius: '20px', padding: '20px' }}>
                <div style={{ color: '#8E9BAE', fontSize: '0.9rem', marginBottom: '10px' }}>الاشتراك</div>
                <div style={{ color: '#FFC107', fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '6px' }}>نشط ✅</div>
                <div style={{ color: '#5A677B', fontSize: '0.8rem' }}>ينتهي في 10/2026</div>
              </div>
            </div>

            {/* Child mini dashboard stats */}
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '26px', padding: '24px', marginBottom: '24px' }}>
              <h3 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '20px' }}>مؤشرات الأداء الأخيرة</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* ⚡ Speed */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#8E9BAE', fontSize: '0.9rem' }}>⚡ السرعة</span>
                    <span style={{ color: '#00E676', fontWeight: 'bold', fontSize: '0.9rem' }}>82</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '82%', background: '#00E676', borderRadius: '3px' }}></div>
                  </div>
                </div>
                {/* 🎯 Passing */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#8E9BAE', fontSize: '0.9rem' }}>🎯 التمرير</span>
                    <span style={{ color: '#FFC107', fontWeight: 'bold', fontSize: '0.9rem' }}>82</span>
                  </div>
                  <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: '82%', background: '#FFC107', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
            </div>

            <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '16px' }}>رسائل المدرب</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px' }}>
              <div style={{ background: 'rgba(25,29,42,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#FFC107', fontWeight: 'bold', fontSize: '0.95rem' }}>كابتن أحمد</span>
                  <span style={{ color: '#5A677B', fontSize: '0.8rem' }}>أمس</span>
                </div>
                <div style={{ color: '#8E9BAE', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  أداء يوسف كان ممتازاً في التدريب اليوم. يرجى التركيز على التمارين البدنية هذا الأسبوع.
                </div>
              </div>
              <div style={{ background: 'rgba(25,29,42,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span style={{ color: '#FFC107', fontWeight: 'bold', fontSize: '0.95rem' }}>إدارة الأكاديمية</span>
                  <span style={{ color: '#5A677B', fontSize: '0.8rem' }}>منذ 3 أيام</span>
                </div>
                <div style={{ color: '#8E9BAE', fontSize: '0.9rem', lineHeight: '1.6' }}>
                  تذكير: مباراة ودية يوم السبت القادم الساعة 9 صباحاً. الرجاء الحضور قبل الموعد بنصف ساعة.
                </div>
              </div>
            </div>

            <h3 style={{ color: '#FFF', fontSize: '1.2rem', marginBottom: '16px' }}>تاريخ الدفع</h3>
            <div style={{ background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#FFF', fontSize: '0.95rem' }}>سبتمبر 2026</span>
                <span style={{ color: '#00E676', fontWeight: 'bold', fontSize: '0.9rem' }}>مدفوع ✅</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: '#FFF', fontSize: '0.95rem' }}>أغسطس 2026</span>
                <span style={{ color: '#00E676', fontWeight: 'bold', fontSize: '0.9rem' }}>مدفوع ✅</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '14px' }}>
                <span style={{ color: '#FFF', fontSize: '0.95rem' }}>يوليو 2026</span>
                <span style={{ color: '#00E676', fontWeight: 'bold', fontSize: '0.9rem' }}>مدفوع ✅</span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Portal;
