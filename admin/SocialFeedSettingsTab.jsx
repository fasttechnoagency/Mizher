import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Save, Plus, Trash2, Upload, Loader2, Instagram, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

const emptyPost = () => ({ url: '', image_url: '', caption: '', is_video: false });

function PostRow({ post, onChange, onRemove, onUpload, uploading }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 space-y-2 border border-gray-100">
      <div className="flex gap-2">
        {post.image_url ? (
          <div className="relative flex-shrink-0">
            <img src={post.image_url} alt="" className="w-16 h-16 object-cover rounded-lg border" />
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-lg opacity-0 hover:opacity-100 cursor-pointer transition-opacity">
              <Upload className="w-4 h-4 text-white" />
              <input type="file" accept="image/*,video/*" className="hidden" onChange={onUpload} disabled={uploading} />
            </label>
          </div>
        ) : (
          <label className="flex-shrink-0 w-16 h-16 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors">
            {uploading ? <Loader2 className="w-4 h-4 animate-spin text-teal-500" /> : <Upload className="w-4 h-4 text-gray-400" />}
            <input type="file" accept="image/*,video/*" className="hidden" onChange={onUpload} disabled={uploading} />
          </label>
        )}
        <div className="flex-1 space-y-1.5">
          <Input value={post.url} onChange={e => onChange('url', e.target.value)}
            placeholder="Post URL (optional)" className="h-8 text-xs" />
          <Input value={post.caption} onChange={e => onChange('caption', e.target.value)}
            placeholder="Caption (optional)" className="h-8 text-xs" />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer">
              <input type="checkbox" checked={!!post.is_video} onChange={e => onChange('is_video', e.target.checked)} className="accent-teal-600" />
              Video
            </label>
            <button onClick={onRemove} className="text-red-400 hover:text-red-600 text-xs flex items-center gap-1 ms-auto">
              <Trash2 className="w-3 h-3" /> Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SocialFeedSettingsTab() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ key: 'social_feed', instagram_url: '', facebook_url: '', youtube_url: '', instagram_posts: [], facebook_posts: [], youtube_posts: [] });
  const [recordId, setRecordId] = useState(null);
  const [uploadingIdx, setUploadingIdx] = useState(null); // { type, idx }

  const { data: settings, isLoading } = useQuery({
    queryKey: ['app-settings-social'],
    queryFn: async () => {
      const all = await base44.entities.AppSettings.list();
      return all.find(s => s.key === 'social_feed') || null;
    },
  });

  useEffect(() => {
    if (settings) {
      setForm({
        key: 'social_feed',
        instagram_url: settings.instagram_url || '',
        facebook_url: settings.facebook_url || '',
        youtube_url: settings.youtube_url || '',
        instagram_posts: settings.instagram_posts || [],
        facebook_posts: settings.facebook_posts || [],
        youtube_posts: settings.youtube_posts || [],
      });
      setRecordId(settings.id);
    }
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: (data) => recordId
      ? base44.functions.invoke('adminEntityAction', { entityName: 'AppSettings', action: 'update', id: recordId, data })
      : base44.functions.invoke('adminEntityAction', { entityName: 'AppSettings', action: 'create', data }),
    onSuccess: (response) => {
      if (!recordId) setRecordId(response.data?.result?.id);
      qc.invalidateQueries(['app-settings-social']);
      toast.success('Social feed settings saved');
    },
  });

  const updatePost = (type, idx, field, value) => {
    setForm(f => {
      const posts = [...(f[type] || [])];
      posts[idx] = { ...posts[idx], [field]: value };
      return { ...f, [type]: posts };
    });
  };

  const removePost = (type, idx) => {
    setForm(f => ({ ...f, [type]: f[type].filter((_, i) => i !== idx) }));
  };

  const addPost = (type) => {
    setForm(f => ({ ...f, [type]: [...(f[type] || []), emptyPost()] }));
  };

  const handleUpload = async (type, idx, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIdx({ type, idx });
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    updatePost(type, idx, 'image_url', file_url);
    setUploadingIdx(null);
  };

  if (isLoading) return <div className="py-10 text-center text-sm text-gray-400">Loading...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold text-gray-800">Social Feed Settings</h2>
        <p className="text-xs text-gray-500 mt-0.5">Configure the Instagram / Facebook post slider on the home page.</p>
      </div>

      {/* Profile URLs */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Profile URLs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Instagram Profile URL</Label>
            <Input value={form.instagram_url} onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))}
              placeholder="https://www.instagram.com/yourpage" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Facebook Page URL</Label>
            <Input value={form.facebook_url} onChange={e => setForm(f => ({ ...f, facebook_url: e.target.value }))}
              placeholder="https://www.facebook.com/yourpage" className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">YouTube Channel URL</Label>
            <Input value={form.youtube_url} onChange={e => setForm(f => ({ ...f, youtube_url: e.target.value }))}
              placeholder="https://www.youtube.com/@yourchannel" className="h-9 text-sm" />
          </div>
        </div>
      </div>

      {/* Instagram Posts */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Instagram</span>
            Posts ({form.instagram_posts.length})
          </h3>
          <Button size="sm" variant="outline" onClick={() => addPost('instagram_posts')} className="h-7 text-xs gap-1 border-pink-200 text-pink-600 hover:bg-pink-50">
            <Plus className="w-3 h-3" /> Add Post
          </Button>
        </div>
        <div className="space-y-2">
          {form.instagram_posts.map((post, i) => (
            <PostRow key={i} post={post}
              onChange={(f, v) => updatePost('instagram_posts', i, f, v)}
              onRemove={() => removePost('instagram_posts', i)}
              onUpload={(e) => handleUpload('instagram_posts', i, e)}
              uploading={uploadingIdx?.type === 'instagram_posts' && uploadingIdx?.idx === i}
            />
          ))}
          {form.instagram_posts.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No posts yet — click "Add Post"</p>
          )}
        </div>
      </div>

      {/* Facebook Posts */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-[#1877F2]">Facebook</span>
            Posts ({form.facebook_posts.length})
          </h3>
          <Button size="sm" variant="outline" onClick={() => addPost('facebook_posts')} className="h-7 text-xs gap-1 border-blue-200 text-blue-600 hover:bg-blue-50">
            <Plus className="w-3 h-3" /> Add Post
          </Button>
        </div>
        <div className="space-y-2">
          {form.facebook_posts.map((post, i) => (
            <PostRow key={i} post={post}
              onChange={(f, v) => updatePost('facebook_posts', i, f, v)}
              onRemove={() => removePost('facebook_posts', i)}
              onUpload={(e) => handleUpload('facebook_posts', i, e)}
              uploading={uploadingIdx?.type === 'facebook_posts' && uploadingIdx?.idx === i}
            />
          ))}
          {form.facebook_posts.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No posts yet — click "Add Post"</p>
          )}
        </div>
      </div>

      {/* YouTube Posts */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <span className="text-[#FF0000]">YouTube</span>
            Videos ({form.youtube_posts.length})
          </h3>
          <Button size="sm" variant="outline" onClick={() => addPost('youtube_posts')} className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50">
            <Plus className="w-3 h-3" /> Add Video
          </Button>
        </div>
        <div className="space-y-2">
          {form.youtube_posts.map((post, i) => (
            <PostRow key={i} post={post}
              onChange={(f, v) => updatePost('youtube_posts', i, f, v)}
              onRemove={() => removePost('youtube_posts', i)}
              onUpload={(e) => handleUpload('youtube_posts', i, e)}
              uploading={uploadingIdx?.type === 'youtube_posts' && uploadingIdx?.idx === i}
            />
          ))}
          {form.youtube_posts.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-4">No videos yet — click "Add Video"</p>
          )}
        </div>
      </div>

      <Button onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending}
        className="bg-teal-600 hover:bg-teal-700 text-white gap-2">
        {saveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save Settings
      </Button>
    </div>
  );
}