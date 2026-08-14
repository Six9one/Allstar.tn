import React, { useState } from 'react';

export default function Shop() {
  const [activeCategory, setActiveCategory] = useState('الكل');

  const categories = ['الكل', 'ملابس', 'أحذية', 'إكسسوارات'];

  const products = [
    {
      id: 1,
      name: 'قميص أولستار الرسمي',
      price: '45 DT',
      emoji: '👕',
      category: 'ملابس',
      desc: 'القميص الرسمي للمباريات والتدريبات',
      options: ['S', 'M', 'L', 'XL'],
      optionType: 'المقاس'
    },
    {
      id: 2,
      name: 'طقم رياضي',
      price: '30 DT',
      emoji: '💖',
      category: 'ملابس',
      desc: 'طقم مريح لجميع الرياضات',
      options: ['Black', 'Navy'],
      optionType: 'اللون'
    },
    {
      id: 3,
      name: 'حذاء تدريبي',
      price: '120 DT',
      emoji: '👟',
      category: 'أحذية',
      desc: 'حذاء رياضي متين لأفضل أداء',
      options: ['36-40', '41-44'],
      optionType: 'المقاس'
    },
    {
      id: 4,
      name: 'حقيبة رياضية',
      price: '55 DT',
      emoji: '🎒',
      category: 'إكسسوارات',
      desc: 'مساحة واسعة لجميع معداتك',
      options: null,
      optionType: null
    },
    {
      id: 5,
      name: 'قبعة صيفية',
      price: '20 DT',
      emoji: '🧄',
      category: 'إكسسوارات',
      desc: 'حماية من الشمس بتصميم أنيق',
      options: null,
      optionType: null
    },
    {
      id: 6,
      name: 'كرة قدم رسمية',
      price: '35 DT',
      emoji: '🔵',
      category: 'إكسسوارات',
      desc: 'كرة رسمية عالية الجودة',
      options: null,
      optionType: null
    }
  ];

  const filteredProducts = activeCategory === 'الكل' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const getWhatsAppLink = (productName) => {
    const text = encodeURIComponent(`مرحباً، أريد طلب: ${productName} 🛒`);
    return `https://wa.me/21658263467?text=${text}`;
  };

  return (
    <div style={{
      backgroundColor: '#08090C',
      minHeight: '100vh',
      color: '#FFFFFF',
      fontFamily: '"Cairo", "Tajawal", sans-serif',
      direction: 'rtl'
    }}>
      <div style={{
        maxWidth: '480px',
        margin: '0 auto',
        padding: '95px 16px 24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Header Section */}
        <div style={{ textAlign: 'center' }}>
          <h1 className="section-title" style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '8px', color: '#FFFFFF' }}>المتجر الرسمي</h1>
          <p className="section-subtitle" style={{ color: '#8E9BAE', fontSize: '1rem', fontWeight: '500' }}>تجهيزات أولستار الرسمية (Official Store)</p>
        </div>

        {/* Order Process Banner */}
        <div className="sleek-card" style={{
          background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 149, 0, 0.05))',
          border: '1px solid rgba(255, 193, 7, 0.3)',
          borderRadius: '26px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#FFC107', fontSize: '1.2rem', fontWeight: '800', marginBottom: '12px' }}>كيفية الطلب 🛍️</h2>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: '#FFFFFF', fontWeight: '600' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
              <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>👇</span>
              <span>1. اختر المنتج</span>
            </div>
            <div style={{ color: '#8E9BAE' }}>→</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
              <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>💬</span>
              <span>2. رسالة واتسآب</span>
            </div>
            <div style={{ color: '#8E9BAE' }}>→</div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: '1' }}>
              <span style={{ fontSize: '1.5rem', marginBottom: '4px' }}>🤝</span>
              <span>3. اتفق على التسليم</span>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div style={{
          display: 'flex',
          gap: '10px',
          overflowX: 'auto',
          paddingBottom: '8px',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none'
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={activeCategory === cat ? 'btn-star' : 'btn-outline'}
              style={activeCategory === cat ? {
                background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                color: '#08090C',
                fontWeight: '900',
                borderRadius: '9999px',
                padding: '8px 20px',
                border: 'none',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              } : {
                background: 'transparent',
                color: '#8E9BAE',
                border: '1px solid rgba(255,255,255,0.1)',
                fontWeight: '600',
                borderRadius: '9999px',
                padding: '8px 20px',
                whiteSpace: 'nowrap',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {filteredProducts.map(product => (
            <div key={product.id} className="sleek-card" style={{
              background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '26px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}>
              <div className="star-badge" style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                background: 'linear-gradient(135deg, #FFC107, #FF9500)',
                color: '#08090C',
                fontWeight: '900',
                fontSize: '0.75rem',
                padding: '4px 8px',
                borderRadius: '9999px',
                zIndex: 1
              }}>
                {product.price}
              </div>

              <div style={{
                fontSize: '4rem',
                textAlign: 'center',
                margin: '16px 0',
                lineHeight: '1'
              }}>
                {product.emoji}
              </div>

              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '800',
                color: '#FFFFFF',
                marginBottom: '4px',
                textAlign: 'center'
              }}>
                {product.name}
              </h3>
              
              <p style={{
                color: '#8E9BAE',
                fontSize: '0.8rem',
                textAlign: 'center',
                marginBottom: '12px',
                flexGrow: 1
              }}>
                {product.desc}
              </p>

              {product.options && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ color: '#5A677B', fontSize: '0.75rem', marginBottom: '6px', textAlign: 'center' }}>
                    {product.optionType} المتاح:
                  </div>
                  <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', justifyContent: 'center' }}>
                    {product.options.map(opt => (
                      <span key={opt} style={{
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.7rem',
                        color: '#FFFFFF'
                      }}>
                        {opt}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <a
                href={getWhatsAppLink(product.name)}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  background: '#00E676',
                  color: '#08090C',
                  fontWeight: '900',
                  borderRadius: '9999px',
                  padding: '10px',
                  textAlign: 'center',
                  textDecoration: 'none',
                  display: 'block',
                  fontSize: '0.9rem',
                  marginTop: 'auto'
                }}
              >
                طلب عبر واتسآب 📱
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
