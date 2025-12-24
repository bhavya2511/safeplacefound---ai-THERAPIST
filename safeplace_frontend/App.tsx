
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import JournalPage from './pages/JournalPage';
import StatsPage from './pages/StatsPage';
import AuthPage from './pages/AuthPage';
import { COLORS } from './constants';
import { api } from './services/api';

const ConnectionStatus = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    const check = async () => {
      const isUp = await api.checkHealth();
      setStatus(isUp ? 'online' : 'offline');
    };
    check();
    const interval = setInterval(check, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
      <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-green-500' : status === 'offline' ? 'bg-red-500' : 'bg-yellow-500 animate-pulse'}`} />
      <span className="text-[10px] uppercase tracking-widest text-white/60 font-bold">
        Backend: {status}
      </span>
    </div>
  );
};

const Navbar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => {
  const location = useLocation();
  const isHome = location.pathname === '/';

  if (isHome) return null;

  return (
    <nav 
      className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex justify-between items-center bg-transparent backdrop-blur-md border-b border-white/10"
      style={{ backgroundColor: `${COLORS.primary}99` }}
    >
      <Link to="/" className="text-2xl font-bold tracking-tighter serif-font text-white">
        Safe<span style={{ color: COLORS.highlight }}>Place</span>
      </Link>
      <div className="flex gap-8 items-center text-sm uppercase tracking-widest font-medium">
        <Link to="/chat" className={`hover:opacity-80 transition-opacity ${location.pathname === '/chat' ? 'border-b-2' : ''}`} style={{ color: COLORS.accent, borderColor: COLORS.highlight }}>Counseling</Link>
        <Link to="/journal" className={`hover:opacity-80 transition-opacity ${location.pathname === '/journal' ? 'border-b-2' : ''}`} style={{ color: COLORS.accent, borderColor: COLORS.highlight }}>Reflections</Link>
        <Link to="/stats" className={`hover:opacity-80 transition-opacity ${location.pathname === '/stats' ? 'border-b-2' : ''}`} style={{ color: COLORS.accent, borderColor: COLORS.highlight }}>Insights</Link>
        <button onClick={onLogout} className="text-white/40 hover:text-white transition-colors text-[10px]">Logout</button>
      </div>
    </nav>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('safeplace_token');
    if (token) {
      setUser({ token });
    }
    setChecking(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('safeplace_token');
    setUser(null);
  };

  if (checking) return null;

  return (
    <Router>
      <div className="min-h-screen relative" style={{ backgroundColor: COLORS.primary }}>
        <ConnectionStatus />
        {user && <Navbar onLogout={handleLogout} />}
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {!user ? (
              <Route path="*" element={<AuthPage onLogin={setUser} />} />
            ) : (
              <>
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/journal" element={<JournalPage />} />
                <Route path="/stats" element={<StatsPage />} />
                <Route path="*" element={<Navigate to="/" />} />
              </>
            )}
          </Routes>
        </AnimatePresence>
      </div>
    </Router>
  );
};

export default App;
