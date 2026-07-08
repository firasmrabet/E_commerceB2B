import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://ppwwttumnhgoymzcwfcc.supabase.co';
// ⚠️ Le seed a besoin de la SERVICE ROLE KEY pour bypasser le Row Level Security (RLS)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Missing SUPABASE_SERVICE_ROLE_KEY in .env!");
  console.error("   Ajoutez: SUPABASE_SERVICE_ROLE_KEY=votre_service_role_key");
  console.error("   (Dashboard Supabase → Settings → API → service_role key)");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * IMAGES
 * Each category gets its OWN distinct, real, high-resolution photo (free Unsplash
 * License, verified individually) so nothing is duplicated or mismatched anymore.
 * NOTE: these are realistic *category-representative* stock photos (transformers,
 * switchgear cabinets, prefab substations, grid infrastructure, on-site maintenance).
 * Bedouielec doesn't have a public catalog of studio photos per SKU, so exact
 * per-reference-number product photos aren't available online - if you have real
 * site/product photos you'd like used instead, upload them and I can wire those in.
 */
const IMG = {
  transformateur: 'https://images.unsplash.com/photo-1760789149696-30ce2d28b331?auto=format&fit=crop&w=1200&q=80', // transformateur sur poteau
  celluleHTA: 'https://images.unsplash.com/photo-1566417110090-6b15a06ec800?auto=format&fit=crop&w=1200&q=80',      // armoire/cellule de coupure
  posteTransfo: 'https://images.unsplash.com/photo-1636654559997-b16e50f81d20?auto=format&fit=crop&w=1200&q=80',    // poste de transformation (façade)
  condensateurs: 'https://images.unsplash.com/photo-1509390673020-a5b2450e33f1?auto=format&fit=crop&w=1200&q=80',   // infrastructure réseau HT
  maintenance: 'https://images.unsplash.com/photo-1693013112835-5f3128bb555f?auto=format&fit=crop&w=1200&q=80',     // poste HT / intervention terrain

  // Nouvelles catégories (photos réelles distinctes, licence Unsplash/Pexels gratuite)
  cables: 'https://images.unsplash.com/photo-1759060529143-3498c43267da?auto=format&fit=crop&w=1200&q=80',          // poteau, transformateur et câbles
  armoires: 'https://images.pexels.com/photos/5767595/pexels-photo-5767595.jpeg?auto=compress&cs=tinysrgb&w=1200',   // armoire/coffret de coupure ouvert
  relais: 'https://images.pexels.com/photos/19841115/pexels-photo-19841115.jpeg?auto=compress&cs=tinysrgb&w=1200',   // relais dans un coffret industriel
  disjoncteurs: 'https://images.pexels.com/photos/35573433/pexels-photo-35573433.jpeg?auto=compress&cs=tinysrgb&w=1200', // panneau de disjoncteurs
  contacteurs: 'https://images.pexels.com/photos/28950842/pexels-photo-28950842.jpeg?auto=compress&cs=tinysrgb&w=1200', // câblage de panneau industriel
};

const REAL_CATEGORIES = [
  { name: 'Transformateurs Haute Tension (HT)', description: 'Transformateurs de distribution HT/BT immergés et secs, 30kV' },
  { name: 'Cellules HTA (MT/BT)', description: 'Cellules moyenne tension sous enveloppe métallique, 24kV' },
  { name: 'Postes de Transformation 30KV', description: 'Postes préfabriqués, cabines maçonnées et postes sur poteau' },
  { name: 'Batteries de Condensateurs', description: "Compensation d'énergie réactive et réduction des pénalités STEG" },
  { name: 'Services de Maintenance', description: "Maintenance haute tension, analyses et traitement d'huile" },

  // --- Nouvelles catégories : matériel électrique pour grandes usines ---
  { name: 'Câbles Électriques Industriels', description: "Câbles BT/MT pour armoires, chemins de câbles et raccordements d'usine" },
  { name: 'Armoires & Coffrets Électriques Industriels', description: 'Armoires TGBT, coffrets de puissance et de commande sur mesure' },
  { name: 'Relais de Protection & Automatismes', description: 'Relais de protection, relais thermiques et temporisateurs industriels' },
  { name: 'Disjoncteurs Industriels (BT/MT)', description: 'Disjoncteurs de puissance, moteur et différentiels pour installations industrielles' },
  { name: 'Contacteurs & Démarreurs Moteur', description: 'Contacteurs, démarreurs directs et variateurs de vitesse' },
];

const REAL_PRODUCTS = [
  // --- Transformateurs Haute Tension (HT) ---
  {
    name: 'Transformateur Immergé 100 kVA - 30/0.4kV',
    price: 12500,
    category_name: 'Transformateurs Haute Tension (HT)',
    description: 'Transformateur de distribution triphasé immergé dans l\'huile minérale, 100 kVA, 30kV/400V. Couplage Dyn11, refroidissement ONAN, conforme normes IEC 60076 et cahier des charges STEG.',
    image: IMG.transformateur,
  },
  {
    name: 'Transformateur Immergé 250 kVA - 30/0.4kV',
    price: 18900,
    category_name: 'Transformateurs Haute Tension (HT)',
    description: 'Transformateur de distribution triphasé immergé, 250 kVA, 30kV/400V. Cuve à ailettes, conservateur d\'huile, adapté aux environnements industriels.',
    image: IMG.transformateur,
  },
  {
    name: 'Transformateur Immergé 630 kVA - 30/0.4kV',
    price: 28500,
    category_name: 'Transformateurs Haute Tension (HT)',
    description: 'Transformateur de puissance 630 kVA, pertes réduites, refroidissement ONAN. Idéal pour sites industriels et stations de pompage à forte charge.',
    image: IMG.transformateur,
  },
  {
    name: 'Transformateur Sec Enrobé 400 kVA - 30/0.4kV',
    price: 35000,
    category_name: 'Transformateurs Haute Tension (HT)',
    description: 'Transformateur de type sec, isolation résine époxy, 400 kVA. Auto-extinguible, sans huile, recommandé pour hôpitaux, centres commerciaux et bâtiments recevant du public.',
    image: IMG.transformateur,
  },
  {
    name: 'Transformateur Immergé 1000 kVA - 30/0.4kV',
    price: 42500,
    category_name: 'Transformateurs Haute Tension (HT)',
    description: 'Transformateur triphasé immergé 1000 kVA pour sites industriels à forte demande de puissance. Bornes HT/BT embrochables en option.',
    image: IMG.transformateur,
  },

  // --- Cellules HTA (MT/BT) ---
  {
    name: 'Cellule HTA Interrupteur-Sectionneur (IM) 24kV',
    price: 8500,
    category_name: 'Cellules HTA (MT/BT)',
    description: 'Cellule modulaire 24kV sous enveloppe métallique, fonction interrupteur d\'arrivée ou de départ. Intensité nominale 400A/630A, verrouillages de sécurité.',
    image: IMG.celluleHTA,
  },
  {
    name: 'Cellule HTA Protection par Fusibles (QM) 24kV',
    price: 9800,
    category_name: 'Cellules HTA (MT/BT)',
    description: 'Cellule 24kV de protection transformateur combinant interrupteur-sectionneur et fusibles HPC, déclenchement automatique sur défaut.',
    image: IMG.celluleHTA,
  },
  {
    name: 'Cellule HTA Disjoncteur (DM1) 24kV',
    price: 15500,
    category_name: 'Cellules HTA (MT/BT)',
    description: 'Cellule 24kV équipée d\'un disjoncteur débrochable pour protection de départ HTA, avec relais de protection numérique.',
    image: IMG.celluleHTA,
  },
  {
    name: 'Cellule de Comptage HTA 24kV',
    price: 11200,
    category_name: 'Cellules HTA (MT/BT)',
    description: 'Cellule dédiée au comptage d\'énergie en HTA, avec transformateurs de mesure (TT/TC) pour le comptage tarifaire STEG.',
    image: IMG.celluleHTA,
  },

  // --- Postes de Transformation 30KV ---
  {
    name: 'Poste de Transformation Préfabriqué Type Cabine',
    price: 45000,
    category_name: 'Postes de Transformation 30KV',
    description: 'Poste de livraison complet, cabine maçonnée ou préfabriquée béton. Intègre transformateur, cellules HTA et TGBT. Étude, fourniture et installation incluses.',
    image: IMG.posteTransfo,
  },
  {
    name: 'Poste de Transformation sur Poteau (H61)',
    price: 15500,
    category_name: 'Postes de Transformation 30KV',
    description: 'Poste H61 complet pour raccordement aérien rural ou semi-urbain, transformateur 160kVA inclus, avec accessoires d\'accrochage et parafoudres.',
    image: IMG.posteTransfo,
  },
  {
    name: 'Poste Métallique Compact Extérieur',
    price: 32000,
    category_name: 'Postes de Transformation 30KV',
    description: 'Poste de transformation sous enveloppe métallique, installation extérieure, intégrant transformateur, cellules HTA et TGBT dans un ensemble compact.',
    image: IMG.posteTransfo,
  },

  // --- Batteries de Condensateurs ---
  {
    name: 'Batterie de Condensateurs Automatique 150 kVAR',
    price: 4500,
    category_name: 'Batteries de Condensateurs',
    description: 'Armoire de compensation d\'énergie réactive 150 kVAR, régulateur automatique multi-gradins, réduction des pénalités réactives sur facture STEG.',
    image: IMG.condensateurs,
  },
  {
    name: 'Batterie de Condensateurs Automatique 300 kVAR',
    price: 7200,
    category_name: 'Batteries de Condensateurs',
    description: 'Armoire de compensation 300 kVAR avec régulateur automatique et gradins de commutation par contacteurs, adaptée aux réseaux industriels.',
    image: IMG.condensateurs,
  },
  {
    name: 'Batterie de Condensateurs avec Filtres Anti-Harmoniques',
    price: 12800,
    category_name: 'Batteries de Condensateurs',
    description: 'Solution de compensation avec selfs de protection anti-harmoniques (7%), recommandée en présence de variateurs de vitesse et charges non linéaires.',
    image: IMG.condensateurs,
  },

  // --- Services de Maintenance ---
  {
    name: 'Contrat Maintenance Préventive Annuelle Transfo',
    price: 1500,
    category_name: 'Services de Maintenance',
    description: 'Visite préventive annuelle : nettoyage isolateurs, resserrage connexions, contrôle niveau d\'huile, prélèvement pour analyse diélectrique, rapport technique détaillé.',
    image: IMG.maintenance,
  },
  {
    name: 'Traitement & Régénération d\'Huile Diélectrique',
    price: 2200,
    category_name: 'Services de Maintenance',
    description: 'Prestation sur site de filtration, dégazage et déshydratation sous vide de l\'huile minérale du transformateur pour restaurer sa rigidité diélectrique.',
    image: IMG.maintenance,
  },
  {
    name: 'Analyse Diélectrique de l\'Huile (Laboratoire)',
    price: 450,
    category_name: 'Services de Maintenance',
    description: 'Prélèvement et analyse en laboratoire de l\'huile de transformateur : tension de claquage, teneur en eau, indice de neutralisation.',
    image: IMG.maintenance,
  },
  {
    name: 'Maintenance Niveau 3/4 Cellules HTA',
    price: 1800,
    category_name: 'Services de Maintenance',
    description: 'Maintenance approfondie de cellules HTA (contrôle mécanique, essais diélectriques, graissage) réalisée par équipe agréée pour ce niveau d\'intervention.',
    image: IMG.maintenance,
  },
  {
    name: 'Destruction de Transformateur au Pyralène (PCB)',
    price: 3200,
    category_name: 'Services de Maintenance',
    description: 'Dépose, transport sécurisé et destruction réglementaire de transformateurs contenant des PCB/pyralène, avec certificat de traitement conforme.',
    image: IMG.maintenance,
  },

  // --- Câbles Électriques Industriels ---
  {
    name: 'Câble Rigide U-1000 R2V 4x25mm²',
    price: 18,
    category_name: 'Câbles Électriques Industriels',
    description: "Câble rigide cuivre U-1000 R2V, 4 conducteurs 25mm², isolation PR/PVC. Pose fixe extérieure et intérieure, résistant aux UV. Prix au mètre linéaire.",
    image: IMG.cables,
  },
  {
    name: 'Câble Souple HO7RN-F 3G2.5mm²',
    price: 9,
    category_name: 'Câbles Électriques Industriels',
    description: "Câble souple caoutchouc renforcé pour alimentation de machines mobiles et chantiers, 3 conducteurs 2.5mm², résistant à l'huile et à l'abrasion. Prix au mètre linéaire.",
    image: IMG.cables,
  },
  {
    name: 'Câble Aluminium Torsadé Basse Tension 4x50mm²',
    price: 22,
    category_name: 'Câbles Électriques Industriels',
    description: "Câble aluminium torsadé pour réseau de distribution BT aérien, 4 conducteurs 50mm², conforme normes STEG. Prix au mètre linéaire.",
    image: IMG.cables,
  },
  {
    name: 'Chemin de Câbles Métallique Perforé (bac 200mm)',
    price: 35,
    category_name: 'Câbles Électriques Industriels',
    description: 'Chemin de câbles en tôle galvanisée perforée, largeur 200mm, pour cheminement de câbles en armoires et ateliers industriels. Prix au mètre linéaire.',
    image: IMG.cables,
  },

  // --- Armoires & Coffrets Électriques Industriels ---
  {
    name: 'Armoire TGBT 400A sur Mesure',
    price: 9500,
    category_name: 'Armoires & Coffrets Électriques Industriels',
    description: 'Tableau général basse tension 400A, conception et câblage sur plan, jeu de barres cuivre, départs disjoncteurs modulaires. Étude et fabrication en atelier.',
    image: IMG.armoires,
  },
  {
    name: 'Coffret Industriel Étanche IP65 600x800mm',
    price: 850,
    category_name: 'Armoires & Coffrets Électriques Industriels',
    description: 'Coffret métallique étanche IP65 pour installation extérieure ou milieu poussiéreux, platine de montage incluse, serrure à clé.',
    image: IMG.armoires,
  },
  {
    name: 'Armoire de Commande Automate (PLC) avec Pupitre',
    price: 6200,
    category_name: 'Armoires & Coffrets Électriques Industriels',
    description: "Armoire de commande intégrant automate programmable, pupitre opérateur et boutons de commande, pour pilotage de ligne de production.",
    image: IMG.armoires,
  },

  // --- Relais de Protection & Automatismes ---
  {
    name: 'Relais de Protection Numérique Multifonction',
    price: 2800,
    category_name: 'Relais de Protection & Automatismes',
    description: 'Relais de protection numérique pour départs HTA (max de courant, défaut terre), communication Modbus, écran de configuration intégré.',
    image: IMG.relais,
  },
  {
    name: 'Relais Thermique de Protection Moteur 9-13A',
    price: 145,
    category_name: 'Relais de Protection & Automatismes',
    description: 'Relais thermique pour protection contre les surcharges moteur, plage de réglage 9-13A, montage direct sur contacteur.',
    image: IMG.relais,
  },
  {
    name: 'Relais Différentiel avec Tore 30-300mA',
    price: 320,
    category_name: 'Relais de Protection & Automatismes',
    description: 'Relais différentiel réglable associé à un tore de détection, protection contre les défauts d\'isolement en réseau industriel.',
    image: IMG.relais,
  },
  {
    name: 'Temporisateur Multifonction Modulaire',
    price: 95,
    category_name: 'Relais de Protection & Automatismes',
    description: 'Relais temporisateur modulaire pour automatismes (retard travail, retard repos, cyclique), montage sur rail DIN.',
    image: IMG.relais,
  },

  // --- Disjoncteurs Industriels (BT/MT) ---
  {
    name: 'Disjoncteur Industriel Débrochable 630A',
    price: 4200,
    category_name: 'Disjoncteurs Industriels (BT/MT)',
    description: 'Disjoncteur ouvert débrochable 630A pour tableau de distribution principal, déclencheur électronique réglable, pouvoir de coupure élevé.',
    image: IMG.disjoncteurs,
  },
  {
    name: 'Disjoncteur Moteur Magnétothermique 6-10A',
    price: 165,
    category_name: 'Disjoncteurs Industriels (BT/MT)',
    description: 'Disjoncteur moteur avec protection magnétique et thermique réglable, contacts auxiliaires disponibles, pour protection de départ moteur.',
    image: IMG.disjoncteurs,
  },
  {
    name: 'Disjoncteur Différentiel Industriel 4P 63A 300mA',
    price: 380,
    category_name: 'Disjoncteurs Industriels (BT/MT)',
    description: 'Disjoncteur différentiel tétrapolaire 63A, sensibilité 300mA, pour protection de départs industriels contre les défauts d\'isolement.',
    image: IMG.disjoncteurs,
  },

  // --- Contacteurs & Démarreurs Moteur ---
  {
    name: 'Contacteur de Puissance 3P 40A, bobine 230V',
    price: 195,
    category_name: 'Contacteurs & Démarreurs Moteur',
    description: 'Contacteur tripolaire 40A AC-3, bobine commande 230V AC, pour commutation de charges moteur et résistives industrielles.',
    image: IMG.contacteurs,
  },
  {
    name: 'Démarreur Direct Moteur avec Coffret (jusqu\'à 7.5kW)',
    price: 890,
    category_name: 'Contacteurs & Démarreurs Moteur',
    description: 'Ensemble démarreur direct en coffret : sectionneur, contacteur, relais thermique, boutons marche/arrêt, pour moteurs jusqu\'à 7.5kW.',
    image: IMG.contacteurs,
  },
  {
    name: 'Variateur de Vitesse Triphasé 5.5kW',
    price: 2450,
    category_name: 'Contacteurs & Démarreurs Moteur',
    description: 'Variateur de fréquence pour moteur asynchrone triphasé 5.5kW, démarrage/arrêt progressif, protection thermique intégrée, communication Modbus.',
    image: IMG.contacteurs,
  },
];

async function seed() {
  console.log("🔄 Starting DB seeding (FULL REPLACE mode)...");

  // ── Step 1: Delete ALL existing products first (foreign key depends on categories) ──
  console.log("🗑️  Deleting all existing products...");
  const { error: delProdErr } = await supabase.from('custom_products').delete().not('id', 'is', null);
  if (delProdErr) console.error("Error deleting products:", delProdErr);
  else console.log("✅ All products deleted.");

  // ── Step 2: Delete ALL existing categories ──
  console.log("🗑️  Deleting all existing categories...");
  const { error: delCatErr } = await supabase.from('custom_categories').delete().not('id', 'is', null);
  if (delCatErr) console.error("Error deleting categories:", delCatErr);
  else console.log("✅ All categories deleted.");

  // ── Step 3: Insert fresh categories ──
  const categoryMap = {};
  for (const cat of REAL_CATEGORIES) {
    const { data, error } = await supabase.from('custom_categories').insert(cat).select().single();
    if (error) {
      console.error("❌ Error inserting category:", cat.name, error);
    } else {
      console.log("➕ Category added:", cat.name);
      if (data) categoryMap[cat.name] = data.id;
    }
  }

  // ── Step 4: Insert fresh products ──
  for (const prod of REAL_PRODUCTS) {
    const dbProd = {
      name: prod.name,
      price: prod.price,
      description: prod.description,
      image: prod.image,
      category_id: categoryMap[prod.category_name]
    };

    if (!dbProd.category_id) {
      console.warn("⚠️  No category_id for product:", prod.name, "- inserting with null");
    }

    const { error } = await supabase.from('custom_products').insert(dbProd);
    if (error) console.error("❌ Error inserting product:", prod.name, error);
    else console.log("➕ Product added:", prod.name);
  }

  console.log("🎉 Seeding complete! Database fully replaced.");
}

seed();