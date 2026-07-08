import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export default function QuoteSuccessPage() {
  const { state } = useAppContext();
  const navigate = useNavigate();

  // Redirect to home if no quote was submitted
  useEffect(() => {
    if (!state.lastQuoteRequest) {
      navigate('/');
    }
  }, [state.lastQuoteRequest, navigate]);



  if (!state.lastQuoteRequest) {
    return null;
  }

  const { name, email, phone, company, message, products } = state.lastQuoteRequest;
  const totalPrice = products.reduce((sum: number, item: any) => sum + item.totalPrice, 0);

  return (
    <div className="min-h-screen bg-dark-bg py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-electric-blue/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-electric-violet/10 blur-[120px]"></div>
      </div>
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-green-800 mb-2">✅ Demande envoyée avec succès!</h1>
          <p className="text-lg text-green-600">Email envoyé à l'équipe Bedouielec Transformateur avec succès.</p>
        </div>

        {/* Main Content Card */}
        <div className="glass-card bg-dark-card border border-white/10 rounded-2xl shadow-2xl p-8 mb-8">
          {/* Summary Section */}
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-6 flex items-center">
              <svg className="w-6 h-6 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Récapitulatif de votre demande
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-slate-400 w-24">Nom:</span> 
                  <span className="font-medium text-slate-200">{name}</span>
                </div>
                <div className="flex items-center">
                  <span className="text-slate-400 w-24">Email:</span> 
                  <a href={`mailto:${email}`} className="text-electric-blue hover:underline font-medium">{email}</a>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center">
                  <span className="text-slate-400 w-24">Téléphone:</span> 
                  <span className="font-medium text-slate-200">{phone}</span>
                </div>
                {company && (
                  <div className="flex items-center">
                    <span className="text-slate-400 w-24">Société:</span> 
                    <span className="font-medium text-slate-200">{company}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Products Section */}
            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-medium text-white mb-4">Produits sélectionnés:</h3>
              <div className="space-y-3">
                {products.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between items-center bg-white/5 border border-white/10 p-4 rounded-xl">
                    <div>
                      <span className="font-medium text-slate-200">{item?.product?.name || item?.name || 'Produit'}</span>
                      {item.quantity > 1 && (
                        <span className="text-slate-400 ml-2">x{item.quantity}</span>
                      )}
                    </div>
                    <span className="font-semibold text-electric-blue text-lg">{item.totalPrice.toLocaleString()} TND</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between items-center">
                  <span className="text-xl font-semibold text-white">Total estimé:</span>
                  <span className="text-2xl font-bold gradient-text">{totalPrice.toLocaleString()} TND</span>
                </div>
              </div>
            </div>

            {/* Message Section */}
            {message && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <h3 className="text-lg font-medium text-white mb-3">Votre message:</h3>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl text-slate-300 italic">
                  "{message}"
                </div>
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="bg-electric-blue/10 p-6 rounded-xl border border-electric-blue/20">
            <h3 className="text-xl font-semibold text-electric-blue mb-4 flex items-center">
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Prochaines étapes
            </h3>
            <ul className="text-slate-300 space-y-3">
              <li className="flex items-start">
                <span className="text-electric-blue mr-2">•</span>
                Votre demande a été transmise à notre équipe commerciale
              </li>
              <li className="flex items-start">
                <span className="text-electric-blue mr-2">•</span>
                Un expert vous contactera dans les <strong className="text-white ml-1">24 heures</strong>
              </li>
              <li className="flex items-start">
                <span className="text-electric-blue mr-2">•</span>
                Vous recevrez un devis personnalisé avec les meilleures conditions
              </li>
              <li className="flex items-start">
                <span className="text-electric-blue mr-2">•</span>
                Possibilité de négociation selon vos besoins spécifiques
              </li>
            </ul>
          </div>

          {/* Action button */}
          <div className="mt-8 text-center flex justify-center">
            <button
              onClick={() => navigate('/')}
              className="btn-primary px-8 py-3 rounded-xl flex items-center gap-2"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
