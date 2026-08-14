import React, { useState, useEffect } from 'react'
import { db } from '../services/db'
import { notificationService } from '../services/notifications'

export default function CoachPortal({ currentUser }) {
  const [players, setPlayers] = useState([])
  const [selectedPlayerId, setSelectedPlayerId] = useState('')
  const [attendance, setAttendance] = useState([])
  const [evaluations, setEvaluations] = useState([])
  const [evalData, setEvalData] = useState({ technical: 5, tactical: 5, discipline: 5, notes: '' })
  const [activeTab, setActiveTab] = useState('attendance') // 'attendance' | 'evaluations' | 'roster'
  const [toastMsg, setToastMsg] = useState('')

  const coachName = currentUser?.name || 'الكابتن أحمد المنصوري'
  const coachSport = currentUser?.sport || 'Football'
  const coachGroup = currentUser?.group || 'U12'

  useEffect(() => {
    setPlayers(db.getPlayers())
    setAttendance(db.getAttendance())
    setEvaluations(db.getEvaluations())

    db.getPlayersAsync().then(p => p && setPlayers(p))
  }, [])

  const handleRecordAttendance = (playerId, status) => {
    const player = players.find(p => p.id === playerId)
    if (!player) return

    db.recordAttendance(playerId, status)
    setAttendance(db.getAttendance())
    showToast(`✅ تم تسجيل حضور ${player.name}: (${status === 'Present' ? 'حاضر' : 'غائب'})`)

    notificationService.sendLocalNotification(
      `✅ تسجيل حضور: ${player.name}`,
      `تم تسجيل حالة الحضور (${status}) للحصة التدريبية.`
    )
  }

  const handleSaveEvaluation = (e) => {
    e.preventDefault()
    if (!selectedPlayerId) {
      alert('يرجى اختيار اللاعب المراد تقييمه')
      return
    }

    const player = players.find(p => p.id === selectedPlayerId)
    db.saveEvaluation({
      playerId: player.id,
      playerName: player.name,
      technical: Number(evalData.technical),
      tactical: Number(evalData.tactical),
      discipline: Number(evalData.discipline),
      notes: evalData.notes,
      date: new Date().toISOString().split('T')[0]
    })

    setEvaluations(db.getEvaluations())
    showToast(`⭐ تم تسجيل تقييم ${player.name} بنجاح!`)
    setEvalData({ technical: 5, tactical: 5, discipline: 5, notes: '' })
  }

  const showToast = (msg) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(''), 3500)
  }

  return (
    <div
      style={{
        paddingTop: '32px',
        paddingBottom: '80px',
        minHeight: '100vh',
        backgroundColor: '#08090C',
        color: '#FFFFFF',
        fontFamily: '"Cairo", "Tajawal", sans-serif',
        direction: 'rtl'
      }}
    >
      <div className="defensive-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* COACH PROFILE HEADER */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 149, 0, 0.08) 100%)',
            border: '1.5px solid #FFC107',
            borderRadius: '24px',
            padding: '24px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justify: 'space-between',
            flexWrap: 'wrap',
            gap: '16px'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(255, 193, 7, 0.2)', color: '#FFC107', padding: '4px 12px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 900, marginBottom: '8px' }}>
              ⚽ تطبيق المدربين والكباتن الرسمية
            </div>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#FFF', margin: '0 0 4px 0' }}>
              مرحباً بك، {coachName}
            </h1>
            <p style={{ color: '#FFC107', fontSize: '0.9rem', margin: 0, fontWeight: 700 }}>
              مشرف الفئة العمرية: {coachSport} • {coachGroup}
            </p>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.4)', padding: '12px 18px', borderRadius: '16px', border: '1px solid rgba(255,193,7,0.3)', textAlign: 'center' }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: '#00E676' }}>{players.length}</div>
            <div style={{ fontSize: '0.75rem', color: '#B0BEC5', fontWeight: 700 }}>لاعباً مسجلاً بالفئة</div>
          </div>
        </div>

        {/* TOAST NOTIFICATION */}
        {toastMsg && (
          <div
            style={{
              background: '#00E676',
              color: '#000000',
              fontWeight: 900,
              padding: '12px 20px',
              borderRadius: '16px',
              marginBottom: '20px',
              textAlign: 'center',
              fontSize: '0.95rem',
              boxShadow: '0 6px 20px rgba(0, 230, 118, 0.4)'
            }}
          >
            {toastMsg}
          </div>
        )}

        {/* TAB SWITCHER */}
        <div
          style={{
            display: 'flex',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '16px',
            padding: '4px',
            marginBottom: '24px',
            gap: '4px'
          }}
        >
          {[
            { id: 'attendance', label: '📋 تسجيل الحضور', color: '#00E676' },
            { id: 'evaluations', label: '⭐ تقييم الأداء', color: '#FFC107' },
            { id: 'roster', label: '👥 قائمة اللاعبين', color: '#00E5FF' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                minHeight: '44px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === tab.id ? tab.color : 'transparent',
                color: activeTab === tab.id ? '#000000' : '#FFFFFF',
                fontWeight: activeTab === tab.id ? 900 : 700,
                cursor: 'pointer',
                fontSize: '0.88rem',
                fontFamily: 'inherit',
                transition: 'all 0.2s ease'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: ATTENDANCE TRACKER */}
        {activeTab === 'attendance' && (
          <div style={{ background: 'rgba(20, 26, 38, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#00E676', fontWeight: 900, marginBottom: '16px' }}>
              📋 ورقة حضور الحصة التدريبية اليومية
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {players.map(p => {
                const recentAtt = attendance.find(a => a.playerId === p.id)
                return (
                  <div
                    key={p.id}
                    style={{
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '16px',
                      padding: '14px 18px',
                      display: 'flex',
                      alignItems: 'center',
                      justify: 'space-between',
                      flexWrap: 'wrap',
                      gap: '12px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <img
                        src={p.photoUrl || p.photourl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=100&auto=format&fit=crop&q=80'}
                        alt={p.name}
                        style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #00E676' }}
                      />
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '0.98rem' }}>{p.name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#8E9BAE' }}>{p.sport} • {p.group}</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleRecordAttendance(p.id, 'Present')}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: recentAtt?.status === 'Present' ? '#00E676' : 'rgba(0, 230, 118, 0.15)',
                          border: '1px solid #00E676',
                          color: recentAtt?.status === 'Present' ? '#000' : '#00E676',
                          fontWeight: 900,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        ✅ حاضر
                      </button>
                      <button
                        onClick={() => handleRecordAttendance(p.id, 'Absent')}
                        style={{
                          padding: '8px 14px',
                          borderRadius: '10px',
                          background: recentAtt?.status === 'Absent' ? '#FF3D00' : 'rgba(255, 61, 0, 0.15)',
                          border: '1px solid #FF3D00',
                          color: recentAtt?.status === 'Absent' ? '#FFF' : '#FF3D00',
                          fontWeight: 900,
                          fontSize: '0.82rem',
                          cursor: 'pointer'
                        }}
                      >
                        ❌ غائب
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* TAB 2: PLAYER EVALUATIONS */}
        {activeTab === 'evaluations' && (
          <div style={{ background: 'rgba(20, 26, 38, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#FFC107', fontWeight: 900, marginBottom: '16px' }}>
              ⭐ التقييم الفني والتكتيكي للاعبين
            </h3>
            <form onSubmit={handleSaveEvaluation} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#B0BEC5', marginBottom: '6px', fontWeight: 700 }}>
                  اختر اللاعب المراد تقييمه:
                </label>
                <select
                  value={selectedPlayerId}
                  onChange={e => setSelectedPlayerId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFF',
                    fontSize: '0.95rem'
                  }}
                >
                  <option value="" style={{ color: '#000' }}>-- اختر لاعباً --</option>
                  {players.map(p => (
                    <option key={p.id} value={p.id} style={{ color: '#000' }}>
                      {p.name} ({p.sport} - {p.group})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#00E676', marginBottom: '4px', fontWeight: 800 }}>
                    ⚽ التكنيك والتحكم ({evalData.technical}/5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={evalData.technical}
                    onChange={e => setEvalData({ ...evalData, technical: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#FFC107', marginBottom: '4px', fontWeight: 800 }}>
                    🧠 التكتيك والذكاء ({evalData.tactical}/5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={evalData.tactical}
                    onChange={e => setEvalData({ ...evalData, tactical: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.82rem', color: '#00E5FF', marginBottom: '4px', fontWeight: 800 }}>
                    ⭐ الانضباط والسرعة ({evalData.discipline}/5)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.5"
                    value={evalData.discipline}
                    onChange={e => setEvalData({ ...evalData, discipline: e.target.value })}
                    style={{ width: '100%' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#B0BEC5', marginBottom: '6px', fontWeight: 700 }}>
                  ملاحظات المدرب والتوصيات:
                </label>
                <textarea
                  rows="3"
                  value={evalData.notes}
                  onChange={e => setEvalData({ ...evalData, notes: e.target.value })}
                  placeholder="ملاحظات تفصيلية لولي الأمر..."
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFF',
                    fontSize: '0.9rem',
                    fontFamily: 'inherit',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #FFC107 0%, #FF9500 100%)',
                  border: 'none',
                  color: '#000',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  cursor: 'pointer'
                }}
              >
                💾 حفظ وتأكيد التقييم للاعب
              </button>
            </form>
          </div>
        )}

        {/* TAB 3: ROSTER */}
        {activeTab === 'roster' && (
          <div style={{ background: 'rgba(20, 26, 38, 0.8)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '22px', padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', color: '#00E5FF', fontWeight: 900, marginBottom: '16px' }}>
              👥 قائمة لاعبي الكابتن
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {players.map(p => (
                <div
                  key={p.id}
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '16px',
                    padding: '16px',
                    textAlign: 'center'
                  }}
                >
                  <img
                    src={p.photoUrl || p.photourl || 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=120&auto=format&fit=crop&q=80'}
                    alt={p.name}
                    style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #00E5FF', margin: '0 auto 8px auto' }}
                  />
                  <div style={{ fontWeight: 900, fontSize: '0.98rem' }}>{p.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#00E5FF', fontWeight: 700 }}>{p.sport} • {p.group}</div>
                  <div style={{ fontSize: '0.75rem', color: '#B0BEC5', marginTop: '6px' }}>ولي الأمر: {p.parentName || 'مسجل بالنظام'}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
