import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from '@/lib/router-compat';
import { useLanguage } from '@/lib/i18n';
import { Home, Stethoscope, Plane, ShoppingBag, Building2, Settings, User, Store, ChevronRight, ShoppingCart, Bell, Calendar, CreditCard, MessageCircle, Package, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import CartDrawer from '@/components/marketplace/CartDrawer';
import { useCartDockPulse } from '@/lib/flyToCart';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import LivingLogo from '@/components/header/LivingLogo';

const PROVIDER_CONSOLE_PATHS = {
  doctor: '/doctor-console',
  retailer: '/retailer-console',
  lab: '/lab-console',
  hospital: '/hospital-console',
  clinic: '/clinic-console',
};

function getProfilePath() {
  const session = getProviderSession();
  return session && PROVIDER_CONSOLE_PATHS[session.type] ? PROVIDER_CONSOLE_PATHS[session.type] : '/profile';
}

const navItems = [
{ key: 'home', path: '/', icon: Home },
{ key: 'marketplace', path: '/marketplace', icon: ShoppingBag },
{ key: 'doctors', path: '/doctors', icon: Stethoscope },
{ key: 'hospitals', path: '/hospitals', icon: Building2 },
{ key: 'packages', path: '/packages', icon: Plane },
{ key: 'labs', path: '/labs', icon: FlaskConical, labelEn: 'Labs', labelAr: 'المختبرات' }];

const mobileNavItems = [
{ key: 'home', path: '/', icon: Home },
{ key: 'marketplace', path: '/marketplace', icon: ShoppingBag },
{ key: 'doctors', path: '/doctors', icon: Stethoscope },
{ key: 'settings', path: null, icon: Settings, labelEn: 'More', labelAr: 'المزيد' },
];


function NotifDropdown({ bookings, messages, orders, isRTL, onClose, onDismiss, position }) {
  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const unreadMessages = messages.filter(m => !m.read);
  const pendingOrders = orders.filter(o => o.status === 'pending' || o.status === 'confirmed');

  const notifications = [
    ...upcoming.map(b => ({
      id: b.id,
      type: 'booking',
      icon: Calendar,
      color: 'bg-teal-100 text-teal-600',
      link: '/profile',
      title: isRTL
        ? `موعد قادم${b.date ? ' بتاريخ ' + b.date : ''}${b.time ? ' الساعة ' + b.time : ''}`
        : `Appointment${b.date ? ' on ' + b.date : ''}${b.time ? ' at ' + b.time : ''}`,
      sub: isRTL
        ? (b.consultation_type === 'video' ? 'استشارة فيديو' : b.consultation_type === 'voice' ? 'استشارة صوتية' : 'استشارة')
        : (b.consultation_type ? b.consultation_type + ' consultation' : 'Consultation'),
    })),
    ...unreadMessages.map(m => ({
      id: `msg-${m.id}`,
      type: 'message',
      messageId: m.id,
      icon: MessageCircle,
      color: 'bg-blue-100 text-blue-600',
      link: '/profile',
      title: isRTL ? `رسالة جديدة من ${m.sender_name || 'طبيب'}` : `New message from ${m.sender_name || 'Doctor'}`,
      sub: isRTL ? (m.content?.slice(0, 40) || '') : (m.content?.slice(0, 40) || ''),
    })),
    ...pendingOrders.map(o => ({
      id: `ord-${o.id}`,
      type: 'order',
      icon: Package,
      color: 'bg-orange-100 text-orange-600',
      link: '/profile',
      title: isRTL ? `طلب ${o.status === 'confirmed' ? 'مؤكد' : 'قيد الانتظار'}` : `Order ${o.status}`,
      sub: isRTL ? `المبلغ الكلي: ${o.total_amount || 0} د.أ` : `Total: ${o.total_amount || 0} JOD`,
    })),
  ];

  const desktopClass = "absolute top-full mt-2 right-0 w-80 bg-white rounded-2xl shadow-2xl border border-teal-100 overflow-hidden z-50";
  const mobileClass = "absolute bottom-16 left-0 right-0 bg-white border-t border-teal-100 shadow-2xl rounded-t-2xl z-50";

  return (
    <motion.div
      initial={position === 'mobile' ? { opacity: 0, y: 20 } : { opacity: 0, y: -8, scale: 0.96 }}
      animate={position === 'mobile' ? { opacity: 1, y: 0 } : { opacity: 1, y: 0, scale: 1 }}
      exit={position === 'mobile' ? { opacity: 0, y: 20 } : { opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className={position === 'mobile' ? mobileClass : desktopClass}>
      <div className="px-4 py-3 border-b border-teal-100 flex items-center justify-between">
        <span className="font-semibold text-sm text-foreground">{isRTL ? 'الإشعارات' : 'Notifications'}</span>
        {notifications.length > 0 && (
          <span className="text-xs bg-red-100 text-red-600 font-bold px-2 py-0.5 rounded-full">{notifications.length}</span>
        )}
      </div>
      <div className="max-h-72 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
            <Bell className="w-8 h-8 opacity-30" />
            <p className="text-sm">{isRTL ? 'لا توجد إشعارات' : 'No notifications'}</p>
          </div>
        ) : notifications.map(n => {
          const Icon = n.icon;
          const handleClick = async () => {
            if (n.type === 'message' && n.messageId) {
              await base44.entities.Message.update(n.messageId, { read: true });
            }
            onDismiss(n.id);
            onClose();
          };
          return (
            <button key={n.id} onClick={handleClick}
              className="w-full flex items-start gap-3 px-4 py-3 border-b border-teal-50 last:border-0 hover:bg-teal-50 transition-colors text-left">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${n.color}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-foreground leading-snug">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.sub}</p>
              </div>
            </button>
          );
        })}
      </div>
      <div className="px-4 py-2 border-t border-teal-100">
        <Link to="/profile?tab=notifications" onClick={onClose} className="text-xs text-teal-600 font-medium hover:underline">
          {isRTL ? 'عرض كل الإشعارات ←' : 'View all in Profile →'}
        </Link>
      </div>
    </motion.div>
  );
}

function SettingsPanel({ onClose, toggleLang, setLang, lang, isRTL }) {
  const items = [
  { icon: User, label: isRTL ? 'الملف الشخصي' : 'Profile', path: getProfilePath() },
  { icon: Stethoscope, label: isRTL ? 'إضافة طبيب' : 'Add a Doctor', path: '/doctor-console' },
  { icon: Store, label: isRTL ? 'إضافة صيدلية/متجر' : 'Add Store / Pharmacy', path: '/retailer-console' },
  { icon: FlaskConical, label: isRTL ? 'إضافة مختبر' : 'Add a Lab', path: '/lab-console' }];


  return (
    <motion.div
      initial={{ opacity: 0, y: -8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.96 }}
      transition={{ duration: 0.15 }}
      className="absolute top-full mt-2 right-0 w-64 bg-white rounded-2xl shadow-2xl border border-teal-100 overflow-hidden z-50">
      
      <div className="p-2 space-y-1">
        {items.map(({ icon: Icon, label, path }) =>
        path ?
        <Link key={label} to={path} onClick={onClose}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-50 cursor-pointer group transition-colors">
                <div className="w-9 h-9 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                  <Icon className="w-4 h-4 text-teal-600" />
                </div>
                <span className="text-sm font-medium text-foreground flex-1">{label}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </Link> :

        <div key={label} className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-50 cursor-pointer group transition-colors">
              <div className="w-9 h-9 rounded-xl bg-teal-50 group-hover:bg-teal-100 flex items-center justify-center transition-colors">
                <Icon className="w-4 h-4 text-teal-600" />
              </div>
              <span className="text-sm font-medium text-foreground flex-1">{label}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </div>

        )}
      </div>
      <div className="border-t border-teal-100 p-3">
        <p className="text-xs text-muted-foreground px-4 pb-2 pt-1 font-medium">
          {lang === 'ar' ? 'اللغة' : lang === 'az' ? 'Dil' : 'Language'}
        </p>
        {[
        { code: 'en', label: 'English', flag: '🇬🇧' },
        { code: 'ar', label: 'العربية', flag: '🇯🇴' },
        { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' }].
        map(({ code, label, flag }) =>
        <button key={code} onClick={() => {setLang(code);onClose();}}
        className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${lang === code ? 'bg-teal-50 text-teal-700 font-semibold' : 'hover:bg-teal-50 text-foreground'}`}>
            <span className="text-lg">{flag}</span>
            <span className="text-sm flex-1 text-left">{label}</span>
            {lang === code && <div className="w-2 h-2 rounded-full bg-teal-500" />}
          </button>
        )}
      </div>
    </motion.div>);

}

export default function Navbar() {
  const { t, lang, setLang, toggleLang, isRTL } = useLanguage();
  const location = useLocation();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [dismissedIds, setDismissedIds] = useState([]);
  const settingsRef = useRef(null);
  const notifRef = useRef(null);
  const { items } = useCart();
  const cartCount = items.reduce((s, i) => s + i.quantity, 0);
  const dock = useCartDockPulse();
  const prevCountRef = useRef(cartCount);
  const [badgeDir, setBadgeDir] = useState('up');
  useEffect(() => {
    setBadgeDir(cartCount > prevCountRef.current ? 'up' : 'down');
    prevCountRef.current = cartCount;
  }, [cartCount]);

  const handleDismiss = (id) => {
    setDismissedIds(prev => [...prev, id]);
  };

  const { data: user } = useQuery({
    queryKey: ['navbar-me'],
    queryFn: () => base44.auth.me(),
    staleTime: 300000,
    retry: false,
  });

  const { data: bookings = [], refetch: refetchBookings } = useQuery({
    queryKey: ['navbar-bookings'],
    queryFn: () => base44.entities.Booking.list('-created_date', 50),
    staleTime: 30000,
    enabled: !!user,
  });

  const { data: messages = [], refetch: refetchMessages } = useQuery({
    queryKey: ['navbar-messages'],
    queryFn: () => base44.entities.Message.filter({ patient_id: user?.id, read: false }, '-created_date', 50),
    staleTime: 30000,
    enabled: !!user?.id,
  });

  const { data: orders = [], refetch: refetchOrders } = useQuery({
    queryKey: ['navbar-orders'],
    queryFn: () => base44.entities.Order.list('-created_date', 50),
    staleTime: 30000,
    enabled: !!user,
  });

  const visibleBookings = bookings.filter(b => !dismissedIds.includes(b.id));
  const visibleMessages = messages.filter(m => !dismissedIds.includes(`msg-${m.id}`) && !m.read);
  const visibleOrders = orders.filter(o => !dismissedIds.includes(`ord-${o.id}`) && (o.status === 'pending' || o.status === 'confirmed'));
  
  const notifCount = visibleBookings.filter(b => b.status === 'pending' || b.status === 'confirmed').length
    + visibleMessages.length
    + visibleOrders.length;

  useEffect(() => {
    if (!user?.id) return;
    const u1 = base44.entities.Booking.subscribe(() => refetchBookings());
    const u2 = base44.entities.Message.subscribe(() => refetchMessages());
    const u3 = base44.entities.Order.subscribe(() => refetchOrders());
    return () => { u1(); u2(); u3(); };
  }, [user?.id]);

  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      {/* Desktop Navbar */}
      <nav className="hidden md:block fixed top-0 left-0 right-0 z-50 glass-white border-b border-teal-500/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <LivingLogo isRTL={isRTL} />
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map(({ key, path, icon: Icon, labelEn, labelAr }) => {
              const isActive = location.pathname === path ||
              path !== '/' && location.pathname.startsWith(path);
              return (
                <Link key={key} to={path}>
                  <Button
                    variant={isActive ? 'default' : 'ghost'}
                    size="sm"
                    className={`gap-2 ${isActive ? 'bg-teal-500 text-white hover:bg-teal-600' : 'text-slate-jordan hover:text-teal-600 hover:bg-teal-50'}`}>
                    
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{labelEn ? (isRTL ? labelAr : labelEn) : t(key)}</span>
                  </Button>
                </Link>);

            })}
          </div>

          {/* Notification bell */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen(o => !o)} className={`relative p-2 rounded-xl hover:bg-teal-50 text-teal-700 transition ${notifOpen ? 'bg-teal-50' : ''}`}>
              <Bell className="w-5 h-5" />
              {notifCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {notifCount}
                </span>
              )}
            </button>
            <AnimatePresence>
              {notifOpen && <NotifDropdown bookings={visibleBookings} messages={visibleMessages} orders={visibleOrders} isRTL={isRTL} onClose={() => setNotifOpen(false)} onDismiss={handleDismiss} position="desktop" />}
            </AnimatePresence>
          </div>

          {/* Cart button */}
          <button id="cart-target" onClick={() => setCartOpen(true)} className="relative p-2 rounded-xl hover:bg-teal-50 text-teal-700 transition">
            <motion.div animate={dock.controls} className="flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </motion.div>
            {dock.pulseKey > 0 && (
              <motion.span
                key={dock.pulseKey}
                initial={{ scale: 1, opacity: 0.6 }}
                animate={{ scale: 1.9, opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="absolute inset-0 rounded-xl border-2 border-teal-500 pointer-events-none"
              />
            )}
            {dock.releaseKey > 0 && (
              <motion.span
                key={`rel-${dock.releaseKey}`}
                initial={{ scale: 1, opacity: 0.5 }}
                animate={{ scale: 1.55, opacity: 0 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="absolute inset-0 rounded-xl border-2 border-teal-500 pointer-events-none"
              />
            )}
            {dock.particles.map((p) => (
              <motion.span
                key={p.id}
                initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-teal-500 pointer-events-none"
                style={{ marginLeft: -3, marginTop: -3, boxShadow: '0 0 6px rgba(15,124,120,0.8)' }}
              />
            ))}
            {cartCount > 0 && (
              <motion.span
                key={`dock-${cartCount}`}
                initial={{ scale: 0.6, y: badgeDir === 'up' ? 6 : -6, opacity: 0 }}
                animate={{ scale: [0.6, 1.15, 1], y: 0, opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
              >
                {cartCount}
              </motion.span>
            )}
          </button>

          {/* Settings dropdown */}
          <div className="relative" ref={settingsRef}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSettingsOpen((o) => !o)}
              className={`gap-2 border-teal-200 text-teal-700 hover:bg-teal-50 ${settingsOpen ? 'bg-teal-50' : ''}`}>
              
              <Settings className="w-4 h-4" />
              {isRTL ? 'الإعدادات' : 'Settings'}
            </Button>
            <AnimatePresence>
              {settingsOpen &&
              <SettingsPanel
                onClose={() => setSettingsOpen(false)}
                toggleLang={toggleLang}
                setLang={setLang}
                lang={lang}
                isRTL={isRTL} />

              }
            </AnimatePresence>
          </div>
        </div>
      </nav>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      {/* Mobile Floating Notification Bell */}
      <div className="md:hidden fixed top-3 right-3 z-[60]" ref={notifRef}>
        <button onClick={() => setNotifOpen(o => !o)} className={`relative p-2.5 rounded-2xl shadow-lg bg-white border border-teal-100 text-teal-700 transition ${notifOpen ? 'bg-teal-50' : ''}`}>
          <Bell className="w-5 h-5" />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {notifCount}
            </span>
          )}
        </button>
        <AnimatePresence>
          {notifOpen && <NotifDropdown bookings={visibleBookings} messages={visibleMessages} orders={visibleOrders} isRTL={isRTL} onClose={() => setNotifOpen(false)} onDismiss={handleDismiss} position="desktop" />}
        </AnimatePresence>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-white border-t border-teal-500/10 pb-safe">
        <div className="flex items-center justify-around h-16 px-2">
          {mobileNavItems.map(({ key, path, icon: Icon, labelEn, labelAr }) => {
            if (key === 'settings') {
              return (
                <React.Fragment key={key}>
                  {/* Cart button before settings */}
                  <button id="cart-target-mobile" onClick={() => setCartOpen(true)} className="flex flex-col items-center gap-0.5 relative">
                    <div className="relative p-1.5 rounded-xl text-slate-400">
                      <motion.div animate={dock.controls} className="flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5" />
                      </motion.div>
                      {dock.pulseKey > 0 && (
                        <motion.span
                          key={dock.pulseKey}
                          initial={{ scale: 1, opacity: 0.6 }}
                          animate={{ scale: 1.9, opacity: 0 }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-xl border-2 border-teal-500 pointer-events-none"
                        />
                      )}
                      {dock.releaseKey > 0 && (
                        <motion.span
                          key={`relm-${dock.releaseKey}`}
                          initial={{ scale: 1, opacity: 0.5 }}
                          animate={{ scale: 1.55, opacity: 0 }}
                          transition={{ duration: 0.5, ease: 'easeOut' }}
                          className="absolute inset-0 rounded-xl border-2 border-teal-500 pointer-events-none"
                        />
                      )}
                      {dock.particles.map((p) => (
                        <motion.span
                          key={p.id}
                          initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
                          animate={{ x: p.x, y: p.y, opacity: 0, scale: 0.2 }}
                          transition={{ duration: 0.4, ease: 'easeOut' }}
                          className="absolute left-1/2 top-1/2 w-1.5 h-1.5 rounded-full bg-teal-500 pointer-events-none"
                          style={{ marginLeft: -3, marginTop: -3, boxShadow: '0 0 6px rgba(15,124,120,0.8)' }}
                        />
                      ))}
                      {cartCount > 0 && (
                        <motion.span
                          key={`dockm-${cartCount}`}
                          initial={{ scale: 0.6, y: badgeDir === 'up' ? 6 : -6, opacity: 0 }}
                          animate={{ scale: [0.6, 1.15, 1], y: 0, opacity: 1 }}
                          transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center"
                        >
                          {cartCount}
                        </motion.span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{isRTL ? 'السلة' : 'Cart'}</span>
                  </button>
                  <button onClick={() => setSettingsOpen((o) => !o)} className="flex flex-col items-center gap-0.5 relative" ref={settingsOpen ? settingsRef : null}>
                    <div className={`p-1.5 rounded-xl transition-all ${settingsOpen ? 'bg-teal-500 text-white' : 'text-slate-400'}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] ${settingsOpen ? 'text-teal-600 font-medium' : 'text-slate-400'}`}>
                      {isRTL ? labelAr : labelEn}
                    </span>
                  </button>
                </React.Fragment>
              );
            }

            const isActive = location.pathname === path || (path !== '/' && location.pathname.startsWith(path));
            const label = labelEn ? (isRTL ? labelAr : labelEn) : t(key);
            return (
              <Link key={key} to={path} className="flex flex-col items-center gap-0.5">
                <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-teal-500 text-white' : 'text-slate-400'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`text-[10px] ${isActive ? 'text-teal-600 font-medium' : 'text-slate-400'}`}>
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
        {/* Mobile Settings Panel */}
        <AnimatePresence>
          {settingsOpen &&
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-16 left-0 right-0 bg-white border-t border-teal-100 shadow-2xl rounded-t-2xl p-3 space-y-1">
            
              <Link to={getProfilePath()} onClick={() => setSettingsOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-50">
                  <User className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium">{isRTL ? 'الملف الشخصي' : 'My Profile'}</span>
                </div>
              </Link>
              <Link to="/doctor-console" onClick={() => setSettingsOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-50">
                  <Stethoscope className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium">{isRTL ? 'إضافة طبيب' : 'Add a Doctor'}</span>
                </div>
              </Link>
              <Link to="/retailer-console" onClick={() => setSettingsOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-50">
                  <Store className="w-5 h-5 text-teal-600" />
                  <span className="text-sm font-medium">{isRTL ? 'إضافة صيدلية/متجر' : 'Add Store / Pharmacy'}</span>
                </div>
              </Link>
              <Link to="/lab-console" onClick={() => setSettingsOpen(false)}>
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-teal-50">
                  <FlaskConical className="w-5 h-5 text-violet-600" />
                  <span className="text-sm font-medium">{isRTL ? 'إضافة مختبر' : 'Add a Lab'}</span>
                </div>
              </Link>
              <div className="border-t border-teal-100 mt-1 pt-2">
                <p className="text-xs text-muted-foreground px-4 pb-1 font-medium">
                  {lang === 'ar' ? 'اللغة' : lang === 'az' ? 'Dil' : 'Language'}
                </p>
                {[
              { code: 'en', label: 'English', flag: '🇬🇧' },
              { code: 'ar', label: 'العربية', flag: '🇯🇴' },
              { code: 'az', label: 'Azərbaycan', flag: '🇦🇿' }].
              map(({ code, label, flag }) =>
              <button key={code} onClick={() => {setLang(code);setSettingsOpen(false);}}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-colors ${lang === code ? 'bg-teal-50 text-teal-700 font-semibold' : 'hover:bg-teal-50 text-foreground'}`}>
                    <span className="text-lg">{flag}</span>
                    <span className="text-sm flex-1 text-left">{label}</span>
                    {lang === code && <div className="w-2 h-2 rounded-full bg-teal-500" />}
                  </button>
              )}
              </div>
            </motion.div>
          }
        </AnimatePresence>
      </nav>
    </>);

}