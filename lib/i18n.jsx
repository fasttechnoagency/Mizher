import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    home: 'Home', doctors: 'Doctors', community: 'Community', packages: 'Medical Tourism',
    hospitals: 'Hospitals', marketplace: 'Marketplace', booking: 'Booking', search: 'Search',
    searchDoctors: 'Search doctors & specialties', searchProducts: 'Search products',
    specialty: 'Specialty', location: 'Location', price: 'Price', gender: 'Gender',
    male: 'Male', female: 'Female', all: 'All', filterBy: 'Filter by', bookNow: 'Book Now',
    compare: 'Compare', addToCart: 'Add to Cart', viewProfile: 'View Profile', about: 'About',
    specialties: 'Specialties', patientReviews: 'Patient Reviews', schedule: 'Schedule',
    message: 'Message', voiceCall: 'Voice Call', videoCall: 'Video Call', askDoctor: 'Ask a Doctor',
    doctorPosts: 'Doctor Posts', patientQuestions: 'Patient Questions', createPost: 'Create Post',
    submitQuestion: 'Submit Question', hello: 'Hello', featuredDoctors: 'Featured Doctors',
    educationalVideos: 'Educational Videos', myBookings: 'My Bookings', searchDoctor: 'Search for a Doctor',
    rateLanguage: 'Rate & Language', suggestedDoctors: 'Suggested Doctors',
    specializedPackages: 'Specialized Treatment Packages', medicalDevices: 'Medical Devices & Supplements',
    supplements: 'Supplements', devices: 'Devices', careTools: 'Care Tools',
    doctorRecommended: 'Doctor-Recommended', localProduct: 'Local Product', jod: 'JOD',
    reviews: 'reviews', experience: 'years experience', available: 'Available Today', verified: 'Verified',
    consultationFee: 'Consultation Fee', includedServices: 'Included Services', hospitalStay: 'Hospital Stay',
    hotel: 'Hotel', transportation: 'Transportation', translation: 'Translation',
    confirmBooking: 'Confirm Booking', patientDetails: 'Patient Details', selectDate: 'Select Date',
    selectTime: 'Select Time', paymentMethod: 'Payment Method', confirmAndPay: 'Confirm & Pay',
    details: 'Details', payment: 'Payment', summary: 'Summary', totalAmount: 'Total Amount',
    communityFeed: 'Community Feed', searchCommunity: 'Search community', previousAnswers: 'Previous Answers',
    topAnswered: 'Top-answered questions', categoriesForQuestion: 'Categories for question',
    typeQuestion: 'Type your question...', comment: 'Comment', share: 'Share',
    similarProducts: 'Similar Products', recommendedBy: 'Recommended by', unifiedBooking: 'Unified Booking',
    consultation: 'Consultation', date: 'Date', time: 'Time', patient: 'Patient',
    paymentOptions: 'Payment Options', jordanianWallet: 'Jordanian Wallet', network: 'Network',
    jetwallet: 'Jetwallet', profileSettings: 'Profile & Settings', logout: 'Logout',
    // Hospitals
    bookAppointment: 'Book Appointment', hospitalAdmin: 'Are you a hospital administrator?',
    registerHospital: 'Register your hospital and receive bookings directly from patients',
    registerHospitalBtn: 'Register Hospital', noHospitals: 'No hospitals available',
    searchHospital: 'Search hospitals or city...', allTypes: 'All Types', allCities: 'All Cities',
    verified2: 'Verified', featured: 'Featured',
    // Marketplace
    medicalMarketplace: 'Medical Marketplace', marketplaceDesc: 'Products from multiple pharmacies & stores — one shipment for all your items',
    cart: 'Cart', ownPharmacy: 'Own a pharmacy or medical store?', ownPharmacyDesc: 'Register and list your products — reach patients everywhere',
    allStores: 'All Stores', default: 'Default', priceLowHigh: 'Price: Low→High', priceHighLow: 'Price: High→Low',
    topRated: 'Top Rated', noProducts: 'No products match your search', productsCount: 'products',
    // Booking
    bookAppointment2: 'Book an Appointment', bookingDesc: 'Complete the steps below to confirm your visit',
    previous: 'Previous', next: 'Next', confirming: 'Confirming...', confirmPay: 'Confirm & Pay',
    stepOf: 'Step', of: 'of', doctor: 'Doctor',
    scheduleAppointment: 'Schedule Appointment', scheduleDesc: 'Select consultation type, date, and preferred time',
    consultationType: 'Consultation Type', selectDate2: 'Select Date', selectTime2: 'Select Time',
    unavailableSlots: 'Strikethrough slots are unavailable',
    yourDetails: 'Your Details', detailsDesc: 'This information will be used to confirm your appointment',
    fullName: 'Full Name', emailAddress: 'Email Address', phoneNumber: 'Phone Number',
    additionalNotes: 'Additional Notes (optional)', dataProtected: 'Your data is protected and encrypted and will not be shared with any third party',
    paymentConfirm: 'Payment & Confirm', paymentConfirmDesc: 'Review your appointment details and choose a payment method',
    appointmentConfirmed: 'Appointment Confirmed!',
    backHome: 'Back to Home', bookAnother: 'Book Another',
    // Community
    answeredBySpecialist: 'Answered by a verified specialist',
    // DoctorProfile
    backToDoctors: 'Back to Doctors', doctorNotFound: 'Doctor not found', goBack: 'Go Back',
    // Packages
    jordanDestination: 'Jordan, Your Medical Destination', worldClassCare: 'World-class care at competitive prices',
    noPackages: 'No packages available', packagesDesc: 'Complete treatment packages including accommodation, transportation and translation',
    selectOneMore: 'Select one more package to compare', readyToCompare: 'Ready to compare!', compareNow: 'Compare Now',
    // About
    aboutTitle: 'About Mizher Medical Hub', aboutSubtitle: "Jordan's first all-in-one healthcare platform",
    whoWeAre: 'Who We Are', whatWeOffer: 'What We Offer', whoIsItFor: 'Who Is It For', ourValues: 'Our Values',
    // Contact
    contactTitle: 'Contact Us', contactSubtitle: "We're here to help — reach out to us any time",
    getInTouch: 'Get in Touch', sendMessage: 'Send a Message', name: 'Name', email: 'Email', messageLbl: 'Message',
    yourName: 'Your full name', howHelp: 'How can we help you?', send: 'Send Message',
    messageSent: 'Message Sent!', messageSentDesc: "We'll get back to you soon.",
    // Profile
    myProfile: 'My Profile', manageProfile: 'Manage your info, appointments, and orders',
    myInfo: 'My Info', appointments: 'Appointments', messages: 'Messages', notifications: 'Notifications',
    paymentMethods: 'Payment Methods', orders: 'Orders',
  },
  ar: {
    home: 'الرئيسية', doctors: 'الأطباء', community: 'المجتمع', packages: 'السياحة العلاجية',
    hospitals: 'المستشفيات', marketplace: 'المتجر', booking: 'الحجز', search: 'بحث',
    searchDoctors: 'ابحث عن طبيب أو تخصص', searchProducts: 'ابحث عن منتج',
    specialty: 'التخصص', location: 'الموقع', price: 'السعر', gender: 'الجنس',
    male: 'ذكر', female: 'أنثى', all: 'الكل', filterBy: 'تصفية حسب', bookNow: 'احجز الآن',
    compare: 'مقارنة العروض', addToCart: 'أضف للسلة', viewProfile: 'عرض الملف', about: 'نبذة',
    specialties: 'تخصصات', patientReviews: 'تجارب المرضى', schedule: 'جدول المواعيد',
    message: 'رسالة', voiceCall: 'اتصال صوتي', videoCall: 'فيديو', askDoctor: 'اسأل طبيب',
    doctorPosts: 'منشورات الأطباء', patientQuestions: 'أسئلة المرضى', createPost: 'إنشاء منشور',
    submitQuestion: 'إرسال السؤال', hello: 'أهلاً', featuredDoctors: 'أطباء مقترحون',
    educationalVideos: 'فيديوهات توعوية', myBookings: 'حجوزاتي', searchDoctor: 'بحث عن طبيب',
    rateLanguage: 'تقييم اللغة', suggestedDoctors: 'أطباء مقترحون',
    specializedPackages: 'باقات السياحة العلاجية', medicalDevices: 'أجهزة طبية ومكملات',
    supplements: 'مكملات غذائية', devices: 'أجهزة طبية', careTools: 'أدوات عناية',
    doctorRecommended: 'موصى به من الأطباء', localProduct: 'منتج محلي', jod: 'دينار',
    reviews: 'تقييم', experience: 'سنوات خبرة', available: 'متاح اليوم', verified: 'موثّق',
    consultationFee: 'رسوم الاستشارة', includedServices: 'الخدمات المشمولة', hospitalStay: 'إقامة مستشفى',
    hotel: 'فندق', transportation: 'مواصلات', translation: 'ترجمة',
    confirmBooking: 'تأكيد الحجز', patientDetails: 'بيانات المريض', selectDate: 'اختر التاريخ',
    selectTime: 'اختر الوقت', paymentMethod: 'طريقة الدفع', confirmAndPay: 'تأكيد والدفع',
    details: 'التفاصيل', payment: 'الدفع', summary: 'الملخص', totalAmount: 'المبلغ الإجمالي',
    communityFeed: 'المجتمع', searchCommunity: 'ابحث في المجتمع', previousAnswers: 'إجابات سابقة',
    topAnswered: 'أسئلة تم الإجابة عليها', categoriesForQuestion: 'تصنيفات السؤال',
    typeQuestion: 'اكتب سؤالك...', comment: 'تعليق', share: 'مشاركة',
    similarProducts: 'منتجات مشابهة', recommendedBy: 'موصى به من', unifiedBooking: 'حجز موحد',
    consultation: 'استشارة', date: 'التاريخ', time: 'الوقت', patient: 'المريض',
    paymentOptions: 'خيارات الدفع', jordanianWallet: 'محفظة أردنية', network: 'نتوركس',
    jetwallet: 'جيت والت', profileSettings: 'الملف الشخصي', logout: 'تسجيل الخروج',
    // Hospitals
    bookAppointment: 'احجز موعداً', hospitalAdmin: 'هل أنت مدير مستشفى؟',
    registerHospital: 'سجّل مستشفاك واستقبل حجوزات مباشرة من المرضى',
    registerHospitalBtn: 'سجّل مستشفاك', noHospitals: 'لا توجد مستشفيات متاحة حالياً',
    searchHospital: 'ابحث عن مستشفى أو مدينة...', allTypes: 'الكل', allCities: 'كل المدن',
    verified2: 'معتمد', featured: 'مميز',
    // Marketplace
    medicalMarketplace: 'المتجر الطبي', marketplaceDesc: 'منتجات من صيدليات ومتاجر متعددة — شحن واحد لجميع طلباتك',
    cart: 'السلة', ownPharmacy: 'هل لديك صيدلية أو متجر طبي؟', ownPharmacyDesc: 'سجّل وأضف منتجاتك — أوصل للمرضى في كل مكان',
    allStores: 'كل المتاجر', default: 'الافتراضي', priceLowHigh: 'سعر: الأقل', priceHighLow: 'سعر: الأعلى',
    topRated: 'الأعلى تقييماً', noProducts: 'لا توجد منتجات تطابق بحثك', productsCount: 'منتج',
    // Booking
    bookAppointment2: 'حجز موعد', bookingDesc: 'أكمل الخطوات التالية لتأكيد موعدك',
    previous: 'السابق', next: 'التالي', confirming: 'جاري التأكيد...', confirmPay: 'تأكيد الحجز والدفع',
    stepOf: 'الخطوة', of: 'من', doctor: 'الطبيب',
    scheduleAppointment: 'اختر الموعد', scheduleDesc: 'حدد نوع الاستشارة والتاريخ والوقت المناسب',
    consultationType: 'نوع الاستشارة', selectDate2: 'اختر التاريخ', selectTime2: 'اختر الوقت',
    unavailableSlots: 'المواعيد المشطوبة غير متاحة',
    yourDetails: 'بيانات المريض', detailsDesc: 'سيتم استخدام هذه المعلومات لتأكيد موعدك',
    fullName: 'الاسم الكامل', emailAddress: 'البريد الإلكتروني', phoneNumber: 'رقم الهاتف',
    additionalNotes: 'ملاحظات إضافية (اختياري)', dataProtected: 'بياناتك محمية ومشفرة ولن تُشارك مع أي طرف ثالث',
    paymentConfirm: 'الدفع والتأكيد', paymentConfirmDesc: 'راجع تفاصيل موعدك واختر طريقة الدفع',
    appointmentConfirmed: 'تم تأكيد موعدك!',
    backHome: 'الرئيسية', bookAnother: 'حجز آخر',
    // Community
    answeredBySpecialist: 'تمت الإجابة بواسطة طبيب مختص',
    // DoctorProfile
    backToDoctors: 'العودة للأطباء', doctorNotFound: 'الطبيب غير موجود', goBack: 'العودة',
    // Packages
    jordanDestination: 'الأردن وجهتك الطبية', worldClassCare: 'رعاية عالمية المستوى بأسعار مناسبة',
    noPackages: 'لا توجد باقات حالياً', packagesDesc: 'باقات علاجية متكاملة تشمل الإقامة والمواصلات والترجمة',
    selectOneMore: 'اختر باقة أخرى للمقارنة', readyToCompare: 'جاهز للمقارنة!', compareNow: 'قارن الآن',
    // About
    aboutTitle: 'عن مزهر الطبي', aboutSubtitle: 'منصة الرعاية الصحية الشاملة الأولى في الأردن',
    whoWeAre: 'من نحن', whatWeOffer: 'ماذا نقدم', whoIsItFor: 'لمن هذه المنصة', ourValues: 'قيمنا',
    // Contact
    contactTitle: 'تواصل معنا', contactSubtitle: 'نحن هنا للمساعدة — تواصل معنا في أي وقت',
    getInTouch: 'معلومات التواصل', sendMessage: 'أرسل رسالة', name: 'الاسم', email: 'البريد الإلكتروني', messageLbl: 'الرسالة',
    yourName: 'اسمك الكامل', howHelp: 'كيف يمكننا مساعدتك؟', send: 'إرسال',
    messageSent: 'تم الإرسال!', messageSentDesc: 'سنتواصل معك قريباً.',
    // Profile
    myProfile: 'الملف الشخصي', manageProfile: 'إدارة معلوماتك ومواعيدك وطلباتك',
    myInfo: 'معلوماتي', appointments: 'المواعيد', messages: 'الرسائل', notifications: 'الإشعارات',
    paymentMethods: 'طرق الدفع', orders: 'الطلبات',
  },
  az: {
    home: 'Ana Səhifə', doctors: 'Həkimlər', community: 'İcma', packages: 'Tibbi Turizm',
    hospitals: 'Xəstəxanalar', marketplace: 'Mağaza', booking: 'Rezervasiya', search: 'Axtar',
    searchDoctors: 'Həkim və ixtisas axtar', searchProducts: 'Məhsul axtar',
    specialty: 'İxtisas', location: 'Yer', price: 'Qiymət', gender: 'Cins',
    male: 'Kişi', female: 'Qadın', all: 'Hamısı', filterBy: 'Filtrlə', bookNow: 'İndi Rezerv Et',
    compare: 'Müqayisə Et', addToCart: 'Səbətə Əlavə Et', viewProfile: 'Profili Gör', about: 'Haqqında',
    specialties: 'İxtisaslar', patientReviews: 'Xəstə Rəyləri', schedule: 'Cədvəl',
    message: 'Mesaj', voiceCall: 'Səsli Zəng', videoCall: 'Video Zəng', askDoctor: 'Həkimə Sor',
    doctorPosts: 'Həkim Paylaşımları', patientQuestions: 'Xəstə Sualları', createPost: 'Paylaşım Yarat',
    submitQuestion: 'Sual Göndər', hello: 'Salam', featuredDoctors: 'Seçilmiş Həkimlər',
    educationalVideos: 'Tədris Videoları', myBookings: 'Rezervasiyalarım', searchDoctor: 'Həkim Axtar',
    rateLanguage: 'Qiymətləndir', suggestedDoctors: 'Tövsiyə Olunan Həkimlər',
    specializedPackages: 'İxtisaslaşmış Müalicə Paketləri', medicalDevices: 'Tibbi Cihazlar və Əlavələr',
    supplements: 'Qida Əlavələri', devices: 'Cihazlar', careTools: 'Qayğı Alətləri',
    doctorRecommended: 'Həkim Tövsiyəsi', localProduct: 'Yerli Məhsul', jod: 'JOD',
    reviews: 'rəy', experience: 'il təcrübə', available: 'Bu gün mövcuddur', verified: 'Təsdiqlənmiş',
    consultationFee: 'Konsultasiya Haqqı', includedServices: 'Daxil olan Xidmətlər', hospitalStay: 'Xəstəxana İqaməti',
    hotel: 'Otel', transportation: 'Nəqliyyat', translation: 'Tərcümə',
    confirmBooking: 'Rezervasiyanı Təsdiqlə', patientDetails: 'Xəstə Məlumatları', selectDate: 'Tarix Seç',
    selectTime: 'Vaxt Seç', paymentMethod: 'Ödəniş Üsulu', confirmAndPay: 'Təsdiqlə və Ödə',
    details: 'Təfərrüatlar', payment: 'Ödəniş', summary: 'Xülasə', totalAmount: 'Ümumi Məbləğ',
    communityFeed: 'İcma Lenti', searchCommunity: 'İcmada Axtar', previousAnswers: 'Əvvəlki Cavablar',
    topAnswered: 'Ən çox cavablanan suallar', categoriesForQuestion: 'Sual Kateqoriyaları',
    typeQuestion: 'Sualınızı yazın...', comment: 'Şərh', share: 'Paylaş',
    similarProducts: 'Oxşar Məhsullar', recommendedBy: 'Tövsiyə edən', unifiedBooking: 'Vahid Rezervasiya',
    consultation: 'Konsultasiya', date: 'Tarix', time: 'Vaxt', patient: 'Xəstə',
    paymentOptions: 'Ödəniş Seçimləri', jordanianWallet: 'İordaniya Cüzdanı', network: 'Şəbəkə',
    jetwallet: 'Jetwallet', profileSettings: 'Profil və Parametrlər', logout: 'Çıxış',
    // Hospitals
    bookAppointment: 'Randevu Sifariş Et', hospitalAdmin: 'Siz xəstəxana administratorusunuz?',
    registerHospital: 'Xəstəxananızı qeydiyyatdan keçirin və xəstələrdən birbaşa rezervasiya alın',
    registerHospitalBtn: 'Xəstəxananı Qeydiyyat et', noHospitals: 'Hazırda xəstəxana mövcud deyil',
    searchHospital: 'Xəstəxana və ya şəhər axtar...', allTypes: 'Bütün Növlər', allCities: 'Bütün Şəhərlər',
    verified2: 'Təsdiqlənmiş', featured: 'Seçilmiş',
    // Marketplace
    medicalMarketplace: 'Tibbi Mağaza', marketplaceDesc: 'Bir neçə əczaxana və mağazadan məhsullar — bütün sifarişlər üçün bir çatdırılma',
    cart: 'Səbət', ownPharmacy: 'Əczaxanız və ya tibbi mağazanız var?', ownPharmacyDesc: 'Qeydiyyatdan keç və məhsullarını əlavə et — xəstələrə çat',
    allStores: 'Bütün Mağazalar', default: 'Standart', priceLowHigh: 'Qiymət: Aşağı→Yuxarı', priceHighLow: 'Qiymət: Yuxarı→Aşağı',
    topRated: 'Ən Yüksək Reytinq', noProducts: 'Axtarışınıza uyğun məhsul yoxdur', productsCount: 'məhsul',
    // Booking
    bookAppointment2: 'Randevu Sifariş Et', bookingDesc: 'Vizitinizi təsdiqləmək üçün aşağıdakı addımları tamamlayın',
    previous: 'Əvvəlki', next: 'Növbəti', confirming: 'Təsdiqlənir...', confirmPay: 'Təsdiqlə və Ödə',
    stepOf: 'Addım', of: '/', doctor: 'Həkim',
    scheduleAppointment: 'Randevu Planlaşdır', scheduleDesc: 'Konsultasiya növünü, tarixi və vaxtı seçin',
    consultationType: 'Konsultasiya Növü', selectDate2: 'Tarix Seç', selectTime2: 'Vaxt Seç',
    unavailableSlots: 'Üstü xətt çəkilmiş yuvalar mövcud deyil',
    yourDetails: 'Məlumatlarınız', detailsDesc: 'Bu məlumatlar randevunuzu təsdiqləmək üçün istifadə ediləcək',
    fullName: 'Tam Ad', emailAddress: 'E-poçt Ünvanı', phoneNumber: 'Telefon Nömrəsi',
    additionalNotes: 'Əlavə Qeydlər (isteğe bağlı)', dataProtected: 'Məlumatlarınız qorunur və şifrələnib, üçüncü tərəflərlə paylaşılmayacaq',
    paymentConfirm: 'Ödəniş və Təsdiq', paymentConfirmDesc: 'Randevu məlumatlarınızı nəzərdən keçirin və ödəniş üsulunu seçin',
    appointmentConfirmed: 'Randevu Təsdiqləndi!',
    backHome: 'Ana Səhifəyə Qayıt', bookAnother: 'Başqa Rezerv Et',
    // Community
    answeredBySpecialist: 'Mütəxəssis həkim tərəfindən cavablandırıldı',
    // DoctorProfile
    backToDoctors: 'Həkimlərə Qayıt', doctorNotFound: 'Həkim tapılmadı', goBack: 'Geri Qayıt',
    // Packages
    jordanDestination: 'Ərdən, Tibbi Mərkəziniz', worldClassCare: 'Rəqabətli qiymətlərlə dünya səviyyəli qayğı',
    noPackages: 'Hazırda paket mövcud deyil', packagesDesc: 'İqamət, nəqliyyat və tərcümə daxil olmaqla tam müalicə paketləri',
    selectOneMore: 'Müqayisə etmək üçün bir paket daha seçin', readyToCompare: 'Müqayisəyə hazır!', compareNow: 'İndi Müqayisə Et',
    // About
    aboutTitle: 'Mizher Tibb Mərkəzi Haqqında', aboutSubtitle: 'Ərdənin ilk hərtərəfli səhiyyə platforması',
    whoWeAre: 'Biz Kimik', whatWeOffer: 'Nə Təklif Edirik', whoIsItFor: 'Kimin Üçündür', ourValues: 'Dəyərlərimiz',
    // Contact
    contactTitle: 'Bizimlə Əlaqə', contactSubtitle: 'Kömək etməyə hazırıq — istənilən vaxt bizimlə əlaqə saxlayın',
    getInTouch: 'Əlaqə Məlumatları', sendMessage: 'Mesaj Göndər', name: 'Ad', email: 'E-poçt', messageLbl: 'Mesaj',
    yourName: 'Tam adınız', howHelp: 'Sizə necə kömək edə bilərik?', send: 'Mesaj Göndər',
    messageSent: 'Mesaj Göndərildi!', messageSentDesc: 'Tezliklə sizinlə əlaqə saxlayacağıq.',
    // Profile
    myProfile: 'Profilim', manageProfile: 'Məlumatlarınızı, randevularınızı və sifarişlərinizi idarə edin',
    myInfo: 'Məlumatlarım', appointments: 'Randevular', messages: 'Mesajlar', notifications: 'Bildirişlər',
    paymentMethods: 'Ödəniş Üsulları', orders: 'Sifarişlər',
  }
};

function detectDefaultLang() {
  const saved = localStorage.getItem('jmh_lang');
  if (saved && translations[saved]) return saved;
  const browserLang = (navigator.language || navigator.userLanguage || 'en').toLowerCase().split('-')[0];
  if (browserLang === 'ar') return 'ar';
  if (browserLang === 'az') return 'az';
  return 'en';
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(detectDefaultLang);

  useEffect(() => {
    localStorage.setItem('jmh_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;
  const isRTL = lang === 'ar';

  // cycle: en → ar → az → en
  const toggleLang = () => setLang(prev => prev === 'en' ? 'ar' : prev === 'ar' ? 'az' : 'en');

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRTL, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}