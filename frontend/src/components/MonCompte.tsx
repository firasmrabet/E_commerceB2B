

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiLogOut } from 'react-icons/fi';
import { useAppContext } from '../context/AppContext';
import { supabase } from '../supabaseClient';
function MonCompte() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { state } = useAppContext();

  useEffect(() => {
    async function fetchUser() {
      const { data } = await supabase.auth.getUser();
      if (data?.user) setUser(data.user);
      setLoading(false);
    }
    fetchUser();
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [loading, user, navigate]);

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Chargement...</div>;
  }
  if (!user) {
    return <div className="flex justify-center items-center h-screen text-red-600">Connecte-toi pour voir ton compte.</div>;
  }

  // Historique panier
  const cartItems = state.cart;
  const totalCart = cartItems.reduce((sum, item) => sum + item.totalPrice, 0);

  // Historique devis réel
  const quoteHistory = state.quoteHistory;

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg p-4 pt-24">
  <div className="max-w-lg w-full glass-card bg-dark-card border border-white/10 rounded-2xl shadow-2xl p-8" style={{ maxWidth: '80rem' }}>
        <div className="flex items-center mb-6 justify-between">
          <div className="flex items-center">
            <FiUser className="w-10 h-10 text-electric-blue mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-white">Mon compte</h2>
              <div className="text-slate-400">{user.email}</div>
            </div>
          </div>
          <button
            className="flex items-center bg-red-500/10 text-red-400 border border-red-500/20 px-3 py-2 rounded-lg hover:bg-red-500/20 transition-all max-w-[150px] overflow-hidden"
            onClick={async () => {
              try {
                // Persist current cart to Supabase before signing out so the filled state is saved
                const currentUser = user;
                if (currentUser && state?.cart) {
                  const serializeCart = (cart) => cart.map(item => ({
                    product: {
                      id: item.product.id,
                      name: item.product.name,
                      price: item.product.price,
                      image: item.product.image || ''
                    },
                    quantity: item.quantity,
                    selectedVariations: item.selectedVariations,
                    totalPrice: item.totalPrice,
                    addedAt: item.addedAt || null
                  }));
                  const payload = { user_id: currentUser.id, items: serializeCart(state.cart) };
                  try {
                    const { error: upsertErr } = await supabase.from('carts').upsert(payload, { onConflict: 'user_id' });
                    if (upsertErr) console.error('Error upserting cart before signOut', upsertErr);
                    else console.log('Cart upserted before signOut for', currentUser.id);
                  } catch (e) {
                    console.error('Unexpected error upserting cart before signOut', e);
                  }
                }
              } finally {
                await supabase.auth.signOut();
                navigate('/login');
              }
            }}
            title="Déconnexion"
          >
            <FiLogOut className="w-5 h-5 mr-1 flex-shrink-0" />
            <span className="truncate text-sm">Déconnexion</span>
          </button>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Informations personnelles</h3>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-slate-300">
            <div>Email: {user.email}</div>
          </div>
        </div>
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-2">Produits ajoutés au panier</h3>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-slate-300">
            {cartItems.length === 0 ? (
              <div className="text-slate-500">Aucun produit dans le panier.</div>
            ) : (
              <ul className="list-disc pl-5">
                {cartItems.map((item, idx) => (
                  <li key={idx}>
                    {item.product.name} — {item.quantity} x {item.product.price} {item.product.currency} = {item.totalPrice} {item.product.currency}
                  </li>
                ))}
              </ul>
            )}
            <div className="font-bold text-electric-blue mt-4 pt-3 border-t border-white/10">Total panier: {totalCart} {cartItems[0]?.product.currency || ''}</div>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Historique des devis</h3>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            {quoteHistory.length === 0 ? (
              <div className="text-slate-500">Aucun devis pour le moment.</div>
            ) : (
              // Make the history scrollable and show total per quote
              <div className="space-y-4">
                <div className="max-h-96 overflow-auto p-1">
                  {quoteHistory.map((q, idx) => {
                    const total = Array.isArray(q.products)
                      ? q.products.reduce((s, item) => s + (item.totalPrice ?? ((item.product?.price || 0) * (item.quantity || 1))), 0)
                      : 0;
                    return (
                      <div key={idx} className="glass border border-white/10 rounded-xl p-5 mb-4">
                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/10">
                          <div className="flex items-center space-x-4">
                            <span className="font-bold text-electric-blue">Devis #{idx + 1}</span>
                            <span className="text-sm text-slate-400">{q.email}</span>
                          </div>
                          {q.date && (
                            <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">
                              {new Date(q.date).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          )}
                        </div>
                        <div className="mb-4 text-slate-300 italic">"{q.message}"</div>
                        <div>
                          <span className="font-semibold text-white">Produits demandés :</span>
                          <ul className="list-disc pl-5 mt-1">
                            {Array.isArray(q.products) && q.products.map((item, i) => (
                              <li key={i} className="text-slate-300 mt-1">
                                <span className="text-white font-medium">{item.product?.name || 'Produit inconnu'}</span> — {item.quantity} x {item.product?.price ?? ''} {item.product?.currency ?? ''} = {item.totalPrice ?? ((item.product?.price || 0) * (item.quantity || 1))} {item.product?.currency ?? ''}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="mt-4 pt-3 border-t border-white/10 text-right font-bold text-electric-blue text-lg">Totale: {total.toLocaleString()} TND</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MonCompte;
