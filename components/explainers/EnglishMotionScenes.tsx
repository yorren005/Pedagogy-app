import { motion } from 'framer-motion';

interface SceneProps {
  levelNum: number;
}

export default function EnglishMotionScenes({ slug, levelNum }: { slug: string; levelNum: number }) {
  const type = getSceneType(slug);

  switch (type) {
    case 'reading':
      return <ReadingScene levelNum={levelNum} />;
    case 'grammar':
      return <GrammarScene levelNum={levelNum} />;
    case 'writing':
    default:
      return <WritingScene levelNum={levelNum} />;
  }
}

function getSceneType(slug: string) {
  if (['story-builder', 'lit-labyrinth', 'critical-lens'].includes(slug)) return 'reading';
  if (['word-safari', 'grammar-galaxy', 'vocab-vault'].includes(slug)) return 'grammar';
  return 'writing'; // essay-engine, rhetoric-arena, debate-dojo, thesis-forge
}

function ReadingScene({ levelNum }: SceneProps) {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
      <svg width="200" height="150" viewBox="0 0 200 150">
        {/* Book cover */}
        <rect x="20" y="30" width="160" height="100" fill="#4338ca" rx="5" />
        {/* Pages */}
        <rect x="25" y="35" width="70" height="90" fill="#f8fafc" rx="2" />
        <rect x="105" y="35" width="70" height="90" fill="#f8fafc" rx="2" />
        
        {/* Flipping page animation */}
        <motion.rect 
          x="105" y="35" width="70" height="90" fill="#e2e8f0" rx="2"
          style={{ transformOrigin: "100px 80px" }}
          animate={{ scaleX: [-1, 1], skewY: [10, 0, -10, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.line x1="40" y1="50" x2="80" y2="50" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity }} />
        <motion.line x1="40" y1="70" x2="70" y2="70" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} />
      </svg>
    </div>
  );
}

function GrammarScene({ levelNum }: SceneProps) {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
      <svg width="300" height="150" viewBox="0 0 300 150">
        {/* Target boxes */}
        <rect x="50" y="40" width="80" height="40" fill="#3b82f6" rx="8" opacity="0.8" />
        <text x="90" y="65" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">Noun</text>
        
        <rect x="170" y="40" width="80" height="40" fill="#10b981" rx="8" opacity="0.8" />
        <text x="210" y="65" fill="white" fontSize="16" textAnchor="middle" fontWeight="bold">Verb</text>
        
        {/* Animated word sorting */}
        <motion.rect 
          width="60" height="30" fill="white" rx="5"
          initial={{ x: 120, y: 110 }}
          animate={{ x: [120, 60, 120, 180], y: [110, 45, 110, 45] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.25, 0.5, 0.75] }}
        />
        <motion.text 
          fontSize="14" fill="#0f172a" fontWeight="bold" textAnchor="middle"
          initial={{ x: 150, y: 130 }}
          animate={{ x: [150, 90, 150, 210], y: [130, 65, 130, 65] }}
          transition={{ duration: 4, repeat: Infinity, times: [0, 0.25, 0.5, 0.75] }}
        >
          {levelNum % 2 === 0 ? "Jump" : "Cat"}
        </motion.text>
      </svg>
    </div>
  );
}

function WritingScene({ levelNum }: SceneProps) {
  return (
    <div className="w-full h-48 relative overflow-hidden rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center">
      <svg width="300" height="150" viewBox="0 0 300 150">
        {/* Gear 1 */}
        <motion.g animate={{ rotate: 360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ originX: "100px", originY: "75px" }}>
          <circle cx="100" cy="75" r="30" fill="none" stroke="#f59e0b" strokeWidth="10" strokeDasharray="15 10" />
          <circle cx="100" cy="75" r="20" fill="#d97706" />
        </motion.g>
        
        {/* Gear 2 (interlocking) */}
        <motion.g animate={{ rotate: -360 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} style={{ originX: "170px", originY: "75px" }}>
          <circle cx="170" cy="75" r="30" fill="none" stroke="#eab308" strokeWidth="10" strokeDasharray="15 10" />
          <circle cx="170" cy="75" r="20" fill="#ca8a04" />
        </motion.g>
        
        {/* Document emerging */}
        <motion.rect 
          x="115" y="100" width="40" height="50" fill="white" rx="2"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: [100, 120, 100], opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.line x1="120" y1="110" x2="140" y2="110" stroke="#94a3b8" strokeWidth="2" animate={{ y: [110, 130, 110], opacity: [0, 1, 0] }} transition={{ duration: 2, repeat: Infinity }} />
      </svg>
    </div>
  );
}
