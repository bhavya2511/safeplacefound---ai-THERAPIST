
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { COLORS } from '../constants';
import { api } from '../services/api';

const StatsPage: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const entries = await api.get('/journal');
        // Sort entries by date and take the last 7-10 for the graph
        const sorted = entries
          .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          .slice(-10);
        setData(sorted);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Helper to calculate SVG points
  const getGraphPoints = () => {
    if (data.length < 2) return "";
    const width = 800;
    const height = 300;
    const padding = 40;
    
    return data.map((entry, i) => {
      const x = padding + (i * (width - 2 * padding) / (data.length - 1));
      // Mood is 1-5. Map 1 to bottom (height-padding), 5 to top (padding)
      const moodValue = entry.mood || 3;
      const y = (height - padding) - ((moodValue - 1) * (height - 2 * padding) / 4);
      return `${x},${y}`;
    }).join(" ");
  };

  const averageMood = data.length > 0 
    ? (data.reduce((acc, curr) => acc + (curr.mood || 3), 0) / data.length).toFixed(1)
    : "N/A";

  return (
    <div className="pt-24 min-h-screen px-6 md:px-12 flex flex-col items-center">
      <header className="mb-12 text-center">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl serif-font italic text-white" 
          style={{ color: COLORS.accent }}
        >
          Emotional Landscape
        </motion.h2>
        <p className="text-white/40 uppercase tracking-widest text-xs mt-2">Visualization of your internal journey</p>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      ) : data.length < 2 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center max-w-md">
          <div className="w-16 h-16 rounded-full mb-6 flex items-center justify-center" style={{ backgroundColor: COLORS.accent + '22' }}>
            <span className="text-2xl">🌱</span>
          </div>
          <p className="text-white/60 leading-relaxed italic">
            Your landscape is just beginning. Write at least two journal entries to see your patterns emerge.
          </p>
        </div>
      ) : (
        <div className="w-full max-w-5xl space-y-12 pb-20">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Average Vibe', value: averageMood, desc: 'Your typical emotional state' },
              { label: 'Entries', value: data.length, desc: 'Moments captured this season' },
              { label: 'Last Check-in', value: new Date(data[data.length-1].createdAt).toLocaleDateString(), desc: 'Your most recent reflection' }
            ].map((stat, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 p-6 rounded-2xl backdrop-blur-sm"
              >
                <p className="text-[10px] uppercase tracking-widest text-white/40 font-bold mb-1">{stat.label}</p>
                <p className="text-3xl text-white serif-font italic">{stat.value}</p>
                <p className="text-[10px] text-white/20 mt-2 italic">{stat.desc}</p>
              </motion.div>
            ))}
          </div>

          {/* Graph Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-black/20 border border-white/5 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-white/60 text-xs font-bold uppercase tracking-widest">Mood Progression</h3>
              <div className="flex gap-4 text-[9px] text-white/30 uppercase tracking-tighter">
                <span>← Older</span>
                <span>Newer →</span>
              </div>
            </div>

            <div className="relative h-[300px] w-full">
              <svg viewBox="0 0 800 300" className="w-full h-full overflow-visible">
                {/* Horizontal Grid Lines */}
                {[0, 1, 2, 3, 4].map((v) => (
                  <line 
                    key={v} 
                    x1="40" y1={40 + (v * 55)} x2="760" y2={40 + (v * 55)} 
                    stroke={COLORS.accent} strokeWidth="0.5" strokeOpacity="0.05" 
                  />
                ))}

                {/* The Path */}
                <motion.polyline
                  fill="none"
                  stroke={COLORS.highlight}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={getGraphPoints()}
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  style={{ filter: `drop-shadow(0 0 8px ${COLORS.highlight}66)` }}
                />

                {/* Data Points */}
                {data.map((entry, i) => {
                  const width = 800;
                  const height = 300;
                  const padding = 40;
                  const x = padding + (i * (width - 2 * padding) / (data.length - 1));
                  const moodValue = entry.mood || 3;
                  const y = (height - padding) - ((moodValue - 1) * (height - 2 * padding) / 4);
                  
                  return (
                    <motion.circle
                      key={i}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={COLORS.primary}
                      stroke={COLORS.highlight}
                      strokeWidth="2"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.5 + (i * 0.1) }}
                    />
                  );
                })}
              </svg>

              {/* Y-Axis Labels */}
              <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between py-10 text-[8px] text-white/20 font-bold uppercase pointer-events-none">
                <span>Elevated</span>
                <span>Balanced</span>
                <span>Heavy</span>
              </div>
            </div>
          </motion.div>

          {/* Contextual Tip */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2.5 }}
            className="text-center italic text-white/30 text-sm"
          >
            "The peaks and valleys are all part of the same beautiful landscape."
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default StatsPage;
