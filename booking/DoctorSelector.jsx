import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Search, Star, Shield, MapPin, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { getDoctorFee, getActiveConsultTypes } from '@/lib/doctorFees';
import { formatPrice } from '@/lib/currency';

export default function DoctorSelector({ selectedDoctorId, onSelect }) {
  const { lang, isRTL } = useLanguage();
  const [search, setSearch] = useState('');

  const { data: doctors = [], isLoading } = useQuery({
    queryKey: ['doctors'],
    queryFn: () => base44.entities.Doctor.list('-rating', 30),
  });

  const filtered = doctors.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      d.name_en?.toLowerCase().includes(q) ||
      d.name_ar?.includes(q) ||
      d.specialty_en?.toLowerCase().includes(q) ||
      d.specialty_ar?.includes(q)
    );
  });

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-foreground mb-1">
          {isRTL ? 'اختر طبيبك' : 'Select Your Doctor'}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isRTL ? 'اختر طبيباً من القائمة أدناه لتحديد موعدك' : 'Choose a doctor from the list below to schedule your appointment'}
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={isRTL ? 'ابحث بالاسم أو التخصص' : 'Search by name or specialty'}
          className={`w-full h-10 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-background rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
        />
      </div>

      {/* Doctor List */}
      <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse" />
          ))
        ) : filtered.length === 0 ? (
          <p className="text-center text-muted-foreground py-8 text-sm">
            {isRTL ? 'لم يتم العثور على أطباء' : 'No doctors found'}
          </p>
        ) : (
          filtered.map((doctor, i) => {
            const name     = lang === 'ar' ? doctor.name_ar     : doctor.name_en;
            const specialty = lang === 'ar' ? doctor.specialty_ar : doctor.specialty_en;
            const location  = lang === 'ar' ? doctor.location_ar  : doctor.location_en;
            const isSelected = doctor.id === selectedDoctorId;
            const activeTypes = getActiveConsultTypes(doctor);
            const fromFee = activeTypes.length > 0
              ? Math.min(...activeTypes.map(t => getDoctorFee(doctor, t)))
              : getDoctorFee(doctor, 'voice');

            return (
              <motion.button
                key={doctor.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onSelect(doctor)}
                className={`w-full text-start p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isSelected
                    ? 'border-teal-500 bg-teal-50 shadow-md shadow-teal-500/10'
                    : 'border-teal-500/10 bg-card hover:border-teal-200 hover:bg-teal-50/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <img
                      src={doctor.photo_url || 'https://via.placeholder.com/56'}
                      alt={name}
                      className="w-full h-full object-cover"
                    />
                    {doctor.verified && (
                      <div className="absolute bottom-0 right-0 w-5 h-5 bg-teal-500 rounded-tl-lg flex items-center justify-center">
                        <Shield className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-semibold text-sm text-foreground truncate">{name}</h3>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-teal-600 font-medium">{specialty}</p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        {doctor.rating || 4.8}
                      </span>
                      {location && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="w-3 h-3" />
                          {location}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-teal-700 ms-auto">
                        {isRTL ? 'من' : 'From'} {formatPrice(fromFee, lang)}
                      </span>
                    </div>
                  </div>
                </div>
                {doctor.available_today && (
                  <div className="mt-2 flex">
                    <Badge className="bg-emerald-50 text-emerald-700 border-0 text-[10px] gap-1 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      {isRTL ? 'متاح اليوم' : 'Available Today'}
                    </Badge>
                  </div>
                )}
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
}