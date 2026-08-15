import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { notificationService } from '../services/notifications';
import { PhotoStudioEngine, ALLSTAR_BACKDROPS } from '../services/photoStudio';

// ─── HELPERS ──────────────────────────────────────────────────────────────────
const SPORT_ICONS = { Football: '⚽', Basketball: '🏀', Handball: '🤾', 'Multi-Sport': '🏆' };
const SPORT_COLORS = { Football: '#00E676', Basketball: '#FF9500', Handball: '#00E5FF' };
const GROUPS = ['U8', 'U10', 'U12', 'U14', 'U16'];
const SPORTS = ['Football', 'Basketball', 'Handball'];

const inputStyle = {
  width: '100%', padding: '12px 16px', borderRadius: '14px',
  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)',
  color: '#FFF', fontSize: '0.9rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: '"Cairo", "Tajawal", sans-serif', transition: 'all 0.2s ease',
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
};
const labelStyle = { display: 'block', marginBottom: '8px', color: '#CBD5E1', fontWeight: 700, fontSize: '0.82rem', letterSpacing: '0.2px' };
const cardStyle = {
  background: 'linear-gradient(145deg, rgba(20, 26, 40, 0.75) 0%, rgba(10, 16, 28, 0.9) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  backdropFilter: 'blur(16px)',
  borderRadius: '24px', padding: '24px',
  boxShadow: '0 12px 32px rgba(0,0,0,0.4)'
};

function StatSlider({ label, value, onChange, color = '#FFC107' }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ fontSize: '0.82rem', color: '#B0BEC5', fontWeight: 700 }}>{label}</span>
        <span style={{ fontSize: '1rem', fontWeight: 900, color }}>{value}</span>
      </div>
      <div style={{ position: 'relative', height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
        <div style={{ width: `${value}%`, height: '100%', background: `linear-gradient(90deg, ${color}88, ${color})`, borderRadius: '4px', transition: 'width 0.2s' }} />
        <input
          type="range" min="0" max="100" value={value}
          onChange={e => onChange(Number(e.target.value))}
          style={{ position: 'absolute', top: '-8px', left: 0, right: 0, width: '100%', opacity: 0, cursor: 'pointer', height: '24px' }}
        />
      </div>
    </div>
  );
}

function ImageUploader({ label = 'Image Photo', value, onChange, size = 75 }) {
  const fileInputRef = useRef(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState('Processing Image...');
  const [selectedBackdrop, setSelectedBackdrop] = useState(null); // DEFAULT TO NULL (Original HD Photo without AI removal)

  const processAndSetImage = async (input, backdropId = selectedBackdrop) => {
    if (!input) return;
    const activeBd = backdropId !== undefined ? backdropId : selectedBackdrop;
    setIsProcessing(true);
    setStatusMsg(activeBd ? '⚡ AI Background Removal...' : 'Optimizing HD Image...');
    try {
      if (activeBd) {
        const res = await PhotoStudioEngine.processPhoto(input, {
          backdropId: activeBd,
          onProgress: (msg) => setStatusMsg(msg)
        });
        onChange(res.dataUrl);
      } else {
        const optUrl = await PhotoStudioEngine.optimizePhoto(input);
        onChange(optUrl);
      }
    } catch (e) {
      console.error('ImageUploader process error:', e);
      if (typeof input === 'string') onChange(input);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      await processAndSetImage(file, selectedBackdrop);
    }
  };

  return (
    <div style={{ marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '12px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <label style={labelStyle}>{label}</label>

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {isProcessing ? (
          <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: 'rgba(0,230,118,0.15)', border: '2.5px solid #00E676', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', color: '#00E676', textAlign: 'center', padding: '4px', flexShrink: 0 }}>
            <span style={{ fontSize: '1.2rem', animation: 'spin 1s linear infinite' }}>⚡</span>
            <span style={{ fontSize: '0.58rem', fontWeight: 800 }}>{statusMsg}</span>
          </div>
        ) : value ? (
          <img src={value} alt="Preview" style={{ width: `${size}px`, height: `${size}px`, borderRadius: '14px', objectFit: 'cover', border: '2.5px solid #00E676', flexShrink: 0, boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }} />
        ) : (
          <div style={{ width: `${size}px`, height: `${size}px`, borderRadius: '14px', background: 'rgba(255,255,255,0.06)', border: '1.5px dashed #00E676', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', flexShrink: 0 }}>
            📷
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button
            type="button"
            onClick={() => fileInputRef.current && fileInputRef.current.click()}
            disabled={isProcessing}
            style={{
              padding: '10px 14px', borderRadius: '12px',
              background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
              border: 'none', color: '#000', fontWeight: 900, fontSize: '0.82rem',
              cursor: isProcessing ? 'wait' : 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              boxShadow: '0 4px 12px rgba(255,193,7,0.3)'
            }}
          >
            📁 Select HD Image File
          </button>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />

          <input
            type="text"
            value={value || ''}
            onChange={(e) => {
              const val = e.target.value;
              onChange(val);
            }}
            onBlur={(e) => {
              if (e.target.value && e.target.value.startsWith('http')) {
                processAndSetImage(e.target.value, selectedBackdrop);
              }
            }}
            placeholder="Or paste direct Image URL..."
            style={{ ...inputStyle, fontSize: '0.78rem', padding: '8px' }}
          />
        </div>
      </div>

      {/* Optional AI Studio Backdrop Selector Palette */}
      <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', overflowX: 'auto', paddingTop: '4px' }}>
        <span style={{ fontSize: '0.7rem', color: '#8E9BAE', fontWeight: 700 }}>Optional AI Studio Filter:</span>
        <button
          type="button"
          onClick={() => {
            setSelectedBackdrop(null);
            if (value) processAndSetImage(value, null);
          }}
          style={{
            padding: '3px 10px', borderRadius: '10px',
            background: selectedBackdrop === null ? '#00E676' : 'rgba(255,255,255,0.1)',
            color: selectedBackdrop === null ? '#000' : '#FFF',
            border: 'none', fontSize: '0.68rem', fontWeight: 800, cursor: 'pointer'
          }}
        >
          📷 Original Photo (Default)
        </button>
        {ALLSTAR_BACKDROPS.map((bd) => (
          <button
            key={bd.id}
            type="button"
            onClick={() => {
              setSelectedBackdrop(bd.id);
              if (value) processAndSetImage(value, bd.id);
            }}
            style={{
              width: '26px', height: '26px', borderRadius: '50%',
              background: `linear-gradient(135deg, ${bd.colors[0]}, ${bd.colors[1]})`,
              border: selectedBackdrop === bd.id ? '2.5px solid #FFF' : '1px solid rgba(255,255,255,0.2)',
              cursor: 'pointer', outline: 'none', flexShrink: 0,
              boxShadow: selectedBackdrop === bd.id ? `0 0 10px ${bd.colors[0]}` : 'none'
            }}
            title={`AI Background Removal (${bd.name})`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── PLAYER EDIT MODAL ────────────────────────────────────────────────────────
function PlayerEditModal({ player, coaches, onSave, onClose }) {
  const [form, setForm] = useState({
    name: player.name || '',
    gender: player.gender || 'ذكر',
    age: player.age || 10,
    grade: player.grade || '',
    sport: player.sport || 'Football',
    group: player.group || 'U12',
    coachId: player.coachId || player.coachid || '',
    teamName: player.teamName || player.teamname || '',
    parentName: player.parentName || player.parentname || '',
    parentRelation: player.parentRelation || 'أب',
    parentPhone: player.parentPhone || player.phone || '',
    parentEmail: player.parentEmail || player.email || '',
    createAccount: true,
    photoUrl: player.photoUrl || player.photourl || '',
    photourl: player.photoUrl || player.photourl || '',
    status: player.status || 'Active',
    preferredTime: player.preferredTime || 'مسائي',
    
    // Subscription & Abonnement
    pack: player.pack || 'Basic Pack (شهر 60DT)',
    subscriptionFee: player.subscriptionFee || '60 DT',
    paymentStatus: player.paymentStatus || 'Paid',
    expiryDate: player.expiryDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],

    // Kit & T-Shirt Order
    tshirtSize: player.tshirtSize || '10-12 سنة',
    tshirtNumber: player.tshirtNumber || '10',
    tshirtName: player.tshirtName || (player.name ? player.name.split(' ')[0].toUpperCase() : 'ALLSTAR'),
    kitStatus: player.kitStatus || 'Delivered',

    // Notes
    medicalNotes: player.medicalNotes || '',
    adminNotes: player.adminNotes || '',

    stats: {
      speed: 80, puissance: 80, stamina: 78, shooting: 80,
      passing: 80, technique: 78, defense: 72, mental: 80,
      ...player.stats
    },
    matchStats: {
      goals: 0, assists: 0, yellowCards: 0, redCards: 0,
      matchesPlayed: 0, points: 0,
      ...player.matchStats
    }
  });

  const updateStat = (key, val) => setForm(f => ({ ...f, stats: { ...f.stats, [key]: val } }));
  const updateMatch = (key, val) => setForm(f => ({ ...f, matchStats: { ...f.matchStats, [key]: val } }));

  const statLabels = [
    { key: 'speed', label: 'سرعة / Vitesse', color: '#00E676' },
    { key: 'puissance', label: 'قوة / Puissance', color: '#FF9500' },
    { key: 'shooting', label: 'تصويب / Tir', color: '#FF3D00' },
    { key: 'passing', label: 'تمرير / Passe', color: '#00E5FF' },
    { key: 'stamina', label: 'تحمل / Endurance', color: '#E040FB' },
    { key: 'technique', label: 'تقنية / Technique', color: '#FFC107' },
    { key: 'defense', label: 'دفاع / Défense', color: '#78909C' },
    { key: 'mental', label: 'ذهني / Mental', color: '#4DB6AC' },
  ];

  const overallRating = Math.round(Object.values(form.stats).reduce((a, b) => a + b, 0) / statLabels.length);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #090E17, #0D1626)',
        border: '1.5px solid rgba(255,193,7,0.35)', borderRadius: '28px',
        width: '100%', maxWidth: '960px', maxHeight: '92vh', overflowY: 'auto',
        padding: '28px', position: 'relative', boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', left: '16px',
          background: 'rgba(255,61,0,0.2)', border: '1px solid #FF3D00', color: '#FF3D00',
          borderRadius: '50%', width: '38px', height: '38px', cursor: 'pointer',
          fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>✕</button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={form.photoUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=200&auto=format&fit=crop&q=80'}
              alt={form.name}
              style={{ width: '85px', height: '85px', borderRadius: '50%', objectFit: 'cover', border: '3.5px solid #FFC107', boxShadow: '0 8px 20px rgba(0,0,0,0.5)' }}
            />
            <div style={{
              position: 'absolute', bottom: '-4px', right: '-4px',
              background: 'linear-gradient(135deg, #FFC107, #FF9500)',
              color: '#000', fontWeight: 900, fontSize: '0.85rem',
              borderRadius: '50%', width: '30px', height: '30px',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>{overallRating}</div>
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h2 style={{ color: '#FFF', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>{form.name || 'ملف اللاعب'}</h2>
              <span style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107', border: '1px solid #FFC107', padding: '2px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 800 }}>
                {player.id}
              </span>
            </div>
            <p style={{ color: '#8E9BAE', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
              📁 الملف الشامل للاعب — الاشتراكات، زي الأكاديمية، بيانات التواصل والإحصائيات
            </p>
          </div>
        </div>

        {/* MAIN DOSSIER FORM GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '24px' }}>

          {/* 1. CHILD PERSONAL & PHOTO */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <h3 style={{ color: '#FFC107', fontSize: '0.98rem', fontWeight: 900, marginBottom: '14px', borderBottom: '1px solid rgba(255,193,7,0.2)', paddingBottom: '6px' }}>
              👶 البيانات الشخصية للطفل
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>اسم الطفل الكامل *</label>
                <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="الاسم واللقب" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>الجنس</label>
                  <select style={inputStyle} value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="ذكر" style={{ color: '#000' }}>ذكر 👦</option>
                    <option value="أنثى" style={{ color: '#000' }}>أنثى 👧</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>العمر (سنوات)</label>
                  <input style={inputStyle} type="number" min="5" max="20" value={form.age} onChange={e => setForm(f => ({ ...f, age: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>المستوى الدراسي</label>
                <input style={inputStyle} value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} placeholder="مثال: سنة سادسة أساسي" />
              </div>
              <ImageUploader
                label="📸 صورة الشخصية وبطاقة اللاعب (Original HD / AI Studio)"
                value={form.photoUrl || form.photourl}
                onChange={val => setForm(f => ({ ...f, photoUrl: val, photourl: val }))}
              />
            </div>
          </div>

          {/* 2. PARENT & CONTACT INFO */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <h3 style={{ color: '#00E5FF', fontSize: '0.98rem', fontWeight: 900, marginBottom: '14px', borderBottom: '1px solid rgba(0,229,255,0.2)', paddingBottom: '6px' }}>
              👨‍👩‍👧‍👦 بيانات ولي الأمر والتواصل
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>اسم ولي الأمر</label>
                <input style={inputStyle} value={form.parentName} onChange={e => setForm(f => ({ ...f, parentName: e.target.value }))} placeholder="اسم ولي الأمر" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>الصلة</label>
                  <select style={inputStyle} value={form.parentRelation} onChange={e => setForm(f => ({ ...f, parentRelation: e.target.value }))}>
                    <option value="أب" style={{ color: '#000' }}>أب 👨</option>
                    <option value="أم" style={{ color: '#000' }}>أم 👩</option>
                    <option value="ولي أمر" style={{ color: '#000' }}>ولي أمر 👤</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>رقم الهاتف المسجل *</label>
                  <input style={inputStyle} value={form.parentPhone} onChange={e => setForm(f => ({ ...f, parentPhone: e.target.value }))} placeholder="97 123 456" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>البريد الإلكتروني</label>
                <input style={inputStyle} value={form.parentEmail} onChange={e => setForm(f => ({ ...f, parentEmail: e.target.value }))} placeholder="email@example.com" />
              </div>

              <div style={{ background: 'rgba(0,230,118,0.08)', border: '1px solid rgba(0,230,118,0.25)', borderRadius: '14px', padding: '12px', marginTop: '4px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', color: '#00E676', fontWeight: 800, fontSize: '0.85rem' }}>
                  <input
                    type="checkbox"
                    checked={form.createAccount}
                    onChange={e => setForm(f => ({ ...f, createAccount: e.target.checked }))}
                    style={{ width: '18px', height: '18px', accentColor: '#00E676' }}
                  />
                  <span>🔑 إنشاء حساب دخول لولي الأمر (PIN: 1234)</span>
                </label>
                <div style={{ fontSize: '0.75rem', color: '#8E9BAE', marginTop: '4px', paddingRight: '28px' }}>
                  يتيح لولي الأمر الدخول عبر رقم هاتفه لمتابعة الطفل وبطاقته
                </div>
              </div>
            </div>
          </div>

          {/* 3. SPORT & COACH ASSIGNMENT */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <h3 style={{ color: '#00E676', fontSize: '0.98rem', fontWeight: 900, marginBottom: '14px', borderBottom: '1px solid rgba(0,230,118,0.2)', paddingBottom: '6px' }}>
              ⚽ الرياضة والمدرب المسؤول
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>الرياضة المختارة</label>
                  <select style={inputStyle} value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}>
                    {SPORTS.map(s => <option key={s} value={s} style={{ color: '#000' }}>{SPORT_ICONS[s]} {s}</option>)}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>الفئة العمرية</label>
                  <select style={inputStyle} value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                    {GROUPS.map(g => <option key={g} value={g} style={{ color: '#000' }}>{g}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>المدرب المسؤول *</label>
                <select style={inputStyle} value={form.coachId} onChange={e => setForm(f => ({ ...f, coachId: e.target.value }))}>
                  <option value="" style={{ color: '#000' }}>-- اختر المدرب المسؤول --</option>
                  {coaches.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>🏅 {c.nickname || c.name} ({c.sport})</option>)}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>اسم الفريق</label>
                  <input style={inputStyle} value={form.teamName} onChange={e => setForm(f => ({ ...f, teamName: e.target.value }))} placeholder="فريق U12 A" />
                </div>
                <div>
                  <label style={labelStyle}>التوقيت المفضل</label>
                  <select style={inputStyle} value={form.preferredTime} onChange={e => setForm(f => ({ ...f, preferredTime: e.target.value }))}>
                    <option value="صباحي" style={{ color: '#000' }}>🌅 صباحي</option>
                    <option value="مسائي" style={{ color: '#000' }}>🌆 مسائي</option>
                    <option value="نهاية الأسبوع" style={{ color: '#000' }}>🗓 نهاية الأسبوع</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>حالة التسجيل بالنظام</label>
                <select style={inputStyle} value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="Active" style={{ color: '#000' }}>✅ نشط ومسجل رسمي (Active)</option>
                  <option value="Pending" style={{ color: '#000' }}>⏳ قيد الإنتظار (Pending)</option>
                  <option value="Inactive" style={{ color: '#000' }}>⏸ غير نشط (Inactive)</option>
                  <option value="Injured" style={{ color: '#000' }}>🤕 مصاب (Injured)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 4. SUBSCRIPTION & ABONNEMENT */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <h3 style={{ color: '#FF9500', fontSize: '0.98rem', fontWeight: 900, marginBottom: '14px', borderBottom: '1px solid rgba(255,149,0,0.2)', paddingBottom: '6px' }}>
              💳 الاشتراك والباك (Abonnement & Pack)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>نوع الباك (Pack Selection)</label>
                <select style={inputStyle} value={form.pack} onChange={e => setForm(f => ({ ...f, pack: e.target.value }))}>
                  <option value="Basic Pack (شهر 60DT)" style={{ color: '#000' }}>🥉 Basic Pack — 60 DT / شهر</option>
                  <option value="Pro Pack (ثلاثي 150DT)" style={{ color: '#000' }}>🥈 Pro Pack — 150 DT / 3 أشهر</option>
                  <option value="VIP All-Star Pack (سنوي 500DT)" style={{ color: '#000' }}>🥇 VIP All-Star — 500 DT / سنوي</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>معلوم الاشتراك (DT)</label>
                  <input style={inputStyle} value={form.subscriptionFee} onChange={e => setForm(f => ({ ...f, subscriptionFee: e.target.value }))} placeholder="60 DT" />
                </div>
                <div>
                  <label style={labelStyle}>حالة الخلاص (Payment)</label>
                  <select style={inputStyle} value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value }))}>
                    <option value="Paid" style={{ color: '#000' }}>🟢 خالص (Paid)</option>
                    <option value="Pending" style={{ color: '#000' }}>🟡 قيد الخلاص (Pending)</option>
                    <option value="Unpaid" style={{ color: '#000' }}>🔴 غير خالص (Unpaid)</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={labelStyle}>تاريخ انتهاء الاشتراك / التجديد</label>
                <input type="date" style={inputStyle} value={form.expiryDate} onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))} />
              </div>
            </div>
          </div>

          {/* 5. ACADEMY UNIFORM & T-SHIRT ORDER */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <h3 style={{ color: '#E040FB', fontSize: '0.98rem', fontWeight: 900, marginBottom: '14px', borderBottom: '1px solid rgba(224,64,251,0.2)', paddingBottom: '6px' }}>
              👕 زي الأكاديمية والقميص (T-Shirt & Kit)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={labelStyle}>مقاس القميص (Size)</label>
                  <select style={inputStyle} value={form.tshirtSize} onChange={e => setForm(f => ({ ...f, tshirtSize: e.target.value }))}>
                    <option value="6-8 سنة" style={{ color: '#000' }}>6 - 8 سنة</option>
                    <option value="8-10 سنة" style={{ color: '#000' }}>8 - 10 سنة</option>
                    <option value="10-12 سنة" style={{ color: '#000' }}>10 - 12 سنة</option>
                    <option value="12-14 سنة" style={{ color: '#000' }}>12 - 14 سنة</option>
                    <option value="XS" style={{ color: '#000' }}>XS</option>
                    <option value="S" style={{ color: '#000' }}>S</option>
                    <option value="M" style={{ color: '#000' }}>M</option>
                    <option value="L" style={{ color: '#000' }}>L</option>
                    <option value="XL" style={{ color: '#000' }}>XL</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>رقم القميص (#)</label>
                  <input style={inputStyle} value={form.tshirtNumber} onChange={e => setForm(f => ({ ...f, tshirtNumber: e.target.value }))} placeholder="#10" />
                </div>
              </div>

              <div>
                <label style={labelStyle}>الاسم المطبوع خلف القميص</label>
                <input style={inputStyle} value={form.tshirtName} onChange={e => setForm(f => ({ ...f, tshirtName: e.target.value }))} placeholder="ZAKARIYA" />
              </div>

              <div>
                <label style={labelStyle}>حالة التسليم (Kit Status)</label>
                <select style={inputStyle} value={form.kitStatus} onChange={e => setForm(f => ({ ...f, kitStatus: e.target.value }))}>
                  <option value="Delivered" style={{ color: '#000' }}>👕 تم تسليم الزي (Delivered)</option>
                  <option value="Ordered" style={{ color: '#000' }}>📦 تم طلب القميص (Ordered)</option>
                  <option value="Not Ordered" style={{ color: '#000' }}>❌ لم يطلب بعد (Not Ordered)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 6. MEDICAL NOTES & ADMIN NOTES */}
          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '18px' }}>
            <h3 style={{ color: '#FF5252', fontSize: '0.98rem', fontWeight: 900, marginBottom: '14px', borderBottom: '1px solid rgba(255,82,82,0.2)', paddingBottom: '6px' }}>
              📝 الملاحظات الطبية والإدارية
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={labelStyle}>الملاحظات الطبية / الحساسية</label>
                <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} value={form.medicalNotes} onChange={e => setForm(f => ({ ...f, medicalNotes: e.target.value }))} placeholder="لا توجد ملاحظات صحية" />
              </div>
              <div>
                <label style={labelStyle}>ملاحظات خاصة بالإدارة</label>
                <textarea style={{ ...inputStyle, resize: 'none' }} rows={2} value={form.adminNotes} onChange={e => setForm(f => ({ ...f, adminNotes: e.target.value }))} placeholder="ملاحظات سرية للإدارة..." />
              </div>
            </div>
          </div>

        </div>

        {/* STATS & MATCH STATS TAB / ACCORDION */}
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '20px', marginBottom: '24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Match Stats */}
            <div>
              <h4 style={{ color: '#00E5FF', fontSize: '0.95rem', fontWeight: 900, marginBottom: '14px' }}>📊 إحصائيات المباريات الرسمية</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { key: 'goals', label: '⚽ أهداف', color: '#00E676' },
                  { key: 'assists', label: '🎯 تمريرات', color: '#00E5FF' },
                  { key: 'matchesPlayed', label: '🏟 مباريات', color: '#FFC107' },
                  { key: 'points', label: '🏆 نقاط', color: '#FF9500' },
                  { key: 'yellowCards', label: '🟡 صفراء', color: '#FFC107' },
                  { key: 'redCards', label: '🔴 حمراء', color: '#FF3D00' },
                ].map(({ key, label, color }) => (
                  <div key={key}>
                    <label style={{ ...labelStyle, color, fontSize: '0.72rem' }}>{label}</label>
                    <input
                      type="number" min="0" style={{ ...inputStyle, textAlign: 'center', padding: '8px', fontSize: '1rem', fontWeight: 900, color }}
                      value={form.matchStats[key]}
                      onChange={e => updateMatch(key, Number(e.target.value))}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* OVR Player Skills */}
            <div>
              <h4 style={{ color: '#FF9500', fontSize: '0.95rem', fontWeight: 900, marginBottom: '14px' }}>⚡ قدرات اللاعب وإحصائيات الـ OVR</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {statLabels.map(({ key, label, color }) => (
                  <StatSlider key={key} label={label} value={form.stats[key]} color={color} onChange={val => updateStat(key, val)} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SAVE DOSSIER BUTTON */}
        <button
          onClick={() => onSave(player.id, form)}
          style={{
            width: '100%', padding: '18px',
            background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
            border: 'none', borderRadius: '18px', color: '#000',
            fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            boxShadow: '0 8px 25px rgba(0, 230, 118, 0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
          }}
        >
          <span>🚀</span> حفظ واعتمد ملف اللاعب والبطاقة بالنظام
        </button>
      </div>
    </div>
  );
}

// ─── COACH FORM MODAL ─────────────────────────────────────────────────────────
function CoachFormModal({ coach, onSave, onClose }) {
  const [form, setForm] = useState({
    name: coach?.name || '',
    nickname: coach?.nickname || '',
    phone: coach?.phone || '',
    photoUrl: coach?.photoUrl || '',
    sport: coach?.sport || 'Football',
    group: coach?.group || 'U12',
    bio: coach?.bio || ''
  });

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #0D1B2A, #0A1628)',
        border: '1px solid rgba(255,193,7,0.3)', borderRadius: '24px',
        width: '100%', maxWidth: '540px', padding: '32px', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', left: '16px',
          background: 'rgba(255,61,0,0.2)', border: '1px solid #FF3D00', color: '#FF3D00',
          borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
          fontSize: '1.1rem', fontWeight: 900
        }}>✕</button>

        <h2 style={{ color: '#FFC107', fontSize: '1.3rem', fontWeight: 900, marginBottom: '24px', textAlign: 'center' }}>
          {coach ? '✏️ تعديل بيانات المدرب' : '➕ إضافة مدرب جديد'}
        </h2>

        {/* Preview photo */}
        {form.photoUrl && (
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <img src={form.photoUrl} alt="preview"
              style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #FFC107' }} />
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <label style={labelStyle}>الاسم الكامل *</label>
            <input style={inputStyle} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="مثال: أحمد المنصوري" required />
          </div>
          <div>
            <label style={labelStyle}>اللقب / Nickname</label>
            <input style={inputStyle} value={form.nickname} onChange={e => setForm(f => ({ ...f, nickname: e.target.value }))} placeholder="مثال: الكابتن أحمد" />
          </div>
          <div>
            <label style={labelStyle}>رقم الهاتف</label>
            <input style={inputStyle} value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+216 95 ..." />
          </div>
          <ImageUploader
            label="صورة المدرب (رفع ملف أو رابط)"
            value={form.photoUrl}
            onChange={val => setForm(f => ({ ...f, photoUrl: val }))}
          />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={labelStyle}>الرياضة</label>
              <select style={inputStyle} value={form.sport} onChange={e => setForm(f => ({ ...f, sport: e.target.value }))}>
                {SPORTS.map(s => <option key={s} value={s} style={{ color: '#000' }}>{SPORT_ICONS[s]} {s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>الفئة المسؤول عنها</label>
              <select style={inputStyle} value={form.group} onChange={e => setForm(f => ({ ...f, group: e.target.value }))}>
                {GROUPS.map(g => <option key={g} value={g} style={{ color: '#000' }}>{g}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelStyle}>نبذة عن المدرب (Bio)</label>
            <textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={form.bio}
              onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} placeholder="اكتب نبذة مختصرة..." />
          </div>

          <button onClick={() => { if (!form.name.trim()) return; onSave(form); }} style={{
            padding: '14px', background: 'linear-gradient(135deg, #FFC107, #FF9500)',
            border: 'none', borderRadius: '14px', color: '#000', fontWeight: 900,
            fontSize: '1rem', cursor: 'pointer', marginTop: '4px',
            fontFamily: '"Cairo", "Tajawal", sans-serif'
          }}>
            {coach ? '💾 حفظ التعديلات' : '🚀 إضافة المدرب للأكاديمية'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BULK PLAYER IMPORT MODAL ────────────────────────────────────────────────
function BulkPlayerModal({ coaches, onSaveBulk, onClose }) {
  const [defaultSport, setDefaultSport] = useState('Football');
  const [defaultGroup, setDefaultGroup] = useState('U12');
  const [defaultCoachId, setDefaultCoachId] = useState('');
  const [defaultTeamName, setDefaultTeamName] = useState('فريق أولستار');
  
  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState([]);
  const [activeInputTab, setActiveInputTab] = useState('paste'); // 'paste' | 'file'

  const parseInput = (textToParse) => {
    if (!textToParse.trim()) {
      setParsedRows([]);
      return;
    }

    const lines = textToParse.split(/\r?\n/).filter(line => line.trim().length > 0);
    const selectedCoach = coaches.find(c => c.id === defaultCoachId);
    const coachName = selectedCoach ? (selectedCoach.nickname || selectedCoach.name) : '';

    const newRows = lines.map((line, idx) => {
      let parts = [];
      if (line.includes('\t')) parts = line.split('\t');
      else if (line.includes(';')) parts = line.split(';');
      else parts = line.split(',');
      const cleanParts = parts.map(p => p.trim());

      const firstPartLower = (cleanParts[0] || '').toLowerCase();
      // Skip header row if detected
      if (idx === 0 && (firstPartLower.includes('اسم') || firstPartLower.includes('name') || firstPartLower.includes('لاعب') || cleanParts[1]?.toLowerCase() === 'age' || cleanParts[1] === 'العمر')) {
        return null;
      }

      const name = cleanParts[0] || `لاعب ${idx + 1}`;
      const age = !isNaN(cleanParts[1]) && cleanParts[1] ? Number(cleanParts[1]) : 10;
      const sport = SPORTS.includes(cleanParts[2]) ? cleanParts[2] : defaultSport;
      const group = GROUPS.includes(cleanParts[3]) ? cleanParts[3] : defaultGroup;
      const teamName = cleanParts[4] || defaultTeamName;
      const parentName = cleanParts[5] || '';

      return {
        id: `temp-${idx}-${Date.now()}`,
        name,
        age,
        sport,
        group,
        coachId: defaultCoachId,
        coachName,
        teamName,
        parentName
      };
    }).filter(Boolean);

    setParsedRows(newRows);
  };

  const handleTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    parseInput(text);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target.result || '';
      setRawText(content);
      parseInput(content);
    };
    reader.readAsText(file, 'UTF-8');
  };

  const handleAddRow = () => {
    const selectedCoach = coaches.find(c => c.id === defaultCoachId);
    setParsedRows(prev => [
      ...prev,
      {
        id: `temp-manual-${Date.now()}-${Math.random()}`,
        name: '',
        age: 10,
        sport: defaultSport,
        group: defaultGroup,
        coachId: defaultCoachId,
        coachName: selectedCoach ? (selectedCoach.nickname || selectedCoach.name) : '',
        teamName: defaultTeamName,
        parentName: ''
      }
    ]);
  };

  const handleUpdateRow = (idx, field, val) => {
    setParsedRows(prev => prev.map((r, i) => i === idx ? { ...r, [field]: val } : r));
  };

  const handleDeleteRow = (idx) => {
    setParsedRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleDownloadSampleCSV = () => {
    const sampleContent = "\uFEFFالاسم الكامل,العمر,الرياضة,الفئة,اسم الفريق,ولي الأمر والرقم\nيوسف المنصوري,10,Football,U12,نسور أولستار U12,محمد (+216 98 123 456)\nعمر الطرابلسي,12,Basketball,U14,فرسان السلة U14,كمال (+216 95 323 941)\nسارة الكعبي,9,Handball,U10,نجمات أولستار U10,فاطمة (+216 92 456 789)";
    const blob = new Blob([sampleContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'allstar_players_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCommit = () => {
    const validRows = parsedRows.filter(r => r.name.trim().length > 0);
    if (validRows.length === 0) {
      alert('يرجى أدخال اسم لاعب واحد على الأقل قبل الاستيراد!');
      return;
    }
    onSaveBulk(validRows);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px',
      backdropFilter: 'blur(8px)'
    }}>
      <div style={{
        background: 'linear-gradient(145deg, #0D1B2A, #0A1628)',
        border: '1px solid rgba(0,230,118,0.4)', borderRadius: '24px',
        width: '100%', maxWidth: '960px', maxHeight: '92vh', overflowY: 'auto',
        padding: '32px', position: 'relative', boxShadow: '0 20px 50px rgba(0,0,0,0.6)'
      }}>
        {/* Close Button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', left: '16px',
          background: 'rgba(255,61,0,0.2)', border: '1px solid #FF3D00', color: '#FF3D00',
          borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer',
          fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>✕</button>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(0,230,118,0.15)', border: '1px solid #00E676',
            color: '#00E676', padding: '6px 16px', borderRadius: '12px',
            fontSize: '0.85rem', fontWeight: 900, marginBottom: '8px'
          }}>
            ⚡ استيراد السجلات الضخمة (Bulk Player Import)
          </div>
          <h2 style={{ color: '#FFF', fontSize: '1.5rem', fontWeight: 900, margin: '4px 0' }}>
            إضافة مجموعة لاعبين دفعة واحدة
          </h2>
          <p style={{ color: '#8E9BAE', fontSize: '0.85rem', margin: 0 }}>
            يمكنك نسخ ولصق البيانات من Excel/Google Sheets أو رفع ملف CSV مباشرة
          </p>
        </div>

        {/* Section 1: Default Batch Settings */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px', padding: '18px', marginBottom: '20px'
        }}>
          <div style={{ color: '#FFC107', fontSize: '0.85rem', fontWeight: 800, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            ⚙️ الإعدادات الافتراضية للمدفوعات / الدفعة كاملة
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            <div>
              <label style={labelStyle}>الرياضة الافتراضية</label>
              <select style={inputStyle} value={defaultSport} onChange={e => { setDefaultSport(e.target.value); parseInput(rawText); }}>
                {SPORTS.map(s => <option key={s} value={s} style={{ color: '#000' }}>{SPORT_ICONS[s]} {s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>الفئة العمرية</label>
              <select style={inputStyle} value={defaultGroup} onChange={e => { setDefaultGroup(e.target.value); parseInput(rawText); }}>
                {GROUPS.map(g => <option key={g} value={g} style={{ color: '#000' }}>فئة {g}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>المدرب المسؤول</label>
              <select style={inputStyle} value={defaultCoachId} onChange={e => { setDefaultCoachId(e.target.value); parseInput(rawText); }}>
                <option value="" style={{ color: '#000' }}>-- اختر المدرب --</option>
                {coaches.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>🏅 {c.nickname || c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>اسم الفريق</label>
              <input style={inputStyle} value={defaultTeamName} onChange={e => { setDefaultTeamName(e.target.value); parseInput(rawText); }} placeholder="مثال: أولستار U12" />
            </div>
          </div>
        </div>

        {/* Section 2: Input Method Selector & Actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setActiveInputTab('paste')}
              style={{
                padding: '8px 16px', borderRadius: '12px', border: 'none',
                background: activeInputTab === 'paste' ? '#00E676' : 'rgba(255,255,255,0.08)',
                color: activeInputTab === 'paste' ? '#000' : '#FFF',
                fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              ✍️ نسخ ولصق نص / جدول
            </button>
            <button
              onClick={() => setActiveInputTab('file')}
              style={{
                padding: '8px 16px', borderRadius: '12px', border: 'none',
                background: activeInputTab === 'file' ? '#00E676' : 'rgba(255,255,255,0.08)',
                color: activeInputTab === 'file' ? '#000' : '#FFF',
                fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer'
              }}
            >
              📁 رفع ملف CSV
            </button>
          </div>

          <button
            onClick={handleDownloadSampleCSV}
            style={{
              padding: '8px 14px', borderRadius: '12px',
              background: 'rgba(0, 229, 255, 0.15)', border: '1px solid #00E5FF',
              color: '#00E5FF', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}
          >
            📥 تحميل نموذج CSV تجريبي
          </button>
        </div>

        {/* Section 3: Input Controls */}
        {activeInputTab === 'paste' ? (
          <div style={{ marginBottom: '20px' }}>
            <label style={labelStyle}>الصق أسطر اللاعبين هنا (كل سطر يحتوي على: الاسم, العمر, الرياضة, الفئة, الفريق, ولي الأمر):</label>
            <textarea
              rows={5}
              value={rawText}
              onChange={handleTextChange}
              placeholder={"مثال:\nأحمد المنصوري, 11, Football, U12, نسور أولستار, علي (+216 98 111 222)\nياسين الورغمي, 12, Basketball, U14, فرسان السلة, محمد (+216 97 333 444)"}
              style={{
                ...inputStyle,
                fontFamily: 'monospace',
                fontSize: '0.85rem',
                resize: 'vertical',
                borderColor: rawText ? '#00E676' : 'rgba(255,255,255,0.12)'
              }}
            />
          </div>
        ) : (
          <div style={{
            marginBottom: '20px', padding: '24px', borderRadius: '18px',
            border: '2px dashed rgba(0,230,118,0.4)', background: 'rgba(0,230,118,0.04)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '8px' }}>📄</span>
            <label style={{ ...labelStyle, fontSize: '0.95rem', color: '#00E676', cursor: 'pointer' }}>
              انقر لاختيار ملف CSV أو قم بسحبه إلى هنا
              <input type="file" accept=".csv, .txt" onChange={handleFileUpload} style={{ display: 'none' }} />
            </label>
            <span style={{ fontSize: '0.78rem', color: '#8E9BAE', display: 'block', marginTop: '4px' }}>
              يدعم ملفات CSV المزودة بفاصلة (,) أو Tab من Excel
            </span>
          </div>
        )}

        {/* Section 4: Live Preview Table */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '18px', padding: '16px', marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <h4 style={{ color: '#00E676', fontSize: '0.95rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              📋 معاينة وتدقيق قائمة اللاعبين ({parsedRows.length} لاعب)
            </h4>
            <button
              type="button"
              onClick={handleAddRow}
              style={{
                padding: '6px 12px', borderRadius: '10px',
                background: 'rgba(255,193,7,0.15)', border: '1px solid #FFC107',
                color: '#FFC107', fontWeight: 800, fontSize: '0.78rem', cursor: 'pointer'
              }}
            >
              ➕ إضافة سطر يدوي
            </button>
          </div>

          {parsedRows.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 16px', color: '#8E9BAE', fontSize: '0.85rem' }}>
              لم يتم اكتشاف لاعبين بعد. قم بلصق البيانات أو رفع ملف CSV ليتم التحلل التلقائي للمعاينة.
            </div>
          ) : (
            <div style={{ overflowX: 'auto', maxHeight: '280px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.82rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(0,230,118,0.3)', color: '#00E676' }}>
                    <th style={{ padding: '8px' }}>#</th>
                    <th style={{ padding: '8px' }}>اسم اللاعب *</th>
                    <th style={{ padding: '8px', width: '70px' }}>العمر</th>
                    <th style={{ padding: '8px' }}>الرياضة</th>
                    <th style={{ padding: '8px' }}>الفئة</th>
                    <th style={{ padding: '8px' }}>اسم الفريق</th>
                    <th style={{ padding: '8px' }}>ولي الأمر والتواصل</th>
                    <th style={{ padding: '8px', width: '50px' }}>حذف</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedRows.map((row, idx) => (
                    <tr key={row.id || idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '6px', color: '#8E9BAE', fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ padding: '6px' }}>
                        <input
                          style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.8rem' }}
                          value={row.name}
                          onChange={e => handleUpdateRow(idx, 'name', e.target.value)}
                          placeholder="الاسم الكامل"
                        />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input
                          type="number" min="5" max="20"
                          style={{ ...inputStyle, padding: '6px 4px', fontSize: '0.8rem', textAlign: 'center' }}
                          value={row.age}
                          onChange={e => handleUpdateRow(idx, 'age', Number(e.target.value))}
                        />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <select
                          style={{ ...inputStyle, padding: '6px 4px', fontSize: '0.78rem' }}
                          value={row.sport}
                          onChange={e => handleUpdateRow(idx, 'sport', e.target.value)}
                        >
                          {SPORTS.map(s => <option key={s} value={s} style={{ color: '#000' }}>{s}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '6px' }}>
                        <select
                          style={{ ...inputStyle, padding: '6px 4px', fontSize: '0.78rem' }}
                          value={row.group}
                          onChange={e => handleUpdateRow(idx, 'group', e.target.value)}
                        >
                          {GROUPS.map(g => <option key={g} value={g} style={{ color: '#000' }}>{g}</option>)}
                        </select>
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input
                          style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.8rem' }}
                          value={row.teamName}
                          onChange={e => handleUpdateRow(idx, 'teamName', e.target.value)}
                        />
                      </td>
                      <td style={{ padding: '6px' }}>
                        <input
                          style={{ ...inputStyle, padding: '6px 8px', fontSize: '0.8rem' }}
                          value={row.parentName}
                          onChange={e => handleUpdateRow(idx, 'parentName', e.target.value)}
                          placeholder="اسم ولي الأمر + هاتف"
                        />
                      </td>
                      <td style={{ padding: '6px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => handleDeleteRow(idx)}
                          style={{
                            background: 'rgba(255,61,0,0.2)', border: 'none',
                            color: '#FF5252', borderRadius: '8px', padding: '4px 8px',
                            cursor: 'pointer', fontWeight: 900
                          }}
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Section 5: Commit Button */}
        <button
          onClick={handleCommit}
          disabled={parsedRows.length === 0}
          style={{
            width: '100%', padding: '16px',
            background: parsedRows.length > 0 ? 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)' : 'rgba(255,255,255,0.1)',
            border: 'none', borderRadius: '16px',
            color: parsedRows.length > 0 ? '#04101A' : '#78909C',
            fontWeight: 900, fontSize: '1rem', cursor: parsedRows.length > 0 ? 'pointer' : 'not-allowed',
            fontFamily: '"Cairo", "Tajawal", sans-serif',
            boxShadow: parsedRows.length > 0 ? '0 6px 24px rgba(0, 230, 118, 0.35)' : 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <span>🚀</span> استيراد وحفظ {parsedRows.filter(r => r.name.trim()).length} لاعب في قاعدة البيانات
        </button>
      </div>
    </div>
  );
}

// ─── MAIN ADMIN COMPONENT ─────────────────────────────────────────────────────
export default function Admin() {
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [players, setPlayers] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [siteContent, setSiteContent] = useState({});
  const [savedSuccessMsg, setSavedSuccessMsg] = useState(null);

  // Players tab states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState('all');
  const [editingPlayer, setEditingPlayer] = useState(null);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [playerTabView, setPlayerTabView] = useState('grid'); // 'grid' | 'table'

  // Coaches tab states
  const [editingCoach, setEditingCoach] = useState(null);
  const [addingCoach, setAddingCoach] = useState(false);
  const [expandedCoach, setExpandedCoach] = useState(null);
  const [newPlayerPhoto, setNewPlayerPhoto] = useState('');

  // QR Scanner
  const [qrCodeInput, setQrCodeInput] = useState('');
  const [scanResultMsg, setScanResultMsg] = useState(null);

  // Announcements
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementText, setAnnouncementText] = useState('');
  const [registrations, setRegistrations] = useState(() => db.getRegistrations());

  // Customizer / Website Editor
  const [siteForm, setSiteForm] = useState({});

  useEffect(() => {
    // Initial sync load
    setPlayers(db.getPlayers());
    setCoaches(db.getCoaches());
    setRegistrations(db.getRegistrations());
    const content = db.getSiteContent();
    setSiteContent(content);
    setSiteForm(content);

    // Async fetch from Supabase
    db.getPlayersAsync().then(setPlayers);
    db.getCoachesAsync().then(setCoaches);
    db.getRegistrationsAsync().then(regs => { if (regs) setRegistrations(regs); });
    db.getSiteContentAsync().then(c => {
      if (c) {
        setSiteContent(c);
        setSiteForm(c);
      }
    });

    // Subscribe to Live Supabase Postgres Changes across ALL devices
    const unsub = db.subscribeToRealtime(
      (liveCoaches) => setCoaches(liveCoaches),
      (livePlayers) => setPlayers(livePlayers),
      (liveContent) => {
        setSiteContent(liveContent);
        setSiteForm(liveContent);
      }
    );

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const refreshData = async () => {
    const p = await db.getPlayersAsync();
    const c = await db.getCoachesAsync();
    const content = await db.getSiteContentAsync();
    setPlayers(p);
    setCoaches(c);
    setSiteContent(content);
    setSiteForm(content);
  };

  const showSuccess = (msg) => {
    setSavedSuccessMsg(msg);
    setTimeout(() => setSavedSuccessMsg(null), 4000);
  };

  // ── Player handlers ────────────────────────────────────────────────────────
  const handleSavePlayer = async (id, formData) => {
    let photo = formData.photoUrl || formData.photourl;
    if (photo && photo.startsWith('data:image/')) {
      try {
        photo = await PhotoStudioEngine.optimizePhoto(photo, { targetSize: 300, quality: 0.75 });
      } catch (e) {
        console.warn('Photo compression fallback:', e);
      }
    }
    const cleanForm = { ...formData, photoUrl: photo, photourl: photo, status: formData.status || 'Active' };

    const isPendingReg = String(id).startsWith('REG-') || !players.some(p => p.id === id);
    let finalPlayerId = id;
    if (isPendingReg) {
      finalPlayerId = 'PL-' + Date.now();
      cleanForm.id = finalPlayerId;
    }

    // Auto-create parent login account if requested
    if (cleanForm.createAccount && cleanForm.parentPhone) {
      db.saveAccount({
        role: 'parent',
        name: cleanForm.parentName || cleanForm.name + ' (ولي أمر)',
        phone: cleanForm.parentPhone,
        pin: '1234',
        playerIds: [finalPlayerId],
        sport: cleanForm.sport,
        group: cleanForm.group
      });
      setAccounts(db.getAccounts());
    }

    if (isPendingReg) {
      // Remove from pending registrations
      await db.deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));

      // Add to official academy players list
      const updatedPlayers = await db.addPlayer(cleanForm);
      if (updatedPlayers && updatedPlayers.length > 0) {
        setPlayers(updatedPlayers);
      } else {
        setPlayers(prev => [cleanForm, ...prev.filter(p => p.id !== id)]);
      }
    } else {
      setPlayers(prev => prev.map(p => p.id === id ? { ...p, ...cleanForm } : p));
      const updated = await db.updatePlayer(id, cleanForm);
      if (updated && updated.length > 0) setPlayers(updated);
    }

    setEditingPlayer(null);
    showSuccess(`✅ تم اعتماد وتحديث الملف الشامل للاعب ${cleanForm.name} بنجاح!`);
  };

  const handleDeletePlayer = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا السجل؟')) return;
    
    if (String(id).startsWith('REG-')) {
      await db.deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));
      setPlayers(prev => prev.filter(p => p.id !== id));
    } else {
      setPlayers(prev => prev.filter(p => p.id !== id));
      const updated = await db.deletePlayer(id);
      if (updated) setPlayers(updated);
    }
    showSuccess('🗑 تم حذف السجل بنجاح');
  };

  const handleAddPlayer = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const coachId = fd.get('coachId') || '';
    const selectedCoach = coaches.find(c => c.id === coachId);
    
    const playerData = {
      name: fd.get('playerName'),
      sport: fd.get('sport'),
      group: fd.get('ageGroup'),
      age: Number(fd.get('age')) || 10,
      coachId,
      coachName: selectedCoach ? (selectedCoach.nickname || selectedCoach.name) : fd.get('coachName') || '',
      teamName: fd.get('teamName'),
      parentName: fd.get('parentName'),
      photoUrl: newPlayerPhoto || fd.get('photoUrl') || ''
    };

    setNewPlayerPhoto('');
    showSuccess(`✅ تم إضافة اللاعب بنجاح!`);
    e.target.reset();

    db.addPlayer(playerData).then(updated => {
      if (updated && updated.length > 0) setPlayers(updated);
    });
  };

  const handleSaveBulkPlayers = async (bulkList) => {
    setShowBulkModal(false);
    showSuccess(`⏳ جاري استيراد ${bulkList.length} لاعب إلى قاعدة البيانات...`);
    const updated = await db.addPlayersBulk(bulkList);
    if (updated && updated.length > 0) {
      setPlayers(updated);
      showSuccess(`✅ تم استيراد وحفظ ${bulkList.length} لاعب بنجاح!`);
    }
  };

  // ── Coach handlers ─────────────────────────────────────────────────────────
  const handleSaveCoach = (formData) => {
    if (editingCoach) {
      setCoaches(prev => prev.map(c => c.id === editingCoach.id ? { ...c, ...formData } : c));
      showSuccess('✅ تم تحديث بيانات المدرب بنجاح!');
      db.updateCoach(editingCoach.id, formData).then(updated => {
        if (updated && updated.length > 0) setCoaches(updated);
      });
    } else {
      showSuccess('✅ تم إضافة المدرب الجديد للأكاديمية بنجاح!');
      db.addCoach(formData).then(updated => {
        if (updated && updated.length > 0) setCoaches(updated);
      });
    }
    setEditingCoach(null);
    setAddingCoach(false);
  };

  const handleDeleteCoach = (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المدرب؟')) return;
    setCoaches(prev => prev.filter(c => c.id !== id));
    showSuccess('🗑 تم حذف المدرب من القاعدة المباشرة');

    db.deleteCoach(id).then(updated => {
      if (updated) setCoaches(updated);
    });
  };

  // ── QR handler ─────────────────────────────────────────────────────────────
  const handleAdminQRCheckin = (e) => {
    e.preventDefault();
    if (!qrCodeInput.trim()) return;
    const player = db.getPlayerById(qrCodeInput.trim().toUpperCase());
    if (player) {
      db.recordAttendance(player.id, 'Present');
      setScanResultMsg({ type: 'success', text: `✅ تم تسجيل الحضور لـ: ${player.name} (${player.group})` });
      notificationService.sendLocalNotification(`✅ تسجيل حضور: ${player.name}`, `تم تسجيل حضور المشترك بنجاح في حصة اليوم.`);
    } else {
      setScanResultMsg({ type: 'error', text: `❌ رمز لاعب غير صالح (${qrCodeInput})` });
    }
    setQrCodeInput('');
    setTimeout(() => setScanResultMsg(null), 4000);
  };

  // ── Site content handler ───────────────────────────────────────────────────
  const handleSaveSiteContent = async () => {
    showSuccess('⚡ جاري ضغط ونشر الصور مباشرة إلى الهواتف والأجهزة...');
    console.log('🚀 handleSaveSiteContent: Starting publish...', 
      'gallery_images count:', (siteForm.gallery_images || []).length,
      'has base64:', (siteForm.gallery_images || []).some(img => img.url && img.url.startsWith('data:'))
    );
    try {
      const updated = await db.saveSiteContent(siteForm);
      setSiteContent(updated);
      setSiteForm(updated);
      const slideCount = (updated.gallery_images || []).length;
      console.log('✅ handleSaveSiteContent: Published', slideCount, 'slides');
      showSuccess(`✅ تم نشر ${slideCount} صور بنجاح على الهواتف والأجهزة المباشرة!`);
    } catch (e) {
      console.error('❌ handleSaveSiteContent FAILED:', e);
      showSuccess('❌ خطأ في النشر - حاول مرة أخرى');
    }
  };

  const updateSiteForm = (key, val) => setSiteForm(f => ({ ...f, [key]: val }));

  // ── Broadcast handler ──────────────────────────────────────────────────────
  const handleSendBroadcast = (e) => {
    e.preventDefault();
    if (!announcementTitle.trim()) return;
    const notifText = announcementText || 'تنبيه جديد من إدارة أكاديمية أولستار الرياضية بتطاوين';
    notificationService.broadcastToAllClients(announcementTitle, notifText);
    showSuccess('📢 تم إرسال الإشعار والتنبيه الفوري لجميع الهواتف والأجهزة الممثلة في التطبيق بنجاح!');
    setAnnouncementTitle('');
    setAnnouncementText('');
  };

  // ── Account Management Handlers ───────────────────────────────────────────
  const [accounts, setAccounts] = useState(() => db.getAccounts());
  const [newAccRole, setNewAccRole] = useState('parent');
  const [newAccName, setNewAccName] = useState('');
  const [newAccPhone, setNewAccPhone] = useState('');
  const [newAccPin, setNewAccPin] = useState('1234');
  const [newAccCoachId, setNewAccCoachId] = useState('');
  const [newAccPlayerId, setNewAccPlayerId] = useState('');

  const handleCreateAccount = (e) => {
    e.preventDefault();
    if (!newAccName.trim() || !newAccPhone.trim()) return;

    db.saveAccount({
      role: newAccRole,
      name: newAccName,
      phone: newAccPhone,
      pin: newAccPin || '1234',
      coachId: newAccCoachId,
      playerIds: newAccPlayerId ? [newAccPlayerId] : []
    });

    setAccounts(db.getAccounts());
    showSuccess(`✅ تم إنشاء حساب ${newAccRole === 'coach' ? 'مدرب' : 'ولي أمر'} لـ ${newAccName} بنجاح!`);
    setNewAccName('');
    setNewAccPhone('');
    setNewAccPin('1234');
    setNewAccCoachId('');
    setNewAccPlayerId('');
  };

  const handleCopyCredentials = (acc) => {
    const text = `🇹🇳 أكاديمية أولستار الرياضية بتطاوين\nمرحباً ${acc.name}،\nبيانات دخول حسابك (${acc.role === 'coach' ? 'مدرب' : 'ولي أمر'}):\n🔗 الموقع: https://allstar.tn/\n📱 الهاتف: ${acc.phone}\n🔑 الرمز السري: ${acc.pin || '1234'}`;
    navigator.clipboard.writeText(text);
    showSuccess(`📋 تم نسخ بيانات الدخول لـ ${acc.name} إلى الحافظة!`);
  };

  const handleResetAccountPin = (id, name) => {
    const newPin = prompt(`أدخل الرمز السري الجديد لـ ${name}:`, '1234');
    if (newPin) {
      db.resetAccountPassword(id, newPin);
      setAccounts(db.getAccounts());
      showSuccess(`🔑 تم تغيير الرمز السري لـ ${name} إلى: ${newPin}`);
    }
  };

  const handleDeleteAccount = (id, name) => {
    if (!window.confirm(`هل أنت متأكد من حذف حساب ${name}؟`)) return;
    db.deleteAccount(id);
    setAccounts(db.getAccounts());
    showSuccess(`🗑️ تم حذف الحساب بنجاح`);
  };

  const pendingPlayers = [
    ...players.filter(p => p.status === 'Pending' || p.group === 'Pending Dossier'),
    ...registrations.map(r => {
      const rawSport = (r.selectedSports && r.selectedSports[0]) || r.sport || 'football';
      const sportName = rawSport === 'football' || rawSport === 'Football' ? 'Football' : (rawSport === 'basketball' || rawSport === 'Basketball' ? 'Basketball' : 'Handball');
      return {
        id: r.id || 'REG-' + Math.floor(1000 + Math.random() * 9000),
        name: r.childName || r.name || 'طفل جديد',
        age: Number(r.childAge || r.age) || 10,
        sport: sportName,
        group: 'Pending Dossier',
        parentName: `${r.parentName || ''} (${r.relation || 'ولي أمر'})`,
        parentPhone: r.parentPhone || r.phone || '',
        parentEmail: r.parentEmail || r.email || '',
        gender: r.gender || 'ذكر',
        grade: r.grade || '',
        medicalNotes: r.medicalNotes || '',
        preferredTime: r.preferredTime || '',
        status: 'Pending',
        photoUrl: r.photoUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=200&auto=format&fit=crop&q=80',
        stats: { speed: 75, puissance: 75, stamina: 75, shooting: 75, passing: 75, technique: 75, defense: 75, mental: 75 },
        matchStats: { goals: 0, assists: 0, points: 0 }
      };
    })
  ].filter((p, index, self) => index === self.findIndex(t => t.id === p.id || t.name === p.name));

  const filteredPlayers = players.filter(p => {
    const matchesSearch = !searchQuery.trim() ||
      (p.name && p.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.id && p.id.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSport = selectedSport === 'all' || p.sport === selectedSport;
    return matchesSearch && matchesSport;
  });

  const tabs = [
    { id: 'overview',       icon: '📊', label: 'Dashboard',       color: '#FFC107', badge: 0 },
    { id: 'registrations',  icon: '⏳', label: 'Pending Dossiers', color: '#FF9500', badge: pendingPlayers.length },
    { id: 'carousel',       icon: '🖼️', label: 'Hero Carousel',    color: '#E040FB', badge: (siteForm.gallery_images || []).length },
    { id: 'accounts',       icon: '🔐', label: 'Credentials',      color: '#00E676', badge: accounts.length },
    { id: 'coaches',        icon: '🏅', label: 'Coaches',          color: '#FF9500', badge: coaches.length },
    { id: 'players',        icon: '⚽', label: 'Players',          color: '#00E676', badge: players.length },
    { id: 'siteeditor',     icon: '🌐', label: 'Website Content',  color: '#00E5FF', badge: 0 },
    { id: 'qrscanner',      icon: '📱', label: 'QR Scanner',       color: '#E040FB', badge: 0 },
    { id: 'announcements',  icon: '📢', label: 'Broadcast Push',   color: '#FF3D00', badge: 0 },
  ];

  const tabMeta = {
    overview:       { title: 'لوحة التحكم',      subtitle: 'نظرة عامة على الأكاديمية' },
    registrations:  { title: 'ملفات الانتساب',    subtitle: 'طلبات التسجيل المعلقة' },
    carousel:       { title: 'الصور الرئيسية',    subtitle: 'إدارة معرض الصور' },
    accounts:       { title: 'الحسابات',           subtitle: 'بيانات دخول المدربين وأولياء الأمور' },
    coaches:        { title: 'المدربون',           subtitle: 'إدارة الطاقم التدريبي' },
    players:        { title: 'اللاعبون',           subtitle: 'قائمة اللاعبين المسجلين' },
    siteeditor:     { title: 'محتوى الموقع',       subtitle: 'تعديل محتوى الصفحة الرئيسية' },
    qrscanner:      { title: 'ماسح QR',            subtitle: 'تسجيل الحضور بالرمز المربع' },
    announcements:  { title: 'البث المباشر',       subtitle: 'إرسال إشعارات لجميع المستخدمين' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #060912 0%, #0A1628 100%)',
      color: '#FFF', fontFamily: '"Cairo", "Tajawal", sans-serif', direction: 'ltr',
      display: 'flex', paddingTop: '72px'
    }}>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MODALS                                                                  */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {editingPlayer && (
        <PlayerEditModal
          player={editingPlayer}
          coaches={coaches}
          onSave={handleSavePlayer}
          onClose={() => setEditingPlayer(null)}
        />
      )}
      {showBulkModal && (
        <BulkPlayerModal
          coaches={coaches}
          onSaveBulk={handleSaveBulkPlayers}
          onClose={() => setShowBulkModal(false)}
        />
      )}
      {(addingCoach || editingCoach) && (
        <CoachFormModal
          coach={editingCoach}
          onSave={handleSaveCoach}
          onClose={() => { setAddingCoach(false); setEditingCoach(null); }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MOBILE SIDEBAR OVERLAY                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
            zIndex: 998, backdropFilter: 'blur(4px)'
          }}
        />
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* SIDEBAR                                                                 */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <style>{`
        @keyframes adminFadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes adminSlideIn { from { opacity: 0; transform: translateX(-12px); } to { opacity: 1; transform: translateX(0); } }
        .admin-nav-item:hover { background: rgba(255,255,255,0.05) !important; }
        .admin-nav-item:hover .admin-nav-icon { transform: scale(1.15); }
        .admin-sidebar-inner::-webkit-scrollbar { width: 4px; }
        .admin-sidebar-inner::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        @media (max-width: 768px) {
          .admin-sidebar { transform: translateX(-100%); transition: transform 0.3s cubic-bezier(0.4,0,0.2,1) !important; }
          .admin-sidebar.open { transform: translateX(0) !important; }
          .admin-content { margin-left: 0 !important; }
          .admin-hamburger { display: flex !important; }
        }
      `}</style>

      <aside
        className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}
        style={{
          position: 'fixed', top: '72px', left: 0, bottom: 0, width: '248px',
          background: '#080D1A',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          zIndex: 999, display: 'flex', flexDirection: 'column',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          boxShadow: '4px 0 24px rgba(0,0,0,0.4)'
        }}
      >
        {/* Sidebar Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          display: 'flex', alignItems: 'center', gap: '12px'
        }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '12px',
            background: 'linear-gradient(135deg, #FFC107, #FF9500)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.2rem', flexShrink: 0,
            boxShadow: '0 4px 12px rgba(255,193,7,0.35)'
          }}>⭐</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: '0.92rem', color: '#FFF', lineHeight: 1.2 }}>All-Star</div>
            <div style={{ fontSize: '0.72rem', color: '#FFC107', fontWeight: 700, letterSpacing: '0.5px' }}>ADMIN PANEL</div>
          </div>
        </div>

        {/* Nav Items */}
        <nav className="admin-sidebar-inner" style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
          {tabs.map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                className="admin-nav-item"
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '11px',
                  padding: '11px 12px', borderRadius: '12px', border: 'none',
                  background: isActive ? `${tab.color}14` : 'transparent',
                  borderLeft: isActive ? `3px solid ${tab.color}` : '3px solid transparent',
                  color: isActive ? tab.color : '#7A8BA6',
                  cursor: 'pointer', textAlign: 'left', marginBottom: '3px',
                  fontFamily: '"Cairo", "Tajawal", sans-serif',
                  transition: 'all 0.18s ease',
                  position: 'relative'
                }}
              >
                <span
                  className="admin-nav-icon"
                  style={{ fontSize: '1.1rem', flexShrink: 0, transition: 'transform 0.18s ease', display: 'block', lineHeight: 1 }}
                >
                  {tab.icon}
                </span>
                <span style={{ fontWeight: isActive ? 800 : 600, fontSize: '0.86rem', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tab.label}
                </span>
                {tab.badge > 0 && (
                  <span style={{
                    background: tab.color, color: '#000',
                    fontSize: '0.65rem', fontWeight: 900,
                    padding: '2px 7px', borderRadius: '20px',
                    minWidth: '20px', textAlign: 'center', flexShrink: 0,
                    lineHeight: '16px'
                  }}>{tab.badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* System Status Footer */}
        <div style={{
          padding: '14px 16px',
          borderTop: '1px solid rgba(255,255,255,0.06)',
          background: 'rgba(0,230,118,0.05)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: '#00E676', display: 'block', flexShrink: 0,
              boxShadow: '0 0 8px #00E676'
            }} />
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#00E676' }}>النظام متصل</div>
              <div style={{ fontSize: '0.68rem', color: '#5A7A6A' }}>{players.length} لاعب · {coaches.length} مدرب</div>
            </div>
          </div>
        </div>
      </aside>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT                                                            */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      <div
        className="admin-content"
        style={{ marginLeft: '248px', flex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Top Content Header */}
        <div style={{
          padding: '24px 28px 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '12px'
        }}>
          {/* Mobile hamburger */}
          <button
            onClick={() => setSidebarOpen(s => !s)}
            style={{
              display: 'none', background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#FFF', width: '40px', height: '40px', fontSize: '1.2rem',
              cursor: 'pointer', alignItems: 'center', justifyContent: 'center'
            }}
            className="admin-hamburger"
          >☰</button>

          <div style={{ animation: 'adminSlideIn 0.35s ease' }}>
            <div style={{ fontSize: '0.72rem', color: '#5A6A7E', fontWeight: 700, marginBottom: '3px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              لوحة التحكم › {tabMeta[activeTab]?.title}
            </div>
            <h1 style={{ fontSize: '1.55rem', fontWeight: 900, color: '#FFF', margin: 0, lineHeight: 1.2 }}>
              {tabMeta[activeTab]?.title}
            </h1>
            <p style={{ color: '#5A6A7E', fontSize: '0.82rem', margin: '3px 0 0 0' }}>
              {tabMeta[activeTab]?.subtitle}
            </p>
          </div>

          {savedSuccessMsg && (
            <div style={{
              background: 'rgba(0,230,118,0.12)', border: '1.5px solid #00E676', color: '#00E676',
              padding: '10px 18px', borderRadius: '14px', fontWeight: 800, fontSize: '0.85rem',
              animation: 'adminFadeIn 0.3s ease', display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              ✅ {savedSuccessMsg}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '20px 28px 0' }} />

        {/* Page Content */}
        <div style={{ padding: '24px 28px 60px', animation: 'adminFadeIn 0.3s ease' }}>

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: OVERVIEW                                                       */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div>
            {/* KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '18px', marginBottom: '28px' }}>
              {[
                { label: 'إجمالي اللاعبين', value: players.length, color: '#FFC107', icon: '⚽', sub: `+${players.filter(p => p.sport === 'Football').length} كرة قدم` },
                { label: 'عدد المدربين', value: coaches.length, color: '#FF9500', icon: '🏅', sub: `${SPORTS.length} رياضات` },
                { label: 'نسبة الحضور', value: '92.8%', color: '#00E676', icon: '✅', sub: 'معدل ممتاز' },
                { label: 'مداخيل الشهر', value: '8,540 DT', color: '#00E5FF', icon: '💰', sub: 'نسبة تحصيل 94%' },
              ].map(kpi => (
                <div key={kpi.label} style={{ ...cardStyle, borderTop: `3px solid ${kpi.color}` }}>
                  <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{kpi.icon}</div>
                  <div style={{ color: '#8E9BAE', fontSize: '0.82rem', marginBottom: '6px' }}>{kpi.label}</div>
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: kpi.color }}>{kpi.value}</div>
                  <div style={{ color: '#8E9BAE', fontSize: '0.78rem', marginTop: '4px' }}>{kpi.sub}</div>
                </div>
              ))}
            </div>

            {/* Sport Distribution + Quick Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '24px' }}>
              <div style={cardStyle}>
                <h3 style={{ color: '#FFC107', fontSize: '1.1rem', fontWeight: 900, marginBottom: '16px' }}>توزيع اللاعبين حسب الرياضة ⚽🏀🤾</h3>
                {SPORTS.map(sport => {
                  const count = players.filter(p => p.sport === sport).length;
                  const pct = players.length ? Math.round((count / players.length) * 100) : 0;
                  return (
                    <div key={sport} style={{ marginBottom: '14px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem', marginBottom: '6px' }}>
                        <span>{SPORT_ICONS[sport]} {sport}</span>
                        <strong style={{ color: SPORT_COLORS[sport] }}>{count} لاعب</strong>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: SPORT_COLORS[sport], borderRadius: '4px', transition: 'width 0.5s' }} />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={cardStyle}>
                <h3 style={{ color: '#FFC107', fontSize: '1.1rem', fontWeight: 900, marginBottom: '16px' }}>إجراءات سريعة ⚡</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { tab: 'coaches', label: '🏅 إضافة مدرب جديد', bg: 'rgba(255,149,0,0.15)', border: '#FF9500', color: '#FF9500' },
                    { tab: 'players', label: '⚽ إضافة لاعب جديد', bg: 'rgba(0,230,118,0.12)', border: '#00E676', color: '#00E676' },
                    { tab: 'siteeditor', label: '🌐 تعديل محتوى الموقع', bg: 'rgba(0,229,255,0.12)', border: '#00E5FF', color: '#00E5FF' },
                    { tab: 'announcements', label: '📢 إرسال إعلان فوري', bg: 'rgba(255,61,0,0.12)', border: '#FF3D00', color: '#FF3D00' },
                    { tab: 'qrscanner', label: '📱 تسجيل حضور QR', bg: 'rgba(224,64,251,0.12)', border: '#E040FB', color: '#E040FB' },
                  ].map(a => (
                    <button key={a.tab} onClick={() => setActiveTab(a.tab)} style={{
                      background: a.bg, border: `1px solid ${a.border}`, color: a.color,
                      padding: '12px 16px', borderRadius: '14px', fontWeight: 800, cursor: 'pointer',
                      textAlign: 'right', fontSize: '0.9rem', fontFamily: '"Cairo", "Tajawal", sans-serif'
                    }}>{a.label}</button>
                  ))}
                </div>
              </div>

              {/* Coaches quick list */}
              <div style={cardStyle}>
                <h3 style={{ color: '#FF9500', fontSize: '1.1rem', fontWeight: 900, marginBottom: '16px' }}>المدربون النشطون 🏅</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {coaches.slice(0, 4).map(c => {
                    const cPlayers = players.filter(p => p.coachId === c.id);
                    return (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <img src={c.photoUrl || c.photourl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'} alt={c.name} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${SPORT_COLORS[c.sport] || '#FFC107'}` }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem' }}>{c.nickname || c.name}</div>
                          <div style={{ color: '#8E9BAE', fontSize: '0.75rem' }}>{SPORT_ICONS[c.sport]} {c.sport} — {c.group} — {cPlayers.length} لاعب</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: PENDING REGISTRATIONS & NEW DOSSIERS                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'registrations' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ color: '#FF9500', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
                  ⏳ Pending Online Registrations ({pendingPlayers.length})
                </h2>
                <p style={{ color: '#8E9BAE', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Review new child dossiers submitted by parents online. Approve to complete their official profile, assign a coach, and create their login credentials.
                </p>
              </div>
            </div>

            {pendingPlayers.length === 0 ? (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px 20px', color: '#8E9BAE' }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '10px' }}>🎉</span>
                <h3 style={{ color: '#FFF', fontSize: '1.2rem', margin: '0 0 6px 0' }}>No Pending Registrations</h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>All submitted child dossiers have been processed and enrolled!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '20px' }}>
                {pendingPlayers.map((p) => (
                  <div key={p.id} style={{
                    background: 'linear-gradient(145deg, rgba(25,32,48,0.9), rgba(12,18,30,0.95))',
                    border: '1.5px solid rgba(255,149,0,0.4)',
                    borderRadius: '22px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ background: 'rgba(255,149,0,0.2)', color: '#FF9500', padding: '4px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 900, border: '1px solid #FF9500' }}>
                        ⏳ Pending Dossier ({p.id})
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#8E9BAE' }}>
                        {SPORT_ICONS[p.sport]} {p.sport}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={p.photoUrl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=150&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2.5px solid #FF9500' }}
                      />
                      <div>
                        <h3 style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: 900, margin: '0 0 2px 0' }}>{p.name}</h3>
                        <div style={{ color: '#FFC107', fontSize: '0.82rem', fontWeight: 800 }}>
                          Age: {p.age} years | Gender: {p.gender || 'ذكر'}
                        </div>
                        {p.grade && <div style={{ color: '#8E9BAE', fontSize: '0.78rem' }}>Grade: {p.grade}</div>}
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '12px', fontSize: '0.82rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div>👨‍👩‍👧‍👦 <strong style={{ color: '#FFF' }}>Parent:</strong> {p.parentName}</div>
                      {p.parentPhone && <div>📞 <strong style={{ color: '#00E5FF' }}>Phone:</strong> <span style={{ direction: 'ltr' }}>{p.parentPhone}</span></div>}
                      {p.parentEmail && <div>📧 <strong style={{ color: '#8E9BAE' }}>Email:</strong> {p.parentEmail}</div>}
                      {p.preferredTime && <div>⏰ <strong style={{ color: '#FFC107' }}>Preferred Time:</strong> {p.preferredTime}</div>}
                      {p.medicalNotes && <div>📝 <strong style={{ color: '#FF5252' }}>Medical Notes:</strong> {p.medicalNotes}</div>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '4px' }}>
                      <button
                        onClick={() => {
                          setEditingPlayer({
                            ...p,
                            status: 'Active',
                            group: 'U12',
                            stats: { speed: 80, puissance: 80, stamina: 80, shooting: 80, passing: 80, technique: 80, defense: 75, mental: 80 }
                          });
                        }}
                        style={{
                          padding: '10px', borderRadius: '12px',
                          background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                          border: 'none', color: '#000', fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer'
                        }}
                      >
                        ✅ Complete & Enroll
                      </button>

                      <button
                        onClick={() => handleDeletePlayer(p.id)}
                        style={{
                          padding: '10px', borderRadius: '12px',
                          background: 'rgba(255,61,0,0.15)',
                          border: '1px solid #FF3D00', color: '#FF3D00', fontWeight: 900, fontSize: '0.82rem', cursor: 'pointer'
                        }}
                      >
                        🗑 Reject Request
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: HERO CAROUSEL & PHOTO GALLERY MANAGER                         */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'carousel' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ color: '#E040FB', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>
                  🖼️ Hero Carousel & Photo Gallery Manager
                </h2>
                <p style={{ color: '#8E9BAE', fontSize: '0.88rem', margin: '4px 0 0 0' }}>
                  Upload local images, edit slide captions, and control the main homepage photo carousel in real-time
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={async () => {
                    const gi = [...(siteForm.gallery_images || [])];
                    gi.push({ id: 'SLIDE-' + Date.now(), url: '', caption: '⚽ صور الأكاديمية الجديدة' });
                    setSiteForm(f => ({ ...f, gallery_images: gi }));
                    await db.saveSiteContent({ ...siteForm, gallery_images: gi });
                    showSuccess('➕ تم إضافة شريحة جديدة وتحديث البث المباشر');
                  }}
                  style={{
                    background: 'linear-gradient(135deg, #E040FB, #7B1FA2)',
                    border: 'none', color: '#FFF', padding: '12px 22px', borderRadius: '14px',
                    fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem',
                    boxShadow: '0 4px 15px rgba(224, 64, 251, 0.35)'
                  }}
                >
                  ➕ Add New Carousel Slide
                </button>
                <button
                  onClick={handleSaveSiteContent}
                  style={{
                    background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                    border: 'none', color: '#000', padding: '12px 24px', borderRadius: '14px',
                    fontWeight: 900, cursor: 'pointer', fontSize: '0.9rem',
                    boxShadow: '0 4px 15px rgba(0, 230, 118, 0.35)'
                  }}
                >
                  💾 Save & Publish Live Carousel
                </button>
              </div>
            </div>

            {/* UPLOAD & CAROUSEL CARDS GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
              {(siteForm.gallery_images || []).map((img, idx) => (
                <div key={img.id || idx} style={{
                  background: 'rgba(20, 26, 40, 0.85)',
                  border: '1.5px solid rgba(224, 64, 251, 0.35)',
                  borderRadius: '20px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px',
                  position: 'relative', boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ background: 'rgba(224,64,251,0.2)', color: '#E040FB', padding: '3px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 900 }}>
                      Slide #{idx + 1}
                    </span>
                    <button
                      onClick={async () => {
                        const gi = siteForm.gallery_images.filter((_, i) => i !== idx);
                        setSiteForm(f => ({ ...f, gallery_images: gi }));
                        await db.saveSiteContent({ ...siteForm, gallery_images: gi });
                        showSuccess(`🗑️ تم حذف الصورة #${idx + 1} وتحديث الكاروسيل على الهواتف`);
                      }}
                      style={{
                        background: 'rgba(255,61,0,0.2)', border: '1px solid #FF3D00', color: '#FF3D00',
                        borderRadius: '8px', padding: '4px 10px', cursor: 'pointer', fontWeight: 800, fontSize: '0.78rem'
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>

                  {/* IMAGE PREVIEW */}
                  {img.url ? (
                    <img
                      src={img.url}
                      alt={img.caption || 'Carousel slide'}
                      style={{ width: '100%', height: '180px', borderRadius: '14px', objectFit: 'cover', border: '1.5px solid rgba(255,255,255,0.1)' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '180px', borderRadius: '14px', background: 'rgba(255,255,255,0.04)', border: '2px dashed rgba(224,64,251,0.4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8E9BAE' }}>
                      <span style={{ fontSize: '2rem' }}>📷</span>
                      <span style={{ fontSize: '0.8rem', marginTop: '6px' }}>Upload Image or Paste URL</span>
                    </div>
                  )}

                  {/* FILE UPLOADER CONTROL - AUTO SAVES & PUBLISHES TO CLOUD IMMEDIATELY */}
                  <ImageUploader
                    label="Upload Image File (Auto-Syncs Live to Phones)"
                    value={img.url}
                    onChange={async (val) => {
                      const g = [...siteForm.gallery_images];
                      g[idx] = { ...img, url: val };
                      setSiteForm(f => ({ ...f, gallery_images: g }));
                      await db.saveSiteContent({ ...siteForm, gallery_images: g });
                      showSuccess(`🚀 تم رفع ونشر الصورة #${idx + 1} بنجاح على جميع الهواتف!`);
                    }}
                    size={50}
                  />

                  <div>
                    <label style={labelStyle}>Slide Caption / Title</label>
                    <input
                      style={inputStyle}
                      value={img.caption || ''}
                      placeholder="e.g. ⚽ All-Star U12 Match Photos"
                      onChange={async (e) => {
                        const newCap = e.target.value;
                        const g = [...siteForm.gallery_images];
                        g[idx] = { ...img, caption: newCap };
                        setSiteForm(f => ({ ...f, gallery_images: g }));
                        await db.saveSiteContent({ ...siteForm, gallery_images: g });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '24px' }}>
              <button
                onClick={handleSaveSiteContent}
                style={{
                  width: '100%', padding: '16px', borderRadius: '16px',
                  background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                  border: 'none', color: '#000', fontWeight: 900, fontSize: '1rem',
                  cursor: 'pointer', boxShadow: '0 6px 20px rgba(0,230,118,0.35)'
                }}
              >
                🚀 Publish All Carousel Slides Live to Homepage
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: ACCOUNTS & ACCESS CONTROL                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'accounts' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ color: '#00E676', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>🔐 إدارة حسابات الدخول وتصاريح النفاذ</h2>
                <p style={{ color: '#8E9BAE', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
                  أنشئ حسابات جديدة للمدربين وأولياء الأمور، عدّل بيانات الدخول أو أعد تعيين الرموز السرية
                </p>
              </div>
            </div>

            {/* CREATE ACCOUNT FORM CARD */}
            <div style={{ ...cardStyle, border: '1px solid rgba(0,230,118,0.3)', marginBottom: '28px' }}>
              <h3 style={{ color: '#00E676', fontSize: '1.1rem', fontWeight: 900, marginBottom: '16px' }}>
                ➕ إنشاء حساب جديد للعملاء والمدربين (Parent or Coach Account)
              </h3>
              <form onSubmit={handleCreateAccount} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', alignItems: 'end' }}>
                <div>
                  <label style={labelStyle}>نوع الحساب *</label>
                  <select style={inputStyle} value={newAccRole} onChange={e => setNewAccRole(e.target.value)}>
                    <option value="parent" style={{ color: '#000' }}>👨‍👩‍👧‍👦 ولي أمر (Parent / Client)</option>
                    <option value="coach" style={{ color: '#000' }}>⚽ مدرب / كابتن (Coach)</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>الاسم الكامل *</label>
                  <input style={inputStyle} value={newAccName} onChange={e => setNewAccName(e.target.value)} placeholder="مثال: الكابتن فاروق أو محمد علي" required />
                </div>
                <div>
                  <label style={labelStyle}>رقم الهاتف المسجل *</label>
                  <input style={inputStyle} value={newAccPhone} onChange={e => setNewAccPhone(e.target.value)} placeholder="+216 98 123 456" required />
                </div>
                <div>
                  <label style={labelStyle}>الرمز السري / PIN (كلمة السر)</label>
                  <input style={inputStyle} value={newAccPin} onChange={e => setNewAccPin(e.target.value)} placeholder="1234" required />
                </div>

                {newAccRole === 'coach' ? (
                  <div>
                    <label style={labelStyle}>ربط بـ مدرب مسجل</label>
                    <select style={inputStyle} value={newAccCoachId} onChange={e => setNewAccCoachId(e.target.value)}>
                      <option value="" style={{ color: '#000' }}>-- اختيار مدرب --</option>
                      {coaches.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>{c.nickname || c.name} ({c.sport})</option>)}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label style={labelStyle}>ربط بـ ابن/لاعب مسجل</label>
                    <select style={inputStyle} value={newAccPlayerId} onChange={e => setNewAccPlayerId(e.target.value)}>
                      <option value="" style={{ color: '#000' }}>-- اختيار لاعب --</option>
                      {players.map(p => <option key={p.id} value={p.id} style={{ color: '#000' }}>{p.name} ({p.sport})</option>)}
                    </select>
                  </div>
                )}

                <div style={{ gridColumn: '1 / -1' }}>
                  <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: '14px', background: 'linear-gradient(135deg, #00E676, #00B0FF)', border: 'none', color: '#000', fontWeight: 900, fontSize: '0.95rem', cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif', boxShadow: '0 4px 14px rgba(0, 230, 118, 0.3)' }}>
                    🚀 حفظ وإنشاء حساب الدخول فوراً
                  </button>
                </div>
              </form>
            </div>

            {/* ACCOUNTS TABLE */}
            <div style={cardStyle}>
              <h3 style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: 900, marginBottom: '16px' }}>
                📋 قائمة الحسابات وكلمات المرور بالنظام ({accounts.length})
              </h3>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#8E9BAE' }}>
                      <th style={{ padding: '12px' }}>النوع</th>
                      <th style={{ padding: '12px' }}>صاحب الحساب</th>
                      <th style={{ padding: '12px' }}>رقم الهاتف</th>
                      <th style={{ padding: '12px' }}>الرمز السري (PIN)</th>
                      <th style={{ padding: '12px' }}>حالة الحساب</th>
                      <th style={{ padding: '12px' }}>إرسال / تغيير / حذف</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accounts.map(acc => (
                      <tr key={acc.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 900,
                            background: acc.role === 'coach' ? 'rgba(255,193,7,0.15)' : 'rgba(0,230,118,0.15)',
                            color: acc.role === 'coach' ? '#FFC107' : '#00E676',
                            border: `1px solid ${acc.role === 'coach' ? '#FFC107' : '#00E676'}`
                          }}>
                            {acc.role === 'coach' ? '⚽ مدرب' : '👨‍👩‍👧‍👦 ولي أمر'}
                          </span>
                        </td>
                        <td style={{ padding: '12px', fontWeight: 800 }}>{acc.name}</td>
                        <td style={{ padding: '12px', color: '#00E5FF', direction: 'ltr', textAlign: 'right' }}>{acc.phone}</td>
                        <td style={{ padding: '12px', fontFamily: 'monospace', color: '#FFC107', fontWeight: 900 }}>{acc.pin || '1234'}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ color: '#00E676', fontSize: '0.8rem', fontWeight: 800 }}>🟢 نشط</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button onClick={() => handleCopyCredentials(acc)} style={{
                              padding: '6px 12px', borderRadius: '8px', background: 'rgba(0,229,255,0.15)', border: '1px solid #00E5FF', color: '#00E5FF', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer'
                            }}>
                              📲 نسخ البيانات
                            </button>
                            <button onClick={() => handleResetAccountPin(acc.id, acc.name)} style={{
                              padding: '6px 12px', borderRadius: '8px', background: 'rgba(255,193,7,0.15)', border: '1px solid #FFC107', color: '#FFC107', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer'
                            }}>
                              🔑 تغيير PIN
                            </button>
                            <button onClick={() => handleDeleteAccount(acc.id, acc.name)} style={{
                              padding: '6px 10px', borderRadius: '8px', background: 'rgba(255,61,0,0.12)', border: '1px solid #FF3D00', color: '#FF3D00', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer'
                            }}>
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: COACHES                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'coaches' && (
          <div>
            {/* Header + Add button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ color: '#FF9500', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>🏅 إدارة المدربين</h2>
                <p style={{ color: '#8E9BAE', fontSize: '0.85rem', margin: '4px 0 0 0' }}>أضف أو عدّل أو احذف مدربي الأكاديمية — كل مدرب مرتبط بفريقه ولاعبيه</p>
              </div>
              <button onClick={() => setAddingCoach(true)} style={{
                background: 'linear-gradient(135deg, #FF9500, #FFC107)', border: 'none',
                color: '#000', padding: '12px 24px', borderRadius: '14px', fontWeight: 900, cursor: 'pointer',
                fontSize: '0.9rem', fontFamily: '"Cairo", "Tajawal", sans-serif'
              }}>
                ➕ إضافة مدرب جديد
              </button>
            </div>

            {/* Coaches grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
              {coaches.map(coach => {
                const coachPlayers = players.filter(p => p.coachId === coach.id);
                const isExpanded = expandedCoach === coach.id;
                const sportColor = SPORT_COLORS[coach.sport] || '#FFC107';

                return (
                  <div key={coach.id} style={{
                    background: 'rgba(255,255,255,0.04)', border: `1px solid rgba(255,255,255,0.1)`,
                    borderTop: `3px solid ${sportColor}`, borderRadius: '20px', overflow: 'hidden',
                    transition: 'all 0.3s'
                  }}>
                    {/* Coach Header */}
                    <div style={{ padding: '20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                        <img src={coach.photoUrl || coach.photourl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'}
                          alt={coach.name}
                          style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${sportColor}` }}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 900, fontSize: '1.05rem', color: '#FFF' }}>{coach.name}</div>
                          {coach.nickname && <div style={{ color: sportColor, fontWeight: 700, fontSize: '0.85rem' }}>{coach.nickname}</div>}
                          <div style={{ color: '#8E9BAE', fontSize: '0.78rem', marginTop: '2px' }}>
                            {SPORT_ICONS[coach.sport]} {coach.sport} | فئة {coach.group}
                          </div>
                          {coach.phone && <div style={{ color: '#B0BEC5', fontSize: '0.78rem' }}>📞 {coach.phone}</div>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <button onClick={() => setEditingCoach(coach)} style={{
                            background: 'rgba(255,193,7,0.15)', border: '1px solid #FFC107', color: '#FFC107',
                            padding: '6px 12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem',
                            fontFamily: '"Cairo", "Tajawal", sans-serif'
                          }}>✏️ تعديل</button>
                          <button onClick={() => handleDeleteCoach(coach.id)} style={{
                            background: 'rgba(255,61,0,0.12)', border: '1px solid #FF3D00', color: '#FF3D00',
                            padding: '6px 12px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem',
                            fontFamily: '"Cairo", "Tajawal", sans-serif'
                          }}>🗑 حذف</button>
                        </div>
                      </div>

                      {coach.bio && (
                        <p style={{ color: '#8E9BAE', fontSize: '0.8rem', margin: '0 0 12px 0', lineHeight: 1.5 }}>{coach.bio}</p>
                      )}

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: sportColor, fontWeight: 900, fontSize: '0.85rem' }}>
                          {coachPlayers.length} لاعب في الفريق
                        </span>
                        <button onClick={() => setExpandedCoach(isExpanded ? null : coach.id)} style={{
                          background: `rgba(${sportColor === '#00E676' ? '0,230,118' : sportColor === '#FF9500' ? '255,149,0' : '0,229,255'},0.12)`,
                          border: `1px solid ${sportColor}`, color: sportColor,
                          padding: '6px 14px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem',
                          fontFamily: '"Cairo", "Tajawal", sans-serif'
                        }}>
                          {isExpanded ? '▲ إخفاء اللاعبين' : '▼ عرض اللاعبين'}
                        </button>
                      </div>
                    </div>

                    {/* Players gallery under coach */}
                    {isExpanded && (
                      <div style={{ borderTop: `1px solid rgba(255,255,255,0.08)`, padding: '16px 20px', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ fontSize: '0.78rem', color: '#8E9BAE', marginBottom: '12px', fontWeight: 700 }}>
                          👇 انقر على صورة اللاعب لتعديل بياناته وإحصائياته:
                        </div>
                        {coachPlayers.length === 0 ? (
                          <div style={{ color: '#8E9BAE', fontSize: '0.82rem', textAlign: 'center', padding: '16px' }}>
                            لا يوجد لاعبون مرتبطون بهذا المدرب بعد
                          </div>
                        ) : (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                            {coachPlayers.map(p => (
                              <div key={p.id}
                                onClick={() => setEditingPlayer(p)}
                                style={{ cursor: 'pointer', textAlign: 'center', position: 'relative' }}
                                title={`تعديل ${p.name}`}
                              >
                                <div style={{ position: 'relative' }}>
                                  <img src={p.photoUrl || p.photourl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=100&auto=format&fit=crop&q=80'}
                                    alt={p.name}
                                    style={{ width: '54px', height: '54px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${sportColor}`, transition: 'transform 0.2s' }}
                                    onMouseEnter={e => e.target.style.transform = 'scale(1.12)'}
                                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                  />
                                  {/* OVR badge */}
                                  <div style={{
                                    position: 'absolute', bottom: '-2px', right: '-2px',
                                    background: '#FFC107', color: '#000', borderRadius: '50%',
                                    width: '18px', height: '18px', fontSize: '0.6rem', fontWeight: 900,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                  }}>
                                    {p.stats ? Math.round(Object.values(p.stats).reduce((a, b) => a + b, 0) / Object.values(p.stats).length) : '?'}
                                  </div>
                                </div>
                                <div style={{ fontSize: '0.62rem', color: '#B0BEC5', marginTop: '4px', maxWidth: '58px', wordBreak: 'break-word', lineHeight: 1.2 }}>
                                  {p.name.split(' ')[0]}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: PLAYERS                                                        */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'players' && (
          <div>
            {/* Header & Controls Toolbar */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(16, 24, 39, 0.8), rgba(8, 14, 26, 0.95))',
              border: '1px solid rgba(0, 230, 118, 0.25)',
              borderRadius: '24px',
              padding: '20px 24px',
              marginBottom: '28px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '1.6rem' }}>⚽</span>
                  <div>
                    <h2 style={{ color: '#00E676', fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>إدارة اللاعبين والنظام</h2>
                    <p style={{ color: '#8E9BAE', fontSize: '0.82rem', margin: '2px 0 0 0' }}>
                      إجمالي {filteredPlayers.length} لاعب مسجل من أصل {players.length} — انقر لتعديل البيانات والبطاقة
                    </p>
                  </div>
                </div>
              </div>

              {/* Filters & View Switcher */}
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="🔍 ابحث بالاسم أو المعرف..."
                    style={{
                      ...inputStyle,
                      width: '240px',
                      padding: '10px 16px',
                      background: 'rgba(255,255,255,0.06)',
                      borderColor: searchQuery ? '#00E676' : 'rgba(255,255,255,0.15)'
                    }}
                  />
                </div>

                <select
                  value={selectedSport}
                  onChange={e => setSelectedSport(e.target.value)}
                  style={{
                    ...inputStyle,
                    width: 'auto',
                    padding: '10px 16px',
                    background: 'rgba(255,255,255,0.06)',
                    cursor: 'pointer'
                  }}
                >
                  <option value="all" style={{ color: '#000' }}>🏆 جميع الرياضات</option>
                  {SPORTS.map(s => <option key={s} value={s} style={{ color: '#000' }}>{SPORT_ICONS[s]} {s}</option>)}
                </select>

                <button
                  onClick={() => setPlayerTabView(v => v === 'grid' ? 'table' : 'grid')}
                  style={{
                    background: playerTabView === 'grid' ? 'rgba(0,230,118,0.15)' : 'rgba(255,255,255,0.08)',
                    border: `1.5px solid ${playerTabView === 'grid' ? '#00E676' : 'rgba(255,255,255,0.2)'}`,
                    color: playerTabView === 'grid' ? '#00E676' : '#FFF',
                    padding: '10px 18px',
                    borderRadius: '14px',
                    fontWeight: 800,
                    cursor: 'pointer',
                    fontFamily: '"Cairo", "Tajawal", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {playerTabView === 'grid' ? '🔲 عرض الشبكة' : '📋 عرض الجدول'}
                </button>
              </div>
            </div>

            {/* Redesigned Add Player Form */}
            <div style={{
              ...cardStyle,
              marginBottom: '32px',
              border: '1px solid rgba(0,230,118,0.3)',
              background: 'linear-gradient(145deg, rgba(10, 25, 20, 0.8) 0%, rgba(8, 16, 28, 0.95) 100%)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: 0, right: 0, width: '150px', height: '150px',
                background: 'radial-gradient(circle, rgba(0,230,118,0.12) 0%, transparent 70%)',
                pointerEvents: 'none'
              }} />

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                <h4 style={{ color: '#00E676', fontSize: '1.1rem', fontWeight: 900, display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <span style={{ background: 'rgba(0,230,118,0.2)', padding: '6px 12px', borderRadius: '12px' }}>➕</span>
                  إضافة لاعب جديد وربطه بالنظام
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => setShowBulkModal(true)}
                    style={{
                      padding: '10px 22px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                      border: 'none',
                      color: '#04101A',
                      fontWeight: 900,
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      fontFamily: '"Cairo", "Tajawal", sans-serif',
                      boxShadow: '0 6px 22px rgba(0,230,118,0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transform: 'scale(1.02)'
                    }}
                  >
                    <span>⚡</span> إضافة مجموعة لاعبين من ملف (Bulk Import)
                  </button>
                  <span style={{ fontSize: '0.78rem', color: '#8E9BAE', fontWeight: 700 }}>
                    تعبئة حقول (*)
                  </span>
                </div>
              </div>

              <form onSubmit={handleAddPlayer}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '20px' }}>

                  {/* Section 1: Personal & Sport Details */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px' }}>
                    <div style={{ color: '#FFC107', fontSize: '0.85rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      👤 البيانات الأساسية والرياضة
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>الاسم الكامل للاعب *</label>
                        <input name="playerName" required style={inputStyle} placeholder="مثال: أحمد الجديدي" />
                      </div>
                      <div>
                        <label style={labelStyle}>العمر (سنوات)</label>
                        <input name="age" type="number" min="5" max="20" defaultValue={10} style={inputStyle} />
                      </div>
                      <div>
                        <label style={labelStyle}>الرياضة</label>
                        <select name="sport" required style={inputStyle}>
                          {SPORTS.map(s => <option key={s} value={s} style={{ color: '#000' }}>{SPORT_ICONS[s]} {s}</option>)}
                        </select>
                      </div>
                      <div style={{ gridColumn: '1 / -1' }}>
                        <label style={labelStyle}>الفئة العمرية</label>
                        <select name="ageGroup" style={inputStyle}>
                          {GROUPS.map(g => <option key={g} value={g} style={{ color: '#000' }}>فئة {g}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Coach & Team Association */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px' }}>
                    <div style={{ color: '#00E5FF', fontSize: '0.85rem', fontWeight: 800, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      📋 المدرب المسؤول والتواصل
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div>
                        <label style={labelStyle}>المدرب المسؤول</label>
                        <select name="coachId" style={inputStyle}>
                          <option value="" style={{ color: '#000' }}>-- اختر المدرب المسؤول --</option>
                          {coaches.map(c => <option key={c.id} value={c.id} style={{ color: '#000' }}>🏅 {c.nickname || c.name} ({c.sport})</option>)}
                        </select>
                      </div>
                      <div>
                        <label style={labelStyle}>اسم الفريق / المجموعة</label>
                        <input name="teamName" style={inputStyle} placeholder="مثال: فريق أولستار U12 A" />
                      </div>
                      <div>
                        <label style={labelStyle}>اسم ولي الأمر + الهاتف</label>
                        <input name="parentName" style={inputStyle} placeholder="مثال: محمد (21698123456+)" />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Photo & Studio Engine */}
                  <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '18px', padding: '16px' }}>
                    <ImageUploader
                      label="📸 صورة الشخصية وبطاقة اللاعب"
                      value={newPlayerPhoto}
                      onChange={setNewPlayerPhoto}
                      size={70}
                    />
                  </div>

                </div>

                <button type="submit" style={{
                  width: '100%',
                  padding: '16px',
                  background: 'linear-gradient(135deg, #00E676 0%, #00B0FF 100%)',
                  border: 'none',
                  borderRadius: '16px',
                  color: '#04101A',
                  fontWeight: 900,
                  cursor: 'pointer',
                  fontSize: '1rem',
                  fontFamily: '"Cairo", "Tajawal", sans-serif',
                  boxShadow: '0 6px 20px rgba(0, 230, 118, 0.35)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}>
                  <span>🚀</span> إضافة اللاعب وحفظ البطاقة بالنظام
                </button>
              </form>
            </div>

            {/* Players Grid View */}
            {playerTabView === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
                {filteredPlayers.map(p => {
                  const ovr = p.stats ? Math.round(Object.values(p.stats).reduce((a, b) => a + b, 0) / Object.values(p.stats).length) : 0;
                  const sportColor = SPORT_COLORS[p.sport] || '#FFC107';

                  return (
                    <div
                      key={p.id}
                      onClick={() => setEditingPlayer(p)}
                      style={{
                        background: 'linear-gradient(160deg, rgba(20, 28, 44, 0.85) 0%, rgba(12, 18, 30, 0.95) 100%)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '22px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
                        position: 'relative',
                        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = 'translateY(-6px)';
                        e.currentTarget.style.borderColor = sportColor;
                        e.currentTarget.style.boxShadow = `0 14px 30px rgba(0,0,0,0.5), 0 0 15px ${sportColor}33`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                      }}
                    >
                      {/* Top Accent Strip */}
                      <div style={{ height: '4px', background: `linear-gradient(90deg, ${sportColor}, #FFC107)` }} />

                      <div style={{ padding: '18px 16px 14px 16px', textContent: 'center', textAlign: 'center', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

                        {/* OVR Rating Badge + Sport Badge Header */}
                        <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <span style={{
                            background: `rgba(${sportColor === '#00E676' ? '0,230,118' : sportColor === '#FF9500' ? '255,149,0' : '0,229,255'},0.15)`,
                            border: `1px solid ${sportColor}`,
                            color: sportColor,
                            padding: '3px 10px',
                            borderRadius: '10px',
                            fontSize: '0.72rem',
                            fontWeight: 800
                          }}>
                            {SPORT_ICONS[p.sport]} {p.group}
                          </span>

                          <div style={{
                            background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                            color: '#000',
                            borderRadius: '12px',
                            padding: '2px 10px',
                            fontWeight: 900,
                            fontSize: '0.85rem',
                            boxShadow: '0 2px 8px rgba(255,193,7,0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ fontSize: '0.68rem', opacity: 0.8 }}>OVR</span>
                            <span>{ovr}</span>
                          </div>
                        </div>

                        {/* Player Photo Frame */}
                        <div style={{ position: 'relative', marginBottom: '12px' }}>
                          <img
                            src={p.photoUrl || p.photourl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=200&auto=format&fit=crop&q=80'}
                            alt={p.name}
                            style={{
                              width: '76px',
                              height: '76px',
                              borderRadius: '50%',
                              objectFit: 'cover',
                              border: `3px solid ${sportColor}`,
                              boxShadow: '0 6px 16px rgba(0,0,0,0.4)'
                            }}
                          />
                        </div>

                        {/* Player Name & Info */}
                        <h4 style={{
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          color: '#FFF',
                          margin: '0 0 4px 0',
                          lineHeight: 1.3,
                          maxWidth: '100%',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {p.name.split('(')[0].trim()}
                        </h4>

                        <div style={{ color: '#8E9BAE', fontSize: '0.75rem', marginBottom: '12px' }}>
                          المعرف: <span style={{ color: '#00E5FF', fontWeight: 800 }}>{p.id}</span>
                        </div>

                        {/* Stats Summary Bar */}
                        <div style={{
                          width: '100%',
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderRadius: '12px',
                          padding: '8px 10px',
                          display: 'flex',
                          justify: 'space-around',
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          marginTop: 'auto',
                          marginBottom: '14px'
                        }}>
                          <span style={{ color: '#00E676' }}>⚽ {p.matchStats?.goals || 0}</span>
                          <span style={{ color: '#00E5FF' }}>🎯 {p.matchStats?.assists || 0}</span>
                          <span style={{ color: '#FF9500' }}>🏆 {p.matchStats?.points || 0}</span>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%' }}>
                          <button
                            onClick={e => { e.stopPropagation(); setEditingPlayer(p); }}
                            style={{
                              padding: '8px',
                              background: 'rgba(0, 230, 118, 0.12)',
                              border: '1px solid rgba(0, 230, 118, 0.4)',
                              color: '#00E676',
                              borderRadius: '10px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontFamily: '"Cairo", "Tajawal", sans-serif',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            ✏️ تعديل
                          </button>

                          <button
                            onClick={e => { e.stopPropagation(); handleDeletePlayer(p.id); }}
                            style={{
                              padding: '8px',
                              background: 'rgba(255, 61, 0, 0.1)',
                              border: '1px solid rgba(255, 61, 0, 0.3)',
                              color: '#FF5252',
                              borderRadius: '10px',
                              fontWeight: 800,
                              cursor: 'pointer',
                              fontSize: '0.78rem',
                              fontFamily: '"Cairo", "Tajawal", sans-serif',
                              transition: 'all 0.2s ease'
                            }}
                          >
                            🗑 حذف
                          </button>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Sleek Table View */
              <div style={{ ...cardStyle, padding: '12px', overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid rgba(0,230,118,0.3)', color: '#00E676', fontSize: '0.82rem' }}>
                      {['صورة', 'المعرف', 'الاسم الكامل', 'الرياضة', 'الفئة', 'المدرب', 'OVR', 'أهداف', 'نقاط', 'إجراء'].map(h => (
                        <th key={h} style={{ padding: '14px 12px', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map(p => {
                      const ovr = p.stats ? Math.round(Object.values(p.stats).reduce((a, b) => a + b, 0) / Object.values(p.stats).length) : 0;
                      return (
                        <tr
                          key={p.id}
                          style={{
                            borderBottom: '1px solid rgba(255,255,255,0.05)',
                            fontSize: '0.86rem',
                            transition: 'background 0.2s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                        >
                          <td style={{ padding: '10px 12px' }}>
                            <img
                              src={p.photoUrl || p.photourl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=100&auto=format&fit=crop&q=80'}
                              alt={p.name}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #FFC107' }}
                            />
                          </td>
                          <td style={{ padding: '10px 12px', color: '#00E5FF', fontWeight: 900, fontSize: '0.8rem' }}>{p.id}</td>
                          <td style={{ padding: '10px 12px', fontWeight: 800 }}>{p.name.split('(')[0].trim()}</td>
                          <td style={{ padding: '10px 12px' }}>{SPORT_ICONS[p.sport]} {p.sport}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: 'rgba(255,255,255,0.08)', padding: '3px 8px', borderRadius: '8px', fontWeight: 700 }}>{p.group}</span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#CBD5E1', fontSize: '0.8rem' }}>{p.coachName || '-'}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <span style={{ background: 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(255,149,0,0.2))', color: '#FFC107', padding: '4px 10px', borderRadius: '8px', fontWeight: 900 }}>
                              {ovr}
                            </span>
                          </td>
                          <td style={{ padding: '10px 12px', color: '#00E676', fontWeight: 800 }}>⚽ {p.matchStats?.goals || 0}</td>
                          <td style={{ padding: '10px 12px', color: '#FF9500', fontWeight: 800 }}>🏆 {p.matchStats?.points || 0}</td>
                          <td style={{ padding: '10px 12px' }}>
                            <button
                              onClick={() => setEditingPlayer(p)}
                              style={{
                                background: 'rgba(0,230,118,0.15)',
                                border: '1px solid #00E676',
                                color: '#00E676',
                                padding: '6px 14px',
                                borderRadius: '10px',
                                fontWeight: 800,
                                cursor: 'pointer',
                                fontSize: '0.78rem',
                                fontFamily: '"Cairo", "Tajawal", sans-serif'
                              }}
                            >
                              ✏️ تعديل
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: WEBSITE EDITOR                                                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'siteeditor' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={{ color: '#00E5FF', fontSize: '1.5rem', fontWeight: 900, margin: 0 }}>🌐 محرر الموقع الشامل</h2>
                <p style={{ color: '#8E9BAE', fontSize: '0.85rem', margin: '4px 0 0 0' }}>عدّل كل شيء على الموقع مباشرة — يظهر للزوار فوراً</p>
              </div>
              <button onClick={handleSaveSiteContent} style={{
                background: 'linear-gradient(135deg, #00E5FF, #00B0FF)', border: 'none',
                color: '#000', padding: '12px 28px', borderRadius: '14px', fontWeight: 900, cursor: 'pointer',
                fontSize: '0.95rem', fontFamily: '"Cairo", "Tajawal", sans-serif'
              }}>
                💾 حفظ كل التعديلات
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

              {/* HOME SECTION */}
              <div style={{ ...cardStyle, border: '1px solid rgba(255,193,7,0.2)' }}>
                <h3 style={{ color: '#FFC107', fontSize: '1.05rem', fontWeight: 900, marginBottom: '16px' }}>🏠 الصفحة الرئيسية (Home)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
                  <div>
                    <label style={labelStyle}>عنوان البانر الرئيسي (Hero Title)</label>
                    <input style={inputStyle} value={siteForm.hero_title || ''} onChange={e => updateSiteForm('hero_title', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>الوصف الفرعي (Hero Subtitle)</label>
                    <input style={inputStyle} value={siteForm.hero_subtitle || ''} onChange={e => updateSiteForm('hero_subtitle', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>شريط النتائج المباشرة (Ticker — نتيجة)</label>
                    <input style={inputStyle} value={siteForm.ticker_score || ''} onChange={e => updateSiteForm('ticker_score', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>المباراة القادمة (Ticker — Next Match)</label>
                    <input style={inputStyle} value={siteForm.ticker_next_match || ''} onChange={e => updateSiteForm('ticker_next_match', e.target.value)} />
                  </div>
                  <div>
                    <label style={labelStyle}>حالة الملاعب (Field Status)</label>
                    <select style={inputStyle} value={siteForm.field_status || 'open'} onChange={e => updateSiteForm('field_status', e.target.value)}>
                      <option value="open" style={{ color: '#000' }}>🟢 مفتوحة والتمارين قائمة</option>
                      <option value="warning" style={{ color: '#000' }}>🟡 تنبيه طقس — احتمال نقل للقاعة</option>
                      <option value="closed" style={{ color: '#000' }}>🔴 الحصص ملغاة بسبب الطقس</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* CONTACT SECTION */}
              <div style={{ ...cardStyle, border: '1px solid rgba(0,229,255,0.2)' }}>
                <h3 style={{ color: '#00E5FF', fontSize: '1.05rem', fontWeight: 900, marginBottom: '16px' }}>📞 صفحة التواصل (Contact)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                  <div><label style={labelStyle}>رقم الهاتف</label><input style={inputStyle} value={siteForm.contact_phone || ''} onChange={e => updateSiteForm('contact_phone', e.target.value)} /></div>
                  <div><label style={labelStyle}>البريد الإلكتروني</label><input style={inputStyle} value={siteForm.contact_email || ''} onChange={e => updateSiteForm('contact_email', e.target.value)} /></div>
                  <div><label style={labelStyle}>العنوان الكامل</label><input style={inputStyle} value={siteForm.contact_address || ''} onChange={e => updateSiteForm('contact_address', e.target.value)} /></div>
                  <div><label style={labelStyle}>رابط خريطة Google</label><input style={inputStyle} value={siteForm.contact_map_url || ''} onChange={e => updateSiteForm('contact_map_url', e.target.value)} /></div>
                </div>
              </div>

              {/* FOOTER / SOCIAL */}
              <div style={{ ...cardStyle, border: '1px solid rgba(0,230,118,0.2)' }}>
                <h3 style={{ color: '#00E676', fontSize: '1.05rem', fontWeight: 900, marginBottom: '16px' }}>🔗 روابط التواصل الاجتماعي (Footer)</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '14px' }}>
                  <div><label style={labelStyle}>🔵 Facebook URL</label><input style={inputStyle} value={siteForm.footer_facebook || ''} onChange={e => updateSiteForm('footer_facebook', e.target.value)} /></div>
                  <div><label style={labelStyle}>📸 Instagram URL</label><input style={inputStyle} value={siteForm.footer_instagram || ''} onChange={e => updateSiteForm('footer_instagram', e.target.value)} /></div>
                  <div><label style={labelStyle}>💬 WhatsApp (رقم)</label><input style={inputStyle} value={siteForm.footer_whatsapp || ''} onChange={e => updateSiteForm('footer_whatsapp', e.target.value)} /></div>
                </div>
              </div>

              {/* EVENTS */}
              <div style={{ ...cardStyle, border: '1px solid rgba(255,149,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#FF9500', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>📅 الأحداث والمباريات (Events)</h3>
                  <button onClick={() => {
                    const events = [...(siteForm.events || [])];
                    events.push({ id: 'EVT-' + Date.now(), title: 'حدث جديد', date: '', location: '', description: '', sport: '⚽' });
                    updateSiteForm('events', events);
                  }} style={{
                    background: 'rgba(255,149,0,0.15)', border: '1px solid #FF9500', color: '#FF9500',
                    padding: '7px 14px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem',
                    fontFamily: '"Cairo", "Tajawal", sans-serif'
                  }}>➕ إضافة حدث</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {(siteForm.events || []).map((ev, idx) => (
                    <div key={ev.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px' }}>
                        <div>
                          <label style={labelStyle}>عنوان الحدث</label>
                          <input style={inputStyle} value={ev.title} onChange={e => {
                            const events = [...siteForm.events]; events[idx] = { ...ev, title: e.target.value }; updateSiteForm('events', events);
                          }} />
                        </div>
                        <div>
                          <label style={labelStyle}>التاريخ</label>
                          <input type="date" style={inputStyle} value={ev.date} onChange={e => {
                            const events = [...siteForm.events]; events[idx] = { ...ev, date: e.target.value }; updateSiteForm('events', events);
                          }} />
                        </div>
                        <div>
                          <label style={labelStyle}>المكان</label>
                          <input style={inputStyle} value={ev.location} onChange={e => {
                            const events = [...siteForm.events]; events[idx] = { ...ev, location: e.target.value }; updateSiteForm('events', events);
                          }} />
                        </div>
                        <div>
                          <label style={labelStyle}>الرياضة</label>
                          <select style={inputStyle} value={ev.sport} onChange={e => {
                            const events = [...siteForm.events]; events[idx] = { ...ev, sport: e.target.value }; updateSiteForm('events', events);
                          }}>
                            {['⚽', '🏀', '🤾', '🎉', '🏆'].map(s => <option key={s} value={s} style={{ color: '#000' }}>{s}</option>)}
                          </select>
                        </div>
                        <div style={{ gridColumn: '1 / -1' }}>
                          <label style={labelStyle}>الوصف</label>
                          <input style={inputStyle} value={ev.description} onChange={e => {
                            const events = [...siteForm.events]; events[idx] = { ...ev, description: e.target.value }; updateSiteForm('events', events);
                          }} />
                        </div>
                      </div>
                      <button onClick={() => {
                        const events = siteForm.events.filter((_, i) => i !== idx); updateSiteForm('events', events);
                      }} style={{
                        marginTop: '10px', background: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.3)',
                        color: '#FF3D00', padding: '5px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem',
                        fontFamily: '"Cairo", "Tajawal", sans-serif'
                      }}>🗑 حذف هذا الحدث</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* PRICING */}
              <div style={{ ...cardStyle, border: '1px solid rgba(255,193,7,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#FFC107', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>💰 الأسعار والباقات (Pricing)</h3>
                  <button onClick={() => {
                    const plans = [...(siteForm.pricing_plans || [])];
                    plans.push({ id: 'PLAN-' + Date.now(), name: 'باقة جديدة', price: '0 DT', period: 'شهرياً', features: [], sport: '⚽' });
                    updateSiteForm('pricing_plans', plans);
                  }} style={{
                    background: 'rgba(255,193,7,0.15)', border: '1px solid #FFC107', color: '#FFC107',
                    padding: '7px 14px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem',
                    fontFamily: '"Cairo", "Tajawal", sans-serif'
                  }}>➕ إضافة باقة</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  {(siteForm.pricing_plans || []).map((plan, idx) => (
                    <div key={plan.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '14px', border: '1px solid rgba(255,193,7,0.1)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div><label style={labelStyle}>اسم الباقة</label><input style={inputStyle} value={plan.name} onChange={e => { const p = [...siteForm.pricing_plans]; p[idx] = { ...plan, name: e.target.value }; updateSiteForm('pricing_plans', p); }} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div><label style={labelStyle}>السعر</label><input style={inputStyle} value={plan.price} onChange={e => { const p = [...siteForm.pricing_plans]; p[idx] = { ...plan, price: e.target.value }; updateSiteForm('pricing_plans', p); }} /></div>
                          <div><label style={labelStyle}>الفترة</label><input style={inputStyle} value={plan.period} onChange={e => { const p = [...siteForm.pricing_plans]; p[idx] = { ...plan, period: e.target.value }; updateSiteForm('pricing_plans', p); }} /></div>
                        </div>
                        <div><label style={labelStyle}>المميزات (مفصولة بـ ,)</label><input style={inputStyle} value={(plan.features || []).join(', ')} onChange={e => { const p = [...siteForm.pricing_plans]; p[idx] = { ...plan, features: e.target.value.split(',').map(f => f.trim()) }; updateSiteForm('pricing_plans', p); }} /></div>
                        <button onClick={() => { const p = siteForm.pricing_plans.filter((_, i) => i !== idx); updateSiteForm('pricing_plans', p); }} style={{
                          background: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.3)',
                          color: '#FF3D00', padding: '5px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', fontSize: '0.75rem',
                          fontFamily: '"Cairo", "Tajawal", sans-serif'
                        }}>🗑 حذف</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SCHEDULE */}
              <div style={{ ...cardStyle, border: '1px solid rgba(0,229,255,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#00E5FF', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>📅 جدول التدريبات (Schedule)</h3>
                  <button onClick={() => {
                    const ss = [...(siteForm.schedule_sessions || [])];
                    ss.push({ day: 'الاثنين', time: '16:00 - 18:00', group: 'U12', sport: 'Football', coach: '' });
                    updateSiteForm('schedule_sessions', ss);
                  }} style={{
                    background: 'rgba(0,229,255,0.12)', border: '1px solid #00E5FF', color: '#00E5FF',
                    padding: '7px 14px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem',
                    fontFamily: '"Cairo", "Tajawal", sans-serif'
                  }}>➕ إضافة حصة</button>
                </div>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'right', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid rgba(0,229,255,0.2)', color: '#00E5FF' }}>
                        {['اليوم', 'الوقت', 'الفئة', 'الرياضة', 'المدرب', ''].map(h => (
                          <th key={h} style={{ padding: '10px', whiteSpace: 'nowrap' }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(siteForm.schedule_sessions || []).map((ss, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '8px' }}>
                            <select style={{ ...inputStyle, padding: '8px', fontSize: '0.82rem' }} value={ss.day} onChange={e => { const s = [...siteForm.schedule_sessions]; s[idx] = { ...ss, day: e.target.value }; updateSiteForm('schedule_sessions', s); }}>
                              {['الاثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت','الأحد'].map(d => <option key={d} value={d} style={{color:'#000'}}>{d}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '8px' }}><input style={{ ...inputStyle, padding: '8px', fontSize: '0.82rem' }} value={ss.time} onChange={e => { const s = [...siteForm.schedule_sessions]; s[idx] = { ...ss, time: e.target.value }; updateSiteForm('schedule_sessions', s); }} /></td>
                          <td style={{ padding: '8px' }}>
                            <select style={{ ...inputStyle, padding: '8px', fontSize: '0.82rem' }} value={ss.group} onChange={e => { const s = [...siteForm.schedule_sessions]; s[idx] = { ...ss, group: e.target.value }; updateSiteForm('schedule_sessions', s); }}>
                              {['U8','U10','U12','U14','U16','All'].map(g => <option key={g} value={g} style={{color:'#000'}}>{g}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '8px' }}>
                            <select style={{ ...inputStyle, padding: '8px', fontSize: '0.82rem' }} value={ss.sport} onChange={e => { const s = [...siteForm.schedule_sessions]; s[idx] = { ...ss, sport: e.target.value }; updateSiteForm('schedule_sessions', s); }}>
                              {['Football','Basketball','Handball','Multi-Sport'].map(sp => <option key={sp} value={sp} style={{color:'#000'}}>{SPORT_ICONS[sp]} {sp}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '8px' }}><input style={{ ...inputStyle, padding: '8px', fontSize: '0.82rem' }} value={ss.coach} onChange={e => { const s = [...siteForm.schedule_sessions]; s[idx] = { ...ss, coach: e.target.value }; updateSiteForm('schedule_sessions', s); }} /></td>
                          <td style={{ padding: '8px' }}>
                            <button onClick={() => { const s = siteForm.schedule_sessions.filter((_, i) => i !== idx); updateSiteForm('schedule_sessions', s); }} style={{
                              background: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.3)',
                              color: '#FF3D00', padding: '4px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem',
                              fontFamily: '"Cairo", "Tajawal", sans-serif'
                            }}>🗑</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* GALLERY */}
              <div style={{ ...cardStyle, border: '1px solid rgba(224,64,251,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#E040FB', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>🖼️ المعرض (Gallery)</h3>
                  <button onClick={() => {
                    const gi = [...(siteForm.gallery_images || [])];
                    gi.push({ id: 'GAL-' + Date.now(), url: '', caption: '' });
                    updateSiteForm('gallery_images', gi);
                  }} style={{
                    background: 'rgba(224,64,251,0.12)', border: '1px solid #E040FB', color: '#E040FB',
                    padding: '7px 14px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem',
                    fontFamily: '"Cairo", "Tajawal", sans-serif'
                  }}>➕ إضافة صورة</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
                  {(siteForm.gallery_images || []).map((img, idx) => (
                    <div key={img.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <ImageUploader
                          label="صورة المعرض (رفع ملف)"
                          value={img.url}
                          onChange={val => { const g = [...siteForm.gallery_images]; g[idx] = { ...img, url: val }; updateSiteForm('gallery_images', g); }}
                          size={50}
                        />
                        <input style={{ ...inputStyle, padding: '7px', fontSize: '0.78rem' }} value={img.caption} placeholder="وصف الصورة" onChange={e => { const g = [...siteForm.gallery_images]; g[idx] = { ...img, caption: e.target.value }; updateSiteForm('gallery_images', g); }} />
                        <button onClick={() => { const g = siteForm.gallery_images.filter((_, i) => i !== idx); updateSiteForm('gallery_images', g); }} style={{
                          background: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.3)',
                          color: '#FF3D00', padding: '4px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem',
                          fontFamily: '"Cairo", "Tajawal", sans-serif'
                        }}>🗑 حذف الصورة</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SHOP */}
              <div style={{ ...cardStyle, border: '1px solid rgba(0,230,118,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#00E676', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>🛒 المتجر (Shop)</h3>
                  <button onClick={() => {
                    const sp = [...(siteForm.shop_products || [])];
                    sp.push({ id: 'SHOP-' + Date.now(), name: 'منتج جديد', price: '0 DT', description: '', inStock: true });
                    updateSiteForm('shop_products', sp);
                  }} style={{
                    background: 'rgba(0,230,118,0.12)', border: '1px solid #00E676', color: '#00E676',
                    padding: '7px 14px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem',
                    fontFamily: '"Cairo", "Tajawal", sans-serif'
                  }}>➕ إضافة منتج</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                  {(siteForm.shop_products || []).map((prod, idx) => (
                    <div key={prod.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <div><label style={labelStyle}>اسم المنتج</label><input style={inputStyle} value={prod.name} onChange={e => { const p = [...siteForm.shop_products]; p[idx] = { ...prod, name: e.target.value }; updateSiteForm('shop_products', p); }} /></div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                          <div><label style={labelStyle}>السعر</label><input style={inputStyle} value={prod.price} onChange={e => { const p = [...siteForm.shop_products]; p[idx] = { ...prod, price: e.target.value }; updateSiteForm('shop_products', p); }} /></div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingTop: '20px' }}>
                            <input type="checkbox" checked={prod.inStock} onChange={e => { const p = [...siteForm.shop_products]; p[idx] = { ...prod, inStock: e.target.checked }; updateSiteForm('shop_products', p); }} />
                            <label style={{ color: '#B0BEC5', fontSize: '0.78rem' }}>متوفر</label>
                          </div>
                        </div>
                        <div><label style={labelStyle}>الوصف</label><input style={inputStyle} value={prod.description} onChange={e => { const p = [...siteForm.shop_products]; p[idx] = { ...prod, description: e.target.value }; updateSiteForm('shop_products', p); }} /></div>
                        <button onClick={() => { const p = siteForm.shop_products.filter((_, i) => i !== idx); updateSiteForm('shop_products', p); }} style={{
                          background: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.3)',
                          color: '#FF3D00', padding: '5px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem',
                          fontFamily: '"Cairo", "Tajawal", sans-serif'
                        }}>🗑 حذف المنتج</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* PROGRAMS */}
              <div style={{ ...cardStyle, border: '1px solid rgba(255,149,0,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ color: '#FF9500', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>🏋️ البرامج التدريبية (Programs)</h3>
                  <button onClick={() => {
                    const pr = [...(siteForm.programs || [])];
                    pr.push({ id: 'PRG-' + Date.now(), name: 'برنامج جديد', age: '6-16 سنة', desc: '', sport: '⚽' });
                    updateSiteForm('programs', pr);
                  }} style={{
                    background: 'rgba(255,149,0,0.12)', border: '1px solid #FF9500', color: '#FF9500',
                    padding: '7px 14px', borderRadius: '10px', fontWeight: 800, cursor: 'pointer', fontSize: '0.8rem',
                    fontFamily: '"Cairo", "Tajawal", sans-serif'
                  }}>➕ إضافة برنامج</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(siteForm.programs || []).map((prg, idx) => (
                    <div key={prg.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', padding: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
                        <div><label style={labelStyle}>اسم البرنامج</label><input style={inputStyle} value={prg.name} onChange={e => { const p = [...siteForm.programs]; p[idx] = { ...prg, name: e.target.value }; updateSiteForm('programs', p); }} /></div>
                        <div><label style={labelStyle}>الفئة العمرية</label><input style={inputStyle} value={prg.age} onChange={e => { const p = [...siteForm.programs]; p[idx] = { ...prg, age: e.target.value }; updateSiteForm('programs', p); }} /></div>
                        <div style={{ gridColumn: '1 / -1' }}><label style={labelStyle}>الوصف</label><textarea style={{ ...inputStyle, resize: 'none' }} rows={2} value={prg.desc} onChange={e => { const p = [...siteForm.programs]; p[idx] = { ...prg, desc: e.target.value }; updateSiteForm('programs', p); }} /></div>
                      </div>
                      <button onClick={() => { const p = siteForm.programs.filter((_, i) => i !== idx); updateSiteForm('programs', p); }} style={{
                        marginTop: '8px', background: 'rgba(255,61,0,0.1)', border: '1px solid rgba(255,61,0,0.3)',
                        color: '#FF3D00', padding: '5px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.75rem',
                        fontFamily: '"Cairo", "Tajawal", sans-serif'
                      }}>🗑 حذف</button>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACADEMY INFO */}
              <div style={{ ...cardStyle, border: '1px solid rgba(255,193,7,0.2)' }}>
                <h3 style={{ color: '#FFC107', fontSize: '1.05rem', fontWeight: 900, marginBottom: '16px' }}>🏫 معلومات الأكاديمية (Academy)</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div><label style={labelStyle}>اسم الأكاديمية</label><input style={inputStyle} value={siteForm.academy_title || ''} onChange={e => updateSiteForm('academy_title', e.target.value)} /></div>
                  <div><label style={labelStyle}>وصف الأكاديمية</label><textarea style={{ ...inputStyle, resize: 'none' }} rows={3} value={siteForm.academy_desc || ''} onChange={e => updateSiteForm('academy_desc', e.target.value)} /></div>
                </div>
              </div>

              {/* Save Button (bottom) */}
              <button onClick={handleSaveSiteContent} style={{
                width: '100%', padding: '18px',
                background: 'linear-gradient(135deg, #00E5FF, #00B0FF)',
                border: 'none', borderRadius: '18px', color: '#000',
                fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer',
                fontFamily: '"Cairo", "Tajawal", sans-serif',
                boxShadow: '0 8px 32px rgba(0,229,255,0.2)'
              }}>
                💾 حفظ جميع تعديلات الموقع وتحديثها فوراً
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: ANNOUNCEMENTS                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'announcements' && (
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <div style={cardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h2 style={{ color: '#FF3D00', fontSize: '1.4rem', fontWeight: 900, margin: 0 }}>📢 إرسال الإعلانات والتنبيهات المباشرة</h2>
                <span style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid #00E676', color: '#00E676', padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                  ● PWA Web Push Active
                </span>
              </div>
              <p style={{ color: '#8E9BAE', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
                إرسال إشعار فوري يصل مباشرة إلى هواتف الأولياء واللاعبين الذين قاموا بتنزيل وتثبيت تطبيق الأكاديمية (PWA) أو زيارة الموقع
              </p>

              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>عنوان الإشعار *</label>
                  <input type="text" required value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)}
                    placeholder="مثال: تذكير بموعد المباراة الودية يوم السبت"
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>نص الإشعار والتفاصيل</label>
                  <textarea rows={4} value={announcementText} onChange={e => setAnnouncementText(e.target.value)}
                    placeholder="اكتب تفاصيل التنبيه هنا..."
                    style={{ ...inputStyle, resize: 'none' }} />
                </div>

                <button type="submit" style={{
                  padding: '16px', background: 'linear-gradient(135deg, #FF3D00, #FF9500)',
                  border: 'none', borderRadius: '16px', color: '#FFF', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
                  fontFamily: '"Cairo", "Tajawal", sans-serif', boxShadow: '0 8px 25px rgba(255,61,0,0.3)'
                }}>
                  🚀 إرسال التنبيه الفوري لجميع الهواتف (PWA Web Push)
                </button>
              </form>

              {/* Multi-channel Broadcast options */}
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: '#FFC107', fontWeight: 800, marginBottom: '12px' }}>
                  💬 أو البث عبر قنوات التواصل المباشرة (WhatsApp & SMS):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => {
                      if (!announcementTitle.trim()) { alert('يرجى إدخال عنوان الإشعار أولاً'); return; }
                      notificationService.sendWhatsAppNotification('+21658263467', `📢 *${announcementTitle}*\n\n${announcementText}`);
                    }}
                    style={{
                      background: 'rgba(37,211,102,0.15)', border: '1px solid #25D366', color: '#25D366',
                      padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem',
                      fontFamily: '"Cairo", "Tajawal", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    💬 بث عبر مجموعة WhatsApp
                  </button>

                  <button
                    onClick={() => {
                      if (!announcementTitle.trim()) { alert('يرجى إدخال عنوان الإشعار أولاً'); return; }
                      notificationService.sendSMSAlert('', `${announcementTitle}: ${announcementText}`);
                    }}
                    style={{
                      background: 'rgba(0,229,255,0.12)', border: '1px solid #00E5FF', color: '#00E5FF',
                      padding: '12px', borderRadius: '12px', fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem',
                      fontFamily: '"Cairo", "Tajawal", sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                    }}
                  >
                    📱 إرسال رسالة نصية SMS
                  </button>
                </div>
              </div>

              {/* Broadcast Log History */}
              <div style={{ marginTop: '24px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.85rem', color: '#8E9BAE', fontWeight: 800, marginBottom: '12px' }}>
                  📜 سجل التنبيهات الصادرة مؤخراً:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                  {notificationService.getNotifications().slice(0, 5).map((n) => (
                    <div key={n.id} style={{ background: 'rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '10px', borderRight: '3px solid #FF3D00' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#FFF' }}>{n.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#B0BEC5', marginTop: '2px' }}>{n.body}</div>
                      <div style={{ fontSize: '0.68rem', color: '#78909C', marginTop: '4px' }}>{n.date}</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: QR SCANNER                                                     */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'qrscanner' && (
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: '3.5rem', marginBottom: '10px' }}>📱</div>
              <h2 style={{ color: '#E040FB', fontSize: '1.4rem', fontWeight: 900, margin: '0 0 8px 0' }}>ماسح الحضور السريع</h2>
              <p style={{ color: '#8E9BAE', fontSize: '0.88rem', marginBottom: '24px' }}>مسح بطاقات FUT للاعبين أو إدخال المعرف (مثال: ALLSTAR-101)</p>

              {scanResultMsg && (
                <div style={{
                  background: scanResultMsg.type === 'success' ? 'rgba(0,230,118,0.15)' : 'rgba(255,61,0,0.15)',
                  border: `1.5px solid ${scanResultMsg.type === 'success' ? '#00E676' : '#FF3D00'}`,
                  color: scanResultMsg.type === 'success' ? '#00E676' : '#FF3D00',
                  padding: '14px', borderRadius: '16px', fontWeight: 800, marginBottom: '20px'
                }}>{scanResultMsg.text}</div>
              )}

              <form onSubmit={handleAdminQRCheckin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <input type="text" value={qrCodeInput} onChange={e => setQrCodeInput(e.target.value)}
                  placeholder="ادخل الكود (مثل: ALLSTAR-101)" autoFocus
                  style={{ ...inputStyle, fontSize: '1.1rem', textAlign: 'center', border: '1.5px solid #E040FB', padding: '16px' }} />
                <button type="submit" style={{
                  padding: '16px', background: 'linear-gradient(135deg, #E040FB, #7B1FA2)',
                  border: 'none', borderRadius: '16px', color: '#FFF', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
                  fontFamily: '"Cairo", "Tajawal", sans-serif'
                }}>✅ تسجيل الحضور فوراً</button>
              </form>

              <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: '#8E9BAE', marginBottom: '12px', fontWeight: 700 }}>اختبار سريع للاعبين:</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                  {players.slice(0, 6).map(p => (
                    <button key={p.id} onClick={() => setQrCodeInput(p.id)} style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                      color: '#FFC107', padding: '6px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer',
                      fontFamily: '"Cairo", "Tajawal", sans-serif'
                    }}>+ {p.name.split(' ')[0]} ({p.id})</button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* TAB: ANNOUNCEMENTS                                                  */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'announcements' && (
          <div style={{ maxWidth: '700px', margin: '0 auto' }}>
            <div style={cardStyle}>
              <h2 style={{ color: '#FF3D00', fontSize: '1.4rem', fontWeight: 900, marginBottom: '8px' }}>📢 إرسال إعلانات مباشرة</h2>
              <p style={{ color: '#8E9BAE', fontSize: '0.88rem', marginBottom: '24px' }}>إرسال إشعار فوري لجميع الأولياء واللاعبين</p>
              <form onSubmit={handleSendBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={labelStyle}>عنوان الإشعار *</label>
                  <input type="text" required value={announcementTitle} onChange={e => setAnnouncementTitle(e.target.value)}
                    placeholder="مثال: تذكير بموعد المباراة الودية يوم السبت"
                    style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>نص الإشعار والتفاصيل</label>
                  <textarea rows={4} value={announcementText} onChange={e => setAnnouncementText(e.target.value)}
                    placeholder="اكتب تفاصيل التنبيه هنا..."
                    style={{ ...inputStyle, resize: 'none' }} />
                </div>
                <button type="submit" style={{
                  padding: '16px', background: 'linear-gradient(135deg, #FF3D00, #FF9500)',
                  border: 'none', borderRadius: '16px', color: '#FFF', fontWeight: 900, fontSize: '1rem', cursor: 'pointer',
                  fontFamily: '"Cairo", "Tajawal", sans-serif'
                }}>🚀 إرسال التنبيه لجميع الهواتف</button>
              </form>
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
}
