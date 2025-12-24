
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { COLORS } from '../constants';

const HomePage: React.FC = () => {
  const [animationState, setAnimationState] = useState<'idle' | 'moving' | 'finished'>('idle');
  const [showText, setShowText] = useState(false);
  const [showButton, setShowButton] = useState(false);

  // Animation Timings (Total 7 seconds)
  const duration = 7;
  
  // X: Right (90) -> Left (10) -> Center (50) -> Right (110 - offscreen)
  const xPath = ['90vw', '10vw', '50vw', '110vw'];
  // Y: Top -> Mid -> Center -> Bottom
  const yPath = ['-10vh', '30vh', '60vh', '95vh'];
  // Timing percentages for the keyframes
  const times = [0, 0.35, 0.7, 1];

  useEffect(() => {
    setAnimationState('moving');
    
    // Trigger text when ball reaches center (70% of duration)
    const textTimer = setTimeout(() => {
      setShowText(true);
    }, duration * 0.7 * 1000);

    // Ball finishes and fades
    const finishTimer = setTimeout(() => {
      setAnimationState('finished');
      setShowButton(true);
    }, duration * 1000);

    return () => {
      clearTimeout(textTimer);
      clearTimeout(finishTimer);
    };
  }, []);

  // SVG representation of the rollercoaster track
  // Approximating the zig-zag path with smooth cubic bezier curves
  const trackD = "M 900 -100 C 700 100, 300 200, 100 300 C -100 450, 600 500, 500 600 C 400 700, 800 800, 1100 950";

  return (
    <div className="relative h-screen w-screen overflow-hidden flex flex-col items-center justify-center bg-black">
      {/* Immersive Dark Background */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 opacity-50" 
          style={{ 
            background: `radial-gradient(circle at 50% 50%, ${COLORS.special} 0%, ${COLORS.primary} 100%)` 
          }}
        />
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      {/* The Rollercoaster Track (Subtle Visual) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none z-10 opacity-30"
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="none"
      >
        <motion.path
          d={trackD}
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.2 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        <motion.path
          d={trackD}
          fill="none"
          stroke={COLORS.memoryBall}
          strokeWidth="1"
          strokeDasharray="10 30"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1, strokeDashoffset: [0, -100] }}
          transition={{ 
            pathLength: { duration: 2 }, 
            strokeDashoffset: { duration: 20, repeat: Infinity, ease: "linear" } 
          }}
          className="blur-[1px]"
        />
      </svg>

      {/* The Glowing Memory Ball */}
      <AnimatePresence>
        {animationState === 'moving' && (
          <motion.div
            key="memory-ball"
            initial={{ x: xPath[0], y: yPath[0], opacity: 1, scale: 0.8 }}
            animate={{
              x: xPath,
              y: yPath,
              rotate: 720,
              scale: [0.8, 1, 1.1, 0.5],
              opacity: [1, 1, 1, 0]
            }}
            transition={{
              duration: duration,
              ease: "easeInOut",
              times: times
            }}
            className="absolute z-30 w-24 h-24 rounded-full flex items-center justify-center -translate-x-1/2 -translate-y-1/2 pointer-events-none"
            style={{ 
              backgroundColor: COLORS.memoryBall,
              boxShadow: `0 0 60px 20px ${COLORS.memoryBall}aa, 0 0 120px 40px ${COLORS.memoryBall}44`,
              left: 0,
              top: 0
            }}
          >
            {/* Core Inner Shine */}
            <div className="w-20 h-20 rounded-full bg-white/20 blur-sm relative overflow-hidden">
              <motion.div 
                animate={{ x: [-20, 20], y: [-20, 20] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-yellow-200/30 blur-md"
              />
            </div>

            {/* Light Trail Particles */}
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={`particle-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.6, 0], 
                  scale: [0, 1.5, 0],
                  x: [0, (Math.random() - 0.5) * 40],
                  y: [0, (Math.random() - 0.5) * 40]
                }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                className="absolute w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS.memoryBall, filter: 'blur(4px)' }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Central Therapeutic Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 pointer-events-none">
        <AnimatePresence>
          {showText && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center px-8"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="text-5xl md:text-7xl serif-font italic font-light text-white mb-6"
                style={{ color: COLORS.accent }}
              >
                Find your safe place
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.5, delay: 1, ease: "easeOut" }}
                className="text-xl md:text-2xl text-white/50 font-light mb-12 tracking-wide"
              >
                It's okay to not be okay.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={showButton ? { opacity: 1, scale: 1 } : { opacity: 0 }}
                transition={{ duration: 1 }}
                className="pointer-events-auto"
              >
                <Link 
                  to="/chat" 
                  className="group relative inline-flex items-center justify-center px-16 py-5 rounded-full overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl"
                >
                  <div 
                    className="absolute inset-0 w-full h-full transition-all duration-300 group-hover:opacity-90"
                    style={{ backgroundColor: COLORS.highlight }}
                  />
                  <span className="relative text-white tracking-[0.4em] uppercase text-xs font-black">
                    Enter Sanctuary
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ambient Finishing Glow */}
      <AnimatePresence>
        {showButton && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.2 }}
            className="absolute bottom-0 w-full h-[50vh] z-10 pointer-events-none"
            style={{ 
              background: `linear-gradient(to top, ${COLORS.special} 0%, transparent 100%)` 
            }}
          />
        )}
      </AnimatePresence>

      {/* Subtle Background Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`ambient-${i}`}
          initial={{ 
            opacity: 0, 
            x: Math.random() * 100 + 'vw', 
            y: Math.random() * 100 + 'vh' 
          }}
          animate={{ 
            opacity: [0, 0.2, 0],
            y: ['-=50px', '+=50px'],
          }}
          transition={{ 
            duration: Math.random() * 5 + 5, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute w-1 h-1 bg-white rounded-full blur-[1px] pointer-events-none opacity-20"
        />
      ))}
    </div>
  );
};

export default HomePage;
