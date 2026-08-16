import React, { useState } from 'react';

const Drills = () => {
  const [selectedSport, setSelectedSport] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const sports = [
    { id: 'All', label: 'الكل' },
    { id: 'Football', label: '⚽' },
    { id: 'Basketball', label: '🏀' },
    { id: 'Handball', label: '🤾' },
  ];

  const difficulties = [
    { id: 'All', label: 'الكل' },
    { id: 'مبتدئ', label: 'مبتدئ' },
    { id: 'متوسط', label: 'متوسط' },
    { id: 'متقدم', label: 'متقدم' },
  ];

  const drillsList = [
    { id: 1, sport: 'Football', emoji: '⚽', name: 'التحكم بالكرة', duration: '15 دقيقة', difficulty: 'مبتدئ', color: '#00E676', desc: 'تمارين أساسية لتحسين السيطرة على الكرة في المساحات الضيقة.' },
    { id: 2, sport: 'Football', emoji: '⚽', name: 'التمرير سريع', duration: '20 دقيقة', difficulty: 'متوسط', color: '#FFC107', desc: 'تطوير دقة وسرعة التمرير تحت الضغط.' },
    { id: 3, sport: 'Football', emoji: '⚽', name: 'التسديد من بعيد', duration: '25 دقيقة', difficulty: 'متقدم', color: '#FF3D00', desc: 'تدريبات لزيادة قوة ودقة التسديدات من خارج منطقة الجزاء.' },
    
    { id: 4, sport: 'Basketball', emoji: '🏀', name: 'الدرببلة السريعة', duration: '10 دقائق', difficulty: 'مبتدئ', color: '#00E676', desc: 'أساسيات التحكم بالكرة والمراوغة السريعة.' },
    { id: 5, sport: 'Basketball', emoji: '🏀', name: 'التصويب من الخط', duration: '20 دقيقة', difficulty: 'متوسط', color: '#FFC107', desc: 'تحسين نسبة النجاح في الرميات الحرة.' },
    { id: 6, sport: 'Basketball', emoji: '🏀', name: 'الدفاع المنطقي', duration: '30 دقيقة', difficulty: 'متقدم', color: '#FF3D00', desc: 'استراتيجيات الدفاع المتقدمة وتمركز اللاعبين.' },
    
    { id: 7, sport: 'Handball', emoji: '🤾', name: 'الرمي القوي', duration: '15 دقيقة', difficulty: 'مبتدئ', color: '#00E676', desc: 'تمارين لزيادة قوة الرمي وتقوية العضلات الأساسية.' },
    { id: 8, sport: 'Handball', emoji: '🤾', name: 'المناورة', duration: '20 دقيقة', difficulty: 'متوسط', color: '#FFC107', desc: 'تقنيات التمويه واختراق دفاع الخصم.' },
    { id: 9, sport: 'Handball', emoji: '🤾', name: 'حراسة المرمى', duration: '30 دقيقة', difficulty: 'متقدم', color: '#FF3D00', desc: 'تدريبات مكثفة لردود الفعل السريعة للحراس.' },
  ];

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'مبتدئ': return '#00E676';
      case 'متوسط': return '#FFC107';
      case 'متقدم': return '#FF3D00';
      default: return '#8E9BAE';
    }
  };

  const filteredDrills = drillsList.filter(drill => {
    const matchSport = selectedSport === 'All' || drill.sport === selectedSport;
    const matchDiff = selectedDifficulty === 'All' || drill.difficulty === selectedDifficulty;
    return matchSport && matchDiff;
  });

  const featuredDrill = drillsList[1]; // Just picking one as featured

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
        
        {/* Header Section */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '900', color: '#FFC107', margin: '0 0 8px 0', textShadow: '0 2px 10px rgba(255,193,7,0.2)' }}>
            مكتبة التدريبات
          </h1>
          <p style={{ color: '#8E9BAE', fontSize: '14px', margin: 0 }}>
            تمارين مختارة لكل رياضة ومستوى (Drills Library)
          </p>
        </div>

        {/* Featured Drill */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '26px',
          padding: '20px',
          marginBottom: '24px',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{ position: 'absolute', top: '-10px', left: '-10px', fontSize: '80px', opacity: '0.1' }}>
            {featuredDrill.emoji}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ background: 'rgba(255,193,7,0.15)', color: '#FFC107', padding: '4px 12px', borderRadius: '999px', fontSize: '12px', fontWeight: 'bold' }}>
              🌟 تمرين اليوم
            </span>
            <span style={{ background: `rgba(255,255,255,0.1)`, padding: '4px 12px', borderRadius: '999px', fontSize: '12px', color: '#FFF' }}>
              {featuredDrill.emoji} {featuredDrill.sport === 'Football' ? 'كرة القدم' : featuredDrill.sport === 'Basketball' ? 'كرة السلة' : 'كرة اليد'}
            </span>
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 'bold', marginBottom: '8px', zIndex: 1, position: 'relative' }}>
            {featuredDrill.name}
          </h2>
          <p style={{ color: '#8E9BAE', fontSize: '13px', lineHeight: '1.6', marginBottom: '16px', zIndex: 1, position: 'relative' }}>
            {featuredDrill.desc}
          </p>
          <div style={{ display: 'flex', gap: '8px', zIndex: 1, position: 'relative' }}>
            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px', color: '#00E5FF' }}>
              ⏱️ {featuredDrill.duration}
            </span>
            <span style={{ fontSize: '12px', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '12px', color: getDifficultyColor(featuredDrill.difficulty) }}>
              📊 {featuredDrill.difficulty}
            </span>
          </div>
        </div>

        {/* Filters */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '8px', marginBottom: '12px', overflowX: 'auto', paddingBottom: '4px' }}>
            {sports.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSport(s.id)}
                style={{
                  background: selectedSport === s.id ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'rgba(25,29,42,0.8)',
                  color: selectedSport === s.id ? '#08090C' : '#FFFFFF',
                  border: selectedSport === s.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '999px',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {difficulties.map(d => (
              <button
                key={d.id}
                onClick={() => setSelectedDifficulty(d.id)}
                style={{
                  background: selectedDifficulty === d.id ? 'rgba(255,255,255,0.15)' : 'transparent',
                  color: selectedDifficulty === d.id ? '#FFFFFF' : '#8E9BAE',
                  border: '1px solid',
                  borderColor: selectedDifficulty === d.id ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.05)',
                  borderRadius: '999px',
                  padding: '6px 14px',
                  fontSize: '13px',
                  fontWeight: '600',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drills Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
          {filteredDrills.length > 0 ? filteredDrills.map((drill) => (
            <div key={drill.id} style={{
              background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRight: `4px solid ${getDifficultyColor(drill.difficulty)}`,
              borderRadius: '20px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '24px', background: 'rgba(255,255,255,0.05)', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px' }}>
                    {drill.emoji}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 'bold' }}>{drill.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', fontSize: '11px' }}>
                      <span style={{ color: '#00E5FF' }}>⏱️ {drill.duration}</span>
                      <span style={{ color: '#5A677B' }}>•</span>
                      <span style={{ color: getDifficultyColor(drill.difficulty) }}>{drill.difficulty}</span>
                    </div>
                  </div>
                </div>
              </div>
              <button style={{
                background: 'linear-gradient(135deg, rgba(255,193,7,0.1), rgba(255,149,0,0.1))',
                color: '#FFC107',
                border: '1px solid rgba(255,193,7,0.2)',
                borderRadius: '999px',
                padding: '8px',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
                width: '100%',
                transition: 'all 0.2s ease'
              }}>
                بدء التمرين
              </button>
            </div>
          )) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#5A677B' }}>
              لا توجد تمارين تطابق بحثك حالياً.
            </div>
          )}
        </div>

        {/* Coach Assign Section */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
          border: '1px dashed rgba(255,255,255,0.2)',
          borderRadius: '26px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: '#FFFFFF', marginBottom: '8px' }}>
            تخصيص تمرين لمجموعة
          </h3>
          <p style={{ color: '#8E9BAE', fontSize: '13px', marginBottom: '16px' }}>
            خاص بالمدربين: حدد التمرين والمجموعة لإرسال الإشعار
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <select style={{
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFF',
              padding: '12px',
              borderRadius: '12px',
              outline: 'none',
              fontFamily: 'inherit',
              direction: 'rtl'
            }}>
              <option value="">اختر المجموعة...</option>
              <option value="u12">فريق تحت 12 سنة</option>
              <option value="u15">فريق تحت 15 سنة</option>
              <option value="seniors">الفريق الأول</option>
            </select>
            <button style={{
              background: 'linear-gradient(135deg, #FFC107, #FF9500)',
              color: '#08090C',
              border: 'none',
              borderRadius: '9999px',
              padding: '12px',
              fontSize: '15px',
              fontWeight: '900',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>إرسال التخصيص</span>
              <span>✅</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Drills;
