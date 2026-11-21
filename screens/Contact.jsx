import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Contact() {
  const { isRTL, t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-teal-800 mb-4">
          {t('contactTitle')}
        </h1>
        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
          {t('contactSubtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Contact Info */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-teal-700">
            {t('getInTouch')}
          </h2>
          {[
            { Icon: Mail,         label: t('email'),      value: 'support@mizhermedicalhub.com',           href: 'mailto:support@mizhermedicalhub.com' },
            { Icon: Phone,        label: t('phoneNumber'), value: '+962 7 9990 2083',                       href: 'tel:+962799902083' },
            { Icon: MessageCircle, label: 'WhatsApp',     value: '+962 7 9990 2083',                       href: 'https://wa.me/962799902083' },
            { Icon: MapPin,       label: 'Location',     value: isRTL ? 'عمّان، الأردن' : 'Amman, Jordan', href: null },
          ].map(({ Icon, label, value, href }) => (
            <div key={label} className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                {href
                  ? <a href={href} className="text-sm font-medium text-teal-700 hover:underline">{value}</a>
                  : <p className="text-sm font-medium text-foreground">{value}</p>
                }
              </div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div className="bg-card border border-teal-100 rounded-2xl p-6">
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-10 text-center">
              <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                <Send className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-lg font-semibold text-teal-700">
                {t('messageSent')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('messageSentDesc')}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {t('sendMessage')}
              </h2>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t('name')}
                </label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder={t('yourName')} required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t('email')}
                </label>
                <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com" required />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground block mb-1">
                  {t('messageLbl')}
                </label>
                <textarea value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder={t('howHelp')}
                  required rows={4}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none" />
              </div>
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700 text-white rounded-xl gap-2">
                <Send className="w-4 h-4" />
                {t('send')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}