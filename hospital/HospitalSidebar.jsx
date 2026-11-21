import React from 'react';
import { Building2, CalendarDays, Settings, BarChart2, Stethoscope, KeyRound } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

const NAV = [
  { key: 'overview',  Icon: BarChart2,    en: 'Overview',          ar: 'نظرة عامة'           },
  { key: 'bookings',  Icon: CalendarDays, en: 'Bookings',          ar: 'الحجوزات'             },
  { key: 'services',  Icon: Stethoscope,  en: 'Departments',       ar: 'الأقسام والخدمات'     },
  { key: 'settings',  Icon: Settings,     en: 'Hospital Info',     ar: 'معلومات المستشفى'     },
  { key: 'login',     Icon: KeyRound,     en: 'Login Info',        ar: 'معلومات الدخول'        },
];

export default function HospitalSidebar({ hospital, activeTab, onTabChange, pendingCount }) {
  const { isRTL, lang } = useLanguage();
  const name = lang === 'ar' ? hospital?.name_ar : hospital?.name_en;

  const statusColor = hospital?.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
    : hospital?.status === 'suspended' ? 'bg-red-100 text-red-700'
    : 'bg-amber-100 text-amber-700';
  const statusLabel = hospital?.status === 'approved' ? (isRTL ? 'معتمد' : 'Approved')
    : hospital?.status === 'suspended' ? (isRTL ? 'موقوف' : 'Suspended')
    : (isRTL ? 'قيد المراجعة' : 'Pending');

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      <div className="bg-card rounded-2xl border border-teal-100 p-4 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center mb-3 shadow-md shadow-teal-500/20">
          <Building2 className="w-6 h-6 text-white" />
        </div>
        <p className="font-bold text-sm text-foreground truncate">{name}</p>
        <Badge className={`mt-1 text-[10px] border-0 ${statusColor}`}>{statusLabel}</Badge>
      </div>

      <nav className="bg-card rounded-2xl border border-teal-100 overflow-hidden">
        {NAV.map((item, i) => {
          const isActive = activeTab === item.key;
          return (
            <button key={item.key} onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${i > 0 ? 'border-t border-teal-50' : ''} ${
                isActive ? 'bg-teal-500 text-white font-semibold' : 'text-muted-foreground hover:bg-teal-50 hover:text-teal-700'
              }`}>
              <item.Icon className="w-4 h-4 flex-shrink-0" />
              <span>{isRTL ? item.ar : item.en}</span>
              {item.key === 'bookings' && pendingCount > 0 && (
                <span className={`ms-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-700'}`}>
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}