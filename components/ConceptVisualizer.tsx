'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTTS } from '@/lib/useTTS';
import { useAudio } from '@/lib/useAudio';
import { AgeRange, AGE_RANGES, GameDef } from '@/lib/gameConfig';
import { ZONE_NAMES } from '@/lib/zoneNames';
import TerrainIntroScene from './explainers/TerrainIntroScene';
import MathMotionScenes from './explainers/MathMotionScenes';
import EnglishMotionScenes from './explainers/EnglishMotionScenes';

interface ConceptVisualizerProps {
  slug: string;
  ageRange: AgeRange;
  levelNum?: number;
  onClose: () => void;
}

export default function ConceptVisualizer({ slug, ageRange, levelNum = 1, onClose }: ConceptVisualizerProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const { speak, stop } = useTTS();
  const { playSound } = useAudio();

  const game = useMemo(() => {
    for (const ar of AGE_RANGES) {
      const g = ar.games.find(x => x.slug === slug);
      if (g) return g;
    }
    return undefined;
  }, [slug]);

  const zoneName = useMemo(() => {
    if (!game) return `Zone ${levelNum}`;
    return ZONE_NAMES[game.key]?.[levelNum - 1] || `Zone ${levelNum}`;
  }, [game, levelNum]);

  // Storyboard Slides Data (Level-adaptive)
  const slides = useMemo(() => getSlidesForGame(slug, levelNum), [slug, levelNum]);

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

  const handleSkip = () => {
    playSound('click');
    stop();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#060413]/90 backdrop-blur-xl p-4 overflow-hidden select-none">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="w-full max-w-2xl bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between relative shadow-2xl backdrop-blur-md min-h-[520px]"
      >
        {/* Header Controls */}
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl filter drop-shadow-[0_0_8px_rgba(34,211,238,0.4)] animate-pulse">💡</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono tracking-widest text-cyan-400 uppercase font-black">
                {game?.name || 'EXPLORATION'} · {zoneName}
              </span>
              <h2 className="font-display text-base font-extrabold text-white/95 leading-tight">
                {slides[currentSlide]?.title}
              </h2>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <button
              onClick={toggleMute}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
              title="Mute Narration"
            >
              {isMuted ? '🔇' : '🔊'}
            </button>
            <button
              onClick={handleRepeat}
              className="px-2.5 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 transition-colors"
              title="Repeat Narration"
            >
              🔁
            </button>
            <button
              onClick={handleSkip}
              className="px-3 py-1.5 rounded-full text-xs font-extrabold bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white shadow-md shadow-red-500/10 hover:scale-105 active:scale-95 transition-all"
              title="Skip Explainer"
            >
              Skip Explainer ➔
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
                  <div className="w-full max-w-md mb-6">
                    {currentSlide === 0 ? (
                      <TerrainIntroScene ageRange={ageRange} />
                    ) : game?.subject === 'english' ? (
                      <EnglishMotionScenes slug={slug} levelNum={levelNum} />
                    ) : (
                      <MathMotionScenes slug={slug} levelNum={levelNum} />
                    )}
                  </div>
                  <p className="text-white/80 font-medium text-lg leading-relaxed max-w-lg mb-6">
                    {slides[currentSlide]?.text}
                  </p>
                </div>
              ) : (
                /* Interactive Widget - Slide 3 */
                <div className="w-full flex flex-col items-center">
                  <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 shadow-inner">
                    {renderWidget(slug, levelNum, playSound)}
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

function getSlidesForGame(slug: string, levelNum: number): SlideDef[] {
  const gameNarrations: Record<string, SlideDef[]> = {
    'fruit-market': levelNum >= 7 ? [
      {
        title: 'Bigger Trades',
        text: 'Milo is trading large boxes of apples. Let\'s use a number line to hop and add multidigit numbers!',
        narration: 'Milo has larger counts of apples now! Let\'s count them quickly using place value additions.',
        visual: '🍎📏',
      },
      {
        title: 'Hop and Carry',
        text: 'Add tens first, then hop the ones. If ones total more than 10, carry it over to the tens column.',
        narration: 'To add larger numbers, hop by tens, then add the single ones. Don\'t forget to carry over if they exceed ten!',
        visual: '🐰🧮',
      },
      {
        title: 'Interactive Number Line',
        text: 'Hop by 10s and 1s on the number line. Check how the total updates as you land!',
        narration: 'Try hopping along the number line to see how place value addition behaves.',
        visual: '',
      }
    ] : levelNum >= 5 ? [
      {
        title: 'The Missing Apples',
        text: 'Milo has some apples, but he needs a total of 8. How many are missing from his basket?',
        narration: 'Milo needs a total count of apples, but some are missing! Let\'s solve for the missing group.',
        visual: '❓ Basket',
      },
      {
        title: 'Subtract to Find Addition',
        text: 'If a + ? = c, we can find the missing number by subtracting: ? = c - a.',
        narration: 'To find a missing addition value, we subtract the group we know from the final total.',
        visual: '🧺➖🍎',
      },
      {
        title: 'Fill the Blank',
        text: 'Drag apples into the basket until the equation is balanced!',
        narration: 'Drag the missing apples into the basket to complete the addition formula.',
        visual: '',
      }
    ] : [
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
    'the-picnic': levelNum >= 5 ? [
      {
        title: 'The Missing Eaten',
        text: 'Milo started with 6 sandwiches, and now has 4 left. How many did the ants take away?',
        narration: 'Milo\'s sandwiches were eaten! Let\'s figure out exactly how many the ants carried off.',
        visual: '🥪❓🐜',
      },
      {
        title: 'Solve the Subtraction',
        text: 'For a - ? = c, we find the missing subtracted part by subtracting the remainder from the start: ? = a - c.',
        narration: 'To find the subtracted amount, subtract the ending sandwiches from the starting pile.',
        visual: '🧺➖🧺',
      },
      {
        title: 'Track Eaten Food',
        text: 'Drag sandwiches out of the basket to find the matching subtrahend.',
        narration: 'Drag sandwiches out to match the equation subtraction value.',
        visual: '',
      }
    ] : [
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
    'toy-factory': [
      {
        title: 'Toy Shipments',
        text: 'Milo is packing toys in boxes. Instead of counting individually, he packs them in equal groups.',
        narration: 'Milo is sorting toys! Let\'s learn how multiplication groups toys together quickly.',
        visual: '🧸📦',
      },
      {
        title: 'Repeated Addition',
        text: 'Multiplication is adding the same number repeatedly. 3 groups of 4 toys is: 4 + 4 + 4 = 12.',
        narration: 'Multiplication is shorthand for repeated addition. Adding four, three times, gives twelve.',
        visual: '➕🧸✖️',
      },
      {
        title: 'Grid Alignment',
        text: 'Change the columns and rows to arrange toys into a grid. Count the total layout!',
        narration: 'Slide the grid rows and columns to multiply toys and see the dimensions arrange.',
        visual: '',
      }
    ],
    'pizza-party': levelNum >= 5 ? [
      {
        title: 'Comparing Slices',
        text: 'Milo wants to know if 2/4 of a pizza is bigger than 1/2 of a pizza. Let\'s compare fraction sizes!',
        narration: 'Let\'s compare different fractions! Some slices look different but represent the same amount.',
        visual: '🍕⚖️🍕',
      },
      {
        title: 'Equal Shares',
        text: 'Fractions are equivalent if they cover the exact same portion of the circle, even with more cuts.',
        narration: 'Equivalent fractions cover the same area. Cutting a pizza into four and eating two is same as eating one half.',
        visual: '📏🍕📏',
      },
      {
        title: 'Interactive Comparison',
        text: 'Slide to compare the red and blue pizza slices. Check if their areas match!',
        narration: 'Change both sliders to compare fraction circles side by side.',
        visual: '',
      }
    ] : [
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
    'word-safari': [
      {
        title: 'Jungle Letters',
        text: 'Milo is exploring the safari, but words are hidden in the vines! Let\'s swing letters to spell them.',
        narration: 'Welcome to Word Safari! Let\'s find and sort letters to spell names of animals.',
        visual: '🦁🌳🔤',
      },
      {
        title: 'Spelling Order',
        text: 'Spelling links letter sounds to form words. Tap letters in chronological order to build spelling chains.',
        narration: 'Connect letters in order from left to right to spell the safari word.',
        visual: '🦒🔤🦁',
      },
      {
        title: 'Swing & Drop',
        text: 'Click on the hanging letters on the vines to drop them in the correct sequence!',
        narration: 'Click the swinging letter vines in the correct order to spell the word.',
        visual: '',
      }
    ],
    'story-builder': [
      {
        title: 'Building Sentences',
        text: 'Milo has a notebook of drawings, but the stories need text! Let\'s snap word blocks together.',
        narration: 'Let\'s write stories with Milo! Connect words to describe the action.',
        visual: '📖✍️',
      },
      {
        title: 'Word Order Rules',
        text: 'Sentences follow structure: Subject (who) + Verb (does what) + Object (to whom). Capital letters start, periods end.',
        narration: 'A complete sentence starts with a capital letter, places a verb after the noun, and ends with punctuation.',
        visual: '🔤🔗',
      },
      {
        title: 'Card Builder',
        text: 'Click the word cards in the correct sequence to build a sentence and watch the notebook animate!',
        narration: 'Connect the word cards in order. Watch the train connect and pass.',
        visual: '',
      }
    ],
    'equation-quest': levelNum >= 11 ? [
      {
        title: 'Double Variable Scales',
        text: 'Now, Milo faces variables x on BOTH sides of the balance scale! We must collect them together.',
        narration: 'Variables are on both sides of the scale now! Let\'s move them to one side to solve.',
        visual: '⚖️📦📦',
      },
      {
        title: 'Gathering x Terms',
        text: 'Subtract the smaller x term from both sides. This gathers all variables on one side, keeping balance.',
        narration: 'Subtract x terms from both sides to gather all variables on a single pan, then isolate.',
        visual: '⚖️🧮📦',
      },
      {
        title: 'Solve the Dual Scale',
        text: 'Click the buttons to add or subtract variable boxes from both sides until isolated!',
        narration: 'Balance the variables and solve the two-sided equation.',
        visual: '',
      }
    ] : [
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
    'shape-shift': levelNum >= 11 ? [
      {
        title: 'Interior Sweeps',
        text: 'Milo is measuring a triangular portal key. How do the interior angles relate?',
        narration: 'Let\'s look inside shapes! The angles inside a triangle follow a constant sum rule.',
        visual: '📐🔺',
      },
      {
        title: '180 Degrees Rule',
        text: 'The three interior angles of any triangle always add up to exactly 180°, no matter the shape.',
        narration: 'No matter how you stretch a triangle, its three interior angles always sum to exactly one hundred and eighty degrees.',
        visual: '📐📏💯',
      },
      {
        title: 'Interactive Angle Sweep',
        text: 'Drag the corner vertices to morph the triangle. Observe how the sum of angles remains exactly 180°!',
        narration: 'Shift the corners and watch the angles update while their sum stays constant.',
        visual: '',
      }
    ] : levelNum >= 6 ? [
      {
        title: 'Triangle Splits',
        text: 'Milo needs to find the area of a triangular stone block. How does it relate to a rectangle?',
        narration: 'Let\'s calculate triangle areas! We can think of a triangle as half of a rectangle.',
        visual: '📐🔺📂',
      },
      {
        title: 'Half of Base × Height',
        text: 'Area of Triangle = 0.5 × Base × Height. It is exactly half of the surrounding bounding box.',
        narration: 'A triangle fits exactly twice inside a rectangle of same base and height. So, its area is half base times height.',
        visual: '📐📊🧮',
      },
      {
        title: 'Toggle Bounding Box',
        text: 'Click the button to toggle the bounding rectangle and see how the triangle represents exactly 50% of its area.',
        narration: 'Observe the bounding box to see why the triangle area formula divides by two.',
        visual: '',
      }
    ] : [
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
    'ratio-rally': levelNum >= 11 ? [
      {
        title: 'Unit Cost Engines',
        text: 'Milo is buying supplies. Which deal gives the best value? We need unit rates!',
        narration: 'Let\'s find the best deals! We will divide total costs by quantity to compare items.',
        visual: '🏎️💰',
      },
      {
        title: 'Price Per Item',
        text: 'Unit Rate = Total Price / Total Quantity. The lower unit rate is the better bargain.',
        narration: 'Unit rate is cost per single item. Divide total price by item count to compare values.',
        visual: '⚖️💰🛒',
      },
      {
        title: 'Interactive Pricing',
        text: 'Slide items and price dials. Watch the unit price scale update dynamically!',
        narration: 'Slide quantity and cost to see the unit rate bars shift.',
        visual: '',
      }
    ] : [
      {
        title: 'Proportional Speed',
        text: 'Milo is driving a race car! To keep pace with the pace car, he must maintain a constant speed ratio.',
        narration: 'Welcome to Ratio Rally! Let\'s drive cars at matching speed ratios.',
        visual: '🏎️🏁',
      },
      {
        title: 'Equivalent Proportions',
        text: 'A ratio comparisons two amounts. 2:3 means for every 2 steps Car A takes, Car B takes 3 steps.',
        narration: 'Ratios scale proportions. A speed ratio of two to three means Car B goes one point five times faster than Car A.',
        visual: '🏎️🏎️📈',
      },
      {
        title: 'Match the Speeds',
        text: 'Adjust the throttle slider to set proportional speeds. Watch both cars race along the track!',
        narration: 'Slide the throttle to match the cars speeds and cross the line together.',
        visual: '',
      }
    ],
    'data-detective': [
      {
        title: 'Central Tendencies',
        text: 'Milo is analyzing data clues. To summarize them, he needs the Mean, Median, and Mode.',
        narration: 'Let\'s analyze datasets with Milo! We will calculate averages and find middle values.',
        visual: '🔍📊',
      },
      {
        title: 'Average and Frequencies',
        text: 'Mean is the balanced sum. Median is the middle of sorted numbers. Mode is the most common value.',
        narration: 'Mean balances weights. Median sorts and splits. Mode represents the value that appears most often.',
        visual: '📈🧮🔍',
      },
      {
        title: 'Balance the Bars',
        text: 'Drag the data heights. Click Mean, Median, or Mode to see how these statistics align visually!',
        narration: 'Adjust the bars and toggle average views to see how mean and median differ.',
        visual: '',
      }
    ],
    'grammar-galaxy': [
      {
        title: 'Grammar Space Lanes',
        text: 'Milo is piloting his spaceship through word clouds! Help him categorize parts of speech.',
        narration: 'Welcome to Grammar Galaxy! Let\'s classify words in orbital flights.',
        visual: '🚀🔤',
      },
      {
        title: 'Noun, Verb, Adjective',
        text: 'Nouns are orbits of places/things, Verbs are engines of actions, and Adjectives describe them.',
        narration: 'Identify noun objects, action verbs, and descriptive adjectives to navigate.',
        visual: '🚀☄️🛸',
      },
      {
        title: 'Steer the Ship',
        text: 'Click the orbital flight paths to steer the ship and capture highlighted target words into correct grammar sectors!',
        narration: 'Steer the spaceship to dock the target word in its correct part of speech category.',
        visual: '',
      }
    ],
    'vocab-vault': [
      {
        title: 'Root Words Lock',
        text: 'Milo found a secret vault filled with vocabulary treasure! We must crack the word root combination.',
        narration: 'Let\'s unlock the vocab vault by assembling roots and prefixes.',
        visual: '🏦🗝️',
      },
      {
        title: 'Roots and Prefixes',
        text: 'Latin and Greek roots form word cores (bio = life, anti = against). Combine them to decode complex meanings.',
        narration: 'Prefixes modify the front, roots hold the core meaning, and suffixes sit at the end.',
        visual: '🏦🔓🔤',
      },
      {
        title: 'Spin the Tumblers',
        text: 'Rotate the safe combination locks to align root word pieces and open the vault!',
        narration: 'Spin the combination dials to assemble the target root word.',
        visual: '',
      }
    ],
    'function-forge': levelNum >= 8 ? [
      {
        title: 'Forging Parabolas',
        text: 'Milo is designing a skateboarding half-pipe! This time, he needs a curved quadratic function.',
        narration: 'Let\'s forge a half-pipe! We will design curves using quadratic equations.',
        visual: '🛹〽️',
      },
      {
        title: 'Quadratic Curves',
        text: 'In y = ax² + bx + c, the coefficient a controls curve width/direction, and c sets the lowest vertex height.',
        narration: 'A quadratic equation makes a parabola. The squared term curves the line, creating a peak or valley.',
        visual: '⚒️📈',
      },
      {
        title: 'Curve the Pipe',
        text: 'Drag the sliders for coefficients a and c. See how the curved ramp responds instantly!',
        narration: 'Adjust the curve coefficients to forge a smooth skateboarding half-pipe.',
        visual: '',
      }
    ] : [
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
    'proof-quest': [
      {
        title: 'Logic Circuits',
        text: 'Milo is navigating a dungeon gate powered by logic. Let\'s wire the AND and OR gates!',
        narration: 'Help Milo power the logic gate conduit by setting input switches.',
        visual: '🗝️⚡',
      },
      {
        title: 'Boolean Operators',
        text: 'AND gates output true only if BOTH inputs are true. OR gates output true if AT LEAST ONE input is true.',
        narration: 'Logic switches turn signals on or off. Truth operators combine paths to open logic gates.',
        visual: '⚡🔌🔋',
      },
      {
        title: 'Power the Gate',
        text: 'Toggle the logic switches A and B. Watch the electrical signal flow through the gates to open the locks!',
        narration: 'Toggle the input switches to guide current through the logic gates and power the output.',
        visual: '',
      }
    ],
    'probability-pinball': levelNum >= 8 ? [
      {
        title: 'Sequential Splits',
        text: 'Milo is dropping balls through successive paths. What is the probability of a compound event?',
        narration: 'Let\'s look at compound events! We will multiply probabilities along path splits.',
        visual: '🎰🛣️',
      },
      {
        title: 'Multiplying Paths',
        text: 'For independent successive events, compound probability P(A and B) = P(A) × P(B). Each split divides chances.',
        narration: 'To find the probability of successive events, multiply the odds of each branch together.',
        visual: '🎲🎲📈',
      },
      {
        title: 'Interactive Paths',
        text: 'Click the path splits to watch ball counts multiply down the branches in real-time.',
        narration: 'Click the splits to see how probabilities multiply along consecutive branches.',
        visual: '',
      }
    ] : [
      {
        title: 'Peg Board Drops',
        text: 'Milo is playing a pinball game! Balls bounce left or right off pegs to land in bottom bins.',
        narration: 'Welcome to Probability Pinball! Let\'s watch how pinballs distribute randomly.',
        visual: '🎰🎈',
      },
      {
        title: 'Chances and Distributions',
        text: 'At each peg, the ball has a 50% chance to go left or right. Over many drops, they form a bell shape.',
        narration: 'Each bounce has equal odds. Dropping many balls reveals a pattern, with the center bins being most likely.',
        visual: '📊🎰🎲',
      },
      {
        title: 'Drop the Balls',
        text: 'Click "Drop Ball" to launch pinballs down the peg board. Watch the bin heights form a probability curve!',
        narration: 'Drop pinballs down the pegs. See how they stack up in the center bins, tracing a distribution.',
        visual: '',
      },
    ],
    'coordinate-clash': levelNum >= 8 ? [
      {
        title: 'Rise Over Run',
        text: 'Milo is scaling a coordinate hill. How steep is the path? Let\'s calculate slope!',
        narration: 'Let\'s climb coordinates! We will find path steepness by measuring slope.',
        visual: '📍📈',
      },
      {
        title: 'Slope Formula',
        text: 'Slope m = Change in y / Change in x = (y2 - y1) / (x2 - x1). Positive goes up, negative goes down.',
        narration: 'Slope is rise over run. Calculate the vertical change, then divide it by the horizontal distance.',
        visual: '📐📈📏',
      },
      {
        title: 'Interactive Slope Line',
        text: 'Drag the coordinate endpoints and watch the rise, run, and slope value recalculate instantly!',
        narration: 'Move the points to see how rise and run determine the slope value.',
        visual: '',
      }
    ] : [
      {
        title: 'Coordinate Grid Radar',
        text: 'Milo is scanning coordinates for target points. Let\'s draw paths between points!',
        narration: 'Welcome to Coordinate Clash! Let\'s measure distances on a coordinate grid.',
        visual: '📍📡',
      },
      {
        title: 'The Pythagorean Distance',
        text: 'To find the direct distance, draw horizontal (dx) and vertical (dy) lines to make a right triangle. Distance = √(dx² + dy²).',
        narration: 'Direct distance is the hypotenuse. Square the change in x and the change in y, add them, then take the square root.',
        visual: '📐📍📏',
      },
      {
        title: 'Radar Sweep',
        text: 'Click two coordinates on the grid. Watch the dx and dy path draw, computing distance!',
        narration: 'Click two points. Watch the radar draw a right triangle and calculate the straight-line distance.',
        visual: '',
      },
    ],
    'essay-engine': [
      {
        title: 'Writing Assembly Line',
        text: 'Milo is editing an essay. Let\'s align paragraph segments so ideas flow logically.',
        narration: 'Welcome to Essay Engine! Let\'s assemble a structured argument.',
        visual: '✍️⚙️',
      },
      {
        title: 'Flow and Coherence',
        text: 'Essays start with a Hook, declare a Thesis statement, back it up with Evidence, and Restate it in the conclusion.',
        narration: 'Organize paragraphs in sequence: begin with a thesis, back it with evidence, and close with a summary.',
        visual: '✍️📂📄',
      },
      {
        title: 'Assemble the Gears',
        text: 'Drag and snap the Hook, Thesis, and Evidence gears onto the conveyor belt to turn the engine wheels!',
        narration: 'Fit the essay gears in order to power the conveyor belt and complete the document.',
        visual: '',
      }
    ],
    'rhetoric-arena': [
      {
        title: ' courtroom Debates',
        text: 'Milo is speaking in the forum. Help him balance his persuasive appeals to win the argument.',
        narration: 'Welcome to Rhetoric Arena! Let\'s analyze persuasive appeals.',
        visual: '🏟️🗣️',
      },
      {
        title: 'Ethos, Pathos, Logos',
        text: 'Ethos builds trust and authority. Pathos connects with emotions and values. Logos relies on logic and evidence.',
        narration: 'Ethos uses credibility, pathos targets feelings, and logos appeals to reason and logic.',
        visual: '⚖️🗣️📈',
      },
      {
        title: 'Charge the Appeal Gauges',
        text: 'Identify the rhetorical appeals. Watch the Ethos, Pathos, or Logos gauges fill up dynamically!',
        narration: 'Click the rhetoric categories to charge up Milo\'s persuasion gauges.',
        visual: '',
      }
    ],
    'trig-tower': levelNum >= 11 ? [
      {
        title: 'Radian Arcs',
        text: 'Milo is measuring rotation in radians! How does the arc length relate to the radius?',
        narration: 'Let\'s learn radians! We will measure angles by matching the arc length to the radius.',
        visual: '🗼📐',
      },
      {
        title: 'Angles in Radians',
        text: 'A full circle is 2π radians (360°). One radian occurs when arc length equals the circle\'s radius.',
        narration: 'Radians measure rotation. A half-circle rotation corresponds to exactly pi radians.',
        visual: '🎡📐📏',
      },
      {
        title: 'Trace the Arc',
        text: 'Drag the slider to sweep radians around the circle. Watch the arc length match multiples of π!',
        narration: 'Drag the slider to rotate in radians and trace arc segments.',
        visual: '',
      }
    ] : [
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
    'matrix-maze': levelNum >= 6 ? [
      {
        title: 'Matrix Vectors',
        text: 'Milo is multiplying matrices! Let\'s compute dot products of rows and columns.',
        narration: 'Let\'s multiply matrices! We will calculate dot products of rows and columns.',
        visual: '🧩🧮',
      },
      {
        title: 'Row × Column Dot Product',
        text: 'Multiply corresponding elements of a row in Matrix A by a column in Matrix B, then sum them.',
        narration: 'To multiply, sweep rows of the first matrix across columns of the second and add the products.',
        visual: '🧩📐📏',
      },
      {
        title: 'Sweep the Vectors',
        text: 'Click the row and column highlights to watch them multiply step-by-step and calculate the output!',
        narration: 'Run the sweep animation to watch how row and column dot products compute matrix outputs.',
        visual: '',
      }
    ] : [
      {
        title: 'Grid Transformations',
        text: 'Milo is wrapping the space grid using matrices! Watch how the unit squares stretch and shear.',
        narration: 'Welcome to Matrix Maze! Let\'s warp space using 2D matrix transformations.',
        visual: '🧩📐',
      },
      {
        title: 'Linear Transforms & Area',
        text: 'A 2D matrix maps basis vectors i (1,0) and j (0,1). The determinant (ad - bc) is the area scaling factor of the grid.',
        narration: 'Matrices transform coordinates. The determinant measures how much the transformed grid area scales.',
        visual: '📐🧩📈',
      },
      {
        title: 'Shear and Scale',
        text: 'Drag the basis vector coordinates. Watch the grid shear and the area determinant scale in real-time!',
        narration: 'Drag the handles to warp the space grid. Notice how area scale equals the determinant value.',
        visual: '',
      },
    ],
    'limit-launcher': levelNum >= 11 ? [
      {
        title: 'Function Slopes',
        text: 'Milo wants to find the exact slope of the curve at a single point. We need derivatives!',
        narration: 'Let\'s calculate slopes on curves! We will take the limit of secant lines to find the derivative.',
        visual: '🚀📉',
      },
      {
        title: 'The Derivative Limit',
        text: 'Derivative is the limit of average slope [f(x+h)-f(x)]/h as interval width h approaches 0, creating a tangent.',
        narration: 'The derivative is the instantaneous rate of change. It is the slope of the line tangent to the curve at a point.',
        visual: '📐📈📉',
      },
      {
        title: 'Interactive Tangent',
        text: 'Drag the interval slider to bring two points together. Watch the secant line morph into a tangent line!',
        narration: 'Bring the points close. Watch the slope value converge to the derivative value.',
        visual: '',
      }
    ] : [
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
    'stats-showdown': [
      {
        title: 'The Normal Distribution',
        text: 'Milo is analyzing standardized test scores. Let\'s map them onto a normal bell curve.',
        narration: 'Welcome to Stats Showdown! Let\'s explore distributions and Z-scores.',
        visual: '📊📈',
      },
      {
        title: 'Z-Scores and Deviations',
        text: 'Z = (X - μ) / σ. Standardizing measures how many standard deviations a score lies from the mean.',
        narration: 'A Z-score measures deviations from average. The normal curve shows the proportion of scores in ranges.',
        visual: '📈📊⚖️',
      },
      {
        title: 'Shade the Bell Curve',
        text: 'Slide the Z-score value and watch the percentile area under the bell curve shade dynamically!',
        narration: 'Adjust the Z-score handle. Observe the shaded area represent the probability density percentage.',
        visual: '',
      }
    ],
    'calculus-cascade': levelNum >= 13 ? [
      {
        title: 'Infinite series Convergence',
        text: 'Milo is adding infinitely many smaller numbers together. Does the sum add up to a finite total?',
        narration: 'Let\'s add infinite terms! We will test if infinite series converge to finite limits.',
        visual: '🌊♾️',
      },
      {
        title: 'Infinite Sums and decay',
        text: 'A series converges if the sum approaches a limit as terms get infinitely small (e.g. geometric decay).',
        narration: 'Adding halves of a square repeatedly fills the square but never exceeds it. This series converges.',
        visual: '📐♾️🧮',
      },
      {
        title: 'Sum the Decay Grid',
        text: 'Drag the iteration slider to add term boxes. Watch the cumulative sum approach the convergence limit!',
        narration: 'Observe the boxes stack up. Watch the cumulative sum converge toward a finite value.',
        visual: '',
      }
    ] : [
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
    'proof-architect': levelNum >= 6 ? [
      {
        title: 'Inductive Dominoes',
        text: 'Milo wants to prove a claim for all integers. Let\'s set up mathematical induction!',
        narration: 'Let\'s build induction proofs! We will trigger a logical chain reaction.',
        visual: '🏛️🧾',
      },
      {
        title: 'Base Case + Inductive Step',
        text: 'Prove base case P(1). Show if P(k) is true, then P(k+1) is true. Like pushing the first domino to tip them all.',
        narration: 'Induction needs a base case and an inductive link. Tipping the first domino guarantees all of them fall.',
        visual: '🧾🔗⏳',
      },
      {
        title: 'Tip the Dominoes',
        text: 'Click the first domino. Watch the induction step push the subsequent dominoes in an infinite cascade!',
        narration: 'Click to push. Watch how the inductive step cascades through all integers.',
        visual: '',
      }
    ] : [
      {
        title: 'Direct Proof Roads',
        text: 'Milo is building formal proofs. Let\'s map logical paths from premises to conclusions.',
        narration: 'Welcome to Proof Architect! Let\'s construct valid mathematical proofs.',
        visual: '🏛️🖋️',
      },
      {
        title: 'Direct vs Contrapositive',
        text: 'Direct proof goes A ➔ B. Contrapositive proof shows ¬B ➔ ¬A, which is logically equivalent.',
        narration: 'Direct proof links statements forward. Contrapositive assumes the negation and reasons backward.',
        visual: '🖋️📜⚖️',
      },
      {
        title: 'Map the Proof Path',
        text: 'Select the proof method. Watch the logic links light up the path from start to goal!',
        narration: 'Click the proof paths to trace direct and contrapositive logical chains.',
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
    'diff-eq-duel': [
      {
        title: 'Spring Oscillations',
        text: 'Milo is analyzing a mass vibrating on a spring. How does friction and stiffness shape the movement over time?',
        narration: 'Welcome to Diff-Eq Duel! Let\'s solve differential equations of spring movement.',
        visual: '⚔️🌀',
      },
      {
        title: 'Homogeneous Vibrations',
        text: 'Stiffness (frequency) curves the path into sine waves. Damping (friction) decays the wave amplitude over time.',
        narration: 'A differential equation models rate change. Changing spring damping decays the oscillation wave.',
        visual: '📈🌀⚔️',
      },
      {
        title: 'Interactive Spring',
        text: 'Drag the damping and stiffness sliders. Watch the spring bounce and plot the displacement curve!',
        narration: 'Adjust damping and stiffness. Watch the spring oscillate and graph its decay wave.',
        visual: '',
      }
    ],
    'thesis-forge': [
      {
        title: 'Blacksmith Citations',
        text: 'Milo is forging an academic bibliography! Help him hammer citation components in style.',
        narration: 'Welcome to Thesis Forge! Let\'s assemble formatted bibliography citations.',
        visual: '🔨📖',
      },
      {
        title: 'APA vs MLA Styles',
        text: 'APA citation highlights dates: (Author, Year). MLA citation focuses on pages: (Author Page).',
        narration: 'Academic publication requires strict styling. APA groups authors and dates, MLA lists page locations.',
        visual: '🔨📜📚',
      },
      {
        title: 'Hammer the citation',
        text: 'Click the citation component blocks in the correct style sequence to spark the anvil and forge the plate!',
        narration: 'Click the citation components in correct order to forge the bibliography entry.',
        visual: '',
      }
    ],
    'critical-lens': [
      {
        title: 'Sociological Viewfinders',
        text: 'Milo is reviewing literature. Let\'s rotate critical lens filters to reveal power structures in text.',
        narration: 'Welcome to Critical Lens! Let\'s analyze passages from sociological perspectives.',
        visual: '🔎📚',
      },
      {
        title: 'Marxist, Feminist, Deconstruct',
        text: 'Marxist highlights wealth inequality. Feminist reveals gender power. Deconstruction exposes language contradictions.',
        narration: 'Lenses focus analysis. Marxist maps class conflict, feminist critiques gender, deconstruction locates paradoxes.',
        visual: '🔎🎭📜',
      },
      {
        title: 'Rotate the Camera Dial',
        text: 'Click the lens selector buttons to shift text highlighting styles dynamically!',
        narration: 'Select critical lenses to highlight class, gender, or contradictions in the passage.',
        visual: '',
      }
    ],
  };

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
function renderWidget(slug: string, levelNum: number, playSound: (type: any) => void) {
  // Return matching React sub-components
  switch (slug) {
    case 'fruit-market':
    case 'the-picnic':
      return <FruitBasketWidget slug={slug} levelNum={levelNum} playSound={playSound} />;
    case 'toy-factory':
      return <ToyFactoryWidget playSound={playSound} />;
    case 'pizza-party':
      return <PizzaSlicerWidget levelNum={levelNum} playSound={playSound} />;
    case 'word-safari':
      return <WordSafariWidget playSound={playSound} />;
    case 'story-builder':
      return <StoryBuilderWidget playSound={playSound} />;
    case 'equation-quest':
      return <BalanceScaleWidget levelNum={levelNum} playSound={playSound} />;
    case 'shape-shift':
      return <TransformationsGridWidget levelNum={levelNum} playSound={playSound} />;
    case 'ratio-rally':
      return <RatioRallyWidget levelNum={levelNum} playSound={playSound} />;
    case 'data-detective':
      return <DataDetectiveWidget playSound={playSound} />;
    case 'grammar-galaxy':
      return <GrammarGalaxyWidget playSound={playSound} />;
    case 'vocab-vault':
      return <VocabVaultWidget playSound={playSound} />;
    case 'function-forge':
      return <MountainRampWidget levelNum={levelNum} playSound={playSound} />;
    case 'proof-quest':
      return <ProofQuestWidget playSound={playSound} />;
    case 'probability-pinball':
      return <ProbabilityPinballWidget levelNum={levelNum} playSound={playSound} />;
    case 'coordinate-clash':
      return <CoordinateClashWidget levelNum={levelNum} playSound={playSound} />;
    case 'essay-engine':
      return <EssayEngineWidget playSound={playSound} />;
    case 'rhetoric-arena':
      return <RhetoricArenaWidget playSound={playSound} />;
    case 'trig-tower':
      return <FerrisWheelWidget levelNum={levelNum} playSound={playSound} />;
    case 'matrix-maze':
      return <MatrixMazeWidget levelNum={levelNum} playSound={playSound} />;
    case 'limit-launcher':
      return <MagnifyingGlassWidget levelNum={levelNum} playSound={playSound} />;
    case 'stats-showdown':
      return <StatsShowdownWidget playSound={playSound} />;
    case 'calculus-cascade':
      return <VaseFillerWidget levelNum={levelNum} playSound={playSound} />;
    case 'proof-architect':
      return <ProofArchitectWidget levelNum={levelNum} playSound={playSound} />;
    case 'abstract-arena':
      return <RotatingTriangleWidget playSound={playSound} />;
    case 'diff-eq-duel':
      return <SpringOscillatorWidget playSound={playSound} />;
    case 'thesis-forge':
      return <ThesisForgeWidget playSound={playSound} />;
    case 'critical-lens':
      return <CriticalLensWidget playSound={playSound} />;
    default:
      return <SentenceTrainWidget playSound={playSound} />;
  }
}

/* 1. Fruit Basket Widget (Addition / Subtraction / Missing Number) */
function FruitBasketWidget({ slug, levelNum, playSound }: { slug: string; levelNum: number; playSound: any }) {
  const isSub = slug === 'the-picnic';
  const [count, setCount] = useState(isSub ? 5 : 3);
  const [apples, setApples] = useState<number[]>(isSub ? [1,2,3,4,5] : [1, 2, 3]);

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
        <button onClick={addApple} className="px-3 py-1 bg-green-500 rounded-full text-[10px] font-bold text-white hover:bg-green-600 transition-colors">➕ Add</button>
        <button onClick={removeApple} className="px-3 py-1 bg-red-500 rounded-full text-[10px] font-bold text-white hover:bg-red-600 transition-colors">➖ Remove</button>
      </div>
      <div className="w-full h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center relative select-none">
        <div className="flex flex-wrap justify-center gap-1 max-w-[220px] z-10">
          {apples.map((id) => (
            <motion.span key={id} layout initial={{ scale: 0, y: -20 }} animate={{ scale: 1, y: 0 }} className="text-xl">
              {isSub ? '🥪' : '🍎'}
            </motion.span>
          ))}
        </div>
        <div className="absolute bottom-1 right-2 bg-black/40 px-2 py-0.5 rounded text-[10px] font-bold text-white z-20">
          Count: {count}
        </div>
      </div>
    </div>
  );
}

/* 2. Toy Factory Widget (Multiplication Grid) */
function ToyFactoryWidget({ playSound }: { playSound: any }) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(4);

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-4 mb-2 w-full max-w-[280px]">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-white/50 mb-0.5">Rows (a): {rows}</span>
          <input
            type="range" min="1" max="4" value={rows}
            onChange={(e) => { playSound('click'); setRows(parseInt(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-400"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-white/50 mb-0.5">Cols (b): {cols}</span>
          <input
            type="range" min="1" max="5" value={cols}
            onChange={(e) => { playSound('click'); setCols(parseInt(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-400"
          />
        </div>
      </div>
      <div className="w-full h-20 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center p-2 relative">
        <div className="grid gap-1.5" style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))`, gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          {Array.from({ length: rows * cols }).map((_, idx) => (
            <motion.span key={idx} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-lg">🧸</motion.span>
          ))}
        </div>
        <div className="absolute bottom-1 right-2 bg-black/40 px-1.5 py-0.5 rounded text-[9px] font-bold text-green-300">
          {rows} × {cols} = {rows * cols}
        </div>
      </div>
    </div>
  );
}

/* 3. Pizza Slicer Widget (Fractions / Equivalency) */
function PizzaSlicerWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [num, setNum] = useState(2);
  const [den, setDen] = useState(4);
  const [num2, setNum2] = useState(1);
  const [den2, setDen2] = useState(2);

  const isCompare = levelNum >= 5;

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-4 mb-2.5 w-full max-w-[280px]">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-white/50 mb-0.5">Numerator: {num}</span>
          <input
            type="range" min="1" max={den} value={num}
            onChange={(e) => { playSound('click'); setNum(parseInt(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-white/50 mb-0.5">Denominator: {den}</span>
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

      <div className="flex gap-4 items-center justify-center">
        {/* Pizza 1 */}
        <div className="relative w-16 h-16 rounded-full border border-white/20 bg-white/5 overflow-hidden flex items-center justify-center">
          <svg className="w-full h-full rotate-[-90deg]">
            {Array.from({ length: den }).map((_, i) => {
              const angle = 360 / den;
              const startAngle = i * angle;
              const isFilled = i < num;
              const x1 = 32 + 32 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 32 + 32 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 32 + 32 * Math.cos(((startAngle + angle) * Math.PI) / 180);
              const y2 = 32 + 32 * Math.sin(((startAngle + angle) * Math.PI) / 180);
              return (
                <path
                  key={i}
                  d={`M 32 32 L ${x1} ${y1} A 32 32 0 0 1 ${x2} ${y2} Z`}
                  fill={isFilled ? 'rgba(239, 68, 68, 0.7)' : 'transparent'}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth="0.8"
                />
              );
            })}
          </svg>
          <span className="absolute text-[9px] bg-black/60 px-1 py-0.2 rounded font-extrabold text-white">
            {num}/{den}
          </span>
        </div>

        {/* Pizza 2 (only for comparison levels) */}
        {isCompare && (
          <>
            <span className="text-white/40 font-bold text-xs">vs</span>
            <div className="flex flex-col items-center">
              <input
                type="range" min="1" max={den2} value={num2}
                onChange={(e) => { playSound('click'); setNum2(parseInt(e.target.value)); }}
                className="w-16 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400 mb-1"
              />
              <div className="relative w-16 h-16 rounded-full border border-white/20 bg-white/5 overflow-hidden flex items-center justify-center">
                <svg className="w-full h-full rotate-[-90deg]">
                  {Array.from({ length: den2 }).map((_, i) => {
                    const angle = 360 / den2;
                    const startAngle = i * angle;
                    const isFilled = i < num2;
                    const x1 = 32 + 32 * Math.cos((startAngle * Math.PI) / 180);
                    const y1 = 32 + 32 * Math.sin((startAngle * Math.PI) / 180);
                    const x2 = 32 + 32 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                    const y2 = 32 + 32 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                    return (
                      <path
                        key={i}
                        d={`M 32 32 L ${x1} ${y1} A 32 32 0 0 1 ${x2} ${y2} Z`}
                        fill={isFilled ? 'rgba(16, 185, 129, 0.7)' : 'transparent'}
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="0.8"
                      />
                    );
                  })}
                </svg>
                <span className="absolute text-[9px] bg-black/60 px-1 py-0.2 rounded font-extrabold text-white">
                  {num2}/{den2}
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* 4. Word Safari Widget (Swinging Vine Letters) */
function WordSafariWidget({ playSound }: { playSound: any }) {
  const letters = ['C', 'A', 'T'];
  const [clicked, setClicked] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const handleLetter = (l: string) => {
    if (solved) return;
    playSound('click');
    const newClicked = [...clicked, l];
    setClicked(newClicked);
    
    // Check if spelling in correct order
    const targetWord = letters.slice(0, newClicked.length).join('');
    if (newClicked.join('') !== targetWord) {
      // wrong order, reset
      playSound('error');
      setClicked([]);
    } else if (newClicked.length === letters.length) {
      setSolved(true);
      playSound('success');
    }
  };

  return (
    <div className="flex flex-col items-center p-2 w-full">
      <div className="flex justify-center gap-6 mb-3 relative h-16 w-full max-w-[200px] border-b border-dashed border-white/15">
        {letters.map((l, i) => {
          const isClicked = clicked.includes(l);
          return (
            <motion.div
              key={i}
              onClick={() => handleLetter(l)}
              animate={isClicked ? { y: 35, rotate: 0 } : { rotate: [10, -10, 10] }}
              transition={isClicked ? { duration: 0.4 } : { repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              className={`w-9 h-9 rounded-full bg-green-500/20 border border-green-500/40 text-green-300 font-extrabold flex items-center justify-center cursor-pointer shadow-md select-none hover:scale-105 active:scale-95`}
            >
              {l}
            </motion.div>
          );
        })}
      </div>
      <div className="h-8 flex gap-2 items-center justify-center font-bold text-sm text-white bg-black/35 px-4 rounded-xl">
        <span>Spelling: </span>
        <span className="tracking-widest text-green-400 font-mono text-base">{clicked.join('') || '____'}</span>
        {solved && <span className="text-xs text-green-300 ml-1">🐱 Solved!</span>}
      </div>
    </div>
  );
}

/* 5. Story Builder Widget (Snap Word Cards) */
function StoryBuilderWidget({ playSound }: { playSound: any }) {
  const cards = ['The', 'fox', 'runs.'];
  const [assembled, setAssembled] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const selectCard = (card: string) => {
    if (solved || assembled.includes(card)) return;
    playSound('click');
    const newAssembled = [...assembled, card];
    setAssembled(newAssembled);

    // Verify correct order
    const nextIdx = newAssembled.length - 1;
    if (newAssembled[nextIdx] !== cards[nextIdx]) {
      playSound('error');
      setAssembled([]);
    } else if (newAssembled.length === cards.length) {
      setSolved(true);
      playSound('success');
    }
  };

  return (
    <div className="flex flex-col items-center p-2 w-full">
      <div className="flex gap-2.5 mb-3">
        {cards.map((card, i) => {
          const isTaken = assembled.includes(card);
          return (
            <motion.button
              key={i}
              onClick={() => selectCard(card)}
              disabled={isTaken}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`px-3 py-1.5 rounded-lg font-bold text-xs shadow-md border transition-all ${
                isTaken ? 'bg-purple-950/20 border-white/5 text-white/30' : 'bg-purple-500/10 border-purple-500/30 text-purple-300 hover:bg-purple-500/20'
              }`}
            >
              {card}
            </motion.button>
          );
        })}
      </div>
      <div className="w-full max-w-[260px] h-11 border border-dashed border-white/15 rounded-xl bg-black/20 flex items-center justify-center gap-1.5 font-bold text-xs text-white">
        {assembled.map((c, i) => (
          <motion.span key={i} layout initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-purple-300">
            {c}
          </motion.span>
        ))}
        {assembled.length === 0 && <span className="text-white/40 italic">Click cards in correct order...</span>}
        {solved && <span className="text-green-400 ml-1">📖 Animate!</span>}
      </div>
    </div>
  );
}

/* 6. Balance Scale Widget (Algebra Equation Quest) */
function BalanceScaleWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const isDual = levelNum >= 11;
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
        className="px-3 py-1 bg-cyan-500 disabled:opacity-40 rounded-full text-[10px] font-bold text-white hover:bg-cyan-600 transition-all mb-3"
      >
        ⚖️ Remove 1 weight from BOTH sides
      </button>

      <div className="w-full max-w-xs h-24 relative flex items-center justify-between border-b border-white/20 pb-2">
        {/* Left Pan */}
        <motion.div
          animate={{ y: leftWeights === rightWeights - 4 ? 0 : leftWeights > rightWeights - 4 ? 8 : -8 }}
          className="w-24 h-12 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center p-0.5 text-[10px]"
        >
          <span className="font-bold text-cyan-300">Left Side</span>
          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center">
            <span className="text-xs">📦</span>
            {isDual && <span className="text-xs">📦</span>}
            {Array.from({ length: leftWeights }).map((_, i) => (
              <span key={i} className="text-[9px]">⬜</span>
            ))}
          </div>
        </motion.div>

        {/* Pivot */}
        <div className="w-1 h-12 bg-white/20 rounded flex items-end justify-center">
          <div className="w-2 h-2 rounded-full bg-cyan-500" />
        </div>

        {/* Right Pan */}
        <motion.div
          animate={{ y: leftWeights === rightWeights - 4 ? 0 : leftWeights > rightWeights - 4 ? -8 : 8 }}
          className="w-24 h-12 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center justify-center p-0.5 text-[10px]"
        >
          <span className="font-bold text-cyan-300">Right Side</span>
          <div className="flex gap-0.5 mt-0.5 flex-wrap justify-center max-w-[80px]">
            {isDual && <span className="text-xs">📦</span>}
            {Array.from({ length: rightWeights }).map((_, i) => (
              <span key={i} className="text-[9px]">⬜</span>
            ))}
          </div>
        </motion.div>

        {solved && (
          <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-xs font-extrabold text-green-400">
            Balanced! x = 4 🎉
          </div>
        )}
      </div>
    </div>
  );
}

/* 7. Transformations Grid Widget (Geometry Shape Shift) */
function TransformationsGridWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [showBox, setShowBox] = useState(false);

  const isTri = levelNum >= 6 && levelNum <= 10;
  const isAngle = levelNum >= 11;

  const translateRight = () => { playSound('click'); setPosX((x) => (x < 2 ? x + 1 : 2)); };
  const translateLeft = () => { playSound('click'); setPosX((x) => (x > -2 ? x - 1 : -2)); };
  const rotateRight = () => { playSound('click'); setRotation((r) => r + 90); };
  const toggleBounding = () => { playSound('click'); setShowBox(!showBox); };

  if (isAngle) {
    return (
      <div className="flex flex-col items-center p-2 w-full">
        <div className="w-24 h-24 bg-black/40 border border-white/10 rounded-xl relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full absolute inset-0">
            {/* Draw a triangle and show dynamic angle arcs */}
            <polygon points="12,80 84,80 48,16" fill="rgba(6, 182, 212, 0.15)" stroke="cyan" strokeWidth="2" />
            <circle cx="12" cy="80" r="10" fill="none" stroke="yellow" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="84" cy="80" r="10" fill="none" stroke="purple" strokeWidth="1.5" strokeDasharray="3 3" />
            <circle cx="48" cy="16" r="10" fill="none" stroke="red" strokeWidth="1.5" strokeDasharray="3 3" />
          </svg>
          <div className="absolute text-[8px] font-mono text-yellow-300 left-3 bottom-1">A=45°</div>
          <div className="absolute text-[8px] font-mono text-purple-300 right-3 bottom-1">B=45°</div>
          <div className="absolute text-[8px] font-mono text-red-300 top-5 left-[42%]">θ=90°</div>
        </div>
        <div className="text-[10px] font-bold text-white/50 mt-2">
          Angle Sum: <span className="text-cyan-400">45° + 45° + 90° = 180°</span>
        </div>
      </div>
    );
  }

  if (isTri) {
    return (
      <div className="flex flex-col items-center p-2 w-full">
        <button onClick={toggleBounding} className="px-3 py-1 bg-teal-500 rounded-full text-[10px] font-bold text-white mb-3 hover:bg-teal-600 transition-colors">
          {showBox ? 'Hide Bounding Box' : 'Show Bounding Box'}
        </button>
        <div className="w-28 h-20 bg-black/40 border border-white/10 rounded-xl relative flex items-center justify-center overflow-hidden">
          <svg className="w-full h-full absolute inset-0">
            {/* Draw bounding box */}
            {showBox && <rect x="16" y="10" width="80" height="60" fill="rgba(255,255,255,0.05)" stroke="white" strokeWidth="1" strokeDasharray="2 2" />}
            {/* Draw triangle */}
            <polygon points="16,70 96,70 56,10" fill="rgba(20, 184, 166, 0.2)" stroke="#14b8a6" strokeWidth="2.5" />
          </svg>
          <div className="absolute bottom-0.5 text-[8px] font-mono text-white/40">Base = 8</div>
          <div className="absolute left-1 text-[8px] font-mono text-white/40 origin-center rotate-[-90deg] translate-y-[-10px]">Height = 6</div>
          {showBox && <div className="absolute top-1 right-2 text-[8px] font-mono text-teal-300 font-extrabold bg-black/50 px-1 rounded">Tri = Half of Box Area</div>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-1 mb-2">
        <button onClick={translateLeft} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-white font-bold">⬅️</button>
        <button onClick={translateRight} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-white font-bold">➡️</button>
        <button onClick={rotateRight} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[9px] text-white font-bold">🔄 Spin</button>
      </div>

      <div className="w-20 h-20 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
        <motion.div
          animate={{ x: posX * 10, rotate: rotation }}
          className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[18px] border-b-cyan-400 relative"
        >
          <div className="absolute top-2 left-[-2px] text-[7px] font-bold text-black select-none pointer-events-none">F</div>
        </motion.div>
      </div>
    </div>
  );
}

/* 8. Ratio Rally Widget (Racing Cars Speed Ratios & Unit Cost) */
function RatioRallyWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const isUnitRate = levelNum >= 11;
  const [ratio, setRatio] = useState(2);
  const [quantity, setQuantity] = useState(3);
  const [cost, setCost] = useState(12);

  const startRace = () => {
    playSound('click');
    // Simple notification sound trigger
    setTimeout(() => playSound('success'), 1200);
  };

  if (isUnitRate) {
    return (
      <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
        <div className="flex gap-3 mb-2.5 w-full">
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[9px] text-white/50 mb-0.5">Quantity: {quantity} items</span>
            <input
              type="range" min="1" max="5" value={quantity}
              onChange={(e) => { playSound('click'); setQuantity(parseInt(e.target.value)); }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-400"
            />
          </div>
          <div className="flex-1 flex flex-col items-center">
            <span className="text-[9px] text-white/50 mb-0.5">Cost: ${cost}</span>
            <input
              type="range" min="5" max="25" step="5" value={cost}
              onChange={(e) => { playSound('click'); setCost(parseInt(e.target.value)); }}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-400"
            />
          </div>
        </div>
        <div className="w-full h-16 bg-white/5 border border-white/10 rounded-xl p-2 relative flex items-center justify-between">
          <div className="flex flex-wrap gap-1 max-w-[150px]">
            {Array.from({ length: quantity }).map((_, i) => (
              <span key={i} className="text-base">🛒</span>
            ))}
          </div>
          <div className="text-right border-l border-white/10 pl-3">
            <div className="text-[8px] text-white/40">Unit Rate:</div>
            <div className="text-base font-extrabold text-orange-400 font-mono">${(cost / quantity).toFixed(2)}</div>
            <div className="text-[8px] text-white/30">per item</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[260px]">
      <div className="w-full flex flex-col items-center mb-2.5">
        <span className="text-[9px] text-white/50 mb-1">Car B speed ratio: 1:{ratio}</span>
        <input
          type="range" min="2" max="4" value={ratio}
          onChange={(e) => { playSound('click'); setRatio(parseInt(e.target.value)); }}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-400"
        />
      </div>

      <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden p-2 flex flex-col justify-around">
        {/* Track 1 */}
        <div className="h-5 w-full flex items-center relative border-b border-white/5 pb-1">
          <motion.span animate={{ x: [0, 80] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="text-sm absolute left-1">🏎️</motion.span>
          <div className="text-[7px] text-white/30 absolute right-1">Car A (speed 1)</div>
        </div>
        {/* Track 2 */}
        <div className="h-5 w-full flex items-center relative">
          <motion.span animate={{ x: [0, 80 * ratio] }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="text-sm absolute left-1">🏎️</motion.span>
          <div className="text-[7px] text-orange-400/60 absolute right-1">Car B (speed {ratio})</div>
        </div>
      </div>
    </div>
  );
}

/* 9. Data Detective Widget (Statistics Mean/Median/Mode) */
function DataDetectiveWidget({ playSound }: { playSound: any }) {
  const [val1, setVal1] = useState(3);
  const [val2, setVal2] = useState(5);
  const [val3, setVal3] = useState(7);
  const [activeStat, setActiveStat] = useState<'mean' | 'median' | 'mode'>('mean');

  const nums = [val1, val2, val3];
  const sorted = [...nums].sort((a,b)=>a-b);
  const sum = val1 + val2 + val3;
  const mean = (sum / 3).toFixed(1);

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="flex gap-1 mb-2">
        <button onClick={() => { playSound('click'); setActiveStat('mean'); }} className={`px-2 py-0.5 rounded text-[8px] font-bold text-white transition-all ${activeStat === 'mean' ? 'bg-purple-500' : 'bg-white/5'}`}>Mean</button>
        <button onClick={() => { playSound('click'); setActiveStat('median'); }} className={`px-2 py-0.5 rounded text-[8px] font-bold text-white transition-all ${activeStat === 'median' ? 'bg-purple-500' : 'bg-white/5'}`}>Median</button>
      </div>

      <div className="flex gap-6 w-full items-end justify-center mb-2.5 h-16 pt-3">
        {/* Slider Columns */}
        {[
          { val: val1, set: setVal1, color: '#ec4899' },
          { val: val2, set: setVal2, color: '#3b82f6' },
          { val: val3, set: setVal3, color: '#eab308' },
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <motion.div
              style={{ height: item.val * 6, backgroundColor: item.color }}
              className="w-4 rounded-t-md relative flex items-center justify-center"
            />
            <input
              type="range" min="1" max="9" value={item.val}
              onChange={(e) => { playSound('click'); item.set(parseInt(e.target.value)); }}
              className="w-10 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer rotate-[0deg]"
            />
            <span className="text-[8px] font-mono text-white/50">{item.val}</span>
          </div>
        ))}
      </div>

      <div className="w-full bg-black/35 rounded-xl px-3 py-1.5 text-[10px] font-bold text-center text-purple-300 font-mono">
        {activeStat === 'mean' ? (
          <span>Mean = (${val1} + ${val2} + ${val3}) / 3 = {mean}</span>
        ) : (
          <span>Median (sorted middle): [${sorted.join(', ')}] ➔ {sorted[1]}</span>
        )}
      </div>
    </div>
  );
}

/* 10. Grammar Galaxy Widget (Spaceship Captures Words) */
function GrammarGalaxyWidget({ playSound }: { playSound: any }) {
  const [position, setPosition] = useState<'noun' | 'verb' | 'adjective'>('noun');
  const [solved, setSolved] = useState(false);

  const captureWord = (category: 'noun' | 'verb' | 'adjective') => {
    playSound('click');
    setPosition(category);
    if (category === 'noun') {
      setSolved(true);
      playSound('success');
    } else {
      setSolved(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="text-[10px] font-bold text-white/70 mb-2">
        Target word: <span className="text-pink-400 font-mono font-extrabold uppercase">"ROCKET"</span>
      </div>

      <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-around">
        {/* Planet Orbits */}
        {['noun', 'verb', 'adjective'].map((cat) => (
          <button
            key={cat}
            onClick={() => captureWord(cat as any)}
            className={`px-2 py-1 bg-white/5 border rounded-lg text-[9px] font-extrabold text-white/80 transition-all ${
              position === cat ? 'border-pink-500 shadow-md' : 'border-white/10'
            }`}
          >
            🛰️ {cat.toUpperCase()}
          </button>
        ))}

        {/* Spaceship */}
        <motion.div
          animate={{ x: position === 'noun' ? -70 : position === 'verb' ? 0 : 70 }}
          transition={{ type: 'spring', stiffness: 150, damping: 12 }}
          className="absolute text-xl pointer-events-none bottom-1"
        >
          🚀
        </motion.div>

        {solved && (
          <div className="absolute inset-0 bg-green-500/15 border border-green-500/25 backdrop-blur-sm rounded-xl flex items-center justify-center text-[10px] font-extrabold text-green-400 uppercase tracking-widest">
            Captured! ROCKET is a NOUN 🎉
          </div>
        )}
      </div>
    </div>
  );
}

/* 11. Vocab Vault Widget (Dial Combos segment roots) */
function VocabVaultWidget({ playSound }: { playSound: any }) {
  const [prefixIdx, setPrefixIdx] = useState(0);
  const [rootIdx, setRootIdx] = useState(0);
  
  const prefixes = ['anti', 'bio', 'chrono'];
  const roots = ['social', 'logy', 'meter'];
  const correctPairs = ['antisocial', 'biology', 'chronometer'];

  const cyclePrefix = () => {
    playSound('click');
    setPrefixIdx((prev) => (prev + 1) % prefixes.length);
  };

  const cycleRoot = () => {
    playSound('click');
    setRootIdx((prev) => (prev + 1) % roots.length);
  };

  const currentWord = prefixes[prefixIdx] + roots[rootIdx];
  const isUnlocked = correctPairs.includes(currentWord);

  useEffect(() => {
    if (isUnlocked) {
      playSound('success');
    }
  }, [isUnlocked]);

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="flex gap-3 mb-3">
        <button onClick={cyclePrefix} className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-[9px] font-bold text-white">🔄 Spin Prefix</button>
        <button onClick={cycleRoot} className="px-3 py-1 bg-white/5 border border-white/10 hover:bg-white/10 rounded-full text-[9px] font-bold text-white">🔄 Spin Root</button>
      </div>

      <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center gap-1">
        <div className="flex border border-yellow-500/20 rounded-lg overflow-hidden bg-black/60 font-mono font-extrabold text-sm text-yellow-300 tracking-wider px-4 py-2 relative">
          <span>{prefixes[prefixIdx]}</span>
          <span className="text-white/20 px-1">|</span>
          <span className="text-cyan-300">{roots[rootIdx]}</span>
        </div>

        {isUnlocked && (
          <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[10px] font-extrabold text-green-400 uppercase tracking-widest">
            🔐 Vault Unlocked! ({currentWord})
          </div>
        )}
      </div>
    </div>
  );
}

/* 12. Mountain Ramp Widget (Linear/Quadratic slope) */
function MountainRampWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [slope, setSlope] = useState(1);
  const [intercept, setIntercept] = useState(0);

  const isQuad = levelNum >= 8;

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-4 mb-2 w-full max-w-[280px]">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-white/50 mb-0.5">{isQuad ? 'Curve a: ' : 'Slope m: '}{slope.toFixed(1)}</span>
          <input
            type="range" min="0.2" max="2" step="0.2" value={slope}
            onChange={(e) => { playSound('click'); setSlope(parseFloat(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-white/50 mb-0.5">Shift c: {intercept}</span>
          <input
            type="range" min="-10" max="10" value={intercept}
            onChange={(e) => { playSound('click'); setIntercept(parseInt(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
      </div>

      <div className="w-full max-w-[240px] h-20 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
        {/* Draw ramp function */}
        <svg className="w-full h-full absolute inset-0">
          {isQuad ? (
            <path
              d={Array.from({ length: 50 }).map((_, idx) => {
                const x = (idx / 50) * 240;
                const normX = (x - 120) / 40;
                const y = 80 - (slope * 20 * normX * normX + (intercept + 20));
                return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
              }).join(' ')}
              stroke="cyan"
              strokeWidth="2.5"
              fill="none"
            />
          ) : (
            <line
              x1="0"
              y1={80 - (0 * slope + (intercept + 30))}
              x2="240"
              y2={80 - (240 * 0.4 * slope + (intercept + 30))}
              stroke="cyan"
              strokeWidth="2.5"
            />
          )}
        </svg>
        {/* Skateboarder */}
        <motion.div
          animate={isQuad ? { x: 120, y: 80 - (intercept + 20) - 12, rotate: 0 } : { x: 100, y: 80 - (100 * 0.4 * slope + (intercept + 30)) - 12, rotate: -Math.atan(slope * 0.4) * (180 / Math.PI) }}
          className="absolute text-base pointer-events-none"
        >
          🛹
        </motion.div>
      </div>
    </div>
  );
}

/* 13. Proof Quest Widget (Logic Switch Circuit Gates) */
function ProofQuestWidget({ playSound }: { playSound: any }) {
  const [swA, setSwA] = useState(false);
  const [swB, setSwB] = useState(false);

  const toggleA = () => { playSound('click'); setSwA(!swA); };
  const toggleB = () => { playSound('click'); setSwB(!swB); };

  const isPowered = swA && swB;

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="flex gap-4 mb-2.5">
        <button onClick={toggleA} className={`px-3 py-1 rounded-full text-[10px] font-bold text-white transition-all ${swA ? 'bg-red-500' : 'bg-white/5 border border-white/10'}`}>
          Switch A: {swA ? 'ON 🔋' : 'OFF 🔌'}
        </button>
        <button onClick={toggleB} className={`px-3 py-1 rounded-full text-[10px] font-bold text-white transition-all ${swB ? 'bg-red-500' : 'bg-white/5 border border-white/10'}`}>
          Switch B: {swB ? 'ON 🔋' : 'OFF 🔌'}
        </button>
      </div>

      <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-around">
        <div className="flex items-center gap-1 text-[10px] font-mono text-white/50">
          <span>Switches A, B</span>
          <span className="text-white">➔</span>
          <div className="bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-red-300 font-extrabold">AND Gate</div>
          <span className="text-white">➔</span>
          <span className={`font-extrabold ${isPowered ? 'text-green-400' : 'text-white/20'}`}>Gate Open</span>
        </div>

        {isPowered && (
          <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[10px] font-extrabold text-green-400 uppercase tracking-widest">
            💡 Circuit Complete! Gate Opened!
          </div>
        )}
      </div>
    </div>
  );
}

/* 14. Probability Pinball Widget (Galton Board drops) */
function ProbabilityPinballWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const isCompound = levelNum >= 8;
  const [balls, setBalls] = useState<number[]>([]);

  const launchBall = () => {
    playSound('click');
    setBalls((prev) => [...prev, Date.now()]);
    setTimeout(() => playSound('streak'), 800);
  };

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <button onClick={launchBall} className="px-3 py-1 bg-green-500 rounded-full text-[10px] font-bold text-white mb-2.5 hover:bg-green-600 transition-colors">
        🎰 Drop Ball
      </button>

      <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex justify-center items-center">
        {/* Draw peg grid */}
        <div className="absolute flex flex-col gap-1.5 items-center justify-center">
          <div className="flex gap-2.5 text-[8px] text-white/25">⚪ ⚪ ⚪</div>
          <div className="flex gap-2 text-[8px] text-white/25">⚪ ⚪</div>
          <div className="flex gap-1.5 text-[8px] text-white/25">⚪</div>
        </div>

        {balls.map((id) => (
          <motion.div
            key={id}
            animate={{ y: [ -20, 0, 20 ], x: [ 0, Math.random() > 0.5 ? 10 : -10, Math.random() > 0.5 ? 20 : -20 ] }}
            transition={{ duration: 0.8 }}
            className="absolute w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_5px_rgba(16,185,129,0.8)]"
          />
        ))}

        <div className="absolute bottom-1 right-2 text-[8px] font-mono text-white/30">
          {isCompound ? 'P(A and B) = P(A) * P(B)' : 'Odds: 50% left/right'}
        </div>
      </div>
    </div>
  );
}

/* 15. Coordinate Clash Widget (Coordinate dx/dy triangle calculator) */
function CoordinateClashWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [clickCount, setClickCount] = useState(0);
  const isSlope = levelNum >= 8;

  const triggerGridClick = () => {
    playSound('click');
    setClickCount((prev) => (prev + 1) % 3);
  };

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <button onClick={triggerGridClick} className="px-3 py-1 bg-blue-500 rounded-full text-[10px] font-bold text-white mb-2.5 hover:bg-blue-600 transition-colors">
        {clickCount === 0 ? 'Click Point 1' : clickCount === 1 ? 'Click Point 2' : 'Clear Points'}
      </button>

      <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center font-mono text-[9px] text-white/50">
        <svg className="w-full h-full absolute inset-0">
          {/* Draw axes */}
          <line x1="0" y1="32" x2="280" y2="32" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <line x1="140" y1="0" x2="140" y2="64" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

          {/* Points */}
          {clickCount >= 1 && <circle cx="80" cy="48" r="3" fill="#3b82f6" />}
          {clickCount >= 2 && (
            <>
              <circle cx="200" cy="16" r="3" fill="#3b82f6" />
              {/* dx, dy path */}
              <line x1="80" y1="48" x2="200" y2="48" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeDasharray="2 2" />
              <line x1="200" y1="48" x2="200" y2="16" stroke="rgba(255,255,255,0.2)" strokeWidth="1.2" strokeDasharray="2 2" />
              {/* direct path */}
              <line x1="80" y1="48" x2="200" y2="16" stroke="#3b82f6" strokeWidth="1.8" />
            </>
          )}
        </svg>

        {clickCount === 2 && (
          <div className="absolute top-1 left-2 text-[8px] font-extrabold text-blue-300 bg-black/60 px-1 rounded">
            {isSlope ? 'Slope m = Rise/Run = -32/120' : 'dx = 120, dy = 32 ➔ d = √(dx² + dy²)'}
          </div>
        )}
      </div>
    </div>
  );
}

/* 16. Essay Engine Widget (Essay Paragraph snaps) */
function EssayEngineWidget({ playSound }: { playSound: any }) {
  const [gears, setGears] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const addGear = (g: string) => {
    if (solved || gears.includes(g)) return;
    playSound('click');
    const newGears = [...gears, g];
    setGears(newGears);

    const order = ['hook', 'thesis', 'evidence'];
    const nextIdx = newGears.length - 1;
    if (newGears[nextIdx] !== order[nextIdx]) {
      playSound('error');
      setGears([]);
    } else if (newGears.length === order.length) {
      setSolved(true);
      playSound('success');
    }
  };

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="flex gap-2 mb-2.5">
        {['thesis', 'hook', 'evidence'].map((g) => (
          <button
            key={g}
            onClick={() => addGear(g)}
            disabled={gears.includes(g)}
            className="px-2 py-1 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 rounded text-[9px] font-extrabold text-white"
          >
            ⚙️ {g.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="w-full h-12 bg-black/45 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center gap-2">
        <div className="flex gap-1.5 font-bold text-[9px] text-white/50">
          {gears.map((g, i) => (
            <motion.div key={i} animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: 'linear' }} className="text-orange-400">
              ⚙️ {g.toUpperCase()}
            </motion.div>
          ))}
          {gears.length === 0 && <span className="italic text-white/20">Fit gears onto assembly belt...</span>}
        </div>

        {solved && (
          <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[10px] font-extrabold text-green-400 uppercase tracking-widest">
            ⚙️ Engine Running! Coherent Essay!
          </div>
        )}
      </div>
    </div>
  );
}

/* 17. Rhetoric Arena Widget (Persuasive appeal gauges) */
function RhetoricArenaWidget({ playSound }: { playSound: any }) {
  const [rhetoric, setRhetoric] = useState<'ethos' | 'pathos' | 'logos'>('ethos');

  const setAppeal = (appeal: 'ethos' | 'pathos' | 'logos') => {
    playSound('click');
    setRhetoric(appeal);
  };

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="flex gap-2 mb-3">
        {['ethos', 'pathos', 'logos'].map((appeal) => (
          <button
            key={appeal}
            onClick={() => setAppeal(appeal as any)}
            className={`px-3 py-1 rounded-full text-[9px] font-bold text-white transition-all ${
              rhetoric === appeal ? 'bg-red-500' : 'bg-white/5 border border-white/10'
            }`}
          >
            {appeal.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden p-2 flex items-center justify-around">
        {/* Dynamic bar charts */}
        {[
          { name: 'Ethos', val: rhetoric === 'ethos' ? 80 : 20, color: '#f43f5e' },
          { name: 'Pathos', val: rhetoric === 'pathos' ? 80 : 20, color: '#3b82f6' },
          { name: 'Logos', val: rhetoric === 'logos' ? 80 : 20, color: '#10b981' },
        ].map((bar, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1 max-w-[60px]">
            <div className="w-full bg-white/5 h-2 rounded overflow-hidden">
              <motion.div animate={{ width: `${bar.val}%` }} className="h-full" style={{ backgroundColor: bar.color }} />
            </div>
            <span className="text-[8px] font-bold text-white/50">{bar.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* 18. Ferris Wheel Widget (Trigonometry unit circle) */
function FerrisWheelWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [angle, setAngle] = useState(45);

  const rad = (angle * Math.PI) / 180;
  const sinVal = Math.sin(rad);
  const cosVal = Math.cos(rad);

  const isRadian = levelNum >= 11;

  return (
    <div className="flex flex-col items-center p-2">
      <input
        type="range" min="0" max="360" value={angle}
        onChange={(e) => { playSound('click'); setAngle(parseInt(e.target.value)); }}
        className="w-full max-w-[240px] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-3"
      />

      <div className="flex gap-4 items-center justify-center w-full max-w-md h-24">
        {/* Unit Circle */}
        <div className="w-20 h-20 rounded-full border border-white/20 bg-white/5 relative flex items-center justify-center">
          <div className="absolute inset-0 rounded-full border border-dashed border-white/10" />
          <svg className="w-full h-full absolute inset-0">
            <line
              x1="40" y1="40"
              x2={40 + 30 * cosVal}
              y2={40 - 30 * sinVal}
              stroke="rgba(255,255,255,0.4)"
              strokeWidth="1.5"
            />
          </svg>
          <div
            className="absolute w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_5px_cyan]"
            style={{
              left: 40 + 30 * cosVal - 4,
              top: 40 - 30 * sinVal - 4,
            }}
          />
          <div className="text-[8px] text-white/40 font-mono absolute bottom-1">
            {isRadian ? `θ = ${(rad / Math.PI).toFixed(2)}π` : `θ = ${angle}°`}
          </div>
        </div>

        {/* Live Traced Wave */}
        <div className="w-28 h-20 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex flex-col justify-between p-1">
          <div className="text-[8px] font-bold text-cyan-300 font-mono">Sine wave value:</div>
          <div className="h-10 w-full flex items-center justify-center relative border-y border-white/5">
            <svg className="w-full h-full absolute inset-0">
              <path
                d={Array.from({ length: 50 }).map((_, idx) => {
                  const t = idx / 50;
                  const x = t * 110;
                  const a = rad - (1 - t) * 4;
                  const y = 20 - 12 * Math.sin(a);
                  return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
                }).join(' ')}
                stroke="cyan"
                strokeWidth="1.2"
                fill="none"
              />
            </svg>
            <div className="absolute right-1 text-[10px] font-extrabold text-cyan-400">
              {sinVal.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* 19. Matrix Maze Widget (Matrix coordinate shearing) */
function MatrixMazeWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [shear, setShear] = useState(0);

  const isMult = levelNum >= 6;

  if (isMult) {
    return (
      <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
        <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-2 relative flex items-center justify-center gap-1 font-mono text-[9px] text-white/50">
          <div className="flex items-center gap-0.5 bg-black/50 border border-white/10 p-1.5 rounded-lg text-white">
            <div className="border-y border-white/40 px-1 text-center font-bold">
              <div>1</div>
              <div>2</div>
            </div>
            <span className="text-[10px] font-bold">×</span>
            <div className="border-y border-white/40 px-1 text-center font-bold">
              <div>3</div>
              <div>4</div>
            </div>
            <span className="text-[10px] font-bold">=</span>
            <div className="border-y border-white/40 px-1 text-center font-extrabold text-purple-300">
              <div>1*3 + 2*4</div>
              <div className="text-[7px] text-purple-400">= 11</div>
            </div>
          </div>
          <div className="absolute bottom-1 right-2 text-[7px] text-white/30">Row × Column dot product</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="w-full flex flex-col items-center mb-2">
        <span className="text-[9px] text-white/50 mb-1">Shear factor: {shear.toFixed(1)}</span>
        <input
          type="range" min="-1" max="1" step="0.2" value={shear}
          onChange={(e) => { playSound('click'); setShear(parseFloat(e.target.value)); }}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-400"
        />
      </div>

      <div className="w-24 h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center">
        <svg className="w-full h-full absolute inset-0">
          {/* Transforming sheared square */}
          <polygon
            points={`30,48 ${30 + 20 * shear},28 ${50 + 20 * shear},28 50,48`}
            fill="rgba(139, 92, 246, 0.18)"
            stroke="#8b5cf6"
            strokeWidth="1.5"
          />
        </svg>
        <div className="absolute bottom-1 right-2 text-[8px] font-mono text-purple-300 bg-black/50 px-1 rounded">
          Det Area = 1.0
        </div>
      </div>
    </div>
  );
}

/* 20. Magnifying Glass Widget (Limit Bridge & Derivatives) */
function MagnifyingGlassWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [zoom, setZoom] = useState(1);

  const isDeriv = levelNum >= 11;

  return (
    <div className="flex flex-col items-center p-2">
      <span className="text-[9px] text-white/50 mb-1">
        {isDeriv ? 'Secant interval width (h ➔ 0):' : 'Zoom Slider (Approach x ➔ 2):'}
      </span>
      <input
        type="range" min="1" max="100" value={zoom}
        onChange={(e) => { playSound('click'); setZoom(parseInt(e.target.value)); }}
        className="w-full max-w-[240px] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-3"
      />

      <div className="relative w-full max-w-[260px] h-20 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center">
        {isDeriv ? (
          <svg className="w-full h-full absolute inset-0">
            {/* Curved function */}
            <path d="M 20 50 Q 120 10 220 30" stroke="rgba(255,255,255,0.15)" strokeWidth="2" fill="none" />
            {/* Tangent line */}
            <line x1="20" y1="40" x2="220" y2="25" stroke="cyan" strokeWidth="2" />
            {/* Secant line based on zoom interval */}
            <line x1="80" y1="36" x2={80 + 100 / zoom} y2={36 - 15 / zoom} stroke="red" strokeWidth="1" strokeDasharray="2 2" />
          </svg>
        ) : (
          <svg className="w-full h-full absolute inset-0">
            <line
              x1={130 - 80 * zoom} y1={40 + 30 * zoom}
              x2={130 - 2 * zoom} y2={40 + 0.6 * zoom}
              stroke="cyan" strokeWidth="2"
            />
            <line
              x1={130 + 2 * zoom} y1={40 - 0.6 * zoom}
              x2={130 + 80 * zoom} y2={40 - 30 * zoom}
              stroke="cyan" strokeWidth="2"
            />
            <circle cx="130" cy="40" r="3" fill="black" stroke="cyan" strokeWidth="1.5" />
          </svg>
        )}

        <div className="absolute bottom-1 left-2 text-[8px] text-white/50">
          {isDeriv ? `Interval h = ${(10 / zoom).toFixed(3)}` : `Zoom: ${zoom}x`}
        </div>
      </div>
    </div>
  );
}

/* 21. Stats Showdown Widget (Gaussian Normal Bell curve) */
function StatsShowdownWidget({ playSound }: { playSound: any }) {
  const [deviation, setDeviation] = useState(1);

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="w-full flex flex-col items-center mb-2.5">
        <span className="text-[9px] text-white/50 mb-1">Standard deviations shaded (Z): ±{deviation}</span>
        <input
          type="range" min="1" max="3" value={deviation}
          onChange={(e) => { playSound('click'); setDeviation(parseInt(e.target.value)); }}
          className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-emerald-400"
        />
      </div>

      <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center p-1">
        <svg className="w-full h-full absolute inset-0">
          {/* Bell curve */}
          <path
            d={Array.from({ length: 60 }).map((_, idx) => {
              const x = (idx / 60) * 260;
              const normX = (x - 130) / 40;
              const y = 55 - 40 * Math.exp(-0.5 * normX * normX);
              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            stroke="emerald"
            strokeWidth="2"
            fill="none"
          />
          {/* Shaded area */}
          <path
            d={`M ${130 - 40 * deviation} 55 ` +
              Array.from({ length: 20 * deviation }).map((_, idx) => {
                const x = (130 - 40 * deviation) + (idx / (20 * deviation)) * (80 * deviation);
                const normX = (x - 130) / 40;
                const y = 55 - 40 * Math.exp(-0.5 * normX * normX);
                return `L ${x} ${y}`;
              }).join(' ') +
              ` L ${130 + 40 * deviation} 55 Z`}
            fill="rgba(16, 185, 129, 0.2)"
          />
        </svg>
        <div className="absolute top-1 right-2 text-[9px] font-extrabold text-emerald-400 bg-black/60 px-1.5 rounded">
          {deviation === 1 ? 'Area = 68.2%' : deviation === 2 ? 'Area = 95.4%' : 'Area = 99.7%'}
        </div>
      </div>
    </div>
  );
}

/* 22. Vase Filler Widget (Riemann sums & Series convergence) */
function VaseFillerWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [intervals, setIntervals] = useState(4);
  const [sumIndex, setSumIndex] = useState(1);

  const isSeries = levelNum >= 13;

  if (isSeries) {
    return (
      <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
        <div className="w-full flex flex-col items-center mb-2">
          <span className="text-[9px] text-white/50 mb-1">Add series terms: {sumIndex}</span>
          <input
            type="range" min="1" max="5" value={sumIndex}
            onChange={(e) => { playSound('click'); setSumIndex(parseInt(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden p-1 flex items-center justify-around">
          <div className="flex items-center gap-1 font-mono text-[9px] text-white">
            <span>Sum:</span>
            {Array.from({ length: sumIndex }).map((_, i) => (
              <span key={i} className="text-cyan-400 font-extrabold">{i === 0 ? '1/2' : ` + 1/${Math.pow(2, i + 1)}`}</span>
            ))}
            <span className="text-white">=</span>
            <span className="text-emerald-400 font-extrabold">{(1 - Math.pow(0.5, sumIndex)).toFixed(4)}</span>
          </div>
          <div className="absolute bottom-1 right-2 text-[8px] text-white/30">Converges to 1.0</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-2">
      <span className="text-[9px] text-white/50 mb-0.5">Riemann Sum subdivisions (n): {intervals}</span>
      <input
        type="range" min="4" max="16" step="2" value={intervals}
        onChange={(e) => { playSound('click'); setIntervals(parseInt(e.target.value)); }}
        className="w-full max-w-[240px] h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400 mb-3"
      />

      <div className="flex gap-4 items-center justify-center w-full max-w-md h-20">
        {/* Riemann sum graph */}
        <div className="w-28 h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden p-0.5">
          <svg className="w-full h-full absolute inset-0">
            <path d="M 5 50 Q 40 10 100 35" stroke="cyan" strokeWidth="1.5" fill="none" />
            {Array.from({ length: intervals }).map((_, i) => {
              const xStart = 5 + i * (90 / intervals);
              const xCenter = xStart + (45 / intervals);
              const t = (xCenter - 5) / 90;
              const yCurve = (1 - t) * (1 - t) * 50 + 2 * (1 - t) * t * 10 + t * t * 35;
              const rectHeight = 60 - yCurve;
              const rectWidth = 90 / intervals;
              return (
                <rect
                  key={i}
                  x={xStart}
                  y={yCurve - 5}
                  width={rectWidth}
                  height={rectHeight}
                  fill={`rgba(6, 182, 212, 0.15)`}
                  stroke="rgba(6, 182, 212, 0.4)"
                  strokeWidth="0.8"
                />
              );
            })}
          </svg>
        </div>

        {/* Vase filling up */}
        <div className="w-12 h-16 bg-white/5 border border-white/10 rounded-b-xl relative overflow-hidden flex flex-col justify-end">
          <motion.div
            animate={{ height: `${30 + (intervals / 16) * 50}%` }}
            className="w-full bg-cyan-500/30 border-t border-cyan-400"
          />
        </div>
      </div>
    </div>
  );
}

/* 23. Proof Architect Widget (Mathematical Induction domino chain) */
function ProofArchitectWidget({ levelNum, playSound }: { levelNum: number; playSound: any }) {
  const [tip, setTip] = useState(false);
  const isInduct = levelNum >= 6;

  const handlePush = () => {
    playSound('click');
    setTip(true);
    setTimeout(() => playSound('streak'), 500);
  };

  if (!isInduct) {
    return (
      <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
        <div className="w-full h-16 bg-black/40 border border-white/10 rounded-xl p-2 relative flex items-center justify-center gap-1 font-mono text-[9px] text-white/50">
          <div className="flex items-center gap-1 bg-black/50 border border-white/10 p-1.5 rounded-lg text-white">
            <span className="text-cyan-300">Premise P</span>
            <span className="text-white">➔</span>
            <span className="text-purple-300">Logic Links</span>
            <span className="text-white">➔</span>
            <span className="text-emerald-300">Goal Q</span>
          </div>
          <div className="absolute bottom-1 right-2 text-[7px] text-white/30">Direct implication roadmap</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <button onClick={handlePush} disabled={tip} className="px-3 py-1 bg-purple-500 disabled:opacity-40 rounded-full text-[10px] font-bold text-white mb-3 hover:bg-purple-600 transition-colors">
        🏁 Push Domino 1 (Base Case)
      </button>

      <div className="w-full h-14 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            animate={tip ? { rotate: 65, y: 15 } : { rotate: 0 }}
            transition={{ delay: i * 0.12, type: 'spring', stiffness: 100 }}
            className="w-1.5 h-8 bg-purple-400 rounded-sm origin-bottom"
            style={{ transform: 'rotate(0deg)' }}
          />
        ))}
        {tip && (
          <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[10px] font-extrabold text-green-400 uppercase tracking-widest">
            🧾 Inductive Step Complete! All n Tipped!
          </div>
        )}
      </div>
    </div>
  );
}

/* 24. Rotating Triangle Widget (Abstract Algebra group symmetry) */
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
        className="px-3 py-1 bg-purple-500 rounded-full text-[10px] font-bold text-white hover:bg-purple-600 transition-all mb-3"
      >
        🔺 Rotate 120° (Group Operation)
      </button>

      <div className="w-20 h-20 bg-black/40 border border-white/10 rounded-xl relative flex items-center justify-center">
        <div className="absolute w-16 h-16 border border-dashed border-white/15 rotate-[180deg]" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }} />
        <motion.div
          animate={{ rotate: rotation }}
          className="w-16 h-16 bg-purple-500/30 border border-purple-400 relative flex items-center justify-center"
          style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}
        >
          <span className="absolute top-0.5 text-[8px] font-extrabold text-white">{getLabel(0)}</span>
          <span className="absolute bottom-0.5 left-1 text-[8px] font-extrabold text-white">{getLabel(1)}</span>
          <span className="absolute bottom-0.5 right-1 text-[8px] font-extrabold text-white">{getLabel(2)}</span>
        </motion.div>
      </div>
    </div>
  );
}

/* 25. Spring Oscillator Widget (Differential Equations spring curves) */
function SpringOscillatorWidget({ playSound }: { playSound: any }) {
  const [damping, setDamping] = useState(1);
  const [stiffness, setStiffness] = useState(3);

  return (
    <div className="flex flex-col items-center p-2">
      <div className="flex gap-4 mb-2 w-full max-w-[280px]">
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-white/50 mb-0.5">Damping (Friction): {damping}</span>
          <input
            type="range" min="0.2" max="2" step="0.2" value={damping}
            onChange={(e) => { playSound('click'); setDamping(parseFloat(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-400"
          />
        </div>
        <div className="flex-1 flex flex-col items-center">
          <span className="text-[9px] text-white/50 mb-0.5">Stiffness (Frequency): {stiffness}</span>
          <input
            type="range" min="2" max="5" value={stiffness}
            onChange={(e) => { playSound('click'); setStiffness(parseInt(e.target.value)); }}
            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-red-400"
          />
        </div>
      </div>

      <div className="w-full max-w-[240px] h-16 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center justify-center p-1">
        <svg className="w-full h-full absolute inset-0">
          {/* Spring wave decay curve */}
          <path
            d={Array.from({ length: 60 }).map((_, idx) => {
              const x = (idx / 60) * 240;
              const t = x / 40;
              const y = 32 - 20 * Math.exp(-damping * t * 0.2) * Math.sin(stiffness * t);
              return `${idx === 0 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            stroke="red"
            strokeWidth="1.8"
            fill="none"
          />
        </svg>
      </div>
    </div>
  );
}

/* 26. Thesis Forge Widget (Blacksmith hammer Citation blocks) */
function ThesisForgeWidget({ playSound }: { playSound: any }) {
  const [clicked, setClicked] = useState<string[]>([]);
  const [solved, setSolved] = useState(false);

  const format = ['author', 'year', 'title'];

  const clickBlock = (b: string) => {
    if (solved || clicked.includes(b)) return;
    playSound('click');
    const newClicked = [...clicked, b];
    setClicked(newClicked);

    const nextIdx = newClicked.length - 1;
    if (newClicked[nextIdx] !== format[nextIdx]) {
      playSound('error');
      setClicked([]);
    } else if (newClicked.length === format.length) {
      setSolved(true);
      playSound('success');
    }
  };

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="flex gap-2 mb-2.5">
        {['title', 'author', 'year'].map((b) => (
          <button
            key={b}
            onClick={() => clickBlock(b)}
            disabled={clicked.includes(b)}
            className="px-2.5 py-1 bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-30 rounded text-[9px] font-extrabold text-white"
          >
            🔨 {b.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="w-full h-11 border border-dashed border-white/15 bg-black/20 rounded-xl relative flex items-center justify-center gap-1.5 font-bold font-mono text-[9px] text-white">
        {clicked.map((b, i) => (
          <span key={i} className="text-yellow-300">
            {b === 'author' ? 'Smith, J.' : b === 'year' ? '(2026)' : 'The App Story.'}
          </span>
        ))}
        {clicked.length === 0 && <span className="text-white/20 italic">Hammer blocks in APA order...</span>}
        {solved && (
          <div className="absolute inset-0 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[10px] font-extrabold text-yellow-400 uppercase tracking-widest">
            🔨 Citation Forged! APA Style!
          </div>
        )}
      </div>
    </div>
  );
}

/* 27. Critical Lens Widget (Camera viewfinders sociological lenses) */
function CriticalLensWidget({ playSound }: { playSound: any }) {
  const [lens, setLens] = useState<'marxist' | 'feminist' | 'deconstruct'>('marxist');

  const switchLens = (l: 'marxist' | 'feminist' | 'deconstruct') => {
    playSound('click');
    setLens(l);
  };

  return (
    <div className="flex flex-col items-center p-2 w-full max-w-[280px]">
      <div className="flex gap-1.5 mb-2.5">
        {['marxist', 'feminist', 'deconstruct'].map((l) => (
          <button
            key={l}
            onClick={() => switchLens(l as any)}
            className={`px-2 py-1 rounded text-[8px] font-extrabold text-white transition-all ${
              lens === l ? 'bg-teal-500' : 'bg-white/5'
            }`}
          >
            🔎 {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="w-full h-14 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden p-2 flex items-center justify-center text-[9px] font-semibold text-white/50 italic leading-relaxed text-center">
        {lens === 'marxist' ? (
          <span>"The <span className="text-yellow-400 font-bold">wealthy merchants</span> controlled the <span className="text-yellow-400 font-bold">labor force</span>."</span>
        ) : lens === 'feminist' ? (
          <span>"The <span className="text-purple-400 font-bold">empress</span> established her own <span className="text-purple-400 font-bold">sovereign rule</span>."</span>
        ) : (
          <span>"The text claims <span className="text-cyan-400 font-bold font-mono">absolute truth</span> but shows <span className="text-cyan-400 font-bold font-mono">glaring ironies</span>."</span>
        )}
      </div>
    </div>
  );
}

/* 28. Sentence Train Widget (Conjunctions / Fallbacks) */
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
      <div className="text-[10px] text-white/80 font-bold mb-2.5 bg-white/5 px-2 py-1.5 rounded-lg border border-white/5">
        "Milo stayed inside <span className="text-cyan-400 underline font-mono px-0.5">{slot || '____'}</span> it was raining."
      </div>

      <div className="flex gap-1.5 mb-3">
        {['and', 'but', 'because'].map((conj) => (
          <button
            key={conj}
            onClick={() => selectConjunction(conj)}
            className={`px-2 py-0.5 bg-white/5 border border-white/10 hover:bg-white/10 rounded text-[9px] font-bold text-white transition-all ${
              slot === conj ? 'border-cyan-400' : ''
            }`}
          >
            {conj}
          </button>
        ))}
      </div>

      <div className="w-full max-w-[260px] h-10 bg-black/40 border border-white/10 rounded-xl relative overflow-hidden flex items-center px-4">
        <div className="absolute inset-x-0 h-1 border-y border-dashed border-white/20 top-1/2 -translate-y-1/2" />
        <motion.div
          animate={{ x: solved ? 180 : 0 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
          className="text-lg z-10 pointer-events-none select-none"
        >
          🚂
        </motion.div>
        {solved && (
          <div className="absolute inset-0 bg-green-500/10 border border-green-500/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-[9px] font-extrabold text-green-400 uppercase tracking-widest">
            Connected! Train is driving! 🎉
          </div>
        )}
      </div>
    </div>
  );
}
