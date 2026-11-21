import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { Plus, Pencil, Trash2, Package, Search, ToggleLeft, ToggleRight, Loader2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import ProductFormModal from './ProductFormModal';

const PRODUCT_CATEGORIES = [
  { value: 'supplements', labelEn: 'Supplements', labelAr: 'مكملات' },
  { value: 'devices',     labelEn: 'Devices',     labelAr: 'أجهزة'  },
  { value: 'care_tools',  labelEn: 'Care Tools',  labelAr: 'عناية'  },
  { value: 'medications', labelEn: 'Medications', labelAr: 'أدوية'  },
  { value: 'cosmetics',   labelEn: 'Cosmetics',   labelAr: 'مستحضرات'},
  { value: 'baby_care',   labelEn: 'Baby Care',   labelAr: 'رعاية طفل'},
  { value: 'other',       labelEn: 'Other',       labelAr: 'أخرى'   },
];

export default function ProductsTab({ retailer }) {
  const { isRTL, lang } = useLanguage();
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // null | 'new' | product
  const [inlinePrice, setInlinePrice] = useState({}); // { [id]: value }

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['retailer-products', retailer.id],
    queryFn: () => base44.entities.RetailerProduct.filter({ retailer_id: retailer.id }),
  });

  const session = getProviderSession();

  const toggleMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.functions.invoke('manageRetailerProduct', {
      action: 'update', retailer_id: retailer.id, product_id: id, is_active,
      credential_id: session?.credentialId, session_token: session?.sessionToken,
    }),
    onSuccess: () => qc.invalidateQueries(['retailer-products', retailer.id]),
  });

  const priceMutation = useMutation({
    mutationFn: ({ id, price }) => base44.functions.invoke('manageRetailerProduct', {
      action: 'update', retailer_id: retailer.id, product_id: id, price,
      credential_id: session?.credentialId, session_token: session?.sessionToken,
    }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries(['retailer-products', retailer.id]);
      setInlinePrice(p => { const n = { ...p }; delete n[id]; return n; });
      toast.success(isRTL ? 'تم تحديث السعر' : 'Price updated');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.functions.invoke('manageRetailerProduct', {
      action: 'delete', retailer_id: retailer.id, product_id: id,
      credential_id: session?.credentialId, session_token: session?.sessionToken,
    }),
    onSuccess: () => {
      qc.invalidateQueries(['retailer-products', retailer.id]);
      toast.success(isRTL ? 'تم الحذف' : 'Deleted');
    },
  });

  const filtered = products.filter(p => {
    if (!search) return true;
    const q = search.toLowerCase();
    return p.name_en?.toLowerCase().includes(q) || p.name_ar?.includes(q);
  });

  const getCat = (val) => PRODUCT_CATEGORIES.find(c => c.value === val)?.[lang === 'ar' ? 'labelAr' : 'labelEn'];

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={isRTL ? 'ابحث في منتجاتك...' : 'Search your products...'}
            className={`w-full h-9 ${isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'} bg-background rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20`} />
        </div>
        <Button onClick={() => setModal('new')} className="bg-teal-500 hover:bg-teal-600 text-white rounded-xl h-9 gap-1.5 text-sm">
          <Plus className="w-4 h-4" />
          {isRTL ? 'منتج جديد' : 'Add Product'}
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { v: products.length,                                  lEn: 'Total',        lAr: 'الإجمالي'   },
          { v: products.filter(p => p.is_active).length,        lEn: 'Active',       lAr: 'نشطة'       },
          { v: products.filter(p => !p.stock_quantity).length,  lEn: 'Out of Stock', lAr: 'نفذ مخزونه' },
        ].map((s, i) => (
          <div key={i} className="bg-card rounded-xl border border-teal-100 p-3 text-center">
            <p className="text-xl font-bold text-teal-700">{s.v}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{isRTL ? s.lAr : s.lEn}</p>
          </div>
        ))}
      </div>

      {/* Product list */}
      <div className="bg-card rounded-2xl border border-teal-100 overflow-hidden">
        {isLoading ? (
          <div className="p-10 flex justify-center"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 flex flex-col items-center gap-3 text-muted-foreground">
            <Package className="w-10 h-10 opacity-20" />
            <p className="text-sm">{isRTL ? 'لا توجد منتجات' : 'No products yet'}</p>
            <Button onClick={() => setModal('new')} variant="outline" className="rounded-xl border-teal-200 text-teal-600 text-sm">
              {isRTL ? 'أضف منتجك الأول' : 'Add your first product'}
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-teal-50">
            {filtered.map(p => {
              const pName = lang === 'ar' ? p.name_ar : p.name_en;
              const editingPrice = inlinePrice[p.id] !== undefined;
              return (
                <motion.div key={p.id} layout className="flex items-center gap-3 p-3 hover:bg-teal-50/30 transition group">
                  {/* Image */}
                  <img src={p.image_url || 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=60&q=80'} alt=""
                    className="w-11 h-11 rounded-xl object-cover flex-shrink-0 bg-teal-50" />

                  {/* Name + cat */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{pName}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] bg-teal-50 text-teal-700 rounded-md px-1.5 py-0.5">{getCat(p.category)}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {isRTL ? `مخزون: ${p.stock_quantity ?? 0}` : `Stock: ${p.stock_quantity ?? 0}`}
                      </span>
                    </div>
                  </div>

                  {/* Inline price edit */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {editingPrice ? (
                      <>
                        <Input
                          type="number"
                          value={inlinePrice[p.id]}
                          onChange={e => setInlinePrice(prev => ({ ...prev, [p.id]: e.target.value }))}
                          className="h-7 w-20 rounded-lg border-teal-300 text-xs text-center p-1"
                          autoFocus
                        />
                        <button
                          onClick={() => priceMutation.mutate({ id: p.id, price: parseFloat(inlinePrice[p.id]) })}
                          disabled={priceMutation.isPending}
                          className="text-[10px] font-semibold text-teal-600 hover:text-teal-700 px-1"
                        >
                          {priceMutation.isPending ? '...' : (isRTL ? 'حفظ' : 'Save')}
                        </button>
                        <button onClick={() => setInlinePrice(prev => { const n={...prev}; delete n[p.id]; return n; })}
                          className="text-[10px] text-muted-foreground hover:text-red-500 px-1">✕</button>
                      </>
                    ) : (
                      <button
                        onClick={() => setInlinePrice(prev => ({ ...prev, [p.id]: p.price }))}
                        className="flex items-center gap-1 text-sm font-bold text-teal-700 hover:text-teal-500 transition group/price"
                        title={isRTL ? 'انقر لتعديل السعر' : 'Click to edit price'}
                      >
                        {p.price} <span className="text-xs font-normal">{isRTL ? 'د.أ' : 'JOD'}</span>
                        <DollarSign className="w-3 h-3 opacity-0 group-hover/price:opacity-100 text-teal-400 transition" />
                      </button>
                    )}
                  </div>

                  {/* Active toggle */}
                  <button
                    onClick={() => toggleMutation.mutate({ id: p.id, is_active: !p.is_active })}
                    title={p.is_active ? (isRTL ? 'إخفاء المنتج' : 'Hide product') : (isRTL ? 'إظهار المنتج' : 'Show product')}
                    className="flex-shrink-0"
                  >
                    {p.is_active
                      ? <ToggleRight className="w-6 h-6 text-teal-500" />
                      : <ToggleLeft className="w-6 h-6 text-muted-foreground" />
                    }
                  </button>

                  {/* Actions */}
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
                    <button onClick={() => setModal(p)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-teal-100 text-teal-600">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => deleteMutation.mutate(p.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 text-muted-foreground hover:text-red-500">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal */}
      <ProductFormModal
        open={!!modal}
        isNew={modal === 'new'}
        product={modal !== 'new' ? modal : null}
        retailer={retailer}
        onClose={() => setModal(null)}
        onSaved={() => { setModal(null); qc.invalidateQueries(['retailer-products', retailer.id]); }}
      />
    </div>
  );
}