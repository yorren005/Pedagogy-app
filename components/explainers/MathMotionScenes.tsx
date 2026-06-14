import { motion } from 'framer-motion';

interface SceneProps {
  levelNum: number;
}

export default function MathMotionScenes({ slug, levelNum }: { slug: string; levelNum: number }) {
  // Map slugs to parametric scenes
  const type = getSceneType(slug);

  switch (type) {
    case 'arithmetic':
      return <ArithmeticScene levelNum={levelNum} />;
    case 'geometry':
      return <GeometryScene levelNum={levelNum} />;
    case 'graph':
      return <GraphScene levelNum={levelNum} />;
    case 'chart':
      return <ChartScene levelNum={levelNum} />;
    case 'logic':
    default:
      return <LogicScene levelNum={levelNum} />;
  }
}

function getSceneType(slug: string) {
  if (['fruit-market', 'the-picnic', 'toy-factory', 'pizza-party', 'equation-quest', 'ratio-rally'].includes(slug)) return 'arithmetic';
  if (['shape-shift', 'coordinate-clash', 'trig-tower'].includes(slug)) return 'geometry';
  if (['function-forge', 'limit-launcher', 'calculus-cascade', 'diff-eq-duel'].includes(slug)) return 'graph';
  if (['data-detective', 'probability-pinball', 'stats-showdown'].includes(slug)) return 'chart';
  return 'logic';
}

function ArithmeticScene({ levelNum }: SceneProps) {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 300 150">
        <motion.circle 
          cx="100" cy="75" r="20" fill="#ff6b81"
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.circle 
          cx="200" cy="75" r="20" fill="#70a1ff"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
        />
        <motion.text 
          x="150" y="85" fill="white" fontSize="30" textAnchor="middle" fontWeight="bold"
          animate={{ scale: [1, 1.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          +
        </motion.text>
      </svg>
    </div>
  );
}

function GeometryScene({ levelNum }: SceneProps) {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 300 150">
        <motion.polygon 
          points="150,30 220,120 80,120" 
          fill="none" 
          stroke="#14b8a6" 
          strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.circle 
          cx="150" cy="90" r="40" 
          fill="none" stroke="#f59e0b" strokeWidth="2" strokeDasharray="5,5"
          animate={{ rotate: 360 }}
          transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
}

function GraphScene({ levelNum }: SceneProps) {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 300 150">
        <line x1="50" y1="75" x2="250" y2="75" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <line x1="150" y1="25" x2="150" y2="125" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
        <motion.path 
          d="M 50 75 Q 100 0 150 75 T 250 75" 
          fill="none" stroke="#0ea5e9" strokeWidth="4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </svg>
    </div>
  );
}

function ChartScene({ levelNum }: SceneProps) {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center items-end pb-8">
      <div className="flex items-end gap-4 h-24">
        {[40, 70, 100, 60, 80].map((h, i) => (
          <motion.div 
            key={i}
            className="w-8 bg-purple-500 rounded-t-sm"
            initial={{ height: 0 }}
            animate={{ height: h }}
            transition={{ duration: 1, delay: i * 0.2, repeat: Infinity, repeatType: 'reverse' }}
          />
        ))}
      </div>
    </div>
  );
}

function LogicScene({ levelNum }: SceneProps) {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 300 150">
        <motion.line x1="100" y1="75" x2="200" y2="75" stroke="#f43f5e" strokeWidth="3" 
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, repeat: Infinity }} />
        <motion.circle cx="100" cy="75" r="15" fill="#e11d48" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} />
        <motion.circle cx="200" cy="75" r="15" fill="#be123c" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity, delay: 0.5 }} />
      </svg>
    </div>
  );
}
