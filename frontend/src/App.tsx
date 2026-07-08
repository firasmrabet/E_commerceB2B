import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { DataProvider } from './context/DataContext';
import Header from './components/Header';
import ScrollToTop from './components/ScrollToTop';
import HomePage from './components/HomePage';
import ProductListing from './components/ProductListing';
import ProductModal from './components/ProductModal';
import Cart from './components/Cart';
import QuoteModal from './components/QuoteModal';
import Footer from './components/Footer';
import AIChatbot from './components/AIChatbot';
import { Product } from './types';
import { useAppContext } from './context/AppContext';
import { supabase } from './supabaseClient';
import { Routes, Route, useLocation } from 'react-router-dom';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';
import MonCompte from './components/MonCompte';
import QuoteSuccessPage from './components/QuoteSuccessPage';
import AdminPage from './components/AdminPage';
import AnimatedBackground from './components/AnimatedBackground';
import CompleteProfile from './components/CompleteProfile';

function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname === '/admin';

  // Auth check
  React.useEffect(() => {
    async function checkAuth() {
      // Vérifier si nous venons d'une redirection OAuth
      const hash = window.location.hash;
      if (hash.includes('access_token') || hash.includes('error')) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          window.location.replace('/');
          return;
        }
      }

      // Écouter les changements d'auth
      const { data: authListener } = supabase.auth.onAuthStateChange(async (event) => {
        console.log('Auth event:', event);
        if (event === 'SIGNED_IN') {
          // Uniquement rediriger si l'utilisateur est sur la page de login/signup
          const path = window.location.pathname;
          if (path === '/login' || path === '/signup') {
            window.location.replace('/');
          }
        }
      });

      return () => {
        authListener?.subscription?.unsubscribe();
      };
    }
    checkAuth();
  }, []);

  // Suppression de la vérification globale : la page principale s'affiche toujours
  const { state, dispatch } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setIsProductModalOpen(true);
    // Close cart when product modal opens
    if (state.isCartOpen) {
      dispatch({ type: 'TOGGLE_CART' });
    }
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
  };

  const isHomePage = !state.searchQuery && !state.selectedCategory;

  // Admin route: render only AdminPage with no site chrome
  if (isAdminRoute) {
    return (
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col relative" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <AnimatedBackground />
      <CompleteProfile />
      <div className="relative z-10 flex flex-col flex-1">
        <ScrollToTop />
        <Header />
        <main className="flex-1">
        <Routes>
          <Route path="/" element={isHomePage ? <HomePage onProductClick={handleProductClick} /> : <ProductListing onProductClick={handleProductClick} />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/mon-compte" element={<MonCompte />} />
          <Route path="/quote-success" element={<QuoteSuccessPage />} />
        </Routes>
      </main>
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={handleCloseProductModal}
        product={selectedProduct as Product}
      />
      <Cart />
        <QuoteModal />
        <Footer />
        <AIChatbot />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AppProvider>
  );
}
