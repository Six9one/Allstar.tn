import React, { useState } from 'react';

export default function Feedback() {
  const [overallRating, setOverallRating] = useState(0);
  const [categoryRatings, setCategoryRatings] = useState({
    training: 0,
    facilities: 0,
    schedule: 0,
    value: 0
  });
  const [role, setRole] = useState('');
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const categories = [
    { id: 'training', label: '🏅 جودة التدريب (Training Quality)' },
    { id: 'facilities', label: '🏗️ المرافق والملاعب (Facilities)' },
    { id: 'schedule', label: '⏰ تنظيم المواعيد (Schedule Organization)' },
    { id: 'value', label: '💰 السعر مقابل القيمة (Value for Money)' },
  ];

  const roles = [
    { id: 'player', label: '🏅 لاعب' },
    { id: 'parent', label: '👨‍🦳 ولي أمر' },
    { id: 'alumni', label: '🏆 خريج (Alumni)' }
  ];

  const recentReviews = [
    { name: 'ياسين الماجري', role: 'ولي أمر', stars: 5, text: 'أكاديمية رائعة، ابني تطور بشكل ملحوظ في كرة القدم!', date: 'منذ يومين' },
    { name: 'محمد علي', role: 'لاعب', stars: 4, text: 'المرافق ممتازة والمدربين محترفين جداً.', date: 'منذ أسبوع' },
    { name: 'أحمد طارق', role: 'خريج', stars: 5, text: 'أفضل تجربة رياضية في تطاوين، شكراً لكم على كل شيء.', date: 'منذ شهر' },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setOverallRating(0);
      setCategoryRatings({ training: 0, facilities: 0, schedule: 0, value: 0 });
      setRole('');
      setComment('');
    }, 4000);
  };

  const renderStars = (currentRating, onClick, size = '24px') => (
    <div style={{ display: 'flex', gap: '8px', direction: 'ltr' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span
          key={star}
          onClick={() => onClick && onClick(star)}
          style={{
            cursor: onClick ? 'pointer' : 'default',
            fontSize: size,
            color: star <= currentRating ? '#FFC107' : 'rgba(255,255,255,0.2)',
            transition: 'color 0.2s, transform 0.2s',
            transform: star <= currentRating ? 'scale(1.1)' : 'scale(1)'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );

  return (
    <div style={{ 
      backgroundColor: '#08090C', 
      minHeight: '100vh', 
      paddingBottom: '40px',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      color: '#FFFFFF'
    }}>
      <div style={{ 
        maxWidth: '480px', 
        margin: '0 auto', 
        paddingTop: '95px', 
        paddingLeft: '16px', 
        paddingRight: '16px', 
        direction: 'rtl' 
      }}>
        
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 className="section-title text-yellow" style={{ fontSize: '28px', fontWeight: '900', marginBottom: '8px', margin: 0 }}>
            آراؤكم تهمنا
          </h1>
          <h2 className="section-subtitle" style={{ color: '#8E9BAE', fontSize: '16px', margin: 0 }}>
            ساعدنا على التحسين المستمر
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="sleek-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '32px' }}>
          
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontWeight: '700', marginBottom: '12px', fontSize: '18px' }}>كيف تقيّم تجربتك عمومًا؟</p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              {renderStars(overallRating, setOverallRating, '40px')}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {categories.map((cat) => (
              <div key={cat.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ color: '#E2E8F0', fontSize: '15px' }}>{cat.label}</span>
                {renderStars(categoryRatings[cat.id], (val) => setCategoryRatings(prev => ({ ...prev, [cat.id]: val })))}
              </div>
            ))}
          </div>

          <div>
            <p style={{ fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>من أنت؟</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRole(r.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '9999px',
                    fontWeight: '700',
                    fontSize: '14px',
                    border: role === r.id ? 'none' : '1px solid rgba(255,255,255,0.2)',
                    background: role === r.id ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'transparent',
                    color: role === r.id ? '#08090C' : '#FFFFFF',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontWeight: '700', marginBottom: '12px', fontSize: '16px' }}>ملاحظات إضافية (Optional)</p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="اكتب ملاحظاتك هنا..."
              style={{
                width: '100%',
                minHeight: '120px',
                backgroundColor: 'rgba(25, 29, 42, 0.5)',
                border: isFocused ? '1px solid #FFC107' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '16px',
                padding: '16px',
                color: '#FFFFFF',
                outline: 'none',
                resize: 'none',
                fontFamily: 'inherit',
                transition: 'border 0.3s'
              }}
            />
          </div>

          {submitted ? (
            <div style={{
              background: 'linear-gradient(135deg, #00E676, #00BFA5)',
              color: '#08090C',
              padding: '16px',
              borderRadius: '9999px',
              textAlign: 'center',
              fontWeight: '900',
              fontSize: '18px',
              animation: 'fadeIn 0.5s ease-in-out'
            }}>
              🎉 شكرًا على رأيك!
            </div>
          ) : (
            <button
              type="submit"
              className="btn-star"
              style={{
                width: '100%',
                padding: '16px',
                fontSize: '18px',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              إرسال التقييم ⭐
            </button>
          )}
        </form>

        <div>
          <h3 style={{ fontSize: '20px', fontWeight: '900', marginBottom: '16px', color: '#FFC107' }}>
            آراء الأسر الرياضية
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {recentReviews.map((rev, idx) => (
              <div key={idx} className="sleek-card" style={{ padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontWeight: '700', fontSize: '16px' }}>{rev.name}</span>
                    <span className="star-badge" style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', color: '#8E9BAE' }}>
                      {rev.role}
                    </span>
                  </div>
                  <span style={{ fontSize: '12px', color: '#5A677B' }}>{rev.date}</span>
                </div>
                {renderStars(rev.stars, null, '16px')}
                <p style={{ marginTop: '12px', color: '#E2E8F0', fontSize: '14px', lineHeight: '1.6' }}>
                  "{rev.text}"
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
