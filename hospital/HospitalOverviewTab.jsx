import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { CalendarDays, CheckCircle2, Clock, XCircle, TrendingUp } from 'lucide-react';

const STATUS_LABELS_AR = { pending:'قيد الانتظار', confirmed:'مؤكد', completed:'مكتمل', cancelled:'ملغي' };
const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function HospitalOverviewTab({ hospital, bookings }) {
  const { isRTL, lang } = useLanguage();

  const stats = [
    { Icon: CalendarDays, v: bookings.length,                                   lEn: 'Total Bookings',   lAr: 'إجمالي الحجوزات', color: 'text-teal-600' },
    { Icon: Clock,        v: bookings.filter(b => b.status === 'pending').length,  lEn: 'Pending',         lAr: 'قيد الانتظار',    color: 'text-amber-600' },
    { Icon: CheckCircle2, v: bookings.filter(b => b.status === 'confirmed').length, lEn: 'Confirmed',      lAr: 'مؤكدة',          color: 'text-blue-600'  },
    { Icon: TrendingUp,   v: bookings.filter(b => b.status === 'completed').length, lEn: 'Completed',      lAr: 'مكتملة',         color: 'text-emerald-600'},
  ];

  const recent = [...bookings].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  return (
    <div className="space-y-5">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-teal-100 p-4 text-center">
            <s.Icon className={`w-6 h-6 mx-auto mb-1 ${s.color}`} />
            <p className="text-2xl font-bold text-foreground">{s.v}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? s.lAr : s.lEn}</p>
          </div>
        ))}
      </div>

      {/* Recent bookings */}
      <div className="bg-card rounded-2xl border border-teal-100 overflow-hidden">
        <div className="p-4 border-b border-teal-50">
          <h3 className="font-semibold text-sm">{isRTL ? 'آخر الحجوزات' : 'Recent Bookings'}</h3>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {isRTL ? 'لا توجد حجوزات بعد' : 'No bookings yet'}
          </div>
        ) : (
          <div className="divide-y divide-teal-50">
            {recent.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{b.patient_name}</p>
                  <p className="text-xs text-muted-foreground">{b.service_type} · {b.date} {b.time}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border-0 ${STATUS_STYLES[b.status]}`}>
                  {isRTL ? STATUS_LABELS_AR[b.status] : b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}