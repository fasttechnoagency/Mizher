import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/i18n';
import { useCart } from '@/lib/CartContext';
import { Search, ShoppingCart, Store, SlidersHorizontal, X } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RetailerProductCard from '@/components/marketplace/RetailerProductCard';
import CartDrawer from '@/components/marketplace/CartDrawer';
import { Link } from '@/lib/router-compat';
import { motion } from 'framer-motion';
import SectionScan from '@/components/reveal/SectionScan';
import { useScrollReveal } from '@/lib/useScrollReveal';
import { formatPriceJOD } from '@/lib/currency';

const CATEGORIES = [
  { key: 'all',          labelEn: 'All',          labelAr: 'الكل',           labelAz: 'Hamısı'          },
  { key: 'supplements',  labelEn: 'Supplements',  labelAr: 'مكملات غذائية', labelAz: 'Qida Əlavələri'  },
  { key: 'devices',      labelEn: 'Devices',      labelAr: 'أجهزة طبية',    labelAz: 'Cihazlar'        },
  { key: 'care_tools',   labelEn: 'Care Tools',   labelAr: 'أدوات عناية',   labelAz: 'Qayğı Alətləri' },
  { key: 'medications',  labelEn: 'Medications',  labelAr: 'أدوية',          labelAz: 'Dərmanlar'       },
  { key: 'cosmetics',    labelEn: 'Cosmetics',    labelAr: 'مستحضرات',       labelAz: 'Kosmetika'       },
  { key: 'baby_care',    labelEn: 'Baby Care',    labelAr: 'رعاية الطفل',   labelAz: 'Uşaq Qayğısı'   },
];

export default function Marketplace() {
  const { lang, isRTL, t } = useLanguage();
  const { count, total } = useCart();
  const [cartOpen, setCartOpen]     = useState(false);
  const [category, setCategory]     = useState('all');
  const [search, setSearch]         = useState('');
  const [retailerFilter, setRetailerFilter] = useState('all');
  const [sortBy, setSortBy]         = useState('default');
  const gridRef = useScrollReveal({ soft: true });

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['retailer-products-all'],
    queryFn: () => base44.entities.RetailerProduct.filter({ is_active: true }),
  });

  const { data: retailers = [] } = useQuery({
    queryKey: ['retailers-approved'],
    queryFn: () => base44.entities.Retailer.filter({ status: 'approved' }),
  });

  const filtered = useMemo(() => {
    let result = [...products];
    if (category !== 'all') result = result.filter(p => p.category === category);
    if (retailerFilter !== 'all') result = result.filter(p => p.retailer_id === retailerFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name_en?.toLowerCase().includes(q) ||
        p.name_ar?.includes(q) ||
        p.description_en?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'price_asc')  result.sort((a, b) => a.price - b.price);
    if (sortBy === 'price_desc') result.sort((a, b) => b.price - a.price);
    if (sortBy === 'rating')     result.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    return result;
  }, [products, category, retailerFilter, search, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
      <SectionScan />

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {t('medicalMarketplace')}
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {t('marketplaceDesc')}
          </p>
        </motion.div>

        {/* Cart Button */}
        <button
          id="cart-page-btn"
          onClick={() => setCartOpen(true)}
          className="relative flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-500/20"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="hidden md:block text-sm font-medium">
            {t('cart')}
            {total > 0 && ` · ${formatPriceJOD(total, lang)}`}
          </span>
          {count > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {count}
            </span>
          )}
        </button>
      </div>

      {/* Retailer Register Banner */}
      <Link to="/retailer-console">
        <div className="mb-4 bg-gradient-to-r from-teal-600 to-teal-400 rounded-2xl p-4 flex items-center justify-between group hover:shadow-lg transition-all">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-white/90" />
            <div>
              <p className="text-white font-semibold text-sm">
                {t('ownPharmacy')}
              </p>
              <p className="text-teal-100 text-xs">
                {t('ownPharmacyDesc')}
              </p>
            </div>
          </div>
          <div className="text-white/80 group-hover:translate-x-1 transition-transform">→</div>
        </div>
      </Link>

      {/* Search + Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-muted-foreground`} />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={t('searchProducts') + '...'}
            className={`w-full h-10 ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} bg-white rounded-xl border border-teal-100 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20`}
          />
          {search && (
            <button onClick={() => setSearch('')} className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'}`}>
              <X className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          )}
        </div>

        {retailers.length > 0 && (
          <Select value={retailerFilter} onValueChange={setRetailerFilter}>
            <SelectTrigger className="h-10 w-full md:w-48 rounded-xl border-teal-100 text-sm">
              <Store className="w-4 h-4 text-teal-500 me-1" />
              <SelectValue placeholder={t('allStores')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('allStores')}</SelectItem>
              {retailers.map(r => (
                <SelectItem key={r.id} value={r.id}>{lang === 'ar' ? r.name_ar : r.name_en}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="h-10 w-full md:w-40 rounded-xl border-teal-100 text-sm">
            <SlidersHorizontal className="w-4 h-4 text-teal-500 me-1" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="default">{t('default')}</SelectItem>
            <SelectItem value="price_asc">{t('priceLowHigh')}</SelectItem>
            <SelectItem value="price_desc">{t('priceHighLow')}</SelectItem>
            <SelectItem value="rating">{t('topRated')}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto mb-5 -mx-1 px-1">
        <div className="flex gap-2 w-max">
          {CATEGORIES.map(c => (
            <button key={c.key}
              onClick={() => setCategory(c.key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                category === c.key
                  ? 'bg-teal-500 text-white border-teal-500 shadow-sm shadow-teal-500/30'
                  : 'bg-card text-muted-foreground border-teal-100 hover:border-teal-300'
              }`}
            >
              {lang === 'ar' ? c.labelAr : lang === 'az' ? c.labelAz : c.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-xs text-muted-foreground mb-3">
        {filtered.length} {t('productsCount')}
        </p>
      )}

      {/* Products Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bg-card rounded-2xl h-64 animate-pulse border border-teal-500/5" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <ShoppingCart className="w-12 h-12 opacity-20 mx-auto mb-3" />
          <p className="text-sm">{t('noProducts')}</p>
        </div>
      ) : (
        <div ref={gridRef} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((product, i) => (
            <RetailerProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}

      {/* Cart Drawer */}
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}