import React from 'react';
import { Link } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { Stethoscope, Mail, Phone } from 'lucide-react';

export default function HomeFooterCTA() {
  const { isRTL } = useLanguage();

  return (
    <footer className="bg-teal-900 text-white py-14 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold">{isRTL ? 'مزهر الطبي' : 'Mizher Medical Hub'}</span>
            </div>
            <p className="text-teal-300 text-sm leading-relaxed max-w-xs">
              {isRTL
                ? 'منصة الرعاية الصحية الأولى في الأردن — تجمع الأطباء والمستشفيات والمرضى في تجربة متكاملة'
                : "Jordan's leading healthcare platform — connecting doctors, hospitals, and patients in one seamless experience"}
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{isRTL ? 'روابط سريعة' : 'Quick Links'}</h4>
            <ul className="space-y-2 text-sm text-teal-300">
              {[
                { to: '/doctors',    en: 'Find a Doctor',    ar: 'ابحث عن طبيب'    },
                { to: '/hospitals',  en: 'Hospitals',        ar: 'المستشفيات'       },
                { to: '/packages',   en: 'Medical Tourism',  ar: 'السياحة العلاجية' },
                { to: '/marketplace',en: 'Marketplace',      ar: 'المتجر'           },
                { to: '/community',  en: 'Community',        ar: 'المجتمع'          },
                { to: '/about',      en: 'About Us',         ar: 'عن المنصة'        },
                { to: '/contact',    en: 'Contact',          ar: 'تواصل معنا'       },
              ].map(l => (
                <li key={l.to}>
                  <Link to={l.to} className="hover:text-white transition-colors">{isRTL ? l.ar : l.en}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">{isRTL ? 'تواصل معنا' : 'Contact'}</h4>
            <ul className="space-y-3 text-sm text-teal-300">
              <li className="flex items-center gap-2"><Phone className="w-4 h-4" /> +962 7X XXX XXXX</li>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4" /> support@mizher.jo</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Link to="/doctor-console" className="text-xs bg-teal-700 hover:bg-teal-600 px-3 py-1.5 rounded-lg transition-colors">
                {isRTL ? 'بوابة الأطباء' : 'Doctors Portal'}
              </Link>
              <Link to="/hospital-console" className="text-xs bg-teal-700 hover:bg-teal-600 px-3 py-1.5 rounded-lg transition-colors">
                {isRTL ? 'بوابة المستشفيات' : 'Hospitals Portal'}
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-teal-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-teal-500">
          <p>© 2026 {isRTL ? 'مزهر الطبي. جميع الحقوق محفوظة.' : 'Mizher Medical Hub. All rights reserved.'}</p>
          <p>{isRTL ? 'صُنع بإتقان في الأردن 🇯🇴' : 'Made with care in Jordan 🇯🇴'}</p>
        </div>
      </div>
    </footer>
  );
}