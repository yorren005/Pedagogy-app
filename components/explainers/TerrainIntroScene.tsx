import { motion } from 'framer-motion';
import { AgeRange } from '@/lib/gameConfig';

interface TerrainIntroSceneProps {
  ageRange: AgeRange;
}

export default function TerrainIntroScene({ ageRange }: TerrainIntroSceneProps) {
  switch (ageRange) {
    case 'elementary':
      return (
        <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-gradient-to-b from-sky-300 to-green-400 border border-white/20 shadow-inner flex items-center justify-center">
          {/* Sun */}
          <motion.div 
            className="absolute top-4 right-4 text-5xl"
            animate={{ rotate: 360, scale: [1, 1.1, 1] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          >
            ☀️
          </motion.div>
          
          {/* Clouds */}
          <motion.div 
            className="absolute top-6 left-2 text-4xl opacity-80"
            animate={{ x: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          >
            ☁️
          </motion.div>
          
          {/* Trees / Forest */}
          <div className="absolute bottom-0 w-full flex justify-around items-end pb-2">
            {[...Array(5)].map((_, i) => (
              <motion.div 
                key={i} 
                className="text-5xl"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: i * 0.1, type: 'spring' }}
              >
                🌲
              </motion.div>
            ))}
          </div>
          
          {/* Main Icon */}
          <motion.div 
            className="z-10 text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] bg-white/20 p-4 rounded-full backdrop-blur-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.5 }}
          >
            🏕️
          </motion.div>
        </div>
      );
      
    case 'middle-school-lower':
      return (
        <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-gradient-to-b from-orange-400 to-yellow-600 border border-white/20 shadow-inner flex items-center justify-center">
          <motion.div className="absolute top-2 right-10 text-4xl opacity-50" animate={{ x: [-10, 10, -10] }} transition={{ duration: 10, repeat: Infinity }}>
            🦅
          </motion.div>
          
          <div className="absolute bottom-0 w-full flex justify-between items-end pb-1 px-4">
            <motion.div className="text-6xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>🌵</motion.div>
            <motion.div className="text-7xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }}>🐫</motion.div>
            <motion.div className="text-5xl" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}>🌵</motion.div>
          </div>
          
          <motion.div 
            className="z-10 text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] bg-black/20 p-4 rounded-full backdrop-blur-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.5 }}
          >
            🏜️
          </motion.div>
        </div>
      );

    case 'middle-school-upper':
      return (
        <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-gradient-to-b from-cyan-400 to-blue-700 border border-white/20 shadow-inner flex items-center justify-center">
           <motion.div className="absolute top-4 left-1/4 text-4xl opacity-70" animate={{ x: [0, 30, 0], y: [0, -10, 0] }} transition={{ duration: 8, repeat: Infinity }}>
            ☁️
          </motion.div>
          
          <div className="absolute bottom-0 w-full flex justify-around items-end">
            <motion.div className="text-5xl mb-2" animate={{ y: [0, -10, 0], rotate: [-5, 5, -5] }} transition={{ duration: 4, repeat: Infinity }}>⛵</motion.div>
            <motion.div className="text-4xl mb-4" animate={{ y: [0, 15, 0] }} transition={{ duration: 3, repeat: Infinity }}>🐬</motion.div>
          </div>
          
          <motion.div 
            className="z-10 text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] bg-white/20 p-4 rounded-full backdrop-blur-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.5 }}
          >
            🌊
          </motion.div>
        </div>
      );

    case 'high-school':
      return (
        <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-700 to-purple-900 border border-white/20 shadow-inner flex items-center justify-center">
           <motion.div className="absolute top-2 right-1/4 text-3xl opacity-40" animate={{ x: [0, -40, 0] }} transition={{ duration: 15, repeat: Infinity }}>
            ☁️
          </motion.div>
          
          <div className="absolute bottom-0 w-full flex justify-center items-end pb-0">
             <motion.div className="text-7xl absolute left-4" initial={{ y: 50 }} animate={{ y: 0 }} transition={{ type: 'spring' }}>⛰️</motion.div>
             <motion.div className="text-8xl" initial={{ y: 50 }} animate={{ y: 0 }} transition={{ type: 'spring', delay: 0.1 }}>🏔️</motion.div>
             <motion.div className="text-6xl absolute right-4" initial={{ y: 50 }} animate={{ y: 0 }} transition={{ type: 'spring', delay: 0.2 }}>⛰️</motion.div>
          </div>
          
          <motion.div 
            className="z-10 text-6xl drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] bg-black/30 p-4 rounded-full backdrop-blur-sm"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.5 }}
          >
            🧭
          </motion.div>
        </div>
      );

    case 'university':
    default:
      return (
        <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-indigo-950 border border-white/20 shadow-inner flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/40 via-transparent to-transparent opacity-60" />
          
          {[...Array(20)].map((_, i) => (
             <motion.div 
               key={`star-${i}`}
               className="absolute w-1 h-1 bg-white rounded-full"
               style={{ 
                 top: `${Math.random() * 100}%`, 
                 left: `${Math.random() * 100}%`,
                 opacity: Math.random() * 0.8 + 0.2
               }}
               animate={{ opacity: [0.2, 1, 0.2] }}
               transition={{ duration: 1.5 + Math.random() * 2, repeat: Infinity }}
             />
          ))}
          
          <motion.div className="absolute top-4 left-4 text-4xl" animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}>
            🪐
          </motion.div>
          <motion.div className="absolute bottom-6 right-8 text-3xl" animate={{ x: [0, -20, 0], y: [0, 10, 0] }} transition={{ duration: 10, repeat: Infinity }}>
            🛰️
          </motion.div>
          
          <motion.div 
            className="z-10 text-6xl drop-shadow-[0_0_25px_rgba(255,255,255,0.8)] bg-white/10 p-4 rounded-full backdrop-blur-md"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 12, delay: 0.5 }}
          >
            🌌
          </motion.div>
        </div>
      );
  }
}
