import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { Stethoscope, Building2, ShoppingBag, Users, Shield, Globe } from 'lucide-react';

export default function About() {
  const { isRTL, t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
      <div className="flex items-stretch gap-5 mb-12">
        <div className="w-1.5 bg-teal-500 rounded-full shrink-0" />
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 leading-tight mb-3">
            {t('aboutTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            {t('aboutSubtitle')}
          </p>
        </div>
      </div>

      <div className="prose prose-teal max-w-none space-y-8 text-foreground">
        <section>
          <h2 className="text-2xl font-semibold text-teal-700 mb-3">
            {t('whoWeAre')}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {isRTL
              ? 'مزهر الطبي هي منصة رعاية صحية رقمية متكاملة مقرها المملكة الأردنية الهاشمية. تم تأسيسها بهدف تحويل طريقة تلقي الرعاية الصحية وتقديمها في الأردن والمنطقة العربية. نجمع بين التكنولوجيا الحديثة والخبرة الطبية لنقدم تجربة صحية سلسة وموثوقة للجميع.'
              : 'Mizher Medical Hub is a comprehensive digital healthcare platform headquartered in the Hashemite Kingdom of Jordan. Founded with the mission of transforming how healthcare is accessed and delivered in Jordan and the wider Arab region, we bring together cutting-edge technology and deep medical expertise to offer a seamless, trustworthy health experience for everyone.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-teal-700 mb-3">
            {t('whatWeOffer')}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {isRTL
              ? 'تتيح المنصة للمرضى البحث عن الأطباء المتخصصين وحجز المواعيد بسهولة تامة، واستكشاف أفضل المستشفيات والمراكز الطبية في الأردن، والاستفادة من باقات السياحة العلاجية الشاملة، والتسوق من متجر صحي متكامل يضم الأدوية والأجهزة الطبية والمكملات الغذائية. كما نتيح للأطباء والمستشفيات والصيدليات إدارة خدماتهم ومرضاهم عبر لوحات تحكم متخصصة.'
              : 'Our platform enables patients to effortlessly search for specialist doctors and book appointments online, explore top-rated hospitals and medical centers across Jordan, access comprehensive medical tourism packages, and shop from a dedicated health marketplace offering medications, medical devices, and nutritional supplements. We also empower doctors, hospitals, and pharmacies to manage their services and patients through dedicated professional consoles.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-teal-700 mb-3">
            {t('whoIsItFor')}
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            {isRTL
              ? 'صُممت مزهر الطبي لخدمة المرضى الذين يبحثون عن رعاية طبية موثوقة، والأطباء الراغبين في توسيع قاعدة مرضاهم رقمياً، والمستشفيات والعيادات التي تسعى إلى تحسين تجربة المرضى، وأصحاب الصيدليات والمتاجر الصحية الراغبين في الوصول إلى عملاء جدد، فضلاً عن المرضى الدوليين المقبلين على السياحة العلاجية في الأردن.'
              : 'Mizher Medical Hub is designed to serve patients seeking reliable medical care, doctors looking to grow their practice digitally, hospitals and clinics aiming to improve the patient experience, pharmacy and health store owners wanting to reach new customers, and international patients interested in medical tourism in Jordan. Our platform bridges the gap between healthcare providers and the people who need them most.'}
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-teal-700 mb-3">
            {isRTL ? 'مؤسس المنصة' : 'Our Founder'}
          </h2>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <img
              src="/__l5e/assets-v1/1b69b894-2ac1-4cf0-b0ae-9d5869bc2583/942f20867_Screenshot2026-07-01213910.png"
              alt="Dr. Abdelrahman Salem Mizher"
              className="w-32 h-32 rounded-2xl object-cover shrink-0 border border-teal-100"
            />
            <div>
              <h3 className="font-semibold text-foreground mb-1">
                {isRTL ? 'د. عبدالرحمن سالم مزهر' : 'Dr. Abdelrahman Salem Mizher'}
              </h3>
              <p className="text-base leading-relaxed text-muted-foreground">
                {isRTL
                  ? 'د. عبدالرحمن سالم مزهر هو مؤسس مزهر الطبي، إذ سخّر خبرته الطبية ورؤيته الريادية لبناء منصة رقمية تجمع الأطباء والمستشفيات والصيدليات والمرضى تحت مظلة واحدة. من خلال شغفه بتطوير قطاع الرعاية الصحية في الأردن، عمل على تأسيس منظومة تسهّل وصول المرضى إلى رعاية طبية موثوقة، وتمنح مقدمي الخدمات الصحية أدوات رقمية حديثة لإدارة أعمالهم بكفاءة أكبر.'
                  : 'Dr. Abdelrahman Salem Mizher is the founder of Mizher Medical Hub, bringing together his medical background and entrepreneurial vision to build a digital platform that unites doctors, hospitals, pharmacies, and patients under one roof. Driven by a passion for advancing healthcare in Jordan, he set out to create an ecosystem that makes it easier for patients to access trustworthy medical care while equipping healthcare providers with modern digital tools to manage their practices more efficiently.'}
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-teal-700 mb-3">
            {t('ourValues')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            {[
              { Icon: Shield, en: 'Trust & Safety', ar: 'الثقة والأمان', desc_en: 'Every doctor and facility is verified before listing.', desc_ar: 'كل طبيب ومنشأة يخضعان للتحقق قبل الإدراج.' },
              { Icon: Globe, en: 'Accessibility', ar: 'إمكانية الوصول', desc_en: 'Healthcare in Arabic and English, anytime, anywhere.', desc_ar: 'رعاية صحية بالعربية والإنجليزية، في أي وقت ومكان.' },
              { Icon: Users, en: 'Community', ar: 'المجتمع', desc_en: 'Connecting patients, doctors, and providers in one hub.', desc_ar: 'ربط المرضى والأطباء ومقدمي الخدمات في منظومة واحدة.' },
            ].map(({ Icon, en, ar, desc_en, desc_ar }) => (
              <div key={en} className="bg-card border border-teal-100 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{isRTL ? ar : en}</h3>
                <p className="text-xs text-muted-foreground">{isRTL ? desc_ar : desc_en}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}