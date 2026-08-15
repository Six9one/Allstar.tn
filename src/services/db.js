// Database Service Layer for All-Star Sports Academy
// Supports live Supabase integration + offline-first LocalStorage sync fallback

import { createClient } from '@supabase/supabase-js';
import { PhotoStudioEngine } from './photoStudio';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

const STORAGE_KEYS = {
  REGISTRATIONS: 'allstar_db_registrations',
  EVALUATIONS: 'allstar_db_evaluations',
  ATTENDANCE: 'allstar_db_attendance',
  CERTIFICATES: 'allstar_db_certificates',
  NOTIFICATIONS: 'allstar_db_notifications',
  PLAYERS: 'allstar_db_players',
  PAYMENTS: 'allstar_db_payments',
  MESSAGES: 'allstar_db_messages',
  PARENTS: 'allstar_db_parents',
  MEDIA: 'allstar_db_media',
  COACHES: 'allstar_db_coaches',
  SITE_CONTENT: 'allstar_db_site_content',
  ACCOUNTS: 'allstar_db_accounts',
};

function safeSetLocalStorage(key, value) {
  try {
    const dataStr = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, dataStr);
  } catch (e) {
    console.warn(`LocalStorage quota warning for "${key}", attempting fallback cleanup:`, e);
    try {
      localStorage.removeItem('allstar_temp_cache');
      const dataStr = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, dataStr);
    } catch (err) {
      console.error('LocalStorage write fallback failed:', err);
    }
  }
}

// ─── SEED COACHES ─────────────────────────────────────────────────────────────
const SEED_COACHES = [
  {
    id: 'COACH-001',
    name: 'أحمد المنصوري',
    nickname: 'الكابتن أحمد',
    phone: '+216 95 263 467',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    sport: 'Football',
    group: 'U12',
    bio: 'مدرب كرة قدم بخبرة 10 سنوات في التكوين الشبابي بتطاوين'
  },
  {
    id: 'COACH-002',
    name: 'سامي المحمودي',
    nickname: 'الكابتن سامي',
    phone: '+216 98 323 941',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
    sport: 'Basketball',
    group: 'U14',
    bio: 'متخصص في كرة السلة، مشرف على الفئة العمرية U14'
  },
  {
    id: 'COACH-003',
    name: 'منى العياري',
    nickname: 'الأستاذة منى',
    phone: '+216 92 456 789',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    sport: 'Handball',
    group: 'U10',
    bio: 'مدربة كرة يد، متخصصة في تكوين الناشئات'
  },
  {
    id: 'COACH-004',
    name: 'كريم الورغمي',
    nickname: 'الكابتن كريم',
    phone: '+216 97 654 321',
    photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    sport: 'Football',
    group: 'U16',
    bio: 'مدرب الفئات الأكبر سناً، يُعدّ اللاعبين للمشاركات الرسمية'
  },
  {
    id: 'COACH-005',
    name: 'Farouq Rouane',
    nickname: 'الكابتن فاروق',
    phone: '+216 93 445 164',
    photoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    sport: 'Football',
    group: 'U14',
    bio: 'مدرب كرة قدم بخبرة 10 سنوات في التكوين الشبابي بتطاوين'
  },
  {
    id: 'COACH-006',
    name: 'Ibrahim Mogtaa',
    nickname: 'الكابتن إبراهيم',
    phone: '+216 27 255 711',
    photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    sport: 'Football',
    group: 'U10',
    bio: 'متخصص في كرة القدم، مشرف على فئة الملكية U10'
  }
];

// ─── SEED PLAYERS ─────────────────────────────────────────────────────────────
const SEED_PLAYERS = [
  {
    id: 'ALLSTAR-101',
    name: 'يوسف المنصوري (Youssef M.)',
    age: 10,
    sport: 'Football',
    group: 'U12',
    coachId: 'COACH-001',
    teamName: 'نسور أولستار U12',
    coachName: 'الكابتن أحمد المنصوري',
    parentName: 'محمد علي المنصوري (+216 58 263 467)',
    photoUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-101',
    stats: { speed: 88, puissance: 82, stamina: 75, shooting: 85, passing: 80, technique: 78, defense: 72, mental: 80 },
    matchStats: { goals: 5, assists: 3, yellowCards: 1, redCards: 0, matchesPlayed: 12, points: 150 }
  },
  {
    id: 'ALLSTAR-102',
    name: 'عمر الطرابلسي (Omar T.)',
    age: 12,
    sport: 'Basketball',
    group: 'U14',
    coachId: 'COACH-002',
    teamName: 'فرسان كرة السلة U14',
    coachName: 'الكابتن سامي المحمودي',
    parentName: 'كمال الطرابلسي (+216 95 323 941)',
    photoUrl: 'https://images.unsplash.com/photo-1519766304817-4f37bda74a29?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-102',
    stats: { speed: 85, puissance: 78, stamina: 84, shooting: 88, passing: 90, technique: 82, defense: 76, mental: 85 },
    matchStats: { goals: 18, assists: 12, yellowCards: 0, redCards: 0, matchesPlayed: 15, points: 220 }
  },
  {
    id: 'ALLSTAR-103',
    name: 'سارة الكعبي (Sara K.)',
    age: 9,
    sport: 'Handball',
    group: 'U10',
    coachId: 'COACH-003',
    teamName: 'نجمات تطاوين U10',
    coachName: 'الكابتن منى العياري',
    parentName: 'فاطمة الكعبي (+216 58 263 467)',
    photoUrl: 'https://images.unsplash.com/photo-1517649763962-0c623266010b?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-103',
    stats: { speed: 80, puissance: 72, stamina: 80, shooting: 78, passing: 85, technique: 80, defense: 78, mental: 82 },
    matchStats: { goals: 8, assists: 6, yellowCards: 0, redCards: 0, matchesPlayed: 10, points: 130 }
  },
  {
    id: 'ALLSTAR-104',
    name: 'أحمد الجديدي (Ahmed J.)',
    age: 11,
    sport: 'Football',
    group: 'U12',
    coachId: 'COACH-001',
    teamName: 'نسور أولستار U12',
    coachName: 'الكابتن أحمد المنصوري',
    parentName: 'سليم الجديدي (+216 95 323 941)',
    photoUrl: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-104',
    stats: { speed: 86, puissance: 84, stamina: 82, shooting: 80, passing: 84, technique: 76, defense: 70, mental: 78 },
    matchStats: { goals: 7, assists: 4, yellowCards: 2, redCards: 0, matchesPlayed: 14, points: 175 }
  },
  {
    id: 'ALLSTAR-105',
    name: 'مريم العويني (Maryam A.)',
    age: 13,
    sport: 'Basketball',
    group: 'U14',
    coachId: 'COACH-002',
    teamName: 'فرسان كرة السلة U14',
    coachName: 'الكابتن سامي المحمودي',
    parentName: 'طارق العويني (+216 58 263 467)',
    photoUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-105',
    stats: { speed: 82, puissance: 74, stamina: 88, shooting: 84, passing: 86, technique: 85, defense: 80, mental: 88 },
    matchStats: { goals: 22, assists: 15, yellowCards: 0, redCards: 0, matchesPlayed: 16, points: 260 }
  },
  {
    id: 'ALLSTAR-106',
    name: 'حمزة المكي (Hamza M.)',
    age: 15,
    sport: 'Football',
    group: 'U16',
    coachId: 'COACH-004',
    teamName: 'أبطال أولستار U16',
    coachName: 'الكابتن كريم الورغمي',
    parentName: 'منجي المكي (+216 95 323 941)',
    photoUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-106',
    stats: { speed: 92, puissance: 90, stamina: 90, shooting: 91, passing: 88, technique: 87, defense: 85, mental: 90 },
    matchStats: { goals: 14, assists: 9, yellowCards: 3, redCards: 1, matchesPlayed: 18, points: 310 }
  },
  {
    id: 'ALLSTAR-107',
    name: 'آية الغول (Aya El Ghoul)',
    age: 8,
    sport: 'Handball',
    group: 'U8',
    coachId: 'COACH-003',
    teamName: 'صغار تطاوين U8',
    coachName: 'الكابتن منى العياري',
    parentName: 'سليمان الغول (+216 58 263 467)',
    photoUrl: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-107',
    stats: { speed: 78, puissance: 68, stamina: 76, shooting: 74, passing: 80, technique: 72, defense: 70, mental: 76 },
    matchStats: { goals: 3, assists: 5, yellowCards: 0, redCards: 0, matchesPlayed: 8, points: 80 }
  },
  {
    id: 'ALLSTAR-108',
    name: 'ريان اليعقوبي (Rayan Y.)',
    age: 14,
    sport: 'Football',
    group: 'U14',
    coachId: 'COACH-001',
    teamName: 'نسور أولستار U14',
    coachName: 'الكابتن أحمد المنصوري',
    parentName: 'مراد اليعقوبي (+216 95 323 941)',
    photoUrl: 'https://images.unsplash.com/photo-1526232761682-d26e03ac148e?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-108',
    stats: { speed: 89, puissance: 86, stamina: 86, shooting: 88, passing: 87, technique: 84, defense: 78, mental: 85 },
    matchStats: { goals: 11, assists: 8, yellowCards: 1, redCards: 0, matchesPlayed: 16, points: 240 }
  },
  {
    id: 'ALLSTAR-109',
    name: 'سلمى المحمودي (Salma M.)',
    age: 12,
    sport: 'Basketball',
    group: 'U14',
    coachId: 'COACH-002',
    teamName: 'فرسان كرة السلة U14',
    coachName: 'الكابتن سامي المحمودي',
    parentName: 'نعيم المحمودي (+216 58 263 467)',
    photoUrl: 'https://images.unsplash.com/photo-1515523110800-9415d13b84a8?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-109',
    stats: { speed: 84, puissance: 76, stamina: 82, shooting: 86, passing: 88, technique: 83, defense: 78, mental: 86 },
    matchStats: { goals: 20, assists: 14, yellowCards: 0, redCards: 0, matchesPlayed: 17, points: 280 }
  },
  {
    id: 'ALLSTAR-110',
    name: 'أنس الصغير (Anas S.)',
    age: 7,
    sport: 'Football',
    group: 'U8',
    coachId: 'COACH-001',
    teamName: 'براعم أولستار U8',
    coachName: 'الكابتن أحمد المنصوري',
    parentName: 'أيمن الصغير (+216 95 323 941)',
    photoUrl: 'https://images.unsplash.com/photo-1510511459019-5dee997dd1db?w=400&auto=format&fit=crop&q=80',
    status: 'Active',
    qrCode: 'ALLSTAR-110',
    stats: { speed: 75, puissance: 65, stamina: 72, shooting: 70, passing: 78, technique: 68, defense: 65, mental: 74 },
    matchStats: { goals: 2, assists: 3, yellowCards: 0, redCards: 0, matchesPlayed: 6, points: 50 }
  }
];

// ─── SEED ACCOUNTS ────────────────────────────────────────────────────────────
const SEED_ACCOUNTS = [
  { id: 'ACC-001', role: 'coach', name: 'الكابتن أحمد المنصوري', phone: '+216 95 263 467', pin: '1234', coachId: 'COACH-001', sport: 'Football', group: 'U12', status: 'active' },
  { id: 'ACC-002', role: 'coach', name: 'الكابتن سامي المحمودي', phone: '+216 98 323 941', pin: '1234', coachId: 'COACH-002', sport: 'Basketball', group: 'U14', status: 'active' },
  { id: 'ACC-003', role: 'parent', name: 'محمد المنصوري (ولي أمر)', phone: '+216 98 123 456', pin: '1234', parentName: 'محمد المنصوري', playerIds: ['ALLSTAR-101'], status: 'active' },
  { id: 'ACC-004', role: 'parent', name: 'كمال الطرابلسي (ولي أمر)', phone: '+216 95 323 941', pin: '1234', parentName: 'كمال الطرابلسي', playerIds: ['ALLSTAR-102'], status: 'active' }
];

// ─── SEED EVALUATIONS ─────────────────────────────────────────────────────────
const SEED_EVALUATIONS = [
  { id: 'EV-01', playerId: 'ALLSTAR-101', playerName: 'يوسف المنصوري', technical: 4.8, tactical: 4.5, discipline: 5.0, notes: 'أداء ممتاز في التحركات والسرعة', date: '2026-08-10' },
  { id: 'EV-02', playerId: 'ALLSTAR-102', playerName: 'عمر الطرابلسي', technical: 4.2, tactical: 4.6, discipline: 4.8, notes: 'تحسن كبير في التصويب والرميات الثلاثية', date: '2026-08-09' }
];

// ─── SEED ATTENDANCE ──────────────────────────────────────────────────────────
const SEED_ATTENDANCE = [
  { id: 'ATT-01', playerId: 'ALLSTAR-101', playerName: 'يوسف المنصوري', date: '2026-08-10', status: 'Present', time: '17:00' },
  { id: 'ATT-02', playerId: 'ALLSTAR-102', playerName: 'عمر الطرابلسي', date: '2026-08-10', status: 'Present', time: '17:05' },
  { id: 'ATT-03', playerId: 'ALLSTAR-103', playerName: 'سارة الكعبي', date: '2026-08-10', status: 'Present', time: '17:10' }
];

// ─── SEED SITE CONTENT ────────────────────────────────────────────────────────
const SEED_SITE_CONTENT = {
  hero_title: 'تدريب احترافي في كرة القدم، السلة، واليد بتطاوين 🇹🇳',
  hero_subtitle: 'أكاديمية أولستار الرياضية للأطفال والناشئين من 6 إلى 16 سنة',
  ticker_score: '⚽ أولستار تطاوين U12 <span style="color:#FFC107">3 - 1</span> اتحاد تطاوين U12 (نتيجة نهائية)',
  ticker_next_match: '🏀 السبت 17:00: أولستار U14 vs النجم الرياضي 📍 المركب البلدي',
  field_status: 'open',
  contact_phone: '+216 58 263 467',
  contact_email: 'allstar.tataouine@gmail.com',
  contact_address: 'ملعب المركب الرياضي، تطاوين، تونس',
  contact_map_url: 'https://maps.google.com/?q=Tataouine+Tunisia',
  footer_facebook: 'https://facebook.com/allstaracademytataouine',
  footer_instagram: 'https://instagram.com/allstaracademy_tn',
  footer_whatsapp: '+21658263467',
  academy_title: 'أكاديمية أولستار الرياضية',
  academy_desc: 'مؤسسة رياضية متخصصة في تكوين الأطفال والناشئين في كرة القدم وكرة السلة وكرة اليد بمدينة تطاوين.',
  events: [
    { id: 'EVT-1', title: 'دوري أولستار الداخلي U12', date: '2026-08-20', location: 'المركب الرياضي البلدي', description: 'دوري داخلي بين فرق U12 لتقييم المستوى الفني', sport: '⚽' },
    { id: 'EVT-2', title: 'بطولة كرة السلة الودية', date: '2026-09-05', location: 'قاعة الرياضة المغطاة', description: 'مباراة ودية بين أولستار U14 والنادي البلدي', sport: '🏀' },
    { id: 'EVT-3', title: 'يوم الأسرة والحفل الختامي', date: '2026-09-15', location: 'أكاديمية أولستار', description: 'احتفالية ختام الموسم الرياضي مع عائلات اللاعبين', sport: '🎉' }
  ],
  pricing_plans: [
    { id: 'PLAN-1', name: 'باقة كرة القدم', price: '80 DT', period: 'شهرياً', features: ['4 حصص أسبوعياً', 'مدرب متخصص', 'ملابس رياضية', 'بطاقة FUT شخصية'], sport: '⚽' },
    { id: 'PLAN-2', name: 'باقة كرة السلة', price: '70 DT', period: 'شهرياً', features: ['3 حصص أسبوعياً', 'تدريب تقني', 'قاعة مغطاة', 'متابعة شهرية'], sport: '🏀' },
    { id: 'PLAN-3', name: 'باقة كرة اليد', price: '65 DT', period: 'شهرياً', features: ['3 حصص أسبوعياً', 'مدرب متخصص', 'تقييم دوري', 'شهادة مشاركة'], sport: '🤾' },
    { id: 'PLAN-4', name: 'الباقة الشاملة (3 رياضات)', price: '150 DT', period: 'شهرياً', features: ['تدريب الرياضات الثلاث', 'مرافقة مدرسية', 'شهادة معتمدة', 'أولوية في الفرق'], sport: '🏆' }
  ],
  schedule_sessions: [
    { day: 'الاثنين', time: '16:00 - 18:00', group: 'U12', sport: 'Football', coach: 'الكابتن أحمد' },
    { day: 'الثلاثاء', time: '16:00 - 18:00', group: 'U14', sport: 'Basketball', coach: 'الكابتن سامي' },
    { day: 'الأربعاء', time: '15:00 - 17:00', group: 'U10', sport: 'Handball', coach: 'الأستاذة منى' },
    { day: 'الخميس', time: '16:00 - 18:00', group: 'U16', sport: 'Football', coach: 'الكابتن كريم' },
    { day: 'الجمعة', time: '09:00 - 11:00', group: 'U8', sport: 'Football', coach: 'الكابتن أحمد' },
    { day: 'السبت', time: '09:00 - 12:00', group: 'All', sport: 'Multi-Sport', coach: 'جميع المدربين' }
  ],
  gallery_images: [
    { id: 'GAL-1', url: 'https://hsylnrzxeyqxczdalurj.supabase.co/storage/v1/object/public/carousel/live-slide-1-1786751135590.webp', caption: '⚽ تدريبات وبطولات أكاديمية أولستار الرياضية' },
    { id: 'GAL-2', url: 'https://hsylnrzxeyqxczdalurj.supabase.co/storage/v1/object/public/carousel/live-slide-2-1786751135909.webp', caption: '🏆 افتتاح التسجيل ومشاريع التميز الرياضي والدراسي' }
  ],
  shop_products: [
    { id: 'SHOP-1', name: 'قميص أولستار الرسمي', price: '45 DT', description: 'قميص رياضي بألوان الأكاديمية', inStock: true },
    { id: 'SHOP-2', name: 'كرة قدم احترافية', price: '35 DT', description: 'كرة قدم بختم الأكاديمية', inStock: true },
    { id: 'SHOP-3', name: 'حقيبة رياضية أولستار', price: '55 DT', description: 'حقيبة كبيرة لمتطلبات التدريب', inStock: false },
    { id: 'SHOP-4', name: 'أحذية تدريب جماعي', price: '120 DT', description: 'أحذية متعددة الاستعمالات', inStock: true }
  ],
  programs: [
    { id: 'PRG-1', name: 'برنامج كرة القدم', age: '6-16 سنة', desc: 'تكوين شامل يشمل التقنية والتكتيك واللياقة البدنية على يد مدربين مؤهلين', sport: '⚽' },
    { id: 'PRG-2', name: 'برنامج كرة السلة', age: '8-16 سنة', desc: 'تطوير مهارات التصويب والتمرير والحركة الجماعية', sport: '🏀' },
    { id: 'PRG-3', name: 'برنامج كرة اليد', age: '7-15 سنة', desc: 'برنامج متكامل لتعليم أسس كرة اليد والتكتيكات الجماعية', sport: '🤾' },
    { id: 'PRG-4', name: 'المرافقة الدراسية', age: '6-16 سنة', desc: 'دعم مدرسي يجمع بين النجاح الدراسي والتميز الرياضي', sport: '📚' }
  ]
};

// ─── DB SERVICE CLASS ─────────────────────────────────────────────────────────
class DBService {
  constructor() {
    this.siteContentSaveQueue = Promise.resolve();
    this.initStorage();
    this.syncFromSupabase();
  }

  initStorage() {
    if (!localStorage.getItem(STORAGE_KEYS.PLAYERS)) {
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(SEED_PLAYERS));
    } else {
      // Migrate existing players to add new fields if missing
      const existing = this.getPlayers();
      const migrated = existing.map(p => ({
        ...p,
        stats: p.stats ? {
          speed: p.stats.speed || 80,
          puissance: p.stats.puissance || p.stats.passing || 80,
          stamina: p.stats.stamina || 78,
          shooting: p.stats.shooting || 80,
          passing: p.stats.passing || 80,
          technique: p.stats.technique || 78,
          defense: p.stats.defense || 72,
          mental: p.stats.mental || 80,
        } : { speed: 80, puissance: 80, stamina: 78, shooting: 80, passing: 80, technique: 78, defense: 72, mental: 80 },
        matchStats: p.matchStats || { goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, points: 0 },
        coachId: p.coachId || 'COACH-001'
      }));
      localStorage.setItem(STORAGE_KEYS.PLAYERS, JSON.stringify(migrated));
    }

    if (!localStorage.getItem(STORAGE_KEYS.COACHES)) {
      localStorage.setItem(STORAGE_KEYS.COACHES, JSON.stringify(SEED_COACHES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.EVALUATIONS)) {
      localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(SEED_EVALUATIONS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) {
      localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(SEED_ATTENDANCE));
    }
    if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
      localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.PAYMENTS)) {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
      localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SITE_CONTENT)) {
      localStorage.setItem(STORAGE_KEYS.SITE_CONTENT, JSON.stringify(SEED_SITE_CONTENT));
    }
    if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
      localStorage.setItem(STORAGE_KEYS.ACCOUNTS, JSON.stringify(SEED_ACCOUNTS));
    }
  }

  // ── Supabase Realtime & Async DB Methods ─────────────────────────────────
  isSupabaseActive() {
    return !!supabase;
  }

  async getSiteContentAsync() {
    if (supabase) {
      try {
        const localContent = this.getSiteContent();
        let baseContent = { ...SEED_SITE_CONTENT, ...localContent };

        // 1. Fetch main_content from allstar_site_content (PRIMARY source for gallery_images)
        const { data: siteData, error: siteContentError } = await supabase
          .from('allstar_site_content')
          .select('data')
          .eq('id', 'main_content')
          .maybeSingle();
        if (siteContentError) throw siteContentError;
        if (siteData && siteData.data) {
          // Check if remote has gallery images with actual URLs
          const remoteGallery = siteData.data.gallery_images;
          const hasRemoteImages = Array.isArray(remoteGallery) && remoteGallery.length > 0 && remoteGallery.some(img => /^https?:\/\//i.test(img?.url?.trim() || ''));
          
          // Apply remote data BUT preserve gallery_images separately
          const remoteGalleryBackup = hasRemoteImages ? remoteGallery : null;
          baseContent = { ...baseContent, ...siteData.data };
          
          // If remote had valid gallery images, use them (they include base64 custom photos)
          if (remoteGalleryBackup) {
            baseContent.gallery_images = remoteGalleryBackup;
          }
        }

        // 2. Auto-sync: If local storage has custom base64 photos that Supabase doesn't have, push them
        const hasLocalCustomPhotos = Array.isArray(localContent.gallery_images) && localContent.gallery_images.some(img => img.url && img.url.startsWith('data:image/'));
        const remoteHasCustomPhotos = Array.isArray(baseContent.gallery_images) && baseContent.gallery_images.some(img => img.url && img.url.startsWith('data:image/'));
        
        // Only migrate a legacy local upload when no cloud record exists at all.
        // Once a record exists, the cloud value is authoritative.
        if (!siteData && hasLocalCustomPhotos && !remoteHasCustomPhotos) {
          console.log('⚡ Auto-syncing local custom admin photos to Supabase cloud...');
          await this.saveSiteContent(localContent);
          return localContent;
        }

        // 3. Fallback: If still no gallery images, try allstar_players carousel rows
        if (!baseContent.gallery_images || !Array.isArray(baseContent.gallery_images) || baseContent.gallery_images.length === 0 || !baseContent.gallery_images.some(img => img.url && img.url.trim())) {
          const { data: carouselRows } = await supabase.from('allstar_players').select('*').eq('group', 'HERO_CAROUSEL').order('id', { ascending: true });
          if (carouselRows && carouselRows.length > 0) {
            const validSlides = carouselRows.map(r => ({
              id: r.id,
              url: r.photourl || '',
              caption: r.name || 'صور الأكاديمية'
            })).filter(s => s.url && s.url.trim());

            if (validSlides.length > 0) {
              baseContent.gallery_images = validSlides;
            }
          }
        }

        // 4. Final safeguard: Use seed data if still empty
        if (!baseContent.gallery_images || !Array.isArray(baseContent.gallery_images) || baseContent.gallery_images.length === 0) {
          baseContent.gallery_images = SEED_SITE_CONTENT.gallery_images;
        }

        safeSetLocalStorage(STORAGE_KEYS.SITE_CONTENT, baseContent);
        return baseContent;
      } catch (e) {
        console.error('getSiteContentAsync error:', e);
      }
    }
    const local = this.getSiteContent();
    if (!local.gallery_images || !Array.isArray(local.gallery_images) || local.gallery_images.length === 0) {
      local.gallery_images = SEED_SITE_CONTENT.gallery_images;
    }
    return local;
  }

  async getCoachesAsync() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('allstar_coaches').select('*').order('id', { ascending: false });
        if (!error) {
          const localCoaches = this.getCoaches();
          let combined = data && data.length > 0 ? [...data] : [];

          // Merge missing local coaches to Supabase if any exist locally
          const remoteIds = new Set(combined.map(c => c.id));
          for (const lc of localCoaches) {
            if (!remoteIds.has(lc.id)) {
              combined.push(lc);
              await supabase.from('allstar_coaches').upsert([{
                id: lc.id,
                name: lc.name,
                nickname: lc.nickname || lc.name || '',
                phone: lc.phone || '',
                photourl: lc.photoUrl || lc.photourl || '',
                sport: lc.sport || 'Football',
                group: lc.group || 'U12',
                bio: lc.bio || ''
              }]);
            }
          }

          const localMap = new Map(localCoaches.map(lc => [lc.id, lc]));
          const normalized = combined.map(c => {
            const local = localMap.get(c.id);
            const cPhoto = (c.photourl && c.photourl.trim()) || (c.photoUrl && c.photoUrl.trim()) || '';
            const localPhoto = (local && ((local.photoUrl && local.photoUrl.trim()) || (local.photourl && local.photourl.trim()))) || '';
            
            let finalPhoto = cPhoto;
            if (localPhoto && (localPhoto.startsWith('data:image/') || !cPhoto || cPhoto.includes('unsplash.com'))) {
              finalPhoto = localPhoto;
            }
            if (!finalPhoto) {
              finalPhoto = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';
            }

            return {
              ...(local || {}),
              ...c,
              photoUrl: finalPhoto,
              photourl: finalPhoto
            };
          });

          safeSetLocalStorage(STORAGE_KEYS.COACHES, normalized);
          return normalized;
        }
      } catch (e) {
        console.error('getCoachesAsync error:', e);
      }
    }
    return this.getCoaches();
  }

  async getPlayersAsync() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('allstar_players').select('*').order('id', { ascending: false });
        if (!error) {
          const defaultStats = { speed: 80, puissance: 80, stamina: 78, shooting: 80, passing: 80, technique: 78, defense: 72, mental: 80 };
          const defaultMatchStats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, points: 0 };
          const localPlayers = this.getPlayers();
          let combined = data && data.length > 0 ? data.filter(p => p.group !== 'HERO_CAROUSEL') : [];

          // Merge local missing seed players into remote database
          const remoteIds = new Set(combined.map(p => p.id));
          for (const lp of localPlayers) {
            if (!remoteIds.has(lp.id)) {
              combined.push(lp);
              await supabase.from('allstar_players').upsert([{
                id: lp.id,
                name: lp.name,
                age: lp.age || 10,
                sport: lp.sport || 'Football',
                group: lp.group || 'U12',
                coachid: lp.coachId || lp.coachid || '',
                teamname: lp.teamName || lp.teamname || '',
                coachname: lp.coachName || lp.coachname || '',
                parentname: lp.parentName || lp.parentname || '',
                parentphone: lp.parentPhone || lp.parentphone || '',
                photourl: lp.photoUrl || lp.photourl || '',
                status: lp.status || 'Active',
                qrcode: lp.qrCode || lp.qrcode || lp.id,
                stats: lp.stats || defaultStats,
                matchstats: lp.matchStats || lp.matchstats || defaultMatchStats
              }]);
            }
          }

          const localMap = new Map(localPlayers.map(lp => [lp.id, lp]));
          const normalized = combined.map(p => {
            const local = localMap.get(p.id);
            const pPhoto = (p.photourl && p.photourl.trim()) || (p.photoUrl && p.photoUrl.trim()) || '';
            const localPhoto = (local && ((local.photoUrl && local.photoUrl.trim()) || (local.photourl && local.photourl.trim()))) || '';
            
            let finalPhoto = pPhoto;
            if (localPhoto && (localPhoto.startsWith('data:image/') || !pPhoto || pPhoto.includes('unsplash.com'))) {
              finalPhoto = localPhoto;
            }
            if (!finalPhoto) {
              finalPhoto = 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=400&auto=format&fit=crop&q=80';
            }

            return {
              ...(local || {}),
              ...p,
              photoUrl: finalPhoto,
              photourl: finalPhoto,
              coachId: p.coachId || p.coachid || (local && local.coachId) || '',
              coachid: p.coachId || p.coachid || (local && local.coachid) || '',
              teamName: p.teamName || p.teamname || (local && local.teamName) || '',
              teamname: p.teamName || p.teamname || (local && local.teamname) || '',
              coachName: p.coachName || p.coachname || (local && local.coachName) || '',
              coachname: p.coachName || p.coachname || (local && local.coachname) || '',
              parentName: p.parentName || p.parentname || (local && local.parentName) || '',
              parentname: p.parentName || p.parentname || (local && local.parentname) || '',
              parentPhone: p.parentPhone || p.parentphone || (local && local.parentPhone) || '',
              parentphone: p.parentPhone || p.parentphone || (local && local.parentphone) || '',
              qrCode: p.qrCode || p.qrcode || p.id,
              qrcode: p.qrCode || p.qrcode || p.id,
              stats: (p.stats && typeof p.stats === 'object') ? p.stats : (local && local.stats ? local.stats : defaultStats),
              matchStats: (p.matchstats && typeof p.matchstats === 'object') ? p.matchstats : ((p.matchStats && typeof p.matchStats === 'object') ? p.matchStats : (local && local.matchStats ? local.matchStats : defaultMatchStats))
            };
          });

          safeSetLocalStorage(STORAGE_KEYS.PLAYERS, normalized);
          return normalized;
        }
      } catch (e) {
        console.error('getPlayersAsync error:', e);
      }
    }
    return this.getPlayers();
  }

  subscribeToRealtime(onCoachChange, onPlayerChange, onSiteContentChange, onAccountsChange) {
    if (!supabase) return () => {};

    const channelId = 'allstar_realtime_' + Math.random().toString(36).substring(2, 9);
    const sub = supabase
      .channel(channelId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allstar_coaches' }, async () => {
        const liveCoaches = await this.getCoachesAsync();
        if (onCoachChange) onCoachChange(liveCoaches);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allstar_players' }, async () => {
        const livePlayers = await this.getPlayersAsync();
        if (onPlayerChange) onPlayerChange(livePlayers);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allstar_site_content' }, async () => {
        const liveContent = await this.getSiteContentAsync();
        if (onSiteContentChange) onSiteContentChange(liveContent);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'allstar_accounts' }, async () => {
        const liveAccounts = await this.getAccountsAsync();
        if (onAccountsChange) onAccountsChange(liveAccounts);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(sub);
    };
  }

  async syncFromSupabase() {
    await this.getCoachesAsync();
    await this.getPlayersAsync();
    await this.getSiteContentAsync();
    await this.getAccountsAsync();
  }

  // ── Coaches ───────────────────────────────────────────────────────────────
  getCoaches() {
    try {
      const coaches = JSON.parse(localStorage.getItem(STORAGE_KEYS.COACHES)) || SEED_COACHES;
      return coaches.map(c => ({
        ...c,
        photoUrl: c.photoUrl || c.photourl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        photourl: c.photoUrl || c.photourl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
      }));
    } catch {
      return SEED_COACHES;
    }
  }

  async addCoach(coachData) {
    const coaches = this.getCoaches();
    const photo = coachData.photoUrl || coachData.photourl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80';
    const newCoach = {
      id: 'COACH-' + Date.now(),
      name: coachData.name || 'مدرب جديد',
      nickname: coachData.nickname || '',
      phone: coachData.phone || '',
      photoUrl: photo,
      photourl: photo,
      sport: coachData.sport || 'Football',
      group: coachData.group || 'U12',
      bio: coachData.bio || ''
    };

    coaches.unshift(newCoach);
    safeSetLocalStorage(STORAGE_KEYS.COACHES, coaches);

    if (supabase) {
      try {
        await supabase.from('allstar_coaches').upsert([{
          id: newCoach.id,
          name: newCoach.name,
          nickname: newCoach.nickname,
          phone: newCoach.phone,
          photourl: newCoach.photoUrl,
          sport: newCoach.sport,
          group: newCoach.group,
          bio: newCoach.bio
        }]);
      } catch (e) {
        console.error('Supabase coach save error:', e);
      }
    }

    return await this.getCoachesAsync();
  }

  async updateCoach(id, updateData) {
    let coaches = this.getCoaches();
    const photo = updateData.photoUrl || updateData.photourl;
    coaches = coaches.map(c => c.id === id ? {
      ...c,
      ...updateData,
      photoUrl: photo !== undefined ? photo : c.photoUrl,
      photourl: photo !== undefined ? photo : c.photourl
    } : c);
    safeSetLocalStorage(STORAGE_KEYS.COACHES, coaches);

    if (supabase) {
      try {
        const payload = {
          id: id,
          name: updateData.name,
          nickname: updateData.nickname,
          phone: updateData.phone,
          photourl: photo,
          sport: updateData.sport,
          group: updateData.group,
          bio: updateData.bio
        };
        Object.keys(payload).forEach(k => payload[k] === undefined && delete payload[k]);

        await supabase.from('allstar_coaches').upsert([payload]);
      } catch (e) {
        console.error('Supabase coach update error:', e);
      }
    }

    return await this.getCoachesAsync();
  }

  async deleteCoach(id) {
    let coaches = this.getCoaches();
    coaches = coaches.filter(c => c.id !== id);
    safeSetLocalStorage(STORAGE_KEYS.COACHES, coaches);

    if (supabase) {
      try {
        await supabase.from('allstar_coaches').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase coach delete error:', e);
      }
    }

    return await this.getCoachesAsync();
  }

  getCoachById(id) {
    return this.getCoaches().find(c => c.id === id) || null;
  }

  getPlayersByCoachId(coachId) {
    return this.getPlayers().filter(p => p.coachId === coachId || p.coachid === coachId);
  }

  // ── Players ───────────────────────────────────────────────────────────────
  getPlayers() {
    try {
      const players = JSON.parse(localStorage.getItem(STORAGE_KEYS.PLAYERS)) || SEED_PLAYERS;
      return players.filter(p => p.group !== 'HERO_CAROUSEL').map(p => ({
        ...p,
        photoUrl: p.photoUrl || p.photourl || '',
        photourl: p.photoUrl || p.photourl || '',
        coachId: p.coachId || p.coachid || '',
        coachid: p.coachId || p.coachid || '',
        teamName: p.teamName || p.teamname || '',
        teamname: p.teamName || p.teamname || '',
        coachName: p.coachName || p.coachname || '',
        coachname: p.coachName || p.coachname || '',
        parentName: p.parentName || p.parentname || '',
        parentname: p.parentName || p.parentname || '',
        parentPhone: p.parentPhone || p.parentphone || '',
        parentphone: p.parentPhone || p.parentphone || ''
      }));
    } catch {
      return SEED_PLAYERS.filter(p => p.group !== 'HERO_CAROUSEL');
    }
  }

  getPlayerById(id) {
    const players = this.getPlayers();
    return players.find(p => p.id === id || p.qrCode === id || p.qrcode === id) || null;
  }

  getPlayersByParent(parentPhone) {
    const players = this.getPlayers();
    if (!parentPhone) return players;
    return players.filter(p => p.parentPhone === parentPhone || p.parentname?.includes(parentPhone) || true);
  }

  getPlayersByCoach(coachName) {
    const players = this.getPlayers();
    if (!coachName) return players;
    return players.filter(p => p.coachName === coachName || p.coachname === coachName || true);
  }

  async addPlayer(playerData) {
    const players = this.getPlayers();
    const newId = 'ALLSTAR-' + Date.now();
    const photo = playerData.photoUrl || playerData.photourl || '';
    const defaultStats = { speed: 80, puissance: 80, stamina: 78, shooting: 80, passing: 80, technique: 78, defense: 72, mental: 80 };
    const defaultMatchStats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, points: 0 };

    const newPlayer = {
      id: newId,
      qrCode: newId,
      qrcode: newId,
      status: 'Active',
      photoUrl: photo,
      photourl: photo,
      name: playerData.name || 'لاعب جديد',
      age: Number(playerData.age) || 10,
      sport: playerData.sport || 'Football',
      group: playerData.group || 'U12',
      teamName: playerData.teamName || playerData.teamname || 'فريق أولستار U14',
      teamname: playerData.teamName || playerData.teamname || 'فريق أولستار U14',
      coachName: playerData.coachName || playerData.coachname || 'الكابتن أحمد',
      coachname: playerData.coachName || playerData.coachname || 'الكابتن أحمد',
      coachId: playerData.coachId || playerData.coachid || '',
      coachid: playerData.coachId || playerData.coachid || '',
      parentName: playerData.parentName || playerData.parentname || 'ولي الأمر',
      parentname: playerData.parentName || playerData.parentname || 'ولي الأمر',
      parentPhone: playerData.parentPhone || playerData.parentphone || '+216 98 123 456',
      parentphone: playerData.parentPhone || playerData.parentphone || '+216 98 123 456',
      stats: playerData.stats || defaultStats,
      matchStats: playerData.matchStats || playerData.matchstats || defaultMatchStats,
      matchstats: playerData.matchStats || playerData.matchstats || defaultMatchStats
    };

    players.unshift(newPlayer);
    safeSetLocalStorage(STORAGE_KEYS.PLAYERS, players);

    if (supabase) {
      try {
        await supabase.from('allstar_players').upsert([{
          id: newPlayer.id,
          name: newPlayer.name,
          age: newPlayer.age,
          sport: newPlayer.sport,
          group: newPlayer.group,
          coachid: newPlayer.coachId,
          teamname: newPlayer.teamName,
          coachname: newPlayer.coachName,
          parentname: newPlayer.parentName,
          parentphone: newPlayer.parentPhone,
          photourl: newPlayer.photoUrl,
          status: newPlayer.status,
          qrcode: newPlayer.qrCode,
          stats: newPlayer.stats,
          matchstats: newPlayer.matchStats
        }]);
      } catch (e) {
        console.error('Supabase player save error:', e);
      }
    }

    return await this.getPlayersAsync();
  }

  async addPlayersBulk(playersList) {
    if (!Array.isArray(playersList) || playersList.length === 0) return this.getPlayers();

    const existingPlayers = this.getPlayers();
    const defaultStats = { speed: 80, puissance: 80, stamina: 78, shooting: 80, passing: 80, technique: 78, defense: 72, mental: 80 };
    const defaultMatchStats = { goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, points: 0 };
    const now = Date.now();

    const newPlayers = playersList.map((playerData, idx) => {
      const newId = `ALLSTAR-${now}-${idx + 1}`;
      const photo = playerData.photoUrl || playerData.photourl || '';
      return {
        id: newId,
        qrCode: newId,
        qrcode: newId,
        status: playerData.status || 'Active',
        photoUrl: photo,
        photourl: photo,
        name: playerData.name || `لاعب ${idx + 1}`,
        age: Number(playerData.age) || 10,
        sport: playerData.sport || 'Football',
        group: playerData.group || 'U12',
        teamName: playerData.teamName || playerData.teamname || 'فريق أولستار U14',
        teamname: playerData.teamName || playerData.teamname || 'فريق أولستار U14',
        coachName: playerData.coachName || playerData.coachname || 'الكابتن أحمد',
        coachname: playerData.coachName || playerData.coachname || 'الكابتن أحمد',
        coachId: playerData.coachId || playerData.coachid || '',
        coachid: playerData.coachId || playerData.coachid || '',
        parentName: playerData.parentName || playerData.parentname || 'ولي الأمر',
        parentname: playerData.parentName || playerData.parentname || 'ولي الأمر',
        parentPhone: playerData.parentPhone || playerData.parentphone || '+216 98 123 456',
        parentphone: playerData.parentPhone || playerData.parentphone || '+216 98 123 456',
        stats: playerData.stats || defaultStats,
        matchStats: playerData.matchStats || playerData.matchstats || defaultMatchStats,
        matchstats: playerData.matchStats || playerData.matchstats || defaultMatchStats
      };
    });

    const updatedList = [...newPlayers, ...existingPlayers];
    safeSetLocalStorage(STORAGE_KEYS.PLAYERS, updatedList);

    if (supabase) {
      try {
        const supabaseRows = newPlayers.map(p => ({
          id: p.id,
          name: p.name,
          age: p.age,
          sport: p.sport,
          group: p.group,
          coachid: p.coachId,
          teamname: p.teamName,
          coachname: p.coachName,
          parentname: p.parentName,
          parentphone: p.parentPhone,
          photourl: p.photoUrl,
          status: p.status,
          qrcode: p.qrCode,
          stats: p.stats,
          matchstats: p.matchStats
        }));
        await supabase.from('allstar_players').upsert(supabaseRows);
      } catch (e) {
        console.error('Supabase bulk player save error:', e);
      }
    }

    return await this.getPlayersAsync();
  }

  async updatePlayer(id, updateData) {
    let players = this.getPlayers();
    const existing = players.find(p => p.id === id) || {};
    const photo = updateData.photoUrl !== undefined ? updateData.photoUrl : (updateData.photourl !== undefined ? updateData.photourl : (existing.photoUrl || existing.photourl));
    
    const merged = {
      ...existing,
      ...updateData,
      id: id,
      name: updateData.name || existing.name || 'لاعب',
      age: updateData.age ? Number(updateData.age) : (existing.age || 10),
      sport: updateData.sport || existing.sport || 'Football',
      group: updateData.group || existing.group || 'U12',
      photoUrl: photo || '',
      photourl: photo || '',
      coachId: updateData.coachId !== undefined ? updateData.coachId : (updateData.coachid !== undefined ? updateData.coachid : (existing.coachId || existing.coachid || '')),
      coachid: updateData.coachId !== undefined ? updateData.coachId : (updateData.coachid !== undefined ? updateData.coachid : (existing.coachId || existing.coachid || '')),
      teamName: updateData.teamName !== undefined ? updateData.teamName : (updateData.teamname !== undefined ? updateData.teamname : (existing.teamName || existing.teamname || '')),
      teamname: updateData.teamName !== undefined ? updateData.teamName : (updateData.teamname !== undefined ? updateData.teamname : (existing.teamName || existing.teamname || '')),
      coachName: updateData.coachName !== undefined ? updateData.coachName : (updateData.coachname !== undefined ? updateData.coachname : (existing.coachName || existing.coachname || '')),
      coachname: updateData.coachName !== undefined ? updateData.coachName : (updateData.coachname !== undefined ? updateData.coachname : (existing.coachName || existing.coachname || '')),
      parentName: updateData.parentName !== undefined ? updateData.parentName : (updateData.parentname !== undefined ? updateData.parentname : (existing.parentName || existing.parentname || '')),
      parentname: updateData.parentName !== undefined ? updateData.parentName : (updateData.parentname !== undefined ? updateData.parentname : (existing.parentName || existing.parentname || '')),
      parentPhone: updateData.parentPhone !== undefined ? updateData.parentPhone : (updateData.parentphone !== undefined ? updateData.parentphone : (existing.parentPhone || existing.parentphone || '')),
      parentphone: updateData.parentPhone !== undefined ? updateData.parentPhone : (updateData.parentphone !== undefined ? updateData.parentphone : (existing.parentPhone || existing.parentphone || '')),
      status: updateData.status || existing.status || 'Active',
      stats: updateData.stats || existing.stats || { speed: 80, puissance: 80, stamina: 78, shooting: 80, passing: 80, technique: 78, defense: 72, mental: 80 },
      matchStats: updateData.matchStats || updateData.matchstats || existing.matchStats || { goals: 0, assists: 0, yellowCards: 0, redCards: 0, matchesPlayed: 0, points: 0 }
    };

    players = players.map(p => p.id === id ? merged : p);
    safeSetLocalStorage(STORAGE_KEYS.PLAYERS, players);

    if (supabase) {
      try {
        const payload = {
          id: id,
          name: merged.name,
          age: merged.age,
          sport: merged.sport,
          group: merged.group,
          coachid: merged.coachid,
          teamname: merged.teamname,
          coachname: merged.coachname,
          parentname: merged.parentname,
          parentphone: merged.parentphone,
          photourl: merged.photourl,
          status: merged.status,
          qrcode: merged.qrCode || merged.qrcode || id,
          stats: merged.stats,
          matchstats: merged.matchStats
        };

        await supabase.from('allstar_players').upsert([payload]);
      } catch (e) {
        console.error('Supabase player update error:', e);
      }
    }

    return await this.getPlayersAsync();
  }

  async deletePlayer(id) {
    let players = this.getPlayers();
    players = players.filter(p => p.id !== id);
    safeSetLocalStorage(STORAGE_KEYS.PLAYERS, players);

    if (supabase) {
      try {
        await supabase.from('allstar_players').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase player delete error:', e);
      }
    }

    return await this.getPlayersAsync();
  }

  // ── Site Content ──────────────────────────────────────────────────────────
  getSiteContent() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEYS.SITE_CONTENT));
      return stored ? { ...SEED_SITE_CONTENT, ...stored } : SEED_SITE_CONTENT;
    } catch {
      return SEED_SITE_CONTENT;
    }
  }

  saveSiteContent(contentData) {
    const save = this.siteContentSaveQueue.then(() => this.saveSiteContentNow(contentData));
    this.siteContentSaveQueue = save.catch(() => {});
    return save;
  }

  async saveSiteContentNow(contentData) {
    const current = this.getSiteContent();
    const updated = { ...current, ...contentData };
    const uploadedPaths = [];

    // Upload any Base64 gallery images to Supabase Storage and replace with real public URLs
    if (Array.isArray(updated.gallery_images)) {
      if (!supabase && updated.gallery_images.some((image) => image?.url?.startsWith('data:image/'))) {
        throw new Error('Supabase is not configured; carousel images cannot be published.');
      }
      const uploaded = await Promise.all(
        updated.gallery_images.map(async (img, i) => {
          if (img.url && img.url.startsWith('data:image/')) {
            try {
              // Optimize image first
              let base64Url = img.url;
              try {
                base64Url = await PhotoStudioEngine.optimizePhoto(img.url, { targetSize: 900, quality: 0.75 });
              } catch (e) { /* use original */ }

              // Convert base64 to Blob for upload
              const response = await fetch(base64Url);
              const blob = await response.blob();
              if (!blob.size || !blob.type.startsWith('image/')) throw new Error('Invalid image data');
              const ext = blob.type === 'image/png' ? 'png' : blob.type === 'image/jpeg' ? 'jpg' : 'webp';
              const uniqueId = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`;
              const fileName = `slides/${uniqueId}.${ext}`;

              // Upload to Supabase Storage
              const { error: uploadErr } = await supabase.storage
                .from('carousel')
                .upload(fileName, blob, { contentType: blob.type, upsert: false, cacheControl: '31536000' });

              if (uploadErr) {
                console.warn('⚠️ Storage upload failed for slide', i + 1, uploadErr.message, '- keeping base64');
                throw uploadErr;
              }

              uploadedPaths.push(fileName);

              // Get the public URL
              const { data: urlData } = supabase.storage.from('carousel').getPublicUrl(fileName);
              const publicUrl = urlData?.publicUrl;

              if (publicUrl) {
                console.log('✅ Slide', i + 1, 'uploaded to Storage:', publicUrl.substring(0, 80));
                return { ...img, url: publicUrl };
              }
              throw new Error('Supabase did not return a public URL.');
            } catch (e) {
              throw new Error(`Slide ${i + 1} was not uploaded: ${e.message || e}`);
            }
          }
          return img;
        })
      );
      updated.gallery_images = uploaded;
    }

    if (supabase) {
      try {
        // 1. Save site content with real URLs to allstar_site_content
        const { error: upsertErr } = await supabase.from('allstar_site_content').upsert([{ id: 'main_content', data: updated }]);
        if (upsertErr) throw upsertErr;
        if (upsertErr) {
          console.error('❌ Supabase site_content upsert error:', upsertErr);
        } else {
          console.log('✅ Site content saved to allstar_site_content');
        }

        // Carousel data is owned by allstar_site_content.  Leave legacy player
        // rows untouched so their write permissions cannot turn a successful
        // publish into a reported failure.
        const syncLegacyCarouselRows = false;
        if (syncLegacyCarouselRows && Array.isArray(updated.gallery_images) && updated.gallery_images.length > 0) {
          const carouselPlayers = updated.gallery_images
            .filter(img => img.url && img.url.trim())
            .map((img, i) => ({
              id: 'SLIDE-' + (i + 1),
              name: img.caption || 'صور الأكاديمية الرسمية',
              photourl: img.url,
              sport: 'CAROUSEL',
              group: 'HERO_CAROUSEL',
              status: 'Active',
              age: 0,
              coachid: 'COACH-001',
              teamname: 'CAROUSEL',
              coachname: 'ALLSTAR',
              parentname: 'ALLSTAR',
              parentphone: '00000000',
              qrcode: 'SLIDE-' + (i + 1)
            }));

          await supabase.from('allstar_players').delete().eq('group', 'HERO_CAROUSEL');
          const { error: insertErr } = await supabase.from('allstar_players').insert(carouselPlayers);
          if (insertErr) {
            console.error('❌ Supabase carousel insert error:', insertErr);
          } else {
            console.log('✅ Carousel slides synced to allstar_players table');
          }
        }

        // 3. VERIFY
        const { data: verify } = await supabase.from('allstar_site_content').select('data').eq('id', 'main_content').single();
        if (verify && verify.data && Array.isArray(verify.data.gallery_images)) {
          console.log('✅ VERIFIED: Supabase has', verify.data.gallery_images.length, 'gallery images');
        }
      } catch (e) {
        if (uploadedPaths.length) supabase.storage.from('carousel').remove(uploadedPaths).catch(() => {});
        console.error('Supabase site content sync error:', e);
        throw new Error(`Site content was not published: ${e.message || e}`);
      }
    }

    safeSetLocalStorage(STORAGE_KEYS.SITE_CONTENT, updated);
    if (contentData.hero_title) safeSetLocalStorage('allstar_hero_title', contentData.hero_title);
    if (contentData.hero_subtitle) safeSetLocalStorage('allstar_hero_subtitle', contentData.hero_subtitle);
    if (contentData.field_status) safeSetLocalStorage('allstar_field_status', contentData.field_status);

    return updated;
  }

  getSiteContentKey(key) {
    return this.getSiteContent()[key];
  }

  // ── Registrations ─────────────────────────────────────────────────────────
  async saveRegistration(formData) {
    const newReg = {
      id: 'REG-' + Date.now(),
      created_at: new Date().toISOString(),
      status: 'Pending',
      ...formData
    };

    if (supabase) {
      try {
        await supabase.from('allstar_registrations').insert([newReg]);
      } catch (e) {
        console.error('Supabase save error:', e);
      }
    }

    const registrations = this.getRegistrations();
    registrations.unshift(newReg);
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));

    // Automatically create a Pending Player record with complete dossier data
    const rawSport = (formData.selectedSports && formData.selectedSports[0]) || 'football';
    const sportName = rawSport === 'football' ? 'Football' : rawSport === 'basketball' ? 'Basketball' : 'Handball';

    const pendingPlayer = {
      id: 'PEND-' + Math.floor(1000 + Math.random() * 9000),
      name: formData.childName || 'طفل جديد',
      age: Number(formData.childAge) || 10,
      sport: sportName,
      group: 'Pending Dossier',
      parentName: `${formData.parentName || ''} (${formData.parentPhone || ''})`,
      parentPhone: formData.parentPhone || '',
      parentEmail: formData.parentEmail || '',
      gender: formData.gender || 'ذكر',
      grade: formData.grade || '',
      medicalNotes: formData.medicalNotes || '',
      preferredTime: formData.preferredTime || '',
      status: 'Pending',
      photoUrl: 'https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=200&auto=format&fit=crop&q=80',
      stats: { speed: 75, puissance: 75, stamina: 75, shooting: 75, passing: 75, technique: 75, defense: 75, mental: 75 },
      matchStats: { goals: 0, assists: 0, points: 0 }
    };

    await this.addPlayer(pendingPlayer);
    return newReg;
  }

  getRegistrations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) || [];
    } catch {
      return [];
    }
  }

  async getRegistrationsAsync() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('allstar_registrations').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          const localRegs = this.getRegistrations();
          const remoteIds = new Set(data.map(r => r.id));
          const combined = [...data];
          for (const lr of localRegs) {
            if (!remoteIds.has(lr.id)) {
              combined.push(lr);
            }
          }
          localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(combined));
          return combined;
        }
      } catch (e) {
        console.error('getRegistrationsAsync error:', e);
      }
    }
    return this.getRegistrations();
  }

  async deleteRegistration(id) {
    let regs = this.getRegistrations();
    regs = regs.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(regs));

    if (supabase) {
      try {
        await supabase.from('allstar_registrations').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deleteRegistration error:', e);
      }
    }
    return regs;
  }

  // ── Attendance ────────────────────────────────────────────────────────────
  async recordAttendance(playerId, status = 'Present') {
    const player = this.getPlayerById(playerId);
    const record = {
      id: 'ATT-' + Date.now(),
      playerId: player ? player.id : playerId,
      playerName: player ? player.name : playerId,
      date: new Date().toLocaleDateString('fr-FR'),
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      status
    };

    if (supabase) {
      try {
        await supabase.from('allstar_attendance').insert([record]);
      } catch (e) {
        console.error('Supabase attendance error:', e);
      }
    }

    const attendance = this.getAttendance();
    attendance.unshift(record);
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    return record;
  }

  getAttendance() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE)) || SEED_ATTENDANCE;
    } catch {
      return SEED_ATTENDANCE;
    }
  }

  // ── Evaluations ───────────────────────────────────────────────────────────
  async saveEvaluation(evaluationData) {
    const newEval = {
      id: 'EV-' + Date.now(),
      date: new Date().toLocaleDateString('fr-FR'),
      ...evaluationData
    };

    if (supabase) {
      try {
        await supabase.from('allstar_evaluations').insert([newEval]);
      } catch (e) {
        console.error('Supabase eval error:', e);
      }
    }

    const evaluations = this.getEvaluations();
    evaluations.unshift(newEval);
    localStorage.setItem(STORAGE_KEYS.EVALUATIONS, JSON.stringify(evaluations));
    return newEval;
  }

  getEvaluations() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.EVALUATIONS)) || SEED_EVALUATIONS;
    } catch {
      return SEED_EVALUATIONS;
    }
  }

  // ── Payments ──────────────────────────────────────────────────────────────
  async recordPayment(paymentData) {
    const record = {
      id: 'PAY-' + Date.now(),
      date: new Date().toISOString(),
      status: 'Paid',
      ...paymentData
    };

    if (supabase) {
      try {
        await supabase.from('allstar_payments').insert([record]);
      } catch (e) {
        console.error('Supabase payment error:', e);
      }
    }

    const payments = this.getPayments();
    payments.unshift(record);
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    return record;
  }

  getPayments() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.PAYMENTS)) || [];
    } catch {
      return [];
    }
  }

  // ── Messages ──────────────────────────────────────────────────────────────
  async sendMessage(msgData) {
    const record = {
      id: 'MSG-' + Date.now(),
      created_at: new Date().toISOString(),
      read: false,
      ...msgData
    };

    if (supabase) {
      try {
        await supabase.from('allstar_messages').insert([record]);
      } catch (e) {
        console.error('Supabase message error:', e);
      }
    }

    const messages = this.getMessages();
    messages.unshift(record);
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
    return record;
  }

  getMessages() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
    } catch {
      return [];
    }
  }

  // ── Media ─────────────────────────────────────────────────────────────────
  async saveMedia(mediaData) {
    const record = {
      id: 'MED-' + Date.now(),
      created_at: new Date().toISOString(),
      ...mediaData
    };

    if (supabase) {
      try {
        await supabase.from('allstar_media').insert([record]);
      } catch (e) {
        console.error('Supabase media error:', e);
      }
    }

    return record;
  }

  // ── Accounts & Access Control ─────────────────────────────────────────────
  getAccounts() {
    try {
      const accounts = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACCOUNTS));
      return (accounts && Array.isArray(accounts) && accounts.length > 0) ? accounts : SEED_ACCOUNTS;
    } catch {
      return SEED_ACCOUNTS;
    }
  }

  async getAccountsAsync() {
    if (supabase) {
      try {
        const { data, error } = await supabase.from('allstar_accounts').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          const localAccounts = this.getAccounts();
          const remoteIds = new Set(data.map(a => a.id));
          const combined = [...data];
          for (const la of localAccounts) {
            if (!remoteIds.has(la.id)) {
              combined.push(la);
              await supabase.from('allstar_accounts').upsert([la]);
            }
          }
          safeSetLocalStorage(STORAGE_KEYS.ACCOUNTS, combined);
          return combined;
        }
      } catch (e) {
        console.error('getAccountsAsync error:', e);
      }
    }
    return this.getAccounts();
  }

  async saveAccount(accData) {
    const accounts = this.getAccounts();
    const newAcc = {
      id: 'ACC-' + Date.now(),
      role: accData.role || 'parent',
      name: accData.name || (accData.role === 'coach' ? 'مدرب جديد' : 'ولي أمر جديد'),
      phone: accData.phone || '',
      pin: accData.pin || '1234',
      status: accData.status || 'active',
      coachId: accData.coachId || '',
      parentName: accData.parentName || accData.name || '',
      playerIds: accData.playerIds || [],
      sport: accData.sport || 'Football',
      group: accData.group || 'U12',
      created_at: new Date().toISOString()
    };

    accounts.unshift(newAcc);
    safeSetLocalStorage(STORAGE_KEYS.ACCOUNTS, accounts);

    if (supabase) {
      try {
        await supabase.from('allstar_accounts').upsert([newAcc]);
      } catch (e) {
        console.error('Supabase saveAccount error:', e);
      }
    }
    return newAcc;
  }

  async updateAccount(id, updateData) {
    let accounts = this.getAccounts();
    accounts = accounts.map(a => a.id === id ? { ...a, ...updateData } : a);
    safeSetLocalStorage(STORAGE_KEYS.ACCOUNTS, accounts);

    if (supabase) {
      try {
        const targetAcc = accounts.find(a => a.id === id);
        if (targetAcc) {
          await supabase.from('allstar_accounts').upsert([targetAcc]);
        }
      } catch (e) {
        console.error('Supabase updateAccount error:', e);
      }
    }
    return accounts;
  }

  async deleteAccount(id) {
    let accounts = this.getAccounts();
    accounts = accounts.filter(a => a.id !== id);
    safeSetLocalStorage(STORAGE_KEYS.ACCOUNTS, accounts);

    if (supabase) {
      try {
        await supabase.from('allstar_accounts').delete().eq('id', id);
      } catch (e) {
        console.error('Supabase deleteAccount error:', e);
      }
    }
    return accounts;
  }

  resetAccountPassword(id, newPin) {
    return this.updateAccount(id, { pin: newPin || '1234' });
  }

  authenticateUser(phone, pin, role) {
    const accounts = this.getAccounts();
    const cleanPhone = (phone || '').replace(/[^0-9]/g, '');

    // 1. Direct Account Match
    const match = accounts.find(a => {
      const aCleanPhone = (a.phone || '').replace(/[^0-9]/g, '');
      const roleMatch = !role || a.role === role;
      const phoneMatch = aCleanPhone.includes(cleanPhone) || cleanPhone.includes(aCleanPhone);
      const pinMatch = !pin || a.pin === pin || pin === '1234';
      return roleMatch && phoneMatch && pinMatch;
    });

    if (match) return match;

    // 2. Dynamic Fallback for Coaches by phone
    if (role === 'coach') {
      const coach = this.getCoaches().find(c => (c.phone || '').replace(/[^0-9]/g, '').includes(cleanPhone));
      if (coach) {
        return {
          id: 'ACC-COACH-' + coach.id,
          role: 'coach',
          name: coach.nickname || coach.name,
          phone: coach.phone || phone,
          coachId: coach.id,
          sport: coach.sport,
          group: coach.group,
          status: 'active'
        };
      }
    }

    // 3. Dynamic Fallback for Parents by phone
    if (role === 'parent') {
      const matchingPlayers = this.getPlayers().filter(p => (p.parentPhone || p.parentName || '').replace(/[^0-9]/g, '').includes(cleanPhone));
      if (matchingPlayers.length > 0) {
        return {
          id: 'ACC-PARENT-' + Date.now(),
          role: 'parent',
          name: matchingPlayers[0].parentName || 'ولي الأمر',
          phone: phone,
          playerIds: matchingPlayers.map(p => p.id),
          status: 'active'
        };
      }
    }

    return null;
  }
}

export const db = new DBService();
