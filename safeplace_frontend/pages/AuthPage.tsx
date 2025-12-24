
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../services/api';
import { COLORS } from '../constants';

interface AuthPageProps {
  onLogin: (user: any) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const endpoint = isLogin ? '/login' : '/register';
      const user = await api.post(endpoint, { email, password });
      
      if (user.token) {
        localStorage.setItem('safeplace_token', user.token);
        onLogin(user);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-black">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md p-8 rounded-2xl border border-white/10 backdrop-blur-xl bg-white/5"
      >
        <div className="mb-8 text-center">
          <h2 className="text-3xl serif-font italic" style={{ color: COLORS.accent }}>
            {isLogin ? 'Welcome Back' : 'Begin Your Journey'}
          </h2>
          <p className="text-white/30 text-[10px] uppercase tracking-widest mt-2">SafePlace Secure Entry</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Email Address</label>
            <input 
              type="email" 
              required
              placeholder="name@example.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D3968C] transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-[10px] uppercase tracking-widest text-white/40 mb-2 font-bold">Password</label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#D3968C] transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs italic leading-relaxed"
            >
              ⚠️ {error}
            </motion.div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-full text-white font-black tracking-[0.3em] uppercase text-xs transition-all active:scale-95 disabled:opacity-50 shadow-xl"
            style={{ backgroundColor: COLORS.highlight }}
          >
            {loading ? 'Connecting...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="mt-8 text-center text-xs text-white/40 tracking-wide">
          {isLogin ? "New to the sanctuary?" : "Already found your place?"}
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="ml-2 underline font-bold"
            style={{ color: COLORS.accent }}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default AuthPage;
