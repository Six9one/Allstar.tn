import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { notificationService } from '../services/notifications';
import { PhotoStudioEngine, ALLSTAR_BACKDROPS } from '../services/photoStudio';
import ReelPlayer, { parseVideoUrl } from '../components/ReelPlayer';

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

  // Notification Center
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [notifTargetUrl, setNotifTargetUrl] = useState('/');
  const [notifImageUrl, setNotifImageUrl] = useState('');
  const [notifAudience, setNotifAudience] = useState('الجميع');
  const [isSendingPush, setIsSendingPush] = useState(false);
  const [notifLogs, setNotifLogs] = useState([]);
  const [registrations, setRegistrations] = useState(() => db.getRegistrations());

  // Reels
  const [reels, setReels] = useState(() => db.getReels());
  const [newReelUrl,   setNewReelUrl]   = useState('');
  const [newReelType,  setNewReelType]  = useState('');
  const [newReelThumb, setNewReelThumb] = useState('');
  const [newReelTitle, setNewReelTitle] = useState('');
  const [newReelSport, setNewReelSport] = useState('General');

  // TikTok sync state
  const [tikTokSyncState, setTikTokSyncState] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState(null);
  const [manualTikTokId, setManualTikTokId] = useState('');
  const [bulkTikTokText, setBulkTikTokText] = useState('');
  const [tikTokInputMode, setTikTokInputMode] = useState('bulk');
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [academyReels, setAcademyReels] = useState([]);
  const [reelsFilterSport, setReelsFilterSport] = useState('all');
  const [reelsSearchQuery, setReelsSearchQuery] = useState('');
  const [previewModalReel, setPreviewModalReel] = useState(null);
  const [editingReelId, setEditingReelId] = useState(null);
  const [editingReelTitle, setEditingReelTitle] = useState('');
  const [editingReelSport, setEditingReelSport] = useState('General');

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

  // Load academy reels + TikTok sync state
  useEffect(() => {
    const loadAcademyData = async () => {
      try {
        const reelsData = await db.getAcademyReels();
        if (Array.isArray(reelsData)) setAcademyReels(reelsData);
      } catch (e) {
        console.warn('academy_reels table not ready:', e);
      }
      try {
        const syncState = await db.getTikTokSyncState();
        if (syncState) setTikTokSyncState(syncState);
      } catch (e) {
        console.warn('TikTok sync state not ready:', e);
      }
      try {
        const logs = await notificationService.getNotificationsLog();
        if (Array.isArray(logs)) setNotifLogs(logs);
      } catch (e) {
        console.warn('Notifications log load notice:', e);
      }
    };
    loadAcademyData();
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

  // ── Reels handlers ─────────────────────────────────────────────────────────
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const videoFileInputRef = useRef(null);

  const handleVideoFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (e.g. 50MB)
    if (file.size > 60 * 1024 * 1024) {
      alert('حجم ملف الفيديو كبير جداً. يُفضل ألا يتجاوز 60 ميغابايت لتشغيل سلس وسريع.');
      return;
    }

    setIsUploadingVideo(true);
    try {
      const publicUrl = await db.uploadVideoFile(file);
      if (publicUrl) {
        setNewReelUrl(publicUrl);
        setNewReelType('direct');
        showSuccess('✅ تم رفع ملف الفيديو بنجاح!');
      }
    } catch (err) {
      console.error('Video upload error:', err);
      alert('تعذر رفع الفيديو: ' + (err.message || 'يرجى التحقق من اتصال الإنترنت'));
    } finally {
      setIsUploadingVideo(false);
      if (videoFileInputRef.current) videoFileInputRef.current.value = '';
    }
  };

  const [newReelDesc,  setNewReelDesc]  = useState('');

  const handleAddReel = async () => {
    const directUrl = newReelUrl.trim();
    if (!directUrl) return;

    const newReel = {
      id: 'REEL-' + Date.now(),
      video_url: directUrl,
      url: directUrl, // backwards compatibility
      thumbnail_url: newReelThumb.trim(),
      thumbnailUrl: newReelThumb.trim(), // backwards compatibility
      title: newReelTitle.trim(),
      description: newReelDesc.trim(),
      sport: newReelSport,
      active: true,
      createdAt: new Date().toISOString(),
    };
    const updated = [newReel, ...reels];
    setReels(updated);
    try {
      await db.saveReels(updated);
      showSuccess('🎬 تم إضافة الريل ونشره بنجاح!');
    } catch (e) {
      showSuccess('🎬 تم حفظ الريل محلياً');
    }
    setNewReelUrl(''); setNewReelThumb('');
    setNewReelTitle(''); setNewReelDesc(''); setNewReelSport('General');
  };

  const handleDeleteReel = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الريل؟')) return;
    const updated = reels.filter(r => r.id !== id);
    setReels(updated);
    try {
      await db.saveReels(updated);
      showSuccess('🗑️ تم حذف الريل');
    } catch (e) {
      showSuccess('🗑️ تم حذف الريل محلياً');
    }
  };

  // ── TikTok Sync Handlers ─────────────────────────────────────────────────
  const handleTikTokSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const result = await db.triggerTikTokSync();
      setSyncResult(result);
      // Refresh reels list
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
      // Refresh sync state
      const syncState = await db.getTikTokSyncState();
      if (syncState) setTikTokSyncState(syncState);
      showSuccess(`✅ مزامنة TikTok: ${result?.videos_inserted || 0} جديد، ${result?.videos_updated || 0} محدّث`);
    } catch (e) {
      setSyncResult({ success: false, error: e.message });
      showSuccess('❌ فشلت مزامنة TikTok: ' + e.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleConnectTikTok = async () => {
    try {
      const result = await db.getTikTokAuthUrl();
      if (result?.auth_url) {
        window.location.href = result.auth_url;
      } else {
        showSuccess('❌ تعذر إنشاء رابط ربط TikTok');
      }
    } catch (e) {
      showSuccess('❌ خطأ في ربط TikTok: ' + e.message);
    }
  };

  const handleAddManualTikTokReel = async () => {
    const videoId = manualTikTokId.trim();
    if (!videoId) return;
    try {
      await db.addManualReel({
        playback_type: 'tiktok',
        tiktok_video_id: videoId,
        source: 'manual',
        sport: newReelSport,
        title: newReelTitle.trim() || null,
        description: newReelDesc.trim() || null,
      });
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
      showSuccess('🎬 تم إضافة ريل TikTok يدوياً!');
      setManualTikTokId('');
    } catch (e) {
      showSuccess('❌ خطأ: ' + e.message);
    }
  };

  const extractAllTikTokIds = (text) => {
    if (!text) return [];
    const matches = text.match(/\d{15,25}/g) || [];
    return Array.from(new Set(matches));
  };

  const handleBulkAddTikTokReels = async () => {
    const ids = extractAllTikTokIds(bulkTikTokText);
    if (ids.length === 0) {
      showSuccess('❌ لم يتم العثور على أي معرّفات TikTok في النص المدخل');
      return;
    }
    setIsBulkImporting(true);
    try {
      await db.addBulkTikTokReels(ids, newReelSport);
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
      showSuccess(`🚀 تم استيراد وحفظ ${ids.length} فيديو TikTok بنجاح!`);
      setBulkTikTokText('');
    } catch (e) {
      showSuccess('❌ فشل الاستيراد المجمّع: ' + e.message);
    } finally {
      setIsBulkImporting(false);
    }
  };

  const handleAddNativeReel = async () => {
    const directUrl = newReelUrl.trim();
    if (!directUrl) return;
    try {
      await db.addManualReel({
        playback_type: 'native',
        video_url: directUrl,
        cover_image_url: newReelThumb.trim() || null,
        source: 'upload',
        sport: newReelSport,
        title: newReelTitle.trim() || null,
        description: newReelDesc.trim() || null,
      });
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
      showSuccess('🎬 تم نشر الريل بنجاح!');
    } catch (e) {
      // Fallback to legacy
      handleAddReel();
      return;
    }
    setNewReelUrl(''); setNewReelThumb('');
    setNewReelTitle(''); setNewReelDesc(''); setNewReelSport('General');
  };

  const handleDeleteAcademyReel = async (id) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا الريل؟')) return;
    try {
      await db.hardDeleteAcademyReel(id);
      setAcademyReels(prev => prev.filter(r => r.id !== id));
      showSuccess('🗑️ تم حذف الريل');
    } catch (e) {
      showSuccess('❌ خطأ في الحذف: ' + e.message);
    }
  };

  const handlePinReelToTop = async (id) => {
    try {
      await db.pinAcademyReelToTop(id);
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
      showSuccess('🔝 تم تثبيت هذا الفيديو في المرتبة الأولى (القمة)!');
    } catch (e) {
      showSuccess('❌ خطأ: ' + e.message);
    }
  };

  const handleMoveReelUp = async (index, currentList) => {
    if (index <= 0) return;
    const current = currentList[index];
    const prev = currentList[index - 1];
    if (!current || !prev) return;

    // Optimistic UI update
    setAcademyReels(prevList => {
      const idxA = prevList.findIndex(r => r.id === current.id);
      const idxB = prevList.findIndex(r => r.id === prev.id);
      if (idxA === -1 || idxB === -1) return prevList;
      const copy = [...prevList];
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      return copy;
    });

    try {
      await db.swapAcademyReelOrder(current, prev);
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
    } catch (e) {
      showSuccess('❌ خطأ في تغيير الترتيب: ' + e.message);
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
    }
  };

  const handleMoveReelDown = async (index, currentList) => {
    if (index >= currentList.length - 1) return;
    const current = currentList[index];
    const next = currentList[index + 1];
    if (!current || !next) return;

    // Optimistic UI update
    setAcademyReels(prevList => {
      const idxA = prevList.findIndex(r => r.id === current.id);
      const idxB = prevList.findIndex(r => r.id === next.id);
      if (idxA === -1 || idxB === -1) return prevList;
      const copy = [...prevList];
      const temp = copy[idxA];
      copy[idxA] = copy[idxB];
      copy[idxB] = temp;
      return copy;
    });

    try {
      await db.swapAcademyReelOrder(current, next);
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
    } catch (e) {
      showSuccess('❌ خطأ في تغيير الترتيب: ' + e.message);
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
    }
  };

  const handleSaveReelEdit = async (id) => {
    try {
      await db.updateAcademyReelDetails(id, {
        title: editingReelTitle.trim() || null,
        sport: editingReelSport,
      });
      const reelsData = await db.getAcademyReels();
      if (Array.isArray(reelsData)) setAcademyReels(reelsData);
      showSuccess('✅ تم حفظ بيانات الفيديو');
      setEditingReelId(null);
    } catch (e) {
      showSuccess('❌ خطأ: ' + e.message);
    }
  };

  // ── Notification Center Web Push Handler ──────────────────────────────────
  const handleSendNotification = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifBody.trim()) {
      showSuccess('❌ يرجى إدخال عنوان ونص الإشعار');
      return;
    }

    setIsSendingPush(true);
    try {
      const result = await notificationService.sendPushNotification({
        title: notifTitle.trim(),
        body: notifBody.trim(),
        targetUrl: notifTargetUrl.trim() || '/',
        imageUrl: notifImageUrl.trim() || null,
        targetAudience: notifAudience || 'الجميع',
      });

      const updatedLogs = await notificationService.getNotificationsLog();
      setNotifLogs(updatedLogs);

      showSuccess(`🚀 ${result.message || `تم إرسال الإشعار بنجاح إلى ${result.sentCount} جهاز`}`);
      setNotifTitle('');
      setNotifBody('');
      setNotifImageUrl('');
      setNotifTargetUrl('/');
    } catch (err) {
      showSuccess('❌ فشل إرسال الإشعار: ' + (err.message || err));
    } finally {
      setIsSendingPush(false);
    }
  };

  // ── Notification Appearance & Sound Config ───────────────────────────────
  const [notifConfig, setNotifConfig] = useState(() => notificationService.getNotificationConfig());
  const [subscriberStats, setSubscriberStats] = useState({ total: 0, ios: 0, android: 0, loading: false });
  const notifLogoFileInputRef = useRef(null);
  const notifAudioFileInputRef = useRef(null);
  const notifPostImageInputRef = useRef(null);

  const fetchSubscriberStats = async () => {
    setSubscriberStats(prev => ({ ...prev, loading: true }));
    try {
      const config = notificationService.getNotificationConfig();
      const appId = config.oneSignalAppId || 'dedea313-29ed-453f-810f-f7a2a164ad8e';
      const apiKey = config.oneSignalApiKey;
      let total = 0;
      let iosCount = 0;
      let androidCount = 0;

      if (appId && apiKey) {
        const authHeader = apiKey.startsWith('os_v2_') ? `Key ${apiKey}` : `Basic ${apiKey}`;
        const res = await fetch(`https://onesignal.com/api/v1/players?app_id=${appId}`, {
          headers: { 'Authorization': authHeader }
        });
        const data = await res.json();
        if (data && typeof data.total_count === 'number') {
          total = data.total_count;
          if (Array.isArray(data.players)) {
            data.players.forEach(p => {
              if (p.device_type === 0 || p.device_type === 14) iosCount++;
              else if (p.device_type === 1) androidCount++;
            });
          }
        }
      }

      if (supabase) {
        const { count } = await supabase.from('push_subscriptions').select('*', { count: 'exact', head: true });
        if (count && count > total) total = count;
      }

      setSubscriberStats({ total, ios: iosCount, android: androidCount, loading: false });
    } catch (e) {
      console.warn('Error fetching subscriber stats:', e);
      setSubscriberStats(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchSubscriberStats();
  }, []);
  const compressImageFile = (file, maxWidth = 800, quality = 0.75) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => resolve(e.target.result);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handleNotifPostImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedDataUrl = await compressImageFile(file, 800, 0.75);
      setNotifImageUrl(compressedDataUrl);
      showSuccess('🖼️ تم ضغط ورفع صورة الإشعار بنجاح (معاينة فورية)!');
    } catch {
      showSuccess('❌ فشل تحميل الصورة، يرجى تجربة صورة أخرى');
    }
  };

  const handleSaveNotifConfig = (e) => {
    e?.preventDefault();
    notificationService.saveNotificationConfig(notifConfig);
    showSuccess('💾 تم حفظ وتطبيق إعدادات الشعار والصوت لجميع الإشعارات بنجاح!');
  };

  const handleTestNotifSound = () => {
    notificationService.playConfiguredSound(notifConfig);
    showSuccess(`🔊 تم تشغيل الصوت التجريبي: ${notifConfig.soundType === 'whistle' ? 'صفارة الملاعب' : notifConfig.soundType === 'crystal' ? 'كريستال ناعم' : notifConfig.soundType === 'custom' ? 'رنة مخصصة' : 'Apple Tri-Tone'}`);
  };

  const handleNotifLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const compressedLogo = await compressImageFile(file, 256, 0.85);
      setNotifConfig(prev => ({ ...prev, logoUrl: compressedLogo }));
      showSuccess('🖼️ تم اختيار وضغط الشعار الجديد بنجاح!');
    } catch {
      showSuccess('❌ فشل تحميل الشعار');
    }
  };

  const handleNotifAudioUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showSuccess('⚠️ حجم الملف الصوتي كبير جداً (يجب أن يكون أقل من 2 ميغابايت)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      setNotifConfig(prev => ({ ...prev, soundType: 'custom', customSoundUrl: ev.target.result }));
      showSuccess('🎵 تم تحميل الملف الصوتي المخصص بنجاح!');
    };
    reader.readAsDataURL(file);
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
    { id: 'reels',          icon: '🎬', label: 'Reels & TikTok',   color: '#FF3D00', badge: academyReels.length || reels.length },
    { id: 'siteeditor',     icon: '🌐', label: 'Website Content',  color: '#00E5FF', badge: 0 },
    { id: 'qrscanner',      icon: '📱', label: 'QR Scanner',       color: '#E040FB', badge: 0 },
    { id: 'notifications',  icon: '🔔', label: 'مركز الإشعارات',   color: '#FF3D00', badge: 0 },
  ];

  const tabMeta = {
    overview:       { title: 'لوحة التحكم',      subtitle: 'نظرة عامة على الأكاديمية' },
    registrations:  { title: 'ملفات الانتساب',    subtitle: 'طلبات التسجيل المعلقة' },
    carousel:       { title: 'الصور الرئيسية',    subtitle: 'إدارة معرض الصور' },
    accounts:       { title: 'الحسابات',           subtitle: 'بيانات دخول المدربين وأولياء الأمور' },
    coaches:        { title: 'المدربون',           subtitle: 'إدارة الطاقم التدريبي' },
    players:        { title: 'اللاعبون',           subtitle: 'قائمة اللاعبين المسجلين' },
    reels:          { title: '🎬 Reels',           subtitle: 'إدارة مقاطع الفيديو المعروضة للأهالي' },
    siteeditor:     { title: 'محتوى الموقع',       subtitle: 'تعديل محتوى الصفحة الرئيسية' },
    qrscanner:      { title: 'ماسح QR',            subtitle: 'تسجيل الحضور بالرمز المربع' },
    notifications:  { title: 'مركز الإشعارات',   subtitle: 'إرسال إشعار فوري يظهر في شريط إشعارات هواتف الأولياء واللاعبين (PWA Web Push)' },
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(160deg, #060912 0%, #0A1628 100%)',
      color: '#FFF', fontFamily: '"Cairo", "Tajawal", sans-serif', direction: 'ltr',
      display: 'flex',
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
          position: 'fixed', top: 0, left: 0, bottom: 0, width: '248px',
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
                    { tab: 'notifications', label: '🔔 مركز الإشعارات — إرسال إشعار فوري', bg: 'rgba(255,61,0,0.12)', border: '#FF3D00', color: '#FF3D00' },
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
        {/* TAB: NOTIFICATION CENTER (PWA WEB PUSH & REALTIME)                   */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'notifications' && (
          <div style={{ maxWidth: '850px', margin: '0 auto', direction: 'rtl', textAlign: 'right' }}>
            <div style={cardStyle}>
              {/* Header Badge & Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <h2 style={{ color: '#FF3D00', fontSize: '1.4rem', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span>🔔</span>
                  <span>مركز الإشعارات — إرسال إشعارات فورية للهواتف</span>
                </h2>
                <span style={{ background: 'rgba(0,230,118,0.15)', border: '1px solid #00E676', color: '#00E676', padding: '5px 12px', borderRadius: '10px', fontSize: '0.78rem', fontWeight: 800 }}>
                  ● Native PWA Web Push
                </span>
              </div>
              <p style={{ color: '#8E9BAE', fontSize: '0.88rem', marginBottom: '20px', lineHeight: 1.6 }}>
                إرسال إشعار فوري يظهر في شريط إشعارات هواتف الأولياء واللاعبين (PWA Web Push) وشاشة القفل بدون الحاجة لفتح التطبيق.
              </p>

              {/* LIVE SUBSCRIBER METRICS & STATUS */}
              <div style={{
                background: 'linear-gradient(135deg, rgba(14, 23, 42, 0.9), rgba(15, 23, 42, 0.7))',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                borderRadius: '18px',
                padding: '16px 20px',
                marginBottom: '22px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '12px',
                    background: 'rgba(0, 230, 118, 0.15)',
                    border: '1px solid rgba(0, 230, 118, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.4rem'
                  }}>
                    📲
                  </div>
                  <div>
                    <div style={{ fontSize: '0.78rem', color: '#8E9BAE', fontWeight: 600 }}>إجمالي الهواتف والأجهزة المشتركة الفعالة</div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00E676', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span>{subscriberStats.loading ? 'جاري الفحص...' : `${subscriberStats.total} جهاز`}</span>
                      <span style={{ fontSize: '0.72rem', color: '#FFD700', background: 'rgba(255,215,0,0.12)', padding: '2px 8px', borderRadius: '6px', fontWeight: 700 }}>
                        جاهز للاستقبال
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    type="button"
                    onClick={fetchSubscriberStats}
                    disabled={subscriberStats.loading}
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.15)',
                      color: '#FFF',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🔄</span>
                    <span>{subscriberStats.loading ? 'جاري التحديث...' : 'تحديث العداد'}</span>
                  </button>
                  <a
                    href="https://dashboard.onesignal.com"
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '8px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 152, 0, 0.15)',
                      border: '1px solid rgba(255, 152, 0, 0.4)',
                      color: '#FF9800',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>📊</span>
                    <span>لوحة OneSignal المباشرة</span>
                  </a>
                </div>
              </div>

              {/* Notification Creation Form */}
              <form onSubmit={handleSendNotification} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div>
                  <label style={labelStyle}>عنوان الإشعار (Title) *</label>
                  <input
                    type="text"
                    required
                    value={notifTitle}
                    onChange={e => setNotifTitle(e.target.value)}
                    placeholder="مثال: ⚽ تذكير بموعد تدريب كرة القدم غداً الساعة 16:00"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label style={labelStyle}>نص الإشعار (Message Body) *</label>
                  <textarea
                    rows={4}
                    required
                    value={notifBody}
                    onChange={e => setNotifBody(e.target.value)}
                    placeholder="اكتب تفاصيل التنبيه أو التوجيهات لأولياء الأمور واللاعبين..."
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={labelStyle}>الفئة المستهدفة (Target Audience)</label>
                    <select
                      value={notifAudience}
                      onChange={e => setNotifAudience(e.target.value)}
                      style={inputStyle}
                    >
                      <option value="الجميع">👥 الجميع (الأولياء والمدربون واللاعبون)</option>
                      <option value="الأولياء فقط">👨‍👩‍👧 الأولياء فقط</option>
                      <option value="المدربون فقط">🏅 المدربون فقط</option>
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>رابط التوجيه عند الضغط (Target Route / URL)</label>
                    <input
                      type="text"
                      value={notifTargetUrl}
                      onChange={e => setNotifTargetUrl(e.target.value)}
                      placeholder="مثال: / أو /schedule أو /reels أو /portal"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label style={labelStyle}>🖼️ صورة الإشعار (Notification Banner Image — اختياري)</label>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      type="text"
                      value={notifImageUrl}
                      onChange={e => setNotifImageUrl(e.target.value)}
                      placeholder="رابط صورة الإشعار (https://... أو رفع صورة)"
                      style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                    />
                    <input
                      type="file"
                      ref={notifPostImageInputRef}
                      accept="image/*"
                      onChange={handleNotifPostImageUpload}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => notifPostImageInputRef.current?.click()}
                      style={{
                        padding: '12px 18px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                        border: 'none', color: '#000', fontWeight: 900, fontSize: '0.84rem',
                        cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif',
                        display: 'flex', alignItems: 'center', gap: '6px'
                      }}
                    >
                      <span>📁</span>
                      <span>رفع صورة من هاتفك/جهازك</span>
                    </button>
                  </div>

                  {/* Image Presets */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setNotifImageUrl('/hero-banner.png')}
                      style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#FFC107', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer'
                      }}
                    >
                      ⚽ بانر التدريب الرسمي
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotifImageUrl('/hero-bg.jpg')}
                      style={{
                        background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                        color: '#00E676', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer'
                      }}
                    >
                      🏆 صورة البطولات
                    </button>
                    {notifImageUrl && (
                      <button
                        type="button"
                        onClick={() => setNotifImageUrl('')}
                        style={{
                          background: 'rgba(255,82,82,0.15)', border: '1px solid #FF5252',
                          color: '#FF5252', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer'
                        }}
                      >
                        ✕ إزالة الصورة
                      </button>
                    )}
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={isSendingPush}
                  style={{
                    padding: '16px 24px',
                    background: isSendingPush ? '#555' : 'linear-gradient(135deg, #FF3D00, #FF9500)',
                    border: 'none',
                    borderRadius: '16px',
                    color: '#FFF',
                    fontWeight: 900,
                    fontSize: '1.05rem',
                    cursor: isSendingPush ? 'not-allowed' : 'pointer',
                    fontFamily: '"Cairo", "Tajawal", sans-serif',
                    boxShadow: '0 8px 25px rgba(255,61,0,0.35)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isSendingPush ? (
                    <>
                      <div style={{
                        width: '20px', height: '20px',
                        border: '2px solid rgba(255,255,255,0.3)',
                        borderTopColor: '#FFF', borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite'
                      }} />
                      <span>جاري إرسال الإشعار لجميع الهواتف...</span>
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      <span>إرسال الإشعار الفوري لجميع الهواتف</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={async () => {
                    const testTitle = notifTitle.trim() || '🔔 إشعار تجريبي من أكاديمية أولستار';
                    const testBody = notifBody.trim() || 'تم تأكيد وصول الإشعار إلى هاتفك بنجاح!';
                    notificationService.showNativePush(testTitle, testBody, notifImageUrl || '/icon.png', { url: notifTargetUrl || '/' });
                    showSuccess('🧪 تم إطلاق الإشعار التجريبي على هذا الجهاز فوراً!');
                  }}
                  style={{
                    padding: '12px 18px',
                    background: 'rgba(255, 193, 7, 0.15)',
                    border: '1.5px solid #FFC107',
                    borderRadius: '14px',
                    color: '#FFC107',
                    fontWeight: 900,
                    fontSize: '0.88rem',
                    cursor: 'pointer',
                    fontFamily: '"Cairo", "Tajawal", sans-serif',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '-6px'
                  }}
                >
                  <span>🧪</span>
                  <span>تجربة إشعار فوري على هاتفي الآن (Test Push to this Phone)</span>
                </button>
              </form>

              {/* Multi-channel Broadcast options */}
              <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: '#FFC107', fontWeight: 800, marginBottom: '12px' }}>
                  💬 أو البث عبر قنوات التواصل المباشرة (WhatsApp & SMS):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => {
                      if (!notifTitle.trim()) { showSuccess('يرجى إدخال عنوان الإشعار أولاً'); return; }
                      notificationService.sendWhatsAppNotification('+21658263467', `📢 *${notifTitle}*\n\n${notifBody}`);
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
                      if (!notifTitle.trim()) { showSuccess('يرجى إدخال عنوان الإشعار أولاً'); return; }
                      notificationService.sendSMSAlert('', `${notifTitle}: ${notifBody}`);
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

              {/* ─── NOTIFICATION BRANDING & SOUND STUDIO ────────────────────────── */}
              <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                  <h3 style={{ fontSize: '1.1rem', color: '#00E676', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>🎨</span>
                    <span>تخصيص شعار وصوت وهوية الإشعارات (Notification Studio)</span>
                  </h3>
                  <span style={{ fontSize: '0.75rem', color: '#8E9BAE', background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: '8px' }}>
                    تطبق فوراً على جميع الأجهزة
                  </span>
                </div>

                {/* LIVE NOTIFICATION PREVIEW ON PHONE */}
                <div style={{
                  background: 'rgba(0,0,0,0.5)',
                  border: '1.5px solid rgba(255,193,7,0.3)',
                  borderRadius: '20px',
                  padding: '16px 18px',
                  marginBottom: '20px',
                  boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#FFC107', fontWeight: 800, marginBottom: '10px' }}>
                    📱 معاينة مباشرة لشكل الإشعار على هواتف الأولياء (Live Preview):
                  </div>

                  <div style={{
                    background: 'rgba(14, 20, 32, 0.96)',
                    border: '1.5px solid rgba(255, 193, 7, 0.45)',
                    borderRadius: '20px',
                    padding: '12px 16px',
                    color: '#FFF',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '8px',
                          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.25), rgba(0, 0, 0, 0.8))',
                          border: '1px solid #FFC107',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          overflow: 'hidden'
                        }}>
                          <img
                            src={notifConfig.logoUrl || '/icon.png'}
                            alt="Logo Preview"
                            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            onError={(e) => { e.target.src = '/icon.png'; }}
                          />
                        </div>
                        <div>
                          <div style={{ fontSize: '0.74rem', fontWeight: 900, color: '#FFC107', lineHeight: 1.2 }}>
                            {notifConfig.appTitle || 'ALL-STAR SPORTS ACADEMY'}
                          </div>
                          <div style={{ fontSize: '0.64rem', color: '#90A4AE' }}>
                            {notifConfig.appSubtitle || 'أكاديمية أولستار تطاوين 🇹🇳'}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.66rem', color: '#8E9BAE', fontWeight: 700 }}>الآن • Now</span>
                    </div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 900, color: '#FFF' }}>
                      {notifTitle || '⚽ تذكير بموعد التدريب الرسمي'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#CFD8DC' }}>
                      {notifBody || 'سيتم إجراء الحصة التدريبية بالملعب الرئيسي في تمام الساعة 16:00.'}
                    </div>

                    {notifImageUrl && (
                      <div style={{
                        marginTop: '6px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        maxHeight: '140px',
                        border: '1px solid rgba(255,255,255,0.15)'
                      }}>
                        <img
                          src={notifImageUrl}
                          alt="Banner Preview"
                          style={{ width: '100%', height: '100%', maxHeight: '140px', objectFit: 'cover', display: 'block' }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* LOGO CUSTOMIZATION */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={labelStyle}>🖼️ شعار الإشعار (Notification Logo / Avatar)</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        value={notifConfig.logoUrl || ''}
                        onChange={e => setNotifConfig(prev => ({ ...prev, logoUrl: e.target.value }))}
                        placeholder="رابط صورة الشعار (https://... أو /icon.png)"
                        style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                      />
                      <input
                        type="file"
                        ref={notifLogoFileInputRef}
                        accept="image/*"
                        onChange={handleNotifLogoUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => notifLogoFileInputRef.current?.click()}
                        style={{
                          padding: '12px 18px', borderRadius: '12px',
                          background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                          border: 'none', color: '#000', fontWeight: 900, fontSize: '0.82rem',
                          cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}
                      >
                        <span>📁</span>
                        <span>رفع صورة جديدة</span>
                      </button>
                    </div>

                    {/* Logo Quick Presets */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#8E9BAE', alignSelf: 'center' }}>شعارات جاهزة:</span>
                      <button
                        type="button"
                        onClick={() => setNotifConfig(prev => ({ ...prev, logoUrl: '/logo-light.png' }))}
                        style={{
                          background: notifConfig.logoUrl === '/logo-light.png' ? 'rgba(255,193,7,0.2)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${notifConfig.logoUrl === '/logo-light.png' ? '#FFC107' : 'rgba(255,255,255,0.1)'}`,
                          color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer'
                        }}
                      >
                        🌟 الشعار المضيء (PNG)
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifConfig(prev => ({ ...prev, logoUrl: '/logo-badge.jpg' }))}
                        style={{
                          background: notifConfig.logoUrl === '/logo-badge.jpg' ? 'rgba(255,193,7,0.2)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${notifConfig.logoUrl === '/logo-badge.jpg' ? '#FFC107' : 'rgba(255,255,255,0.1)'}`,
                          color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer'
                        }}
                      >
                        🏅 درع أولستار الذهبي
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifConfig(prev => ({ ...prev, logoUrl: '/star-ball.png' }))}
                        style={{
                          background: notifConfig.logoUrl === '/star-ball.png' ? 'rgba(255,193,7,0.2)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${notifConfig.logoUrl === '/star-ball.png' ? '#FFC107' : 'rgba(255,255,255,0.1)'}`,
                          color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer'
                        }}
                      >
                        ⚽ كرة النجمة
                      </button>
                      <button
                        type="button"
                        onClick={() => setNotifConfig(prev => ({ ...prev, logoUrl: '' }))}
                        style={{
                          background: !notifConfig.logoUrl ? 'rgba(0,230,118,0.2)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${!notifConfig.logoUrl ? '#00E676' : 'rgba(255,255,255,0.1)'}`,
                          color: '#FFF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', cursor: 'pointer'
                        }}
                      >
                        🔄 الشعار الافتراضي
                      </button>
                    </div>
                  </div>

                  {/* SOUND CUSTOMIZATION */}
                  <div>
                    <label style={labelStyle}>🔔 نغمة الإشعار (Notification Sound Chime)</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px', marginBottom: '12px' }}>
                      {[
                        { id: 'tri-tone', label: '🔔 Apple Tri-Tone (نغمة آبل الفاخرة الهادئة)', desc: 'ثلاثي النغمات الكريستالي الناعم' },
                        { id: 'whistle', label: '⚽ Stadium Whistle (صفارة الملاعب الرياضية)', desc: 'صفارة كروية رياضية واضحة' },
                        { id: 'crystal', label: '💎 Crystal Pop (نغمة بوب خفيفة)', desc: 'نغمة مائية سريعة ولطيفة' },
                        { id: 'custom', label: '🎵 رنة MP3 مخصصة', desc: 'استخدام ملفك الصوتي الخاص' }
                      ].map(sound => (
                        <div
                          key={sound.id}
                          onClick={() => setNotifConfig(prev => ({ ...prev, soundType: sound.id }))}
                          style={{
                            padding: '12px', borderRadius: '12px', cursor: 'pointer',
                            background: notifConfig.soundType === sound.id ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,255,255,0.03)',
                            border: `1.5px solid ${notifConfig.soundType === sound.id ? '#00E676' : 'rgba(255,255,255,0.08)'}`,
                            transition: 'all 0.2s ease'
                          }}
                        >
                          <div style={{ fontWeight: 800, fontSize: '0.84rem', color: notifConfig.soundType === sound.id ? '#00E676' : '#FFF' }}>
                            {sound.label}
                          </div>
                          <div style={{ fontSize: '0.7rem', color: '#8E9BAE', marginTop: '2px' }}>{sound.desc}</div>
                        </div>
                      ))}
                    </div>

                    {/* Custom MP3 upload / URL if soundType === 'custom' */}
                    {notifConfig.soundType === 'custom' && (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap' }}>
                        <input
                          type="text"
                          value={notifConfig.customSoundUrl || ''}
                          onChange={e => setNotifConfig(prev => ({ ...prev, customSoundUrl: e.target.value }))}
                          placeholder="رابط ملف MP3 الصوتي (https://... أو /notification.mp3)"
                          style={{ ...inputStyle, flex: 1, minWidth: '220px' }}
                        />
                        <input
                          type="file"
                          ref={notifAudioFileInputRef}
                          accept="audio/*"
                          onChange={handleNotifAudioUpload}
                          style={{ display: 'none' }}
                        />
                        <button
                          type="button"
                          onClick={() => notifAudioFileInputRef.current?.click()}
                          style={{
                            padding: '12px 18px', borderRadius: '12px',
                            background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                            border: 'none', color: '#000', fontWeight: 900, fontSize: '0.82rem',
                            cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif',
                            display: 'flex', alignItems: 'center', gap: '6px'
                          }}
                        >
                          <span>🎵</span>
                          <span>رفع ملف صوتي (MP3)</span>
                        </button>
                      </div>
                    )}

                    {/* Test Sound Button */}
                    <button
                      type="button"
                      onClick={handleTestNotifSound}
                      style={{
                        padding: '10px 18px', borderRadius: '12px',
                        background: 'rgba(255, 193, 7, 0.15)', border: '1.5px solid #FFC107',
                        color: '#FFC107', fontWeight: 900, fontSize: '0.82rem',
                        cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif',
                        display: 'inline-flex', alignItems: 'center', gap: '8px'
                      }}
                    >
                      <span>▶️</span>
                      <span>تجربة واستماع للصوت المختار الآن</span>
                    </button>
                  </div>

                  {/* APP TITLE & SUBTITLE */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle}>اسم التطبيق في شريط الإشعار (App Title)</label>
                      <input
                        type="text"
                        value={notifConfig.appTitle || ''}
                        onChange={e => setNotifConfig(prev => ({ ...prev, appTitle: e.target.value }))}
                        placeholder="ALL-STAR SPORTS ACADEMY"
                        style={inputStyle}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>الوصف الفرعي (Subtitle)</label>
                      <input
                        type="text"
                        value={notifConfig.appSubtitle || ''}
                        onChange={e => setNotifConfig(prev => ({ ...prev, appSubtitle: e.target.value }))}
                        placeholder="أكاديمية أولستار تطاوين 🇹🇳"
                        style={inputStyle}
                      />
                    </div>
                  </div>

                  {/* ONESIGNAL BACKGROUND CLOUD ENGINE */}
                  <div style={{
                    background: 'rgba(255, 152, 0, 0.08)',
                    border: '1px solid rgba(255, 152, 0, 0.3)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginTop: '4px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FF9800', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>⚡</span>
                        <span>محرك OneSignal للبث إلى الهواتف المغلقة (Background Lock-Screen Push)</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#00E676', background: 'rgba(0,230,118,0.15)', padding: '2px 8px', borderRadius: '6px', fontWeight: 800 }}>
                        iOS 16.4+ & Android Lock Screen
                      </span>
                    </div>
                    <p style={{ fontSize: '0.76rem', color: '#CFD8DC', margin: '0 0 12px 0', lineHeight: 1.45 }}>
                      يتيح إيقاظ هواتف iPhone و Android وعرض الإشعار بالصوت على شاشة القفل (Lock Screen) حتى عندما يكون التطبيق مغلقاً تماماً وممسوحاً من الذاكرة.
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '0.74rem' }}>OneSignal App ID (معرف التطبيق)</label>
                        <input
                          type="text"
                          value={notifConfig.oneSignalAppId || ''}
                          onChange={e => setNotifConfig(prev => ({ ...prev, oneSignalAppId: e.target.value.trim() }))}
                          placeholder="مثال: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          style={{ ...inputStyle, fontSize: '0.8rem', padding: '10px' }}
                        />
                      </div>
                      <div>
                        <label style={{ ...labelStyle, fontSize: '0.74rem' }}>OneSignal REST API Key (مفتاح الإرسال السحابي)</label>
                        <input
                          type="password"
                          value={notifConfig.oneSignalApiKey || ''}
                          onChange={e => setNotifConfig(prev => ({ ...prev, oneSignalApiKey: e.target.value.trim() }))}
                          placeholder="os_v2_app_xxxxxxxx..."
                          style={{ ...inputStyle, fontSize: '0.8rem', padding: '10px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Notification Config Button */}
                  <button
                    type="button"
                    onClick={handleSaveNotifConfig}
                    style={{
                      padding: '14px', borderRadius: '14px',
                      background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                      border: 'none', color: '#000', fontWeight: 900, fontSize: '0.95rem',
                      cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif',
                      boxShadow: '0 4px 16px rgba(0,230,118,0.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                    }}
                  >
                    <span>💾</span>
                    <span>حفظ وتطبيق إعدادات الشعار والصوت لجميع الإشعارات</span>
                  </button>
                </div>
              </div>

              {/* Sent Notifications Log History */}
              <div style={{ marginTop: '28px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '0.95rem', color: '#FFF', fontWeight: 900, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>📜</span>
                    <span>سجل الإشعارات المرسلة مؤخراً</span>
                  </h3>
                  <button
                    onClick={async () => {
                      const logs = await notificationService.getNotificationsLog();
                      setNotifLogs(logs);
                    }}
                    style={{
                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                      color: '#FFC107', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem',
                      cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif', fontWeight: 700
                    }}
                  >
                    🔄 تحديث السجل
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
                  {notifLogs.length === 0 ? (
                    <div style={{ textAlign: 'center', color: '#78909C', fontSize: '0.82rem', padding: '16px' }}>
                      لا يوجد إشعارات مرسلة بعد. قم بإنشاء إشعارك الأول أعلاه.
                    </div>
                  ) : (
                    notifLogs.map((log) => (
                      <div
                        key={log.id}
                        style={{
                          background: 'rgba(255,255,255,0.03)',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          borderRight: '4px solid #FF3D00',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#FFF' }}>{log.title}</div>
                          <span style={{
                            background: 'rgba(255,193,7,0.15)',
                            color: '#FFC107',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 800
                          }}>
                            {log.target_role || 'الجميع'}
                          </span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: '#B0BEC5', lineHeight: 1.4 }}>{log.body}</div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', fontSize: '0.7rem', color: '#78909C' }}>
                          <span>📅 {log.created_at ? new Date(log.created_at).toLocaleString('ar-TN') : 'الآن'}</span>
                          <span>📱 تم الإرسال إلى {log.sent_count || 1} جهاز</span>
                        </div>
                      </div>
                    ))
                  )}
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
        {/* TAB: REELS                                                           */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'reels' && (
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* ─── SECTION A: TIKTOK CONNECTION STATUS ─────────────────────────── */}
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <h3 style={{ color: '#FF3D00', fontSize: '1.1rem', fontWeight: 900, margin: '0 0 16px' }}>
                🔗 ربط حساب TikTok
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{
                  padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#8E9BAE', marginBottom: '4px' }}>الحساب المتصل</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: tikTokSyncState?.connected_username ? '#00E676' : '#5A6A7E' }}>
                    {tikTokSyncState?.connected_username || 'غير متصل'}
                  </div>
                </div>
                <div style={{
                  padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#8E9BAE', marginBottom: '4px' }}>الحالة</div>
                  <div style={{
                    fontSize: '0.85rem', fontWeight: 800,
                    color: tikTokSyncState?.last_sync_status === 'success' ? '#00E676'
                         : tikTokSyncState?.last_sync_status === 'connected' ? '#FFC107'
                         : tikTokSyncState?.last_sync_status === 'failed' ? '#FF5252' : '#5A6A7E'
                  }}>
                    {tikTokSyncState?.last_sync_status === 'success' ? '✓ متصل ومتزامن'
                     : tikTokSyncState?.last_sync_status === 'connected' ? '✓ متصل'
                     : tikTokSyncState?.last_sync_status === 'failed' ? '✗ فشل المزامنة'
                     : '○ غير متصل'}
                  </div>
                </div>
                <div style={{
                  padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#8E9BAE', marginBottom: '4px' }}>آخر مزامنة</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#FFF' }}>
                    {tikTokSyncState?.last_sync_at
                      ? new Date(tikTokSyncState.last_sync_at).toLocaleString('ar-TN')
                      : '—'}
                  </div>
                </div>
                <div style={{
                  padding: '14px', borderRadius: '12px',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ fontSize: '0.72rem', color: '#8E9BAE', marginBottom: '4px' }}>فيديوهات متزامنة</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFC107' }}>
                    {tikTokSyncState?.videos_synced ?? '—'}
                  </div>
                </div>
              </div>

              {tikTokSyncState?.last_sync_error && (
                <div style={{
                  padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
                  background: 'rgba(255,82,82,0.1)', border: '1px solid rgba(255,82,82,0.3)',
                  fontSize: '0.78rem', color: '#FF8A80', fontWeight: 700
                }}>
                  ⚠️ {tikTokSyncState.last_sync_error}
                </div>
              )}

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleConnectTikTok}
                  style={{
                    padding: '12px 22px', borderRadius: '12px',
                    background: tikTokSyncState?.connected_username
                      ? 'rgba(255,255,255,0.08)' : 'linear-gradient(135deg, #FE2C55, #FF0050)',
                    border: tikTokSyncState?.connected_username
                      ? '1px solid rgba(255,255,255,0.2)' : 'none',
                    color: '#FFF', fontWeight: 900, fontSize: '0.88rem',
                    cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif',
                    boxShadow: '0 4px 16px rgba(254,44,85,0.3)',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <span>🔗</span>
                  <span>{tikTokSyncState?.connected_username ? '🔄 إعادة ربط TikTok (@allstar.sports.ac)' : 'Connect TikTok (@allstar.sports.ac)'}</span>
                </button>

                <button
                  onClick={handleTikTokSync}
                  disabled={isSyncing}
                  style={{
                    padding: '12px 22px', borderRadius: '12px',
                    background: isSyncing ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #FFC107, #FF9500)',
                    border: 'none', color: isSyncing ? '#8E9BAE' : '#000',
                    fontWeight: 900, fontSize: '0.88rem',
                    cursor: isSyncing ? 'wait' : 'pointer',
                    fontFamily: '"Cairo", "Tajawal", sans-serif',
                    display: 'flex', alignItems: 'center', gap: '8px'
                  }}
                >
                  <span>🔄</span>
                  <span>{isSyncing ? '⏳ جاري المزامنة...' : 'مزامنة الفيديوهات الآن'}</span>
                </button>
              </div>

              {/* TikTok Developer Setup Checklist */}
              <div style={{
                marginTop: '16px', padding: '14px', borderRadius: '12px',
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.78rem', color: '#B0BEC5'
              }}>
                <div style={{ fontWeight: 800, color: '#FFC107', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📋</span>
                  <span>قائمة إعداد TikTok Developer Portal (@allstar.sports.ac):</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', lineHeight: 1.5 }}>
                  <div>• <strong>Redirect URI:</strong> <code style={{ color: '#00E5FF', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>https://hsylnrzxeyqxczdalurj.supabase.co/functions/v1/tiktok-oauth</code></div>
                  <div>• <strong>Scopes المطلوبة:</strong> <code style={{ color: '#00E676', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>user.info.basic, video.list</code></div>
                  <div>• <strong>Edge Function Secrets:</strong> <code style={{ color: '#FF9500', background: 'rgba(0,0,0,0.4)', padding: '2px 6px', borderRadius: '4px' }}>TIKTOK_CLIENT_KEY, TIKTOK_CLIENT_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, APP_URL</code></div>
                </div>
              </div>

              {/* Sync Result */}
              {syncResult && (
                <div style={{
                  marginTop: '14px', padding: '14px', borderRadius: '12px',
                  background: syncResult.success ? 'rgba(0,230,118,0.08)' : 'rgba(255,82,82,0.08)',
                  border: `1px solid ${syncResult.success ? 'rgba(0,230,118,0.3)' : 'rgba(255,82,82,0.3)'}`,
                }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: syncResult.success ? '#00E676' : '#FF5252', marginBottom: '8px' }}>
                    {syncResult.success ? '✅ مزامنة ناجحة' : '❌ فشلت المزامنة'}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', fontSize: '0.75rem', color: '#8E9BAE' }}>
                    <div>📥 جلب: <strong style={{ color: '#FFF' }}>{syncResult.videos_fetched || 0}</strong></div>
                    <div>✅ جديد: <strong style={{ color: '#00E676' }}>{syncResult.videos_inserted || 0}</strong></div>
                    <div>🔄 محدّث: <strong style={{ color: '#FFC107' }}>{syncResult.videos_updated || 0}</strong></div>
                    <div>⏭ تخطي: <strong style={{ color: '#5A6A7E' }}>{syncResult.videos_skipped || 0}</strong></div>
                  </div>
                  {syncResult.error && (
                    <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#FF8A80' }}>
                      {syncResult.error}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── SECTION B: UPLOAD NATIVE VIDEO ──────────────────────────────── */}
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ color: '#00E676', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>📁 رفع فيديو مباشر (MP4)</h3>
                <span style={{
                  background: 'rgba(0,230,118,0.12)', border: '1px solid rgba(0,230,118,0.3)',
                  color: '#00E676', borderRadius: '12px', padding: '4px 10px', fontSize: '0.72rem', fontWeight: 800
                }}>
                  تشغيل مباشر بمشغل HTML5
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* File upload button */}
                <div style={{
                  padding: '16px', borderRadius: '14px',
                  background: 'rgba(0,230,118,0.04)', border: '1.5px dashed rgba(0,230,118,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.8rem' }}>📁</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.88rem', color: '#00E676' }}>رفع ملف فيديو MP4 / MOV</div>
                      <div style={{ fontSize: '0.72rem', color: '#8E9BAE' }}>يُرفع إلى مساحة التخزين ويُعرض بمشغل أصلي</div>
                    </div>
                  </div>
                  <input type="file" accept="video/mp4,video/quicktime,video/webm" ref={videoFileInputRef} onChange={handleVideoFileChange} style={{ display: 'none' }} />
                  <button
                    type="button" disabled={isUploadingVideo}
                    onClick={() => videoFileInputRef.current?.click()}
                    style={{
                      padding: '10px 20px', borderRadius: '10px',
                      background: isUploadingVideo ? 'rgba(255,255,255,0.1)' : 'linear-gradient(135deg, #00E676, #00B0FF)',
                      border: 'none', color: '#000', fontWeight: 900, fontSize: '0.84rem',
                      cursor: isUploadingVideo ? 'wait' : 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif'
                    }}
                  >
                    {isUploadingVideo ? '⏳ جاري الرفع...' : '📤 اختيار فيديو'}
                  </button>
                </div>

                <div style={{ textAlign: 'center', color: '#5A6A7E', fontSize: '0.75rem', fontWeight: 700 }}>— أو رابط فيديو مباشر —</div>

                <div>
                  <label style={labelStyle}>رابط ملف الفيديو المباشر (MP4/WebM)</label>
                  <input
                    type="url" value={newReelUrl}
                    onChange={e => {
                      let val = e.target.value;
                      if (val.includes('<iframe') || val.includes('src=')) {
                        const m = val.match(/src=["']([^"']+)["']/i);
                        if (m && m[1]) val = m[1].replace(/&amp;/g, '&');
                      }
                      setNewReelUrl(val);
                    }}
                    placeholder="https://... رابط الفيديو (MP4 / WebM)"
                    style={inputStyle}
                  />
                </div>

                {/* Thumbnail, Title, Sport, Description fields */}
                <div>
                  <label style={labelStyle}>صورة الغلاف (اختياري)</label>
                  <input type="url" value={newReelThumb} onChange={e => setNewReelThumb(e.target.value)}
                    placeholder="https://... رابط صورة الغلاف" style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={labelStyle}>عنوان الريل</label>
                    <input type="text" value={newReelTitle} onChange={e => setNewReelTitle(e.target.value)}
                      placeholder="مثال: مهارات فئة U12 ⚽" style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>الرياضة</label>
                    <select value={newReelSport} onChange={e => setNewReelSport(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="General">🎬 عام</option>
                      <option value="Football">⚽ كرة قدم</option>
                      <option value="Basketball">🏀 كرة سلة</option>
                      <option value="Handball">🤾 كرة يد</option>
                      <option value="Event">🏆 احتفال</option>
                      <option value="Training">💪 تدريبات</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>وصف (اختياري)</label>
                  <input type="text" value={newReelDesc} onChange={e => setNewReelDesc(e.target.value)}
                    placeholder="وصف قصير..." style={inputStyle} />
                </div>

                <button
                  type="button" disabled={!newReelUrl.trim() || isUploadingVideo}
                  onClick={handleAddNativeReel}
                  style={{
                    padding: '14px', borderRadius: '12px',
                    background: newReelUrl.trim() ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'rgba(255,255,255,0.06)',
                    border: 'none', color: newReelUrl.trim() ? '#000' : '#5A6A7E',
                    fontWeight: 900, fontSize: '0.95rem', cursor: newReelUrl.trim() ? 'pointer' : 'default',
                    fontFamily: '"Cairo", "Tajawal", sans-serif',
                    boxShadow: newReelUrl.trim() ? '0 6px 20px rgba(255,193,7,0.3)' : 'none'
                  }}
                >
                  🚀 نشر ريل فيديو مباشر
                </button>
              </div>
            </div>

            {/* ─── SECTION C: ADD TIKTOK REELS (BULK + SINGLE) ───────────────── */}
            <div style={{ ...cardStyle, marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                <h3 style={{ color: '#FF3D00', fontSize: '1.05rem', fontWeight: 900, margin: 0 }}>
                  🎵 إضافة فيديوهات TikTok
                </h3>
                <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <button
                    type="button"
                    onClick={() => setTikTokInputMode('bulk')}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none',
                      background: tikTokInputMode === 'bulk' ? 'linear-gradient(135deg, #FF3D00, #FF6E40)' : 'transparent',
                      color: tikTokInputMode === 'bulk' ? '#FFF' : '#8E9BAE',
                      fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif'
                    }}
                  >
                    📋 استيراد مجمّع (قائمة كاملة)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTikTokInputMode('single')}
                    style={{
                      padding: '6px 12px', borderRadius: '8px', border: 'none',
                      background: tikTokInputMode === 'single' ? 'linear-gradient(135deg, #FF3D00, #FF6E40)' : 'transparent',
                      color: tikTokInputMode === 'single' ? '#FFF' : '#8E9BAE',
                      fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif'
                    }}
                  >
                    🎵 إضافة فردية
                  </button>
                </div>
              </div>

              {tikTokInputMode === 'bulk' ? (
                /* BULK IMPORT MODE */
                <div>
                  <p style={{ color: '#8E9BAE', fontSize: '0.8rem', marginBottom: '12px', lineHeight: 1.5 }}>
                    الصق قائمة كاملة من معرّفات فيديوهات TikTok أو روابطها. سيتم استخراج المعرّفات تلقائياً وإضافتها دفعة واحدة دون الحاجة لإضافتها واحداً تلو الآخر!
                  </p>

                  <div style={{ marginBottom: '12px' }}>
                    <label style={labelStyle}>
                      قائمة الفيديوهات (معرّفات أو روابط فيديو - كل سطر معرّف أو رابط):
                    </label>
                    <textarea
                      rows={6}
                      value={bulkTikTokText}
                      onChange={e => setBulkTikTokText(e.target.value)}
                      placeholder={`7631315676799503624\n7636461592170827015\nhttps://www.tiktok.com/@allstar/video/7640507908458827015`}
                      style={{
                        ...inputStyle,
                        fontFamily: 'monospace',
                        fontSize: '0.82rem',
                        lineHeight: 1.4,
                        direction: 'ltr',
                        textAlign: 'left',
                        minHeight: '120px'
                      }}
                    />
                  </div>

                  {/* Detected count */}
                  {(() => {
                    const detected = extractAllTikTokIds(bulkTikTokText);
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                        <div style={{
                          fontSize: '0.8rem', fontWeight: 800,
                          color: detected.length > 0 ? '#00E676' : '#8E9BAE',
                          display: 'flex', alignItems: 'center', gap: '6px'
                        }}>
                          {detected.length > 0 ? `✨ تم اكتشاف ${detected.length} فيديو جاهز للإضافة` : '💡 الصق قائمة المعرّفات أو الروابط أعلاه'}
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '0.75rem', color: '#8E9BAE' }}>الرياضة:</span>
                          <select
                            value={newReelSport}
                            onChange={e => setNewReelSport(e.target.value)}
                            style={{
                              padding: '6px 12px', borderRadius: '8px',
                              background: '#0D131F', border: '1px solid rgba(255,255,255,0.15)',
                              color: '#FFF', fontSize: '0.78rem', fontWeight: 700,
                              fontFamily: '"Cairo", "Tajawal", sans-serif'
                            }}
                          >
                            <option value="General">🎬 عام</option>
                            <option value="Football">⚽ كرة قدم</option>
                            <option value="Basketball">🏀 كرة سلة</option>
                            <option value="Handball">🤾 كرة يد</option>
                            <option value="Event">🏆 احتفال</option>
                            <option value="Training">💪 تدريبات</option>
                          </select>
                        </div>
                      </div>
                    );
                  })()}

                  <button
                    type="button"
                    onClick={handleBulkAddTikTokReels}
                    disabled={isBulkImporting || extractAllTikTokIds(bulkTikTokText).length === 0}
                    style={{
                      width: '100%', padding: '13px', borderRadius: '12px',
                      background: extractAllTikTokIds(bulkTikTokText).length > 0
                        ? 'linear-gradient(135deg, #FF3D00, #FF6E40)'
                        : 'rgba(255,255,255,0.06)',
                      border: 'none',
                      color: extractAllTikTokIds(bulkTikTokText).length > 0 ? '#FFF' : '#5A6A7E',
                      fontWeight: 900, fontSize: '0.92rem',
                      cursor: (isBulkImporting || extractAllTikTokIds(bulkTikTokText).length === 0) ? 'default' : 'pointer',
                      fontFamily: '"Cairo", "Tajawal", sans-serif',
                      boxShadow: extractAllTikTokIds(bulkTikTokText).length > 0 ? '0 4px 16px rgba(255,61,0,0.35)' : 'none'
                    }}
                  >
                    {isBulkImporting
                      ? '⏳ جاري إضافة الفيديوهات...'
                      : `🚀 استيراد وإضافة ${extractAllTikTokIds(bulkTikTokText).length || ''} فيديو دفعة واحدة`}
                  </button>
                </div>
              ) : (
                /* SINGLE IMPORT MODE */
                <div>
                  <p style={{ color: '#8E9BAE', fontSize: '0.8rem', marginBottom: '14px', lineHeight: 1.5 }}>
                    أدخل معرّف فيديو TikTok (الرقم الطويل من الرابط) لإضافته مباشرة. يتم تشغيله عبر مشغل TikTok الرسمي.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1 }}>
                      <label style={labelStyle}>TikTok Video ID</label>
                      <input
                        type="text"
                        value={manualTikTokId}
                        onChange={e => setManualTikTokId(e.target.value)}
                        placeholder="7234567890123456789"
                        style={{ ...inputStyle, direction: 'ltr', textAlign: 'left', fontFamily: 'monospace' }}
                      />
                    </div>
                    <button
                      onClick={handleAddManualTikTokReel}
                      disabled={!manualTikTokId.trim()}
                      style={{
                        padding: '12px 20px', borderRadius: '10px', flexShrink: 0,
                        background: manualTikTokId.trim() ? 'linear-gradient(135deg, #FF3D00, #FF6E40)' : 'rgba(255,255,255,0.06)',
                        border: 'none', color: manualTikTokId.trim() ? '#FFF' : '#5A6A7E',
                        fontWeight: 900, fontSize: '0.84rem', cursor: manualTikTokId.trim() ? 'pointer' : 'default',
                        fontFamily: '"Cairo", "Tajawal", sans-serif'
                      }}
                    >
                      ➕ إضافة
                    </button>
                  </div>
                  {manualTikTokId.trim() && (
                    <div style={{ marginTop: '14px', padding: '12px', borderRadius: '12px', background: '#070A10', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <div style={{ fontSize: '0.75rem', color: '#FF6E40', fontWeight: 800, marginBottom: '8px' }}>👁️ معاينة مشغل TikTok:</div>
                      <div style={{ width: '100%', maxWidth: '220px', height: '320px', borderRadius: '10px', overflow: 'hidden', background: '#000', margin: '0 auto' }}>
                        <iframe
                          src={`https://www.tiktok.com/player/v1/${manualTikTokId.trim()}?controls=0&progress_bar=0&play_button=0&volume_control=0&fullscreen_button=0&timestamp=0&music_info=0&description=0&rel=0&native_context_menu=0&autoplay=0&loop=1`}
                          allow="autoplay; fullscreen"
                          style={{ width: '100%', height: '100%', border: 0, background: '#000' }}
                          title="TikTok Preview"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ─── SECTION D: ALL REELS LIST (WITH PREVIEWS & REORDERING) ──── */}
            {(academyReels.length > 0 || reels.length > 0) ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ color: '#FFF', fontSize: '1.1rem', fontWeight: 900, margin: '0 0 4px' }}>
                      🎬 ترتيب وإدارة الريلز ({academyReels.length || reels.length})
                    </h3>
                    <div style={{ fontSize: '0.75rem', color: '#8E9BAE' }}>
                      الفيديو رقم <strong style={{ color: '#00E676' }}>#1</strong> هو أول فيديو يظهر للمستخدمين في قمة التطبيق. يمكنك تغيير الترتيب وتثبيت أي فيديو في القمة!
                    </div>
                  </div>
                  <a href="/reels" target="_blank" rel="noreferrer"
                    style={{
                      color: '#000', background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                      padding: '8px 16px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 900,
                      textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px'
                    }}>
                    ↗ تجربة ومعاينة Reels
                  </a>
                </div>

                {/* Filter & Search Bar */}
                <div style={{
                  display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap',
                  background: 'rgba(255,255,255,0.03)', padding: '12px 14px', borderRadius: '14px',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                  <div style={{ flex: 1, minWidth: '180px' }}>
                    <input
                      type="text"
                      value={reelsSearchQuery}
                      onChange={e => setReelsSearchQuery(e.target.value)}
                      placeholder="🔍 بحث بالمعرّف أو العنوان..."
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.82rem' }}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '2px' }}>
                    {[
                      { id: 'all', label: 'الكل' },
                      { id: 'Football', label: '⚽ كرة قدم' },
                      { id: 'Basketball', label: '🏀 كرة سلة' },
                      { id: 'Handball', label: '🤾 كرة يد' },
                      { id: 'Event', label: '🏆 احتفال' },
                      { id: 'Training', label: '💪 تدريب' },
                      { id: 'General', label: '⭐ عام' }
                    ].map(tab => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setReelsFilterSport(tab.id)}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', border: 'none',
                          background: reelsFilterSport === tab.id ? 'rgba(255,193,7,0.2)' : 'rgba(255,255,255,0.05)',
                          border: reelsFilterSport === tab.id ? '1px solid #FFC107' : '1px solid transparent',
                          color: reelsFilterSport === tab.id ? '#FFC107' : '#8E9BAE',
                          fontWeight: 800, fontSize: '0.74rem', cursor: 'pointer', whiteSpace: 'nowrap',
                          fontFamily: '"Cairo", "Tajawal", sans-serif'
                        }}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Academy reels list */}
                {(() => {
                  let filtered = [...academyReels];
                  if (reelsFilterSport !== 'all') {
                    filtered = filtered.filter(r => (r.sport || 'General').toLowerCase() === reelsFilterSport.toLowerCase());
                  }
                  if (reelsSearchQuery.trim()) {
                    const q = reelsSearchQuery.trim().toLowerCase();
                    filtered = filtered.filter(r =>
                      (r.title && r.title.toLowerCase().includes(q)) ||
                      (r.tiktok_video_id && r.tiktok_video_id.includes(q)) ||
                      (r.description && r.description.toLowerCase().includes(q))
                    );
                  }

                  if (filtered.length === 0) {
                    return (
                      <div style={{ textAlign: 'center', padding: '30px', color: '#8E9BAE', fontSize: '0.85rem' }}>
                        لا توجد نتائج مطابقة للبحث أو التصفية.
                      </div>
                    );
                  }

                  return filtered.map((reel, idx) => {
                    const isTikTok = reel.playback_type === 'tiktok';
                    const isTop = idx === 0 && reelsFilterSport === 'all' && !reelsSearchQuery;
                    const isEditing = editingReelId === reel.id;

                    return (
                      <div
                        key={reel.id}
                        style={{
                          ...cardStyle,
                          padding: '14px 16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '12px',
                          border: isTop ? '1.5px solid rgba(0,230,118,0.5)' : '1px solid rgba(255,255,255,0.08)',
                          background: isTop ? 'linear-gradient(135deg, rgba(0,230,118,0.06), rgba(0,0,0,0.4))' : cardStyle.background,
                          boxShadow: isTop ? '0 4px 20px rgba(0,230,118,0.15)' : 'none',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {/* Top row: Rank badge + Video thumbnail preview + Info */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                          {/* Rank Badge */}
                          <div style={{
                            width: '42px', height: '42px', borderRadius: '10px',
                            background: isTop ? 'linear-gradient(135deg, #00E676, #00B0FF)' : 'rgba(255,255,255,0.06)',
                            border: `1px solid ${isTop ? '#00E676' : 'rgba(255,255,255,0.15)'}`,
                            color: isTop ? '#000' : '#FFF',
                            fontWeight: 900, fontSize: isTop ? '0.85rem' : '0.8rem',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <span>#{idx + 1}</span>
                            {isTop && <span style={{ fontSize: '0.6rem', fontWeight: 900 }}>القمة</span>}
                          </div>

                          {/* Video Thumbnail / Mini Preview Trigger */}
                          <div
                            onClick={() => setPreviewModalReel(reel)}
                            title="انقر لمعاينة وتشغيل الفيديو"
                            style={{
                              width: '54px', height: '74px', borderRadius: '10px',
                              overflow: 'hidden', background: '#000', flexShrink: 0,
                              border: '1.5px solid rgba(255,255,255,0.2)',
                              position: 'relative', cursor: 'pointer',
                              display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                          >
                            {reel.cover_image_url ? (
                              <img src={reel.cover_image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : isTikTok ? (
                              <div style={{
                                width: '100%', height: '100%',
                                background: 'linear-gradient(135deg, #120A1A, #2A0818)',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                gap: '2px'
                              }}>
                                <span style={{ fontSize: '1.3rem' }}>🎵</span>
                                <span style={{ fontSize: '0.55rem', color: '#FF6E40', fontWeight: 800 }}>TikTok</span>
                              </div>
                            ) : (
                              <span style={{ fontSize: '1.4rem' }}>🎬</span>
                            )}
                            {/* Play Overlay Icon */}
                            <div style={{
                              position: 'absolute', inset: 0,
                              background: 'rgba(0,0,0,0.35)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#FFF', fontSize: '1.1rem'
                            }}>
                              ▶
                            </div>
                          </div>

                          {/* Content / Info */}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            {isEditing ? (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <input
                                  type="text"
                                  value={editingReelTitle}
                                  onChange={e => setEditingReelTitle(e.target.value)}
                                  placeholder="عنوان الفيديو..."
                                  style={{ ...inputStyle, padding: '6px 10px', fontSize: '0.82rem' }}
                                />
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <select
                                    value={editingReelSport}
                                    onChange={e => setEditingReelSport(e.target.value)}
                                    style={{
                                      padding: '6px 10px', borderRadius: '8px',
                                      background: '#0D131F', border: '1px solid rgba(255,255,255,0.15)',
                                      color: '#FFF', fontSize: '0.78rem', fontFamily: '"Cairo", "Tajawal", sans-serif'
                                    }}
                                  >
                                    <option value="General">🎬 عام</option>
                                    <option value="Football">⚽ كرة قدم</option>
                                    <option value="Basketball">🏀 كرة سلة</option>
                                    <option value="Handball">🤾 كرة يد</option>
                                    <option value="Event">🏆 احتفال</option>
                                    <option value="Training">💪 تدريبات</option>
                                  </select>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveReelEdit(reel.id)}
                                    style={{
                                      padding: '6px 14px', borderRadius: '8px', border: 'none',
                                      background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                                      color: '#000', fontWeight: 900, fontSize: '0.78rem', cursor: 'pointer'
                                    }}
                                  >
                                    ✓ حفظ
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingReelId(null)}
                                    style={{
                                      padding: '6px 10px', borderRadius: '8px',
                                      background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)',
                                      color: '#8E9BAE', fontSize: '0.78rem', cursor: 'pointer'
                                    }}
                                  >
                                    إلغاء
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
                                  <span style={{ fontWeight: 900, fontSize: '0.9rem', color: '#FFF' }}>
                                    {reel.title || (isTikTok ? `TikTok ${reel.tiktok_video_id?.slice(-8) || ''}` : 'ريل بدون عنوان')}
                                  </span>
                                  {isTop && (
                                    <span style={{
                                      background: 'rgba(0,230,118,0.15)', border: '1px solid #00E676',
                                      color: '#00E676', borderRadius: '8px', padding: '2px 8px', fontSize: '0.68rem', fontWeight: 900
                                    }}>
                                      ⭐ معروض في البداية
                                    </span>
                                  )}
                                </div>

                                <div style={{ fontSize: '0.72rem', color: '#8E9BAE', fontFamily: 'monospace', direction: 'ltr', textAlign: 'left', marginBottom: '6px' }}>
                                  {isTikTok ? `tiktok.com/@allstar/video/${reel.tiktok_video_id}` : (reel.video_url || '')}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                  <span style={{
                                    fontSize: '0.68rem', fontWeight: 800, padding: '2px 8px', borderRadius: '6px',
                                    background: isTikTok ? 'rgba(255,61,0,0.12)' : 'rgba(0,230,118,0.12)',
                                    color: isTikTok ? '#FF6E40' : '#00E676',
                                    border: `1px solid ${isTikTok ? 'rgba(255,61,0,0.25)' : 'rgba(0,230,118,0.25)'}`,
                                  }}>
                                    {isTikTok ? '🎵 TikTok' : '✓ MP4'}
                                  </span>
                                  <span style={{
                                    fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: '6px',
                                    background: 'rgba(255,255,255,0.06)', color: '#FFC107'
                                  }}>
                                    {reel.sport || 'عام'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row: Reordering & Action Buttons */}
                        <div style={{
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.06)',
                          flexWrap: 'wrap', gap: '8px'
                        }}>
                          {/* Order Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              onClick={() => handlePinReelToTop(reel.id)}
                              disabled={isTop}
                              title="تثبيت هذا الفيديو في المرتبة الأولى (القمة)"
                              style={{
                                padding: '6px 12px', borderRadius: '8px',
                                background: isTop ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00E676, #00B0FF)',
                                border: 'none', color: isTop ? '#5A6A7E' : '#000',
                                fontWeight: 900, fontSize: '0.75rem', cursor: isTop ? 'default' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: '4px',
                                fontFamily: '"Cairo", "Tajawal", sans-serif'
                              }}
                            >
                              🔝 {isTop ? 'في القمة حالياً' : 'تثبيت في القمة'}
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveReelUp(idx, filtered)}
                              disabled={idx === 0}
                              title="تقديم خطوة للأعلى"
                              style={{
                                padding: '6px 10px', borderRadius: '8px',
                                background: idx === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: idx === 0 ? '#4A5568' : '#FFF',
                                fontWeight: 800, fontSize: '0.78rem', cursor: idx === 0 ? 'default' : 'pointer'
                              }}
                            >
                              ⬆️ للأعلى
                            </button>

                            <button
                              type="button"
                              onClick={() => handleMoveReelDown(idx, filtered)}
                              disabled={idx === filtered.length - 1}
                              title="تأخير خطوة للأسفل"
                              style={{
                                padding: '6px 10px', borderRadius: '8px',
                                background: idx === filtered.length - 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
                                border: '1px solid rgba(255,255,255,0.12)',
                                color: idx === filtered.length - 1 ? '#4A5568' : '#FFF',
                                fontWeight: 800, fontSize: '0.78rem', cursor: idx === filtered.length - 1 ? 'default' : 'pointer'
                              }}
                            >
                              ⬇️ للأسفل
                            </button>
                          </div>

                          {/* Extra Action Buttons */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => setPreviewModalReel(reel)}
                              style={{
                                padding: '6px 12px', borderRadius: '8px',
                                background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.3)',
                                color: '#FFC107', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                                fontFamily: '"Cairo", "Tajawal", sans-serif'
                              }}
                            >
                              👁️ معاينة وتشغيل
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingReelId(reel.id);
                                setEditingReelTitle(reel.title || '');
                                setEditingReelSport(reel.sport || 'General');
                              }}
                              style={{
                                padding: '6px 10px', borderRadius: '8px',
                                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                                color: '#8E9BAE', fontWeight: 800, fontSize: '0.75rem', cursor: 'pointer',
                                fontFamily: '"Cairo", "Tajawal", sans-serif'
                              }}
                            >
                              ✏️ تعديل
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAcademyReel(reel.id)}
                              style={{
                                background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)',
                                borderRadius: '8px', color: '#FF5252', padding: '6px 10px',
                                fontWeight: 800, cursor: 'pointer', fontSize: '0.75rem',
                                fontFamily: '"Cairo", "Tajawal", sans-serif'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}

                {/* Legacy reels fallback */}
                {academyReels.length === 0 && reels.map((reel, idx) => {
                  const videoSrc = reel.video_url || reel.url || '';
                  const thumb = reel.thumbnail_url || reel.thumbnailUrl;
                  return (
                    <div key={reel.id || idx} style={{
                      ...cardStyle, display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px'
                    }}>
                      {thumb ? (
                        <img src={thumb} alt="" style={{ width: '46px', height: '62px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
                      ) : (
                        <div style={{
                          width: '46px', height: '62px', borderRadius: '8px', flexShrink: 0,
                          background: 'rgba(255,193,7,0.12)', border: '1px solid rgba(255,193,7,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem'
                        }}>🎬</div>
                      )}
                      <div style={{ flex: 1, overflow: 'hidden' }}>
                        <div style={{ fontWeight: 900, fontSize: '0.88rem', color: '#FFF', marginBottom: '3px' }}>
                          {reel.title || `ريل ${idx + 1}`}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#8E9BAE', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', direction: 'ltr', textAlign: 'left' }}>
                          {videoSrc}
                        </div>
                        <span style={{
                          fontSize: '0.65rem', fontWeight: 800, padding: '2px 7px', borderRadius: '6px',
                          background: 'rgba(255,193,7,0.12)', color: '#FFC107', border: '1px solid rgba(255,193,7,0.25)',
                          marginTop: '4px', display: 'inline-block'
                        }}>📦 Legacy</span>
                      </div>
                      <button
                        onClick={() => handleDeleteReel(reel.id)}
                        style={{
                          background: 'rgba(255,61,0,0.12)', border: '1px solid rgba(255,61,0,0.3)',
                          borderRadius: '8px', color: '#FF5252', padding: '7px 12px',
                          fontWeight: 800, cursor: 'pointer', fontSize: '0.78rem', flexShrink: 0,
                          fontFamily: '"Cairo", "Tajawal", sans-serif'
                        }}
                      >🗑️</button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ ...cardStyle, textAlign: 'center', padding: '40px', color: '#8E9BAE' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎬</div>
                <h3 style={{ color: '#FFF', margin: '0 0 8px' }}>لا توجد أي ريلز بعد</h3>
                <p style={{ margin: 0, fontSize: '0.85rem' }}>ارفع فيديو MP4 أو استورد قائمة فيديوهات TikTok أعلاه</p>
              </div>
            )}

            {/* ─── MODAL: VIDEO PREVIEW POPUP ───────────────────────────────── */}
            {previewModalReel && (
              <div
                onClick={() => setPreviewModalReel(null)}
                style={{
                  position: 'fixed', inset: 0, zIndex: 999999,
                  background: 'rgba(0,0,0,0.85)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '20px', direction: 'rtl'
                }}
              >
                <div
                  onClick={e => e.stopPropagation()}
                  style={{
                    background: '#0B0F19', border: '1.5px solid rgba(255,255,255,0.15)',
                    borderRadius: '20px', padding: '20px', maxWidth: '380px', width: '100%',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column',
                    alignItems: 'center', gap: '14px', maxHeight: '90vh', overflowY: 'auto'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                    <div style={{ fontWeight: 900, fontSize: '0.95rem', color: '#FFF' }}>
                      {previewModalReel.title || `معاينة ريل (${previewModalReel.tiktok_video_id || ''})`}
                    </div>
                    <button
                      onClick={() => setPreviewModalReel(null)}
                      style={{
                        background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF',
                        borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem'
                      }}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Player Frame */}
                  <div style={{
                    width: '100%', maxWidth: '280px', height: '420px', borderRadius: '14px',
                    overflow: 'hidden', background: '#000', boxShadow: '0 8px 30px rgba(0,0,0,0.8)',
                    position: 'relative'
                  }}>
                    {previewModalReel.playback_type === 'tiktok' && previewModalReel.tiktok_video_id ? (
                      <iframe
                        src={`https://www.tiktok.com/player/v1/${previewModalReel.tiktok_video_id}?controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=1&timestamp=0&music_info=0&description=0&rel=0&autoplay=1&loop=1`}
                        allow="autoplay; fullscreen"
                        style={{ width: '100%', height: '100%', border: 0, background: '#000' }}
                        title="TikTok Modal Preview"
                      />
                    ) : (
                      <video
                        src={previewModalReel.video_url}
                        controls
                        autoPlay
                        loop
                        playsInline
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    )}
                  </div>

                  {/* Modal Action Buttons */}
                  <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
                    <button
                      type="button"
                      onClick={() => {
                        handlePinReelToTop(previewModalReel.id);
                        setPreviewModalReel(null);
                      }}
                      style={{
                        flex: 1, padding: '12px', borderRadius: '12px',
                        background: 'linear-gradient(135deg, #00E676, #00B0FF)',
                        border: 'none', color: '#000', fontWeight: 900, fontSize: '0.85rem',
                        cursor: 'pointer', fontFamily: '"Cairo", "Tajawal", sans-serif'
                      }}
                    >
                      🔝 تثبيت هذا الفيديو في القمة (#1)
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
