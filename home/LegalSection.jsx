import React from 'react';
import { useLanguage } from '@/lib/i18n';
import { FileText, Lock, Scale, Mail } from 'lucide-react';
import LegalCard from '@/components/home/LegalCard';
import TitleECG from '@/components/reveal/TitleECG';

const TERMS = {
  ar: [
    { title: 'استخدام المنصة', text: 'تربطك المنصة بأطباء ومستشفيات ومختبرات ومتاجر مرخّصة في الأردن. الاستخدام للبالغين أو بموافقة ولي الأمر.' },
    { title: 'الحجوزات والدفع', text: 'الأسعار تظهر بالدينار الأردني قبل التأكيد. الدفع آمن، وتحصل على تأكيد الحجز أو الطلب مباشرة بعد إتمامه.' },
    { title: 'الرعاية الطبية', text: 'الخدمة الطبية يقدّمها مقدّم مرخّص، والمنصة لا تقدّم تشخيصاً ولا تستبدل الطبيب. في الحالات الطارئة اتصل بالطوارئ 911.' },
    { title: 'حسابك', text: 'قدّم معلومات صحيحة وحافظ على سرية كلمة المرور، فأنت مسؤول عن أي نشاط يتم على حسابك.' },
    { title: 'الإلغاء والاسترداد', text: 'تخضع سياسة الإلغاء لكل مقدّم خدمة وتظهر تفاصيلها عند الحجز. تواصل معنا لأي استفسار عن الاسترداد.' },
    { title: 'للمزوّدين', text: 'يجب أن يكون المزوّد مرخّصاً ونشطاً. يحق للمنصة تعليق أي حساب يخالف الأنظمة أو يقدّم معلومات مضللة.' },
  ],
  en: [
    { title: 'Using the platform', text: 'Mizher connects you with licensed doctors, hospitals, labs and stores in Jordan. Use is for adults or with a guardian\'s consent.' },
    { title: 'Bookings & payments', text: 'Prices are shown in Jordanian Dinar before you confirm. Payment is secure, and you receive a booking or order confirmation instantly.' },
    { title: 'Medical care', text: 'Medical services are delivered by licensed providers. The platform does not diagnose or replace your doctor. In emergencies call 911.' },
    { title: 'Your account', text: 'Provide accurate information and keep your password private — you are responsible for activity on your account.' },
    { title: 'Cancellations & refunds', text: 'Each provider sets its cancellation policy, shown at booking. Contact us for any refund question.' },
    { title: 'For providers', text: 'Providers must be licensed and active. The platform may suspend any account that breaks regulations or shares misleading information.' },
  ],
};

const PRIVACY = {
  ar: [
    { title: 'البيانات التي نجمعها', text: 'الاسم والبريد الإلكتروني ورقم الهاتف، إضافة إلى تفاصيل الحجوزات والطلبات التي تنشئها.' },
    { title: 'كيف نستخدمها', text: 'لتأكيد الحجوزات والطلبات، وإرسال التذكيرات، وتقديم الدعم، وتحسين تجربتك على المنصة.' },
    { title: 'من يطّلع عليها', text: 'المزوّد الذي تحجز معه أو تشتري منه فقط، وفريق المنصة المصرّح عند الحاجة لخدمتك.' },
    { title: 'حماية البيانات', text: 'تُحفظ بياناتك بشكل آمن، ولا نبيعها أو نشاركها مع أي طرف ثالث لأغراض تجارية.' },
    { title: 'حقوقك', text: 'يمكنك طلب الاطلاع على بياناتك أو تصحيحها أو حذف حسابك بالتواصل مع فريق الدعم.' },
    { title: 'التواصل', text: 'لأي سؤال يتعلق بالخصوصية راسلنا على support@mizhermedicalhub.com أو اتصل على +962 7 9990 2083.' },
  ],
  en: [
    { title: 'What we collect', text: 'Your name, email, phone number, and the details of the bookings and orders you create.' },
    { title: 'How we use it', text: 'To confirm bookings and orders, send reminders, provide support, and improve your experience.' },
    { title: 'Who sees it', text: 'Only the provider you book with or buy from, and authorized Mizher staff when needed to serve you.' },
    { title: 'Data protection', text: 'Your data is stored securely. We never sell it or share it with third parties for marketing.' },
    { title: 'Your rights', text: 'You can request access to your data, correct it, or delete your account by contacting support.' },
    { title: 'Contact us', text: 'For any privacy question email support@mizhermedicalhub.com or call +962 7 9990 2083.' },
  ],
};

export default function LegalSection() {
  const { lang } = useLanguage();
  const isAr = lang === 'ar';
  const terms = isAr ? TERMS.ar : TERMS.en;
  const privacy = isAr ? PRIVACY.ar : PRIVACY.en;

  return (
    <section className="max-w-6xl mx-auto px-4 md:px-6 py-14">
      <div className="text-center mb-9">
        <div className="inline-flex items-center gap-2 bg-teal-50 border border-teal-200 rounded-full px-3.5 py-1.5 mb-3">
          <Scale className="w-4 h-4 text-teal-600" />
          <span className="text-xs font-semibold text-teal-700">
            {isAr ? 'الشفافية والثقة' : 'Transparency & Trust'}
          </span>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          {isAr ? 'الشروط والأحكام وسياسة الخصوصية' : 'Terms & Conditions and Privacy Policy'}
        </h2>
        <TitleECG width={132} align="center" />
        <p className="text-muted-foreground text-sm mt-2 max-w-lg mx-auto">
          {isAr
            ? 'قواعد بسيطة وواضحة تحمي تجربتك على المنصة، بدون تعقيد.'
            : 'Simple, clear rules that protect your experience on the platform, with no legal maze.'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <LegalCard
          icon={FileText}
          title={isAr ? 'الشروط والأحكام' : 'Terms & Conditions'}
          subtitle={isAr ? 'آخر تحديث: نوفمبر 2026' : 'Last updated: November 2026'}
          items={terms}
        />
        <LegalCard
          icon={Lock}
          title={isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
          subtitle={isAr ? 'خصوصيتك أولويتنا' : 'Your privacy comes first'}
          items={privacy}
        />
      </div>

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs text-muted-foreground">
        <span>{isAr ? 'باستخدامك المنصة فإنك توافق على هذه الشروط.' : 'By using the platform you agree to these terms.'}</span>
        <a href="mailto:support@mizhermedicalhub.com" className="inline-flex items-center gap-1.5 text-teal-700 font-semibold hover:text-teal-800">
          <Mail className="w-3.5 h-3.5" />
          {isAr ? 'لديك سؤال؟ راسلنا' : 'Questions? Email us'}
        </a>
      </div>
    </section>
  );
}