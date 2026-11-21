import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { Upload, Eye, EyeOff, Save, Image, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

const SLOT_LABELS = [
  { en: 'Banner 1 – Marketplace', ar: 'بانر 1 – المتجر', path: '/marketplace' },
  { en: 'Banner 2 – Doctor', ar: 'بانر 2 – الطبيب', path: '/doctors' },
  { en: 'Banner 3 – Labs', ar: 'بانر 3 – المختبرات', path: '/doctors' },
  { en: 'Banner 4 – Hospitals', ar: 'بانر 4 – المستشفيات', path: '/hospitals' },
  { en: 'Banner 5 – IQ Test', ar: 'بانر 5 – اختبار الذكاء', path: '/doctors' },
  { en: 'Banner 6 – Medical Tourism', ar: 'بانر 6 – السياحة العلاجية', path: '/packages' },
];

export default function BannerSettingsTab() {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(null); // slot index being uploaded
  const [editingSlot, setEditingSlot] = useState(null); // slot index being edited

  const { data: banners = [], isLoading } = useQuery({
    queryKey: ['promo-banners'],
    queryFn: () => base44.entities.PromoBannerItem.list('sort_order', 20),
  });

  // Pad/align banners to 6 slots by sort_order
  const slots = Array.from({ length: 6 }, (_, i) => {
    const found = banners.find(b => b.sort_order === i);
    return found || null;
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, data }) => id
      ? base44.entities.PromoBannerItem.update(id, data)
      : base44.entities.PromoBannerItem.create(data),
    onSuccess: () => {
      qc.invalidateQueries(['promo-banners']);
      toast.success(isRTL ? 'تم الحفظ' : 'Saved');
      setEditingSlot(null);
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.PromoBannerItem.update(id, { is_active }),
    onSuccess: () => qc.invalidateQueries(['promo-banners']),
  });

  const handleUpload = async (e, slotIndex) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(slotIndex);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      const existing = slots[slotIndex];
      await saveMutation.mutateAsync({
        id: existing?.id || null,
        data: {
          image_url: file_url,
          sort_order: slotIndex,
          path: existing?.path || SLOT_LABELS[slotIndex].path,
          cta_en: existing?.cta_en || 'Learn More',
          cta_ar: existing?.cta_ar || 'اعرف أكثر',
          cta_az: existing?.cta_az || 'Daha çox',
          is_active: existing?.is_active !== false,
        },
      });
      toast.success(isRTL ? 'تم رفع الصورة' : 'Image uploaded');
    } catch {
      toast.error(isRTL ? 'فشل الرفع' : 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSavePath = (slotIndex, path) => {
    const existing = slots[slotIndex];
    if (!existing) return;
    saveMutation.mutate({ id: existing.id, data: { path } });
  };

  if (isLoading) return <div className="text-center py-10 text-muted-foreground text-sm">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-bold text-foreground">{isRTL ? 'إدارة البانرات الترويجية' : 'Promo Banner Management'}</h2>
        <p className="text-xs text-muted-foreground mt-0.5">{isRTL ? 'ارفع صورة لكل بانر (6 بانرات)' : 'Upload an image for each of the 6 banner slots'}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {slots.map((banner, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground">{isRTL ? SLOT_LABELS[i].ar : SLOT_LABELS[i].en}</span>
              {banner && (
                <button onClick={() => toggleMutation.mutate({ id: banner.id, is_active: !banner.is_active })}
                  className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${banner.is_active ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>
                  {banner.is_active ? <><Eye className="w-3 h-3" />{isRTL ? 'نشط' : 'Active'}</> : <><EyeOff className="w-3 h-3" />{isRTL ? 'مخفي' : 'Hidden'}</>}
                </button>
              )}
            </div>

            {/* Image slot */}
            <label className={`relative block w-full rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${banner?.is_active ? 'border-teal-200' : 'border-dashed border-border'}`}>
              {banner?.image_url ? (
                <>
                  <img src={banner.image_url} alt={`banner ${i + 1}`} className="w-full h-auto block" />
                  <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                    <div className="bg-white/20 backdrop-blur-sm rounded-xl px-3 py-2 flex items-center gap-2 text-white text-xs font-semibold border border-white/30">
                      <Upload className="w-4 h-4" />
                      {uploading === i ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (isRTL ? 'استبدال الصورة' : 'Replace Image')}
                    </div>
                  </div>
                </>
              ) : (
                <div className="w-full h-28 bg-muted flex flex-col items-center justify-center gap-2">
                  {uploading === i ? (
                    <div className="flex items-center gap-2 text-teal-600 text-sm font-medium">
                      <div className="w-4 h-4 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
                      {isRTL ? 'جاري الرفع...' : 'Uploading...'}
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-teal-400" />
                      <span className="text-xs text-muted-foreground">{isRTL ? 'اضغط لرفع صورة' : 'Click to upload image'}</span>
                    </>
                  )}
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => handleUpload(e, i)} disabled={uploading === i} />
            </label>

            {/* Link path editor */}
            {editingSlot === i ? (
              <div className="flex gap-2">
                <Input
                  defaultValue={banner?.path || SLOT_LABELS[i].path}
                  className="h-8 rounded-xl border-teal-100 text-xs flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { handleSavePath(i, e.target.value); }
                    if (e.key === 'Escape') { setEditingSlot(null); }
                  }}
                  autoFocus
                />
                <Button size="sm" onClick={(e) => { handleSavePath(i, e.target.closest('.flex').querySelector('input').value); }}
                  className="h-8 px-2 bg-teal-500 hover:bg-teal-600 text-white rounded-xl">
                  <Save className="w-3.5 h-3.5" />
                </Button>
                <button onClick={() => setEditingSlot(null)} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-3.5 h-3.5" /></button>
              </div>
            ) : (
              <button onClick={() => banner && setEditingSlot(i)}
                className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-teal-600 transition-colors">
                <Edit2 className="w-3 h-3" />
                <span className="font-mono">{banner?.path || SLOT_LABELS[i].path}</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}