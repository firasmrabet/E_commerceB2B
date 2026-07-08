import { useState, useMemo } from 'react';
import { Filter, Grid, List, X, Search, Sliders } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useDataContext } from '../context/DataContext';
import ProductCard from './ProductCard';
import { Product } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface ProductListingProps {
  onProductClick: (product: Product) => void;
}

export default function ProductListing({ onProductClick }: ProductListingProps) {
  const { state, dispatch } = useAppContext();
  const { categories, products } = useDataContext();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState({ priceMin: 0, priceMax: 50000 });

  const currentCategory = categories.find(c => c.id === state.selectedCategory);

  const resolveProductCategoryId = (prod: any) => {
    if (!prod) return null;
    if (prod.category_id) return prod.category_id;
    const rawCat = prod.category;
    if (!rawCat && rawCat !== 0) return null;
    if (typeof rawCat === 'object' && rawCat !== null) {
      if (rawCat.id) return rawCat.id;
      if (rawCat.name) {
        const byName = categories.find(c => c.name.toLowerCase() === String(rawCat.name).toLowerCase());
        if (byName) return byName.id;
      }
      return null;
    }
    const asString = String(rawCat).trim();
    if (!asString) return null;
    const matchById = categories.find(c => c.id === asString);
    if (matchById) return matchById.id;
    const matchByName = categories.find(c => c.name.toLowerCase() === asString.toLowerCase());
    if (matchByName) return matchByName.id;
    return asString;
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;
    const selectedCatId = state.selectedCategory;
    if (selectedCatId) {
      filtered = filtered.filter(product => {
        const prod: any = product as any;
        if (prod.category_id && prod.category_id === selectedCatId) return true;
        if (prod.category && String(prod.category) === selectedCatId) return true;
        if (prod.category) {
          const maybeByName = categories.find(c => c.name.toLowerCase() === String(prod.category).toLowerCase());
          if (maybeByName && maybeByName.id === selectedCatId) return true;
        }
        return resolveProductCategoryId(prod) === selectedCatId;
      });
    }
    if (state.searchQuery) {
      const q = state.searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(q) ||
        (product.description || '').toLowerCase().includes(q) ||
        (product.brand || '').toLowerCase().includes(q) ||
        (product.tags || []).some((tag: string) => tag.toLowerCase().includes(q))
      );
    }
    filtered = filtered.filter(p => p.price >= localFilters.priceMin && p.price <= localFilters.priceMax);
    return filtered;
  }, [products, categories, state.selectedCategory, state.searchQuery, localFilters]);

  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc': return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc': return sorted.sort((a, b) => b.price - a.price);
      case 'rating': return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      default: return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [filteredProducts, sortBy]);

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen py-10" style={{ background: 'var(--bg-primary)' }}>
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-black text-white">
                {currentCategory ? currentCategory.name : state.searchQuery ? `"${state.searchQuery}"` : 'Tous les produits'}
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
                {filteredProducts.length} produit{filteredProducts.length !== 1 ? 's' : ''} trouvé{filteredProducts.length !== 1 ? 's' : ''}
                {state.searchQuery && ` pour "${state.searchQuery}"`}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* View toggle */}
              <div className="flex glass rounded-lg overflow-hidden border border-white/10 p-0.5 gap-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-all ${viewMode === 'grid' ? 'bg-electric-blue/20 text-electric-blue' : 'text-slate-500 hover:text-white'}`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-all ${viewMode === 'list' ? 'bg-electric-blue/20 text-electric-blue' : 'text-slate-500 hover:text-white'}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="admin-input text-sm py-2"
                style={{ minWidth: '160px' }}
              >
                <option value="name">Trier par nom</option>
                <option value="price-asc">Prix croissant</option>
                <option value="price-desc">Prix décroissant</option>
                <option value="rating">Meilleures notes</option>
              </select>

              {/* Filter button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${showFilters ? 'bg-electric-blue/20 border-electric-blue/40 text-electric-blue' : 'glass border-white/10 text-slate-400 hover:text-white'}`}
              >
                <Sliders className="w-4 h-4" />
                Filtres
              </button>
            </div>
          </div>

          {/* Active filters chips */}
          {(state.searchQuery || state.selectedCategory) && (
            <div className="flex flex-wrap items-center gap-2">
              {state.searchQuery && (
                <span className="badge badge-blue flex items-center gap-1.5">
                  <Search className="w-3 h-3" />
                  "{state.searchQuery}"
                  <button onClick={() => dispatch({ type: 'SET_SEARCH_QUERY', payload: '' })} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {state.selectedCategory && (
                <span className="badge badge-blue flex items-center gap-1.5">
                  {currentCategory?.name}
                  <button onClick={() => dispatch({ type: 'SET_CATEGORY', payload: null })} className="hover:text-white">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, x: -20, width: 0 }}
                animate={{ opacity: 1, x: 0, width: 280 }}
                exit={{ opacity: 0, x: -20, width: 0 }}
                className="flex-shrink-0"
              >
                <div className="glass-card rounded-2xl p-6 sticky top-24" style={{ width: 280 }}>
                  <h3 className="text-white font-bold mb-5 flex items-center gap-2">
                    <Filter className="w-4 h-4 text-electric-blue" /> Filtres
                  </h3>

                  <div className="mb-6">
                    <h4 className="text-slate-400 text-sm font-semibold mb-3 uppercase tracking-wider">Prix (TND)</h4>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <label className="text-slate-600 text-xs mb-1 block">Min</label>
                        <input
                          type="number"
                          value={localFilters.priceMin}
                          onChange={(e) => setLocalFilters(p => ({ ...p, priceMin: Number(e.target.value) }))}
                          className="admin-input text-sm py-1.5 w-full"
                        />
                      </div>
                      <div>
                        <label className="text-slate-600 text-xs mb-1 block">Max</label>
                        <input
                          type="number"
                          value={localFilters.priceMax}
                          onChange={(e) => setLocalFilters(p => ({ ...p, priceMax: Number(e.target.value) }))}
                          className="admin-input text-sm py-1.5 w-full"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50000"
                      step="100"
                      value={localFilters.priceMax}
                      onChange={(e) => setLocalFilters(p => ({ ...p, priceMax: Number(e.target.value) }))}
                      className="w-full accent-blue-500"
                    />
                    <div className="flex justify-between text-xs text-slate-600 mt-1">
                      <span>0 TND</span>
                      <span>{localFilters.priceMax.toLocaleString()} TND</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setLocalFilters({ priceMin: 0, priceMax: 50000 })}
                    className="w-full text-sm text-slate-500 hover:text-electric-blue transition-colors py-2 border border-white/10 rounded-lg hover:border-electric-blue/30"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products */}
          <div className="flex-1">
            {sortedProducts.length === 0 ? (
              <div className="text-center py-24">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-white text-xl font-bold mb-2">Aucun produit trouvé</h3>
                <p className="text-slate-500 mb-6">Essayez de modifier vos critères de recherche</p>
                <button
                  onClick={() => {
                    dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
                    dispatch({ type: 'SET_CATEGORY', payload: null });
                    setLocalFilters({ priceMin: 0, priceMax: 50000 });
                  }}
                  className="btn-primary text-sm"
                >
                  Réinitialiser tout
                </button>
              </div>
            ) : (
              <motion.div
                className={viewMode === 'grid'
                  ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5'
                  : 'space-y-4'}
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                key={state.selectedCategory + state.searchQuery + sortBy}
              >
                {sortedProducts.map(product => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} onProductClick={onProductClick} />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
