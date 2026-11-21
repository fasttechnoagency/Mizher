import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Plus, Trash2, Save, X, Tag, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

const EMPTY_FORM = {
  code: '', discount_type: 'percentage', discount_value: '',
  min_order_amount: '', max_uses: '', expires_at: '',
};

export default function PromoCodesTab({ retailer }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  const { data: codes = [], isLoading } = useQuery({
    queryKey: ['promo-codes', retailer?.id],
    queryFn: async () => {
      const session = getProviderSession();
      const res = await base44.functions.invoke('manageRetailerPromoCode', {
        action: 'list',
        retailer_id: retailer.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
      });
      return res.data;
    },
    enabled: !!retailer?.id,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const session = getProviderSession();
      return base44.functions.invoke('manageRetailerPromoCode', {
        action: 'create',
        retailer_id: retailer.id,
        credential_id: session?.credentialId,
        session_token: session?.sessionToken,
        ...data,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(['promo-codes', retailer.id]);
      toast.success(isRTL ? 'تم إضافة الكود' : 'Promo code added');
      setShowForm(false);
      setForm(EMPTY_FORM);
    },
    onError: () => toast.error(isRTL ? 'فشل الحفظ' : 'Failed to save'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      const session = getProviderSession();
      return base44.functions.invoke('manageRetailerPromoCode', {
        action: 'delete', retailer_id: retailer.id, promo_id: id,
        credential_id: session?.credentialId, session_token: session?.sessionToken,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(['promo-codes', retailer.id]);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => {
      const session = getProviderSession();
      return base44.functions.invoke('manageRetailerPromoCode', {
        action: 'toggle', retailer_id: retailer.id, promo_id: id, is_active,
        credential_id: session?.credentialId, session_token: session?.sessionToken,
      });
    },
    onSuccess: () => qc.invalidateQueries(['promo-codes', retailer.id]),
  });

  const f = (key) => (e) => setForm(p => ({ ...p, [key]: e.target.value }));

  const handleSave = () => {
    if (!form.code.trim() || !form.discount_value) {
      toast.error(isRTL ? 'الكود وقيمة الخصم مطلوبان' : 'Code and discount value are required');
      return;
    }
    saveMutation.mutate(form);
  };

  const copyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(isRTL ? 'تم نسخ الكود' : 'Code copied');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-foreground">{isRTL ? 'أكواد الخصم' : 'Promo Codes'}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{isRTL ? 'أنشئ أكواد خصم لعملائك' : 'Create discount codes for your customers'}</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl gap-2 text-sm">
          <Plus className="w-4 h-4" />
          {isRTL ? 'كود جديد' : 'New Code'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="bg-card border border-teal-100 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">{isRTL ? 'إضافة كود خصم' : 'Add Promo Code'}</h3>
              <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'الكود *' : 'Code *'}</Label>
                <Input value={form.code} onChange={f('code')} placeholder="SAVE20"
                  className="h-9 rounded-xl border-teal-100 text-sm font-mono uppercase" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'نوع الخصم' : 'Discount Type'}</Label>
                <Select value={form.discount_type} onValueChange={v => setForm(p => ({ ...p, discount_type: v }))}>
                  <SelectTrigger className="h-9 rounded-xl border-teal-100 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">{isRTL ? 'نسبة مئوية (%)' : 'Percentage (%)'}</SelectItem>
                    <SelectItem value="fixed">{isRTL ? 'مبلغ ثابت (JOD)' : 'Fixed Amount (JOD)'}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'قيمة الخصم *' : 'Discount Value *'}</Label>
                <Input type="number" value={form.discount_value} onChange={f('discount_value')}
                  placeholder={form.discount_type === 'percentage' ? '20' : '5'}
                  className="h-9 rounded-xl border-teal-100 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'الحد الأدنى للطلب (JOD)' : 'Min Order Amount (JOD)'}</Label>
                <Input type="number" value={form.min_order_amount} onChange={f('min_order_amount')}
                  placeholder="0" className="h-9 rounded-xl border-teal-100 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'أقصى استخدامات (0 = غير محدود)' : 'Max Uses (0 = unlimited)'}</Label>
                <Input type="number" value={form.max_uses} onChange={f('max_uses')}
                  placeholder="0" className="h-9 rounded-xl border-teal-100 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}</Label>
                <Input type="date" value={form.expires_at} onChange={f('expires_at')}
                  className="h-9 rounded-xl border-teal-100 text-sm" />
              </div>
            </div>

            <Button onClick={handleSave} disabled={saveMutation.isPending}
              className="w-full bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-10 font-semibold gap-2">
              <Save className="w-4 h-4" />
              {isRTL ? 'حفظ الكود' : 'Save Code'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground text-sm">{isRTL ? 'جاري التحميل...' : 'Loading...'}</div>
      ) : codes.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-2xl">
          <Tag className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-30" />
          <p className="text-sm text-muted-foreground">{isRTL ? 'لا توجد أكواد خصم بعد' : 'No promo codes yet'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {codes.map(c => {
            const isExpired = c.expires_at && new Date(c.expires_at) < new Date();
            const discountLabel = c.discount_type === 'percentage' ? `${c.discount_value}%` : `${c.discount_value} JOD`;
            return (
              <div key={c.id} className={`bg-card border rounded-2xl p-4 flex items-center gap-4 transition-all ${c.is_active && !isExpired ? 'border-teal-100' : 'border-border opacity-60'}`}>
                <div className="flex-shrink-0 bg-teal-50 border border-dashed border-teal-200 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="font-mono font-bold text-teal-700 text-sm tracking-widest">{c.code}</span>
                  <button onClick={() => copyCode(c.code)} className="text-teal-400 hover:text-teal-600 transition-colors">
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-teal-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{discountLabel} {isRTL ? 'خصم' : 'off'}</span>
                    {c.min_order_amount > 0 && <span className="text-xs text-muted-foreground">{isRTL ? `حد أدنى: ${c.min_order_amount} JOD` : `Min: ${c.min_order_amount} JOD`}</span>}
                    {isExpired && <span className="text-xs text-red-500 font-medium">{isRTL ? 'منتهي' : 'Expired'}</span>}
                    {c.expires_at && !isExpired && <span className="text-xs text-muted-foreground">{isRTL ? `ينتهي: ${c.expires_at}` : `Exp: ${c.expires_at}`}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isRTL ? `${c.uses_count} استخدام` : `${c.uses_count} uses`}{c.max_uses > 0 ? ` / ${c.max_uses}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => toggleMutation.mutate({ id: c.id, is_active: !c.is_active })}
                    className="text-muted-foreground hover:text-teal-600 transition-colors">
                    {c.is_active ? <ToggleRight className="w-5 h-5 text-teal-500" /> : <ToggleLeft className="w-5 h-5" />}
                  </button>
                  <button onClick={() => deleteMutation.mutate(c.id)} className="text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}