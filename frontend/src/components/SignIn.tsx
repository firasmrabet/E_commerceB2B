import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Eye, EyeOff, Zap, Shield, Award, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import AnimatedBackground from './AnimatedBackground';

/* ───────────────────────────────────────────────
   Typed text animation
─────────────────────────────────────────────── */
function TypedText({ strings, speed = 60 }: { strings: string[]; speed?: number }) {
  const [idx, setIdx] = useState(0);
  const [char, setChar] = useState(0);
  const [del, setDel] = useState(false);

  useEffect(() => {
    const current = strings[idx];
    const timeout = setTimeout(() => {
      if (!del) {
        if (char < current.length) setChar(c => c + 1);
        else setTimeout(() => setDel(true), 1800);
      } else {
        if (char > 0) setChar(c => c - 1);
        else { setDel(false); setIdx(i => (i + 1) % strings.length); }
      }
    }, del ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [char, del, idx, strings, speed]);

  return (
    <span className="gradient-text">
      {strings[idx].slice(0, char)}
      <span className="animate-pulse">|</span>
    </span>
  );
}

/* ───────────────────────────────────────────────
   Main SignIn Component
─────────────────────────────────────────────── */
export default function SignIn() {
  const [mode, setMode] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setError(error.message);
    else { setSuccess('Connexion réussie !'); setTimeout(() => navigate('/'), 900); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess(''); setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    setLoading(false);
    if (error) setError(error.message);
    else setSuccess('Compte créé ! Vérifiez votre email de confirmation.');
  };

  const handleGoogle = async () => {
    setError(''); setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/` },
    });
    if (error) { setError(error.message); setLoading(false); }
  };

  const inputClass =
    'w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 text-sm focus:outline-none focus:border-electric-blue/60 focus:bg-white/8 transition-all';

  return (
    <div className="min-h-screen relative overflow-hidden flex" style={{ background: '#060e1e' }}>
      {/* ── Backgrounds ── */}
      <AnimatedBackground />

      {/* ── Left Branding Panel ── */}
      <motion.div
        className="hidden lg:flex flex-col justify-between w-[52%] relative z-10 p-14"
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-electric-blue/20 border border-electric-blue/40 flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,.3)]">
            <Zap className="w-7 h-7 text-electric-blue" />
          </div>
          <div>
            <div className="text-white font-black text-xl tracking-tight">Bedouielec</div>
            <div className="text-slate-400 text-xs font-medium tracking-widest uppercase">Transformateurs</div>
          </div>
        </div>

        {/* Hero copy */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            <p className="text-electric-blue text-sm font-semibold tracking-widest uppercase mb-4">
              ⚡ Spécialiste Équipements Industriels · Tunisie
            </p>
            <h1 className="text-5xl xl:text-6xl font-black text-white leading-tight mb-4">
              Votre partenaire<br />
              en{' '}
              <TypedText
                strings={['haute tension', 'MT/BT', 'cellules HTA', 'maintenance', 'distribution']}
                speed={70}
              />
            </h1>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed mt-4">
              Leader tunisien en transformateurs de puissance, cellules HTA, postes de transformation 30KV et équipements électriques industriels certifiés IEC.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="grid grid-cols-3 gap-6 mt-10"
          >
            {[
              { v: '20+', l: 'Années d\'expérience', c: 'text-electric-blue' },
              { v: '500+', l: 'Clients industriels', c: 'text-electric-cyan' },
              { v: '98%', l: 'Satisfaction client', c: 'text-electric-violet' },
            ].map(({ v, l, c }) => (
              <div key={l} className="glass-card rounded-xl p-4 border border-white/5">
                <div className={`text-3xl font-black ${c} mb-1`}>{v}</div>
                <div className="text-slate-500 text-xs">{l}</div>
              </div>
            ))}
          </motion.div>

          {/* Feature pills */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap gap-2 mt-6"
          >
            {[
              { icon: Shield, text: 'Certifié IEC/CEI' },
              { icon: Zap, text: 'Haute tension 30KV' },
              { icon: Award, text: 'Qualité garantie' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2 glass px-3 py-2 rounded-lg border border-white/10 hover:border-electric-blue/30 transition-colors">
                <Icon className="w-3.5 h-3.5 text-electric-blue" />
                <span className="text-slate-300 text-xs font-medium">{text}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Industrial image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="relative h-52 rounded-2xl overflow-hidden border border-white/10 group"
        >
          <img
            src="https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=900&q=80"
            alt="Équipements électriques industriels"
            className="w-full h-full object-cover opacity-50 group-hover:opacity-70 transition-opacity duration-500 group-hover:scale-105 transition-transform"
          />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #060e1e99, transparent 60%, #060e1e88)' }} />
          {/* Neon scan line */}
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-electric-blue/60 to-transparent animate-[scan-line_3s_ease-in-out_infinite]" style={{ top: '50%' }} />
          <div className="absolute bottom-4 left-5">
            <div className="text-white font-bold text-sm">Expertise Technique Reconnue</div>
            <div className="text-slate-400 text-xs mt-0.5">Maintenance · Conception · Installation · Formation</div>
          </div>
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1.5 glass px-2 py-1 rounded-full border border-green-500/30">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-medium">En service</span>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center relative z-10 p-6 lg:p-10">
        <motion.div
          className="w-full max-w-md"
          initial={{ opacity: 0, scale: 0.95, y: 24 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: 'easeOut' }}
        >
          {/* Card */}
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 0 80px rgba(59,130,246,.12), 0 30px 60px rgba(0,0,0,.6)',
            }}
          >
            {/* Animated border beam */}
            <div className="signin-beam" />

            <div className="p-8">
              {/* Mobile logo */}
              <div className="flex lg:hidden items-center gap-2 mb-7">
                <div className="w-9 h-9 rounded-xl bg-electric-blue/20 border border-electric-blue/40 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-electric-blue" />
                </div>
                <div>
                  <div className="text-white font-black text-base">Bedouielec</div>
                  <div className="text-slate-500 text-xs">Transformateurs Industriels</div>
                </div>
              </div>

              {/* Heading */}
              <div className="mb-7">
                <h2 className="text-2xl font-black text-white mb-1.5">
                  {mode === 'signin' ? 'Bienvenue 👋' : 'Créer un compte'}
                </h2>
                <p className="text-slate-400 text-sm">
                  {mode === 'signin'
                    ? 'Accédez à votre espace professionnel Bedouielec'
                    : 'Rejoignez notre réseau de clients industriels'}
                </p>
              </div>

              {/* Mode tabs */}
              <div className="flex glass rounded-xl p-1 mb-6">
                {(['signin', 'register'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => { setMode(m); setError(''); setSuccess(''); }}
                    className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                      mode === m
                        ? 'bg-electric-blue text-white shadow-[0_0_15px_rgba(59,130,246,.4)]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m === 'signin' ? 'Se connecter' : "S'inscrire"}
                  </button>
                ))}
              </div>

              {/* Alerts */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    key="err"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm mb-4"
                  >
                    ⚠ {error}
                  </motion.div>
                )}
                {success && (
                  <motion.div
                    key="ok"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-xl text-sm mb-4"
                  >
                    ✓ {success}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form */}
              <form onSubmit={mode === 'signin' ? handleSignIn : handleRegister} className="space-y-4">
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div
                      key="name"
                      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                      animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                      style={{ overflow: 'hidden' }}
                    >
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
                          className={`${inputClass} pl-10`}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div>
                  <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                    Email professionnel
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      required
                      className={`${inputClass} pl-10`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1.5 font-medium uppercase tracking-wide">
                    Mot de passe
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPwd ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className={`${inputClass} pl-10 pr-10`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full btn-primary py-3.5 font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.37 0 0 5.37 0 12h4z" />
                    </svg>
                  ) : (
                    <>
                      {mode === 'signin' ? 'Se connecter' : 'Créer mon compte'}
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </motion.button>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-slate-600 text-xs font-medium">ou continuer avec</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              {/* Google */}
              <motion.button
                onClick={handleGoogle}
                disabled={loading}
                whileHover={{ scale: 1.02, borderColor: 'rgba(255,255,255,.25)' }}
                whileTap={{ scale: 0.98 }}
                className="w-full rounded-xl py-3 text-sm font-semibold text-white flex items-center justify-center gap-3 transition-all border border-white/10 hover:border-white/20 hover:bg-white/5"
                style={{ background: 'rgba(255,255,255,.03)' }}
              >
                <svg viewBox="0 0 48 48" width="20" height="20">
                  <path fill="#4285F4" d="M24 9.5c3.54 0 6.7 1.22 9.19 3.22l6.85-6.85C35.64 2.36 30.13 0 24 0 14.61 0 6.27 5.7 2.13 14.01l8.01 6.23C12.36 13.36 17.68 9.5 24 9.5z" />
                  <path fill="#34A853" d="M46.1 24.5c0-1.54-.14-3.03-.41-4.47H24v8.47h12.47c-.54 2.92-2.17 5.39-4.63 7.06l7.19 5.59C43.73 37.36 46.1 31.44 46.1 24.5z" />
                  <path fill="#FBBC05" d="M10.14 28.24c-1.01-2.97-1.01-6.18 0-9.15l-8.01-6.23C.73 16.36 0 20.06 0 24c0 3.94.73 7.64 2.13 11.14l8.01-6.23z" />
                  <path fill="#EA4335" d="M24 48c6.13 0 11.64-2.03 15.97-5.53l-7.19-5.59c-2.01 1.35-4.59 2.13-8.78 2.13-6.32 0-11.64-3.86-13.86-9.24l-8.01 6.23C6.27 42.3 14.61 48 24 48z" />
                </svg>
                Continuer avec Google
              </motion.button>

              {/* Footer */}
              <p className="text-center text-slate-600 text-xs mt-6 leading-relaxed">
                En continuant, vous acceptez nos{' '}
                <span className="text-electric-blue hover:underline cursor-pointer">conditions d'utilisation</span>{' '}
                et notre{' '}
                <span className="text-electric-blue hover:underline cursor-pointer">politique de confidentialité</span>.
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="flex items-center justify-center gap-6 mt-6"
          >
            {[
              { icon: Shield, text: 'SSL sécurisé' },
              { icon: Zap, text: 'Accès instantané' },
              { icon: Award, text: 'Support dédié' },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-1.5 text-slate-600">
                <Icon className="w-3.5 h-3.5" />
                <span className="text-xs">{text}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
