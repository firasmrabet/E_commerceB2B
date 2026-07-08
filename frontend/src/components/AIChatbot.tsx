import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Bot, User, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../context/AppContext';
import { useDataContext } from '../context/DataContext';
import { useNavigate } from 'react-router-dom';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  actions?: ChatAction[];
  timestamp: Date;
}

interface ChatAction {
  type: 'add_to_cart' | 'open_cart' | 'open_quote' | 'view_category' | 'view_products';
  label: string;
  payload?: any;
}

const WELCOME_MESSAGES: Record<string, string> = {
  fr: '👋 Bonjour ! Je suis votre assistant commercial chez **Bedouielec Transformateurs**. Je peux vous aider à trouver des produits, vous donner des informations sur nos équipements électriques, ou vous guider vers un devis. Comment puis-je vous aider ?',
  en: '👋 Hello! I\'m your sales assistant at **Bedouielec Transformateurs**. I can help you find products, provide information about our electrical equipment, or guide you to a quote. How can I help you?',
  ar: '👋 مرحباً! أنا مساعدك التجاري في **Bedouielec Transformateurs**. يمكنني مساعدتك في العثور على المنتجات أو تقديم معلومات حول معداتنا الكهربائية أو توجيهك نحو عرض أسعار. كيف يمكنني مساعدتك؟',
};

const QUICK_PROMPTS = [
  { label: '📦 Voir les produits', message: 'Montrez-moi vos produits disponibles' },
  { label: '⚡ Transformateurs', message: 'Parlez-moi de vos transformateurs' },
  { label: '💬 Demander un devis', message: 'Je souhaite obtenir un devis' },
  { label: '📞 Contact', message: 'Comment vous contacter ?' },
];

function renderMarkdown(text: string) {
  // Hide internal AI tags from UI
  let cleanText = text
    .replace(/\[ADD_TO_CART:\s*{[^}]+}\s*\]/gi, '')
    .replace(/\[CLEAR_CART\]/gi, '')
    .replace(/\[PRODUCT_MISSING:\s*{[^}]+}\s*\]/gi, '')
    .trim();

  // Escape HTML first to prevent XSS, then apply safe markdown
  const escaped = cleanText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
  return escaped
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

function detectLanguage(text: string): 'fr' | 'en' | 'ar' {
  const arabicPattern = /[\u0600-\u06FF]/;
  if (arabicPattern.test(text)) return 'ar';
  const frenchWords = ['bonjour', 'merci', 'quel', 'comment', 'montrez', 'voulez', 'puis', 'votre', 'prix', 'devis', 'produits'];
  const lower = text.toLowerCase();
  const frCount = frenchWords.filter(w => lower.includes(w)).length;
  if (frCount >= 1) return 'fr';
  const englishWords = ['hello', 'what', 'show', 'can', 'your', 'how', 'price', 'product', 'please', 'want'];
  const enCount = englishWords.filter(w => lower.includes(w)).length;
  if (enCount >= 1) return 'en';
  return 'fr';
}

export default function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [lang, setLang] = useState<'fr' | 'en' | 'ar'>('fr');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { state, dispatch } = useAppContext();
  const { products, categories } = useDataContext();
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  // Welcome message when first opened
  useEffect(() => {
    if (isOpen && !hasGreeted) {
      setHasGreeted(true);
      setTimeout(() => {
        setMessages([{
          id: 'welcome',
          role: 'assistant',
          text: WELCOME_MESSAGES[lang],
          timestamp: new Date(),
        }]);
      }, 300);
    }
  }, [isOpen, hasGreeted, lang]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const addMessage = (msg: Omit<Message, 'id' | 'timestamp'>) => {
    setMessages(prev => [...prev, { ...msg, id: Date.now().toString() + Math.random(), timestamp: new Date() }]);
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isLoading) return;
    setInput('');

    const detectedLang = detectLanguage(messageText);
    setLang(detectedLang);

    addMessage({ role: 'user', text: messageText });
    setIsLoading(true);

    try {
      // Build conversation history (last 4 messages)
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.text }));
      
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          lang: detectedLang,
          history: history,
          userEmail: state.userEmail || state.userId || 'Client Anonyme',
          userId: state.userId || '',
          cart: state.cart.map((item: any) => ({
            name: item.product.name,
            quantity: item.quantity,
            totalPrice: item.totalPrice
          })),
          products: (products || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            category: p.category || '',
            description: p.description || '',
          })),
          categories: (categories || []).map((c: any) => ({
            id: c.id,
            name: c.name,
          })),
        }),
      });

      if (!res.ok) throw new Error('Server error');

      const data = await res.json();
      let responseText = data.text || 'Je suis là pour vous aider !';
      const actions = data.actions || [];

      // Intercepter la balise [ADD_TO_CART: ...] générée par l'IA
      const cartRegex = /\[ADD_TO_CART:\s*({[^}]+})\s*\]/gi;
      let match;
      let productsToAdd: any[] = [];
      
      while ((match = cartRegex.exec(responseText)) !== null) {
        try {
          const payload = JSON.parse(match[1]);
          let productToAdd = products.find(p => p.name.toLowerCase().includes(payload.name.toLowerCase()) || payload.name.toLowerCase().includes(p.name.toLowerCase()));
          if (!productToAdd) {
            productToAdd = { id: crypto.randomUUID(), name: payload.name, price: 0 };
          }
          productsToAdd.push(productToAdd);
        } catch(e) {
          console.error("Erreur parsing JSON panier", e);
        }
      }
      
      // Intercepter la balise [CLEAR_CART]
      const shouldClearCart = /\[CLEAR_CART\]/i.test(responseText);

      // Note: On ne nettoie PLUS le texte ici pour le state.
      // Ainsi, les balises restent dans l'historique envoyé à l'IA,
      // ce qui lui prouve qu'elle a DÉJÀ ajouté les produits !
      // Le nettoyage visuel se fait dans renderMarkdown().

      // Ajouter le message principal de l'IA
      addMessage({
        role: 'assistant',
        text: responseText,
        actions: actions,
      });

      // Si des produits ont été détectés, déclencher l'action d'ajout au panier juste après
      if (productsToAdd.length > 0) {
        setTimeout(() => {
          productsToAdd.forEach(p => {
            executeAction({ type: 'add_to_cart', label: 'Ajouter', payload: { product: p } });
          });
        }, 500); // léger délai pour effet visuel
      }

      // Si le bot demande de vider le panier
      if (shouldClearCart) {
        setTimeout(() => {
          executeAction({ type: 'clear_cart', label: 'Vider' });
        }, 500);
      }
    } catch (err) {
      // Graceful rule-based fallback
      const response = rulesBasedResponse(messageText, lang, products, categories);
      addMessage({
        role: 'assistant',
        text: response.text,
        actions: response.actions,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = (action: ChatAction) => {
    switch (action.type) {
      case 'add_to_cart':
        if (!state.userId) { navigate('/login'); return; }
        if (action.payload?.product) {
          dispatch({ type: 'ADD_TO_CART', payload: { product: action.payload.product, quantity: 1, variations: {} } });
          addMessage({ role: 'assistant', text: `✅ **${action.payload.product.name}** a été ajouté à votre panier !`, actions: [{ type: 'open_cart', label: '🛒 Voir le panier' }] });
        }
        break;
      case 'clear_cart':
        dispatch({ type: 'EXPLICIT_CLEAR_CART' });
        break;
      case 'open_cart':
        dispatch({ type: 'TOGGLE_CART' });
        break;
      case 'open_quote':
        if (!state.userId) { navigate('/login'); return; }
        dispatch({ type: 'TOGGLE_QUOTE_MODAL', payload: null });
        break;
      case 'view_category':
        dispatch({ type: 'SET_CATEGORY', payload: action.payload?.categoryId });
        navigate('/');
        break;
      case 'view_products':
        navigate('/');
        break;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const unreadCount = 0;

  return (
    <div className="chat-widget">
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="relative w-14 h-14 rounded-full bg-gradient-to-br from-electric-blue to-electric-violet shadow-2xl shadow-blue-500/30 flex items-center justify-center text-white border border-white/10"
          >
            <MessageCircle className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
            {/* Pulse ring */}
            <span className="absolute inset-0 rounded-full bg-electric-blue/30 animate-ping" style={{ animationDuration: '2s' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="w-96 h-[600px] flex flex-col rounded-2xl overflow-hidden shadow-2xl shadow-black/50"
            style={{ background: 'var(--bg-secondary)', border: '1px solid rgba(59,130,246,0.2)' }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 bg-gradient-to-r from-electric-blue/20 to-electric-violet/10 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-electric-blue to-electric-violet flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">Assistant Bedouielec</div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block animate-pulse" />
                    En ligne · FR / EN / AR
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-full bg-electric-blue/10 flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-8 h-8 text-electric-blue" />
                  </div>
                  <p className="text-slate-500 text-sm">Démarrage de la conversation...</p>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`chat-message flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                  {/* Avatar */}
                  <div className={`w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs ${msg.role === 'assistant' ? 'bg-electric-blue/20 text-electric-blue' : 'bg-electric-violet/20 text-electric-violet'}`}>
                    {msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>
                  <div className={`max-w-[78%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                        ? 'bg-electric-blue text-white rounded-tr-none'
                        : 'glass text-slate-200 rounded-tl-none border border-white/10'
                      }`}
                      dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.text) }}
                    />
                    {/* Action buttons */}
                    {msg.actions && msg.actions.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {msg.actions.map((action, idx) => (
                          <button
                            key={idx}
                            onClick={() => executeAction(action)}
                            className="text-xs px-3 py-1.5 rounded-lg bg-electric-blue/15 border border-electric-blue/30 text-electric-blue hover:bg-electric-blue/25 transition-all font-medium"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <span className="text-xs text-slate-600">
                      {msg.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-2 chat-message">
                  <div className="w-7 h-7 rounded-lg bg-electric-blue/20 text-electric-blue flex-shrink-0 flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="glass rounded-2xl rounded-tl-none px-4 py-3 border border-white/10">
                    <div className="flex items-center gap-1.5">
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                      <span className="typing-dot" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick prompts (only on first message) */}
            {messages.length <= 1 && !isLoading && (
              <div className="px-4 pb-2">
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map(({ label, message }) => (
                    <button
                      key={label}
                      onClick={() => sendMessage(message)}
                      className="text-xs px-2.5 py-1.5 rounded-lg glass border border-white/10 text-slate-400 hover:text-white hover:border-electric-blue/30 transition-all"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input */}
            <div className="px-4 py-3 border-t border-white/5">
              <div className="flex gap-2 items-center">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre message..."
                  className="flex-1 admin-input text-sm py-2"
                  disabled={isLoading}
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || isLoading}
                  className="w-9 h-9 rounded-xl bg-electric-blue hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-white transition-all flex-shrink-0"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-center text-slate-600 text-xs mt-2">FR · EN · العربية</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========================
// RULE-BASED FALLBACK
// ========================
function rulesBasedResponse(
  message: string,
  lang: 'fr' | 'en' | 'ar',
  products: any[],
  categories: any[]
): { text: string; actions: ChatAction[] } {
  const lower = message.toLowerCase();
  const customCategories = categories;
  const allProducts = products;

  // Company info
  if (/entreprise|company|société|qui êtes|qui etes|about|vend|vendre|activit|ما هي|من أنتم/.test(lower)) {
    return {
      text: lang === 'fr'
        ? '**Bedouielec Transformateurs** — entreprise tunisienne avec +20 ans d\'expertise :\n• Maintenance transformateurs HT (30KV)\n• Cellules MT/BT (IM, QM)\n• Postes de transformation\n• Batteries de condensateurs\n• Destruction agréée PCB\n📍 Teboulba 5080, Monastir\n📞 +216 29 493 780'
        : lang === 'en'
        ? '**Bedouielec Transformateurs** — Tunisian company, 20+ years:\n• HV transformer maintenance (30KV)\n• MT/BT cells\n📍 Teboulba, Tunisia\n📞 +216 29 493 780'
        : '**Bedouielec Transformateurs** — شركة تونسية (+20 سنة)\n📍 طابلبا، تونس\n📞 +216 29 493 780',
      actions: [{ type: 'view_products', label: '📦 Produits' }, { type: 'open_quote', label: '📋 Devis' }]
    };
  }

  // Services
  if (/service|maintenance|installation|réparation|entretien|خدمات/.test(lower)) {
    return {
      text: lang === 'fr'
        ? 'Nos **services** :\n• Maintenance postes HT & transformateurs\n• Installation postes MT/BT\n• Batteries de condensateurs\n• Destruction agréée PCB\n• Électricité industrielle\n• Formation technique\nCertifié IEC/CEI.'
        : 'Our **services**: HV maintenance, MT/BT installation, capacitor banks, PCB disposal, industrial electricity. IEC certified.',
      actions: [{ type: 'open_quote', label: '📋 Devis' }]
    };
  }

  // Prices
  if (/prix|price|tarif|coût|combien|سعر|كم/.test(lower)) {
    if (allProducts.length > 0) {
      const sample = allProducts.slice(0, 5).map((p: any) => `• **${p.name}**: ${p.price.toLocaleString()} TND`).join('\n');
      return {
        text: lang === 'fr' ? `Nos tarifs :\n${sample}\n\n💡 Devis personnalisé disponible !` : `Prices:\n${sample}`,
        actions: [{ type: 'view_products', label: '📦 Catalogue' }, { type: 'open_quote', label: '📋 Devis' }]
      };
    }
    return { text: lang === 'fr' ? 'Demandez un **devis gratuit** pour un tarif personnalisé !' : 'Request a **free quote**!', actions: [{ type: 'open_quote', label: '📋 Devis' }] };
  }

  // Products
  if (/produit|product|catalogue|disponible|stock|منتج/.test(lower)) {
    if (allProducts.length > 0) {
      const list = allProducts.slice(0, 5).map((p: any) => `• **${p.name}** — ${p.price.toLocaleString()} TND`).join('\n');
      return { text: lang === 'fr' ? `**${allProducts.length} produits** disponibles :\n${list}` : `**${allProducts.length} products**:\n${list}`, actions: [{ type: 'view_products', label: '📦 Catalogue' }] };
    }
    return { text: lang === 'fr' ? 'Catalogue en cours de mise à jour. Contactez-nous !' : 'Catalogue updating. Contact us!', actions: [{ type: 'open_quote', label: '📋 Contact' }] };
  }

  // Transformers
  if (/transform|transfo|محول|mt\/bt|haute tension|kva/.test(lower)) {
    return {
      text: lang === 'fr' ? 'Spécialiste **transformateurs** :\n• Immergés huile (100-2000 kVA)\n• Secs intérieur\n• Couplage Dyn11, 30kV\n• Maintenance préventive/curative\nNormes IEC/CEI.' : 'Transformer specialist: oil-immersed (100-2000 kVA), dry-type, Dyn11, 30kV. IEC certified.',
      actions: [{ type: 'view_products', label: '⚡ Transformateurs' }, { type: 'open_quote', label: '📋 Devis' }]
    };
  }

  // HTA cells
  if (/cellule|hta|sectionneur|interrupteur|خلية/.test(lower)) {
    return {
      text: lang === 'fr' ? 'Cellules **HTA** :\n• Interrupteur (IM) — arrivée/départ\n• Protection fusible (QM)\n• 24kV, 200-630A\nNormes internationales.' : 'HTA cells: IM and QM types, 24kV rated.',
      actions: [{ type: 'view_products', label: '⚡ Cellules' }, { type: 'open_quote', label: '📋 Devis' }]
    };
  }

  // Quote
  if (/devis|quote|offre|estimate|عرض/.test(lower)) {
    return {
      text: lang === 'fr' ? '📋 **Devis gratuit** :\n1. Ajoutez les produits au panier\n2. Cliquez "Demander un devis"\n3. Réponse sous **24h** !\n\nOu appelez le **+216 29 493 780**' : '📋 Free quote: add to cart → request quote → response within 24h!',
      actions: [{ type: 'open_quote', label: '📋 Devis' }, { type: 'open_cart', label: '🛒 Panier' }]
    };
  }

  // Contact
  if (/contact|téléphone|phone|email|adresse|اتصال|joindre/.test(lower)) {
    return {
      text: lang === 'fr' ? '📍 Teboulba 5080, Monastir, Tunisie\n📞 **+216 29 493 780**\n✉️ support@bedouielectransormateur.com\n🕐 Lun-Ven 8h-17h30, Sam 8h-12h' : '📍 Teboulba, Tunisia\n📞 +216 29 493 780\n✉️ support@bedouielectransormateur.com',
      actions: [{ type: 'open_quote', label: '📋 Devis' }]
    };
  }

  // Cart
  if (/panier|cart|سلة/.test(lower)) {
    return {
      text: lang === 'fr' ? '🛒 Ajoutez des produits depuis le catalogue, puis demandez un **devis** !' : 'Add products from catalogue, then request a quote!',
      actions: [{ type: 'open_cart', label: '🛒 Panier' }, { type: 'view_products', label: '📦 Catalogue' }]
    };
  }

  // Categories
  if (customCategories.length > 0 && /catégorie|category|gamme|فئة|type/.test(lower)) {
    const catList = customCategories.map((c: any) => `• **${c.name}**`).join('\n');
    return {
      text: lang === 'fr' ? `Nos catégories :\n${catList}` : `Categories:\n${catList}`,
      actions: customCategories.slice(0, 3).map((c: any) => ({ type: 'view_category' as const, label: `📁 ${c.name}`, payload: { categoryId: c.id } }))
    };
  }

  // Greetings
  if (/bonjour|salut|hello|hi|hey|coucou|مرحبا|السلام/.test(lower)) {
    return {
      text: lang === 'fr' ? 'Bonjour ! 👋 Comment puis-je vous aider ?\n• 📦 **Produits** et tarifs\n• 📋 **Devis** personnalisé\n• 📞 **Contact**' : lang === 'en' ? 'Hello! 👋 How can I help?' : 'مرحباً! 👋 كيف يمكنني مساعدتك؟',
      actions: [{ type: 'view_products', label: '📦 Produits' }, { type: 'open_quote', label: '📋 Devis' }]
    };
  }

  // Thanks
  if (/merci|thank|شكر|super|parfait/.test(lower)) {
    return { text: lang === 'fr' ? 'Avec plaisir ! 😊 N\'hésitez pas pour d\'autres questions !' : 'You\'re welcome! 😊', actions: [{ type: 'view_products', label: '📦 Catalogue' }] };
  }

  // Default — never block
  return {
    text: lang === 'fr'
      ? 'Merci ! 😊 Je peux vous aider pour :\n• 📦 Nos **produits** disponibles\n• 💰 Nos **tarifs**\n• 📋 Un **devis** personnalisé\n• 📞 Nos **coordonnées**\n\nQu\'est-ce qui vous intéresse ?'
      : lang === 'en'
      ? 'Thanks! I can help with: **products**, **pricing**, **quotes**, or **contact** info.'
      : 'شكراً! يمكنني المساعدة في: المنتجات، الأسعار، عروض الأسعار، أو معلومات الاتصال.',
    actions: [{ type: 'view_products', label: '📦 Catalogue' }, { type: 'open_quote', label: '📋 Devis' }]
  };
}



