import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Search, Stethoscope, Send } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import PostCard from '@/components/community/PostCard';

export default function Community() {
  const { t, lang, isRTL } = useLanguage();
  const [tab, setTab] = useState('posts');
  const [question, setQuestion] = useState('');

  const { data: posts = [] } = useQuery({
    queryKey: ['communityPosts'],
    queryFn: () => base44.entities.CommunityPost.list('-created_date', 20),
  });

  const doctorPosts = posts.filter(p => p.type === 'doctor_post');
  const patientQuestions = posts.filter(p => p.type === 'patient_question');

  const samplePosts = [
    {
      id: 's1', author_name: isRTL ? 'أحمد القيسي' : 'Ahmed Al-Qaisi',
      author_specialty: isRTL ? 'أخصائي جلدية' : 'Dermatologist',
      content: isRTL ? 'هناك مستجدات طبية حول علاج حب الشباب بتقنيات جديدة أثبتت فعالية عالية...' : 'There are new medical questions about the present line of antivert diatomaceous share...',
      likes_count: 1890, comments_count: 42, is_verified_doctor: true, type: 'doctor_post'
    },
    {
      id: 's2', author_name: isRTL ? 'سلو خليل' : 'Salu Hilal',
      author_specialty: isRTL ? 'أخصائي جلدية' : 'Dermatologist',
      content: isRTL ? 'هذا السؤال الطبي حول علاج الأكزيما وطرق الوقاية منها...' : 'This is the realistical question autoreaction surgerated to east scorit.',
      likes_count: 245, comments_count: 18, is_verified_doctor: true, type: 'doctor_post'
    },
    {
      id: 's3', author_name: isRTL ? 'أحمد القيسي' : 'Ahmed Al-Qaisi',
      author_specialty: isRTL ? 'طبيب عام' : 'General Doctor',
      content: isRTL ? 'نصيحة مهمة: تناول الفيتامينات بانتظام يساعد في تقوية المناعة...' : 'There is line realisticl questions about the presort ine of artiens diooanosils share...',
      likes_count: 567, comments_count: 23, is_verified_doctor: true, type: 'doctor_post'
    },
  ].map(p => ({ ...p, isSample: true }));

  const displayPosts = doctorPosts.length > 0 ? doctorPosts : samplePosts;

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-6 py-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          {t('communityFeed')}
        </h1>

        {/* Search */}
        <div className="relative mt-4">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
          <input
            type="text"
            placeholder={t('searchCommunity')}
            className={`w-full h-10 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-white rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
          />
        </div>
      </motion.div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="bg-teal-50 border border-teal-100 rounded-xl h-10 p-1 mb-6 w-full">
          <TabsTrigger value="posts" className="flex-1 rounded-lg text-sm data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            {t('doctorPosts')}
          </TabsTrigger>
          <TabsTrigger value="questions" className="flex-1 rounded-lg text-sm data-[state=active]:bg-teal-500 data-[state=active]:text-white">
            {t('patientQuestions')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="space-y-4">
          {displayPosts.map((post, i) => (
            <PostCard key={post.id} post={post} index={i} isRTL={isRTL} t={t} />
          ))}
        </TabsContent>

        <TabsContent value="questions" className="space-y-6">
          {/* Ask a Doctor */}
          <div className="bg-card rounded-2xl p-5 shadow-sm border border-teal-500/5">
            <h3 className="font-semibold text-foreground mb-3 flex items-center gap-2">
              <Stethoscope className="w-5 h-5 text-teal-500" />
              {t('askDoctor')}
            </h3>
            <Textarea
              value={question}
              onChange={e => setQuestion(e.target.value)}
              placeholder={t('typeQuestion')}
              className="mb-3 bg-teal-50/50 border-teal-100 rounded-xl resize-none"
              rows={3}
            />
            <Button className="bg-teal-500 hover:bg-teal-600 text-white rounded-full gap-2">
              <Send className="w-4 h-4" />
              {t('submitQuestion')}
            </Button>
          </div>

          {/* Previous Questions */}
          <div>
            <h3 className="font-semibold text-foreground mb-3">{t('previousAnswers')}</h3>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-card rounded-2xl p-4 shadow-sm border border-teal-500/5">
                  <Badge variant="secondary" className="bg-teal-50 text-teal-600 text-[10px] mb-2 border-0">
                    {t('topAnswered')}
                  </Badge>
                  <p className="text-sm text-foreground mb-2">
                    {isRTL
                      ? 'ما هي أفضل طريقة لعلاج حب الشباب؟'
                      : 'What is the best way to treat acne?'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t('answeredBySpecialist')}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}