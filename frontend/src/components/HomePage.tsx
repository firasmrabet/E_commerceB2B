import React, { useRef, useEffect } from 'react';
import { ArrowRight, Zap, Shield, HeadphonesIcon, Award, TrendingUp, Users, CheckCircle } from 'lucide-react';
import ProductCard from './ProductCard';
import { useAppContext } from '../context/AppContext';
import { useDataContext } from '../context/DataContext';
import { Product } from '../types';
import { useNavigate } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

interface HomePageProps {
  onProductClick: (product: Product) => void;
}

// Animated counter
function Counter({ to, duration = 2 }: { to: number; duration?: number }) {
  const [count, setCount] = React.useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const steps = 60;
    const increment = to / steps;
    const timer = setInterval(() => {
      start += increment;
      if (start >= to) { setCount(to); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, (duration * 1000) / steps);
    return () => clearInterval(timer);
  }, [inView, to, duration]);
  return <span ref={ref}>{count}</span>;
}

const PARTICLES = Array.from({ length: 25 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  delay: Math.random() * 4,
  duration: Math.random() * 3 + 3,
}));

const FEATURES = [
  { icon: Zap, title: 'Expertise HT', desc: 'Maintenance haute tension & transformateurs 30KV', color: 'blue', bg: 'from-blue-500/10 to-blue-600/5', border: 'border-blue-500/20' },
  { icon: Shield, title: 'Qualité certifiée', desc: 'Produits conformes aux normes IEC & CEI internationales', color: 'green', bg: 'from-green-500/10 to-green-600/5', border: 'border-green-500/20' },
  { icon: HeadphonesIcon, title: 'Support 24/7', desc: 'Équipe technique disponible pour vos urgences industrielles', color: 'violet', bg: 'from-violet-500/10 to-violet-600/5', border: 'border-violet-500/20' },
];

const STATS = [
  { icon: Award, value: 20, suffix: '+', label: 'Années d\'expérience', color: 'text-electric-blue' },
  { icon: Users, value: 500, suffix: '+', label: 'Clients industriels', color: 'text-electric-cyan' },
  { icon: TrendingUp, value: 1000, suffix: '+', label: 'Projets réalisés', color: 'text-electric-violet' },
  { icon: CheckCircle, value: 98, suffix: '%', label: 'Satisfaction client', color: 'text-green-400' },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export default function HomePage({ onProductClick }: HomePageProps) {
  const { state, dispatch } = useAppContext();
  const { categories, products } = useDataContext();
  const newArrivalsRef = useRef<HTMLDivElement | null>(null);
  const isCartEmpty = !state?.cart || state.cart.length === 0;
  const customCategories = categories.filter((c: any) => c.isCustom);

  const pageSize = 8;
  const [currentPage, setCurrentPage] = React.useState(1);
  const adminProducts = (products || []).filter((p: any) => p.isCustom);
  const sortedAdminProducts = adminProducts.slice().sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const pageCount = Math.max(1, Math.ceil(sortedAdminProducts.length / pageSize));
  const paginatedProducts = sortedAdminProducts.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const navigate = useNavigate();

  const handleCategoryClick = (categoryId: string) => {
    dispatch({ type: 'SET_CATEGORY', payload: categoryId });
    try { window.scrollTo({ top: 0, left: 0 }); } catch { window.scrollTo(0, 0); }
  };

  const handleRequestQuote = () => {
    if (!state?.userId) { navigate('/login'); return; }
    dispatch({ type: 'TOGGLE_QUOTE_MODAL', payload: null });
  };

  return (
    <div className="min-h-screen">

      {/* ======================== HERO ======================== */}
      <section className="relative overflow-hidden hero-gradient grid-bg min-h-[92vh] flex items-center">
        {/* Floating particles */}
        {PARTICLES.map(p => (
          <div
            key={p.id}
            className="particle absolute pointer-events-none"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
            }}
          />
        ))}

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-electric-blue/6 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-electric-violet/6 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 badge badge-blue mb-6 text-xs uppercase tracking-widest"
              >
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-electric-blue animate-pulse"></span>
                Spécialiste Équipements Industriels · Tunisie
              </motion.div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-none mb-6 tracking-tight">
                <span className="text-white">Votre</span>{' '}
                <span className="gradient-text">partenaire</span>
                <br />
                <span className="text-white">en haute tension</span>
              </h1>

              <p className="text-lg text-slate-400 mb-10 leading-relaxed max-w-xl">
                Bedouielec Transformateurs — spécialiste en maintenance haute tension, 
                transformateurs MT/BT, cellules électriques et postes de transformation 30KV. 
                Solutions industrielles de haute qualité pour vos projets.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => newArrivalsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                  className="btn-primary flex items-center justify-center gap-2 text-base"
                >
                  Découvrir nos produits
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleRequestQuote}
                  disabled={isCartEmpty}
                  className="btn-secondary flex items-center justify-center gap-2 text-base disabled:opacity-40 disabled:cursor-not-allowed"
                  title={isCartEmpty ? 'Ajoutez un produit au panier pour demander un devis' : ''}
                >
                  Demander un devis
                </motion.button>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-white/5">
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Certifié IEC
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" /> +20 ans d'expérience
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm">
                  <CheckCircle className="w-4 h-4 text-green-400" /> Support 24/7
                </div>
              </div>
            </motion.div>

            {/* Right: Hero visual */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: 'easeOut' }}
              className="hidden lg:block"
            >
              <div className="relative">
                {/* Main image */}
                <div className="relative rounded-2xl overflow-hidden neon-border">
                  <img
                    src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=700&q=85"
                    alt="Industrial electrical equipment"
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-bg/60 to-transparent" />
                </div>

                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className="absolute -top-6 -right-6 glass rounded-xl p-4 border border-green-500/20 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-green-500/20 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">Stock disponible</div>
                      <div className="text-green-400 text-xs">Livraison rapide</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ y: [0, 8, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: 'easeInOut', delay: 1 }}
                  className="absolute -bottom-6 -left-6 glass rounded-xl p-4 border border-electric-blue/20 shadow-xl"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-electric-blue/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-electric-blue" />
                    </div>
                    <div>
                      <div className="text-white text-sm font-bold">30KV · MT/BT</div>
                      <div className="text-electric-blue text-xs">Haute tension</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-600">
          <span className="text-xs uppercase tracking-widest">Défiler</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-5 h-8 border border-slate-600 rounded-full flex items-start justify-center p-1"
          >
            <div className="w-1 h-2 bg-electric-blue rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* ======================== STATS ======================== */}
      <section className="py-16 border-y border-white/5 bg-white/5 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map(({ icon: Icon, value, suffix, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="flex items-center justify-center mb-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                    <Icon className={`w-6 h-6 ${color}`} />
                  </div>
                </div>
                <div className={`text-4xl font-black mb-1 ${color}`}>
                  <Counter to={value} />{suffix}
                </div>
                <div className="text-slate-500 text-sm">{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ======================== FEATURES ======================== */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="badge badge-blue mb-4 text-xs uppercase tracking-widest">Pourquoi nous choisir</span>
            <h2 className="text-4xl font-black text-white mb-4">
              L'excellence <span className="gradient-text">industrielle</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Bedouielec Transformateurs vous offre un service complet, de la conception à la maintenance.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {FEATURES.map(({ icon: Icon, title, desc, bg, border }) => (
              <motion.div key={title} variants={itemVariants}>
                <div className={`h-full glass-card rounded-2xl p-8 bg-gradient-to-br ${bg} border ${border} group`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${bg} border ${border} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
                  <p className="text-slate-400 leading-relaxed">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="section-divider mx-6" />

      {/* ======================== CATEGORIES ======================== */}
      {customCategories.length > 0 && (
        <section className="py-20">
          <div className="container mx-auto px-6">
            <motion.div
              className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="badge badge-blue mb-4 text-xs uppercase tracking-widest">Catalogue</span>
              <h2 className="text-4xl font-black text-white mb-4">
                Nos <span className="gradient-text">catégories</span>
              </h2>
              <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                Découvrez notre gamme complète d'équipements électriques industriels
              </p>
            </motion.div>

            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {customCategories.map((category: any) => (
                <motion.div
                  key={category.id}
                  variants={itemVariants}
                  onClick={() => handleCategoryClick(category.id)}
                  className="category-card group cursor-pointer"
                >
                  <div className="relative h-52 overflow-hidden rounded-2xl">
                    <img
                      src={category.image || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&q=80'; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-dark-bg via-dark-bg/40 to-transparent" />
                    <div className="absolute inset-0 border border-white/10 group-hover:border-electric-blue/40 rounded-2xl transition-colors" />

                    {/* Content overlay */}
                    <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
                      <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                      <p className="text-slate-400 text-sm line-clamp-1 mb-3">{category.description}</p>
                      <div className="flex items-center gap-2 text-electric-blue text-sm font-semibold opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        Voir les produits <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <div className="section-divider mx-6" />

      {/* ======================== NEW ARRIVALS ======================== */}
      <section ref={newArrivalsRef} className="py-20">
        <div className="container mx-auto px-6">
          <motion.div
            className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div>
              <span className="badge badge-orange mb-4 text-xs uppercase tracking-widest">Catalogue</span>
              <h2 className="text-4xl font-black text-white mb-2">
                Nos <span className="gradient-text-orange">produits</span>
              </h2>
              <p className="text-slate-400">Les derniers équipements de notre catalogue</p>
            </div>
          </motion.div>

          {paginatedProducts.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-10 h-10 text-slate-600" />
              </div>
              <p className="text-slate-500 text-lg">Aucun produit disponible pour le moment.</p>
              <p className="text-slate-600 text-sm mt-2">L'administrateur peut ajouter des produits via le panel admin.</p>
            </div>
          ) : (
            <>
              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {paginatedProducts.map((product) => (
                  <motion.div key={product.id} variants={itemVariants}>
                    <ProductCard product={product} onProductClick={onProductClick} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Pagination */}
              {pageCount > 1 && (
                <div className="flex items-center justify-center mt-10 gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg glass text-slate-400 hover:text-white disabled:opacity-30 transition-all text-sm"
                  >
                    ← Précédent
                  </button>
                  {Array.from({ length: pageCount }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${currentPage === i + 1 ? 'bg-electric-blue text-white shadow-lg shadow-blue-500/30' : 'glass text-slate-400 hover:text-white'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(pageCount, p + 1))}
                    disabled={currentPage === pageCount}
                    className="px-4 py-2 rounded-lg glass text-slate-400 hover:text-white disabled:opacity-30 transition-all text-sm"
                  >
                    Suivant →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* ======================== CTA ======================== */}
      <section className="py-20 mx-4 mb-4">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-electric-blue/20 via-dark-card to-electric-violet/10 border border-electric-blue/20 p-12 text-center">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-electric-blue/5 to-transparent pointer-events-none" />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="badge badge-blue mb-6 inline-flex text-xs uppercase tracking-widest">
              Devis gratuit · Réponse sous 24h
            </div>
            <h2 className="text-4xl font-black text-white mb-4">
              Besoin d'un devis <span className="gradient-text">personnalisé ?</span>
            </h2>
            <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
              Notre équipe d'experts est disponible pour vous conseiller et établir un devis sur mesure 
              adapté à vos besoins industriels spécifiques.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleRequestQuote}
                disabled={isCartEmpty}
                title={isCartEmpty ? 'Ajoutez des produits au panier' : ''}
                className="btn-orange text-base disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Demander un devis
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.04 }}
                href="tel:+21629493780"
                className="btn-secondary text-base inline-flex items-center justify-center gap-2"
              >
                📞 +216 29 493 780
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
