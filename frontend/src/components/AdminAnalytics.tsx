import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { TrendingUp, Package, DollarSign, FileText, BarChart3, AlertTriangle, Star, Activity, Zap } from 'lucide-react';

interface QuoteRecord {
  id: string;
  created_at: string;
  cart_items?: CartItemRecord[];
  status?: string;
  total?: number;
}

interface CartItemRecord {
  product: { id: string; name: string; price: number };
  quantity: number;
  totalPrice: number;
}

interface ProductStat {
  id: string;
  name: string;
  count: number;
  revenue: number;
  avgPrice: number;
}

function MiniBar({ value, max, color = '#3b82f6' }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

export default function AdminAnalytics() {
  const [quotes, setQuotes] = useState<QuoteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase
        .from('quotes')
        .select('quotes');
        
      if (err) throw err;
      
      let allQuotes: QuoteRecord[] = [];
      
      // La table 'quotes' contient des lignes avec un tableau JSON 'quotes' pour chaque utilisateur
      if (data) {
        data.forEach(row => {
          const userQuotes = Array.isArray(row.quotes) ? row.quotes : [];
          userQuotes.forEach((q: any, index: number) => {
            allQuotes.push({
              id: `${Math.random().toString(36).substr(2, 9)}_${index}`,
              created_at: q.date || new Date().toISOString(),
              cart_items: q.products || [],
              status: q.status || 'pending',
              total: q.products?.reduce((sum: number, item: any) => sum + (item.totalPrice || 0), 0) || 0
            });
          });
        });
      }
      
      // Trier par date décroissante
      allQuotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setQuotes(allQuotes);
    } catch (e: any) {
      setError(e.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Compute stats
  const totalQuotes = quotes.length;
  const totalRevenue = quotes.reduce((sum, q) => {
    const items: CartItemRecord[] = Array.isArray(q.cart_items) ? q.cart_items : [];
    return sum + items.reduce((s, item) => s + (item.totalPrice || 0), 0);
  }, 0);

  const productStats: Record<string, ProductStat> = {};
  quotes.forEach(q => {
    const items: CartItemRecord[] = Array.isArray(q.cart_items) ? q.cart_items : [];
    items.forEach(item => {
      if (!item.product) return;
      const pid = item.product.id || item.product.name;
      if (!productStats[pid]) {
        productStats[pid] = { id: pid, name: item.product.name, count: 0, revenue: 0, avgPrice: item.product.price || 0 };
      }
      productStats[pid].count += item.quantity || 1;
      productStats[pid].revenue += item.totalPrice || 0;
    });
  });
  const topProducts = Object.values(productStats).sort((a, b) => b.count - a.count).slice(0, 10);
  const maxCount = topProducts[0]?.count || 1;
  const maxRevenue = topProducts.reduce((m, p) => Math.max(m, p.revenue), 1);

  // Monthly trend
  const monthlyData: Record<string, { quotes: number; revenue: number }> = {};
  quotes.forEach(q => {
    const month = new Date(q.created_at).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
    if (!monthlyData[month]) monthlyData[month] = { quotes: 0, revenue: 0 };
    monthlyData[month].quotes += 1;
    const items: CartItemRecord[] = Array.isArray(q.cart_items) ? q.cart_items : [];
    monthlyData[month].revenue += items.reduce((s, item) => s + (item.totalPrice || 0), 0);
  });
  const months = Object.entries(monthlyData).slice(-6);
  const maxMonthlyQuotes = Math.max(...months.map(([, v]) => v.quotes), 1);

  // AI prediction (simple trending)
  const recentQuotes = quotes.filter(q => {
    const d = new Date(q.created_at);
    const now = new Date();
    return (now.getTime() - d.getTime()) < 30 * 24 * 60 * 60 * 1000;
  }).length;
  const olderQuotes = quotes.filter(q => {
    const d = new Date(q.created_at);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    return diff >= 30 * 24 * 60 * 60 * 1000 && diff < 60 * 24 * 60 * 60 * 1000;
  }).length;
  const trend = olderQuotes > 0 ? ((recentQuotes - olderQuotes) / olderQuotes * 100).toFixed(0) : null;

  const generateAiInsights = async () => {
    setLoadingAi(true);
    setAiError(null);
    try {
      const stats = {
        totalQuotes: quotes.length,
        totalRevenue: totalRevenue,
        totalProducts: Object.keys(productStats).length
      };
      
      const response = await fetch('/admin/ai-insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stats,
          topProducts: topProducts.slice(0, 5).map(p => ({ name: p.name, count: p.count, revenue: p.revenue })),
          recentTrend: trend
        })
      });
      
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur lors de la génération');
      
      setAiInsights(data);
    } catch (e: any) {
      setAiError(e.message);
    } finally {
      setLoadingAi(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <div className="w-12 h-12 rounded-full border-2 border-electric-blue border-t-transparent animate-spin mb-4" />
        <p className="text-slate-400">Chargement des analytiques...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <AlertTriangle className="w-10 h-10 text-red-400 mb-3" />
        <p className="text-red-400 font-medium mb-2">Erreur de chargement</p>
        <p className="text-slate-500 text-sm mb-4">{error}</p>
        <button onClick={loadAnalytics} className="btn-primary text-sm">Réessayer</button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-electric-blue/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-electric-blue" />
            </div>
            {trend !== null && (
              <span className={`badge text-xs ${Number(trend) >= 0 ? 'badge-green' : 'badge-orange'}`}>
                {Number(trend) >= 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          <div className="text-3xl font-black text-white mb-1">{totalQuotes}</div>
          <div className="text-slate-500 text-sm">Devis totaux</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">{totalRevenue.toLocaleString()}</div>
          <div className="text-slate-500 text-sm">Valeur totale (TND)</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-electric-violet/20 flex items-center justify-center">
              <Package className="w-5 h-5 text-electric-violet" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">{Object.keys(productStats).length}</div>
          <div className="text-slate-500 text-sm">Produits demandés</div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-electric-cyan/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-electric-cyan" />
            </div>
          </div>
          <div className="text-3xl font-black text-white mb-1">{recentQuotes}</div>
          <div className="text-slate-500 text-sm">Devis ce mois-ci</div>
        </div>
      </div>

      {/* AI Predictions */}
      <div className="glass-card rounded-2xl p-6 border-2 border-electric-violet/30 bg-gradient-to-br from-electric-violet/10 via-transparent to-transparent relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-electric-violet/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-electric-violet/20 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-electric-violet" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">Bedouielec AI Strategy & Insights</h3>
              <p className="text-slate-400 text-sm">Propulsé par Llama 70B - Directeur Commercial Virtuel</p>
            </div>
          </div>
          <button 
            onClick={generateAiInsights}
            disabled={loadingAi}
            className="btn-primary flex items-center gap-2 whitespace-nowrap bg-electric-violet hover:bg-electric-violet/80 border-electric-violet shadow-[0_0_15px_rgba(139,92,246,0.5)]"
          >
            {loadingAi ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Générer le rapport stratégique
              </>
            )}
          </button>
        </div>

        {aiError && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
            {aiError}
          </div>
        )}

        {!aiInsights && !loadingAi && !aiError && (
          <div className="text-center py-8">
            <p className="text-slate-500 italic">Cliquez sur le bouton ci-dessus pour générer une analyse experte de vos ventes actuelles.</p>
          </div>
        )}

        {aiInsights && (
          <div className="space-y-6 relative z-10 animate-fade-in">
            {/* Tendance et Prédictions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 rounded-xl bg-slate-900/50 border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Activity className="w-4 h-4 text-electric-cyan" />
                  <h4 className="text-white font-semibold text-sm">Analyse du Marché</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{aiInsights.trendAnalysis}</p>
              </div>
              <div className="p-5 rounded-xl bg-slate-900/50 border border-white/5 backdrop-blur-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Star className="w-4 h-4 text-amber-400" />
                  <h4 className="text-white font-semibold text-sm">Prédictions (Mois Prochain)</h4>
                </div>
                <p className="text-slate-300 text-sm leading-relaxed">{aiInsights.predictions}</p>
              </div>
            </div>

            {/* Recommandations */}
            <div className="p-5 rounded-xl bg-electric-violet/5 border border-electric-violet/20">
              <h4 className="text-white font-semibold text-sm mb-4 flex items-center gap-2">
                <FileText className="w-4 h-4 text-electric-violet" />
                Plan d'Action Recommandé (Top 3)
              </h4>
              <div className="space-y-3">
                {aiInsights.recommendations?.map((rec: string, idx: number) => (
                  <div key={idx} className="flex gap-3 items-start">
                    <div className="w-6 h-6 rounded-full bg-electric-violet/20 text-electric-violet flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-slate-300 text-sm">{rec}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Top products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most quoted */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-electric-blue/20 flex items-center justify-center">
              <Star className="w-5 h-5 text-electric-blue" />
            </div>
            <h3 className="text-white font-bold">Produits les plus demandés</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-4">
              {topProducts.slice(0, 6).map((prod, i) => (
                <div key={prod.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold w-5 text-center ${i === 0 ? 'text-yellow-400' : i === 1 ? 'text-slate-300' : i === 2 ? 'text-amber-600' : 'text-slate-600'}`}>
                        #{i + 1}
                      </span>
                      <span className="text-slate-300 text-sm truncate max-w-40">{prod.name}</span>
                    </div>
                    <span className="text-electric-blue text-sm font-bold">{prod.count}×</span>
                  </div>
                  <MiniBar value={prod.count} max={maxCount} color="#3b82f6" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Revenue by product */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-9 h-9 rounded-xl bg-green-500/20 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-green-400" />
            </div>
            <h3 className="text-white font-bold">Chiffre d'affaires par produit</h3>
          </div>
          {topProducts.length === 0 ? (
            <p className="text-slate-600 text-sm text-center py-8">Aucune donnée disponible</p>
          ) : (
            <div className="space-y-4">
              {topProducts.sort((a, b) => b.revenue - a.revenue).slice(0, 6).map((prod) => (
                <div key={prod.id}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-300 text-sm truncate max-w-44">{prod.name}</span>
                    <span className="text-green-400 text-sm font-bold">{prod.revenue.toLocaleString()} TND</span>
                  </div>
                  <MiniBar value={prod.revenue} max={maxRevenue} color="#10b981" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Monthly chart */}
      {months.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-electric-cyan/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-electric-cyan" />
            </div>
            <h3 className="text-white font-bold">Évolution mensuelle des devis</h3>
          </div>
          <div className="flex items-end gap-3 h-40">
            {months.map(([month, data]) => {
              const height = Math.max(4, (data.quotes / maxMonthlyQuotes) * 100);
              return (
                <div key={month} className="flex-1 flex flex-col items-center gap-2">
                  <div className="text-xs text-slate-400 font-medium">{data.quotes}</div>
                  <div
                    className="w-full rounded-t-lg bg-gradient-to-t from-electric-blue to-electric-cyan opacity-80 hover:opacity-100 transition-opacity cursor-default chart-bar"
                    style={{ height: `${height}%`, minHeight: 4 }}
                    title={`${data.quotes} devis - ${data.revenue.toLocaleString()} TND`}
                  />
                  <div className="text-xs text-slate-600 text-center">{month}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent quotes */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-white font-bold">Derniers devis reçus</h3>
          <span className="badge badge-blue text-xs">{quotes.slice(0, 5).length} sur {totalQuotes}</span>
        </div>
        {quotes.length === 0 ? (
          <p className="text-slate-600 text-sm text-center py-8">Aucun devis reçu pour le moment</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="pb-3 text-left">Date</th>
                  <th className="pb-3 text-left">Produits</th>
                  <th className="pb-3 text-right">Valeur</th>
                  <th className="pb-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {quotes.slice(0, 8).map(q => {
                  const items: CartItemRecord[] = Array.isArray(q.cart_items) ? q.cart_items : [];
                  const total = items.reduce((s, item) => s + (item.totalPrice || 0), 0);
                  return (
                    <tr key={q.id} className="hover:bg-white/2 transition-colors">
                      <td className="py-3 text-slate-400 text-xs">
                        {new Date(q.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="py-3 text-slate-300 truncate max-w-xs">
                        {items.length > 0 ? items.slice(0, 2).map(i => i.product?.name).filter(Boolean).join(', ') + (items.length > 2 ? ` +${items.length - 2}` : '') : '—'}
                      </td>
                      <td className="py-3 text-right text-electric-blue font-semibold">
                        {total > 0 ? `${total.toLocaleString()} TND` : '—'}
                      </td>
                      <td className="py-3 text-center">
                        <span className={`badge text-xs ${q.status === 'completed' ? 'badge-green' : 'badge-blue'}`}>
                          {q.status || 'Reçu'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
