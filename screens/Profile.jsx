import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@/lib/router-compat';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { motion } from 'framer-motion';
import { User, Calendar, MessageSquare, Bell, CreditCard, ShoppingBag, Edit2, Save, X, CheckCircle, Clock, XCircle, Package, Stethoscope, LogOut, Video } from 'lucide-react';
import DirectMessages from '@/components/messaging/DirectMessages';
import { Button } from '@/components/ui/button';

const TABS = [
  { key: 'info',          icon: User,          labelKey: 'myInfo'          },
  { key: 'appointments',  icon: Calendar,       labelKey: 'appointments'    },
  { key: 'messages',      icon: MessageSquare,  labelKey: 'messages'        },
  { key: 'notifications', icon: Bell,           labelKey: 'notifications'   },
  { key: 'payments',      icon: CreditCard,     labelKey: 'paymentMethods'  },
  { key: 'orders',        icon: ShoppingBag,    labelKey: 'orders'          },
];

const STATUS_CONFIG = {
  pending:    { color: 'bg-yellow-100 text-yellow-700', icon: Clock,       en: 'Pending',    ar: 'في الانتظار'  },
  confirmed:  { color: 'bg-teal-100 text-teal-700',    icon: CheckCircle, en: 'Confirmed',  ar: 'مؤكد'         },
  completed:  { color: 'bg-green-100 text-green-700',  icon: CheckCircle, en: 'Completed',  ar: 'مكتمل'        },
  cancelled:  { color: 'bg-red-100 text-red-700',      icon: XCircle,     en: 'Cancelled',  ar: 'ملغى'         },
  processing: { color: 'bg-blue-100 text-blue-700',    icon: Clock,       en: 'Processing', ar: 'جاري التجهيز' },
  shipped:    { color: 'bg-purple-100 text-purple-700',icon: Package,     en: 'Shipped',    ar: 'تم الشحن'     },
  delivered:  { color: 'bg-green-100 text-green-700',  icon: CheckCircle, en: 'Delivered',  ar: 'تم التوصيل'   },
};

function StatusBadge({ status, isRTL }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {isRTL ? cfg.ar : cfg.en}
    </span>
  );
}

function InfoTab({ user, isRTL }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    full_name:  user?.full_name || '',
    email:      user?.email     || '',
    phone:      '',
    dob:        '',
    address:    '',
    blood_type: '',
    allergies:  '',
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl overflow-hidden border border-border -m-5 md:-m-6 mb-1">
        <div className="relative h-24 bg-gradient-to-r from-teal-700 to-teal-400">
          <button onClick={() => setEditing(!editing)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-teal-800/80 hover:bg-teal-800 text-white flex items-center justify-center transition-colors">
            {editing ? <X className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
          </button>
          <div className="absolute -bottom-10 left-6 w-20 h-20 rounded-full bg-muted border-4 border-card flex items-center justify-center text-muted-foreground text-3xl font-bold">
            {(user?.full_name || 'U')[0].toUpperCase()}
          </div>
        </div>
        <div className="pt-12 pb-5 px-6 bg-card">
          <h2 className="text-xl font-bold text-foreground">{user?.full_name || (isRTL ? 'المستخدم' : 'User')}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{user?.email}</p>
          <span className="inline-flex items-center gap-1 text-xs text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full mt-2.5">
            <CheckCircle className="w-3 h-3 fill-teal-700 text-white" />
            {isRTL ? 'حساب موثق' : 'Verified Account'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { key: 'full_name',  en: 'Full Name',      ar: 'الاسم الكامل',       type: 'text'  },
          { key: 'email',      en: 'Email',           ar: 'البريد الإلكتروني', type: 'email', disabled: true },
          { key: 'phone',      en: 'Phone',           ar: 'الهاتف',             type: 'tel'   },
          { key: 'dob',        en: 'Date of Birth',   ar: 'تاريخ الميلاد',      type: 'date'  },
          { key: 'blood_type', en: 'Blood Type',      ar: 'فصيلة الدم',         type: 'text'  },
          { key: 'address',    en: 'Address',         ar: 'العنوان',            type: 'text'  },
        ].map(f => (
          <div key={f.key}>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{isRTL ? f.ar : f.en}</label>
            <input type={f.type} value={form[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
              disabled={!editing || f.disabled}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 disabled:bg-muted" />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{isRTL ? 'الحساسيات' : 'Allergies'}</label>
          <textarea value={form.allergies} onChange={e => setForm(prev => ({ ...prev, allergies: e.target.value }))}
            disabled={!editing} rows={2}
            className="w-full px-3 py-2 rounded-xl border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 disabled:opacity-60 disabled:bg-muted resize-none" />
        </div>
      </div>

      {editing && (
        <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl gap-2" onClick={() => setEditing(false)}>
          <Save className="w-4 h-4" />
          {isRTL ? 'حفظ التغييرات' : 'Save Changes'}
        </Button>
      )}
    </div>
  );
}

function AppointmentsTab({ bookings, isRTL }) {
  const navigate = useNavigate();
  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const past     = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');

  const Card = ({ b }) => (
    <div className="flex items-start gap-4 p-4 bg-background rounded-xl border border-border hover:border-teal-200 transition-colors">
      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
        <Stethoscope className="w-5 h-5 text-teal-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm text-foreground">{b.patient_name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {b.consultation_type && <span className="capitalize">{b.consultation_type} · </span>}
          {b.date}{b.time && ` · ${b.time}`}
        </p>
        {b.notes && <p className="text-xs text-muted-foreground mt-1 truncate">{b.notes}</p>}
        {b.consultation_type === 'video' && b.status === 'confirmed' && (
          <Button size="sm" onClick={() => navigate(`/video-call/${b.id}`)}
            className="mt-2 bg-teal-500 hover:bg-teal-600 text-white rounded-full h-7 px-3 text-xs gap-1.5">
            <Video className="w-3 h-3" />
            {isRTL ? 'انضم لمكالمة الفيديو' : 'Join Video Call'}
          </Button>
        )}
      </div>
      <div className="flex flex-col items-end gap-2">
        <StatusBadge status={b.status} isRTL={isRTL} />
        {b.total_amount && <span className="text-sm font-bold text-teal-600">{b.total_amount} JOD</span>}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
          {isRTL ? 'المواعيد القادمة' : 'Upcoming Appointments'} ({upcoming.length})
        </h3>
        {upcoming.length === 0
          ? <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-xl">{isRTL ? 'لا توجد مواعيد قادمة' : 'No upcoming appointments'}</p>
          : <div className="space-y-3">{upcoming.map(b => <Card key={b.id} b={b} />)}</div>}
      </div>
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-muted-foreground inline-block" />
          {isRTL ? 'السجل السابق' : 'Past Appointments'} ({past.length})
        </h3>
        {past.length === 0
          ? <p className="text-sm text-muted-foreground text-center py-8 bg-muted/30 rounded-xl">{isRTL ? 'لا يوجد سجل سابق' : 'No past appointments'}</p>
          : <div className="space-y-3 opacity-75">{past.map(b => <Card key={b.id} b={b} />)}</div>}
      </div>
    </div>
  );
}

function MessagesTab({ isRTL, initialDoctorId, initialDoctorName }) {
  return <DirectMessages mode="patient" initialDoctorId={initialDoctorId} initialDoctorName={initialDoctorName} />;
}

function NotificationsTab({ bookings, isRTL }) {
  const upcoming = bookings.filter(b => (b.status === 'pending' || b.status === 'confirmed') && b.date);
  const notifications = [
    ...upcoming.map(b => ({
      id: b.id, icon: Calendar, color: 'bg-teal-100 text-teal-600',
      titleEn: `Upcoming appointment on ${b.date}${b.time ? ' at ' + b.time : ''}`,
      titleAr: `موعد قادم بتاريخ ${b.date}${b.time ? ' الساعة ' + b.time : ''}`,
      subEn: b.consultation_type ? `${b.consultation_type} consultation` : 'Consultation',
      subAr: b.consultation_type === 'message' ? 'استشارة نصية' : b.consultation_type === 'video' ? 'استشارة فيديو' : 'استشارة صوتية',
    })),
    ...bookings.filter(b => b.status === 'pending' && b.total_amount).map(b => ({
      id: `pay-${b.id}`, icon: CreditCard, color: 'bg-yellow-100 text-yellow-600',
      titleEn: `Payment of ${b.total_amount} JOD pending`,
      titleAr: `دفع مبلغ ${b.total_amount} دينار بانتظار التأكيد`,
      subEn: `Booking on ${b.date || 'TBD'}`, subAr: `حجز بتاريخ ${b.date || 'غير محدد'}`,
    })),
  ];

  return (
    <div className="space-y-3">
      {notifications.length === 0 ? (
        <div className="text-center py-16">
          <Bell className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</p>
        </div>
      ) : notifications.map(n => {
        const Icon = n.icon;
        return (
          <div key={n.id} className="flex items-start gap-4 p-4 bg-background rounded-xl border border-border">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${n.color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">{isRTL ? n.titleAr : n.titleEn}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{isRTL ? n.subAr : n.subEn}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PaymentsTab({ bookings, isRTL }) {
  const paidBookings = bookings.filter(b => b.total_amount);
  const [savedMethods, setSavedMethods] = useState(() => {
    try { return JSON.parse(localStorage.getItem('saved_payment_methods') || '[]'); } catch { return []; }
  });
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ type: 'visa', card_number: '', expiry: '', cardholder: '' });
  const [errors, setErrors] = useState({});

  const CARD_ICONS = { visa: '💳', mastercard: '💳', network: '🏦', jordanian_wallet: '📱' };

  const validate = () => {
    const e = {};
    if (form.type === 'visa' || form.type === 'mastercard' || form.type === 'network') {
      if (!/^\d{16}$/.test(form.card_number.replace(/\s/g, ''))) e.card_number = isRTL ? 'رقم البطاقة يجب أن يكون 16 رقماً' : 'Card number must be 16 digits';
      if (!/^\d{2}\/\d{2}$/.test(form.expiry)) e.expiry = isRTL ? 'صيغة غير صحيحة (MM/YY)' : 'Invalid format (MM/YY)';
      if (!form.cardholder.trim()) e.cardholder = isRTL ? 'مطلوب' : 'Required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    const last4 = form.card_number.replace(/\s/g, '').slice(-4);
    const method = {
      id: Date.now().toString(),
      type: form.type,
      label: form.type === 'jordanian_wallet' ? (isRTL ? 'محفظة أردنية' : 'Jordanian Wallet') : `•••• •••• •••• ${last4}`,
      cardholder: form.cardholder,
      expiry: form.expiry,
    };
    const updated = [...savedMethods, method];
    localStorage.setItem('saved_payment_methods', JSON.stringify(updated));
    await base44.auth.updateMe({ payment_methods_count: updated.length });
    setSavedMethods(updated);
    setShowForm(false);
    setForm({ type: 'visa', card_number: '', expiry: '', cardholder: '' });
    setSaving(false);
  };

  const handleRemove = (id) => {
    const updated = savedMethods.filter(m => m.id !== id);
    localStorage.setItem('saved_payment_methods', JSON.stringify(updated));
    setSavedMethods(updated);
  };

  const formatCardInput = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const isCardType = form.type !== 'jordanian_wallet';

  return (
    <div className="space-y-6">
      {/* Saved Methods */}
      <div>
        <h3 className="text-sm font-semibold mb-3">{isRTL ? 'طرق الدفع المحفوظة' : 'Saved Payment Methods'}</h3>
        {savedMethods.length === 0 && !showForm && (
          <div className="text-center py-8 bg-muted/30 rounded-xl mb-3">
            <CreditCard className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">{isRTL ? 'لا توجد طرق دفع محفوظة' : 'No saved payment methods'}</p>
          </div>
        )}
        {savedMethods.length > 0 && (
          <div className="space-y-2 mb-3">
            {savedMethods.map(m => (
              <div key={m.id} className="flex items-center gap-3 p-4 bg-background rounded-xl border border-border hover:border-teal-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center text-white text-lg flex-shrink-0">
                  {CARD_ICONS[m.type] || '💳'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground">{m.label}</p>
                  {m.cardholder && <p className="text-xs text-muted-foreground mt-0.5">{m.cardholder}{m.expiry ? ` · ${isRTL ? 'تنتهي' : 'Exp'} ${m.expiry}` : ''}</p>}
                  <span className="text-xs bg-teal-50 text-teal-700 px-2 py-0.5 rounded-full font-medium capitalize">{m.type.replace('_', ' ')}</span>
                </div>
                <button onClick={() => handleRemove(m.id)} className="text-muted-foreground hover:text-red-500 transition-colors p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {!showForm ? (
          <Button variant="outline" onClick={() => setShowForm(true)}
            className="border-teal-200 text-teal-700 rounded-xl gap-2 w-full hover:bg-teal-50">
            + {isRTL ? 'إضافة طريقة دفع' : 'Add Payment Method'}
          </Button>
        ) : (
          <div className="border border-teal-200 rounded-xl p-5 bg-teal-50/30 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground">{isRTL ? 'إضافة طريقة دفع جديدة' : 'Add New Payment Method'}</h4>
              <button onClick={() => { setShowForm(false); setErrors({}); }} className="text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
            </div>

            {/* Type */}
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{isRTL ? 'نوع الدفع' : 'Payment Type'}</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { val: 'visa', label: 'Visa' },
                  { val: 'mastercard', label: 'Mastercard' },
                  { val: 'network', label: 'Network' },
                  { val: 'jordanian_wallet', label: isRTL ? 'محفظة' : 'Wallet' },
                ].map(opt => (
                  <button key={opt.val} onClick={() => setForm(f => ({ ...f, type: opt.val }))}
                    className={`py-2 px-3 rounded-xl text-sm font-medium border transition-all ${form.type === opt.val ? 'bg-teal-500 text-white border-teal-500' : 'bg-background border-border text-muted-foreground hover:border-teal-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cardholder */}
            {isCardType && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{isRTL ? 'اسم حامل البطاقة' : 'Cardholder Name'}</label>
                <input value={form.cardholder} onChange={e => setForm(f => ({ ...f, cardholder: e.target.value }))}
                  placeholder={isRTL ? 'الاسم كما يظهر على البطاقة' : 'Name as it appears on card'}
                  className={`w-full h-10 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${errors.cardholder ? 'border-red-400' : 'border-input'}`} />
                {errors.cardholder && <p className="text-xs text-red-500 mt-1">{errors.cardholder}</p>}
              </div>
            )}

            {/* Card Number */}
            {isCardType && (
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{isRTL ? 'رقم البطاقة' : 'Card Number'}</label>
                <input value={form.card_number} onChange={e => setForm(f => ({ ...f, card_number: formatCardInput(e.target.value) }))}
                  placeholder="•••• •••• •••• ••••" maxLength={19}
                  className={`w-full h-10 px-3 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${errors.card_number ? 'border-red-400' : 'border-input'}`} />
                {errors.card_number && <p className="text-xs text-red-500 mt-1">{errors.card_number}</p>}
                <p className="text-xs text-muted-foreground mt-1">🔒 {isRTL ? 'يتم حفظ الأرقام الأربعة الأخيرة فقط' : 'Only last 4 digits are stored'}</p>
              </div>
            )}

            {/* Expiry */}
            {isCardType && (
              <div className="w-40">
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}</label>
                <input value={form.expiry} onChange={e => setForm(f => ({ ...f, expiry: formatExpiry(e.target.value) }))}
                  placeholder="MM/YY" maxLength={5}
                  className={`w-full h-10 px-3 rounded-xl border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${errors.expiry ? 'border-red-400' : 'border-input'}`} />
                {errors.expiry && <p className="text-xs text-red-500 mt-1">{errors.expiry}</p>}
              </div>
            )}

            <Button onClick={handleSave} disabled={saving}
              className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl gap-2 w-full">
              <Save className="w-4 h-4" />
              {saving ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : (isRTL ? 'حفظ طريقة الدفع' : 'Save Payment Method')}
            </Button>
          </div>
        )}
      </div>

      {/* Payment History */}
      <div>
        <h3 className="text-sm font-semibold mb-3">{isRTL ? 'سجل المدفوعات' : 'Payment History'}</h3>
        {paidBookings.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6 bg-muted/30 rounded-xl">
            {isRTL ? 'لا توجد مدفوعات' : 'No payment history'}
          </p>
        ) : (
          <div className="space-y-2">
            {paidBookings.map(b => (
              <div key={b.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-teal-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium capitalize">{b.consultation_type || 'Consultation'}</p>
                  <p className="text-xs text-muted-foreground">{b.date || '—'} · {b.payment_method || '—'}</p>
                </div>
                <span className="font-bold text-sm text-teal-600">{b.total_amount} JOD</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrdersTab({ orders, isRTL }) {
  return (
    <div className="space-y-3">
      {orders.length === 0 ? (
        <div className="text-center py-16">
          <ShoppingBag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">{isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
        </div>
      ) : orders.map(o => (
        <div key={o.id} className="p-4 bg-background rounded-xl border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-sm">#{o.id?.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-muted-foreground">{o.created_date ? new Date(o.created_date).toLocaleDateString() : '—'}</p>
            </div>
            <div className="text-right">
              <StatusBadge status={o.status} isRTL={isRTL} />
              <p className="text-sm font-bold text-teal-600 mt-1">{o.total_amount} JOD</p>
            </div>
          </div>
          {o.items?.length > 0 && (
            <div className="border-t border-border pt-2 space-y-1">
              {o.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{item.product_name_en || item.product_name_ar} × {item.quantity}</span>
                  <span>{item.subtotal} JOD</span>
                </div>
              ))}
            </div>
          )}
          {o.delivery_address && (
            <p className="text-xs text-muted-foreground border-t border-border pt-2">
              📍 {o.delivery_address}{o.city ? `, ${o.city}` : ''}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Profile() {
  const { isRTL, t } = useLanguage();
  const urlParams = new URLSearchParams(window.location.search);
  const initialTab = urlParams.get('tab') || 'info';
  const initialDoctorId = urlParams.get('doctor') || null;
  const initialDoctorName = urlParams.get('doctorName') ? decodeURIComponent(urlParams.get('doctorName')) : null;
  const [activeTab, setActiveTab] = useState(initialTab);
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: bookings = [] } = useQuery({
    queryKey: ['my-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 50),
  });

  const { data: orders = [] } = useQuery({
    queryKey: ['my-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 30),
  });

  const upcomingCount  = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length;
  const pendingPayments = bookings.filter(b => b.status === 'pending' && b.total_amount).length;

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 pb-24 md:pb-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t('myProfile')}</h1>
            <p className="text-sm text-muted-foreground mt-1">{t('manageProfile')}</p>
          </div>
          <Button variant="outline" onClick={() => base44.auth.logout('/login')}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 gap-1.5 flex-shrink-0">
            <LogOut className="w-4 h-4" />
            {isRTL ? 'تسجيل الخروج' : 'Logout'}
          </Button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const badge = tab.key === 'notifications' ? (upcomingCount + pendingPayments) : 0;
            const isActive = activeTab === tab.key;
            return (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`relative flex flex-col items-center justify-center gap-3 py-6 rounded-2xl text-sm font-semibold transition-all ${
                  isActive ? 'bg-teal-600 text-white shadow-sm' : 'bg-card text-foreground shadow-sm hover:shadow-md'
                }`}>
                <span className="relative">
                  <Icon className={`w-7 h-7 ${isActive ? 'text-white' : 'text-foreground'}`} strokeWidth={1.75} />
                  {badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center text-[10px] rounded-full font-bold bg-teal-600 text-white">
                      {badge}
                    </span>
                  )}
                </span>
                {t(tab.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
          className="bg-card rounded-2xl p-5 md:p-6 shadow-sm border border-teal-500/10 min-h-[400px]">
          {activeTab === 'info'          && <InfoTab user={user} isRTL={isRTL} />}
          {activeTab === 'appointments'  && <AppointmentsTab bookings={bookings} isRTL={isRTL} />}
          {activeTab === 'messages'      && <MessagesTab isRTL={isRTL} initialDoctorId={initialDoctorId} initialDoctorName={initialDoctorName} />}
          {activeTab === 'notifications' && <NotificationsTab bookings={bookings} isRTL={isRTL} />}
          {activeTab === 'payments'      && <PaymentsTab bookings={bookings} isRTL={isRTL} />}
          {activeTab === 'orders'        && <OrdersTab orders={orders} isRTL={isRTL} />}
        </motion.div>
      </motion.div>
    </div>
  );
}