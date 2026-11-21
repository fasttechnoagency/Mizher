import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProviderSession } from '@/lib/useProviderSession';
import { useLanguage } from '@/lib/i18n';
import { ShoppingBag, ChevronDown, ChevronUp, Loader2, Package } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { toast } from 'sonner';

const STATUS_STYLES = {
  pending:    'bg-amber-100 text-amber-700',
  confirmed:  'bg-blue-100 text-blue-700',
  processing: 'bg-indigo-100 text-indigo-700',
  shipped:    'bg-teal-100 text-teal-700',
  delivered:  'bg-emerald-100 text-emerald-700',
  cancelled:  'bg-red-100 text-red-600',
};
const STATUS_LABELS_AR = { pending:'قيد الانتظار', confirmed:'مؤكد', processing:'قيد المعالجة', shipped:'تم الشحن', delivered:'تم التوصيل', cancelled:'ملغي' };

export default function OrdersTab({ retailer }) {
  const { isRTL } = useLanguage();
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(null);

  // Load orders that contain this retailer's products
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['retailer-orders', retailer.id],
    queryFn: () => base44.entities.Order.list('-created_date', 50),
    select: (all) => all.filter(o =>
      Array.isArray(o.items) && o.items.some(i => i.retailer_id === retailer.id)
    ),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => {
      const session = getProviderSession();
      return base44.functions.invoke('updateRetailerOrderStatus', {
        retailer_id: retailer.id, order_id: id, status,
        credential_id: session?.credentialId, session_token: session?.sessionToken,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries(['retailer-orders', retailer.id]);
      toast.success(isRTL ? 'تم تحديث حالة الطلب' : 'Order status updated');
    },
    onError: () => toast.error(isRTL ? 'فشل التحديث' : 'Failed to update'),
  });

  if (isLoading) return <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 text-teal-500 animate-spin" /></div>;

  if (orders.length === 0) {
    return (
      <div className="bg-card rounded-2xl border border-teal-100 p-16 flex flex-col items-center gap-3 text-muted-foreground">
        <ShoppingBag className="w-10 h-10 opacity-20" />
        <p className="text-sm">{isRTL ? 'لا توجد طلبات بعد' : 'No orders yet'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">{isRTL ? `${orders.length} طلب` : `${orders.length} orders`}</p>
      {orders.map(order => {
        const myItems = order.items?.filter(i => i.retailer_id === retailer.id) || [];
        const myTotal = myItems.reduce((s, i) => s + (i.subtotal || 0), 0);
        const isOpen = expanded === order.id;

        return (
          <div key={order.id} className="bg-card rounded-2xl border border-teal-100 overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : order.id)}
              className="w-full flex items-center gap-3 p-4 hover:bg-teal-50/30 transition text-start"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm">#{order.id?.slice(-6).toUpperCase()}</span>
                  <Badge className={`text-[10px] border-0 ${STATUS_STYLES[order.status] || 'bg-muted text-muted-foreground'}`}>
                    {isRTL ? STATUS_LABELS_AR[order.status] : order.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {order.customer_name} · {myItems.length} {isRTL ? 'منتج' : 'items'} · {myTotal.toFixed(2)} {isRTL ? 'د.أ' : 'JOD'}
                </p>
                {order.created_date && (
                  <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                    {format(new Date(order.created_date), 'dd MMM yyyy, HH:mm')}
                  </p>
                )}
              </div>
              {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </button>

            {isOpen && (
              <div className="border-t border-teal-50 px-4 pb-4 pt-3 space-y-3">
                {/* Customer info */}
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div><span className="font-medium text-foreground">{isRTL ? 'العميل: ' : 'Customer: '}</span>{order.customer_name}</div>
                  <div><span className="font-medium text-foreground">{isRTL ? 'الهاتف: ' : 'Phone: '}</span>{order.customer_phone}</div>
                  <div className="col-span-2"><span className="font-medium text-foreground">{isRTL ? 'العنوان: ' : 'Address: '}</span>{order.delivery_address}{order.city ? `, ${order.city}` : ''}</div>
                </div>

                {/* My items in this order */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground">{isRTL ? 'منتجاتك في هذا الطلب:' : 'Your items in this order:'}</p>
                  {myItems.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-teal-50/50 rounded-lg px-3 py-2 text-xs">
                      <span className="font-medium">{isRTL ? item.product_name_ar : item.product_name_en}</span>
                      <span className="text-muted-foreground">×{item.quantity} = <span className="font-semibold text-teal-700">{item.subtotal?.toFixed(2)} {isRTL ? 'د.أ' : 'JOD'}</span></span>
                    </div>
                  ))}
                </div>

                {/* Status update */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium">{isRTL ? 'تحديث الحالة:' : 'Update Status:'}</span>
                  <Select value={order.status} onValueChange={s => updateStatusMutation.mutate({ id: order.id, status: s })}>
                    <SelectTrigger className="h-8 flex-1 rounded-xl border-teal-100 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(STATUS_STYLES).map(s => (
                        <SelectItem key={s} value={s} className="text-xs">
                          {isRTL ? STATUS_LABELS_AR[s] : s.charAt(0).toUpperCase() + s.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}