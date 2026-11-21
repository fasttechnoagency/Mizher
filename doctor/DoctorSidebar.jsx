import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { LayoutDashboard, CalendarDays, User, Settings, Stethoscope, MessageSquare, ChevronRight, KeyRound, Video } from 'lucide-react';

const TABS = [
  { key: 'overview',  iconComp: LayoutDashboard, en: 'Overview',     ar: 'نظرة عامة',  iconColor: '#1976d2' },
  { key: 'bookings',  iconComp: CalendarDays,    en: 'Appointments', ar: 'المواعيد',  badge: true, iconColor: '#64748b' },
  { key: 'video',     iconComp: Video,           en: 'Video Consultations', ar: 'استشارات الفيديو', iconColor: '#0d9488' },
  { key: 'messages',  iconComp: MessageSquare,   en: 'Messages',     ar: 'الرسائل',   msgBadge: true, iconColor: '#22c55e' },
  { key: 'services',  iconComp: Settings,        en: 'Services',     ar: 'الخدمات',    iconColor: '#f59e0b' },
  { key: 'profile',   iconComp: User,            en: 'Profile',      ar: 'الملف الطبي', iconColor: '#a855f7' },
  { key: 'login',     iconComp: KeyRound,        en: 'Login Info',   ar: 'معلومات الدخول', iconColor: '#0891b2' },
];

export default function DoctorSidebar({ doctor, activeTab, onTabChange, pendingCount, unreadMessages = 0 }) {
  const { isRTL, lang } = useLanguage();
  const name = lang === 'ar' ? (doctor?.name_ar || doctor?.name_en) : (doctor?.name_en || doctor?.name_ar);

  return (
    <aside className="md:w-52 flex-shrink-0">
      {/* Profile card */}
      <div className="bg-card rounded-2xl border border-teal-100 p-4 mb-3 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center mx-auto mb-3 shadow">
          {doctor?.photo_url
            ? <img src={doctor.photo_url} alt="" className="w-full h-full rounded-2xl object-cover" />
            : <Stethoscope className="w-7 h-7 text-white" />}
        </div>
        <p className="font-bold text-sm text-foreground leading-tight">{name}</p>
        <p className="text-xs text-teal-600 mt-0.5">{lang === 'ar' ? doctor?.specialty_ar : doctor?.specialty_en}</p>
        <span className={`inline-flex items-center text-[10px] font-semibold mt-2 px-2.5 py-0.5 rounded-full ${
          doctor?.status === 'approved'  ? 'bg-emerald-100 text-emerald-700' :
          doctor?.status === 'suspended' ? 'bg-red-100 text-red-700' :
                                           'bg-amber-100 text-amber-700'
        }`}>
          {doctor?.status === 'approved'  ? (isRTL ? '✅ معتمد' : '✅ Approved') :
           doctor?.status === 'suspended' ? (isRTL ? '🚫 موقوف' : '🚫 Suspended') :
                                            (isRTL ? '⏳ قيد المراجعة' : '⏳ Under Review')}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-2 overflow-x-visible pb-0">
        {TABS.map(({ key, iconComp: Icon, en, ar, badge, msgBadge, iconColor }) => {
          const isActive = activeTab === key;
          return (
            <button key={key} onClick={() => onTabChange(key)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-start border shadow-sm ${
                isActive 
                  ? 'bg-[#e6f0fa] border-[#2f7bc9] relative' 
                  : 'bg-[#f5f5f5] border-[#e0e0e0] hover:bg-[#f0f0f0]'
              }`}>
              {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#1976d2] rounded-l-xl" />}
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isActive ? '#1976d2' : `${iconColor}20` }}>
                <Icon className="w-4 h-4" style={{ color: isActive ? '#ffffff' : iconColor }} />
              </div>
              <span className="flex-1 text-foreground">{isRTL ? ar : en}</span>
              {key !== 'profile' && (
                <ChevronRight className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#1976d2]' : 'text-[#9e9e9e]'}`} />
              )}
              {badge && pendingCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-sm min-w-[20px] text-center">
                  {pendingCount}
                </span>
              )}
              {msgBadge && unreadMessages > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500 text-white shadow-sm min-w-[20px] text-center">
                  {unreadMessages}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}