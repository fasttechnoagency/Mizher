// Sabina's built-in understanding engine: answers from Mizher's own facts when the
// live AI is unreachable (offline, rate limited, out of credits). Mirrors Olga's "Shams brain".
export type SabinaLang = "ar" | "en";

const AR_DIACRITICS = /[\u064B-\u0652\u0640]/g;
export function normalize(text: string): string {
  return String(text)
    .toLowerCase()
    .replace(AR_DIACRITICS, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\p{L}\p{N}\s']/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function detectLang(text: string, fallback: SabinaLang): SabinaLang {
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const en = (text.match(/[a-zA-Z]/g) || []).length;
  if (ar === 0 && en === 0) return fallback;
  return ar >= en ? "ar" : "en";
}

// Arabic words may carry attached prefixes (و ف ب ل ك ال); short English words must match whole.
const rx = (words: string) => {
  const alts = words
    .split("|")
    .map((w) => (/^[a-z' ]+$/i.test(w) && w.length <= 5 ? `${w}\\b` : w))
    .join("|");
  return new RegExp(`(^|\\s)(?:[وف]?[بلك]?(?:ال)?)(?:${alts})`, "i");
};

const INTENTS = {
  emergency: rx(
    "طوارئ|طواري|اسعاف|نزيف|ما بقدر اتنفس|مش قادر اتنفس|ضيق تنفس|ضيق نفس|الم في الصدر|الم بالصدر|الم صدر|وجع صدر|جلطه|سكته|اغماء|فقدان الوعي|انتحار|بدي اموت|تسمم|emergency|ambulance|chest pain|can't breathe|cant breathe|bleeding|stroke|suicid|poison|unconscious|heart attack",
  ),
  greet: rx(
    "مرحبا|مرحبتين|اهلا|اهلين|هلا|السلام|سلام عليكم|صباح|مساء|هاي|hello|hi|hey|good morning|good evening",
  ),
  who: rx(
    "مين انتي|مين انت|من انت|من انتي|شو اسمك|ما اسمك|اسمك|روبوت|بوت|ذكاء اصطناعي|انتي دكتوره|who are you|your name|are you a bot|robot|are you real",
  ),
  thanks: rx("شكرا|يسلمو|تسلمي|مشكوره|thank|thx|appreciate"),
  video: rx(
    "فيديو|اونلاين|أونلاين|عن بعد|مكالمه|استشاره صوتيه|صوتي|video|online|remote|call|telemedicine",
  ),
  doctors: rx(
    "دكتور|دكتوره|طبيب|طبيبه|دكاتره|اطباء|موعد|مواعيد|حجز|احجز|بدي احجز|استشاره|كشفيه|doctor|dr|physician|book|booking|appointment|consult",
  ),
  hospitals: rx("مستشفى|مستشفي|مستشفيات|hospital"),
  labs: rx("مختبر|مختبرات|تحليل|تحاليل|فحص دم|فحوصات|فحص|lab|labs|test|tests|blood test|analysis"),
  pharmacy: rx(
    "صيدليه|صيدليات|دواء|ادويه|علاج|منتج|منتجات|متجر|سله|فيتامين|مكملات|pharmacy|medicine|drug|product|store|shop|cart|vitamin|supplement",
  ),
  packages: rx(
    "سياحه علاجيه|سياحه|باقه|باقات|علاج في الاردن|تجميل|زراعه شعر|عمليه|package|packages|medical tourism|tourism|surgery|treatment in jordan",
  ),
  price: rx(
    "سعر|اسعار|بكم|قديش|كم سعر|تكلفه|رسوم|كشفيه|دفع|ادفع|باي بال|بطاقه|price|prices|cost|fee|fees|pay|payment|paypal|card",
  ),
  account: rx(
    "حساب|تسجيل|سجل|اسجل|دخول|ادخل|كلمه السر|كلمه المرور|نسيت|account|register|sign up|signup|login|log in|password|forgot",
  ),
  providers: rx(
    "انضم|انضمام|اضيف عيادتي|عيادتي|انا طبيب|انا دكتور|صيدليتي|مختبري|مستشفاي|شراكه|join|add my clinic|i am a doctor|i'm a doctor|provider|partner|list my",
  ),
  community: rx("مجتمع|منشور|منشورات|community|post|forum"),
  contact: rx(
    "تواصل|اتصال|اتصل|رقم|هاتف|تلفون|واتساب|واتس|ايميل|بريد|دعم|مساعده فنيه|contact|phone|whatsapp|email|support",
  ),
  insurance: rx("تامين|تأمين|insurance|insured"),
} as const;

const SPECIALTIES: Array<[RegExp, string, string]> = [
  [
    rx("قلب|خفقان|دقات|ضغط الدم|ضغط عالي|ضغط|heart|palpitation|blood pressure|hypertension"),
    "أمراض القلب",
    "Cardiology",
  ],
  [
    rx(
      "جلد|حبوب|حب الشباب|اكزيما|صدفيه|حكه|حساسيه جلد|تساقط الشعر|قشره|skin|acne|rash|eczema|psoriasis|itch|hair loss",
    ),
    "الأمراض الجلدية",
    "Dermatology",
  ],
  [
    rx("طفل|طفلي|ابني|بنتي|رضيع|اطفال|ولدي|child|baby|kid|infant|toddler|son|daughter"),
    "طب الأطفال",
    "Pediatrics",
  ],
  [rx("اسنان|سني|ضرس|لثه|تقويم|tooth|teeth|dental|gum|braces"), "طب الأسنان", "Dentistry"],
  [
    rx("حمل|حامل|الدوره|دوره شهريه|نسائيه|ولاده|اجهاض|pregnan|period|menstru|gyne|obstet"),
    "النسائية والتوليد",
    "Obstetrics & Gynecology",
  ],
  [rx("عين|عيوني|عيون|نظر|نظارات|eye|eyes|vision|sight"), "طب العيون", "Ophthalmology"],
  [
    rx(
      "ركبه|ركبتي|ظهر|ظهري|مفصل|مفاصل|عظم|عظام|كسر|رقبه|كتف|ديسك|knee|back pain|back|joint|bone|fracture|neck|shoulder|spine",
    ),
    "العظام والمفاصل",
    "Orthopedics",
  ],
  [
    rx(
      "معده|معدتي|بطن|بطني|قولون|اسهال|امساك|حموضه|غازات|استفراغ|stomach|abdomen|belly|colon|diarrh|constipation|heartburn|vomit|nausea",
    ),
    "الجهاز الهضمي",
    "Gastroenterology",
  ],
  [
    rx(
      "صداع|راسي|دوخه|دوار|شقيقه|تنميل|رجفه|اعصاب|headache|migraine|dizz|vertigo|numb|tremor|nerve",
    ),
    "الأعصاب",
    "Neurology",
  ],
  [
    rx("قلق|اكتئاب|توتر|نفسيه|نفسي|ارق|ما بنام|نوم|anxiety|depress|stress|insomnia|sleep|panic"),
    "الطب النفسي",
    "Psychiatry",
  ],
  [
    rx("سكري|السكر|غده|درقيه|هرمون|diabet|sugar|thyroid|hormone"),
    "الغدد الصماء والسكري",
    "Endocrinology & Diabetes",
  ],
  [
    rx("اذن|اذني|انف|حنجره|لوز|جيوب|بلعوم|ear|nose|throat|sinus|tonsil"),
    "الأنف والأذن والحنجرة",
    "ENT",
  ],
  [
    rx("كلى|كليه|مسالك|بول|حرقه بول|kidney|urin|bladder|prostate"),
    "المسالك البولية والكلى",
    "Urology & Nephrology",
  ],
  [rx("كحه|سعال|ربو|صفير|رئه|cough|asthma|lung|wheez"), "الأمراض الصدرية والتنفسية", "Pulmonology"],
  [
    rx("حراره|سخونه|رشح|زكام|انفلونزا|كريب|تعب عام|fever|cold|flu|fatigue"),
    "الطب العام / طب الأسرة",
    "General / Family Medicine",
  ],
];

const A = {
  ar: {
    emergency:
      "⚠️ **هذه قد تكون حالة طارئة.** اتصل فوراً بالطوارئ على **911** أو توجّه لأقرب قسم طوارئ الآن. لا تنتظر ولا تعتمد على المحادثة في هذه الحالة. أنا معك، وسلامتك أهم شي 💙",
    greet:
      "أهلاً وسهلاً فيك! 🩺 أنا **سبينة**، طبيبتك المساعدة في مزهر الطبي. احكيلي شو بتحس أو شو بتدوّر عليه، وأنا بوجّهك للطبيب أو الخدمة المناسبة.",
    who: "أنا **سبينة** 🩺 المساعدة الذكية في منصة مزهر الطبي. بساعدك تلاقي الطبيب والتخصص المناسب، وبعرّفك على المستشفيات والمختبرات والصيدلية والسياحة العلاجية. معلوماتي صحية عامة وما بتغني عن زيارة الطبيب.",
    thanks: "العفو، تسلم! 💙 أنا هون كل ما احتجتني. دمت بصحة وعافية.",
    video:
      "كثير من أطبائنا بقدموا **استشارات عن بُعد**: رسالة، مكالمة صوتية أو مكالمة فيديو 📱 افتح [صفحة الأطباء](/doctors)، اختار الطبيب، وشوف أنواع الاستشارة المتاحة ورسوم كل نوع، ثم احجز وادفع أونلاين.",
    doctors:
      "تقدر تلاقي أفضل الأطباء في الأردن من [صفحة الأطباء](/doctors) 🩺 فلتر حسب التخصص والموقع، شوف التقييمات والرسوم والخبرة، ثم اختار الموعد واحجز (عيادة، صوت، فيديو أو رسالة). حجوزاتك بتلاقيها في [حجوزاتي](/booking).",
    hospitals:
      "في [صفحة المستشفيات](/hospitals) 🏥 بتلاقي مستشفيات الأردن مع تخصصاتها وخدماتها والتأمينات المقبولة، وبتقدر تحجز مباشرة من صفحة المستشفى.",
    labs: "للتحاليل والفحوصات 🧪 زور [المختبرات](/labs) أو [الفحوصات](/tests). بعض المختبرات بتقدم **زيارة منزلية** لسحب العينات، وبتلاقي ساعات العمل والخدمات بكل صفحة مختبر.",
    pharmacy:
      "في [الصيدلية والمتجر](/marketplace) 💊 بتلاقي منتجات صحية ومكملات ومنتجات عناية، بتضيفها للسلة وبتدفع أونلاين بأمان. للأدوية والجرعات استشر طبيبك أو الصيدلاني دائماً.",
    packages:
      "باقات **السياحة العلاجية** في الأردن ✈️ بتلاقيها في [صفحة الباقات](/packages): تفاصيل العلاج، المدة، المستشفى، والسعر بالدينار، وبتقدر تحجز الباقة أونلاين.",
    price:
      "الأسعار معروضة بالدينار الأردني (د.أ) 💳 رسوم كل طبيب ظاهرة في صفحته (وبتختلف حسب نوع الاستشارة)، وأسعار المنتجات والباقات بصفحاتها. الدفع أونلاين آمن عبر **PayPal**.",
    account:
      "التسجيل مجاني 🙂 أنشئ حسابك من [صفحة التسجيل](/register) أو ادخل من [تسجيل الدخول](/login). إذا نسيت كلمة المرور، استخدم [استعادة كلمة المرور](/forgot-password).",
    providers:
      "أهلاً فيك معنا! 🤝 تقدر تنضم كمقدّم خدمة: [إضافة طبيب](/doctor-console)، [مستشفى](/hospital-console)، [مختبر](/lab-console) أو [صيدلية/متجر](/retailer-console). بعد التسجيل بتراجع الإدارة طلبك.",
    community: "في [مجتمع مزهر](/community) 💬 بتقدر تقرأ وتشارك منشورات وأسئلة صحية مع الآخرين.",
    contact:
      "فريق الدعم جاهز يساعدك 📞 هاتف وواتساب: **+962 7 9990 2083** ([راسلنا على واتساب](https://wa.me/962799902083))، والإيميل: support@mizhermedicalhub.com، أو من [صفحة التواصل](/contact).",
    insurance:
      "كثير من الأطباء والمستشفيات بيذكروا **شركات التأمين المقبولة** في صفحاتهم 🛡️ افتح صفحة الطبيب أو المستشفى من [الأطباء](/doctors) أو [المستشفيات](/hospitals) وتأكد من تأمينك.",
    specialty: (s: string) =>
      `حسب وصفك، الأنسب تبدأ مع طبيب **${s}** 🩺 تقدر تلاقي أطباء هالتخصص وتحجز موعد من [صفحة الأطباء](/doctors).\n\nإذا الأعراض شديدة أو مفاجئة، راجع الطوارئ أو اتصل **911**. معلوماتي عامة وما بتغني عن استشارة الطبيب.`,
    fallback:
      "أنا هون أساعدك بكل شي يخص صحتك ومنصة مزهر 💙 مثلاً:\n- إيجاد [طبيب](/doctors) وحجز موعد\n- [المستشفيات](/hospitals) و[المختبرات](/labs)\n- [الصيدلية](/marketplace) و[السياحة العلاجية](/packages)\nاحكيلي شو بتحس أو شو بتدوّر عليه.",
  },
  en: {
    emergency:
      "⚠️ **This may be an emergency.** Call Jordan's emergency number **911** now or go to the nearest emergency department. Please don't wait or rely on this chat. Your safety comes first 💙",
    greet:
      "Hello and welcome! 🩺 I'm **Sabina**, your assistant doctor at Mizher Medical Hub. Tell me how you feel or what you're looking for, and I'll guide you to the right doctor or service.",
    who: "I'm **Sabina** 🩺 Mizher Medical Hub's AI assistant. I help you find the right specialty and doctor, and guide you through hospitals, labs, the pharmacy and medical tourism. I share general health information — I don't replace a visit to your doctor.",
    thanks: "You're very welcome! 💙 I'm here whenever you need me. Stay well.",
    video:
      "Many of our doctors offer **remote consultations** — message, voice call or video call 📱 Open [Doctors](/doctors), choose a doctor, check the available consultation types and fees, then book and pay online.",
    doctors:
      "Find Jordan's top doctors on the [Doctors page](/doctors) 🩺 Filter by specialty and location, compare ratings, fees and experience, then pick a slot and book (clinic, voice, video or message). Your appointments live in [My bookings](/booking).",
    hospitals:
      "The [Hospitals page](/hospitals) 🏥 lists hospitals across Jordan with their specialties, services and accepted insurance — you can book directly from each hospital's page.",
    labs: "For tests 🧪 visit [Labs](/labs) or [Tests](/tests). Some labs offer **home visits** for sample collection; working hours and services are on each lab's page.",
    pharmacy:
      "The [Pharmacy & store](/marketplace) 💊 has health products, supplements and care items — add to cart and pay securely online. For medicines and doses, always check with your doctor or pharmacist.",
    packages:
      "**Medical tourism** packages in Jordan ✈️ are on the [Packages page](/packages): treatment details, duration, hospital and price in JOD — and you can book online.",
    price:
      "Prices are in Jordanian Dinar (JOD) 💳 Each doctor's fee is on their profile (it varies by consultation type), and product and package prices are on their pages. Online payment is secure via **PayPal**.",
    account:
      "Signing up is free 🙂 Create your account on [Register](/register) or sign in on [Login](/login). Forgot your password? Use [Reset password](/forgot-password).",
    providers:
      "We'd love to have you! 🤝 Join as a provider: [Add a doctor](/doctor-console), [hospital](/hospital-console), [lab](/lab-console) or [pharmacy/store](/retailer-console). Our team reviews each request.",
    community:
      "In the [Mizher community](/community) 💬 you can read and share health posts and questions.",
    contact:
      "Our support team is happy to help 📞 Phone & WhatsApp: **+962 7 9990 2083** ([message us on WhatsApp](https://wa.me/962799902083)), email: support@mizhermedicalhub.com, or the [Contact page](/contact).",
    insurance:
      "Many doctors and hospitals list their **accepted insurance** on their profiles 🛡️ Open a profile from [Doctors](/doctors) or [Hospitals](/hospitals) to check yours.",
    specialty: (s: string) =>
      `From what you describe, a **${s}** doctor is the best place to start 🩺 You can find these specialists and book on the [Doctors page](/doctors).\n\nIf symptoms are severe or sudden, go to the emergency department or call **911**. My information is general and doesn't replace a doctor's consultation.`,
    fallback:
      "I'm here to help with your health and anything on Mizher 💙 For example:\n- Finding a [doctor](/doctors) and booking\n- [Hospitals](/hospitals) and [labs](/labs)\n- The [pharmacy](/marketplace) and [medical tourism](/packages)\nTell me how you feel or what you need.",
  },
};

export type BrainIntent = keyof typeof INTENTS | "specialty" | "fallback";

export function localReply(text: string, lang: SabinaLang): { text: string; intent: BrainIntent } {
  const n = normalize(text);
  const L = A[lang];
  const has = (k: keyof typeof INTENTS) => INTENTS[k].test(n);
  if (has("emergency")) return { text: L.emergency, intent: "emergency" };
  const spec = SPECIALTIES.find(([r]) => r.test(n));
  if (spec) return { text: L.specialty(lang === "ar" ? spec[1] : spec[2]), intent: "specialty" };
  const order: Array<keyof typeof INTENTS> = [
    "who",
    "thanks",
    "video",
    "hospitals",
    "labs",
    "pharmacy",
    "packages",
    "providers",
    "price",
    "insurance",
    "account",
    "community",
    "contact",
    "doctors",
    "greet",
  ];
  for (const k of order) if (has(k)) return { text: L[k], intent: k };
  return { text: L.fallback, intent: "fallback" };
}
