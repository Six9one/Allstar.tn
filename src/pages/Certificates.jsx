import { useState } from 'react'
import { db } from '../services/db'

export default function Certificates() {
  const [certData, setCertData] = useState({
    childName: 'يوسف المنصوري',
    sport: 'Football ⚽',
    award: 'بطولة',
    date: new Date().toLocaleDateString('ar-TN', { year: 'numeric', month: 'long', day: 'numeric' })
  })

  const [savedMsg, setSavedMsg] = useState(false)

  const handlePrint = () => {
    window.print()
  }

  const handleSaveCertificate = () => {
    db.saveRegistration({
      type: 'Certificate',
      ...certData
    })
    setSavedMsg(true)
    setTimeout(() => setSavedMsg(false), 3000)
  }

  const cardStyle = {
    background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '26px',
    padding: '24px',
    marginBottom: '20px'
  }

  const inputStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,193,7,0.3)',
    color: '#FFFFFF',
    marginBottom: '16px',
    outline: 'none',
    fontFamily: 'inherit'
  }

  const labelStyle = {
    display: 'block',
    marginBottom: '8px',
    color: '#8E9BAE',
    fontSize: '0.9rem',
    fontWeight: '700'
  }

  const btnStarStyle = {
    background: 'linear-gradient(135deg, #FFC107, #FF9500)',
    color: '#08090C',
    fontWeight: '900',
    borderRadius: '9999px',
    padding: '14px 20px',
    border: 'none',
    cursor: 'pointer',
    flex: 1,
    fontFamily: 'inherit'
  }

  const btnOutlineStyle = {
    background: 'transparent',
    color: '#FFC107',
    fontWeight: '900',
    borderRadius: '9999px',
    padding: '14px 20px',
    border: '1px solid #FFC107',
    cursor: 'pointer',
    flex: 1,
    fontFamily: 'inherit'
  }

  return (
    <div style={{ 
      paddingTop: '95px', 
      paddingBottom: '80px', 
      maxWidth: '480px', 
      margin: '0 auto', 
      paddingLeft: '16px', 
      paddingRight: '16px',
      direction: 'rtl',
      color: '#FFFFFF',
      fontFamily: 'Cairo, Tajawal, sans-serif'
    }}>
      
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '2rem', color: '#FFC107', margin: '0 0 8px 0', fontWeight: '900' }}>
          شهادات التفوق
        </h1>
        <p style={{ color: '#8E9BAE', margin: 0, fontSize: '1rem' }}>
          سجل إنجازاتك مع أولستار (Hall of Champions)
        </p>
      </div>

      {/* Stats Banner */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '20px',
        padding: '16px',
        marginBottom: '24px',
        textAlign: 'center'
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#FFC107', fontWeight: '900', fontSize: '1.2rem' }}>45</div>
          <div style={{ color: '#5A677B', fontSize: '0.8rem' }}>إجمالي الشهادات</div>
        </div>
        <div style={{ flex: 1, borderRight: '1px solid rgba(255,255,255,0.08)', borderLeft: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ color: '#00E676', fontWeight: '900', fontSize: '1.2rem' }}>3</div>
          <div style={{ color: '#5A677B', fontSize: '0.8rem' }}>مواسم</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#00E5FF', fontWeight: '900', fontSize: '1.2rem' }}>12</div>
          <div style={{ color: '#5A677B', fontSize: '0.8rem' }}>بطولة</div>
        </div>
      </div>

      {/* Certificate Generator Card */}
      <div style={{ ...cardStyle, border: '1px solid rgba(255,193,7,0.3)' }} className="no-print">
        <h2 style={{ fontSize: '1.2rem', color: '#FFFFFF', marginBottom: '20px', marginTop: '0', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.4rem' }}>🏅</span> إنشاء شهادة جديدة
        </h2>
        
        <div>
          <label style={labelStyle}>اسم اللاعب</label>
          <input
            type="text"
            value={certData.childName}
            onChange={e => setCertData({ ...certData, childName: e.target.value })}
            style={inputStyle}
          />

          <label style={labelStyle}>نوع الشهادة</label>
          <select
            value={certData.award}
            onChange={e => setCertData({ ...certData, award: e.target.value })}
            style={inputStyle}
          >
            <option value="بطولة">بطولة 🏆</option>
            <option value="تميز">تميز ⭐</option>
            <option value="مواظبة">مواظبة 📅</option>
            <option value="اجتهاد">اجتهاد 🚀</option>
          </select>

          <label style={labelStyle}>الرياضة</label>
          <select
            value={certData.sport}
            onChange={e => setCertData({ ...certData, sport: e.target.value })}
            style={inputStyle}
          >
            <option value="Football ⚽">Football ⚽</option>
            <option value="Basketball 🏀">Basketball 🏀</option>
            <option value="Handball 🤾">Handball 🤾</option>
          </select>

          <label style={labelStyle}>التاريخ</label>
          <input
            type="text"
            value={certData.date}
            onChange={e => setCertData({ ...certData, date: e.target.value })}
            style={inputStyle}
          />
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button onClick={handlePrint} style={btnStarStyle}>
            طباعة الشهادة 🖨️
          </button>
          <button onClick={handleSaveCertificate} style={btnOutlineStyle}>
            حفظ في السجل 💾
          </button>
        </div>
        
        {savedMsg && (
          <div style={{ marginTop: '16px', color: '#00E676', textAlign: 'center', fontSize: '0.9rem', fontWeight: 'bold' }}>
            ✅ تم الحفظ بنجاح!
          </div>
        )}
      </div>

      {/* Live Certificate Preview */}
      <h3 style={{ fontSize: '1.1rem', color: '#8E9BAE', marginBottom: '16px', marginTop: '32px' }} className="no-print">
        المعاينة المباشرة 👀
      </h3>
      
      <div className="printable-cert" style={{
        background: 'linear-gradient(135deg, #1A1F2C 0%, #0A0D14 100%)',
        border: '4px double #FFC107',
        borderRadius: '16px',
        padding: '32px 24px',
        textAlign: 'center',
        boxShadow: '0 8px 32px rgba(255, 193, 7, 0.15)',
        position: 'relative',
        marginBottom: '40px'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏅</div>
        <h2 style={{ fontSize: '1.2rem', color: '#FFC107', fontWeight: '900', margin: '0 0 4px 0' }}>
          أكاديمية أولستار الرياضية
        </h2>
        <div style={{ fontSize: '0.8rem', color: '#8E9BAE', marginBottom: '24px' }}>
          Tataouine, Tunisia
        </div>

        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#FFFFFF', marginBottom: '16px' }}>
          نشهد بأن
        </div>

        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#FFC107', margin: '16px 0', textShadow: '0 2px 10px rgba(255,193,7,0.3)' }}>
          {certData.childName || 'اسم اللاعب'}
        </div>

        <p style={{ color: '#8E9BAE', fontSize: '0.95rem', margin: '0 auto 20px', lineHeight: '1.6' }}>
          قد استحق هذه الشهادة تقديراً لجهوده في <strong>{certData.sport}</strong> وتمنح له شهادة:
        </p>

        <div style={{ 
          background: 'rgba(255,193,7,0.1)', 
          border: '1px solid rgba(255,193,7,0.5)', 
          color: '#FFC107', 
          padding: '8px 24px', 
          borderRadius: '30px', 
          fontWeight: '900', 
          fontSize: '1.1rem', 
          display: 'inline-block',
          marginBottom: '32px' 
        }}>
          {certData.award}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed rgba(255,255,255,0.1)', paddingTop: '16px', fontSize: '0.8rem', color: '#5A677B' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold' }}>توقيع المدرب</div>
            <div>✍️</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: '#FFC107' }}>{certData.date}</div>
          </div>
          <div style={{ textAlign: 'left' }}>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold' }}>إدارة الأكاديمية</div>
            <div>✍️</div>
          </div>
        </div>
      </div>

      {/* Medal Showcase Gallery */}
      <div className="no-print">
        <h2 style={{ fontSize: '1.3rem', color: '#FFFFFF', marginBottom: '16px' }}>
          قاعة الأبطال 🏆
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Mini Card 1 */}
          <div style={{ ...cardStyle, padding: '16px', marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🥇</div>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.9rem' }}>أحمد بن علي</div>
            <div style={{ color: '#FFC107', fontSize: '0.8rem' }}>Football ⚽</div>
            <div style={{ color: '#8E9BAE', fontSize: '0.75rem', marginTop: '4px' }}>بطولة التميز</div>
          </div>
          {/* Mini Card 2 */}
          <div style={{ ...cardStyle, padding: '16px', marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏀</div>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.9rem' }}>ياسين مبارك</div>
            <div style={{ color: '#FF9500', fontSize: '0.8rem' }}>Basketball 🏀</div>
            <div style={{ color: '#8E9BAE', fontSize: '0.75rem', marginTop: '4px' }}>أفضل لاعب</div>
          </div>
          {/* Mini Card 3 */}
          <div style={{ ...cardStyle, padding: '16px', marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🤾‍♂️</div>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.9rem' }}>سامي العيادي</div>
            <div style={{ color: '#00E676', fontSize: '0.8rem' }}>Handball 🤾</div>
            <div style={{ color: '#8E9BAE', fontSize: '0.75rem', marginTop: '4px' }}>المواظبة</div>
          </div>
          {/* Mini Card 4 */}
          <div style={{ ...cardStyle, padding: '16px', marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🌟</div>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.9rem' }}>عمر الفاروق</div>
            <div style={{ color: '#00E5FF', fontSize: '0.8rem' }}>Football ⚽</div>
            <div style={{ color: '#8E9BAE', fontSize: '0.75rem', marginTop: '4px' }}>هداف الدورة</div>
          </div>
          {/* Mini Card 5 */}
          <div style={{ ...cardStyle, padding: '16px', marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🏅</div>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.9rem' }}>ريان سعيد</div>
            <div style={{ color: '#FF3D00', fontSize: '0.8rem' }}>Basketball 🏀</div>
            <div style={{ color: '#8E9BAE', fontSize: '0.75rem', marginTop: '4px' }}>الروح الرياضية</div>
          </div>
          {/* Mini Card 6 */}
          <div style={{ ...cardStyle, padding: '16px', marginBottom: 0, textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎯</div>
            <div style={{ color: '#FFFFFF', fontWeight: 'bold', fontSize: '0.9rem' }}>كريم محمود</div>
            <div style={{ color: '#FFC107', fontSize: '0.8rem' }}>Football ⚽</div>
            <div style={{ color: '#8E9BAE', fontSize: '0.75rem', marginTop: '4px' }}>أفضل صانع ألعاب</div>
          </div>
        </div>
      </div>

      <style>{`
        @media print {
          body { background: #FFFFFF !important; color: #000000 !important; }
          .no-print, header, footer, nav { display: none !important; }
          .printable-cert { 
            border: 6px double #0D47A1 !important; 
            background: #FFFFFF !important; 
            color: #000000 !important; 
            box-shadow: none !important;
            margin: 0 !important;
            padding: 40px !important;
          }
          .printable-cert h2, .printable-cert div, .printable-cert p { 
            color: #000000 !important; 
            text-shadow: none !important;
          }
        }
      `}</style>
    </div>
  )
}
