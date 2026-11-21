import React from 'react';
import { useParams, Link } from '@/lib/router-compat';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { ArrowLeft, ArrowRight, Star, Shield, MapPin, Phone, Mail, Globe, Clock, Home, FlaskConical, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { formatPrice } from '@/lib/currency';

export default function LabProfile() {
  const { id } = useParams();
  const { isRTL, lang } = useLanguage();
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const { data: lab, isLoading } = useQuery({
    queryKey: ['lab', id],
    queryFn: async () => {
      const all = await base44.entities.Lab.list();
      return all.find(l => l.id === id);
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-56 bg-violet-50 rounded-2xl" />
          <div className="h-8 bg-violet-50 rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!lab) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">{isRTL ? 'المختبر غير موجود' : 'Lab not found'}</p>
        <Link to="/labs"><Button variant="outline" className="mt-4">{isRTL ? 'العودة' : 'Go Back'}</Button></Link>
      </div>
    );
  }

  const name = lang === 'ar' ? lab.name_ar : lab.name_en;
  const description = lang === 'ar' ? lab.description_ar : lab.description_en;
  const address = lang === 'ar' ? lab.address_ar : lab.address_en;

  // Build Google Maps URL — use provided link or fall back to address search
  const mapsLink = lab.maps_code
    ? lab.maps_code
    : `https://www.google.com/maps/search/${encodeURIComponent((lab.address_en || lab.name_en) + ' ' + (lab.city || '') + ' Jordan')}`;

  // Convert any Google Maps link to an embeddable iframe URL
  const getEmbedUrl = (link) => {
    if (!link) return null;
    if (link.includes('/maps/embed')) return link;
    // Extract lat/lng from @lat,lng pattern (most Google Maps share links)
    const coordMatch = link.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (coordMatch) {
      return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&z=16&output=embed`;
    }
    // Extract place name from /place/NAME
    const placeMatch = link.match(/\/place\/([^/@?]+)/);
    if (placeMatch) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(decodeURIComponent(placeMatch[1].replace(/\+/g, ' ')))}&output=embed`;
    }
    // Fallback: use address
    return `https://maps.google.com/maps?q=${encodeURIComponent((lab.address_en || lab.name_en) + ' ' + (lab.city || '') + ' Jordan')}&output=embed`;
  };

  const embedUrl = getEmbedUrl(mapsLink);



  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <Link to="/labs" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-violet-600 mb-6">
        <BackArrow className="w-4 h-4" />
        {isRTL ? 'العودة للمختبرات' : 'Back to Labs'}
      </Link>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

        {/* Header Card */}
        <div className="bg-card rounded-2xl overflow-hidden shadow-sm border border-teal-500/5">
          <div className="h-48 bg-gradient-to-br from-violet-100 to-purple-50 relative">
            {lab.photo_url ? (
              <img src={lab.photo_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FlaskConical className="w-20 h-20 text-violet-300" />
              </div>
            )}
          </div>
          <div className="p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">{name}</h1>
                  {lab.verified && <Shield className="w-5 h-5 text-teal-500" />}
                </div>
                {lab.city && (
                  <p className="text-muted-foreground text-sm flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" />{lab.city}
                    {address && ` — ${address}`}
                  </p>
                )}
              </div>
              {lab.rating && (
                <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-xl flex-shrink-0">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-sm">{lab.rating}</span>
                  {lab.reviews_count > 0 && <span className="text-xs text-muted-foreground">({lab.reviews_count})</span>}
                </div>
              )}
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              {lab.home_visit && (
                <Badge className="bg-teal-50 text-teal-700 border-teal-100 rounded-full gap-1">
                  <Home className="w-3 h-3" />
                  {isRTL ? 'زيارة منزلية' : 'Home Visit'}
                </Badge>
              )}
              {lab.working_hours && (
                <Badge variant="secondary" className="rounded-full gap-1">
                  <Clock className="w-3 h-3" />
                  {lab.working_hours}
                </Badge>
              )}
              {lab.consultation_fee && (
                <Badge className="bg-violet-50 text-violet-700 border-violet-100 rounded-full">
                  {isRTL ? 'من ' : 'From '}{formatPrice(lab.consultation_fee, lang)}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="bg-card rounded-2xl p-5 border border-teal-500/5">
            <h2 className="font-bold text-foreground mb-2">{isRTL ? 'نبذة عن المختبر' : 'About the Lab'}</h2>
            <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
          </div>
        )}

        {/* Services */}
        {lab.services && lab.services.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-teal-500/5">
            <h2 className="font-bold text-foreground mb-3">{isRTL ? 'الخدمات والفحوصات' : 'Services & Tests'}</h2>
            <div className="flex flex-wrap gap-2">
              {lab.services.map((s, i) => (
                <Badge key={i} variant="secondary" className="bg-violet-50 text-violet-700 border-violet-100 rounded-full px-4 py-1">
                  {s}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="bg-card rounded-2xl p-5 border border-teal-500/5">
          <h2 className="font-bold text-foreground mb-3">{isRTL ? 'معلومات التواصل' : 'Contact Info'}</h2>
          <div className="space-y-2">
            {lab.phone && (
              <a href={`tel:${lab.phone}`} className="flex items-center gap-3 text-sm hover:text-teal-600 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-teal-600" />
                </div>
                <span>{lab.phone}</span>
              </a>
            )}
            {lab.email && (
              <a href={`mailto:${lab.email}`} className="flex items-center gap-3 text-sm hover:text-teal-600 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-teal-600" />
                </div>
                <span>{lab.email}</span>
              </a>
            )}
            {lab.website && (
              <a href={lab.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm hover:text-teal-600 transition-colors">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <Globe className="w-4 h-4 text-teal-600" />
                </div>
                <span>{lab.website}</span>
              </a>
            )}
            {lab.address_en && (
              <div className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-muted-foreground">{address || lab.address_en}</span>
              </div>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="bg-card rounded-2xl overflow-hidden border border-teal-500/5">
          <div className="p-4 flex items-center justify-between border-b border-teal-50">
            <h2 className="font-bold text-foreground">{isRTL ? 'الموقع على الخريطة' : 'Location on Map'}</h2>
            <a href={mapsLink} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs text-teal-600 hover:underline">
              <ExternalLink className="w-3.5 h-3.5" />
              {isRTL ? 'فتح في خرائط جوجل' : 'Open in Google Maps'}
            </a>
          </div>
          <div className="h-64 relative">
            <iframe
              src={embedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={name}
            />
          </div>
        </div>

        {/* Insurance */}
        {lab.insurance_accepted && lab.insurance_accepted.length > 0 && (
          <div className="bg-card rounded-2xl p-5 border border-teal-500/5">
            <h2 className="font-bold text-foreground mb-3">{isRTL ? 'التأمين المقبول' : 'Accepted Insurance'}</h2>
            <div className="flex flex-wrap gap-2">
              {lab.insurance_accepted.map((ins, i) => (
                <Badge key={i} variant="outline" className="rounded-full px-3">{ins}</Badge>
              ))}
            </div>
          </div>
        )}

      </motion.div>

      {/* CTA */}
      {lab.phone && (
        <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-auto md:w-96 md:mx-auto z-40">
          <a href={`tel:${lab.phone}`}>
            <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white rounded-2xl h-12 text-base font-semibold shadow-xl gap-2">
              <Phone className="w-5 h-5" />
              {isRTL ? 'اتصل الآن' : 'Call Now'}
            </Button>
          </a>
        </div>
      )}
    </div>
  );
}