import type { SabinaLang } from "./sabina-brain";

export const SABINA_T: Record<
  SabinaLang,
  {
    name: string;
    sub: string;
    ph: string;
    input: string;
    hi: string;
    q: string[];
    ask: string;
    thx: string;
    hello: string;
    bye: string;
    err: string;
    lang: string;
    voiceOn: string;
    voiceOff: string;
    clear: string;
    min: string;
    mic: string;
    send: string;
    open: string;
    hear: string;
    disclaimer: string;
    listening: string;
  }
> = {
  ar: {
    name: "د. سبينة",
    sub: "طبيبتك المساعدة في مزهر الطبي · متصلة الآن",
    ph: "اكتب سؤالك… مثلاً: عندي صداع مستمر، لأي طبيب أروح؟",
    input: "رسالتك",
    hi: "أهلاً وسهلاً فيك! 🩺 أنا **سبينة**، طبيبتك المساعدة في مزهر الطبي. بساعدك تلاقي الطبيب والتخصص المناسب، وبجاوبك عن الحجز والمستشفيات والمختبرات والصيدلية والسياحة العلاجية. كيف بقدر أساعدك اليوم؟",
    q: [
      "أي طبيب يناسب حالتي؟",
      "كيف أحجز موعد؟",
      "استشارة فيديو",
      "المختبرات والتحاليل",
      "الصيدلية",
      "السياحة العلاجية",
    ],
    ask: "اسألني 💬",
    thx: "شكراً سبينة 🤍",
    hello:
      "أهلاً وسهلاً! أنا **سبينة** 🩺 طبيبتك المساعدة في مزهر الطبي. اضغط عليّ أو اسألني أي سؤال عن صحتك.",
    bye: "العفو! دمت بصحة وعافية 💙 إذا احتجتني، أنا هون بالزاوية.",
    err: "صار خلل بسيط بالاتصال، فجاوبتك من معلومات المنصة:",
    lang: "EN",
    voiceOn: "تشغيل الصوت",
    voiceOff: "كتم الصوت",
    clear: "محادثة جديدة",
    min: "تصغير",
    mic: "تحدث مع سبينة",
    send: "إرسال",
    open: "تحدث مع د. سبينة",
    hear: "🔊 اسمع صوتي",
    disclaimer: "سبينة تقدم معلومات عامة ولا تغني عن الطبيب · للطوارئ 911",
    listening: "أسمعك…",
  },
  en: {
    name: "Dr. Sabina",
    sub: "Your assistant doctor at Mizher · online",
    ph: "Ask me… e.g. I have a constant headache, which doctor?",
    input: "Your message",
    hi: "Hello and welcome! 🩺 I'm **Sabina**, your assistant doctor at Mizher Medical Hub. I'll help you find the right specialty and doctor, and answer anything about booking, hospitals, labs, the pharmacy and medical tourism. How can I help you today?",
    q: [
      "Which doctor suits me?",
      "How do I book?",
      "Video consultation",
      "Labs & tests",
      "Pharmacy",
      "Medical tourism",
    ],
    ask: "Ask me 💬",
    thx: "Thanks, Sabina 🤍",
    hello:
      "Welcome! I'm **Sabina** 🩺 your assistant doctor at Mizher. Tap me or ask me anything about your health.",
    bye: "My pleasure! Stay well 💙 I'm right here in the corner if you need me.",
    err: "There was a small connection issue, so I answered from the platform information:",
    lang: "ع",
    voiceOn: "Turn voice on",
    voiceOff: "Mute voice",
    clear: "New chat",
    min: "Minimize",
    mic: "Talk to Sabina",
    send: "Send",
    open: "Chat with Dr. Sabina",
    hear: "🔊 Hear my voice",
    disclaimer: "Sabina shares general information, not a diagnosis · Emergency 911",
    listening: "Listening…",
  },
};
