import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function PostComments({ post, isSample, currentUser, isRTL, commentText, setCommentText, localComments, setLocalComments }) {
  const qc = useQueryClient();

  const { data: comments = [] } = useQuery({
    queryKey: ['communityComments', post.id],
    queryFn: () => base44.entities.CommunityComment.filter({ post_id: post.id }, '-created_date'),
    enabled: !isSample,
  });

  const commentMutation = useMutation({
    mutationFn: () => base44.entities.CommunityComment.create({
      post_id: post.id,
      author_name: currentUser?.full_name || 'User',
      content: commentText.trim(),
    }),
    onSuccess: async () => {
      setCommentText('');
      await base44.entities.CommunityPost.update(post.id, { comments_count: (post.comments_count || 0) + 1 });
      qc.invalidateQueries({ queryKey: ['communityComments', post.id] });
      qc.invalidateQueries({ queryKey: ['communityPosts'] });
    },
    onError: () => toast.error(isRTL ? 'فشل إرسال التعليق' : 'Failed to post comment'),
  });

  const handleSubmit = () => {
    if (!commentText.trim()) return;
    if (isSample) {
      setLocalComments(c => c + 1);
      setCommentText('');
      return;
    }
    if (!currentUser) {
      toast.error(isRTL ? 'يجب تسجيل الدخول للتعليق' : 'Please sign in to comment');
      return;
    }
    commentMutation.mutate();
  };

  return (
    <div className="mt-4 pt-4 border-t border-teal-500/5 space-y-3">
      {!isSample && comments.map(c => (
        <div key={c.id} className="flex gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-50 flex items-center justify-center text-[10px] font-semibold text-teal-600 shrink-0">
            {(c.author_name || 'U')[0]}
          </div>
          <div className="bg-teal-50/50 rounded-xl px-3 py-2 flex-1">
            <p className="text-xs font-semibold text-foreground">{c.author_name}</p>
            <p className="text-xs text-muted-foreground">{c.content}</p>
          </div>
        </div>
      ))}
      {isSample && localComments > (post.comments_count || 0) && (
        <p className="text-xs text-muted-foreground italic">
          {isRTL ? 'التعليقات هنا للعرض التجريبي فقط' : 'Comments on this demo post are not saved'}
        </p>
      )}
      <div className="flex gap-2">
        <input
          type="text"
          value={commentText}
          onChange={e => setCommentText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          placeholder={isRTL ? 'اكتب تعليقاً...' : 'Write a comment...'}
          className="flex-1 h-9 px-3 bg-teal-50/50 rounded-full border border-teal-100 text-xs focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        />
        <button
          onClick={handleSubmit}
          disabled={commentMutation.isPending || !commentText.trim()}
          className="w-9 h-9 rounded-full bg-teal-500 hover:bg-teal-600 text-white flex items-center justify-center shrink-0 disabled:opacity-50"
        >
          {commentMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
}