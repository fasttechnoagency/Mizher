import React from 'react';
import { Link } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import DoctorCard from '@/components/ui/DoctorCard';
import PackageCard from '@/components/ui/PackageCard';
import ProductCard from '@/components/ui/ProductCard';
import {
  ChevronRight, ChevronLeft, Stethoscope, Plane, ShoppingBag,
  Building2, Users, MessageCircle, Store, Star, ArrowRight, ArrowLeft,
  Phone, Mail, CheckCircle2, Sparkles
} from 'lucide-react';
import SectionScan from '@/components/reveal/SectionScan';
import TitleSheen from '@/components/living-network/TitleSheen';
import Parallax from '@/components/reveal/Parallax';
import RevealText from '@/components/reveal/RevealText';
import Counter from '@/components/reveal/Counter';
import { usePrefReducedMotion } from '@/components/living-network/useInViewOnce';
import ECGWave from '@/components/living-network/ECGWave';
import VitalScanReveal from '@/components/reveal/VitalScanReveal';
import TitleECG from '@/components/reveal/TitleECG';
import DNAHelix from '@/components/reveal/DNAHelix';
import StethoscopePulse from '@/components/reveal/StethoscopePulse';
import LegalSection from '@/components/home/LegalSection';

const FadeIn = ({ children, delay = 0 }) => (
  <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }} transition={{ duration: 0.5, delay }}>
    {children}
  </motion.div>
);

const SectionHeader = ({ icon: Icon, badge, title, sub, linkTo, linkLabel, isRTL }) => {
  const Arrow = isRTL ? ChevronLeft : ChevronRight;
  const reduce = usePrefReducedMotion();
  return (
    <div className="flex items-end justify-between mb-8">
      <Parallax range={26}>
      <div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
            <Icon className="w-4 h-4 text-teal-600" />
          </div>
          <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">{badge}</span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground"><RevealText>{title}</RevealText></h2>
        <TitleECG align="start" width={140} />
        <TitleSheen reduce={reduce} align="start" width={120} />
        <p className="text-muted-foreground text-sm mt-1">{sub}</p>
      </div>
      </Parallax>
      {linkTo && (
        <Link to={linkTo}>
          <Button variant="outline" className="border-teal-200 text-teal-700 hover:bg-teal-50 rounded-xl gap-1 hidden md:flex">
            {linkLabel} <Arrow className="w-4 h-4" />
          </Button>
        </Link>
      )}
    </div>
  );
};

export default function HomeContent({ doctors, packages, products }) {
  const { lang, isRTL } = useLanguage();
  const Arrow = isRTL ? ArrowLeft : ArrowRight;
  const Chevron = isRTL ? ChevronLeft : ChevronRight;

  const t = (en, ar, az) => lang === 'ar' ? ar : lang === 'az' ? az : en;

  return (
    <div>



      {/* ── FEATURED DOCTORS ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <SectionScan />
        <FadeIn>
          <SectionHeader
            icon={Stethoscope}
            badge={t('Featured Doctors', 'أطباء مميزون', 'Seçilmiş Həkimlər')}
            title={t('Top Specialists in Jordan', 'أبرز المتخصصين في الأردن', 'Ərdəndəki Ən Yaxşı Mütəxəssislər')}
            sub={t('Book with verified, highly-rated doctors', 'احجز مع أطباء موثقين وذوي تقييمات عالية', 'Yüksək reytinqli həkimlərlə görüş sifariş edin')}
            linkTo="/doctors"
            linkLabel={t('All Doctors', 'كل الأطباء', 'Bütün Həkimlər')}
            isRTL={isRTL}
          />
          <VitalScanReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.slice(0, 3).map((doctor, i) => (
              <DoctorCard key={doctor.id} doctor={doctor} index={i} />
            ))}
          </div>
          </VitalScanReveal>
          <div className="mt-6 text-center md:hidden">
            <Link to="/doctors">
              <Button variant="outline" className="border-teal-200 text-teal-700 rounded-xl gap-1">
                {t('View All Doctors', 'عرض كل الأطباء', 'Bütün Həkimlərə Bax')} <Chevron className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>



      <DNAHelix className="max-w-7xl mx-auto px-4 md:px-6 py-2 opacity-50" />

      {/* ── MARKETPLACE STRIP ── */}
      <section className="max-w-7xl mx-auto px-4 md:px-6 py-12">
        <SectionScan />
        <FadeIn>
          <SectionHeader
            icon={ShoppingBag}
            badge={t('Health Store', 'المتجر الصحي', 'Sağlıq Mağazası')}
            title={t('Medical Devices & Supplements', 'أجهزة طبية ومكملات غذائية', 'Tibbi Cihazlar və Əlavələr')}
            sub={t('Trusted products from certified pharmacies & stores', 'منتجات موثوقة من صيدليات ومتاجر معتمدة', 'Sertifikatlı əczaxanalardan etibarlı məhsullar')}
            linkTo="/marketplace"
            linkLabel={t('All Products', 'كل المنتجات', 'Bütün Məhsullar')}
            isRTL={isRTL}
          />
          <VitalScanReveal soft delay={0.05}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.slice(0, 4).map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
          </VitalScanReveal>
          <div className="mt-6 text-center md:hidden">
            <Link to="/marketplace">
              <Button variant="outline" className="border-teal-200 text-teal-700 rounded-xl gap-1">
                {t('View All Products', 'عرض كل المنتجات', 'Bütün Məhsullara Bax')} <Chevron className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </FadeIn>
      </section>



      {/* ── HOSPITALS HIGHLIGHT ── */}
      <section className="py-12 bg-gradient-to-br from-cyan-50/60 to-teal-50/40">
        <SectionScan />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <DNAHelix className="mb-6" />
          <ECGWave className="w-full h-8 mb-6 opacity-70" />
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-teal-600" />
                  </div>
                  <span className="text-xs font-semibold text-teal-600 uppercase tracking-wider">
                    {t('Hospitals & Clinics', 'المستشفيات والعيادات', 'Xəstəxanalar və Klinikalar')}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  <RevealText>{t('Find & Book Top Hospitals', 'ابحث واحجز في أفضل المستشفيات', 'Ən Yaxşı Xəstəxanaları Tapın')}</RevealText>
                </h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {t(
                    'Browse certified hospitals, explore their departments, and book appointments directly. From surgery to lab tests, all under one platform.',
                    'تصفح المستشفيات المعتمدة، استكشف أقسامها، واحجز مواعيدك مباشرةً. من الجراحة إلى التحاليل المخبرية — كل ذلك تحت منصة واحدة.',
                    'Sertifikatlı xəstəxanaları nəzərdən keçirin, şöbələrini kəşf edin və bilavasitə randevu sifariş edin.'
                  )}
                </p>
                <div className="space-y-2 mb-6">
                  {[
                    t('Book consultations, surgeries & lab tests', 'حجز استشارات وعمليات وتحاليل', 'Konsultasiya, əməliyyat və təhlil sifariş edin'),
                    t('View specialties & departments', 'استكشف التخصصات والأقسام', 'İxtisasları və şöbələri görün'),
                    t('Insurance-accepted hospitals', 'مستشفيات تقبل التأمين الصحي', 'Sığorta qəbul edən xəstəxanalar'),
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                      <CheckCircle2 className="w-4 h-4 text-teal-500 flex-shrink-0" />
                      {item}
                    </div>
                  ))}
                </div>
                <Link to="/hospitals">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2">
                    {t('Browse Hospitals', 'تصفح المستشفيات', 'Xəstəxanalara Bax')}
                    <Arrow className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: Building2, label: t('Private Hospitals', 'مستشفيات خاصة', 'Özəl Xəstəxanalar'), num: 30, suffix: '+', color: 'bg-teal-500' },
                  { icon: Stethoscope, label: t('Specialties', 'تخصصات', 'İxtisaslar'), num: 50, suffix: '+', color: 'bg-cyan-500' },
                  { icon: CheckCircle2, label: t('Verified', 'موثق', 'Təsdiqlənmiş'), num: 100, suffix: '%', color: 'bg-emerald-500' },
                  { icon: Star, label: t('Avg Rating', 'متوسط التقييم', 'Orta Reytinq'), num: 4.8, suffix: '★', color: 'bg-teal-600' },
                ].map(({ icon: Icon, label, num, suffix, color }, i) => (
                  <StethoscopePulse key={i}>
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-5 border border-teal-100 shadow-sm text-center">
                    <div className={`w-10 h-10 ${color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="text-2xl font-bold text-teal-700"><Counter value={num} suffix={suffix} /></p>
                    <p className="text-xs text-muted-foreground mt-1">{label}</p>
                  </motion.div>
                  </StethoscopePulse>
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      </section>



      {/* ── MEDICAL TOURISM PACKAGES ── */}
      <section className="py-12 bg-gradient-to-br from-teal-50/60 to-white">
        <SectionScan />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <FadeIn>
            <SectionHeader
              icon={Plane}
              badge={t('Medical Tourism', 'سياحة علاجية', 'Tibbi Turizm')}
              title={t('All-Inclusive Treatment Packages', 'باقات علاجية شاملة', 'Hər Şey Daxil Müalicə Paketləri')}
              sub={t('Flights, hotel, treatment & aftercare included', 'تشمل الطيران والفندق والعلاج والمتابعة', 'Uçuş, otel, müalicə və sonrakı qayğı daxildir')}
              linkTo="/packages"
              linkLabel={t('All Packages', 'كل الباقات', 'Bütün Paketlər')}
              isRTL={isRTL}
            />
            <VitalScanReveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {packages.slice(0, 3).map((pkg, i) => (
                <PackageCard key={pkg.id} pkg={pkg} index={i} />
              ))}
            </div>
            </VitalScanReveal>
            <div className="mt-6 text-center md:hidden">
              <Link to="/packages">
                <Button variant="outline" className="border-teal-200 text-teal-700 rounded-xl gap-1">
                  {t('View All Packages', 'عرض كل الباقات', 'Bütün Paketlərə Bax')} <Chevron className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>



      {/* ── COMMUNITY ── */}
      <section className="py-12 bg-gradient-to-br from-violet-50/50 to-teal-50/30">
        <SectionScan />
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <FadeIn>
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { bg: 'bg-violet-100', icon: MessageCircle, color: 'text-violet-600', label: t('Ask a Doctor', 'اسأل طبيباً', 'Həkimə Sor') },
                  { bg: 'bg-teal-100',   icon: Users,          color: 'text-teal-600',   label: t('Community Q&A', 'أسئلة المجتمع', 'İcma Sualları') },
                  { bg: 'bg-cyan-100',   icon: Stethoscope,    color: 'text-cyan-600',   label: t('Doctor Posts', 'منشورات الأطباء', 'Həkim Yazıları') },
                  { bg: 'bg-emerald-100',icon: Sparkles,       color: 'text-emerald-600',label: t('Health Tips', 'نصائح صحية', 'Sağlıq Məsləhətləri') },
                ].map(({ bg, icon: Icon, color, label }, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl p-5 border border-border shadow-sm flex flex-col items-center text-center gap-3">
                    <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${color}`} />
                    </div>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                  </motion.div>
                ))}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-violet-600" />
                  </div>
                  <span className="text-xs font-semibold text-violet-600 uppercase tracking-wider">
                    {t('Community', 'المجتمع', 'İcma')}
                  </span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  <RevealText>{t('Connect, Ask & Learn', 'تواصل، اسأل وتعلم', 'Əlaqə qur, Sor, Öyrən')}</RevealText>
                </h2>
                <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                  {t(
                    'Join a growing community of patients and verified doctors. Ask health questions, read expert posts, and share your experience.',
                    'انضم إلى مجتمع متنامٍ من المرضى والأطباء الموثقين. اطرح أسئلة صحية، اقرأ منشورات الخبراء، وشارك تجربتك.',
                    'Xəstələr və təsdiqlənmiş həkimlərdən ibarət böyüyən bir icmaya qoşulun.'
                  )}
                </p>
                <Link to="/community">
                  <Button className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
                    {t('Join Community', 'انضم للمجتمع', 'İcmaya Qoşul')}
                    <Arrow className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>



      {/* ── PROVIDER CTA ── */}
      <section className="bg-gradient-to-r from-teal-600 to-teal-800 py-12 px-4">
        <SectionScan />
        <div className="max-w-5xl mx-auto">
          <FadeIn>
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                <RevealText>{t('Are you a healthcare provider?', 'هل أنت مزود خدمة صحية؟', 'Siz səhiyyə xidmətləri sağlayıcısısınız?')}</RevealText>
              </h2>
              <p className="text-white/70 text-sm">
                {t('Join Mizher and reach thousands of patients', 'انضم لمزهر وتواصل مع آلاف المرضى', 'Mizherə qoşulun və minlərlə xəstəyə çatın')}
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  icon: Stethoscope, path: '/doctor-console',
                  label:  t('Register as Doctor',   'سجّل كطبيب',             'Həkim kimi Qeydiyyat'),
                  desc:   t('Manage appointments & grow your practice', 'أدر مواعيدك ونمّ عيادتك', 'Randevuları idarə edin'),
                  btn:    t('Get Started', 'ابدأ الآن', 'Başlayın'),
                  bg: 'bg-white/10 hover:bg-white/20',
                },
                {
                  icon: Building2, path: '/hospital-console',
                  label:  t('Register Hospital',    'سجّل مستشفى',            'Xəstəxananı Qeydiyyat et'),
                  desc:   t('Manage departments, bookings & staff', 'أدر الأقسام والحجوزات والطاقم', 'Şöbələri və rezervasiyaları idarə edin'),
                  btn:    t('Get Started', 'ابدأ الآن', 'Başlayın'),
                  bg: 'bg-white/10 hover:bg-white/20',
                },
                {
                  icon: Store, path: '/retailer-console',
                  label:  t('Open a Store',         'افتح متجراً أو صيدلية',   'Mağaza aç'),
                  desc:   t('Sell products to thousands of patients', 'بع منتجاتك لآلاف المرضى', 'Minlərlə xəstəyə məhsul sat'),
                  btn:    t('Get Started', 'ابدأ الآن', 'Başlayın'),
                  bg: 'bg-white/10 hover:bg-white/20',
                },
              ].map(({ icon: Icon, path, label, desc, btn, bg }, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link to={path}>
                    <div className={`${bg} border border-white/20 rounded-2xl p-6 transition-all cursor-pointer`}>
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-white font-bold text-lg mb-1">{label}</h3>
                      <p className="text-white/65 text-sm mb-4">{desc}</p>
                      <span className="inline-flex items-center gap-1 text-white text-sm font-semibold">
                        {btn} <Chevron className="w-4 h-4" />
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>



      <LegalSection />

      {/* ── FOOTER ── */}
      <footer className="bg-teal-900 text-white py-14 px-4">
        <SectionScan />
        <div className="max-w-7xl mx-auto">
          <FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
                  <Stethoscope className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">{t('Mizher Medical Hub', 'مزهر الطبي', 'Mizher Tibb Mərkəzi')}</span>
              </div>
              <p className="text-teal-300 text-sm leading-relaxed max-w-xs">
                {t(
                  "Jordan's leading healthcare platform — connecting doctors, hospitals, and patients in one seamless experience.",
                  'منصة الرعاية الصحية الأولى في الأردن — تجمع الأطباء والمستشفيات والمرضى في تجربة متكاملة.',
                  'Ərdənin aparıcı səhiyyə platforması — həkimləri, xəstəxanaları və xəstələri bir yerdə birləşdirir.'
                )}
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('Platform', 'المنصة', 'Platforma')}</h4>
              <ul className="space-y-2 text-sm text-teal-300">
                {[
                  { to: '/doctors',     en: 'Find a Doctor',   ar: 'ابحث عن طبيب',    az: 'Həkim Tap'         },
                  { to: '/hospitals',   en: 'Hospitals',       ar: 'المستشفيات',       az: 'Xəstəxanalar'     },
                  { to: '/packages',    en: 'Medical Tourism', ar: 'السياحة العلاجية', az: 'Tibbi Turizm'     },
                  { to: '/marketplace', en: 'Marketplace',     ar: 'المتجر',           az: 'Mağaza'           },
                  { to: '/community',   en: 'Community',       ar: 'المجتمع',          az: 'İcma'             },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-white transition-colors">
                      {lang === 'ar' ? l.ar : lang === 'az' ? l.az : l.en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Provider Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('For Providers', 'للمزودين', 'Təminatçılar üçün')}</h4>
              <ul className="space-y-2 text-sm text-teal-300">
                {[
                  { to: '/doctor-console',   en: 'Doctor Portal',   ar: 'بوابة الأطباء',    az: 'Həkim Portalı'    },
                  { to: '/hospital-console', en: 'Hospital Portal', ar: 'بوابة المستشفيات', az: 'Xəstəxana Portalı'},
                  { to: '/retailer-console', en: 'Retailer Portal', ar: 'بوابة المتاجر',    az: 'Mağaza Portalı'   },
                  { to: '/about',            en: 'About Us',        ar: 'عن المنصة',        az: 'Haqqımızda'       },
                  { to: '/contact',          en: 'Contact',         ar: 'تواصل معنا',       az: 'Əlaqə'            },
                ].map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="hover:text-white transition-colors">
                      {lang === 'ar' ? l.ar : lang === 'az' ? l.az : l.en}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold mb-4 text-white">{t('Contact', 'تواصل', 'Əlaqə')}</h4>
              <ul className="space-y-3 text-sm text-teal-300 mb-5">
                <li>
                  <a href="mailto:support@mizhermedicalhub.com" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Mail className="w-4 h-4 flex-shrink-0" />
                    support@mizhermedicalhub.com
                  </a>
                </li>
                <li>
                  <a href="tel:+962799902083" className="flex items-center gap-2 hover:text-white transition-colors">
                    <Phone className="w-4 h-4 flex-shrink-0" />
                    +962 7 9990 2083
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/962799902083" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                    <MessageCircle className="w-4 h-4 flex-shrink-0" />
                    {t('WhatsApp', 'واتساب', 'WhatsApp')}
                  </a>
                </li>
              </ul>
              <h4 className="font-semibold mb-3 text-white text-xs uppercase tracking-wider">{t('Follow Us', 'تابعنا', 'Bizi İzləyin')}</h4>
              <ul className="space-y-3 text-sm text-teal-300">
                <li>
                  <a href="https://www.facebook.com/share/18yRK3phWY/?mibextid=wwXIfr" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    {t('Facebook Page', 'صفحة فيسبوك', 'Facebook Səhifəsi')}
                  </a>
                </li>
                <li>
                  <a href="https://www.instagram.com/mizher.jo" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 hover:text-white transition-colors">
                    <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                    {t('Instagram Page', 'صفحة إنستغرام', 'Instagram Səhifəsi')}
                  </a>
                </li>
              </ul>
            </div>
          </div>
          </FadeIn>

          <div className="border-t border-teal-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-teal-500">
            <p>© 2026 {t('Mizher Medical Hub. All rights reserved.', 'مزهر الطبي. جميع الحقوق محفوظة.', 'Mizher Tibb Mərkəzi. Bütün hüquqlar qorunur.')}</p>
            <p>Powered by FastTechno®</p>
          </div>
        </div>
      </footer>
    </div>
  );
}