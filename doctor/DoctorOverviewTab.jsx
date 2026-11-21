import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { CalendarDays, CheckCircle2, Clock, XCircle, DollarSign, MessageSquare, Phone, Video } from 'lucide-react';
import { Link } from '@/lib/router-compat';
import { Button } from '@/components/ui/button';
import { getDoctorFee, isConsultTypeActive } from '@/lib/doctorFees';

const SERVICE_PRICE_ROWS = [
  { key: 'message', icon: MessageSquare, lEn: 'Message', lAr: 'رسالة نصية' },
  { key: 'voice',   icon: Phone,         lEn: 'Voice Call', lAr: 'اتصال صوتي' },
  { key: 'video',   icon: Video,         lEn: 'Video Call', lAr: 'مكالمة فيديو' },
];

const STATUS_LABELS_AR = { pending: 'قيد الانتظار', confirmed: 'مؤكد', completed: 'مكتمل', cancelled: 'ملغي' };
const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};

export default function DoctorOverviewTab({ doctor, bookings }) {
  const { isRTL, lang } = useLanguage();

  const totalEarnings = bookings.filter(b => b.status === 'completed').reduce((s, b) => s + (b.total_amount || 0), 0);

  const stats = [
    { Icon: CalendarDays, v: bookings.length,                                     lEn: 'Total Appts',  lAr: 'إجمالي المواعيد', color: 'text-teal-600'   },
    { Icon: Clock,        v: bookings.filter(b => b.status === 'pending').length,  lEn: 'Pending',      lAr: 'قيد الانتظار',   color: 'text-amber-600'  },
    { Icon: CheckCircle2, v: bookings.filter(b => b.status === 'completed').length, lEn: 'Completed',   lAr: 'مكتملة',         color: 'text-emerald-600'},
    { Icon: DollarSign,   v: `${totalEarnings} ${isRTL ? 'د.أ' : 'JOD'}`,         lEn: 'Earnings',     lAr: 'الأرباح',        color: 'text-teal-700'   },
  ];

  const recent = [...bookings].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)).slice(0, 5);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-card rounded-2xl border border-teal-100 p-4 text-center">
            <s.Icon className={`w-6 h-6 mx-auto mb-1 ${s.color}`} />
            <p className="text-xl font-bold text-foreground">{s.v}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? s.lAr : s.lEn}</p>
          </div>
        ))}
      </div>

      {/* Public profile link */}
      {doctor?.status === 'approved' && (
        <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm text-teal-800">{isRTL ? 'ملفك الطبي مرئي للمرضى ✅' : 'Your profile is live ✅'}</p>
            <p className="text-xs text-teal-600 mt-0.5">{isRTL ? 'يمكن للمرضى حجز موعد معك الآن' : 'Patients can book appointments with you now'}</p>
          </div>
          <Link to={`/doctors/${doctor.id}`} target="_blank">
            <Button variant="outline" className="border-teal-300 text-teal-700 rounded-xl text-xs h-8">
              {isRTL ? 'عرض' : 'View'}
            </Button>
          </Link>
        </div>
      )}

      {/* Service Prices Summary */}
      <div className="bg-card rounded-2xl border border-teal-100 overflow-hidden">
        <div className="p-4 border-b border-teal-50">
          <h3 className="font-semibold text-sm">{isRTL ? 'أسعار الخدمات' : 'Service Prices'}</h3>
        </div>
        <div className="divide-y divide-teal-50">
          {SERVICE_PRICE_ROWS.map(row => {
            const Icon = row.icon;
            const active = isConsultTypeActive(doctor, row.key);
            return (
              <div key={row.key} className="flex items-center gap-3 p-4">
                <Icon className="w-4 h-4 text-teal-500 flex-shrink-0" />
                <span className="flex-1 text-sm font-medium">{isRTL ? row.lAr : row.lEn}</span>
                {active ? (
                  <span className="text-sm font-bold text-teal-700">{getDoctorFee(doctor, row.key)} {isRTL ? 'د.أ' : 'JOD'}</span>
                ) : (
                  <span className="text-xs text-muted-foreground">{isRTL ? 'غير مفعّل' : 'Not active'}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-teal-100 overflow-hidden">
        <div className="p-4 border-b border-teal-50">
          <h3 className="font-semibold text-sm">{isRTL ? 'آخر المواعيد' : 'Recent Appointments'}</h3>
        </div>
        {recent.length === 0 ? (
          <div className="p-10 text-center text-muted-foreground text-sm">
            {isRTL ? 'لا توجد مواعيد بعد' : 'No appointments yet'}
          </div>
        ) : (
          <div className="divide-y divide-teal-50">
            {recent.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-4">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{b.patient_name}</p>
                  <p className="text-xs text-muted-foreground">{b.consultation_type} · {b.date} {b.time}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full ${STATUS_STYLES[b.status] || 'bg-muted text-muted-foreground'}`}>
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