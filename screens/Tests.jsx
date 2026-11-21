import React, { useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import {
  Brain, Heart, Zap, User, ChevronRight, ChevronLeft,
  CheckCircle2, ArrowLeft, AlertTriangle, Shield, Activity, Eye
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from '@/lib/router-compat';

/* ─────────────────────────────────────────────
   CLINICAL SCALES DATA
───────────────────────────────────────────── */
const TESTS = [
  /* 1. CARS – Childhood Autism Rating Scale */
  {
    key: 'cars',
    icon: Brain,
    color: 'from-blue-500 to-indigo-600',
    bg: 'bg-blue-50',
    border: 'border-blue-100',
    en: 'Childhood Autism Rating Scale (C.A.R.S)',
    ar: 'مقياس تقدير التوحد في الطفولة (C.A.R.S)',
    az: 'Uşaqlıq Otizm Reytinq Şkalası (C.A.R.S)',
    desc_en: 'A clinical tool to assess autism-related behaviors in children across 15 developmental domains.',
    desc_ar: 'أداة سريرية لتقييم سلوكيات التوحد لدى الأطفال عبر ١٥ مجالاً نمائياً.',
    desc_az: 'Uşaqlarda 15 inkişaf sahəsini əhatə edən otizmlə bağlı davranışları qiymətləndirmək üçün klinik vasitə.',
    duration_en: '15–20 min · 15 items · Rate 1–4',
    duration_ar: '١٥-٢٠ دقيقة · ١٥ بنداً · تقييم ١-٤',
    duration_az: '15–20 dəq · 15 maddə · 1–4 qiymət',
    type: 'rating',
    ratingScale: {
      en: ['1 – Normal', '2 – Mildly Abnormal', '3 – Moderately Abnormal', '4 – Severely Abnormal'],
      ar: ['١ – طبيعي', '٢ – غير طبيعي بدرجة طفيفة', '٣ – غير طبيعي بدرجة متوسطة', '٤ – غير طبيعي بدرجة شديدة'],
      az: ['1 – Normal', '2 – Yüngül dərəcədə anormal', '3 – Orta dərəcədə anormal', '4 – Şiddətli dərəcədə anormal'],
    },
    questions: [
      { en: 'Relating to People', ar: 'إقامة العلاقة مع الناس', az: 'İnsanlarla münasibət' },
      { en: 'Imitation', ar: 'القدرة على التقليد والمحاكاة', az: 'Təqlid' },
      { en: 'Emotional Response', ar: 'الاستجابة العاطفية', az: 'Emosional cavab' },
      { en: 'Body Use', ar: 'استخدام الجسم', az: 'Bədən istifadəsi' },
      { en: 'Object Use', ar: 'استخدام الأشياء', az: 'Əşyaların istifadəsi' },
      { en: 'Adaptation to Change', ar: 'التكيف والتأقلم', az: 'Dəyişikliyə uyğunlaşma' },
      { en: 'Visual Response', ar: 'الاستجابة البصرية', az: 'Vizual cavab' },
      { en: 'Listening Response', ar: 'استجابة السمع (الاستماع)', az: 'Eşitmə cavabı' },
      { en: 'Taste, Smell & Touch Response', ar: 'استجابة استخدام التذوق والشم واللمس', az: 'Dad, qoxu və toxunuş cavabı' },
      { en: 'Fear and Nervousness', ar: 'الخوف والعصبية', az: 'Qorxu və əsəbilik' },
      { en: 'Verbal Communication', ar: 'التواصل اللفظي', az: 'Şifahi ünsiyyət' },
      { en: 'Non-Verbal Communication', ar: 'التواصل غير اللفظي', az: 'Qeyri-şifahi ünsiyyət' },
      { en: 'Activity Level', ar: 'مستوى النشاط', az: 'Fəaliyyət səviyyəsi' },
      { en: 'Level and Consistency of Intellectual Response', ar: 'مستوى وثبات الاستجابات الذهنية', az: 'Zehni cavabların səviyyəsi' },
      { en: 'General Impressions', ar: 'الانطباعات العامة', az: 'Ümumi təəssüratlar' },
    ],
    scoring: (answers) => {
      const total = answers.reduce((s, a) => s + a + 1, 0);
      return { total };
    },
    getResult: (total, lang) => {
      const isAr = lang === 'ar';
      const isAz = lang === 'az';
      if (total < 30) return {
        level: isAr ? 'ليس توحداً' : isAz ? 'Otizm yoxdur' : 'No Autism',
        color: 'text-green-600',
        desc: isAr ? `المجموع: ${total} – لا تظهر مؤشرات التوحد.` : isAz ? `Cəm: ${total} – Otizm göstəriciləri yoxdur.` : `Total: ${total} – No significant autism indicators.`
      };
      if (total <= 36) return {
        level: isAr ? 'توحد بسيط' : isAz ? 'Yüngül otizm' : 'Mild Autism',
        color: 'text-amber-600',
        desc: isAr ? `المجموع: ${total} – توحد بسيط إلى متوسط.` : isAz ? `Cəm: ${total} – Yüngül otizm.` : `Total: ${total} – Mild to moderate autism.`
      };
      return {
        level: isAr ? 'توحد شديد' : isAz ? 'Şiddətli otizm' : 'Severe Autism',
        color: 'text-red-600',
        desc: isAr ? `المجموع: ${total} – توحد شديد. يُنصح بالتقييم المتخصص.` : isAz ? `Cəm: ${total} – Şiddətli otizm. Mütəxəssis qiymətləndirilməsi tövsiyə edilir.` : `Total: ${total} – Severe autism. Specialist evaluation recommended.`
      };
    }
  },

  /* 2. Social Interaction Anxiety Scale (SIAS) */
  {
    key: 'sias',
    icon: Heart,
    color: 'from-pink-500 to-rose-600',
    bg: 'bg-pink-50',
    border: 'border-pink-100',
    en: 'Social Interaction Anxiety Scale (SIAS)',
    ar: 'مقياس قلق التفاعل الاجتماعي',
    az: 'Sosial Qarşılıqlı Əlaqə Narahatlığı Şkalası (SIAS)',
    desc_en: 'Measures social interaction anxiety across 20 items using a 0–4 frequency scale.',
    desc_ar: 'يقيس قلق التفاعل الاجتماعي عبر ٢٠ بنداً باستخدام سلم تكرار من ٠ إلى ٤.',
    desc_az: '0–4 tezlik şkalası ilə 20 maddə üzərindən sosial ünsiyyət narahatlığını ölçür.',
    duration_en: '10 min · 20 items · Rate 0–4',
    duration_ar: '١٠ دقائق · ٢٠ بنداً · تقييم ٠-٤',
    duration_az: '10 dəq · 20 maddə · 0–4 qiymət',
    type: 'rating',
    ratingScale: {
      en: ['0 – Never', '1 – Rarely', '2 – Sometimes', '3 – Often', '4 – Always'],
      ar: ['٠ – أبدا', '١ – نادراً', '٢ – أحياناً', '٣ – غالباً', '٤ – دائماً'],
      az: ['0 – Heç vaxt', '1 – Nadir', '2 – Bəzən', '3 – Tez-tez', '4 – Həmişə'],
    },
    questions: [
      { en: 'I feel nervous when talking to someone in authority (teacher, boss…)', ar: 'أشعر بالعصبية عندما أتحدث مع شخص ما في موقع سلطة مدرس، رئيس العمل...', az: 'Bir müəllim, rəis... kimi səlahiyyətli biri ilə danışanda əsəbiləşirəm.' },
      { en: 'I find it difficult to maintain eye contact with others.', ar: 'أجد صعوبة في التواصل بالعينين مع الآخرين.', az: 'Başqaları ilə göz kontaktı saxlamaqda çətinlik çəkirəm.' },
      { en: 'I feel tense if I have to talk about myself or my feelings.', ar: 'أتوتر لو اضطررت للحديث عن نفسي أو مشاعري.', az: 'Özüm və ya hisslərim haqqında danışmalı olanda gərginlik hiss edirəm.' },
      { en: 'I find it difficult to mingle comfortably with those I work with.', ar: 'أجد صعوبة في الاختلاط بشكل مريح مع من أعمل معهم.', az: 'İş yoldaşlarımla rahat ünsiyyət qurmaqda çətinlik çəkirəm.' },
      { en: 'I find it easy to make friends of the same age.', ar: 'أجد سهولة في اكتساب صداقات من هم في نفس عمري.', az: 'Yaşıdlarımla dostluq qurmaq asandır.' },
      { en: 'I feel tense when I meet someone I know on the street.', ar: 'أتوتر عندما أقابل أحد معارفي في الطريق.', az: 'Yolda tanışlarımla qarşılaşdığımda gərgin hiss edirəm.' },
      { en: 'I feel uncomfortable when I mix socially with people I don\'t know well.', ar: 'أشعر بعدم الراحة عندما أختلط اجتماعياً مع آخرين لا أعرفهم بشكل جيد.', az: 'Yaxından tanımadığım insanlarla sosial ünsiyyətdə narahat hiss edirəm.' },
      { en: 'I feel tense when I found myself alone with another person.', ar: 'أتوتر لو وجدت نفسي وحيداً مع شخص آخر.', az: 'Başqa biri ilə tək qaldığımda gərgin hiss edirəm.' },
      { en: 'It is easy for me to get to know other people at parties and similar events.', ar: 'من السهل علي التعرف على آخرين في حفلات وغيرها.', az: 'Partiyalarda başqaları ilə tanış olmaq mənim üçün asandır.' },
      { en: 'I find it difficult to talk with others.', ar: 'أجد صعوبة في التحدث مع الآخرين.', az: 'Başqaları ilə danışmaqda çətinlik çəkirəm.' },
      { en: 'It is easy for me to think of things to talk about.', ar: 'يسهل علي التفكير في أشياء للتحدث عنها.', az: 'Danışacaq mövzu tapmaq mənim üçün asandır.' },
      { en: 'I get worried about how I appear to others.', ar: 'أنزعج حول ظهوري بمظهر الأخرق عند تعبيري عن نفسي.', az: 'Özümü ifadə edərkən necə göründüyüm barədə naraham.' },
      { en: 'It is difficult for me to disagree with others\' viewpoints.', ar: 'يصعب علي الاختلاف مع وجهات نظر الآخرين.', az: 'Başqalarının fikirlərinə qarşı çıxmaq çətin gəlir.' },
      { en: 'It is difficult for me to talk to an attractive person of the other sex.', ar: 'يصعب علي الحديث مع شخص جذاب من الجنس الآخر.', az: 'Qarşı cinsdən cəlbedici biri ilə danışmaq çətin olur.' },
      { en: 'I feel upset when I don\'t find what to say in social situations.', ar: 'أنزعج عندما لا أجد ما أقوله في المواقف الاجتماعية.', az: 'Sosial situasiyalarda söyləyəcəyim söz tapmasam, narahat oluram.' },
      { en: 'I feel nervous when mixing with people I don\'t know well.', ar: 'أشعر بالعصبية عندما أختلط مع آخرين لا أعرفهم بشكل جيد.', az: 'Yaxından tanımadığım insanlarla ünsiyyətdə əsəbiləşirəm.' },
      { en: 'When talking to someone, I feel that what I say will embarrass me.', ar: 'عندما أتحدث أشعر أنني سيصدر عني كلام يحرجني.', az: 'Danışarkən xəcalətli söz deyəcəyim hissini yaşayıram.' },
      { en: 'I feel tense when I am with a group that ignores me.', ar: 'أنزعج عندما أتواجد مع مجموعة تتجاهلني.', az: 'Məni diqqətə almayan bir qrupda olduğumda gərgin hiss edirəm.' },
      { en: 'I feel anxious when mixing with others.', ar: 'أتوتر عند الاختلاط مع الآخرين.', az: 'Başqaları ilə ünsiyyətdə narahlıq hiss edirəm.' },
      { en: 'I am not sure what to say if I meet someone I only slightly know.', ar: 'أنا غير متأكد مما إذا كنت سألقي التحية على شخص اعرفه معرفة سطحية.', az: 'Səthi tanıdığım biri ilə qarşılaşsam nə deyəcəyimi bilmirəm.' },
    ],
    scoring: (answers) => ({ total: answers.reduce((s, a) => s + a, 0) }),
    getResult: (total, lang) => {
      const isAr = lang === 'ar'; const isAz = lang === 'az';
      if (total <= 20) return { level: isAr ? 'قلق بسيط' : isAz ? 'Yüngül narahlıq' : 'Mild Anxiety', color: 'text-green-600', desc: isAr ? `المجموع: ${total} – قلق بسيط من التفاعل الاجتماعي.` : isAz ? `Cəm: ${total} – Yüngül sosial narahlıq.` : `Total: ${total} – Mild social interaction anxiety.` };
      if (total <= 40) return { level: isAr ? 'قلق معتدل' : isAz ? 'Orta narahlıq' : 'Moderate Anxiety', color: 'text-amber-600', desc: isAr ? `المجموع: ${total} – قلق معتدل.` : isAz ? `Cəm: ${total} – Orta dərəcəli narahlıq.` : `Total: ${total} – Moderate anxiety.` };
      if (total <= 60) return { level: isAr ? 'قلق متوسط' : isAz ? 'Orta-şiddətli' : 'Moderate-Severe Anxiety', color: 'text-orange-600', desc: isAr ? `المجموع: ${total} – قلق متوسط-شديد.` : isAz ? `Cəm: ${total} – Orta-şiddətli narahlıq.` : `Total: ${total} – Moderate-to-severe anxiety.` };
      if (total <= 80) return { level: isAr ? 'قلق شديد' : isAz ? 'Şiddətli narahlıq' : 'Severe Anxiety', color: 'text-red-600', desc: isAr ? `المجموع: ${total} – قلق شديد من التفاعل.` : isAz ? `Cəm: ${total} – Şiddətli narahlıq.` : `Total: ${total} – Severe social anxiety.` };
      return { level: isAr ? 'قلق شديد جداً' : isAz ? 'Çox şiddətli' : 'Very Severe Anxiety', color: 'text-red-800', desc: isAr ? `المجموع: ${total} – قلق شديد جداً. يُنصح بالاستشارة المتخصصة.` : isAz ? `Cəm: ${total} – Çox şiddətli. Mütəxəssis məsləhəti tövsiyə edilir.` : `Total: ${total} – Very severe. Specialist consultation recommended.` };
    }
  },

  /* 4. SWAN ADHD Rating Scale */
  {
    key: 'swan',
    icon: Zap,
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50',
    border: 'border-amber-100',
    en: 'SWAN ADHD Rating Scale',
    ar: 'مقياس (سوان) لتقدير اضطراب تشتت الانتباه والنشاط الزائد',
    az: 'SWAN DIDB Reytinq Şkalası',
    desc_en: 'Rates child behavior across 18 items to screen for ADHD (Inattentive, Hyperactive, or Combined type).',
    desc_ar: 'يقيّم سلوك الطفل عبر ١٨ بنداً للكشف عن اضطراب تشتت الانتباه (نوع الإهمال، الاندفاعي، أو المركب).',
    desc_az: '18 maddə üzrə uşaq davranışını DIDB (Diqqətsiz, Hiperaktiv, Kombinə) üçün qiymətləndirir.',
    duration_en: '10 min · 18 items · 4 options',
    duration_ar: '١٠ دقائق · ١٨ بنداً · ٤ خيارات',
    duration_az: '10 dəq · 18 maddə · 4 seçim',
    type: 'rating',
    ratingScale: {
      en: ['Not at all', 'Just a little', 'Quite a bit', 'Very much'],
      ar: ['لا ينطبق', 'نادراً', 'أحياناً', 'غالباً'],
      az: ['Heç vaxt', 'Çox az', 'Bir qədər', 'Çox'],
    },
    questions: [
      { en: 'Gives close attention to detail and avoids careless mistakes.', ar: 'يعطي اهتماماً كبيراً بالتفاصيل ويتجنب الأخطاء الصادرة عن إهمال.', az: 'Detallara diqqət yetirır, laqeyd səhvlərdən qaçır.' },
      { en: 'Sustains attention on tasks or play activities.', ar: 'المحافظة على انتباهه أثناء قيامه في مهامه ونشاطاته.', az: 'Tapşırıq və oyun zamanı diqqətini saxlayır.' },
      { en: 'Listens when spoken to directly.', ar: 'يستمع عند التحدث إليه مباشرة.', az: 'Birbaşa danışıldığında dinləyir.' },
      { en: 'Follows through on instructions and finishes schoolwork and chores.', ar: 'يتبع التعليمات وينهي المهام الموكلة إليه.', az: 'Təlimatlara uyur, ev tapşırıqlarını bitirir.' },
      { en: 'Organizes tasks and activities.', ar: 'ينظم أنشطته ومهامه.', az: 'Tapşırıq və fəaliyyətlərini təşkil edir.' },
      { en: 'Engages in tasks that require sustained mental effort.', ar: 'يشارك في المهام التي تتطلب جهداً عقلياً مستمراً.', az: 'Davamlı zehni səy tələb edən tapşırıqlara qatılır.' },
      { en: 'Keeps track of things necessary for activities (doesn\'t lose them).', ar: 'يتتبع الأشياء الضرورية للأنشطة (لا يفقد شيئاً منها).', az: 'Fəaliyyət üçün lazımı şeyləri izləyir (itirmir).' },
      { en: 'Ignores extraneous stimuli.', ar: 'يتجنب المثيرات المشتتة.', az: 'Xarici stimulları diqqətə almır.' },
      { en: 'Remembers daily activities.', ar: 'يتذكر الأنشطة اليومية.', az: 'Gündəlik fəaliyyətlərini xatırlayır.' },
      { en: 'Sits still (controls movement of hands or feet or controls squirming).', ar: 'يتحكم بجلسته ويراعي آداب الجلوس.', az: 'Sakitcə oturur, əl-ayaq hərəkətlərini idarə edir.' },
      { en: 'Stays seated (when required by class rules or social conventions).', ar: 'يبقى جالساً (عندما تتطلب ذلك قواعد الصف أو التقاليد الاجتماعية).', az: 'Oturaqda qalır (sinif qaydaları bunu tələb etdikdə).' },
      { en: 'Modulates motor activity (inhibits inappropriate running or climbing).', ar: 'يتحكم بنشاطه الحركي (مثل عدم الركض أو التسلق في موقف غير مناسب).', az: 'Motor fəaliyyətini tənzimləyir (uyğunsuz qaçış/dırmaşmanın qarşısını alır).' },
      { en: 'Plays quietly (keeps noise level reasonable).', ar: 'يلعب بهدوء (يبقي مستوى الضجيج معقولاً).', az: 'Sakit oynayır (səs-küyü məqbul saxlayır).' },
      { en: 'Settles down and rests (controls constant activity).', ar: 'يأخذ قسطاً من الراحة بعد نشاط ما.', az: 'Daim fəaliyyəti idarə edərək istirahət edir.' },
      { en: 'Modulates verbal activity (controls excessive talking).', ar: 'ينظم النشاط اللفظي (يتحكم بعدم الحديث المفرط).', az: 'Şifahi fəaliyyəti tənzimləyir (həddindən artıq danışmağı idarə edir).' },
      { en: 'Reflects on questions (controls blurting out answers).', ar: 'يفكر قبل الإجابة عن الأسئلة وليس اندفاعياً بلا تفكير.', az: 'Suallar üzərində düşünür (cavabları düşüncəsiz söyləməkdən çəkinir).' },
      { en: 'Awaits turn (stands in line and takes turns).', ar: 'يلتزم بدوره في الطابور.', az: 'Növbəsini gözləyir.' },
      { en: 'Enters into conversation and games without interrupting or intruding.', ar: 'يشارك الآخرين في ألعابهم دون إزعاج أو مقاطعة لهم.', az: 'Söhbət və oyunlara kəsmədən qoşulur.' },
    ],
    scoring: (answers) => {
      // 1-9 inattentive, 10-18 hyperactive (0-indexed: 0-8, 9-17)
      const inattentive = answers.slice(0, 9).filter(a => a <= 1).length; // not at all / just a little = 1
      const hyperactive = answers.slice(9, 18).filter(a => a <= 1).length;
      return { inattentive, hyperactive };
    },
    getResult: (scores, lang) => {
      const isAr = lang === 'ar'; const isAz = lang === 'az';
      const { inattentive, hyperactive } = scores;
      let level = '', desc = '', color = 'text-green-600';
      if (inattentive >= 6 && hyperactive >= 6) {
        level = isAr ? 'ADHD مركب' : isAz ? 'DIDB - Kombinə' : 'ADHD - Combined Type';
        color = 'text-red-600';
        desc = isAr ? 'نتائج تشير إلى النوع المركب من ADHD. يُنصح بتقييم الصحة العقلية.' : isAz ? 'Kombinə tip DIDB ehtimalı. Qiymətləndirmə tövsiyə edilir.' : 'Results suggest Combined ADHD. Mental health evaluation recommended.';
      } else if (inattentive >= 6) {
        level = isAr ? 'ADHD – تشتت الانتباه' : isAz ? 'DIDB – Diqqətsizlik' : 'ADHD – Inattentive Type';
        color = 'text-amber-600';
        desc = isAr ? 'نتائج تشير إلى تشتت الانتباه.' : isAz ? 'Diqqətsizlik tipi DIDB ehtimalı.' : 'Results suggest inattentive ADHD.';
      } else if (hyperactive >= 6) {
        level = isAr ? 'ADHD – نشاط زائد واندفاعية' : isAz ? 'DIDB – Hiperaktivlik' : 'ADHD – Hyperactive/Impulsive Type';
        color = 'text-amber-600';
        desc = isAr ? 'نتائج تشير إلى النشاط الزائد والسلوك الاندفاعي.' : isAz ? 'Hiperaktivlik/impulsivlik tipi DIDB ehtimalı.' : 'Results suggest hyperactive/impulsive ADHD.';
      } else {
        level = isAr ? 'لا مؤشرات واضحة' : isAz ? 'Aydın göstərici yoxdur' : 'No Clear ADHD Indicators';
        desc = isAr ? `تشتت الانتباه: ${inattentive}/9، الاندفاعية: ${hyperactive}/9 – لا يبدو أن الطفل لديه ADHD.` : isAz ? `Diqqətsizlik: ${inattentive}/9, Hiperaktivlik: ${hyperactive}/9 – DIDB göstəricisi yoxdur.` : `Inattentive: ${inattentive}/9, Hyperactive: ${hyperactive}/9 – Child likely does not have ADHD.`;
      }
      return { level, color, desc };
    }
  },

  /* 5. Yale-Brown OCD Scale (Y-BOCS) */
  {
    key: 'ybocs',
    icon: Shield,
    color: 'from-teal-500 to-cyan-600',
    bg: 'bg-teal-50',
    border: 'border-teal-100',
    en: 'Yale-Brown OCD Scale (Y-BOCS)',
    ar: 'مقياس ييل – براون للوسواس القهري',
    az: 'Yale-Brown Obsesif-Kompulsif Şkala (Y-BOCS)',
    desc_en: '10-item scale measuring the severity of obsessive thoughts and compulsive behaviors.',
    desc_ar: 'مقياس من ١٠ بنود يقيّم شدة الأفكار الوسواسية والأفعال القهرية.',
    desc_az: '10 maddəlik obsesif düşüncə və kompulsif davranışların şiddətini ölçən şkala.',
    duration_en: '10 min · 10 items · Rate 0–4',
    duration_ar: '١٠ دقائق · ١٠ بنود · تقييم ٠-٤',
    duration_az: '10 dəq · 10 maddə · 0–4 qiymət',
    type: 'rating',
    ratingScale: {
      en: ['0 – None', '1 – Mild', '2 – Moderate', '3 – Severe', '4 – Extreme'],
      ar: ['٠ – لا شيء', '١ – خفيف', '٢ – متوسط', '٣ – شديد', '٤ – بالغ'],
      az: ['0 – Yoxdur', '1 – Yüngül', '2 – Orta', '3 – Şiddətli', '4 – Ekstremal'],
    },
    questions: [
      { en: 'Time occupied by obsessive thoughts (per day)', ar: 'مقدار الوقت الذي تستغرقه الأفكار الوسواسية', az: 'Obsesif düşüncələrə sərf olunan vaxt' },
      { en: 'Interference with daily functioning from obsessions', ar: 'مقدار التعارض الذي تحدثه الأفكار الوسواسية مع نشاطاتك الإجتماعية والعملية', az: 'Obsesyonların gündəlik funksiyaya təsiri' },
      { en: 'Distress associated with obsessive thoughts', ar: 'مقدار التوتر والقلق المصاحب للأفكار الوسواسية', az: 'Obsesif düşüncələrlə əlaqəli stress' },
      { en: 'Resistance against obsessions', ar: 'مقدار الجهد المبذول في مقاومة الأفكار الوسواسية (بغض النظر عن نجاحك في المقاومة)', az: 'Obsesyonlara qarşı müqavimət' },
      { en: 'Control over obsessive thoughts', ar: 'مقدار سيطرتك على الأفكار الوسواسية', az: 'Obsesif düşüncələr üzərində nəzarət' },
      { en: 'Time spent performing compulsive behaviors (per day)', ar: 'مقدار الوقت الذي تمضيه في القيام بالأفعال القهرية', az: 'Kompulsif davranışlara sərf olunan vaxt' },
      { en: 'Interference from compulsions with daily activities', ar: 'مقدار التعارض الذي تحدثه الأفعال القهرية في نشاطاتك الإجتماعية والعملية', az: 'Kompulsiyaların gündəlik fəaliyyətə müdaxiləsi' },
      { en: 'Distress if compulsions were prevented', ar: 'مقدار التوتر والقلق الناتج عن الامتناع عن القيام بالأفعال القهرية', az: 'Kompulsiyalar dayandırılsaydı hiss olunan stress' },
      { en: 'Resistance against compulsions', ar: 'مقدار الجهد المبذول في مقاومة الأفعال القهرية (بغض النظر عن نجاحك في المقاومة)', az: 'Kompulsiyalara qarşı müqavimət' },
      { en: 'Control over compulsive behaviors', ar: 'مقدار سيطرتك على الأفعال القهرية', az: 'Kompulsiv davranışlar üzərində nəzarət' },
    ],
    scoring: (answers) => ({ total: answers.reduce((s, a) => s + a, 0) }),
    getResult: (total, lang) => {
      const isAr = lang === 'ar'; const isAz = lang === 'az';
      if (total <= 7) return { level: isAr ? 'خفيف جداً' : isAz ? 'Çox yüngül' : 'Subclinical', color: 'text-green-600', desc: isAr ? `المجموع: ${total} – وساوس خفيفة جداً.` : isAz ? `Cəm: ${total} – Çox yüngül.` : `Total: ${total} – Subclinical OCD symptoms.` };
      if (total <= 15) return { level: isAr ? 'خفيف' : isAz ? 'Yüngül' : 'Mild', color: 'text-amber-500', desc: isAr ? `المجموع: ${total} – وسواس خفيف.` : isAz ? `Cəm: ${total} – Yüngül.` : `Total: ${total} – Mild OCD.` };
      if (total <= 23) return { level: isAr ? 'متوسط' : isAz ? 'Orta' : 'Moderate', color: 'text-amber-600', desc: isAr ? `المجموع: ${total} – وسواس متوسط، يُنصح بالمتابعة.` : isAz ? `Cəm: ${total} – Orta dərəcəli. Müşahidə tövsiyə edilir.` : `Total: ${total} – Moderate OCD. Follow-up recommended.` };
      if (total <= 31) return { level: isAr ? 'ملحوظ' : isAz ? 'Nəzərəçarpan' : 'Marked', color: 'text-orange-600', desc: isAr ? `المجموع: ${total} – وسواس ملحوظ.` : isAz ? `Cəm: ${total} – Nəzərəçarpan OKB.` : `Total: ${total} – Marked OCD.` };
      return { level: isAr ? 'شديد' : isAz ? 'Şiddətli' : 'Severe', color: 'text-red-600', desc: isAr ? `المجموع: ${total} – وسواس شديد. يُنصح بالعلاج المتخصص.` : isAz ? `Cəm: ${total} – Şiddətli OKB. Mütəxəssis müalicəsi tövsiyə edilir.` : `Total: ${total} – Severe OCD. Specialist treatment recommended.` };
    }
  },

  /* 6. Beck Depression Inventory (BDI) */
  {
    key: 'bdi',
    icon: Heart,
    color: 'from-indigo-500 to-blue-600',
    bg: 'bg-indigo-50',
    border: 'border-indigo-100',
    en: 'Beck Depression Inventory (BDI)',
    ar: 'مقياس بيك للاكتئاب',
    az: 'Beck Depressiya İnventarı (BDI)',
    desc_en: '21-item self-report scale for measuring depression severity across emotional, cognitive, and physical symptoms.',
    desc_ar: 'مقياس ذاتي من ٢١ بنداً لقياس شدة الاكتئاب عبر الأعراض العاطفية والمعرفية والجسدية.',
    desc_az: '21 maddəlik özünüqiymətləndirmə şkalası — emosional, koqnitiv və fiziki əlamətlər üzrə depressiyanın şiddətini ölçür.',
    duration_en: '10 min · 21 items · Choose 0–3',
    duration_ar: '١٠ دقائق · ٢١ بنداً · اختر ٠-٣',
    duration_az: '10 dəq · 21 maddə · 0–3 seçin',
    type: 'multichoice',
    questions: [
      { en: 'Sadness', ar: 'الحزن', az: 'Kədər', options_en: ['I do not feel sad.', 'I feel sad.', 'I am sad all the time and cannot snap out of it.', 'I am so sad or unhappy that I cannot stand it.'], options_ar: ['لا أشعر بالحزن.', 'أشعر بالحزن.', 'أشعر بالحزن طوال الوقت، ولا أستطيع أن أتخلص منه.', 'أناني حزين بدرجة لا أستطيع تحملها.'], options_az: ['Kədər hiss etmirəm.', 'Kədər hiss edirəm.', 'Həmişə kədərliyəm.', 'O qədər kədərliyəm ki, dözə bilmirəm.'] },
      { en: 'Pessimism', ar: 'التشاؤم', az: 'Pessimizm', options_en: ['I am not particularly discouraged about the future.', 'I feel discouraged about the future.', 'I feel I have nothing to look forward to.', 'I feel the future is hopeless and that things cannot improve.'], options_ar: ['لست متشائماً بالنسبة للمستقبل.', 'أشعر بتشاؤم بالنسبة للمستقبل.', 'أشعر بأنه ليس هناك شيء يشدني للمستقبل.', 'أشعر بأن المستقبل لا أمل فيه وأن الأمور لن تتحسن.'], options_az: ['Gələcək haqqında ümidsiz deyiləm.', 'Gələcəyə ümidsiz baxıram.', 'Gözləyəcəyim bir şey yoxdur.', 'Gələcək ümidsizdir.'] },
      { en: 'Past Failures', ar: 'الشعور بالفشل', az: 'Keçmiş Uğursuzluqlar', options_en: ['I do not feel like a failure.', 'I feel I have failed more than the average person.', 'As I look back, I see many failures.', 'I feel I am a total failure as a person.'], options_ar: ['لا أشعر بأني فاشل.', 'أشعر أنني فشلت أكثر من المعتاد.', 'عندما أنظر إلى ما مضى من سنوات عمري فأنا لا أرى سوى الفشل الذريع.', 'أشعر بأنني شخص فاشل تماماً.'], options_az: ['Özümü başarısız hiss etmirəm.', 'Ortalamaadan daha çox uğursuzluq hiss edirəm.', 'Geriyə baxdığımda çox uğursuzluq görürəm.', 'Tam bir uğursuzam.'] },
      { en: 'Loss of Pleasure', ar: 'فقدان المتعة', az: 'Zövq İtkisi', options_en: ['I get as much satisfaction out of things as I used to.', 'I don\'t enjoy things the way I used to.', 'I don\'t get real satisfaction out of anything anymore.', 'I am dissatisfied or bored with everything.'], options_ar: ['أستمتع بدرجة كافية بعوامل الحياة كما اعتدت من قبل.', 'لا أستمتع بعوامل الحياة على النحو الذي تيودت عليه.', 'لم أعد أحصل على استمتاع حقيقي في أي شيء في الحياة.', 'لا أستمتع إطلاقاً بأي شيء في الحياة.'], options_az: ['Hər şeydən əvvəlki kimi zövq alıram.', 'Hər şeydən əvvəlki kimi zövq almıram.', 'Artıq heç nədən zövq almıram.', 'Hər şeydən bezginəm.'] },
      { en: 'Guilty Feelings', ar: 'الذنب', az: 'Günah Hissi', options_en: ['I don\'t feel particularly guilty.', 'I feel guilty a good part of the time.', 'I feel quite guilty most of the time.', 'I feel guilty all of the time.'], options_ar: ['لا أشعر باللوم.', 'أشعر بأني قد أكون ملوماً.', 'أشعر بشعور عميق باللوم في أغلب الأوقات.', 'أشعر باللوم بصفة عامة.'], options_az: ['Özümü günahkar hiss etmirəm.', 'Bəzən günahkar hiss edirəm.', 'Çox vaxt günahkar hiss edirəm.', 'Həmişə günahkar hiss edirəm.'] },
      { en: 'Punishment Feelings', ar: 'الشعور بالعقاب', az: 'Cəza Hissi', options_en: ['I don\'t feel I am being punished.', 'I feel I may be punished.', 'I expect to be punished.', 'I feel I am being punished.'], options_ar: ['لا أشعر بأني أتلقى عقاباً.', 'أشعر بأني قد أتعرض للعقاب.', 'أتوقع أن أعاقب.', 'أشعر بأني أتلقى عقاباً.'], options_az: ['Cəzalandırıldığımı hiss etmirəm.', 'Bəlkə cəzalandırıla bilərəm.', 'Cəzalandırılmağı gözləyirəm.', 'Cəzalandırıldığımı hiss edirəm.'] },
      { en: 'Self-Dislike', ar: 'كراهية الذات', az: 'Özündən Nifrət', options_en: ['I don\'t feel disappointed in myself.', 'I am disappointed in myself.', 'I am disgusted with myself.', 'I hate myself.'], options_ar: ['لا أشعر بعدم الرضا عن نفسي.', 'أنا غير راضٍ عن نفسي.', 'أنا ممتعض من نفسي.', 'أكره نفسي.'], options_az: ['Özümdən narazı deyiləm.', 'Özümdən narazıyam.', 'Özümdən iyrənirəm.', 'Özümdən nifrət edirəm.'] },
      { en: 'Self-Criticalness', ar: 'نقد الذات', az: 'Özünü Tənqid', options_en: ['I don\'t feel I am any worse than anybody else.', 'I am critical of myself for my weaknesses.', 'I blame myself all the time for my faults.', 'I blame myself for everything bad that happens.'], options_ar: ['لا أشعر بأني أسوأ من الآخرين.', 'أنقد نفسي بسبب ضعفي وأخطائي.', 'ألوم نفسي معظم الوقت على أخطائي.', 'ألوم نفسي على كل شيء سيء يحدث.'], options_az: ['Özümü başqalarından daha pis hiss etmirəm.', 'Zəifliyimə görə özümü tənqid edirəm.', 'Əksər vaxt öz səhvlərimə görə özümü qınayıram.', 'Olan hər pis şeyə görə özümü günahlandırıram.'] },
      { en: 'Suicidal Thoughts', ar: 'أفكار الانتحار', az: 'İntihar Düşüncələri', options_en: ['I don\'t have any thoughts of killing myself.', 'I have thoughts of killing myself, but I would not carry them out.', 'I would like to kill myself.', 'I would kill myself if I had the opportunity.'], options_ar: ['أشعر بضيق من الحياة.', 'ليس لي رغبة في الحياة.', 'أصبحت أكره الحياة.', 'أتمنى الموت إذا وجدت فرصة لذلك.'], options_az: ['İntihar haqqında düşüncəm yoxdur.', 'Özümü öldürmək haqqında düşüncəm var, amma həyata keçirməzdim.', 'Özümü öldürmək istəyirəm.', 'Fürsət olsaydı özümü öldürərdim.'] },
      { en: 'Crying', ar: 'البكاء', az: 'Ağlama', options_en: ['I don\'t cry anymore than usual.', 'I cry more than I used to.', 'I cry all the time now.', 'I used to be able to cry, but now I can\'t even though I want to.'], options_ar: ['لا أبكي أكثر من المعتاد.', 'أبكي الآن أكثر من ذي قبل.', 'أبكي طوال الوقت.', 'لقد كنت قادراً على البكاء فيما مضى ولكني الآن لا أستطيع البكاء حتى لو كانت لي رغبة في ذلك.'], options_az: ['Həmişəkindən çox ağlamıram.', 'Əvvəlkindən çox ağlayıram.', 'İndi həmişə ağlayıram.', 'Ağlamaq istəsəm belə artıq ağlaya bilmirəm.'] },
      { en: 'Agitation', ar: 'التوتر', az: 'Həyəcan', options_en: ['I am no more irritated by things than I ever was.', 'I am slightly more irritated now than usual.', 'I am quite annoyed or irritated a good deal of the time.', 'I feel irritated all the time now.'], options_ar: ['لست متوتراً أكثر من ذي قبل.', 'أتضايق أو أتوتر بسرعة أكثر من ذي قبل.', 'أشعر بالتوتر كل الوقت.', 'لا أتوتر أبداً من الأشياء التي كانت توترني فيما مضى.'], options_az: ['Həmişəkindən az qıcıqlanmıram.', 'Həmişəkindən biraz çox qıcıqlanıram.', 'Çox vaxt qıcıqlanıram.', 'Həmişə qıcıqlanıram.'] },
      { en: 'Loss of Interest', ar: 'فقدان الاهتمام', az: 'Maraq İtkisi', options_en: ['I have not lost interest in other people.', 'I am less interested in other people than I used to be.', 'I have lost most of my interest in other people.', 'I have lost all of my interest in other people.'], options_ar: ['لم أفقد الاهتمام بالناس الآخرين.', 'إني أقل اهتماماً بالآخرين مما اعتدت أن أكون.', 'لقد فقدت معظم اهتمامي بالناس الآخرين.', 'لقد فقدت كل اهتمامي بالناس الآخرين.'], options_az: ['Başqalarına marağımı itirməmişəm.', 'Başqalarına marağım azalıb.', 'Başqalarına marağımın əksəriyyətini itirmişəm.', 'Başqalarına marağımı tamamilə itirmişəm.'] },
      { en: 'Indecisiveness', ar: 'اتخاذ القرارات', az: 'Qərar Vermə Çətinliyi', options_en: ['I make decisions about as well as I ever could.', 'I put off making decisions more than I used to.', 'I have greater difficulty in making decisions now than I used to.', 'I can\'t make decisions at all anymore.'], options_ar: ['اتخذ قرارات على نفس المستوى الذي اعتدت عليه.', 'لقد توقفت عن اتخاذ القرارات بصورة أكبر مما مضى.', 'أجد صعوبة أكبر في اتخاذ القرارات عما كنت أقوم به.', 'لم أعد أستطيع اتخاذ القرارات على الإطلاق.'], options_az: ['Qərar qəbul etmədə problem yoxdur.', 'Qərarları əvvəlkindən daha çox gecikdirirəm.', 'Qərar qəbul etmək getdikcə çətinləşir.', 'Artıq qərar qəbul edə bilmirəm.'] },
      { en: 'Worthlessness', ar: 'الشعور بانعدام القيمة', az: 'Dəyərsizlik Hissi', options_en: ['I do not feel that I look worse than I used to.', 'I am worried that I am looking old or unattractive.', 'I feel that there are permanent changes in my appearance and they make me look unattractive.', 'I believe that I look ugly.'], options_ar: ['لا أشعر أني أبدو في حالة أسوأ عما اعتدت أن أكون.', 'يقلقني أن أبدو أكبر سناً وأقل حيوية.', 'أشعر بأن هناك تغيرات مستديمة في مظهري تجعلني أبدو أقل حيوية.', 'أعتقد أني أبدو قبيحاً.'], options_az: ['Görünüşümün pisləşdiyini hiss etmirəm.', 'Yaşlı görünəcəyimdən naraham.', 'Görünüşümdə daimi dəyişikliklər var.', 'Çirkin göründüyümə inanıram.'] },
      { en: 'Loss of Energy', ar: 'فقدان الطاقة', az: 'Enerji İtkisi', options_en: ['I can work about as well as before.', 'It takes an extra effort to get started at something.', 'I have to push myself very hard to do anything.', 'I can\'t do any work at all.'], options_ar: ['أستطيع أن أقوم بعملي كما تيودت.', 'أحتاج لجهد كبير لكي أبدأ في عمل شيء ما.', 'إن علي أن أضغط على نفسي بشدة لعمل أي شيء.', 'لا أستطيع أن أقوم بعمل أي شيء على الإطلاق.'], options_az: ['Əvvəlki kimi işləyə bilirəm.', 'Bir şeyə başlamaq üçün əlavə səy lazımdır.', 'Hər hansı bir işi görəcəm çətin olur.', 'Heç nə edə bilmirəm.'] },
      { en: 'Changes in Sleep', ar: 'تغير أنماط النوم', az: 'Yuxu Dəyişiklikləri', options_en: ['I can sleep as well as usual.', 'I don\'t sleep as well as I used to.', 'I wake up 1-2 hours earlier than usual and find it hard to get back to sleep.', 'I wake up several hours earlier than I used to and cannot get back to sleep.'], options_ar: ['أستطيع أن أنام كالمعتاد.', 'لا أنام كالمعتاد.', 'أستيقظ قبل موعدي بساعة أو ساعتين وأجد صعوبة في النوم مرة أخرى.', 'أستيقظ قبل بضعة ساعات من موعدي المعتاد ولا أستطيع العودة للنوم مرة أخرى.'], options_az: ['Həmişəki kimi yata bilirəm.', 'Həmişəki kimi yata bilmirəm.', '1-2 saat erkən oyanıram.', 'Bir neçə saat erkən oyanıram və yenidən yata bilmirəm.'] },
      { en: 'Irritability', ar: 'التهيج', az: 'Əsəbilik', options_en: ['I am no more irritable than usual.', 'I am slightly more irritable than usual.', 'I am quite irritable most of the time.', 'I am irritable all the time.'], options_ar: ['لا أشعر بتيب أكثر من المعتاد.', 'أتيب بسرعة عن المعتاد.', 'أتيب من القيام بأي جهد في عمل أي شيء.', 'إني أتيب لدرجة أنني لا أستطيع أن أقوم بأي عمل.'], options_az: ['Həmişəkindən daha əsəbi deyiləm.', 'Həmişəkindən biraz daha əsəbiyəm.', 'Çox vaxt əsəbiyəm.', 'Həmişə əsəbiyəm.'] },
      { en: 'Changes in Appetite', ar: 'تغيرات في الشهية', az: 'İştaha Dəyişiklikləri', options_en: ['My appetite is no worse than usual.', 'My appetite is not as good as it used to be.', 'My appetite is much worse now.', 'I have no appetite at all anymore.'], options_ar: ['إن شهيتي للطعام ليست أقل من المعتاد.', 'إن شهيتي للطعام ليست جيدة كالمعتاد.', 'إن شهيتي للطعام أسوأ كثيراً الآن.', 'ليس لدي شهية في الوقت الحاضر.'], options_az: ['İştahım həmişəki kimidir.', 'İştahım həmişəki qədər yaxşı deyil.', 'İştahım çox azalıb.', 'Heç iştahım yoxdur.'] },
      { en: 'Weight Loss', ar: 'فقدان الوزن', az: 'Kilo İtkisi', options_en: ['I haven\'t lost much weight, if any, lately.', 'I have lost more than 2 pounds.', 'I have lost more than 5 pounds.', 'I have lost more than 10 pounds.'], options_ar: ['لم ينقص وزني في الآونة الأخيرة.', 'فقدت أكثر من كيلو جرامات من وزني.', 'فقدت أربعة كيلو جرامات من وزني.', 'فقدت ستة كيلو جرامات من وزني.'], options_az: ['Sonradan kilo itirməmişəm.', '1 kqdan çox kilo itirmişəm.', '2 kqdan çox kilo itirmişəm.', '3 kqdan çox kilo itirmişəm.'] },
      { en: 'Preoccupation with Health', ar: 'القلق على الصحة', az: 'Sağlamlıq Narahatlığı', options_en: ['I am no more worried about my health than usual.', 'I am worried about physical problems like aches, pains, upset stomach, or constipation.', 'I am very worried about physical problems and it\'s hard to think of much else.', 'I am so worried about my physical problems that I cannot think of anything else.'], options_ar: ['لست مشغولاً على صحتي أكثر من السابق.', 'أني مشغول جداً ببعض المشكلات البدنية مثل الأوجاع واضطرابات المعدة والإمساك.', 'أني مشغول جداً ببعض المشكلات اليومية ومن الصعب أن أفكر في أي شيء آخر.', 'أني مشغول جداً ببعض المشكلات البدنية لدرجة أني لا أستطيع أن أفكر في أي شيء آخر.'], options_az: ['Sağlamlıq üzrə narahatlığım həmişəki kimidir.', 'Bədən ağrıları haqqında naraham.', 'Fiziki problemlər barədə çox naraham.', 'Fiziki problemlər barədə o qədər naraham ki, başqa şey düşünə bilmirəm.'] },
      { en: 'Loss of Interest in Sex', ar: 'فقدان الاهتمام الجنسي', az: 'Seksual Maraq İtkisi', options_en: ['I have not noticed any recent change in my interest in sex.', 'I am less interested in sex than I used to be.', 'I am much less interested in sex now.', 'I have lost interest in sex completely.'], options_ar: ['لم ألاحظ أي تغيرات حديثة في اهتمامي الجنسية.', 'أنني أقل اهتماماً بالجنس عن المعتاد.', 'لقد قل الآن اهتمامي بالعلاقة الجنسية كثيراً.', 'لقد فقدت اهتمامي بالعلاقة الجنسية تماماً.'], options_az: ['Cinsi maraqda son dəyişiklik hiss etmirəm.', 'Əvvəlkindən az cinsi marağım var.', 'İndi cinsi marağım çox azdır.', 'Cinsi marağımı tamamilə itirmişəm.'] },
    ],
    scoring: (answers) => ({ total: answers.reduce((s, a) => s + a, 0) }),
    getResult: (total, lang) => {
      const isAr = lang === 'ar'; const isAz = lang === 'az';
      if (total <= 9) return { level: isAr ? 'لا يوجد اكتئاب' : isAz ? 'Depressiya yoxdur' : 'No Depression', color: 'text-green-600', desc: isAr ? `المجموع: ${total} – لا يوجد اكتئاب.` : isAz ? `Cəm: ${total} – Depressiya yoxdur.` : `Total: ${total} – No depression.` };
      if (total <= 15) return { level: isAr ? 'اكتئاب بسيط' : isAz ? 'Yüngül depressiya' : 'Mild Depression', color: 'text-amber-500', desc: isAr ? `المجموع: ${total} – اكتئاب بسيط.` : isAz ? `Cəm: ${total} – Yüngül depressiya.` : `Total: ${total} – Mild depression.` };
      if (total <= 22) return { level: isAr ? 'اكتئاب متوسط' : isAz ? 'Orta depressiya' : 'Moderate Depression', color: 'text-amber-600', desc: isAr ? `المجموع: ${total} – اكتئاب متوسط.` : isAz ? `Cəm: ${total} – Orta depressiya.` : `Total: ${total} – Moderate depression.` };
      if (total <= 36) return { level: isAr ? 'اكتئاب شديد' : isAz ? 'Şiddətli depressiya' : 'Severe Depression', color: 'text-red-600', desc: isAr ? `المجموع: ${total} – اكتئاب شديد.` : isAz ? `Cəm: ${total} – Şiddətli depressiya.` : `Total: ${total} – Severe depression.` };
      return { level: isAr ? 'اكتئاب شديد جداً' : isAz ? 'Çox şiddətli depressiya' : 'Very Severe Depression', color: 'text-red-800', desc: isAr ? `المجموع: ${total} – اكتئاب شديد جداً. يُنصح بالمساعدة المتخصصة.` : isAz ? `Cəm: ${total} – Çox şiddətli depressiya. Mütəxəssis yardımı tövsiyə edilir.` : `Total: ${total} – Very severe depression. Specialist help recommended.` };
    }
  },

  /* 7. Beck Anxiety Inventory (BAI) */
  {
    key: 'bai',
    icon: Activity,
    color: 'from-orange-500 to-red-500',
    bg: 'bg-orange-50',
    border: 'border-orange-100',
    en: 'Beck Anxiety Inventory (BAI)',
    ar: 'مقياس بيك للقلق',
    az: 'Beck Narahlıq İnventarı (BAI)',
    desc_en: '21-item scale measuring anxiety symptom severity over the past month.',
    desc_ar: 'مقياس من ٢١ بنداً يقيّم شدة أعراض القلق خلال الشهر الماضي.',
    desc_az: 'Keçən ay ərzindəki narahlıq simptomlarının şiddətini ölçən 21 maddəlik şkala.',
    duration_en: '5 min · 21 items · Rate 0–3',
    duration_ar: '٥ دقائق · ٢١ بنداً · تقييم ٠-٣',
    duration_az: '5 dəq · 21 maddə · 0–3 qiymət',
    type: 'rating',
    ratingScale: {
      en: ['0 – Not at all', '1 – Mildly', '2 – Moderately', '3 – Severely'],
      ar: ['٠ – لا أبدا', '١ – بشكل خفيف لا يزعجني كثيراً', '٢ – بشكل متوسط مزعج في بعض الأحيان', '٣ – بشكل شديد مزعج كثيراً'],
      az: ['0 – Heç vaxt', '1 – Yüngül', '2 – Orta', '3 – Şiddətli'],
    },
    questions: [
      { en: 'Numbness or tingling', ar: 'تخذر/وخز/تنمل', az: 'Uyuşma / karıncalanma' },
      { en: 'Feeling hot', ar: 'الإحساس بالحرارة', az: 'İstilik hissi' },
      { en: 'Wobbliness in legs', ar: 'وهن في الساقين', az: 'Ayaqlarda halsızlıq' },
      { en: 'Unable to relax', ar: 'عدم القدرة على الإسترخاء', az: 'Rahatlaşa bilməmək' },
      { en: 'Fear of worst happening', ar: 'الخوف من حدوث الأسوء', az: 'Ən pis şeyin baş verəcəyi qorxusu' },
      { en: 'Dizzy or lightheaded', ar: 'الدوار أو الدوخة', az: 'Başdönməsi' },
      { en: 'Heart pounding or racing', ar: 'خفقان القلب بقوة أو بسرعة', az: 'Ürək döyünməsi' },
      { en: 'Unsteady', ar: 'فقدان التوازن', az: 'Tərpənmə / tarazlıq itkisi' },
      { en: 'Terrified or afraid', ar: 'الشعور بالرعب أو الخوف', az: 'Dəhşət / qorxu hissi' },
      { en: 'Nervous', ar: 'التوتر والعصبية', az: 'Əsəbilik' },
      { en: 'Feeling of choking', ar: 'الإحساس بانسداد الحلق', az: 'Boğulma hissi' },
      { en: 'Hands trembling', ar: 'ارتعاش اليدين', az: 'Əllərin titrəməsi' },
      { en: 'Shaky or unsteady', ar: 'الإرتجاف الجسدي وفقدان الثبات', az: 'Bədənin titrəməsi' },
      { en: 'Fear of losing control', ar: 'الخوف من فقدان السيطرة على الذات', az: 'Nəzarəti itirmək qorxusu' },
      { en: 'Difficulty in breathing', ar: 'صعوبة في التنفس', az: 'Nəfəs almaqda çətinlik' },
      { en: 'Fear of dying', ar: 'الخوف من الموت', az: 'Ölüm qorxusu' },
      { en: 'Scared', ar: 'الفزع', az: 'Qorxu hissi' },
      { en: 'Indigestion', ar: 'عسر في الجهاز الهضمي', az: 'Həzm problemləri' },
      { en: 'Faint or lightheaded', ar: 'الإغماء أو الشعور بالإغماء الوشيك', az: 'Bayılma / başdönməsi hissi' },
      { en: 'Face flushed', ar: 'احمرار الوجه', az: 'Üzün qızarması' },
      { en: 'Hot / cold sweats', ar: 'التعرق (البارد أو الساخن)', az: 'İsti/soyuq tərləmə' },
    ],
    scoring: (answers) => ({ total: answers.reduce((s, a) => s + a, 0) }),
    getResult: (total, lang) => {
      const isAr = lang === 'ar'; const isAz = lang === 'az';
      if (total <= 21) return { level: isAr ? 'قلق منخفض' : isAz ? 'Aşağı narahlıq' : 'Low Anxiety', color: 'text-green-600', desc: isAr ? `المجموع: ${total} – قلق منخفض.` : isAz ? `Cəm: ${total} – Aşağı narahlıq.` : `Total: ${total} – Low anxiety.` };
      if (total <= 35) return { level: isAr ? 'قلق متوسط' : isAz ? 'Orta narahlıq' : 'Moderate Anxiety', color: 'text-amber-600', desc: isAr ? `المجموع: ${total} – قلق متوسط.` : isAz ? `Cəm: ${total} – Orta narahlıq.` : `Total: ${total} – Moderate anxiety.` };
      return { level: isAr ? 'قلق شديد' : isAz ? 'Yüksək narahlıq' : 'High Anxiety', color: 'text-red-600', desc: isAr ? `المجموع: ${total} – قلق كبير يستحق الانتباه.` : isAz ? `Cəm: ${total} – Yüksək narahlıq. Diqqət tələb olunur.` : `Total: ${total} – High anxiety requiring attention.` };
    }
  },

  /* 8. Davidson PTSD Scale */
  {
    key: 'ptsd',
    icon: Eye,
    color: 'from-slate-500 to-gray-700',
    bg: 'bg-slate-50',
    border: 'border-slate-100',
    en: 'PTSD Scale (Davidson Trauma Scale)',
    ar: 'مقياس كرب ما بعد الصدمة (دافيدسون)',
    az: 'PTSD Şkalası (Davidson Travma Şkalası)',
    desc_en: '17-item scale based on DSM-IV criteria for PTSD, covering re-experiencing, avoidance, and arousal clusters.',
    desc_ar: 'مقياس من ١٧ بنداً مبني على معايير DSM-IV لاضطراب ما بعد الصدمة، يغطي ثلاثة محاور.',
    desc_az: 'DSM-IV meyarlarına əsaslanan 17 maddəlik PTSD şkalası — yenidən yaşama, qaçınma və oyanıqlıq qruplarını əhatə edir.',
    duration_en: '10 min · 17 items · Rate 0–4',
    duration_ar: '١٠ دقائق · ١٧ بنداً · تقييم ٠-٤',
    duration_az: '10 dəq · 17 maddə · 0–4 qiymət',
    type: 'rating',
    ratingScale: {
      en: ['0 – Never', '1 – Rarely', '2 – Sometimes', '3 – Often', '4 – Always'],
      ar: ['٠ – أبدا', '١ – نادراً', '٢ – أحياناً', '٣ – غالباً', '٤ – دائماً'],
      az: ['0 – Heç vaxt', '1 – Nadir', '2 – Bəzən', '3 – Tez-tez', '4 – Həmişə'],
    },
    questions: [
      { en: 'Do you have flashbacks, memories, or thoughts about the traumatic event?', ar: 'هل تتخيل صور، وذكريات، وأفكار عن الخبرة الصادمة؟', az: 'Travmatik hadisə haqqında flaşbeklar, xatirələr yaşayırsınız?' },
      { en: 'Do you have distressing dreams about the trauma?', ar: 'هل تحلم أحلاماً مزعجة تتعلق بالخبرة الصادمة؟', az: 'Travma ilə bağlı narahedici xülyalar görürsünüz?' },
      { en: 'Do you feel as if the traumatic event is happening again?', ar: 'هل تشعر بمشاعر فجائية أو خبرات بأن ما حدث لك سيححدث مرة أخرى؟', az: 'Travmatik hadisənin yenidən baş verdiyi hissini yaşayırsınız?' },
      { en: 'Do you feel distressed at reminders of the trauma?', ar: 'هل تتضايق من الأشياء التي تذكرك بما تعرضت له من خبرة صادمة؟', az: 'Travmanı xatırladan şeylərdən narahat olursunuz?' },
      { en: 'Do you avoid thoughts or feelings about the traumatic event?', ar: 'هل تتجنب الأفكار أو المشاعر التي تذكرك بالحدث الصادم؟', az: 'Travmatik hadisə haqqında düşüncə və hisslərdən qaçırsınız?' },
      { en: 'Do you avoid activities or situations that remind you of the trauma?', ar: 'هل تتجنب المواقف والأشياء التي تذكرك بالحدث الصادم؟', az: 'Travmanı xatırladan vəziyyət və şeylərdən qaçırsınız?' },
      { en: 'Do you have trouble recalling important parts of the trauma?', ar: 'هل تعاني من فقدان الذاكرة للأحداث الصادمة التي تعرضت لها (فقـدان ذاكـرة نفسي محدد)?', az: 'Travmanın vacib hissələrini xatırlamaqda çətinlik çəkirsiniz?' },
      { en: 'Do you have difficulty enjoying activities you used to enjoy?', ar: 'هل لديك صعوبة في التمتع بحياتك والنشاطات اليومية التي تعودت عليها؟', az: 'Əvvəllər sevdiyiniz fəaliyyətlərə marağınız azalıb?' },
      { en: 'Do you feel detached or cut off from people around you?', ar: 'هل تشعر بالعزلة وبأنك بعيد ولا تحب الاقتراب من الآخرين أو الانبساط؟', az: 'Ətrafınızdakı insanlardan özünüzü ayrı hiss edirsiniz?' },
      { en: 'Do you feel emotionally numb (unable to feel sadness, joy, or love)?', ar: 'هل فقدت الشعور بالحزن والحب والإحساس المتبلد؟', az: 'Emosional hissizlik (kədər, sevinc, sevgini hiss edə bilməmək) yaşayırsınız?' },
      { en: 'Do you have difficulty imagining a long future (career, marriage, children)?', ar: 'هل تجد صعوبة في تخيل بقائك قيد الحياة لفترة طويلة لتحقق أهدافك فـي العمل، والزواج، و إنجاب الأطفال؟', az: 'Gələcəyi (karyera, evlilik) uzunmüddətli planlaşdırmaqda çətinlik çəkirsiniz?' },
      { en: 'Do you have difficulty falling asleep or staying asleep?', ar: 'هل لديك صعوبة في النوم أو البقاء نائماً؟', az: 'Yuxuya getmək və ya yuxuda qalmaqda çətinlik var?' },
      { en: 'Do you have outbursts of anger?', ar: 'هل تتنتابك نوبات من التوتر و الغضب؟', az: 'Qəzəb partlayışları yaşayırsınız?' },
      { en: 'Do you have difficulty concentrating?', ar: 'هل تعاني من صعوبات في التركيز؟', az: 'Diqqəti cəmləmədə çətinlik var?' },
      { en: 'Are you overly alert (on the edge, easily startled)?', ar: 'هل تشعر بأنك على حافة الانهيار (واصلة معاك على الآخر) ، ومن السهل التشتت انتباهك؟', az: 'Həddindən artıq ayıqlıq (həmişə hazır olmaq, asanlıqla qorxmaq) hiss edirsiniz?' },
      { en: 'Are you jumpy or easily startled?', ar: 'هل تستار لآتقه الأسباب وتشعر دائما بأنك متحفز وتتوقع الأسواء؟', az: 'Asanlıqla qorxursunuz?' },
      { en: 'Are things that remind you of the trauma distressing?', ar: 'هل الأشياء والأشخاص الذين يذكرونك بالخبرة الصادمة يجعلك تعاني من نوبـة من ضيق التنفس، والرعشة، والعرق الغزير وسرعة في ضربات قلبك؟', az: 'Travmanı xatırladan şeylər narahalıq yaradır?' },
    ],
    scoring: (answers) => ({ total: answers.reduce((s, a) => s + a, 0) }),
    getResult: (total, lang) => {
      const isAr = lang === 'ar'; const isAz = lang === 'az';
      if (total < 5) return { level: isAr ? 'لا مؤشرات واضحة' : isAz ? 'PTSD göstəricisi yoxdur' : 'No PTSD Indicators', color: 'text-green-600', desc: isAr ? `المجموع: ${total} – لا مؤشرات ملحوظة.` : isAz ? `Cəm: ${total} – PTSD göstəricisi yoxdur.` : `Total: ${total} – No significant PTSD indicators.` };
      if (total <= 15) return { level: isAr ? 'أعراض خفيفة' : isAz ? 'Yüngül simptomlar' : 'Mild Symptoms', color: 'text-amber-500', desc: isAr ? `المجموع: ${total} – أعراض خفيفة.` : isAz ? `Cəm: ${total} – Yüngül simptomlar.` : `Total: ${total} – Mild PTSD symptoms.` };
      if (total <= 30) return { level: isAr ? 'أعراض متوسطة' : isAz ? 'Orta simptomlar' : 'Moderate Symptoms', color: 'text-amber-600', desc: isAr ? `المجموع: ${total} – أعراض متوسطة.` : isAz ? `Cəm: ${total} – Orta simptomlar.` : `Total: ${total} – Moderate PTSD symptoms.` };
      return { level: isAr ? 'أعراض شديدة' : isAz ? 'Şiddətli simptomlar' : 'Severe Symptoms', color: 'text-red-600', desc: isAr ? `المجموع: ${total} – أعراض شديدة. يُنصح بالاستشارة المتخصصة.` : isAz ? `Cəm: ${total} – Şiddətli simptomlar. Mütəxəssis tövsiyə edilir.` : `Total: ${total} – Severe PTSD symptoms. Specialist consultation recommended.` };
    }
  },
];

/* ─────────────────────────────────────────────
   MODAL COMPONENT
───────────────────────────────────────────── */
function TestModal({ test, lang, isRTL, onClose }) {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);

  const t = (en, ar, az) => lang === 'ar' ? ar : lang === 'az' ? az : en;

  const question = test.questions[current];
  const qText = t(question?.en, question?.ar, question?.az);
  const total = test.questions.length;

  const handleAnswer = (val) => {
    const newAnswers = [...answers, val];
    setAnswers(newAnswers);
    if (current + 1 < total) {
      setCurrent(current + 1);
    } else {
      finalize(newAnswers);
    }
  };

  const finalize = (finalAnswers) => {
    const scores = test.scoring(finalAnswers);
    let res;
    if (test.key === 'swan') {
      res = test.getResult(scores, lang);
    } else {
      res = test.getResult(scores.total, lang);
    }
    setResult(res);
    setDone(true);
  };

  const ratingLabels = test.ratingScale ? t(test.ratingScale.en, test.ratingScale.ar, test.ratingScale.az) : null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {!done ? (
          <div className="p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-full">
                {t(`Q ${current + 1} / ${total}`, `س ${current + 1} / ${total}`, `S ${current + 1} / ${total}`)}
              </span>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors">×</button>
            </div>
            {/* Progress */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-5">
              <div className={`bg-gradient-to-r ${test.color} h-1.5 rounded-full transition-all duration-300`}
                style={{ width: `${(current / total) * 100}%` }} />
            </div>
            {/* Question */}
            <p className="text-sm font-semibold text-foreground mb-5 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>{qText}</p>

            {/* Rating scale */}
            {test.type === 'rating' && ratingLabels && (
              <div className="space-y-2">
                {ratingLabels.map((label, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-teal-400 hover:bg-teal-50 text-sm transition-all font-medium"
                    dir={isRTL ? 'rtl' : 'ltr'}>
                    {label}
                  </button>
                ))}
              </div>
            )}

            {/* True/False */}
            {test.type === 'truefalse' && (
              <div className="flex gap-3 mt-2">
                <button onClick={() => handleAnswer(1)}
                  className="flex-1 py-3 rounded-xl border-2 border-green-200 text-green-700 font-bold hover:bg-green-50 text-sm transition-all">
                  {t('✓ True', '✓ صح', '✓ Doğru')}
                </button>
                <button onClick={() => handleAnswer(0)}
                  className="flex-1 py-3 rounded-xl border-2 border-red-200 text-red-700 font-bold hover:bg-red-50 text-sm transition-all">
                  {t('✗ False', '✗ خطأ', '✗ Yanlış')}
                </button>
              </div>
            )}

            {/* Multi-choice (BDI) */}
            {test.type === 'multichoice' && question.options_en && (
              <div className="space-y-2">
                {t(question.options_en, question.options_ar, question.options_az).map((opt, i) => (
                  <button key={i} onClick={() => handleAnswer(i)}
                    className="w-full text-left px-4 py-3 rounded-xl border border-border hover:border-teal-400 hover:bg-teal-50 text-sm transition-all flex items-start gap-3"
                    dir={isRTL ? 'rtl' : 'ltr'}>
                    <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i}</span>
                    <span>{opt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 text-center">
            <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${test.color} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{t('Test Complete!', 'انتهى الاختبار!', 'Test tamamlandı!')}</h3>
            {result && (
              <>
                <p className={`text-lg font-bold mt-3 mb-1 ${result.color}`}>{result.level}</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{result.desc}</p>
                {/* Breakdown for intelligence */}
                {result.breakdown && (
                  <div className="text-left space-y-1.5 mb-4 p-3 bg-muted/30 rounded-xl">
                    {Object.entries(result.breakdown).sort((a, b) => b[1] - a[1]).map(([name, score]) => (
                      <div key={name} className="flex items-center justify-between text-xs">
                        <span className="text-foreground font-medium">{name}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-muted rounded-full h-1.5">
                            <div className="bg-violet-500 h-1.5 rounded-full" style={{ width: `${(score / 6) * 100}%` }} />
                          </div>
                          <span className="text-muted-foreground w-4">{score}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-amber-50 border border-amber-100 rounded-xl px-3 py-2 mb-5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
              <span className="text-left" dir={isRTL ? 'rtl' : 'ltr'}>
                {t('This result is for informational purposes only and does not replace professional clinical assessment.',
                  'هذه النتيجة لأغراض إعلامية فقط ولا تُغني عن التقييم السريري المتخصص.',
                  'Bu nəticə yalnız məlumat məqsədlidir və peşəkar klinik qiymətləndirməni əvəz etmir.')}
              </span>
            </div>
            <Button onClick={onClose} className={`bg-gradient-to-r ${test.color} text-white rounded-xl px-8`}>
              {t('Close', 'إغلاق', 'Bağla')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function Tests() {
  const { lang, isRTL } = useLanguage();
  const [activeTest, setActiveTest] = useState(null);
  const t = (en, ar, az) => lang === 'ar' ? ar : lang === 'az' ? az : en;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-br from-teal-600 to-teal-800 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('Back to Home', 'العودة للرئيسية', 'Ana Səhifəyə Qayıt')}
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {t('Clinical Assessment Scales', 'مقاييس التقييم النفسي السريري', 'Klinik Qiymətləndirmə Şkalaları')}
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {t('Standardized psychological assessment tools — 7 validated clinical scales', 'أدوات تقييم نفسي معيارية — ٧ مقاييس سريرية معتمدة', '7 təsdiqlənmiş klinik şkala — standartlaşdırılmış psixoloji qiymətləndirmə')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TESTS.map((test) => {
            const Icon = test.icon;
            const name = t(test.en, test.ar, test.az);
            const desc = t(test.desc_en, test.desc_ar, test.desc_az);
            const duration = t(test.duration_en, test.duration_ar, test.duration_az);
            return (
              <div key={test.key} className={`bg-white border ${test.border} rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${test.color} flex items-center justify-center flex-shrink-0 shadow-md`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground text-base leading-tight" dir={isRTL ? 'rtl' : 'ltr'}>{name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{duration}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-5 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>{desc}</p>
                <Button onClick={() => setActiveTest(test)}
                  className={`w-full bg-gradient-to-r ${test.color} text-white rounded-xl h-10 font-semibold hover:opacity-90 transition-opacity`}>
                  {t('Start Assessment', 'ابدأ التقييم', 'Qiymətləndirməyə Başla')}
                  {isRTL ? <ChevronLeft className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
            {t(
              'These scales are for informational and educational purposes only. They do not replace professional clinical diagnosis or treatment. If you are concerned about your mental health, please consult a licensed mental health professional.',
              'هذه المقاييس لأغراض توعوية وتعليمية فقط، ولا تُغني عن التشخيص السريري المتخصص أو العلاج. إذا كنت قلقاً على صحتك النفسية، يُرجى استشارة متخصص صحة نفسية مرخّص.',
              'Bu şkalalar yalnız məlumat və tədris məqsədinə xidmət edir. Peşəkar klinik diaqnoz və ya müalicənin yerini tutmur. Ruhi sağlamlığınızla bağlı narahatlığınız varsa, lisenziyalı mütəxəssisə müraciət edin.'
            )}
          </p>
        </div>
      </div>

      {activeTest && (
        <TestModal
          test={activeTest}
          lang={lang}
          isRTL={isRTL}
          onClose={() => setActiveTest(null)}
        />
      )}
    </div>
  );
}