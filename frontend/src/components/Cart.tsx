import { X, Minus, Plus, Trash2, ShoppingBag, ArrowRight, Zap } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cart() {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  const totalPrice = (state.cart as any[]).reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0);

  const updateQuantity = (index: number, newQuantity: number, variations: any) => {
    const item = state.cart[index];
    if (!item) return;
    if (newQuantity <= 0) {
      dispatch({ type: 'REMOVE_FROM_CART', payload: { productId: item.product.id, variations: item.selectedVariations } });
    } else {
      dispatch({ type: 'UPDATE_CART_ITEM', payload: { productId: item.product.id, quantity: newQuantity, variations } });
    }
  };

  const handleRequestQuote = () => {
    if (!state?.userId) { navigate('/login'); return; }
    if (state.cart.length > 0) dispatch({ type: 'TOGGLE_QUOTE_MODAL', payload: null });
  };

  return (
    <AnimatePresence>
      {state.isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => dispatch({ type: 'TOGGLE_CART' })}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-50 flex flex-col"
            style={{ background: 'var(--bg-secondary)', borderLeft: '1px solid rgba(59,130,246,0.15)' }}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-electric-blue/20 border border-electric-blue/30 flex items-center justify-center">
                  <ShoppingBag className="w-4 h-4 text-electric-blue" />
                </div>
                <div>
                  <h2 className="text-white font-bold">Mon Panier</h2>
                  <p className="text-slate-500 text-xs">{(state.cart as any[]).reduce((s: number, i: any) => s + (i.quantity || 0), 0)} article(s)</p>
                </div>
              </div>
              <button
                onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            {state.cart.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
                <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-5">
                  <ShoppingBag className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">Votre panier est vide</h3>
                <p className="text-slate-500 text-sm mb-6">Ajoutez des produits depuis notre catalogue pour demander un devis.</p>
                <button
                  onClick={() => dispatch({ type: 'TOGGLE_CART' })}
                  className="btn-primary text-sm"
                >
                  Explorer le catalogue
                </button>
              </div>
            ) : (
              <>
                {/* Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                  <AnimatePresence initial={false}>
                    {(state.cart as any[]).map((item: any, index: number) => (
                      <motion.div
                        key={`${item.product.id}-${JSON.stringify(item.selectedVariations)}`}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                        transition={{ duration: 0.2 }}
                        className="glass-card rounded-xl p-4"
                      >
                        <div className="flex gap-3">
                          <div className="w-16 h-16 rounded-lg bg-dark-bg flex items-center justify-center flex-shrink-0 overflow-hidden">
                            <img
                              src={item.product.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&q=70'}
                              alt={item.product.name}
                              className="w-full h-full object-contain p-2"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=200&q=70'; }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-white text-sm font-semibold truncate">{item.product.name}</h3>

                            {Object.keys(item.selectedVariations || {}).length > 0 && (
                              <div className="mt-1">
                                {Object.entries(item.selectedVariations).map(([k, v]) => (
                                  <span key={k} className="text-xs text-slate-500">{k}: {String(v)} </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center justify-between mt-2">
                              {/* Quantity controls */}
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => updateQuantity(index, item.quantity - 1, item.selectedVariations)}
                                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="w-8 text-center text-white text-sm font-semibold">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(index, item.quantity + 1, item.selectedVariations)}
                                  className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className="text-electric-blue font-bold text-sm">{item.totalPrice.toLocaleString()} TND</span>
                                <button
                                  onClick={() => dispatch({ type: 'REMOVE_FROM_CART', payload: { productId: item.product.id, variations: item.selectedVariations } })}
                                  className="w-6 h-6 rounded text-slate-600 hover:text-red-400 transition-colors flex items-center justify-center"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-white/5">
                  {/* Total */}
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                    <span className="text-slate-400">Total estimé</span>
                    <span className="text-2xl font-black gradient-text">
                      {totalPrice.toLocaleString()} TND
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={handleRequestQuote}
                      className="btn-orange w-full flex items-center justify-center gap-2"
                    >
                      Demander un devis
                      <ArrowRight className="w-4 h-4" />
                    </motion.button>
                    <button
                      onClick={() => dispatch({ type: 'EXPLICIT_CLEAR_CART' })}
                      className="w-full py-2.5 text-sm text-slate-500 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/5"
                    >
                      Vider le panier
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-center gap-2 text-slate-600 text-xs">
                    <Zap className="w-3 h-3" />
                    Réponse garantie sous 24h
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
