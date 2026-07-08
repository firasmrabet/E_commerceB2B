import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { User, Phone, Zap, ArrowRight, Shield, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

export default function CompleteProfile() {
  const { state, dispatch } = useAppContext();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Si le profil est complet ou s'il n'y a pas d'utilisateur connecté, on ne montre rien
  if (!state.userId || state.isProfileComplete) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: state.userId, name, phone })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || 'Erreur lors de la sauvegarde du profil.');
        setLoading(false);
        return;
      }
      
      // Mise à jour du state global
      dispatch({ 
        type: 'SET_USER_PROFILE', 
        payload: { profile: { name, phone }, isComplete: true } 
      });
      
    } catch (err) {
      setError('Erreur de connexion au serveur.');
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'SET_USER_ID', payload: null });
    dispatch({ type: 'SET_USER_EMAIL', payload: null });
    dispatch({ type: 'SET_USER_PROFILE', payload: { profile: null, isComplete: true } });
  };

  const inputClass = 'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-electric-blue/60 focus:bg-white/8 transition-all';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#060e1e]/90 backdrop-blur-md p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        <div
          className="relative rounded-2xl overflow-hidden p-8"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 80px rgba(59,130,246,.15), 0 30px 60px rgba(0,0,0,.6)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-electric-blue/20 border border-electric-blue/40 flex items-center justify-center">
              <Zap className="w-5 h-5 text-electric-blue" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Dernière étape</h2>
              <p className="text-slate-400 text-xs">Finalisez votre profil professionnel</p>
            </div>
          </div>
          
          <div className="mb-6 p-4 rounded-xl bg-electric-blue/10 border border-electric-blue/20 flex items-start gap-3">
            <Shield className="w-5 h-5 text-electric-blue shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">
              Pour des raisons de sécurité et pour mieux vous accompagner, merci de renseigner vos informations de contact. <strong className="text-white">Vos données sont strictement chiffrées de bout en bout.</strong>
            </p>
          </div>

          {/* Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm"
              >
                ⚠ {error}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Votre nom complet"
                  required
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                Numéro de téléphone
              </label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+216 XX XXX XXX"
                  required
                  className={`${inputClass} pl-10`}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full btn-primary py-3.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                </svg>
              ) : (
                <>
                  Accéder à mon espace
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
            
            <button
              type="button"
              onClick={handleCancel}
              className="w-full py-3 text-slate-400 text-sm font-medium hover:text-white transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Se déconnecter et retourner à l'accueil
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
