
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { COLORS } from '../constants';
import { api } from '../services/api';

const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchEntries();
  }, []);

  const fetchEntries = async () => {
    try {
      const data = await api.get('/journal');
      setEntries(data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async () => {
    if (!currentEntry.trim()) return;
    setIsSaving(true);
    try {
      // Backend expects a mood number (1-5). Defaulting to 3 for now.
      await api.post('/journal', { text: currentEntry, mood: 3 });
      setCurrentEntry('');
      await fetchEntries();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="pt-24 min-h-screen px-4 md:px-12 flex flex-col">
      <header className="mb-8 text-center">
        <h2 className="text-3xl serif-font italic text-white" style={{ color: COLORS.accent }}>My Reflections</h2>
        <p className="text-white/40 uppercase tracking-widest text-xs mt-2">SafePlace Secure Journal</p>
      </header>

      <div className="flex-1 flex flex-col md:flex-row gap-8 max-w-7xl mx-auto w-full pb-12">
        {/* Left Pane - History */}
        <div className="w-full md:w-1/3 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 px-2">Archive</h3>
          <div className="max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar space-y-4">
            {entries.length === 0 && <p className="text-white/20 italic text-sm px-2">No entries yet...</p>}
            {entries.map((entry) => (
              <motion.div
                key={entry._id}
                whileHover={{ x: 5 }}
                className="p-4 rounded-lg bg-white/5 border border-white/10 group cursor-default"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] uppercase text-white/40 tracking-tighter">
                    {new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                  <div className="flex gap-1">
                    {[...Array(entry.mood || 3)].map((_, i) => (
                      <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#D3968C] opacity-60" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-white/70 line-clamp-3 leading-relaxed typewriter-font italic">{entry.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right Pane - The Notebook */}
        <div className="flex-1 relative">
          <motion.div 
            layout
            className="bg-[#F7F4D5] rounded-xl shadow-2xl p-8 md:p-12 min-h-[60vh] flex flex-col text-gray-800 ring-8 ring-black/10"
            style={{ 
              backgroundImage: 'linear-gradient(#e5e5e5 1.1px, transparent 1.1px)', 
              backgroundSize: '100% 2.4rem',
              lineHeight: '2.4rem'
            }}
          >
            <textarea
              placeholder="How was your day? Write freely..."
              value={currentEntry}
              onChange={(e) => setCurrentEntry(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none typewriter-font text-lg resize-none placeholder:text-gray-300"
            />
            
            <div className="mt-8 flex justify-end items-center gap-4">
              <button
                onClick={handleSave}
                disabled={!currentEntry.trim() || isSaving}
                className="px-8 py-3 rounded shadow-md text-white font-bold tracking-widest uppercase text-xs transition-all active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: COLORS.highlight }}
              >
                {isSaving ? 'Archiving...' : 'Store Reflection'}
              </button>
            </div>

            {/* Notebook Rings */}
            <div className="absolute top-0 bottom-0 -left-6 flex flex-col justify-around py-8 pointer-events-none">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="w-12 h-3.5 rounded-full bg-gray-300 shadow-inner -rotate-12 border border-gray-400" />
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JournalPage;
