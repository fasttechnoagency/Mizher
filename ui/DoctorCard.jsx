import React from 'react';
import { Link } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { Star, MapPin, Heart, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';
import { getDoctorFee, getActiveConsultTypes } from '@/lib/doctorFees';
import { formatPrice } from '@/lib/currency';

export default function DoctorCard({ doctor, index = 0 }) {
  const { t, lang, isRTL } = useLanguage();
  const reduce = usePrefReducedMotion();
  const name = lang === 'ar' ? doctor.name_ar : doctor.name_en;
  const specialty = lang === 'ar' ? doctor.specialty_ar : doctor.specialty_en;
  const location = lang === 'ar' ? doctor.location_ar : doctor.location_en;
  const activeTypes = getActiveConsultTypes(doctor);
  const fromFee = activeTypes.length > 0
    ? Math.min(...activeTypes.map(ct => getDoctorFee(doctor, ct)))
    : getDoctorFee(doctor, 'voice');

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotateX: -6 }}
      whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
      whileHover={{ y: -4 }}
      viewport={{ once: true, margin: '-10% 0px -10% 0px' }}
      transition={{ delay: index * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 1000, transformStyle: 'preserve-3d' }}
    >
      <Link to={`/doctors/${doctor.id}`}>
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm card-border-light border border-teal-500/5 group">
          <div className="p-4 flex gap-4">
            <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={doctor.photo_url || 'https://via.placeholder.com/80'}
                alt={name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {!reduce && (
                <motion.div className="absolute inset-0 origin-bottom bg-teal-500/25" aria-hidden
                  initial={{ scaleY: 1 }} whileInView={{ scaleY: 0 }} viewport={{ once: true }}
                  transition={{ duration: 0.55, delay: index * 0.1 + 0.15, ease: [0.22, 1, 0.36, 1] }} />
              )}
              {doctor.verified && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                  <Shield className="w-3 h-3 text-white" />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-foreground truncate">{name}</h3>
                  <p className="text-sm text-teal-600">{specialty}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm font-semibold">{doctor.rating || '—'}</span>
                  {doctor.reviews_count > 0 && (
                    <span className="text-xs text-muted-foreground">({doctor.reviews_count})</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                {location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {location}
                  </span>
                )}
                <span className="font-semibold text-teal-700">
                  {isRTL ? 'من' : 'From'} {formatPrice(fromFee, lang)}
                </span>
              </div>

              {doctor.specialties?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {doctor.specialties.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[10px] bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full border border-teal-100">{s}</span>
                  ))}
                  {doctor.specialties.length > 3 && (
                    <span className="text-[10px] text-muted-foreground px-1">+{doctor.specialties.length - 3}</span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between mt-3">
                {doctor.available_today && (
                  <Badge variant="secondary" className="bg-teal-50 text-teal-700 text-[10px] border-0">
                    {t('available')}
                  </Badge>
                )}
                <Button size="sm" className="bg-teal-500 hover:bg-teal-600 text-white text-xs rounded-full px-4 h-7">
                  {t('bookNow')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}