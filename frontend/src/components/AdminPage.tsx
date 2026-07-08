import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { Plus, Edit, Trash2, Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { categoriesService, productsService, CustomCategory, CustomProduct } from '../services/adminService';
import { useDataContext } from '../context/DataContext';
import { useCategories } from '../hooks/useCategories';
import { useProducts } from '../hooks/useProducts';
import { supabase } from '../supabaseClient';

import AdminAnalytics from './AdminAnalytics';
import { Camera, BarChart3, Grid3X3, Package, ArrowLeft, Zap, Database, Loader2, Settings, ExternalLink, Home } from 'lucide-react';

type AdminTab = 'analytics' | 'categories' | 'products' | 'system';

export default function AdminPage(): JSX.Element | null {
  const { state } = useAppContext();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  React.useEffect(() => {
    if (!state.isAdmin) navigate('/');
  }, [state.isAdmin, navigate]);

  if (!state.isAdmin) return null;

  const navItems: { id: AdminTab; label: string; icon: any; badge?: string }[] = [
    { id: 'analytics', label: 'Dashboard', icon: BarChart3 },
    { id: 'categories', label: 'Catégories', icon: Grid3X3 },
    { id: 'products', label: 'Produits', icon: Package },
    { id: 'system', label: 'Base de données', icon: Database },
  ];

  const handleTabClick = (id: AdminTab) => {
    setActiveTab(id);
    setSidebarOpen(false);
  };

  const tabTitles: Record<AdminTab, string> = {
    analytics: 'Dashboard & Analytiques',
    categories: 'Gestion des Catégories',
    products: 'Gestion des Produits',
    system: 'Système & Base de données',
  };

  return (
    <div className="admin-dashboard-layout" style={{ background: 'var(--bg-primary)', minHeight: '100vh' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="admin-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : ''}`}>
        {/* Logo / Brand */}
        <div className="admin-sidebar__brand">
          <div className="admin-sidebar__logo">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="admin-sidebar__brand-text">
            <span className="admin-sidebar__brand-name">Bedouielec</span>
            <span className="admin-sidebar__brand-role">Admin Panel</span>
          </div>
          <button className="admin-sidebar__close-btn" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="admin-sidebar__nav">
          <div className="admin-sidebar__nav-group">
            <span className="admin-sidebar__nav-label">MENU PRINCIPAL</span>
            {navItems.map(({ id, label, icon: Icon, badge }) => (
              <button
                key={id}
                onClick={() => handleTabClick(id)}
                className={`admin-sidebar__nav-item ${activeTab === id ? 'admin-sidebar__nav-item--active' : ''}`}
              >
                <Icon className="w-[18px] h-[18px]" />
                <span>{label}</span>
                {badge && (
                  <span className="admin-sidebar__badge">{badge}</span>
                )}
                {activeTab === id && <ChevronRight className="w-4 h-4 ml-auto opacity-60" />}
              </button>
            ))}
          </div>

          <div className="admin-sidebar__nav-group">
            <span className="admin-sidebar__nav-label">EXTERNE</span>
            <a
              href="http://localhost:3000"
              target="_blank"
              rel="noopener noreferrer"
              className="admin-sidebar__nav-item admin-sidebar__nav-item--external"
            >
              <Camera className="w-[18px] h-[18px]" />
              <span>SentinelAI</span>
              <ExternalLink className="w-3.5 h-3.5 ml-auto opacity-40" />
            </a>
          </div>
        </nav>

        {/* Bottom section */}
        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">
              {(state.userEmail || 'A').charAt(0).toUpperCase()}
            </div>
            <div className="admin-sidebar__user-info">
              <span className="admin-sidebar__user-name">Administrateur</span>
              <span className="admin-sidebar__user-email">{state.userEmail || ''}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="admin-sidebar__nav-item admin-sidebar__nav-item--return"
          >
            <Home className="w-[18px] h-[18px]" />
            <span>Retour au site</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        {/* Top bar */}
        <header className="admin-topbar">
          <button className="admin-topbar__menu-btn" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="admin-topbar__title">{tabTitles[activeTab]}</h1>
            <p className="admin-topbar__subtitle">Bedouielec Transformateurs — Panneau de gestion</p>
          </div>
        </header>

        {/* Content area */}
        <div className="admin-content">
          {activeTab === 'analytics' && <AdminAnalytics />}
          {activeTab === 'categories' && <CategoriesManagement />}
          {activeTab === 'products' && <ProductsManagement />}
          {activeTab === 'system' && <DatabaseManagement />}
        </div>
      </main>
    </div>
  );
}

// Database Management Component (Auto-Seeder moved here)
function DatabaseManagement() {
  const [isSeeding, setIsSeeding] = useState(false);
  const { reloadData } = useDataContext();

  const handleAutoSeed = async () => {
    if (!confirm("⚠️ Attention : cette action va SUPPRIMER toutes les catégories/produits existants et injecter les données réelles de Bedouielec.\n\nVoulez-vous continuer ?")) return;
    setIsSeeding(true);
    try {
      const REAL_CATEGORIES = [
        { name: 'Transformateurs Haute Tension (HT)', description: 'Transformateurs de distribution HT/BT' },
        { name: 'Cellules HTA (MT/BT)', description: 'Cellules moyenne tension' },
        { name: 'Postes de Transformation 30KV', description: 'Postes préfabriqués et cabines' },
        { name: 'Batteries de Condensateurs', description: 'Compensation d\'énergie réactive' },
        { name: 'Services de Maintenance', description: 'Maintenance et traitement d\'huile' }
      ];

      const REAL_PRODUCTS = [
        { name: 'Transformateur Immergé 100 kVA - 30kV', price: 12500, category_name: 'Transformateurs Haute Tension (HT)', description: 'Transformateur de distribution triphasé immergé dans l\'huile minérale, puissance 100 kVA. Tension primaire 30 kV. Couplage Dyn11. Conforme normes IEC.', image: 'https://5.imimg.com/data5/SELLER/Default/2022/9/CW/GE/CW/15317769/distribution-transformer-100-kva.png' },
        { name: 'Transformateur Immergé 250 kVA - 30kV', price: 18900, category_name: 'Transformateurs Haute Tension (HT)', description: 'Transformateur de distribution triphasé immergé dans l\'huile minérale, puissance 250 kVA. Tension primaire 30 kV. Conçu pour environnements industriels.', image: 'https://5.imimg.com/data5/SELLER/Default/2021/11/EM/KT/BS/3011311/250-kva-oil-cooled-transformer.jpg' },
        { name: 'Transformateur Immergé 630 kVA - 30kV', price: 28500, category_name: 'Transformateurs Haute Tension (HT)', description: 'Transformateur de puissance 630 kVA, pertes réduites, refroidissement ONAN. Idéal pour sites industriels et stations de pompage.', image: 'https://5.imimg.com/data5/SELLER/Default/2020/12/IE/AY/UK/15317769/630-kva-distribution-transformer.png' },
        { name: 'Transformateur Sec Enrobé 400 kVA', price: 35000, category_name: 'Transformateurs Haute Tension (HT)', description: 'Transformateur de type sec, isolation résine, puissance 400 kVA. Sécurité incendie maximale (auto-extinguible), idéal pour bâtiments publics.', image: 'https://5.imimg.com/data5/SELLER/Default/2021/1/PB/WY/WH/64516335/dry-type-transformer.jpg' },
        { name: 'Cellule HTA Interrupteur-Sectionneur (IM)', price: 8500, category_name: 'Cellules HTA (MT/BT)', description: 'Cellule modulaire 24kV à isolation dans le gaz SF6, fonction interrupteur d\'arrivée ou de départ. Intensité nominale 400A/630A.', image: 'https://5.imimg.com/data5/SELLER/Default/2022/6/EM/QJ/RD/22533036/11kv-indoor-load-break-switch-panel.jpeg' },
        { name: 'Cellule HTA Protection Fusible (QM)', price: 9800, category_name: 'Cellules HTA (MT/BT)', description: 'Cellule 24kV de protection transformateur avec interrupteur-sectionneur et fusibles HPC. Déclenchement automatique.', image: 'https://5.imimg.com/data5/SELLER/Default/2021/3/BW/DH/IS/3151833/11-kv-outdoor-vcb-panel.jpg' },
        { name: 'Cellule HTA Disjoncteur (DM1)', price: 15500, category_name: 'Cellules HTA (MT/BT)', description: 'Cellule de protection par disjoncteur SF6 ou vide. Protection maximale pour les installations industrielles critiques.', image: 'https://5.imimg.com/data5/SELLER/Default/2021/6/OA/JW/RO/1218535/33-kv-indoor-vcb-panel.png' },
        { name: 'Poste de Transformation Préfabriqué Cabine', price: 45000, category_name: 'Postes de Transformation 30KV', description: 'Poste de livraison complet type cabine maçonnée ou métallique. Intègre le transformateur, le tableau MT et le TGBT.', image: 'https://5.imimg.com/data5/SELLER/Default/2020/10/IQ/KS/OC/15591097/11-kv-compact-substation.jpg' },
        { name: 'Poste de Transformation sur Poteau (H61)', price: 15500, category_name: 'Postes de Transformation 30KV', description: 'Poste H61 complet pour raccordement aérien rural ou semi-urbain. Équipement d\'accrochage et protection inclus.', image: 'https://5.imimg.com/data5/SELLER/Default/2022/11/TI/AM/WA/11090176/pole-mounted-transformer.jpg' },
        { name: 'Batterie de Condensateurs 150 kVAR', price: 4500, category_name: 'Batteries de Condensateurs', description: 'Armoire de compensation d\'énergie réactive, régulateur automatique. Réduction immédiate des pénalités sur facture STEG.', image: 'https://5.imimg.com/data5/SELLER/Default/2022/9/VK/WJ/WJ/1218535/automatic-power-factor-control-panel.png' },
        { name: 'Batterie de Condensateurs 300 kVAR', price: 7200, category_name: 'Batteries de Condensateurs', description: 'Armoire haute capacité de compensation d\'énergie réactive pour grandes usines. Régulateur intelligent.', image: 'https://5.imimg.com/data5/SELLER/Default/2021/1/EK/OW/RD/1460596/apfc-panel.jpg' },
        { name: 'Contrat Maintenance Annuelle Transfo', price: 1500, category_name: 'Services de Maintenance', description: 'Visite préventive annuelle: nettoyage isolateurs, resserrage connexions, contrôle niveau huile, rapport technique détaillé.', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80' },
        { name: 'Traitement & Régénération Huile Diélectrique', price: 2200, category_name: 'Services de Maintenance', description: 'Prestation sur site de filtration, dégazage et déshydratation sous vide de l\'huile minérale du transformateur pour restaurer ses propriétés.', image: 'https://images.unsplash.com/photo-1581092584641-4835269d67fb?auto=format&fit=crop&q=80' },
        { name: 'Analyse Diélectrique de l\'Huile (Labo)', price: 450, category_name: 'Services de Maintenance', description: 'Prélèvement et analyse en laboratoire: rigidité diélectrique, acidité, teneur en eau. Rapport certifié.', image: 'https://images.unsplash.com/photo-1581091870621-0a149b1198f1?auto=format&fit=crop&q=80' }
      ];

      await supabase.from('custom_products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('custom_categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      const categoryMap: Record<string, string> = {};
      for (const cat of REAL_CATEGORIES) {
        const { data } = await supabase.from('custom_categories').insert(cat).select().single();
        if (data) categoryMap[cat.name] = data.id;
      }

      for (const prod of REAL_PRODUCTS) {
        if (categoryMap[prod.category_name]) {
          await supabase.from('custom_products').insert({
            name: prod.name, price: prod.price, description: prod.description,
            image: prod.image, category_id: categoryMap[prod.category_name]
          });
        }
      }
      await reloadData();
      alert("✅ Injection terminée avec succès !");
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert("Erreur lors de l'injection des données.");
    } finally {
      setIsSeeding(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Database className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Auto-Seeder</h3>
            <p className="text-sm text-slate-400">Injection automatique des données Bedouielec</p>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-5 border border-white/10 mb-6">
          <h4 className="text-white font-medium mb-3">📦 Données incluses :</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
              5 Catégories (HT, HTA, Postes, Condensateurs, Maintenance)
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
              14 Produits avec images et descriptions
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              Prix en TND configurés
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              Caractéristiques techniques complètes
            </div>
          </div>
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-amber-400 text-sm">
            <strong>⚠️ Attention :</strong> L'injection supprime toutes les catégories et produits existants avant d'insérer les nouvelles données. Cette action est irréversible.
          </p>
        </div>

        <button
          onClick={handleAutoSeed}
          disabled={isSeeding}
          className="btn-primary px-6 py-3 flex items-center gap-2 text-sm font-semibold disabled:opacity-50"
        >
          {isSeeding ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5" />}
          {isSeeding ? 'Injection en cours...' : 'Lancer l\'injection des données'}
        </button>
      </div>
    </div>
  );
}

// Helper: convert a File to a data URL (base64) for immediate preview/storage
// Upload file to Supabase Storage 'images' bucket and return public URL
const uploadFileToSupabase = async (file: File, pathPrefix = 'uploads') => {
    const path = `${pathPrefix}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.-_]/g, '_')}`;
    const { error: uploadErr } = await supabase.storage.from('images').upload(path, file, { upsert: true });
  if (uploadErr) throw uploadErr;
  const publicUrl = supabase.storage.from('images').getPublicUrl(path).data.publicUrl;
  return publicUrl;
};

// Sanitize image URL before saving to DB
const sanitizeImageUrl = (url?: string) => {
  if (!url) return '';
  const trimmed = String(url).trim();
  // Replace obviously-broken test CDN references
  if (/your\.cdn/i.test(trimmed)) return '/placeholder-image.svg';
  // Accept local relative paths or http(s) urls
  if (/^(https?:\/\/|\/)/i.test(trimmed)) return trimmed;
  // Fallback to placeholder
  return '/placeholder-image.svg';
};

// Check that an image URL actually loads (with timeout). Returns true if load succeeds.
const checkImageExists = (url: string, timeout = 5000): Promise<boolean> => {
  return new Promise((resolve) => {
    if (!url) return resolve(false);
    try {
      const img = new Image();
      let done = false;
      const timer = setTimeout(() => {
        if (!done) { done = true; resolve(false); }
      }, timeout);
      img.onload = () => { if (!done) { done = true; clearTimeout(timer); resolve(true); } };
      img.onerror = () => { if (!done) { done = true; clearTimeout(timer); resolve(false); } };
      img.src = url;
      // In some environments setting src after onload/onerror may trigger sync events
    } catch (e) {
      return resolve(false);
    }
  });
};

// Categories Management Component
function CategoriesManagement() {
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [loading, setLoading] = useState(true);

  // Load categories
  useEffect(() => {
    loadCategories();
  }, []);

  // Access global data reload so we can notify the DataContext after changes
  const { reloadData } = useDataContext();

  const loadCategories = async () => {
    setLoading(true);
    const data = await categoriesService.getAll();
    setCategories(data);
    setLoading(false);
  };

  const { reload } = useCategories();
  const handleSaveCategory = async (categoryData: Omit<CustomCategory, 'id' | 'created_at' | 'updated_at'>) => {
    // sanitize image before saving
    const categoryToSave = { ...categoryData, image: sanitizeImageUrl((categoryData as any).image) };
    if (editingCategory) {
      // Update existing category
      const updated = await categoriesService.update(editingCategory.id, categoryToSave);
      if (updated) {
        await loadCategories();
  // refresh global merged data so ProductForm sees new characteristics
  await reloadData();
  reload();
        setEditingCategory(null);
      }
    } else {
      // Create new category
      const created = await categoriesService.create(categoryToSave);
      if (created) {
        await loadCategories();
  // refresh global merged data so ProductForm sees new categories immediately
  await reloadData();
  reload();
        setShowAddForm(false);
      }
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les produits associés seront également supprimés.')) {
      const success = await categoriesService.delete(id);
      if (success) {
        await loadCategories();
  // refresh global merged data after deletion
  await reloadData();
      }
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold text-white">Catégories</h2>
        <button
          onClick={() => { setEditingCategory(null); setShowAddForm(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          className="btn-primary px-4 py-2 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une catégorie
        </button>
      </div>

      {(showAddForm || editingCategory) && (
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingCategory ? 'Modifier la Catégorie' : 'Nouvelle Catégorie'}
          </h3>
          <CategoryForm
            category={editingCategory}
            onCancel={() => {
              setShowAddForm(false);
              setEditingCategory(null);
            }}
            onSave={handleSaveCategory}
          />
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-blue mx-auto"></div>
            <p className="mt-2 text-slate-400">Chargement...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-6">
            <div className="text-center text-slate-400 py-8">
              <div className="bg-electric-blue/10 border border-electric-blue/30 rounded-2xl p-6 max-w-2xl mx-auto mb-6">
                <h3 className="text-xl font-bold text-white mb-2">🚀 Initialisation Rapide</h3>
                <p className="text-slate-300 mb-4">
                  Il semble que votre base de données soit vide. Voulez-vous injecter automatiquement les données réelles de <strong>Bedouielec Transformateurs</strong> (Transformateurs MT/BT, Cellules HTA, Accessoires) ?
                </p>
                <button
                  onClick={async () => {
                    if (!window.confirm("Voulez-vous vraiment injecter les données réelles de Bedouielec ?")) return;
                    setLoading(true);
                    try {
                      // 1. Categories
                      const cat1 = await categoriesService.create({
                        name: "Transformateurs de Puissance",
                        description: "Transformateurs MT/BT immergés dans l'huile et secs pour la distribution d'énergie industrielle.",
                        image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=800",
                        characteristics: ["Puissance (kVA)", "Tension Primaire (kV)", "Tension Secondaire (V)", "Couplage"]
                      });
                      const cat2 = await categoriesService.create({
                        name: "Cellules HTA",
                        description: "Cellules moyenne tension pour la protection et la distribution électrique industrielle (IM, QM).",
                        image: "https://images.unsplash.com/photo-1620601550993-2a4c10214a1a?auto=format&fit=crop&q=80&w=800",
                        characteristics: ["Type", "Tension Assignée (kV)", "Courant Nominal (A)"]
                      });
                      const cat3 = await categoriesService.create({
                        name: "Accessoires & Protections",
                        description: "Équipements de protection et accessoires pour transformateurs électriques.",
                        image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800",
                        characteristics: ["Type de protection", "Compatibilité"]
                      });
                      
                      // 2. Products
                      if (cat1 && (cat1 as any).id) {
                        await productsService.create({
                          name: "Transformateur Immergé 100 kVA",
                          description: "Transformateur de distribution immergé dans l'huile minérale, pertes normales, couplage Dyn11. Haute performance et durabilité.",
                          price: 6500,
                          image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=800",
                          category_id: (cat1 as any).id,
                          characteristics: { "Puissance (kVA)": "100", "Tension Primaire (kV)": "30", "Tension Secondaire (V)": "400", "Couplage": "Dyn11" }
                        });
                        await productsService.create({
                          name: "Transformateur Immergé 250 kVA",
                          description: "Transformateur MT/BT à bain d'huile pour usage industriel intensif. Refroidissement ONAN.",
                          price: 11200,
                          image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=800",
                          category_id: (cat1 as any).id,
                          characteristics: { "Puissance (kVA)": "250", "Tension Primaire (kV)": "30", "Tension Secondaire (V)": "400", "Couplage": "Dyn11" }
                        });
                        await productsService.create({
                          name: "Transformateur Immergé 630 kVA",
                          description: "Transformateur grande puissance pour les grands sites industriels. Norme CEI.",
                          price: 21500,
                          image: "https://images.unsplash.com/photo-1544724569-5f546fd6f2b5?auto=format&fit=crop&q=80&w=800",
                          category_id: (cat1 as any).id,
                          characteristics: { "Puissance (kVA)": "630", "Tension Primaire (kV)": "30", "Tension Secondaire (V)": "400", "Couplage": "Dyn11" }
                        });
                      }

                      if (cat2 && (cat2 as any).id) {
                        await productsService.create({
                          name: "Cellule HTA Interrupteur (IM) 24kV",
                          description: "Cellule d'arrivée ou de départ à interrupteur sectionneur.",
                          price: 4200,
                          image: "https://images.unsplash.com/photo-1620601550993-2a4c10214a1a?auto=format&fit=crop&q=80&w=800",
                          category_id: (cat2 as any).id,
                          characteristics: { "Type": "Interrupteur (IM)", "Tension Assignée (kV)": "24", "Courant Nominal (A)": "400" }
                        });
                        await productsService.create({
                          name: "Cellule HTA Protection Fusible (QM) 24kV",
                          description: "Cellule de protection transformateur par fusibles associés à un interrupteur.",
                          price: 5100,
                          image: "https://images.unsplash.com/photo-1620601550993-2a4c10214a1a?auto=format&fit=crop&q=80&w=800",
                          category_id: (cat2 as any).id,
                          characteristics: { "Type": "Protection Fusible (QM)", "Tension Assignée (kV)": "24", "Courant Nominal (A)": "200" }
                        });
                      }

                      if (cat3 && (cat3 as any).id) {
                        await productsService.create({
                          name: "Relais de Protection DGPT2",
                          description: "Détection Gaz, Pression, et Température (2 seuils) pour la protection intégrale du transformateur.",
                          price: 950,
                          image: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?auto=format&fit=crop&q=80&w=800",
                          category_id: (cat3 as any).id,
                          characteristics: { "Type de protection": "Gaz, Pression, Température", "Compatibilité": "Transformateur Hermétique" }
                        });
                      }
                      
                      alert("✅ Données Bedouielec injectées avec succès !");
                      window.location.reload();
                    } catch(e: any) {
                      console.error(e);
                      alert("Erreur lors de l'injection : " + e.message);
                      setLoading(false);
                    }
                  }}
                  className="btn-primary w-full py-3"
                >
                  <Zap className="w-5 h-5 mr-2 inline" />
                  Injecter les données Bedouielec (Auto-Seeder)
                </button>
              </div>
              <p>Aucune catégorie personnalisée pour le moment.</p>
              <p>Cliquez sur "Ajouter une catégorie" pour commencer.</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="border-b border-white/10 bg-white/2">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Caractéristiques
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {categories.map((category) => (
                  <tr key={category.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                          src={sanitizeImageUrl(category.image || '/placeholder-image.svg')}
                          alt={category.name}
                          onError={(e) => { e.currentTarget.src = '/placeholder-image.svg'; }}
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-200">{category.name}</div>
                          <div className="text-sm text-slate-400">
                            Créée le {new Date(category.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300 max-w-xs truncate">
                        {category.description || 'Aucune description'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-300">
                        {category.characteristics.length} caractéristique(s)
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setShowAddForm(false); setEditingCategory(category); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="text-electric-blue hover:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Products Management Component
function ProductsManagement() {
  // Use DataContext hook for global reload and immediate UI updates
  // Pull merged categories (static + custom) from the global DataContext so the
    // admin product form can select any category shown in the site's header.
    const { reloadData, addProduct, updateProductInContext, removeProductInContext, categories } = useDataContext();
  const [products, setProducts] = useState<CustomProduct[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<CustomProduct | null>(null);
  const [loading, setLoading] = useState(true);

  // Provide a sorted & grouped categories list for admin UI.
  // Keep a full sorted list (static first, custom next) for display mapping,
  // but also expose `customCategories` which contains only admin-created categories
  // — this will be used by the ProductForm select so it shows only admin categories.
  const sortedCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    const staticCats = categories.filter((c: any) => !c.isCustom).slice().sort((a: any, b: any) => a.name.localeCompare(b.name));
    const customCats = categories.filter((c: any) => c.isCustom).slice().sort((a: any, b: any) => a.name.localeCompare(b.name));
    return [...staticCats, ...customCats];
  }, [categories]);

  // Only admin-created categories (used for the ProductForm select)
  const customCategories = useMemo(() => {
    if (!categories || categories.length === 0) return [];
    // Normalize characteristics shape for custom categories to always be an array of strings
    return categories
      .filter((c: any) => c.isCustom)
      .map((c: any) => {
        const cat = { ...c };
        const ch = cat.characteristics;
        if (!ch) {
          cat.characteristics = [];
        } else if (Array.isArray(ch)) {
          cat.characteristics = ch.map((x: any) => String(x).trim()).filter((x: string) => x);
        } else if (typeof ch === 'string') {
          // try parse JSON array like string, else split by comma/newline
          try {
            const parsed = JSON.parse(ch);
            if (Array.isArray(parsed)) cat.characteristics = parsed.map((x: any) => String(x).trim()).filter((x: string) => x);
            else cat.characteristics = [String(parsed).trim()];
          } catch (e) {
            cat.characteristics = ch.split(/[,\n]/).map((s: string) => s.trim()).filter((s: string) => s);
          }
        } else if (typeof ch === 'object') {
          cat.characteristics = Object.keys(ch).map(k => String(k));
        } else {
          cat.characteristics = [];
        }
        return cat;
      })
      .slice()
      .sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [categories]);

  // Load products and categories
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
  setLoading(true);
  const productsData = await productsService.getAll();
  setProducts(productsData);
  setLoading(false);
  };

  const { reload, updateProduct } = useProducts();
  const handleSaveProduct = async (productData: Omit<CustomProduct, 'id' | 'created_at' | 'updated_at'>) => {
    if (editingProduct) {
      // Update existing product via hook
      const updated = await updateProduct(editingProduct.id, productData);
      if (updated) {
        // update local admin list and global merged list
        await loadData();
        reload();
        updateProductInContext(editingProduct.id, updated);
        await reloadData();
        setEditingProduct(null);
        return updated;
      }
    } else {
      // Create new product
      const created = await productsService.create(productData);
      if (created) {
        // prepend to admin local and global merged list so it appears immediately
        await loadData();
        reload();
        addProduct(created);
        await reloadData();
        setShowAddForm(false);
        return created;
      }
    }
    return null;
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const success = await productsService.delete(id);
      if (success) {
        await loadData();
        removeProductInContext(id);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-white">Produits</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary bg-electric-cyan text-slate-900 hover:bg-cyan-400 px-4 py-2 flex items-center disabled:opacity-50"
          disabled={customCategories.length === 0}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un produit
        </button>
      </div>

  {customCategories.length === 0 && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 mb-6">
          <p className="text-amber-400">
    Vous devez d'abord créer au moins une catégorie personnalisée (onglet Catégories) avant de pouvoir ajouter des produits.
          </p>
        </div>
      )}

  {(showAddForm || editingProduct) && customCategories.length > 0 && (
        <div className="glass-card p-6 rounded-2xl mb-6">
          <h3 className="text-lg font-medium mb-4">
            {editingProduct ? 'Modifier le Produit' : 'Nouveau Produit'}
          </h3>
          <ProductForm
            product={editingProduct}
    categories={customCategories}
            onCancel={() => {
              setShowAddForm(false);
              setEditingProduct(null);
            }}
            onSave={handleSaveProduct}
          />
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-electric-cyan mx-auto"></div>
            <p className="mt-2 text-slate-400">Chargement...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="p-6">
            <div className="text-center text-slate-400 py-8">
              Aucun produit personnalisé pour le moment.
              <br />
              {categories.length > 0 ? 'Cliquez sur "Ajouter un produit" pour commencer.' : 'Créez d\'abord une catégorie.'}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/5">
              <thead className="border-b border-white/10 bg-white/2">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Produit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Prix
                  </th>
                  {/* Stock column removed intentionally */}
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {products.map((product) => (
                  <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          className="h-10 w-10 rounded-lg object-cover mr-3"
                          src={sanitizeImageUrl(product.image || '/placeholder-image.svg')}
                          alt={product.name}
                          onError={(e) => { e.currentTarget.src = '/placeholder-image.svg'; }}
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-200">{product.name}</div>
                          <div className="text-sm text-slate-400 max-w-xs truncate">
                            {product.description || 'Aucune description'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">
                        {sortedCategories.find((cat: any) => cat.id === product.category_id)?.name || 'Catégorie supprimée'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-slate-200">
                        {product.price.toLocaleString()} TND
                      </div>
                    </td>
                    {/* Stock display removed from admin products table */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => { setShowAddForm(false); setEditingProduct(product); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="text-electric-blue hover:text-blue-400"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// Category Form Component
function CategoryForm({
  category,
  onCancel,
  onSave
}: {
    category?: CustomCategory | null;
    onCancel: () => void;
  onSave: (data: Omit<CustomCategory, 'id' | 'created_at' | 'updated_at'>) => void;
}) {
  const { state } = useAppContext();
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    image: category?.image || '',
  characteristics: (category?.characteristics && category.characteristics.length) ? category.characteristics : ['']
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addCharacteristic = () => {
    setFormData(prev => ({
      ...prev,
      characteristics: [...prev.characteristics, '']
    }));
  };

  const removeCharacteristic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.filter((_, i) => i !== index)
    }));
  };

  const updateCharacteristic = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      characteristics: prev.characteristics.map((char, i) => i === index ? value : char)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setSaving(true);
    setError(null);
    try {
      // Vérifie la session utilisateur Supabase
      const { supabase } = await import('../supabaseClient');
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;
      if (!email || !state.isAdmin) {
        setError('Vous devez être connecté en tant qu’admin pour ajouter une catégorie.');
        setSaving(false);
        return;
      }
      // Require a valid image URL before saving
      const imageUrl = (formData.image || '').trim();
      if (!imageUrl) {
        setError('Veuillez coller une URL d\'image valide.');
        setSaving(false);
        return;
      }
      const imgOk = await checkImageExists(sanitizeImageUrl(imageUrl));
      if (!imgOk) {
        setError('L\'URL de l\'image est invalide ou l\'image ne peut pas être chargée.');
        setSaving(false);
        return;
      }
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: formData.image.trim(),
        characteristics: formData.characteristics.filter(char => char.trim() !== '')
      });
    } catch (err) {
      setError('Erreur lors de l’ajout de la catégorie. Vérifiez votre connexion ou vos droits.');
      console.error('Erreur ajout catégorie:', err);
    } finally {
      setSaving(false);
    }
  };

  // When the category prop changes (e.g. clicking edit on another row), reset the form data
  useEffect(() => {
    setFormData({
      name: category?.name || '',
      description: category?.description || '',
      image: category?.image || '',
      characteristics: (category?.characteristics && category.characteristics.length) ? category.characteristics : ['']
    });
  }, [category]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Nom de la catégorie *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="admin-input w-full"
          placeholder="Ex: Transformateurs haute tension"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="admin-input w-full"
          placeholder="Description de la catégorie..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Image (collez l'URL)
        </label>
        <input
          type="url"
          value={formData.image}
          onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value.trim() }))}
          placeholder="https://example.com/image.jpg"
          className="admin-input w-full text-sm"
        />
        {formData.image && (
          <img src={sanitizeImageUrl(formData.image)} alt="preview" className="mt-3 h-32 object-contain" />
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Caractéristiques spécifiques à cette catégorie
        </label>
        {formData.characteristics.map((char, index) => (
          <div key={index} className="flex items-center space-x-2 mb-2">
            <input
              type="text"
              value={char}
              onChange={(e) => updateCharacteristic(index, e.target.value)}
              className="admin-input flex-1"
              placeholder="Ex: Puissance, Tension, Fréquence..."
            />
            {formData.characteristics.length > 1 && (
              <button
                type="button"
                onClick={() => removeCharacteristic(index)}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        <div className="mt-2">
          <button
            type="button"
            onClick={addCharacteristic}
            className="px-3 py-2 bg-white/5 text-slate-300 rounded-xl hover:bg-white/10 text-sm transition-colors border border-white/10"
          >
            + Ajouter une caractéristique
          </button>
        </div>
        <button
          type="submit"
          disabled={saving || !formData.name.trim()}
          className="btn-primary px-4 py-2 mt-4 flex items-center"
        >
          {saving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          )}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}

// Product Form Component
function ProductForm({
  product,
  categories = [],
  onCancel,
  onSave
}: {
    product?: CustomProduct | null;
    categories: CustomCategory[];
  onCancel: () => void;
  onSave: (data: Omit<CustomProduct, 'id' | 'created_at' | 'updated_at'>) => Promise<any | null>;
}) {
  const { state } = useAppContext();
  const [formData, setFormData] = useState({
  name: product?.name || '',
  description: product?.description || '',
  price: product?.price || 0,
  image: product?.image || '',
  category_id: product?.category_id || (categories[0]?.id || ''),
  characteristics: product?.characteristics || {},
  characteristicsRaw: product && product.characteristics ? Object.entries(product.characteristics).map(([k,v]) => `${k}: ${v}`).join('\n') : '',
  variations: product?.variations || [],
  stock: product?.stock ?? 1
  });

  const [saving, setSaving] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<CustomCategory | null>(
    categories.find(cat => cat.id === formData.category_id) || categories[0] || null
  );

  // If creating a new product and there is at least one admin category, preselect it so
  // its characteristic inputs are shown immediately.
  useEffect(() => {
    if (!product && categories && categories.length > 0) {
      const first = categories[0];
      if (first && !formData.category_id) {
        setFormData(prev => ({ ...prev, category_id: first.id }));
        setSelectedCategory(first as CustomCategory);
      }
    }
  }, [product, categories]);

  // Update characteristics when category changes
  useEffect(() => {
    if (selectedCategory && !product) {
      // Initialize characteristics for new product.
      // Support two shapes coming from categories: an array of names or an object mapping.
      const newCharacteristics: { [key: string]: string } = {};
      if (Array.isArray(selectedCategory.characteristics) && selectedCategory.characteristics.length > 0) {
        selectedCategory.characteristics.forEach((char: string) => {
          newCharacteristics[char] = '';
        });
      } else if (selectedCategory.characteristics && typeof selectedCategory.characteristics === 'object') {
        Object.keys(selectedCategory.characteristics).forEach((char: string) => {
          newCharacteristics[char] = '';
        });
      }
  // Also populate the freeform textarea representation so admin can edit in bulk
  const raw = Object.entries(newCharacteristics).map(([k, v]) => `${k}: ${v}`).join('\n');
  setFormData(prev => ({ ...prev, characteristics: newCharacteristics, characteristicsRaw: raw }));
    }
  }, [selectedCategory, product]);

  const handleCategoryChange = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    setSelectedCategory(category || null);
    setFormData(prev => ({
      ...prev,
      category_id: categoryId,
      // Reset characteristics when changing category. Support array or object shapes.
      characteristics: (category && Array.isArray(category.characteristics))
        ? category.characteristics.reduce((acc: any, char: string) => ({ ...acc, [char]: '' }), {})
        : (category && category.characteristics && typeof category.characteristics === 'object')
          ? Object.keys(category.characteristics).reduce((acc: any, char: string) => ({ ...acc, [char]: '' }), {})
          : {}
    }));
  };

  // Compute characteristic keys to render (supports array or object on the category)
  const characteristicKeys = useMemo(() => {
    if (!selectedCategory) return [] as string[];
    if (Array.isArray(selectedCategory.characteristics)) return selectedCategory.characteristics as string[];
    if (selectedCategory.characteristics && typeof selectedCategory.characteristics === 'object') return Object.keys(selectedCategory.characteristics as Record<string, any>);
    return [] as string[];
  }, [selectedCategory]);

  const handleCharacteristicChange = (characteristic: string, value: string) => {
    const newChars = {
      ...formData.characteristics,
      [characteristic]: value
    };
    const raw = Object.entries(newChars).map(([k, v]) => `${k}: ${v}`).join('\n');
    setFormData(prev => ({
      ...prev,
      characteristics: newChars,
      characteristicsRaw: raw
    }));
  };

  /*
  const fillFromCategory = () => {
    if (!selectedCategory) return;
    const ch = selectedCategory.characteristics;
    const result: { [k: string]: string } = {};
    if (Array.isArray(ch)) {
      ch.forEach((k: string) => { result[k] = formData.characteristics[k] || '' });
    } else if (ch && typeof ch === 'object') {
      // keep values if present in the object
      Object.keys(ch).forEach((k: string) => { result[k] = String((ch as any)[k] ?? formData.characteristics[k] ?? '') });
    }
  // Also update textarea representation
  const raw = Object.entries(result).map(([k, v]) => `${k}: ${v}`).join('\n');
  setFormData(prev => ({ ...prev, characteristics: result, characteristicsRaw: raw }));
  };
  */

  const parseCharacteristicsRaw = (raw: string) => {
    const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
    const obj: { [k: string]: string } = {};
    lines.forEach(line => {
      const sepIndex = line.indexOf(':');
      if (sepIndex === -1) return;
      const key = line.slice(0, sepIndex).trim();
      const val = line.slice(sepIndex + 1).trim();
      if (key) obj[key] = val;
    });
    return obj;
  };

  // When the admin edits the textarea directly, parse it and update the characteristics object
  const handleCharacteristicsRawChange = (raw: string) => {
    const parsed = parseCharacteristicsRaw(raw);
    setFormData(prev => ({ ...prev, characteristicsRaw: raw, characteristics: { ...prev.characteristics, ...parsed } }));
  };

  /*
  const addVariation = () => {
    setFormData(prev => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          type: '',
          options: [{ name: '', price: 0 }]
        }
      ]
    }));
  };

  const removeVariation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.filter((_, i) => i !== index)
    }));
  };

  const updateVariation = (index: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === index ? { ...variation, [field]: value } : variation
      )
    }));
  };

  const addVariationOption = (variationIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === variationIndex
          ? { ...variation, options: [...variation.options, { name: '', price: 0 }] }
          : variation
      )
    }));
  };

  const removeVariationOption = (variationIndex: number, optionIndex: number) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === variationIndex
          ? { ...variation, options: variation.options.filter((_, j) => j !== optionIndex) }
          : variation
      )
    }));
  };

  const updateVariationOption = (variationIndex: number, optionIndex: number, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      variations: prev.variations.map((variation, i) =>
        i === variationIndex
          ? {
              ...variation,
              options: variation.options.map((option, j) =>
                j === optionIndex ? { ...option, [field]: value } : option
              )
            }
          : variation
      )
    }));
  };
  */

  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.category_id || formData.price <= 0) return;

    setSaving(true);
    setError(null);
    try {
      // Vérifie la session utilisateur Supabase
      const { supabase } = await import('../supabaseClient');
      const { data } = await supabase.auth.getSession();
      const email = data.session?.user?.email;
  if (!email || !state.isAdmin) {
        setError('Vous devez être connecté en tant qu’admin pour ajouter un produit.');
        setSaving(false);
        return;
      }
      // Require a valid image URL before saving product
      const imageUrl = (formData.image || '').trim();
      if (!imageUrl) {
        setError('Veuillez coller une URL d\'image valide pour le produit.');
        setSaving(false);
        return;
      }
      const imgOk = await checkImageExists(sanitizeImageUrl(imageUrl));
      if (!imgOk) {
        setError('L\'URL de l\'image du produit est invalide ou l\'image ne peut pas être chargée.');
        setSaving(false);
        return;
      }
      // Ensure category_id is a UUID that exists in custom_categories.
      // If admin selected a static category, create or find a corresponding custom category.
      let categoryIdToUse = formData.category_id;
      const selectedCat = categories.find(c => c.id === formData.category_id) || null;
  if (selectedCat && !(selectedCat as any).isCustom) {
        // Try to find an existing custom category with the same name
        const existingCustom = (await categoriesService.getAll()).find((cc: any) => cc.name.toLowerCase() === String(selectedCat.name).toLowerCase());
        if (existingCustom) {
          categoryIdToUse = existingCustom.id;
        } else {
          // Create a custom category copy and use its id
          const created = await categoriesService.create({
            name: selectedCat.name,
            description: selectedCat.description || '',
            image: selectedCat.image || '',
            characteristics: []
          });
          if (created && (created as any).id) {
            categoryIdToUse = (created as any).id;
          }
        }
      }

      // Compute characteristics: if selected category had no predefined list, parse the freeform textarea
      const characteristicsToSend = (selectedCat && Array.isArray(selectedCat.characteristics) && selectedCat.characteristics.length > 0)
        ? formData.characteristics
        : parseCharacteristicsRaw(formData.characteristicsRaw || '');

  const result = await onSave({
  name: formData.name.trim(),
  description: formData.description.trim(),
  price: Number(formData.price),
  image: sanitizeImageUrl(formData.image.trim()),
  category_id: categoryIdToUse,
  characteristics: characteristicsToSend,
  variations: formData.variations.filter(v => v.type.trim() !== ''),
      });
      if (result) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    } catch (err) {
  // Show a readable error message returned by the service when possible
  const message = (err && (err as any).message) ? (err as any).message : 'Erreur lors de l’ajout du produit. Vérifiez votre connexion ou vos droits.';
  setError(message);
  console.error('Erreur ajout produit:', err);
    } finally {
      setSaving(false);
    }
  };

  // When the `product` prop changes (clicking edit on another product), reset the form data
  useEffect(() => {
    setFormData({
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || 0,
      image: product?.image || '',
      category_id: product?.category_id || (categories[0]?.id || ''),
      characteristics: product?.characteristics || {},
      characteristicsRaw: product && product.characteristics ? Object.entries(product.characteristics).map(([k,v]) => `${k}: ${v}`).join('\n') : '',
      variations: product?.variations || [],
      stock: product?.stock ?? 1
    });
    // Update selectedCategory based on product
    setSelectedCategory(categories.find(cat => cat.id === (product?.category_id || '')) || categories[0] || null);
  }, [product, categories]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-2 rounded mb-2 text-sm">
          {error}
        </div>
      )}
      {saved && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 p-2 rounded mb-2 text-sm">
          Enregistré avec succès
        </div>
      )}
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Nom du produit *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className="admin-input w-full"
            placeholder="Ex: Transformateur 100kVA"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Prix (TND) *
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
            className="admin-input w-full"
            placeholder="0.00"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="admin-input w-full"
          placeholder="Description du produit..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Catégorie *
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="admin-input w-full"
            required
          >
            <option value="" className="bg-dark-card text-white">Sélectionnez une catégorie personnalisée...</option>
            {categories.map(category => (
              <option key={category.id} value={category.id} className="bg-dark-card text-white">
                {category.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500 mt-1">Affiche uniquement les catégories créées par l'admin.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Image (collez l'URL)
          </label>
          <input
            type="url"
            value={formData.image}
            onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value.trim() }))}
            placeholder="https://example.com/image.jpg"
            className="admin-input w-full text-sm"
          />
          {formData.image && (
            <img src={sanitizeImageUrl(formData.image)} alt="preview" className="mt-3 h-32 object-contain" />
          )}
        </div>
      </div>

  {/* Characteristics */}
      {characteristicKeys.length > 0 && (
        <div>
          <div className="flex items-center justify-between">
            <h4 className="text-lg font-medium text-white mb-3">Caractéristiques</h4>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500" title="Caractéristiques définies par la catégorie"></span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {characteristicKeys.map((characteristic) => (
              <div key={characteristic}>
                <label className="block text-sm font-medium text-slate-300 mb-2">{characteristic}</label>
                <input
                  type="text"
                  value={formData.characteristics[characteristic] || ''}
                  onChange={(e) => handleCharacteristicChange(characteristic, e.target.value)}
                  className="admin-input w-full"
                  placeholder={`Valeur pour ${characteristic}`}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* If the selected category has no predefined characteristics, show a freeform textarea
          allowing the admin to enter "key: value" per line. This is parsed before submit. */}
      {selectedCategory && (!Array.isArray(selectedCategory.characteristics) || selectedCategory.characteristics.length === 0) && (
        <div>
          <h4 className="text-lg font-medium text-white mb-3">Caractéristiques (format clé: valeur par ligne)</h4>
          <textarea
            value={formData.characteristicsRaw}
            onChange={(e) => handleCharacteristicsRawChange(e.target.value)}
            rows={6}
            className="admin-input w-full"
            placeholder={`Ex:\nPuissance: 100 kVA\nTension: 400 V`}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-white/10">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 text-slate-300 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all disabled:opacity-50"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={saving || !formData.name.trim() || !formData.category_id || formData.price <= 0}
          className="btn-primary bg-electric-cyan text-slate-900 hover:bg-cyan-400 px-4 py-2 flex items-center disabled:opacity-50"
        >
          {saving && (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900 mr-2"></div>
          )}
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}
