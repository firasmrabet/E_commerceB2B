import { Phone, Mail, MapPin, Linkedin, Facebook, Zap, ArrowRight, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useDataContext } from '../context/DataContext';

export default function Footer() {
  const navigate = useNavigate();
  const { dispatch } = useAppContext();
  const { categories } = useDataContext();
  const customCategories = categories.filter((c: any) => c.isCustom);

  return (
    <footer className="relative mt-20 border-t border-white/5">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-electric-blue/40 to-transparent" />

      <div className="bg-dark-card2">
        <div className="container mx-auto px-6 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">

            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric-blue to-electric-violet flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">Bedouielec</div>
                  <div className="text-xs text-slate-500">Transformateurs</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Votre partenaire de confiance en équipements électriques industriels depuis plus de 20 ans. 
                Solutions haute tension, transformateurs MT/BT et maintenance industrielle.
              </p>
              <div className="flex gap-3">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-electric-blue hover:border-electric-blue/40 transition-all">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-electric-blue hover:border-electric-blue/40 transition-all">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Categories */}
            <div>
              <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-electric-blue inline-block"></span>
                Nos catégories
              </h4>
              <ul className="space-y-2.5">
                {customCategories.slice(0, 8).map((cat: any) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => { dispatch({ type: 'SET_CATEGORY', payload: cat.id }); navigate('/'); window.scrollTo(0,0); }}
                      className="flex items-center gap-2 text-slate-400 hover:text-electric-blue text-sm transition-colors group"
                    >
                      <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      {cat.name}
                    </button>
                  </li>
                ))}
                {customCategories.length === 0 && (
                  <>
                    {['Transformateurs', 'Disjoncteurs', 'Contacteurs', 'Variateurs de vitesse', 'Câbles électriques', 'Armoires électriques'].map(item => (
                      <li key={item}>
                        <span className="flex items-center gap-2 text-slate-500 text-sm">
                          <ArrowRight className="w-3 h-3" />
                          {item}
                        </span>
                      </li>
                    ))}
                  </>
                )}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-electric-cyan inline-block"></span>
                Services
              </h4>
              <ul className="space-y-2.5">
                {['Conseil technique', 'Devis gratuit', 'Installation sur site', 'Maintenance préventive', 'Dépannage urgence', 'Formation technique', 'Support après-vente', 'Études haute tension'].map(service => (
                  <li key={service}>
                    <span className="flex items-center gap-2 text-slate-400 text-sm hover:text-white transition-colors cursor-default">
                      <ArrowRight className="w-3 h-3 text-electric-cyan" />
                      {service}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-white font-semibold mb-5 flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-electric-violet inline-block"></span>
                Contact
              </h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-electric-violet flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm">Rue Ommar el Mokhtar, Tabulba 5080</p>
                    <p className="text-slate-400 text-sm">Monastir, Tunisie</p>
                  </div>
                </div>
                <a href="tel:+21629493780" className="flex items-center gap-3 group">
                  <Phone className="w-4 h-4 text-electric-violet flex-shrink-0" />
                  <span className="text-slate-400 text-sm group-hover:text-electric-blue transition-colors">+216 29 493 780</span>
                </a>
                <a href="mailto:support@bedouielectransormateur.com" className="flex items-start gap-3 group">
                  <Mail className="w-4 h-4 text-electric-violet flex-shrink-0 mt-0.5" />
                  <span className="text-slate-400 text-sm group-hover:text-electric-blue transition-colors break-all">support@bedouielectransormateur.com</span>
                </a>
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-electric-violet flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-slate-400 text-sm">Lun-Ven: 8h00 - 17h30</p>
                    <p className="text-slate-400 text-sm">Samedi: 8h00 - 12h00</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-br from-electric-blue/10 to-electric-violet/10 border border-electric-blue/20">
                  <p className="text-slate-300 text-sm font-medium mb-2">Besoin d'un devis ?</p>
                  <p className="text-slate-500 text-xs mb-3">Réponse sous 24h garantie</p>
                  <a href="tel:+21629493780"
                    className="inline-flex items-center gap-2 bg-electric-blue text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-blue-500 transition-colors">
                    <Phone className="w-3 h-3" /> Appeler maintenant
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/5">
          <div className="container mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-3">
            <p className="text-slate-500 text-sm">
              © 2025 Bedouielec Transformateurs. Tous droits réservés.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span className="hover:text-slate-300 cursor-default transition-colors">Conditions générales</span>
              <span className="hover:text-slate-300 cursor-default transition-colors">Confidentialité</span>
              <span className="hover:text-slate-300 cursor-default transition-colors">Mentions légales</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
