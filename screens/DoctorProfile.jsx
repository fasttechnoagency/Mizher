import React, { useState } from 'react';
import { useParams, Link, useNavigate } from '@/lib/router-compat';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Star, Shield, MapPin, MessageCircle, Phone, Video, ArrowLeft, ArrowRight, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import StarRatingInput from '@/components/doctor/StarRatingInput';

export default function DoctorProfile() {
  const { id } = useParams();
  const { t, lang, isRTL } = useLanguage();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;
  const [reviewForm, setReviewForm] = useState({ rating: 0, patient_name: '', comment: '' });
  const [submitted, setSubmitted] = useState(false);

  const { data: doctor, isLoading } = useQuery({
    queryKey: ['doctor', id],
    queryFn: async () => {
      const docs = await base44.entities.Doctor.list();
      return docs.find(d => d.id === id);
    },
    enabled: !!id,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['doctor-reviews', id],
    queryFn: () => base44.entities.DoctorReview.filter({ doctor_id: id }, '-created_date', 50),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: (data) => base44.entities.DoctorReview.create(data),
    onSuccess: async () => {
      queryClient.invalidateQueries(['doctor-reviews', id]);
      const avgRating = reviews.length
        ? ((reviews.reduce((s, r) => s + r.rating, 0) + reviewForm.rating) / (reviews.length + 1))
        : reviewForm.rating;
      await base44.entities.Doctor.update(id, {
        rating: Math.round(avgRating * 10) / 10,
        reviews_count: (reviews.length || 0) + 1,
      });
      queryClient.invalidateQueries(['doctor', id]);
      setSubmitted(true);
      setReviewForm({ rating: 0, patient_name: '', comment: '' });
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-64 bg-teal-50 rounded-2xl" />
          <div className="h-8 bg-teal-50 rounded w-1/3" />
          <div className="h-4 bg-teal-50 rounded w-2/3" />
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{t('doctorNotFound')}</p>
        <Link to="/doctors">
          <Button variant="outline" className="mt-4">{t('goBack')}</Button>
        </Link>
      </div>
    );
  }

  const name = lang === 'ar' ? doctor.name_ar : doctor.name_en;
  const specialty = lang === 'ar' ? doctor.specialty_ar : doctor.specialty_en;
  const bio = lang === 'ar' ? doctor.bio_ar : doctor.bio_en;
  const location = lang === 'ar' ? doctor.location_ar : doctor.location_en;



  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6">
      <Link to="/doctors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-teal-600 mb-6">
        <BackArrow className="w-4 h-4" />
        {t('backToDoctors')}
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Profile Header */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          {/* Teal top strip */}
          <div className="h-4 bg-teal-600" />

          <div className="flex flex-col items-center px-6 pt-6 pb-8">
            {/* Circular avatar with teal ring */}
            <div className="w-28 h-28 rounded-full border-4 border-teal-200 overflow-hidden shadow-md mb-4">
              <img src={doctor.photo_url} alt={name} className="w-full h-full object-cover" />
            </div>

            {/* Name + verified */}
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">{name}</h1>
              {doctor.verified && <Shield className="w-5 h-5 text-blue-600" />}
            </div>

            {/* Specialty */}
            <p className="text-teal-600 font-medium mb-2">{specialty}</p>

            {/* Rating + Location */}
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4">
              <span className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= Math.round(doctor.rating || 4.8) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`} />
                ))}
              </span>
              {location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  {location}
                </span>
              )}
            </div>

            {/* Social icons */}
            {(doctor.instagram_url || doctor.facebook_url) && (
              <div className="flex items-center gap-3">
                {doctor.instagram_url && (
                  <a href={doctor.instagram_url} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="url(#igGrad)"/>
                      <defs><radialGradient id="igGrad" cx="30%" cy="107%" r="150%"><stop offset="0%" stopColor="#fdf497"/><stop offset="5%" stopColor="#fdf497"/><stop offset="45%" stopColor="#fd5949"/><stop offset="60%" stopColor="#d6249f"/><stop offset="90%" stopColor="#285AEB"/></radialGradient></defs>
                      <path d="M12 7.5A4.5 4.5 0 1 0 16.5 12 4.5 4.5 0 0 0 12 7.5Zm0 7.5a3 3 0 1 1 3-3 3 3 0 0 1-3 3Zm4.5-8.25a1.125 1.125 0 1 0 1.125 1.125A1.125 1.125 0 0 0 16.5 6.75Zm3 1.125A4.458 4.458 0 0 0 15.188 3.75h-6.376A4.458 4.458 0 0 0 4.5 8.063v5.874a4.458 4.458 0 0 0 4.312 4.313h5.376A4.458 4.458 0 0 0 18.5 13.937V8.063Zm-1.5 5.812a2.962 2.962 0 0 1-2.875 2.875H9.875A2.962 2.962 0 0 1 7 13.875V8.063a2.962 2.962 0 0 1 2.875-2.876h4.25A2.962 2.962 0 0 1 17 8.063Z" fill="white"/>
                    </svg>
                  </a>
                )}
                {doctor.facebook_url && (
                  <a href={doctor.facebook_url} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity">
                    <svg className="w-10 h-10" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="6" fill="#1877F2"/>
                      <path d="M16.5 12H14v8h-3v-8H9V9.5h2V8c0-2 1-3.5 3.5-3.5H17V7h-1.5c-.8 0-1 .4-1 1v1.5H17L16.5 12Z" fill="white"/>
                    </svg>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-teal-500/5">
          <h2 className="text-lg font-bold text-foreground mb-3">{t('about')}</h2>
          <p className="text-muted-foreground leading-relaxed">
            {bio || (isRTL
              ? 'نبذة. أحمد القيسي أوهم على مقينات العويس على المدني والسنة قبل مجودات السكنات الأردني'
              : 'Dr. Ahmed Al-Qaisi is a board-certified specialist with over 15 years of experience in treating patients across Jordan and the Middle East.'
            )}
          </p>
        </div>

        {/* Specialties */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-teal-500/5">
          <h2 className="text-lg font-bold text-foreground mb-3">{t('specialties')}</h2>
          <div className="flex flex-wrap gap-2">
            {(doctor.specialties || [specialty, isRTL ? 'تجميل' : 'Aesthetic']).map((s, i) => (
              <Badge key={i} variant="secondary" className="bg-teal-50 text-teal-700 border-teal-100 rounded-full px-4 py-1">
                {s}
              </Badge>
            ))}
          </div>
        </div>

        {/* Services */}
        {doctor.services?.length > 0 && (
          <div className="bg-card rounded-2xl p-6 shadow-sm border border-teal-500/5">
            <h2 className="text-lg font-bold text-foreground mb-3">{isRTL ? 'الخدمات المقدمة' : 'Services Offered'}</h2>
            <div className="flex flex-wrap gap-2">
              {doctor.services.map((s, i) => (
                <span key={i} className="bg-teal-50 text-teal-700 border border-teal-100 rounded-full px-4 py-1 text-sm font-medium">{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Google Maps Location */}
        {doctor.maps_code && (() => {
          const getEmbedUrl = (link) => {
            if (!link) return null;
            if (link.includes('/maps/embed')) return link;
            const coordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
            if (coordMatch) return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=16&output=embed`;
            const placeMatch = link.match(/\/place\/([^/@?]+)/);
            if (placeMatch) return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')))}&output=embed`;
            return `https://maps.google.com/maps?q=${encodeURIComponent(doctor.clinic_address || doctor.name_en + ' Jordan')}&output=embed`;
          };
          return (
            <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-teal-500/5">
              <div className="p-4 flex items-center justify-between border-b border-teal-50">
                <h2 className="font-bold text-foreground">{isRTL ? 'الموقع على الخريطة' : 'Location on Map'}</h2>
                <a href={doctor.maps_code} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-teal-600 hover:underline">
                  <ExternalLink className="w-3.5 h-3.5" />
                  {isRTL ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
                </a>
              </div>
              <div className="h-64">
                <iframe src={getEmbedUrl(doctor.maps_code)} width="100%" height="100%" style={{ border: 0 }} allowFullScreen="" loading="lazy" referrerPolicy="no-referrer-when-downgrade" title={name} />
              </div>
            </div>
          );
        })()}

        {/* Patient Reviews */}
        <div className="bg-card rounded-2xl p-6 shadow-sm border border-teal-500/5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-foreground">{t('patientReviews')}</h2>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-foreground">{doctor.rating || (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1)}</span>
                <span>({reviews.length})</span>
              </div>
            )}
          </div>

          {/* Existing reviews */}
          {reviews.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">{isRTL ? 'لا توجد تقييمات بعد' : 'No reviews yet. Be the first!'}</p>
          ) : (
            <div className="space-y-3">
              {reviews.map((review) => (
                <div key={review.id} className="flex gap-3 p-3 bg-teal-50/50 rounded-xl">
                  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-teal-700 font-semibold text-sm">{(review.patient_name || '?')[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-foreground">{review.patient_name || (isRTL ? 'مجهول' : 'Anonymous')}</p>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} className={`w-3 h-3 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'fill-none text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                    {review.comment && <p className="text-sm text-muted-foreground mt-1 leading-relaxed">"{review.comment}"</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Leave a review */}
          <div className="border-t border-teal-100 pt-4">
            <h3 className="font-semibold text-sm mb-3">{isRTL ? 'أضف تقييمك' : 'Leave a Review'}</h3>
            {submitted ? (
              <p className="text-sm text-teal-600 font-medium">{isRTL ? 'شكراً على تقييمك!' : 'Thank you for your review!'}</p>
            ) : (
              <div className="space-y-3">
                <StarRatingInput value={reviewForm.rating} onChange={r => setReviewForm(f => ({ ...f, rating: r }))} />
                <input
                  value={reviewForm.patient_name}
                  onChange={e => setReviewForm(f => ({ ...f, patient_name: e.target.value }))}
                  placeholder={isRTL ? 'اسمك (اختياري)' : 'Your name (optional)'}
                  className="w-full rounded-xl border border-teal-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400"
                />
                <textarea
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                  placeholder={isRTL ? 'تعليقك (اختياري)' : 'Your comment (optional)'}
                  rows={2}
                  className="w-full rounded-xl border border-teal-100 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-teal-400 resize-none"
                />
                <Button
                  onClick={() => reviewMutation.mutate({ doctor_id: id, rating: reviewForm.rating, patient_name: reviewForm.patient_name, comment: reviewForm.comment })}
                  disabled={!reviewForm.rating || reviewMutation.isPending}
                  className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-9 px-5 text-sm"
                >
                  {reviewMutation.isPending ? (isRTL ? 'جاري الإرسال...' : 'Submitting...') : (isRTL ? 'إرسال التقييم' : 'Submit Review')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Floating Consult Bar */}
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-full md:max-w-4xl md:px-6 z-40">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="h-1.5 bg-teal-600" />
          <div className="flex gap-2 p-2">
            <Button onClick={() => navigate(`/profile?tab=messages&doctor=${id}&doctorName=${encodeURIComponent(name)}`)}
              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white rounded-full gap-1 h-10 font-semibold text-xs md:text-sm md:gap-2 md:h-12 px-2">
              <MessageCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t('message')}</span>
            </Button>
            <Button onClick={() => window.location.href = `tel:${doctor.phone}`}
              className="flex-1 bg-white hover:bg-teal-50 text-teal-600 border-2 border-teal-200 rounded-full gap-1 h-10 font-semibold text-xs md:text-sm md:gap-2 md:h-12 px-2">
              <Phone className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t('voiceCall')}</span>
            </Button>
            <Button onClick={() => navigate(`/booking?doctor=${id}&type=video`)}
              className="flex-1 bg-teal-50 hover:bg-teal-100 text-teal-600 rounded-full gap-1 h-10 font-semibold text-xs md:text-sm md:gap-2 md:h-12 border-0 px-2">
              <Video className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{t('videoCall')}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}