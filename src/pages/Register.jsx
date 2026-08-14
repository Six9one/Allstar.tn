import { useState } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../services/db'
import { notificationService } from '../services/notifications'

export default function Register() {
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    relation: 'أب',
    childName: '',
    childBirth: '',
    childAge: '10',
    gender: 'ذكر',
    schoolName: '',
    grade: '',
    medicalNotes: '',
    selectedSports: ['football'],
    preferredTime: 'مسائي',
    acceptTerms: false
  })
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  const handleSportToggle = (sportId) => {
    setFormData(prev => {
      const exists = prev.selectedSports.includes(sportId)
      if (exists) {
        if (prev.selectedSports.length === 1) return prev
        return { ...prev, selectedSports: prev.selectedSports.filter(s => s !== sportId) }
      } else {
        return { ...prev, selectedSports: [...prev.selectedSports, sportId] }
      }
    })
  }

  const validateStep = () => {
    const newErrors = {}
    if (step === 1) {
      if (!formData.parentName.trim()) newErrors.parentName = 'يرجى إدخال اسم الولي الكامل'
      const cleanPhone = formData.parentPhone.replace(/\D/g, '')
      if (!cleanPhone || cleanPhone.length < 8) {
        newErrors.parentPhone = 'يرجى إدخال رقم هاتف تونسي صالح (8 أرقام تبدأ بـ 2, 4, 5, 9)'
      }
      if (formData.parentEmail && !formData.parentEmail.includes('@')) {
        newErrors.parentEmail = 'يرجى إدخال بريد إلكتروني صحيح'
      }
    } else if (step === 2) {
      if (!formData.childName.trim()) newErrors.childName = 'يرجى إدخال اسم الطفل الثلاثي'
      if (!formData.grade.trim()) newErrors.grade = 'يرجى إدخال المستوى الدراسي'
    } else if (step === 4) {
      if (!formData.acceptTerms) newErrors.acceptTerms = 'يجب الموافقة على الشروط والأحكام الخاصة بالأكاديمية'
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(prev => prev + 1)
    }
  }

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateStep()) return
    await db.saveRegistration(formData)
    notificationService.sendLocalNotification(
      `📝 تسجيل جديد: ${formData.childName}`,
      `تم استلام طلب تسجيل ${formData.childName} في الأكاديمية بنجاح.`
    )
    setSubmitted(true)
  }

  const getWhatsAppUrl = () => {
    const sportsText = formData.selectedSports.join(', ')
    const msg = `*طلب تسجيل جديد - أكاديمية أولستار بتطاوين 🇹🇳*%0A%0A` +
      `👤 *الولي:* ${formData.parentName} (${formData.relation})%0A` +
      `📞 *الهاتف:* ${formData.parentPhone}%0A` +
      `📧 *البريد:* ${formData.parentEmail || 'غير محدد'}%0A` +
      `👶 *اسم الطفل:* ${formData.childName} (${formData.gender} - ${formData.childAge} سنة)%0A` +
      `🏫 *المستوى الدراسي:* ${formData.grade}%0A` +
      `⚽ *الرياضات:* ${sportsText}%0A` +
      `⏰ *التوقيت المفضل:* ${formData.preferredTime}%0A` +
      `📝 *ملاحظات صحية:* ${formData.medicalNotes || 'لا توجد'}`
    
    return `https://wa.me/21658263467?text=${msg}`
  }

  const steps = [
    { num: 1, label: 'بيانات ولي الأمر' },
    { num: 2, label: 'بيانات الطفل' },
    { num: 3, label: 'اختيار الرياضة' },
    { num: 4, label: 'تأكيد التسجيل' }
  ]

  const inputStyle = (error) => ({
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.05)',
    border: error ? '1px solid #FF3D00' : '1px solid rgba(255,255,255,0.1)',
    color: '#FFFFFF',
    fontSize: '1rem',
    outline: 'none',
    transition: 'border-color 0.3s ease'
  })

  return (
    <div style={{ paddingTop: '95px', paddingBottom: '60px', background: '#08090C', minHeight: '100vh', direction: 'rtl' }}>
      <div className="container" style={{ maxWidth: '480px', margin: '0 auto', padding: '0 16px' }}>

        {/* Page Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, marginBottom: '8px', color: '#FFFFFF' }}>
            انضم لعائلة الأكاديمية 🌟
          </h1>
          <p style={{ color: '#8E9BAE', fontSize: '0.9rem' }}>
            Join the Academy Family
          </p>
        </div>

        {/* Multi-Step Progress Header */}
        {!submitted && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '40px',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              top: '12px',
              right: '20px',
              left: '20px',
              height: '2px',
              background: 'rgba(255,255,255,0.1)',
              zIndex: 1
            }}>
              <div style={{
                height: '100%',
                background: '#FFC107',
                width: `${((step - 1) / 3) * 100}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>

            {steps.map((s) => (
              <div key={s.num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 2 }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: step >= s.num ? '#FFC107' : '#191D2A',
                  color: step >= s.num ? '#08090C' : '#5A677B',
                  fontSize: '0.8rem',
                  fontWeight: 900,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: step === s.num ? '2px solid #FFC107' : '2px solid rgba(255,255,255,0.1)',
                  boxShadow: step === s.num ? '0 0 10px rgba(255,193,7,0.4)' : 'none',
                  transition: 'all 0.3s ease'
                }}>
                  {s.num}
                </div>
                <div style={{ fontSize: '0.7rem', marginTop: '8px', color: step >= s.num ? '#FFFFFF' : '#5A677B', fontWeight: 700, textAlign: 'center' }}>
                  {s.label.split(' ').map((word, i) => <div key={i}>{word}</div>)}
                </div>
              </div>
            ))}
          </div>
        )}

        {submitted ? (
          <div className="sleek-card" style={{ 
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '26px',
            padding: '40px 24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '16px' }}>🎉</div>
            <h2 style={{ color: '#FFC107', fontSize: '1.5rem', marginBottom: '12px', fontWeight: 900 }}>تم التسجيل بنجاح!</h2>
            <p style={{ color: '#8E9BAE', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '30px' }}>
              تم تجهيز بياناتك بنجاح. يرجى إرسالها عبر الواتساب لتأكيد التسجيل مع الإدارة.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noreferrer"
                style={{ 
                  background: '#00E676', 
                  color: '#08090C', 
                  padding: '16px', 
                  borderRadius: '9999px',
                  fontWeight: 900,
                  textDecoration: 'none',
                  display: 'block',
                  fontSize: '1rem'
                }}
              >
                إرسال عبر الواتساب 💬
              </a>
              <Link to="/" style={{ 
                color: '#FFFFFF', 
                padding: '16px', 
                textDecoration: 'none',
                fontSize: '0.95rem',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9999px'
              }}>
                العودة للرئيسية 🏠
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="sleek-card" style={{ 
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '26px',
            padding: '30px 20px'
          }}>

            {/* STEP 1: PARENT INFO */}
            {step === 1 && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <h3 style={{ color: '#FFC107', marginBottom: '24px', fontSize: '1.2rem', fontWeight: 900 }}>👤 بيانات ولي الأمر</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>اسم ولي الأمر *</label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    placeholder="الاسم الكامل"
                    style={inputStyle(errors.parentName)}
                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                    onBlur={(e) => e.target.style.borderColor = errors.parentName ? '#FF3D00' : 'rgba(255,255,255,0.1)'}
                  />
                  {errors.parentName && <div style={{ color: '#FF3D00', fontSize: '0.8rem', marginTop: '6px' }}>{errors.parentName}</div>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>رقم الهاتف *</label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleChange}
                    placeholder="مثال: 50 123 456"
                    style={inputStyle(errors.parentPhone)}
                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                    onBlur={(e) => e.target.style.borderColor = errors.parentPhone ? '#FF3D00' : 'rgba(255,255,255,0.1)'}
                  />
                  {errors.parentPhone && <div style={{ color: '#FF3D00', fontSize: '0.8rem', marginTop: '6px' }}>{errors.parentPhone}</div>}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>البريد الإلكتروني</label>
                  <input
                    type="email"
                    name="parentEmail"
                    value={formData.parentEmail}
                    onChange={handleChange}
                    placeholder="البريد الإلكتروني (اختياري)"
                    style={inputStyle()}
                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                    onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                  />
                </div>
              </div>
            )}

            {/* STEP 2: CHILD INFO */}
            {step === 2 && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <h3 style={{ color: '#FFC107', marginBottom: '24px', fontSize: '1.2rem', fontWeight: 900 }}>👶 بيانات الطفل</h3>
                
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>اسم الطفل الكامل *</label>
                  <input
                    type="text"
                    name="childName"
                    value={formData.childName}
                    onChange={handleChange}
                    placeholder="الاسم واللقب"
                    style={inputStyle(errors.childName)}
                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                    onBlur={(e) => e.target.style.borderColor = errors.childName ? '#FF3D00' : 'rgba(255,255,255,0.1)'}
                  />
                  {errors.childName && <div style={{ color: '#FF3D00', fontSize: '0.8rem', marginTop: '6px' }}>{errors.childName}</div>}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>تاريخ الميلاد</label>
                    <input
                      type="date"
                      name="childBirth"
                      value={formData.childBirth}
                      onChange={handleChange}
                      style={inputStyle()}
                      onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>الجنس</label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      style={{...inputStyle(), WebkitAppearance: 'none'}}
                      onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                      onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
                    >
                      <option value="ذكر">ذكر 👦</option>
                      <option value="أنثى">أنثى 👧</option>
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '8px', fontWeight: 700, color: '#FFFFFF', fontSize: '0.9rem' }}>المستوى الدراسي *</label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    placeholder="مثال: سنة سادسة أساسي"
                    style={inputStyle(errors.grade)}
                    onFocus={(e) => e.target.style.borderColor = '#FFC107'}
                    onBlur={(e) => e.target.style.borderColor = errors.grade ? '#FF3D00' : 'rgba(255,255,255,0.1)'}
                  />
                  {errors.grade && <div style={{ color: '#FF3D00', fontSize: '0.8rem', marginTop: '6px' }}>{errors.grade}</div>}
                </div>
              </div>
            )}

            {/* STEP 3: SPORT SELECTION */}
            {step === 3 && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <h3 style={{ color: '#FFC107', marginBottom: '24px', fontSize: '1.2rem', fontWeight: 900 }}>🏅 اختيار الرياضة</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}>
                  
                  {[
                    { id: 'football', label: 'كرة القدم', en: 'Football', icon: '⚽', color: '#00E676' },
                    { id: 'basketball', label: 'كرة السلة', en: 'Basketball', icon: '🏀', color: '#FF9500' },
                    { id: 'handball', label: 'كرة اليد', en: 'Handball', icon: '🤾', color: '#00E5FF' }
                  ].map(sport => {
                    const isSelected = formData.selectedSports.includes(sport.id)
                    return (
                      <div
                        key={sport.id}
                        onClick={() => handleSportToggle(sport.id)}
                        style={{
                          padding: '20px',
                          borderRadius: '20px',
                          background: isSelected ? 'rgba(255,193,7,0.1)' : 'rgba(255,255,255,0.03)',
                          border: isSelected ? '2px solid #FFC107' : '1px solid rgba(255,255,255,0.1)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '16px',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <div style={{ fontSize: '2.5rem' }}>{sport.icon}</div>
                        <div>
                          <h4 style={{ color: isSelected ? '#FFC107' : '#FFFFFF', fontSize: '1.1rem', fontWeight: 900, marginBottom: '4px' }}>{sport.label}</h4>
                          <div style={{ fontSize: '0.85rem', color: '#5A677B' }}>{sport.en}</div>
                        </div>
                        {isSelected && (
                          <div style={{ marginRight: 'auto', background: '#FFC107', color: '#08090C', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>✓</div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & CONFIRM */}
            {step === 4 && (
              <div style={{ animation: 'fadeIn 0.4s ease' }}>
                <h3 style={{ color: '#FFC107', marginBottom: '20px', fontSize: '1.2rem', fontWeight: 900 }}>📝 تأكيد التسجيل</h3>
                
                <div style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.05)',
                  borderRadius: '16px', 
                  padding: '20px', 
                  marginBottom: '24px', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  gap: '12px',
                  color: '#8E9BAE',
                  fontSize: '0.95rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الولي:</span>
                    <strong style={{ color: '#FFFFFF' }}>{formData.parentName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الطفل:</span>
                    <strong style={{ color: '#FFFFFF' }}>{formData.childName}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>الرياضات:</span>
                    <strong style={{ color: '#FFC107' }}>
                      {formData.selectedSports.map(s => s === 'football' ? 'كرة القدم' : s === 'basketball' ? 'كرة السلة' : 'كرة اليد').join('، ')}
                    </strong>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', marginBottom: '20px' }}>
                  <input 
                    type="checkbox" 
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onChange={handleChange}
                    style={{ width: '20px', height: '20px', accentColor: '#FFC107' }} 
                  />
                  <span style={{ color: '#FFFFFF', fontSize: '0.9rem' }}>أوافق على الشروط والأحكام الخاصة بالأكاديمية</span>
                </label>
                {errors.acceptTerms && <div style={{ color: '#FF3D00', fontSize: '0.8rem', marginTop: '-12px', marginBottom: '20px' }}>{errors.acceptTerms}</div>}
              </div>
            )}

            {/* Form Nav Buttons */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              {step > 1 && (
                <button 
                  type="button" 
                  onClick={handlePrev} 
                  style={{ 
                    flex: 1,
                    padding: '16px',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    borderRadius: '9999px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}>
                  رجوع
                </button>
              )}

              {step < 4 ? (
                <button 
                  type="button" 
                  onClick={handleNext} 
                  style={{ 
                    flex: 2,
                    padding: '16px',
                    background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                    border: 'none',
                    color: '#08090C',
                    borderRadius: '9999px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}>
                  التالي
                </button>
              ) : (
                <button 
                  type="submit" 
                  style={{ 
                    flex: 2,
                    padding: '16px',
                    background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                    border: 'none',
                    color: '#08090C',
                    borderRadius: '9999px',
                    fontWeight: 900,
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}>
                  تأكيد وإرسال
                </button>
              )}
            </div>

          </form>
        )}

      </div>
    </div>
  )
}
