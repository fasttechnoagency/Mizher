import React from 'react';
import { useNavigate } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { Video, Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function DoctorVideoConsultationsTab({ bookings }) {
  const { isRTL } = useLanguage();
  const navigate = useNavigate();

  const upcoming = bookings
    .filter(b => b.consultation_type === 'video' && (b.status === 'confirmed' || b.status === 'pending'))
    .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`));

  return (
    <div className="bg-card rounded-2xl border border-teal-100 p-5">
      <h2 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
        <Video className="w-5 h-5 text-teal-600" />
        {isRTL ? 'استشارات الفيديو الخاصة بي' : 'My Video Consultations'}
      </h2>

      {upcoming.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-14 text-muted-foreground">
          <Video className="w-10 h-10 opacity-20 mb-3" />
          <p className="text-sm">{isRTL ? 'لا توجد استشارات فيديو قادمة' : 'No upcoming video consultations'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {upcoming.map(b => (
            <div key={b.id} className="flex items-center gap-4 p-4 bg-background rounded-xl border border-border hover:border-teal-200 transition-colors">
              <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Video className="w-5 h-5 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground truncate">{b.patient_name}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                  {b.date && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date}</span>}
                  {b.time && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span>}
                </div>
              </div>
              {b.status === 'confirmed' ? (
                <Button size="sm" onClick={() => navigate(`/video-call/${b.id}`)}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-full h-8 px-3 text-xs gap-1.5 flex-shrink-0">
                  <Video className="w-3.5 h-3.5" />
                  {isRTL ? 'ابدأ المكالمة' : 'Start Call'}
                </Button>
              ) : (
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 flex-shrink-0">
                  {isRTL ? 'قيد الانتظار' : 'Pending'}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}