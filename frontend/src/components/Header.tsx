import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useDataContext } from '../context/DataContext';
import { supabase } from '../supabaseClient';
import { Search, User, ShoppingCart, Menu, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function Header() {
  const { categories, products } = useDataContext();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const { state, dispatch } = useAppContext();

  useEffect(() => {
    const refreshAuth = async () => {
      const { data } = await supabase.auth.getUser();
      setIsAuthenticated(!!data?.user);
    };
    refreshAuth();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      refreshAuth();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(0);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const customCategories = categories.filter((c: any) => c.isCustom);

  const launchSearch = (inputRaw: string) => {
    const input = inputRaw.trim().toLowerCase();
    const matchedCategory = customCategories.find((cat: any) =>
      cat.name.toLowerCase() === input || cat.id.toLowerCase() === input
    );
    if (matchedCategory) {
      dispatch({ type: 'SET_CATEGORY', payload: matchedCategory.id });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
      navigate('/');
      setIsMenuOpen(false);
      setShowSuggestions(false);
      return;
    }
    const matchedProduct = products.find(prod =>
      prod.name.toLowerCase() === input || prod.id.toLowerCase() === input
    );
    if (matchedProduct) {
      const categoryId = (matchedProduct as any).category_id || (
        categories.find(c => c.name === matchedProduct.category)?.id || null
      );
      dispatch({ type: 'SET_CATEGORY', payload: categoryId });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: matchedProduct.name });
      navigate('/');
      setIsMenuOpen(false);
      setShowSuggestions(false);
      return;
    }
    dispatch({ type: 'SET_SEARCH_QUERY', payload: inputRaw });
    dispatch({ type: 'SET_CATEGORY', payload: null });
    navigate('/');
    setIsMenuOpen(false);
    setShowSuggestions(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestions.length > 0 && showSuggestions) {
      handleSuggestionSelect(suggestions[activeSuggestion]);
      return;
    }
    launchSearch(searchInput);
  };

  const handleSuggestionSelect = (suggestion: any) => {
    if (suggestion.type === 'category') {
      dispatch({ type: 'SET_CATEGORY', payload: suggestion.id });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
      navigate('/');
    } else {
      dispatch({ type: 'SET_CATEGORY', payload: suggestion.category });
      dispatch({ type: 'SET_SEARCH_QUERY', payload: suggestion.name });
      navigate('/');
    }
    setShowSuggestions(false);
    setIsMenuOpen(false);
    setSearchInput(suggestion.name);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchInput(value);
    if (value.trim().length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const inputLower = value.toLowerCase();
    const catSuggestions = customCategories
      .filter((cat: any) => cat.name.toLowerCase().includes(inputLower))
      .map((cat: any) => ({ type: 'category', id: cat.id, name: cat.name }));
    const prodSuggestions = products
      .filter(prod => prod.name.toLowerCase().includes(inputLower))
      .map(prod => {
        const categoryId = (prod as any).category_id || null;
        return ({ type: 'product', id: prod.id, name: prod.name, category: categoryId });
      });
    const allSuggestions = [...catSuggestions, ...prodSuggestions].slice(0, 8);
    setSuggestions(allSuggestions);
    setShowSuggestions(allSuggestions.length > 0);
    setActiveSuggestion(0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') { setActiveSuggestion(p => (p + 1) % suggestions.length); e.preventDefault(); }
    else if (e.key === 'ArrowUp') { setActiveSuggestion(p => (p - 1 + suggestions.length) % suggestions.length); e.preventDefault(); }
    else if (e.key === 'Enter') { handleSuggestionSelect(suggestions[activeSuggestion]); e.preventDefault(); }
    else if (e.key === 'Escape') setShowSuggestions(false);
  };

  const totalCartItems = (state.cart as any[]).reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);

  return (
    <>
      {/* Top bar */}
      <div className="hidden md:block bg-dark-bg border-b border-dark-border text-sm py-2">
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-6 text-slate-400">
            <a href="tel:+21629493780" className="flex items-center gap-2 hover:text-electric-blue transition-colors">
              <span className="text-electric-blue">📞</span>
              +216 29 493 780
            </a>
            <a href="mailto:support@bedouielectransormateur.com" className="flex items-center gap-2 hover:text-electric-blue transition-colors">
              <span className="text-electric-blue">✉️</span>
              support@bedouielectransormateur.com
            </a>
          </div>
          <div className="flex items-center gap-4 text-slate-500 text-xs">
            <span className="flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Lun-Ven: 8h00-17h30 · Sam: 8h00-12h00
            </span>
          </div>
        </div>
      </div>

      {/* Main header */}
      <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'header-glass shadow-lg shadow-black/20' : 'header-glass'}`}>
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between py-4 gap-4">

            {/* Logo */}
            <button
              onClick={() => {
                navigate('/');
                dispatch({ type: 'SET_CATEGORY', payload: null });
                dispatch({ type: 'SET_SEARCH_QUERY', payload: '' });
                setIsMenuOpen(false);
              }}
              className="flex items-center gap-3 flex-shrink-0 group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue to-electric-violet flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-shadow">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="text-lg font-bold text-white leading-none">Bedouielec</div>
                <div className="text-xs text-slate-400 leading-none mt-0.5">Transformateurs</div>
              </div>
            </button>

            {/* Search bar */}
            <div className="flex-1 max-w-2xl mx-6 hidden md:block relative">
              <form onSubmit={handleSearch}>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher produits, catégories..."
                    value={searchInput}
                    onChange={handleInputChange}
                    onKeyDown={handleInputKeyDown}
                    onFocus={() => setShowSuggestions(suggestions.length > 0)}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-5 py-2.5 pr-12 focus:outline-none focus:border-electric-blue/60 focus:bg-white/8 focus:shadow-lg focus:shadow-blue-500/10 transition-all"
                    autoComplete="off"
                  />
                  <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-electric-blue transition-colors">
                    <Search className="w-5 h-5" />
                  </button>
                </div>
                <AnimatePresence>
                  {showSuggestions && (
                    <motion.ul
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full mt-2 left-0 right-0 glass rounded-xl overflow-hidden z-50 shadow-2xl shadow-black/40 border border-white/10"
                    >
                      {suggestions.map((sugg, idx) => (
                        <li
                          key={sugg.type + '-' + sugg.id}
                          className={`px-4 py-3 cursor-pointer flex items-center justify-between transition-colors ${idx === activeSuggestion ? 'bg-electric-blue/20 text-white' : 'text-slate-300 hover:bg-white/5'}`}
                          onMouseDown={() => handleSuggestionSelect(sugg)}
                        >
                          <span className="flex items-center gap-2">
                            <span>{sugg.type === 'category' ? '📁' : '⚡'}</span>
                            {sugg.name}
                          </span>
                          <span className="text-xs text-slate-500 badge badge-blue">
                            {sugg.type === 'category' ? 'Catégorie' : 'Produit'}
                          </span>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </form>
            </div>

            {/* Right section */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Mon compte */}
              <button
                onClick={() => navigate(isAuthenticated ? '/mon-compte' : '/login')}
                className="flex items-center gap-2 px-3 py-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-all text-sm"
              >
                <User className="w-5 h-5" />
                <span className="hidden lg:inline">Mon compte</span>
              </button>

              {/* Admin */}
              {state.isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="hidden md:flex items-center gap-2 px-3 py-2 text-amber-400 hover:text-amber-300 hover:bg-amber-400/10 rounded-xl transition-all text-sm font-semibold border border-amber-400/20"
                >
                  <span>⚙️</span>
                  Admin
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => {
                  if (!isAuthenticated) { navigate('/login'); return; }
                  dispatch({ type: 'TOGGLE_CART' });
                }}
                className="relative flex items-center gap-2 px-3 py-2 bg-electric-blue/10 hover:bg-electric-blue/20 border border-electric-blue/20 hover:border-electric-blue/40 text-electric-blue rounded-xl transition-all"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden md:inline text-sm font-medium">Panier</span>
                {totalCartItems > 0 && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-electric-blue text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg shadow-blue-500/30"
                  >
                    {totalCartItems}
                  </motion.span>
                )}
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 pr-10 focus:outline-none focus:border-electric-blue/60 transition-all"
                />
                <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Categories nav */}
        <nav className="border-t border-white/5">
          <div className="container mx-auto px-6">
            <div className={`${isMenuOpen ? 'block' : 'hidden'} md:block`}>
              {/* Mobile panel */}
              {isMenuOpen && (
                <div className="md:hidden py-4 space-y-2">
                  <button
                    onClick={() => { navigate('/'); navigate(isAuthenticated ? '/mon-compte' : '/login'); setIsMenuOpen(false); }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-slate-300 hover:text-white rounded-lg"
                  >
                    <User className="w-4 h-4" /> Mon compte
                  </button>
                  {state.isAdmin && (
                    <button onClick={() => { navigate('/admin'); setIsMenuOpen(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-amber-400 font-medium rounded-lg">
                      ⚙️ Admin
                    </button>
                  )}
                </div>
              )}
              <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-hide">
                <button
                  onClick={() => { navigate('/'); dispatch({ type: 'SET_CATEGORY', payload: null }); dispatch({ type: 'SET_SEARCH_QUERY', payload: '' }); setIsMenuOpen(false); }}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    state.selectedCategory === null && !state.searchQuery
                      ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Tous les produits
                </button>
                {customCategories.map((cat: any) => (
                  <button
                    key={cat.id}
                    onClick={() => { navigate('/'); dispatch({ type: 'SET_CATEGORY', payload: cat.id }); setIsMenuOpen(false); }}
                    className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      state.selectedCategory === cat.id
                        ? 'bg-electric-blue/20 text-electric-blue border border-electric-blue/30'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </nav>
      </header>
    </>
  );
}

export default Header;
