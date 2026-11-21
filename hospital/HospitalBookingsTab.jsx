import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { ChevronDown, ChevronUp, CalendarDays, Search } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_STYLES = {
  pending:   'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  completed: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-600',
};
const STATUS_LABELS_AR = { pending:'قيد الانتظار', confirmed:'مؤكد', completed:'مكتمل', cancelled:'ملغي' };

export default function HospitalBookingsTab({ hospital, bookings }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  const updateMutation = useMutation({
    mutationFn: ({ id, status }) => {
      const session = getProviderSession();
      return base44.functions.invoke('updateHospitalBookingStatus', {
        hospital_id: hospital.id, booking_id: id, status,
        credential_id: session?.credentialId, session_token: session?.sessionToken,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(['hospital-bookings', hospital.id]);
      toast.success(isRTL ? 'تم تحديث الحجز' : 'Booking updated');
    },
    onError: () => toast.error(isRTL ? 'فشل التحديث' : 'Failed to update'),
  });

  const filtered = bookings.filter(b => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return b.patient_name?.toLowerCase().includes(q) || b.patient_phone?.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? 'ابحث باسم المريض...' : 'Search patient...'}
            className={`w-full h-9 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} bg-background rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20`} />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36 h-9 rounded-xl border-teal-100 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{isRTL ? 'كل الحالات' : 'All Status'}</SelectItem>
            {Object.keys(STATUS_STYLES).map(s => (
              <SelectItem key={s} value={s}>{isRTL ? STATUS_LABELS_AR[s] : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-2xl border border-teal-100 p-16 flex flex-col items-center gap-3 text-muted-foreground">
          <CalendarDays className="w-10 h-10 opacity-20" />
          <p className="text-sm">{isRTL ? 'لا توجد حجوزات' : 'No bookings'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(b => {
            const isOpen = expanded === b.id;
            return (
              <div key={b.id} className="bg-card rounded-2xl border border-teal-100 overflow-hidden">
                <button onClick={() => setExpanded(isOpen ? null : b.id)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-teal-50/30 transition text-start">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{b.patient_name}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLES[b.status]}`}>
                        {isRTL ? STATUS_LABELS_AR[b.status] : b.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {b.service_type} · {b.date} {b.time}
                      {b.department ? ` · ${b.department}` : ''}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
                </button>

                {isOpen && (
                  <div className="border-t border-teal-50 px-4 pb-4 pt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div><span className="font-medium text-foreground">{isRTL ? 'الهاتف: ' : 'Phone: '}</span>{b.patient_phone}</div>
                      {b.patient_email && <div><span className="font-medium text-foreground">{isRTL ? 'البريد: ' : 'Email: '}</span>{b.patient_email}</div>}
                      {b.total_amount && <div><span className="font-medium text-foreground">{isRTL ? 'المبلغ: ' : 'Amount: '}</span>{b.total_amount} {isRTL ? 'د.أ' : 'JOD'}</div>}
                      {b.payment_method && <div><span className="font-medium text-foreground">{isRTL ? 'الدفع: ' : 'Payment: '}</span>{b.payment_method}</div>}
                      {b.notes && <div className="col-span-2"><span className="font-medium text-foreground">{isRTL ? 'ملاحظات: ' : 'Notes: '}</span>{b.notes}</div>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium">{isRTL ? 'تحديث الحالة:' : 'Update Status:'}</span>
                      <Select value={b.status} onValueChange={s => updateMutation.mutate({ id: b.id, status: s })}>
                        <SelectTrigger className="h-8 flex-1 rounded-xl border-teal-100 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.keys(STATUS_STYLES).map(s => (
                            <SelectItem key={s} value={s} className="text-xs">
                              {isRTL ? STATUS_LABELS_AR[s] : s.charAt(0).toUpperCase() + s.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}