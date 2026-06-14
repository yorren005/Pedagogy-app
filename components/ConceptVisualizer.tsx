'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTTS } from '@/lib/useTTS';
import { useAudio } from '@/lib/useAudio';
import { AgeRange } from '@/lib/gameConfig';

interface ConceptVisualizerProps {
  slug: string;
  ageRange: AgeRange;
  onClose: () => void;
}

export default function ConceptVisualizer({ slug, ageRange, onClose }: ConceptVisualizerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const { speak, stop } = useTTS();
  const { playSound } = useAudio();

  // Storyboard Slides Data
  const slides = getSlidesForGame(slug);

  // Set TTS properties based on age range
  const ttsOptions = {
    elementary: { rate: 0.88, pitch: 1.15 },
    'middle-school-lower': { rate: 1.0, pitch: 1.0 },
    'middle-school-upper': { rate: 1.0, pitch: 1.0 },
    'high-school': { rate: 1.05, pitch: 0.95 },
    'university': { rate: 1.05, pitch: 0.95 },
  }[ageRange];

  const triggerNarration = (slideIndex: number) => {
    if (isMuted) {
      stop();
      return;
    }
    const textToSpeak = slides[slideIndex]?.narration || slides[slideIndex]?.text || '';
    speak(textToSpeak, ttsOptions);
  };

  useEffect(() => {
    triggerNarration(currentSlide);
    return () => stop();
  }, [currentSlide, isMuted, slug]);

  const handleNext = () => {
    playSound('click');
    if (currentSlide < 2) {
      setCurrentSlide((prev) => prev + 1);
    } else {
      stop();
      onClose();
    }
  };

  const handlePrev = () => {
    playSound('click');
    if (currentSlide > 0) {
      setCurrentSlide((prev) => prev - 1);
    }
  };

  const toggleMute = () => {
    playSound('click');
    setIsMuted((prev) => !prev);
  };

  const handleRepeat = () => {
    playSound('click');
    triggerNarration(currentSlide);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060413]/90 backdrop-blur-xl p-4 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between relative shadow-2xl backdrop-blur-md min-h-[500px]"
      >
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <h2 className="font-display text-lg font-bold text-white/90">
              Concept Quest: {slides[currentSlide]?.title}
            </h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleMute}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
              title="Mute Narration"
            >
              {isMuted ? '🔇 Unmute' : '🔊 Mute'}
            </button>
            <button
              onClick={handleRepeat}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
              title="Repeat Narration"
            >
              🔁 Replay
            </button>
          </div>
        </div>

        {/* Slide Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center py-4 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -50, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-col items-center text-center"
            >
              {/* Story visual metaphor - Slides 1 and 2 */}
              {currentSlide < 2 ? (
                <div className="w-full flex flex-col items-center">
                  <div className="w-48 h-48 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-8xl mb-6 shadow-inner animate-pulse">
                    {slides[currentSlide]?.visual}
                  </div>
                  <p className="text-white/80 font-medium text-lg leading-relaxed max-w-lg mb-6">
                    {slides[currentSlide]?.text}
                  </p>
                </div>
              ) : (
                /* Interactive Widget - Slide 3 */
                <div className="w-full flex flex-col items-center">
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 shadow-inner">
                    {renderWidget(slug, playSound)}
                  </div>
                  <p className="text-white/80 font-medium text-sm max-w-lg mb-2">
                    {slides[2]?.text}
                  </p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Narrator Subtitles Box */}
        <div className="bg-black/40 border border-white/5 rounded-xl px-4 py-2.5 mb-6 text-center text-xs text-white/50 italic pointer-events-none select-none">
          🗣️ "{slides[currentSlide]?.narration || slides[currentSlide]?.text}"
        </div>

        {/* Navigation Footer */}
        <div className="flex justify-between items-center border-t border-white/5 pt-3">
          {/* Stepper dots */}
          <div className="flex gap-2">
            {[0, 1, 2].map((idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  currentSlide === idx ? 'bg-cyan-400' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="px-5 py-2.5 rounded-full text-sm font-bold bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-6 py-2.5 rounded-full text-sm font-extrabold bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 transition-all"
            >
              {currentSlide === 2 ? "Let's Play!" : 'Next'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ─── Storyboard Slide Content Generator ─────────────────────────────────────
interface SlideDef {
  title: string;
  text: string;
  narration: string;
  visual: string;
}

function getSlidesForGame(slug: string): SlideDef[] {
  const gameNarrations: Record<string, SlideDef[]> = {
    'fruit-market': [
      {
        title: 'Milo is Hungry',
        text: 'Milo the Fox is gathering apples to trade at the market. He needs our help to calculate the total!',
        narration: 'Milo the Fox wants to gather apples to trade at the market. Let\'s help him count them!',
        visual: '🦊🍏',
      },
      {
        title: 'Combining Fruit',
        text: 'Addition means putting groups together. If we have 3 apples and drop 2 more in, we combine them into a bigger total.',
        narration: 'Addition means combining different groups of items together. When we add apples, the total grows.',
        visual: '🧺➕🍎',
      },
      {
        title: 'Try it Out!',
        text: 'Drag apples into the basket. See the number badge update as they drop!',
        narration: 'Now, try dragging apples into the basket yourself to see how addition works in real life!',
        visual: '',
      },
    ],
    'the-picnic': [
      {
        title: 'Ant Raid!',
        text: 'Milo set up a picnic, but tiny ants are taking sandwiches away! We need subtraction to see what is left.',
        narration: 'Oh no, ants are taking sandwiches from Milo\'s picnic! We need subtraction to see what remains.',
        visual: '🥪🐜',
      },
      {
        title: 'Taking Away',
        text: 'Subtraction means removing items from a group. Removing 2 sandwiches from 5 leaves us with fewer items.',
        narration: 'Subtraction means taking items away from a group. When we remove items, our count goes down.',
        visual: '🥪➖🐜',
      },
      {
        title: 'Help Milo!',
        text: 'Drag sandwiches out of the basket to subtract them and help Milo count the remaining sandwiches!',
        narration: 'Help Milo by dragging sandwiches out of the basket to subtract them. Watch the count change!',
        visual: '',
      },
    ],
    'pizza-party': [
      {
        title: 'Sharing Pizza',
        text: 'Milo and his friends want to share a delicious pizza equally. They need fractions to cut it fairly!',
        narration: 'Milo is having a pizza party! Let\'s learn how fractions help us share a pizza equally.',
        visual: '🍕🦊',
      },
      {
        title: 'Parts of a Whole',
        text: 'Fractions are parts of a whole item. The denominator is the total cuts, and the numerator is the colored slices.',
        narration: 'Fractions represent parts of a whole. The bottom number cuts the pizza, and the top number shows our slices.',
        visual: '🍕📏',
      },
      {
        title: 'Cut & Color',
        text: 'Slide the controls to cut the pizza into slices and color them in. Watch the fraction update!',
        narration: 'Slide the controls to change the cuts and colored slices. Notice how two-fourths is the same size as one-half!',
        visual: '',
      },
    ],
    'equation-quest': [
      {
        title: 'The Unbalanced Scale',
        text: 'Milo faces a giant boulder x on a balance scale, blocked by 3 heavy weights, with 7 weights balancing them.',
        narration: 'Milo is blocked by a giant scale! To find the weight of the mystery box x, we must keep the scale balanced.',
        visual: '⚖️📦',
      },
      {
        title: 'Keeping the Balance',
        text: 'An equation is like a balance scale. Whatever mathematical operations you do to one side, you must do to the other.',
        narration: 'An equation is a balance scale. To solve for x, we must remove the same amount of weight from both sides.',
        visual: '⚖️🧮',
      },
      {
        title: 'Solve the Scale',
        text: 'Click the "Remove 1 weight" button. It removes 1 weight from both sides simultaneously, keeping it balanced!',
        narration: 'Click the button to remove weights from both sides at the same time until the mystery box is isolated.',
        visual: '',
      },
    ],
    'shape-shift': [
      {
        title: 'Transforming Shapes',
        text: 'Milo wants to align a magical crystal key with a lock by sliding, spinning, or flipping it on a grid.',
        narration: 'Help Milo fit the key into the lock by translating, rotating, or reflecting the shape!',
        visual: '📐💎',
      },
      {
        title: 'Spatial Rules',
        text: 'Translating slides the shape, rotating spins it around a pivot, and reflecting flips it over an axis.',
        narration: 'Translating moves a shape, rotating spins it, and reflecting flips it. The shape changes coordinates but keeps its size.',
        visual: '📐🌀',
      },
      {
        title: 'Interact with Geometry',
        text: 'Use the buttons to translate, rotate, or flip the shape. Watch the vertex coordinates update in real-time!',
        narration: 'Click the buttons to shift, rotate, or flip the shape and see how the coordinates change.',
        visual: '',
      },
    ],
    'function-forge': [
      {
        title: 'Skater Milo',
        text: 'Milo wants to ride his skateboard down the mountain ramp, but he needs to adjust the steepness and height first!',
        narration: 'Milo wants to skateboard! Let\'s build the perfect ramp by forging a linear function.',
        visual: '🛹⛰️',
      },
      {
        title: 'Slope and Intercept',
        text: 'In the formula y = mx + c, the slope m controls the ramp steepness, and the intercept c shifts its starting height.',
        narration: 'In a function, the slope m controls the steepness, and the intercept c shifts the ramp height up or down.',
        visual: '📈⚒️',
      },
      {
        title: 'Shape the Ramp',
        text: 'Drag the sliders for slope m and intercept c. See how the skateboarder\'s ramp morphs instantly!',
        narration: 'Slide m to tilt the ramp and c to raise it. See how slope is simply the rate of climb!',
        visual: '',
      },
    ],
    'trig-tower': [
      {
        title: 'The Ferris Wheel',
        text: 'Milo is riding a Ferris Wheel! As he turns around the circle, his height above the ground draws a wave.',
        narration: 'Let\'s ride the Ferris wheel! Watch how rotating around a circle draws a wave.',
        visual: '🗼🎡',
      },
      {
        title: 'Sine and Cosine',
        text: 'The angle of rotation determines the height (Sine) and the horizontal distance from the center tower (Cosine).',
        narration: 'The height of the rider is the Sine value, and their distance from the tower is the Cosine value.',
        visual: '🎡📈',
      },
      {
        title: 'Rotate the Wheel',
        text: 'Drag the angle slider to rotate the wheel and trace the sine and cosine waves on the adjacent graph!',
        narration: 'Drag the slider to spin the wheel. Watch the sine wave map the height as the angle changes.',
        visual: '',
      },
    ],
    'limit-launcher': [
      {
        title: 'The Broken Bridge',
        text: 'Milo is walking along a path, but there is a bridge gap at x = 2. He can\'t step on it, but he can get infinitely close.',
        narration: 'Milo\'s path has a bridge with a missing gap! He can get infinitely close to it without stepping in.',
        visual: '🚀🌁',
      },
      {
        title: 'Approaching the Limit',
        text: 'A limit describes the value a function approaches as x gets closer and closer to a target point from both sides.',
        narration: 'A limit is about the target spot we approach. Even if the bridge is out at a point, we agree on where it should be.',
        visual: '🔍📈',
      },
      {
        title: 'Zoom In!',
        text: 'Use the magnifying glass slider to zoom in closer and closer to x = 2. Watch the runners agree on the meeting spot.',
        narration: 'Slide to zoom in. Watch the runners approach from left and right, meeting at the gap.',
        visual: '',
      },
    ],
    'calculus-cascade': [
      {
        title: 'Filling the Vase',
        text: 'Water pours into a vase. To calculate the total volume, we must accumulate the flow rate over time.',
        narration: 'Let\'s fill a vase! We will measure the total water accumulated by adding up the flow rate.',
        visual: '🌊🏺',
      },
      {
        title: 'Riemann Rectangle Sums',
        text: 'Integration finds the area under a curve. We can approximate it by drawing rectangles and making them narrower.',
        narration: 'Integration finds the total accumulation. We approximate the area under a curve with rectangles.',
        visual: '🏺📊',
      },
      {
        title: 'Adjust Rectangles',
        text: 'Drag the intervals slider to see the Riemann rectangles get narrower. Watch the approximation become exact!',
        narration: 'Drag the slider to make the rectangles thinner. Notice how the error shrinks as the steps get smaller!',
        visual: '',
      },
    ],
    'abstract-arena': [
      {
        title: 'Symmetry of Shapes',
        text: 'Milo is rotating a triangular tile. When does a rotation leave the shape looking identical to the background silhouette?',
        narration: 'Let\'s spin a triangle! Symmetries are rotations that leave the shape matching its original outline.',
        visual: '♾️🔺',
      },
      {
        title: 'Abstract Group Elements',
        text: 'A valid group element is a transformation (like rotating 120°) that preserves the symmetry of the shape.',
        narration: 'Rotating by one hundred and twenty degrees flips the corner labels but keeps the triangle aligned. This is a group element.',
        visual: '♾️🔄',
      },
      {
        title: 'Spin the Triangle',
        text: 'Click the rotate button to spin the triangle 120° and see how vertices swap places while keeping the shape identical.',
        narration: 'Click the rotate button to spin the triangle. Observe how the vertices swap places.',
        visual: '',
      },
    ],
  };

  // Fallback for English/Default games
  const defaultNarrations: SlideDef[] = [
    {
      title: 'The Word Train',
      text: 'Milo is driving a sentence train! But the tracks are disconnected because conjunctions are missing.',
      narration: 'Milo\'s sentence train is stopped! We need sentence connectors to make the tracks complete.',
      visual: '📖🚂',
    },
    {
      title: 'Connecting Ideas',
      text: 'Conjunctions like "and", "but", and "because" link ideas together to make sentences flow correctly.',
      narration: 'Conjunctions connect clauses. "Because" explains a reason, and "but" shows a contrast.',
      visual: '🚂🔗',
    },
    {
      title: 'Slide the Connectors',
      text: 'Drag the correct conjunction block into the track slot to connect the sentences and drive the train forward!',
      narration: 'Drag the correct connector block into the slot to complete the track and let the train pass!',
      visual: '',
    },
  ];

  return gameNarrations[slug] || defaultNarrations;
}

// ─── Render Interactive Analogy Widgets ─────────────────────────────────────
function renderWidget(slug: string, playSound: (type: any) => void) {
  if (slug === 'fruit-market' || slug === 'the-picnic' || slug === 'toy-factory') {
    return <FruitBasketWidget playSound={playSound} />;
  }
  if (slug === 'pizza-party') {
    return <PizzaSlicerWidget playSound={playSound} />;
  }
  if (slug === 'equation-quest') {
    return <BalanceScaleWidget playSound={playSound} />;
  }
  if (slug === 'shape-shift') {
    return <TransformationsGridWidget playSound={playSound} />;
  }
  if (slug === 'function-forge') {
    return <MountainRampWidget playSound={playSound} />;
  }
  if (slug === 'trig-tower') {
    return <FerrisWheelWidget playSound={playSound} />;
  }
  if (slug === 'limit-launcher') {
    return <MagnifyingGlassWidget playSound={playSound} />;
  }
  if (slug === 'calculus-cascade') {
    return <VaseFillerWidget playSound={playSound} />;
  }
  if (slug === 'abstract-arena') {
    return <RotatingTriangleWidget playSound={playSound} />;
  }
  return <SentenceTrainWidget playSound={playSound} />;
}

/* 1. Fruit Basket Widget */
function FruitBasketWidget({ playSound }: { playSound: any }) {
  const [count, setCount] = useState(3);
  const [apples, setApples] = useState<number[]>([1, 2, 3]);

  const addApple = () => {
    playSound('click');
    setCount((prev) => prev + 1);
    setApples((prev) => [...prev, Date.now()]);
  };

  const removeApple = () => {
    if (count > 0) {
      playSound('click');
      setCount((prev) => prev - 1);
      setApples((prev) => prev.slice(0, -1));
    }
  };

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-2 mb-3">
        <button onClick={addApple} className="px-3 py-1.5 bg-green-500 rounded-full text-xs font-bold text-white hover:bg-green-600 transition-colors">➕ Add Apple</button>
        <button onClick={removeApple} className="px-3 py-1.5 bg-red-500 rounded-full text-xs font-bold text-white hover:bg-red-600 transition-colors">➖ Remove Apple</button>
      </div>
      <div className="w-full h-24 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative select-none">
        <div className="flex flex-wrap justify-center gap-1 max-w-[200px] z-10">
          {apples.map((id) => (
            <motion.span key={id} layout initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} className="text-2xl">🍎</motion.span>
          ))}
        </div>
        <div className="absolute bottom-2 right-4 bg-black/40 px-2 py-0.5 rounded text-xs font-bold text-white z-20">
          Total: {count}
        </div>
      </div>
    </div>
  );
}

/* 2. Pizza Slicer Widget */
function PizzaSlicerWidget({ playSound }: { playSound: any }) {
  const [num, setNum] = useState(2);
  const [den, setDen] = useState(4);

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-4 mb-3 w-full max-w-[280px]">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] text-white/50 mb-1">Numerator: {num}</span>
          <input
            type="range" min="1" max={den} value={num}
            onChange={(e) => { playSound('click'); setNum(parseInt(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] text-white/50 mb-1">Denominator: {den}</span>
          <input
            type="range" min="2" max="8" value={den}
            onChange={(e) => {
              playSound('click');
              const newDen = parseInt(e.target.value);
              setDen(newDen);
              if (num > newDen) setNum(newDen);
            }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>
      <div className="relative w-24 h-24 rounded-full border border-white/20 bg-white/5 overflow-hidden flex items-center justify-center">
        {/* Draw pizza slices using SVG conics */}
        <svg className="w-full h-full rotate-[-90deg]">
          {Array.from({ length: den }).map((_, i) => {
            const angle = 360 / den;
            const startAngle = i * angle;
            const isFilled = i < num;
            // Draw a wedge path
            const x1 = 48 + 48 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 48 + 48 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 48 + 48 * Math.cos(((startAngle + angle) * Math.PI) / 180);
            const y2 = 48 + 48 * Math.sin(((startAngle + angle) * Math.PI) / 180);
            return (
              <path
                key={i}
                d={`M 48 48 L ${x1} ${y1} A 48 48 0 0 1 ${x2} ${y2} Z`}
                fill={isFilled ? 'rgba(239, 68, 68, 0.7)' : 'transparent'}
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <span className="absolute text-xs bg-black/60 px-1.5 py-0.5 rounded font-extrabold text-white">
          {num}/{den}
        </span>
      </div>
    </div>
  );
}

/* 3. Balance Scale Widget */
function BalanceScaleWidget({ playSound }: { playSound: any }) {
  const [leftWeights, setLeftWeights] = useState(3);
  const [rightWeights, setRightWeights] = useState(7);
  const [solved, setSolved] = useState(false);

  const removeWeight = () => {
    if (leftWeights > 0 && rightWeights > 0) {
      playSound('click');
      setLeftWeights((w) => w - 1);
      setRightWeights((w) => w - 1);
    }
  };

  useEffect(() => {
    if (leftWeights === 0 && rightWeights === 4) {
      setSolved(true);
      playSound('success');
    } else {
      setSolved(false);
    }
  }, [leftWeights, rightWeights]);

  return (
    <div className="flex flex-col items-center p-2">
      <button
        onClick={removeWeight}
        disabled={leftWeights === 0}
        className="px-4 py-1.5 bg-cyan-500 disabled:opacity-40 rounded-full text-xs font-bold text-white hover:bg-cyan-600 transition-all mb-4"
      >
        ⚖️ Remove 1 weight from BOTH sides
      </button>

      <div className="w-full max-w-xs h-28 relative flex items-center justify-between border-b border-white/20 pb-4">
        {/* Left Pan */}
        <motion.div
          animate={{ y: leftWeights === rightWeights - 4 ? 0 : leftWeights > rightWeights - 4 ? 12 : -12 }}
          className="w-24 h-16 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center p-1 text-xs"
        >
          <span className="font-bold text-cyan-300">Left Side</span>
          <span className="text-[10px] text-white/50">Box [x] + {leftWeights}</span>
          <div className="flex gap-0.5 mt-1 flex-wrap justify-center">
            <span className="text-xs">📦</span>
            {Array.from({ length: leftWeights }).map((_, i) => (
              <span key={i} className="text-[10px]">⬜</span>
            ))}
          </div>
        </motion.div>

        {/* Pivot */}
        <div className="w-1.5 h-16 bg-white/20 rounded flex items-end justify-center">
          <div className="w-3 h-3 rounded-full bg-cyan-500" />
        </div>

        {/* Right Pan */}
        <motion.div
          animate={{ y: leftWeights === rightWeights - 4 ? 0 : leftWeights > rightWeights - 4 ? -12 : 12 }}
          className="w-24 h-16 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center p-1 text-xs"
        >
          <span className="font-bold text-cyan-300">Right Side</span>
          <span className="text-[10px] text-white/50">{rightWeights} weights</span>
          <div className="flex gap-0.5 mt-1 flex-wrap justify-center max-w-[80px]">
            {Array.from({ length: rightWeights }).map((_, i) => (
              <span key={i} className="text-[10px]">⬜</span>
            ))}
          </div>
        </motion.div>

        {solved && (
          <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-sm font-extrabold text-green-400">
            Balanced! x = 4 🎉
          </div>
        )}
      </div>
    </div>
  );
}

/* 4. Transformations Grid Widget */
function TransformationsGridWidget({ playSound }: { playSound: any }) {
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);

  const translateRight = () => { playSound('click'); setPosX((x) => (x < 2 ? x + 1 : 2)); };
  const translateLeft = () => { playSound('click'); setPosX((x) => (x > -2 ? x - 1 : -2)); };
  const rotateRight = () => { playSound('click'); setRotation((r) => r + 90); };
  const flip = () => { playSound('click'); setRotation((r) => r + 180); };

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-1.5 mb-3">
        <button onClick={translateLeft} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white font-bold">⬅️ L</button>
        <button onClick={translateRight} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white font-bold">➡️ R</button>
        <button onClick={rotateRight} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white font-bold">🔄 Rotate 90°</button>
        <button onClick={flip} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-white font-bold">↔️ Flip</button>
      </div>

      <div className="w-28 h-28 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
        {/* Draw a grid background */}
        <div className="absolute inset-0 grid grid-cols-5 grid-rows-5 opacity-10">
          {Array.from({ length: 25 }).map((_, i) => (
            <div key={i} className="border border-white" />
          ))}
        </div>
        {/* Transforming triangle */}
        <motion.div
          animate={{ x: posX * 16, y: -posY * 16, rotate: rotation }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="w-0 h-0 border-l-[16px] border-l-transparent border-r-[16px] border-r-transparent border-b-[28px] border-b-cyan-400 relative"
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] font-bold text-black select-none pointer-events-none">F</div>
        </motion.div>
        <div className="absolute bottom-1 right-2 text-[9px] text-white/40 font-mono">
          ({posX}, {posY})
        </div>
      </div>
    </div>
  );
}

/* 5. Mountain Ramp Widget */
function MountainRampWidget({ playSound }: { playSound: any }) {
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-4 mb-3 w-full max-w-[280px]">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] text-white/50 mb-1">Slope m: {slope.toFixed(1)}</span>
          <input
            type="range" min="0.2" max="2" step="0.2" value={slope}
            onChange={(e) => { playSound('click'); setSlope(parseFloat(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[10px] text-white/50 mb-1">Intercept c: {intercept}</span>
          <input
            type="range" min="-15" max="15" value={intercept}
            onChange={(e) => { playSound('click'); setIntercept(parseInt(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      <div className="w-full max-w-[280px] h-32 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
        {/* Draw ramp function */}
        <svg className="w-full h-full absolute inset-0">
          <line
            x1="0"
            y1={128 - (0 * slope + (intercept + 64))}
            x2="280"
            y2={128 - (280 * slope + (intercept + 64))}
            stroke="cyan"
            strokeWidth="3"
          />
        </svg>
        {/* Skateboarder */}
        <motion.div
          animate={{ x: 120, y: 128 - (120 * slope + (intercept + 64)) - 12, rotate: -Math.atan(slope) * (180 / Math.PI) }}
          className="absolute text-xl pointer-events-none"
        >
          🛹
        </motion.div>
        <div className="absolute top-2 left-3 text-[10px] text-cyan-300 font-mono">
          y = {slope.toFixed(1)}x + {intercept}
        </div>
      </div>
    </div>
  );
}

/* 6. Ferris Wheel Widget */
function FerrisWheelWidget({ playSound }: { playSound: any }) {
  const [angle, setAngle] = useState(0);

  const rad = (angle * Math.PI) / 180;
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);

  return (
    <div className="flex flex-col items-center p-2">
      <input
        type="range" min="0" max="360" value={angle}
        onChange={(e) => { playSound('click'); setAngle(parseInt(e.target.value)); }}
        className="w-full max-w-[240px] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-4"
      />

      <div className="flex gap-6 items-center justify-center w-full max-w-md h-32">
        {/* Unit Circle Ferris Wheel */}
        <div className="w-24 h-24 rounded-full border border-white/20 bg-white/5 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/10" />
          {/* Wheel spoke */}
          <svg className="w-full h-full absolute inset-0">
            <line
              x1="48" y1="48"
              x2={48 + 36 * cosVal}
              y2={48 - 36 * sinVal}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="2"
            />
          </svg>
          {/* Rider */}
          <div
            className="absolute w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_cyan]"
            style={{
              left: 48 + 36 * cosVal - 5,
              top: 48 - 36 * sinVal - 5,
            }}
          />
          <div className="text-[9px] text-white/40 font-mono absolute bottom-1">
            θ = {angle}°
          </div>
        </div>

        {/* Live Traced Wave */}
        <div className="w-32 h-24 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex flex-col justify-between p-2">
          <div className="text-[10px] font-bold text-cyan-300 font-mono">Traced Sine:</div>
          <div className="h-12 w-full flex items-center justify-center relative border-y border-white/5">
            <div className="absolute left-0 w-full h-[1px] bg-white/10" />
            {/* Draw a segment of the sine wave */}
            <svg className="w-full h-full absolute inset-0">
              <path
                d={Array.from({ length: 100 }).map((_, idx) => {
                  const t = idx / 100;
                  const x = t * 120;
                  const a = rad - (1 - t) * 4;
                  const y = 24 - 16 * Math.sin(a);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="cyan"
                strokeWidth="1.5"
                fill="none"
              />
            </svg>
            <div className="absolute right-2 text-xs font-extrabold text-cyan-400">
              {sinVal.toFixed(2)}
            </div>
          </div>
          <div className="text-[9px] text-white/40 text-right">Height = sin(θ)</div>
        </div>
      </div>
    </div>
  );
}

/* 7. Magnifying Glass Widget */
function MagnifyingGlassWidget({ playSound }: { playSound: any }) {
  const [zoom, setZoom] = useState(1);

  return (
    <div className="flex flex-col items-center p-2">
      <span className="text-[10px] text-white/50 mb-1">Zoom Slider (Approach x = 2):</span>
      <input
        type="range" min="1" max="100" value={zoom}
        onChange={(e) => { playSound('click'); setZoom(parseInt(e.target.value)); }}
        className="w-full max-w-[240px] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-4"
      />

      <div className="relative w-full max-w-[280px] h-28 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
        {/* Drawn graph with gap at x=2 */}
        {/* Scale dynamically based on zoom level */}
        <svg className="w-full h-full absolute inset-0">
          {/* Left segment */}
          <line
            x1={140 - 100 * zoom}
            y1={56 + 40 * zoom}
            x2={140 - 2 * zoom}
            y2={56 + 0.8 * zoom}
            stroke="cyan"
            strokeWidth="3"
          />
          {/* Right segment */}
          <line
            x1={140 + 2 * zoom}
            y1={56 - 0.8 * zoom}
            x2={140 + 100 * zoom}
            y2={56 - 40 * zoom}
            stroke="cyan"
            strokeWidth="3"
          />
          {/* Hole at gap */}
          <circle cx="140" cy="56" r="4" fill="black" stroke="cyan" strokeWidth="2" />
        </svg>

        {/* Runners walking to gap */}
        <div
          className="absolute text-[10px] transition-all"
          style={{
            left: 140 - Math.max(160 / zoom, 8) - 4,
            top: 56 + Math.max(64 / zoom, 2) - 12,
          }}
        >
          🏃
        </div>
        <div
          className="absolute text-[10px] transition-all"
          style={{
            left: 140 + Math.max(160 / zoom, 8) - 4,
            top: 56 - Math.max(64 / zoom, 2) - 12,
          }}
        >
          🏃
        </div>

        <div className="absolute bottom-2 left-4 text-[9px] text-white/50">
          Zoom: {zoom}x
        </div>
        {zoom >= 80 && (
          <div className="absolute top-2 right-4 text-[10px] text-green-400 font-extrabold bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
            Limit exists! y = 3 ✅
          </div>
        )}
      </div>
    </div>
  );
}

/* 8. Vase Filler Widget */
function VaseFillerWidget({ playSound }: { playSound: any }) {
  const [intervals, setIntervals] = useState(4);

  return (
    <div className="flex flex-col items-center p-2">
      <span className="text-[10px] text-white/50 mb-1">Number of intervals (n): {intervals}</span>
      <input
        type="range" min="4" max="24" step="2" value={intervals}
        onChange={(e) => { playSound('click'); setIntervals(parseInt(e.target.value)); }}
        className="w-full max-w-[240px] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-4"
      />

      <div className="flex gap-6 items-center justify-center w-full max-w-md h-32">
        {/* Riemann Sum Graph */}
        <div className="w-36 h-28 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden p-1">
          <svg className="w-full h-full absolute inset-0">
            {/* Smooth curve: flow rate */}
            <path
              d="M 10 90 Q 60 20 130 60"
              stroke="cyan"
              strokeWidth="2"
              fill="none"
            />
            {/* Riemann rectangles */}
            {Array.from({ length: intervals }).map((_, i) => {
              const xStart = 10 + i * (120 / intervals);
              const xCenter = xStart + (60 / intervals);
              // Calculate y height using quadratic curve approximation
              // Q control point (60, 20) -> curve points
              // Let's approximate height
              const t = (xCenter - 10) / 120;
              const yCurve = (1 - t) * (1 - t) * 90 + 2 * (1 - t) * t * 20 + t * t * 60;
              const rectHeight = 100 - yCurve;
              const rectWidth = 120 / intervals;
              return (
                <rect
                  key={i}
                  x={xStart}
                  y={yCurve - 10}
                  width={rectWidth}
                  height={rectHeight}
                  fill={`rgba(6, 182, 212, ${0.1 + (i / intervals) * 0.2})`}
                  stroke="rgba(6, 182, 212, 0.4)"
                  strokeWidth="1"
                />
              );
            })}
          </svg>
          <div className="absolute top-2 left-2 text-[9px] text-white/40">Riemann Sum approximation</div>
        </div>

        {/* Vase filling up */}
        <div className="w-16 h-28 bg-white/5 border border-white/10 rounded-b-xl relative overflow-hidden flex flex-col justify-end">
          {/* Water */}
          <motion.div
            animate={{ height: `${40 + (intervals / 24) * 40}%` }}
            className="w-full bg-cyan-500/30 border-t-2 border-cyan-400 flex items-center justify-center"
          >
            <span className="text-[10px] text-cyan-300 font-extrabold">Volume</span>
          </motion.div>
          <div className="absolute top-2 left-2 text-[9px] text-white/40">Vase</div>
        </div>
      </div>
    </div>
  );
}

/* 9. Rotating Triangle Widget */
function RotatingTriangleWidget({ playSound }: { playSound: any }) {
  const [rotation, setRotation] = useState(0);

  const rotate = () => {
    playSound('click');
    setRotation((r) => r + 120);
  };

  const getLabel = (offset: number) => {
    const labels = ['A', 'B', 'C'];
    const index = (Math.floor(rotation / 120) + offset) % 3;
    return labels[index];
  };

  return (
    <div className="flex flex-col items-center p-2">
      <button
        onClick={rotate}
        className="px-4 py-1.5 bg-purple-500 rounded-full text-xs font-bold text-white hover:bg-purple-600 transition-all mb-4"
      >
        🔺 Rotate 120°
      </button>

      <div className="w-32 h-32 bg-black/40 border border-white/10 rounded-xl relative flex items-center justify-center">
        {/* Silhouette overlay */}
        <div className="absolute w-24 h-24 border-2 border-dashed border-white/15 rotate-[180deg]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />

        {/* Rotating equilateral triangle */}
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          className="w-24 h-24 bg-purple-500/30 border-2 border-purple-400 relative flex items-center justify-center"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        >
          {/* Corner labels */}
          <span className="absolute top-1 text-xs font-extrabold text-white">
            {getLabel(0)}
          </span>
          <span className="absolute bottom-1 left-2 text-xs font-extrabold text-white">
            {getLabel(1)}
          </span>
          <span className="absolute bottom-1 right-2 text-xs font-extrabold text-white">
            {getLabel(2)}
          </span>
        </motion.div>
      </div>
    </div>
  );
}

/* 10. Sentence Train Widget */
function SentenceTrainWidget({ playSound }: { playSound: any }) {
  const [slot, setSlot] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  const selectConjunction = (conj: string) => {
    playSound('click');
    setSlot(conj);
    if (conj === 'because') {
      setSolved(true);
      playSound('success');
    } else {
      setSolved(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-2">
      {/* Question */}
      <div className="text-xs text-white/80 font-bold mb-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
        "Milo stayed inside <span className="text-cyan-400 underline font-mono px-1">{slot || '____'}</span> it was raining."
      </div>

      <div className="flex gap-2 mb-4">
        {['and', 'but', 'because'].map((conj) => (
          <button
            key={conj}
            onClick={() => selectConjunction(conj)}
            className={`px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-xs font-bold text-white transition-all ${
              slot === conj ? 'border-cyan-400' : ''
            }`}
          >
            {conj}
          </button>
        ))}
      </div>

      {/* Train tracks container */}
      <div className="w-full max-w-[280px] h-14 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center px-4">
        {/* Tracks */}
        <div className="absolute inset-x-0 h-1 border-y border-dashed border-white/20 top-1/2 -translate-y-1/2" />

        {/* Sentence train */}
        <motion.div
          animate={{ x: solved ? 200 : 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="text-2xl z-10 pointer-events-none select-none"
        >
          🚂
        </motion.div>

        {solved && (
          <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[10px] font-extrabold text-green-400 uppercase tracking-widest">
            Connected! Train is driving! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
