import React from 'react';
import { FlaskConical, BarChart2, Edit, Beaker, KeyRound } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { Badge } from '@/components/ui/badge';

const NAV = [
  { key: 'overview', Icon: BarChart2, en: 'Overview',  ar: 'نظرة عامة' },
  { key: 'services', Icon: Beaker,    en: 'Services',  ar: 'الخدمات'   },
  { key: 'edit',     Icon: Edit,      en: 'Lab Info',  ar: 'معلومات المختبر' },
  { key: 'login',    Icon: KeyRound,  en: 'Login Info', ar: 'معلومات الدخول' },
];

export default function LabSidebar({ lab, activeTab, onTabChange }) {
  const { isRTL, lang } = useLanguage();
  const name = lang === 'ar' ? lab?.name_ar : lab?.name_en;

  const statusColor = lab?.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
    : lab?.status === 'suspended' ? 'bg-red-100 text-red-700'
    : 'bg-amber-100 text-amber-700';
  const statusLabel = lab?.status === 'approved' ? (isRTL ? 'معتمد' : 'Approved')
    : lab?.status === 'suspended' ? (isRTL ? 'موقوف' : 'Suspended')
    : (isRTL ? 'قيد المراجعة' : 'Pending');

  return (
    <aside className="w-full md:w-56 flex-shrink-0">
      <div className="bg-card rounded-2xl border border-violet-100 p-4 mb-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-700 flex items-center justify-center mb-3 shadow-md shadow-violet-500/20">
          <FlaskConical className="w-6 h-6 text-white" />
        </div>
        <p className="font-bold text-sm text-foreground truncate">{name}</p>
        <Badge className={`mt-1 text-[10px] border-0 ${statusColor}`}>{statusLabel}</Badge>
      </div>

      <nav className="bg-card rounded-2xl border border-violet-100 overflow-hidden">
        {NAV.map((item, i) => {
          const isActive = activeTab === item.key;
          return (
            <button key={item.key} onClick={() => onTabChange(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-all ${i > 0 ? 'border-t border-violet-50' : ''} ${
                isActive ? 'bg-violet-500 text-white font-semibold' : 'text-muted-foreground hover:bg-violet-50 hover:text-violet-700'
              }`}>
              <item.Icon className="w-4 h-4 flex-shrink-0" />
              <span>{isRTL ? item.ar : item.en}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}