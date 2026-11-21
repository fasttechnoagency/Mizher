import React, { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { X, Loader2, ImageIcon, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';

const CATEGORIES = [
  { value: 'supplements', labelEn: 'Supplements',  labelAr: 'مكملات غذائية' },
  { value: 'devices',     labelEn: 'Devices',      labelAr: 'أجهزة طبية'    },
  { value: 'care_tools',  labelEn: 'Care Tools',   labelAr: 'أدوات عناية'   },
  { value: 'medications', labelEn: 'Medications',  labelAr: 'أدوية'         },
  { value: 'cosmetics',   labelEn: 'Cosmetics',    labelAr: 'مستحضرات'      },
  { value: 'baby_care',   labelEn: 'Baby Care',    labelAr: 'رعاية الطفل'   },
  { value: 'other',       labelEn: 'Other',        labelAr: 'أخرى'          },
];

const EMPTY = {
  name_en: '', name_ar: '', description_en: '', description_ar: '',
  image_url: '', price: '', original_price: '', category: 'supplements',
  sku: '', stock_quantity: '', unit: '', requires_prescription: false,
  doctor_recommended: false, is_active: true,
};

export default function ProductFormModal({ open, isNew, product, retailer, onClose, onSaved }) {
  const { isRTL } = useLanguage();
  const [form, setForm] = useState({ ...EMPTY });
  const [uploading, setUploading] = useState(false);
  const pf = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      pf('image_url', file_url);
    } catch {
      toast.error(isRTL ? 'فشل رفع الصورة' : 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (open) setForm(isNew ? { ...EMPTY } : { ...product });
  }, [open, isNew, product]);

  const mutation = useMutation({
    mutationFn: (data) => {
      const session = getProviderSession();
      return base44.functions.invoke('manageRetailerProduct', {
        action: isNew ? 'create' : 'update',
        retailer_id: retailer.id,
        product_id: isNew ? undefined : product.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        ...data,
      });
    },
    onSuccess: () => {
      toast.success(isRTL ? 'تم حفظ المنتج' : 'Product saved');
      onSaved();
    },
    onError: (err) => {
      toast.error(err?.response?.data?.error || (isRTL ? 'فشل حفظ المنتج' : 'Failed to save product'));
    },
  });

  const handleSave = () => {
    if (!form.name_en || !form.price) {
      toast.error(isRTL ? 'الاسم والسعر مطلوبان' : 'Name and price are required');
      return;
    }
    mutation.mutate({
      ...form,
      price: parseFloat(form.price),
      original_price: form.original_price ? parseFloat(form.original_price) : undefined,
      stock_quantity: parseInt(form.stock_quantity) || 0,
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 280 }}
            className="fixed inset-x-4 top-6 bottom-6 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[540px] bg-background rounded-2xl z-50 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-teal-100">
              <h3 className="font-bold text-base">
                {isNew ? (isRTL ? 'إضافة منتج جديد' : 'Add New Product') : (isRTL ? 'تعديل المنتج' : 'Edit Product')}
              </h3>
              <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-muted transition">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">

              {/* Image upload */}
              <div className="flex gap-3 items-start">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-teal-200 flex-shrink-0 overflow-hidden bg-teal-50 flex items-center justify-center">
                  {form.image_url
                    ? <img src={form.image_url} alt="" className="w-full h-full object-cover" />
                    : <ImageIcon className="w-5 h-5 text-teal-300" />
                  }
                </div>
                <div className="flex-1 space-y-1">
                  <Label className="text-xs">{isRTL ? 'صورة المنتج' : 'Product Image'}</Label>
                  <label className="flex items-center gap-2 h-9 px-3 rounded-xl border border-teal-100 bg-background text-sm cursor-pointer hover:bg-teal-50 transition">
                    {uploading
                      ? <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
                      : <Upload className="w-4 h-4 text-teal-500" />
                    }
                    <span className="text-muted-foreground truncate">
                      {uploading ? (isRTL ? 'جاري الرفع...' : 'Uploading...') : (form.image_url ? (isRTL ? 'تغيير الصورة' : 'Change image') : (isRTL ? 'رفع صورة' : 'Upload image'))}
                    </span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'الاسم (إنجليزي) *' : 'Name (English) *'}</Label>
                  <Input value={form.name_en} onChange={e => pf('name_en', e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'الاسم (عربي) *' : 'Name (Arabic) *'}</Label>
                  <Input value={form.name_ar} onChange={e => pf('name_ar', e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" dir="rtl" />
                </div>
              </div>

              {/* Price / Original price / Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'السعر (دينار) *' : 'Price (JOD) *'}</Label>
                  <Input type="number" min="0" step="0.01" value={form.price} onChange={e => pf('price', e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'السعر الأصلي' : 'Original Price'}</Label>
                  <Input type="number" min="0" step="0.01" value={form.original_price} onChange={e => pf('original_price', e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'الكمية' : 'Stock Qty'}</Label>
                  <Input type="number" min="0" value={form.stock_quantity} onChange={e => pf('stock_quantity', e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" />
                </div>
              </div>

              {/* Category + Unit */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'التصنيف' : 'Category'}</Label>
                  <Select value={form.category} onValueChange={v => pf('category', v)}>
                    <SelectTrigger className="h-9 rounded-xl border-teal-100 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map(c => <SelectItem key={c.value} value={c.value}>{isRTL ? c.labelAr : c.labelEn}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">{isRTL ? 'الوحدة (حبة، علبة...)' : 'Unit (tablet, box...)'}</Label>
                  <Input value={form.unit} onChange={e => pf('unit', e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" placeholder={isRTL ? 'مثال: حبة' : 'e.g. tablet'} />
                </div>
              </div>

              {/* Descriptions */}
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'الوصف (إنجليزي)' : 'Description (English)'}</Label>
                <Input value={form.description_en} onChange={e => pf('description_en', e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'الوصف (عربي)' : 'Description (Arabic)'}</Label>
                <Input value={form.description_ar} onChange={e => pf('description_ar', e.target.value)} className="h-9 rounded-xl border-teal-100 text-sm" dir="rtl" />
              </div>

              {/* Flags */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[
                  { k: 'requires_prescription', lEn: 'Requires Rx',        lAr: 'وصفة طبية' },
                  { k: 'doctor_recommended',    lEn: 'Doctor Recommended', lAr: 'موصى به'   },
                  { k: 'is_active',             lEn: 'Active & Visible',   lAr: 'نشط ومرئي' },
                ].map(f => (
                  <label key={f.k} className={`flex items-center gap-2 p-2.5 rounded-xl border-2 cursor-pointer transition-all text-xs ${
                    form[f.k] ? 'border-teal-400 bg-teal-50 text-teal-700 font-medium' : 'border-teal-100 text-muted-foreground'
                  }`}>
                    <input type="checkbox" checked={!!form[f.k]} onChange={e => pf(f.k, e.target.checked)} className="accent-teal-500" />
                    {isRTL ? f.lAr : f.lEn}
                  </label>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-teal-100 flex gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-teal-200 text-teal-700 h-10">
                {isRTL ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button onClick={handleSave} disabled={mutation.isPending} className="flex-1 bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 font-semibold">
                {mutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : (isRTL ? 'حفظ المنتج' : 'Save Product')}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}