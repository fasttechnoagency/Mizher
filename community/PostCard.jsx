import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { ThumbsUp, MessageSquare, Share2, MoreHorizontal, Shield, Stethoscope } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import PostComments from './PostComments';

export default function PostCard({ post, index, isRTL, t }) {
  const qc = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [localLiked, setLocalLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(post.likes_count || 0);
  const [localComments, setLocalComments] = useState(post.comments_count || 0);

  const isSample = post.isSample;

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: () => base44.auth.me(),
    retry: false,
  });

  const likedByMe = !isSample && currentUser && Array.isArray(post.liked_by) && post.liked_by.includes(currentUser.id);

  const likeMutation = useMutation({
    mutationFn: () => {
      const liked_by = Array.isArray(post.liked_by) ? [...post.liked_by] : [];
      const alreadyLiked = liked_by.includes(currentUser.id);
      const updated = alreadyLiked ? liked_by.filter(id => id !== currentUser.id) : [...liked_by, currentUser.id];
      return base44.entities.CommunityPost.update(post.id, {
        liked_by: updated,
        likes_count: updated.length,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['communityPosts'] }),
    onError: () => toast.error(isRTL ? 'فشل الإعجاب' : 'Failed to like post'),
  });

  const handleLike = () => {
    if (isSample) {
      setLocalLiked(v => !v);
      setLocalLikes(c => (localLiked ? c - 1 : c + 1));
      return;
    }
    if (!currentUser) {
      toast.error(isRTL ? 'يجب تسجيل الدخول للإعجاب' : 'Please sign in to like posts');
      return;
    }
    likeMutation.mutate();
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/community`;
    if (navigator.share) {
      try {
        await navigator.share({ title: post.author_name, text: post.content || post.content_en, url: shareUrl });
      } catch (e) { /* user cancelled share */ }
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(isRTL ? 'تم نسخ رابط المنشور' : 'Post link copied to clipboard');
    }
  };

  const displayLikes = isSample ? localLikes : (post.likes_count || 0);
  const displayComments = isSample ? localComments : (post.comments_count || 0);
  const liked = isSample ? localLiked : likedByMe;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-card rounded-2xl p-4 shadow-sm border border-teal-500/5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{post.author_name}</span>
              {post.is_verified_doctor && <Shield className="w-4 h-4 text-teal-500" />}
            </div>
            <span className="text-xs text-muted-foreground">{post.author_specialty}</span>
          </div>
        </div>
        <button className="text-muted-foreground"><MoreHorizontal className="w-5 h-5" /></button>
      </div>

      <p className="text-sm text-foreground leading-relaxed mb-4">{post.content || post.content_en || post.content_ar}</p>

      <div className="flex items-center gap-6 pt-3 border-t border-teal-500/5">
        <button
          onClick={handleLike}
          disabled={likeMutation.isPending}
          className={`flex items-center gap-1.5 text-xs transition-colors ${liked ? 'text-teal-600 font-medium' : 'text-muted-foreground hover:text-teal-600'}`}
        >
          <ThumbsUp className={`w-4 h-4 ${liked ? 'fill-teal-600' : ''}`} />
          <span>{displayLikes}</span>
        </button>
        <button
          onClick={() => setShowComments(v => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal-600 transition-colors"
        >
          <MessageSquare className="w-4 h-4" />
          {t('comment')} {displayComments > 0 && `(${displayComments})`}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-teal-600 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          {t('share')}
        </button>
      </div>

      {showComments && (
        <PostComments
          post={post}
          isSample={isSample}
          currentUser={currentUser}
          isRTL={isRTL}
          commentText={commentText}
          setCommentText={setCommentText}
          localComments={localComments}
          setLocalComments={setLocalComments}
        />
      )}
    </motion.div>
  );
}