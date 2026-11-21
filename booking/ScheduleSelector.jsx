import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Phone, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addDays, isSameDay, startOfToday } from 'date-fns';
import { motion } from 'framer-motion';
import { getDoctorFee, isConsultTypeActive } from '@/lib/doctorFees';
import { formatPrice } from '@/lib/currency';

const CONSULT_TYPES = [
  { value: 'voice',   iconComp: Phone,          labelEn: 'Voice Call', labelAr: 'اتصال صوتي'   },
  { value: 'video',   iconComp: Video,          labelEn: 'Video Call', labelAr: 'مكالمة فيديو' },
];

// Converts a 24h "HH:MM" time to a 12h "hh:MM AM/PM" label
function formatTimeLabel(time24) {
  const [h, m] = time24.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${String(hour12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${period}`;
}

// Returns the doctor's available time slots (formatted) for the given day abbreviation, e.g. "Mon"
function getSlotsForDay(doctor, dayAbbr) {
  const slots = doctor?.available_slots || [];
  return slots
    .filter(s => s.split(' ')[0] === dayAbbr)
    .map(s => s.split(' ')[1])
    .filter(Boolean)
    .sort()
    .map(formatTimeLabel);
}

export default function ScheduleSelector({ doctor, consultType, date, time, onConsultTypeChange, onDateChange, onTimeChange }) {
  const { isRTL, t, lang } = useLanguage();
  const today = startOfToday();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(today, i + weekOffset * 7));

  const availableTypes = CONSULT_TYPES.filter(c => isConsultTypeActive(doctor, c.value));
  const totalFee = getDoctorFee(doctor, consultType);
  const selectedDayAbbr = date ? format(new Date(date), 'EEE') : format(today, 'EEE');
  const availableSlots = getSlotsForDay(doctor, selectedDayAbbr);

  useEffect(() => {
    if (doctor && availableTypes.length > 0 && !availableTypes.some(c => c.value === consultType)) {
      onConsultTypeChange(availableTypes[0].value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctor?.id]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {t('scheduleAppointment')}
        </h2>
        <p className="text-sm text-muted-foreground">
          {t('scheduleDesc')}
        </p>
      </div>

      {/* Doctor Mini Card */}
      {doctor && (
        <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
          <img src={doctor.photo_url} alt="" className="w-10 h-10 rounded-lg object-cover" />
          <div>
            <p className="font-semibold text-sm">{isRTL ? doctor.name_ar : doctor.name_en}</p>
            <p className="text-xs text-teal-600">{isRTL ? doctor.specialty_ar : doctor.specialty_en}</p>
          </div>
          <span className="ms-auto text-sm font-bold text-teal-700">{formatPrice(totalFee, lang)}</span>
        </div>
      )}

      {/* Consultation Type */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">
          {t('consultationType')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {availableTypes.map(ct => {
            const Icon = ct.iconComp;
            const isActive = consultType === ct.value;
            const fee = getDoctorFee(doctor, ct.value);
            return (
              <button
                key={ct.value}
                onClick={() => onConsultTypeChange(ct.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                  isActive
                    ? 'border-teal-500 bg-teal-50 text-teal-700'
                    : 'border-teal-100 bg-card text-muted-foreground hover:border-teal-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-teal-500' : ''}`} />
                {isRTL ? ct.labelAr : ct.labelEn}
                <span className={`text-[10px] ${isActive ? 'text-teal-600 font-bold' : 'text-muted-foreground'}`}>
                  {formatPrice(fee, lang)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date Picker */}
      <div>
        <p className="text-lg font-bold text-foreground text-center mb-2">{t('selectDate2')}</p>
        <div className="flex items-center justify-center gap-3 mb-3">
          <span className="text-sm text-muted-foreground">{weekOffset === 0 ? (isRTL ? 'هذا الأسبوع' : 'This Week') : (isRTL ? 'الأسبوع القادم' : 'Next Week')}</span>
          <button
            onClick={() => setWeekOffset(w => Math.max(0, w - 1))}
            disabled={weekOffset === 0}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted disabled:opacity-30 transition"
          >
            {isRTL ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
          <span className="text-sm font-bold text-foreground">
            {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d')}
          </span>
          <button
            onClick={() => setWeekOffset(w => w + 1)}
            className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition"
          >
            {isRTL ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {weekDays.map((day, i) => {
            const isSelected = date && isSameDay(new Date(date), day);
            const isToday    = isSameDay(day, today);
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.93 }}
                onClick={() => onDateChange(format(day, 'yyyy-MM-dd'))}
                className={`flex flex-col items-center py-2.5 px-1 rounded-lg border text-xs transition-all ${
                  isSelected
                    ? 'bg-teal-500 border-teal-500 text-white'
                    : isToday
                    ? 'bg-muted border-border text-foreground'
                    : 'bg-card border-border text-foreground hover:border-teal-300'
                }`}
              >
                <span className="font-medium">{format(day, 'EEE').slice(0, 2)}</span>
                <span className="text-base font-bold mt-0.5">
                  {format(day, 'd')}
                </span>
                {(isSelected || isToday) && (
                  <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-white' : 'text-muted-foreground'}`}>
                    {isSelected ? (isRTL ? 'محدد' : 'Selected') : (isRTL ? 'اليوم' : 'Today')}
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Time Slots */}
      <div>
        <p className="text-sm font-semibold text-foreground mb-2">{t('selectTime2')}</p>
        {availableSlots.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-xl">
            {t('noSlotsAvailable') || (isRTL ? 'لا توجد مواعيد متاحة في هذا اليوم' : 'No slots available on this day')}
          </p>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {availableSlots.map(slot => {
              const isSelected = time === slot;
              return (
                <button
                  key={slot}
                  onClick={() => onTimeChange(slot)}
                  className={`py-2 px-2 rounded-xl text-xs font-medium border transition-all ${
                    isSelected
                      ? 'bg-teal-500 text-white border-teal-500 shadow-md shadow-teal-500/20'
                      : 'bg-card border-teal-100 text-foreground hover:border-teal-300 hover:bg-teal-50'
                  }`}
                >
                  {slot}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}