import React, { useState, useEffect } from 'react';
import { db } from '../services/db';

export default function Gallery() {
  const [activeFilter, setActiveFilter] = useState('All');
  const [siteGallery, setSiteGallery] = useState([]);

  useEffect(() => {
    const loadContent = (content) => {
      if (content && Array.isArray(content.gallery_images) && content.gallery_images.length > 0) {
        setSiteGallery(content.gallery_images);
      }
    };

    loadContent(db.getSiteContent());
    db.getSiteContentAsync().then(c => c && loadContent(c));

    const unsub = db.subscribeToRealtime(null, null, (liveContent) => {
      if (liveContent) loadContent(liveContent);
    });

    return () => {
      if (unsub) unsub();
    };
  }, []);

  const filters = [
    { id: 'All', label: 'الكل' },
    { id: 'Training', label: 'التدريب (Training)' },
    { id: 'Tournaments', label: 'بطولات (Tournaments)' },
    { id: 'Celebrations', label: 'احتفالات (Celebrations)' },
    { id: 'Certificates', label: 'شهادات (Certificates)' }
  ];

  const defaultPhotos = [
    { id: 1, type: 'Tournaments', emoji: '🏆', category: 'بطولات', date: '2023-10-15', bg: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(0,0,0,0.8))', span: 'col-span-2 row-span-2', height: '220px' },
    { id: 2, type: 'Training', emoji: '⚽', category: 'التدريب', date: '2023-10-18', bg: 'linear-gradient(135deg, rgba(0,230,118,0.2), rgba(0,0,0,0.8))', span: 'col-span-1 row-span-1', height: '140px' },
    { id: 3, type: 'Training', emoji: '🏀', category: 'التدريب', date: '2023-10-20', bg: 'linear-gradient(135deg, rgba(255,149,0,0.2), rgba(0,0,0,0.8))', span: 'col-span-1 row-span-2', height: '180px' },
    { id: 4, type: 'Celebrations', emoji: '🎉', category: 'احتفالات', date: '2023-10-22', bg: 'linear-gradient(135deg, rgba(255,61,0,0.2), rgba(0,0,0,0.8))', span: 'col-span-1 row-span-1', height: '140px' },
  ];

  const photos = siteGallery.length > 0
    ? siteGallery.map((g, i) => ({
        id: g.id || i,
        type: 'Training',
        emoji: '🖼️',
        category: g.caption || 'أكاديمية أولستار',
        url: g.url,
        date: '2026',
        bg: 'linear-gradient(135deg, rgba(255,193,7,0.2), rgba(0,0,0,0.8))',
        span: i % 3 === 0 ? 'col-span-2 row-span-1' : 'col-span-1 row-span-1',
        height: '160px'
      }))
    : defaultPhotos;

  const filteredPhotos = activeFilter === 'All' 
    ? photos 
    : photos.filter(p => p.type === activeFilter);

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
        padding: '95px 20px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '8px' }}>
          <h1 style={{ 
            fontSize: '32px', 
            fontWeight: 900, 
            margin: '0 0 8px 0',
            background: 'linear-gradient(135deg, #FFC107, #FF9500)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            معرض الصور
          </h1>
          <p style={{ color: '#8E9BAE', fontSize: '16px', margin: 0 }}>
            لحظاتنا مع أولستار (Our Moments)
          </p>
        </div>

        {/* Stats Row */}
        <div style={{
          background: 'linear-gradient(145deg, rgba(25,29,42,0.95), rgba(14,16,24,0.98))',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '26px',
          padding: '16px',
          textAlign: 'center'
        }}>
          <p style={{ color: '#5A677B', fontSize: '14px', marginBottom: '12px', fontWeight: 700 }}>منذ التأسيس</p>
          <div style={{ display: 'flex', justifyContent: 'space-around', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
              <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: '#FFC107' }}>200+</span>
              <span style={{ fontSize: '12px', color: '#8E9BAE' }}>صورة</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
              <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: '#00E5FF' }}>3</span>
              <span style={{ fontSize: '12px', color: '#8E9BAE' }}>مواسم</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '12px', flex: 1 }}>
              <span style={{ display: 'block', fontSize: '18px', fontWeight: 800, color: '#00E676' }}>15</span>
              <span style={{ fontSize: '12px', color: '#8E9BAE' }}>فعالية</span>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          overflowX: 'auto', 
          paddingBottom: '8px',
          msOverflowStyle: 'none',
          scrollbarWidth: 'none',
          WebkitOverflowScrolling: 'touch'
        }}>
          {filters.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              style={{
                background: activeFilter === f.id ? 'linear-gradient(135deg, #FFC107, #FF9500)' : 'rgba(255,255,255,0.05)',
                color: activeFilter === f.id ? '#08090C' : '#8E9BAE',
                border: activeFilter === f.id ? 'none' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '9999px',
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: activeFilter === f.id ? 900 : 600,
                whiteSpace: 'nowrap',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gridAutoRows: 'minmax(130px, auto)',
          gap: '12px'
        }}>
          {filteredPhotos.map(photo => (
            <div 
              key={photo.id}
              style={{
                gridColumn: photo.span.includes('col-span-2') ? 'span 2' : 'span 1',
                gridRow: photo.span.includes('row-span-2') ? 'span 2' : 'span 1',
                background: photo.bg,
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '20px',
                minHeight: photo.height,
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
              }}
            >
              {/* Top Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'rgba(0,0,0,0.6)',
                backdropFilter: 'blur(4px)',
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '11px',
                fontWeight: 700,
                color: '#FFFFFF',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                {photo.category}
              </div>

              {/* Big Emoji */}
              <div style={{
                fontSize: photo.span.includes('row-span-2') ? '64px' : '48px',
                filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.5))'
              }}>
                {photo.emoji}
              </div>

              {/* Bottom Date */}
              <div style={{
                position: 'absolute',
                bottom: '12px',
                left: '12px',
                fontSize: '11px',
                color: '#8E9BAE',
                fontWeight: 600,
                background: 'rgba(0,0,0,0.4)',
                padding: '2px 6px',
                borderRadius: '6px'
              }}>
                {photo.date}
              </div>
            </div>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#5A677B' }}>
            لا توجد صور في هذا التصنيف حالياً.
          </div>
        )}

        {/* Upload Button */}
        <button style={{
          width: '100%',
          marginTop: '16px',
          padding: '16px',
          background: 'transparent',
          color: '#FFC107',
          border: '2px dashed rgba(255,193,7,0.3)',
          borderRadius: '26px',
          fontSize: '16px',
          fontWeight: 800,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}>
          إضافة صورة جديدة 📷
        </button>

      </div>
    </div>
  );
}
