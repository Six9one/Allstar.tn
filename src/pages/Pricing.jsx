import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../services/db';

export default function Pricing(props) {
  const [isYearly, setIsYearly] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);
  const [sitePlans, setSitePlans] = useState([]);

  useEffect(() => {
    const content = db.getSiteContent();
    if (content.pricing_plans && content.pricing_plans.length > 0) {
      setSitePlans(content.pricing_plans);
    }
  }, []);

  const getPrice = (amt) => {
    const base = typeof amt === 'number' ? amt : parseInt(amt) || 80;
    return isYearly ? Math.round(base * 10) : base;
  };

  const getPeriodText = () => isYearly ? 'سنة' : 'شهر';

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('d17'); // d17 | flouci | konnect | cash
  const [phoneInput, setPhoneInput] = useState('');
  const [receiptSuccess, setReceiptSuccess] = useState(null);

  const handleOpenCheckout = (planName, amount) => {
    setSelectedPlan({ name: planName, amount: getPrice(amount) });
    setShowCheckoutModal(true);
  };

  const handleProcessPayment = (e) => {
    e.preventDefault();
    const txnId = `PAY-${paymentMethod.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const receipt = {
      txnId,
      plan: selectedPlan.name,
      amount: selectedPlan.amount,
      method: paymentMethod,
      date: new Date().toLocaleDateString('fr-FR'),
      time: new Date().toLocaleTimeString('fr-FR')
    };
    setReceiptSuccess(receipt);
  };

  return (
    <div style={{ backgroundColor: '#08090C', minHeight: '100vh', direction: 'rtl', fontFamily: "'Cairo', 'Tajawal', sans-serif", color: '#FFFFFF', paddingBottom: '40px' }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', paddingTop: '16px', paddingLeft: '16px', paddingRight: '16px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 className="section-title" style={{ fontSize: '28px', fontWeight: '800', margin: '0 0 8px 0', color: '#FFFFFF' }}>
            اشتراكاتنا
          </h1>
          <p className="section-subtitle" style={{ color: '#8E9BAE', fontSize: '15px', margin: 0 }}>
            اختر الباقة المناسبة لطفلك والدفع الإلكتروني المباشر في تونس 🇹🇳
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
          <div style={{ 
            background: 'rgba(25,29,42,0.95)', 
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '9999px',
            display: 'flex',
            padding: '4px'
          }}>
            <button 
              onClick={() => setIsYearly(false)}
              style={{
                padding: '8px 24px',
                borderRadius: '9999px',
                border: 'none',
                background: !isYearly ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'transparent',
                color: !isYearly ? '#08090C' : '#8E9BAE',
                fontWeight: !isYearly ? '800' : '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              شهري
            </button>
            <button 
              onClick={() => setIsYearly(true)}
              style={{
                padding: '8px 24px',
                borderRadius: '9999px',
                border: 'none',
                background: isYearly ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'transparent',
                color: isYearly ? '#08090C' : '#8E9BAE',
                fontWeight: isYearly ? '800' : '600',
                fontSize: '14px',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              سنوي (خصم 20%)
            </button>
          </div>
        </div>

        {/* Plans */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', marginBottom: '40px' }}>
          
          {/* BASIC */}
          <div className="sleek-card" style={{
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '26px',
            padding: '24px',
            position: 'relative'
          }}>
            <span className="star-badge" style={{ background: 'rgba(255,255,255,0.1)', color: '#FFFFFF', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold' }}>
              BASIC (أساسي)
            </span>
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <span style={{ fontSize: '44px', fontWeight: '900', color: '#FFFFFF' }}>{getPrice(80)}</span>
              <span style={{ fontSize: '16px', color: '#8E9BAE', marginLeft: '4px' }}>DT / {getPeriodText()}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>رياضة واحدة</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>3 حصص في الأسبوع</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#5A677B', fontSize: '15px' }}><span>❌</span> <span>بدون زي رياضي مجاني</span></li>
            </ul>
            <button
              onClick={() => handleOpenCheckout('BASIC (أساسي)', 80)}
              className="btn-outline" style={{
                width: '100%', padding: '14px', borderRadius: '9999px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#FFFFFF', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
              }}
            >
              ادفع الآن عبر D17 / Flouci 💳
            </button>
          </div>

          {/* STANDARD */}
          <div className="sleek-card" style={{
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '1px solid #FFC107',
            borderRadius: '26px',
            padding: '24px',
            position: 'relative',
            transform: 'scale(1.02)',
            boxShadow: '0 8px 32px rgba(255, 193, 7, 0.15)',
            zIndex: 10
          }}>
            <div style={{ position: 'absolute', top: '-14px', left: '50%', transform: 'translateX(-50%)', background: 'linear-gradient(135deg, #FFC107, #FF9500)', color: '#08090C', padding: '6px 20px', borderRadius: '9999px', fontSize: '13px', fontWeight: '900', boxShadow: '0 4px 12px rgba(255,193,7,0.3)', whiteSpace: 'nowrap' }}>
              الأكثر طلباً 🌟
            </div>
            <span className="star-badge" style={{ background: 'rgba(255, 193, 7, 0.1)', color: '#FFC107', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold' }}>
              STANDARD (متقدم)
            </span>
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <span className="text-yellow" style={{ fontSize: '52px', fontWeight: '900', color: '#FFC107' }}>{getPrice(120)}</span>
              <span style={{ fontSize: '16px', color: '#8E9BAE', marginLeft: '4px' }}>DT / {getPeriodText()}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>رياضة واحدة</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>5 حصص في الأسبوع</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>زي رياضي مجاني 👕</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>شهادة مشاركة 🎓</span></li>
            </ul>
            <button
              onClick={() => handleOpenCheckout('STANDARD (متقدم)', 120)}
              className="btn-star" style={{
                width: '100%', padding: '14px', borderRadius: '9999px', border: 'none', background: 'linear-gradient(135deg, #FFC107, #FF9500)', color: '#08090C', fontWeight: '900', fontSize: '16px', boxShadow: '0 4px 12px rgba(255,193,7,0.3)', cursor: 'pointer'
              }}
            >
              ادفع الآن عبر D17 / Flouci ⚡
            </button>
          </div>

          {/* FAMILY */}
          <div className="sleek-card" style={{
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '1px solid rgba(0, 229, 255, 0.3)',
            borderRadius: '26px',
            padding: '24px',
            position: 'relative'
          }}>
            <span className="star-badge" style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00E5FF', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 'bold' }}>
              FAMILY (عائلي)
            </span>
            <div style={{ marginTop: '20px', marginBottom: '20px' }}>
              <span style={{ fontSize: '44px', fontWeight: '900', color: '#FFFFFF' }}>{getPrice(200)}</span>
              <span style={{ fontSize: '16px', color: '#8E9BAE', marginLeft: '4px' }}>DT / {getPeriodText()}</span>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>حتى 3 أطفال 👨‍👩‍👧‍👦</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>جميع الرياضات متاحة</span></li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#FFFFFF', fontSize: '15px' }}><span>✅</span> <span>أولوية في الدعم والمتابعة</span></li>
            </ul>
            <button
              onClick={() => handleOpenCheckout('FAMILY (عائلي)', 200)}
              className="btn-outline" style={{
                width: '100%', padding: '14px', borderRadius: '9999px', border: '1px solid rgba(0, 229, 255, 0.5)', background: 'transparent', color: '#00E5FF', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer'
              }}
            >
              ادفع الآن عبر D17 / Flouci 💳
            </button>
          </div>

        </div>

        {/* CHECKOUT MODAL (D17 / FLOUCI / KONNECT / BANK) */}
        {showCheckoutModal && (
          <div style={{
            position: 'fixed', top: 0, right: 0, left: 0, bottom: 0, zIndex: 99999,
            background: 'rgba(5, 7, 12, 0.95)', backdropFilter: 'blur(20px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
          }}>
            <div style={{
              width: '100%', maxWidth: '440px', background: 'linear-gradient(145deg, #0D1627 0%, #0A101D 100%)',
              border: '2px solid #FFC107', borderRadius: '24px', padding: '28px 24px', color: '#FFF', position: 'relative'
            }}>
              <button
                onClick={() => { setShowCheckoutModal(false); setReceiptSuccess(null); }}
                style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }}
              >
                ✕
              </button>

              {!receiptSuccess ? (
                <div>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFC107', marginBottom: '4px', textAlign: 'center' }}>
                    الدفع الإلكتروني المباشر بتونس 🇹🇳
                  </h3>
                  <p style={{ color: '#B0BEC5', fontSize: '0.85rem', textAlign: 'center', marginBottom: '20px' }}>
                    باقة: {selectedPlan?.name} — <strong>{selectedPlan?.amount} DT</strong>
                  </p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                    <button
                      onClick={() => setPaymentMethod('d17')}
                      style={{
                        padding: '12px', borderRadius: '12px', border: paymentMethod === 'd17' ? '2px solid #FFC107' : '1px solid rgba(255,255,255,0.1)',
                        background: paymentMethod === 'd17' ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.05)', color: '#FFF', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      📲 D17 (البريد)
                    </button>

                    <button
                      onClick={() => setPaymentMethod('flouci')}
                      style={{
                        padding: '12px', borderRadius: '12px', border: paymentMethod === 'flouci' ? '2px solid #FFC107' : '1px solid rgba(255,255,255,0.1)',
                        background: paymentMethod === 'flouci' ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.05)', color: '#FFF', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      💳 Flouci Pay
                    </button>

                    <button
                      onClick={() => setPaymentMethod('konnect')}
                      style={{
                        padding: '12px', borderRadius: '12px', border: paymentMethod === 'konnect' ? '2px solid #FFC107' : '1px solid rgba(255,255,255,0.1)',
                        background: paymentMethod === 'konnect' ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.05)', color: '#FFF', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      🏦 Konnect / eDinar
                    </button>

                    <button
                      onClick={() => setPaymentMethod('cash')}
                      style={{
                        padding: '12px', borderRadius: '12px', border: paymentMethod === 'cash' ? '2px solid #FFC107' : '1px solid rgba(255,255,255,0.1)',
                        background: paymentMethod === 'cash' ? 'rgba(255,193,7,0.15)' : 'rgba(255,255,255,0.05)', color: '#FFF', fontWeight: 800, cursor: 'pointer'
                      }}
                    >
                      💵 نقداً بالأكاديمية
                    </button>
                  </div>

                  <form onSubmit={handleProcessPayment}>
                    <input
                      type="tel"
                      required
                      value={phoneInput}
                      onChange={e => setPhoneInput(e.target.value)}
                      placeholder="رقم الهاتف (تونس +216) *"
                      style={{ width: '100%', padding: '14px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#FFF', marginBottom: '16px', outline: 'none', textAlign: 'center' }}
                    />

                    <button type="submit" className="btn-star" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                      ⚡ تأكيد الدفع واستخراج التوصيل
                    </button>
                  </form>
                </div>
              ) : (
                /* RECEIPT DISPLAY */
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', marginBottom: '10px' }}>🧾</div>
                  <h3 style={{ color: '#00E676', fontSize: '1.4rem', fontWeight: 900, marginBottom: '6px' }}>
                    تم الدفع واستخراج وصل الأكاديمية بنجاح!
                  </h3>
                  <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '16px', padding: '16px', textAlign: 'right', margin: '16px 0', fontSize: '0.9rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div><strong>رقم المعاملة:</strong> <span style={{ color: '#00E5FF' }}>{receiptSuccess.txnId}</span></div>
                    <div><strong>الباقة المختارة:</strong> {receiptSuccess.plan}</div>
                    <div><strong>المبلغ المدفوع:</strong> <strong style={{ color: '#FFC107' }}>{receiptSuccess.amount} DT</strong></div>
                    <div><strong>طريقة الدفع:</strong> {receiptSuccess.method.toUpperCase()}</div>
                    <div><strong>التاريخ:</strong> {receiptSuccess.date} - {receiptSuccess.time}</div>
                  </div>

                  <button onClick={() => window.print()} className="btn-star" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                    🖨️ طباعة / تحميل وصل الدفع PDF
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Payment Methods */}
        <div style={{ marginBottom: '40px' }}>
          <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '800', textAlign: 'center', marginBottom: '16px', color: '#FFFFFF' }}>طرق الدفع</h2>
          <div className="sleek-card" style={{
            background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '26px',
            padding: '20px',
            display: 'flex',
            justifyContent: 'space-around',
            alignItems: 'center'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>💵</div>
              <div style={{ fontSize: '13px', color: '#8E9BAE', fontWeight: 'bold' }}>نقدًا</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>📱</div>
              <div style={{ fontSize: '13px', color: '#8E9BAE', fontWeight: 'bold' }}>PoSTePay</div>
            </div>
            <div style={{ width: '1px', height: '48px', background: 'rgba(255,255,255,0.1)' }}></div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🏦</div>
              <div style={{ fontSize: '13px', color: '#8E9BAE', fontWeight: 'bold' }}>تحويل بنكي</div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2 className="section-title" style={{ fontSize: '20px', fontWeight: '800', textAlign: 'center', marginBottom: '20px', color: '#FFFFFF' }}>الأسئلة الشائعة</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            
            {[
              { q: 'كيف يتم الدفع؟', a: 'يمكنك الدفع نقدًا في مقر الأكاديمية بتطاوين، أو عبر تطبيق PoSTePay، أو التحويل البنكي.' },
              { q: 'هل يمكنني الإلغاء في أي وقت؟', a: 'نعم، يمكنك إلغاء الاشتراك الشهري في أي وقت قبل بداية الشهر الجديد دون أي رسوم إضافية.' },
              { q: 'هل توجد فترة تجريبية؟', a: 'نوفر حصة تجريبية مجانية لطفلك ليتعرف على المدربين وأجواء الأكاديمية قبل الاشتراك الرسمي.' }
            ].map((faq, i) => (
              <div key={i} className="sleek-card" style={{
                background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '16px',
                overflow: 'hidden'
              }}>
                <button 
                  onClick={() => toggleFaq(i)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'transparent',
                    border: 'none',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    fontSize: '15px',
                    cursor: 'pointer',
                    textAlign: 'right',
                    fontFamily: 'inherit'
                  }}
                >
                  <span>{faq.q}</span>
                  <span style={{ 
                    color: '#FFC107', 
                    transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease',
                    fontSize: '12px'
                  }}>▼</span>
                </button>
                {openFaq === i && (
                  <div style={{
                    padding: '0 16px 16px 16px',
                    color: '#8E9BAE',
                    fontSize: '14px',
                    lineHeight: '1.6'
                  }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}

          </div>
        </div>

      </div>
    </div>
  );
}
