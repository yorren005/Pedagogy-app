'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HintBoxProps {
  slug: string;
  problem: any;
}

export default function HintBox({ slug, problem }: HintBoxProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hintData = useMemo(() => {
    if (!problem) return null;

    let formula = '';
    let explanation = '';
    let calculation = '';

    switch (slug) {
      /* ─── ELEMENTARY ─── */
      case 'fruit-market': {
        const addA = problem.a ?? 3;
        const addB = problem.b ?? 2;
        const sum = addA + addB;
        formula = 'a + b = Sum';
        explanation = 'Count the total number of fruits by adding the two groups together.';
        if (problem.missingPosition === 'a') {
          calculation = `? + ${addB} = ${sum} ➔ ? = ${sum} - ${addB} = ${addA}`;
        } else if (problem.missingPosition === 'b') {
          calculation = `${addA} + ? = ${sum} ➔ ? = ${sum} - ${addA} = ${addB}`;
        } else {
          calculation = `${addA} + ${addB} = ${sum}`;
        }
        break;
      }
      case 'the-picnic': {
        const subA = problem.a ?? 5;
        const subB = problem.b ?? 2;
        const diff = subA - subB;
        formula = 'a - b = Difference';
        explanation = 'Subtract the taken fruits from the starting amount to find what remains.';
        if (problem.missingPosition === 'b') {
          calculation = `${subA} - ? = ${diff} ➔ ? = ${subA} - ${diff} = ${subB}`;
        } else {
          calculation = `${subA} - ${subB} = ${diff}`;
        }
        break;
      }
      case 'toy-factory': {
        const mulA = problem.a ?? 3;
        const mulB = problem.b ?? 4;
        formula = 'a × b = Total (a groups of b)';
        explanation = 'Multiply the number of boxes by the toys per box. Or add toys repeatedly: b + b + ...';
        calculation = `${mulA} × ${mulB} = ${mulA * mulB}`;
        break;
      }
      case 'pizza-party': {
        const num = problem.a ?? 3;
        const den = problem.b ?? 4;
        formula = 'Fraction = Numerator / Denominator';
        explanation = 'The Denominator (bottom) is the total slices. The Numerator (top) is the number of slices colored or taken.';
        calculation = `Slices colored (Numerator): ${num}\nTotal slices (Denominator): ${den}\nFraction = ${num} / ${den}`;
        break;
      }
      case 'word-safari': {
        const word = problem.word || 'ANIMAL';
        formula = 'Spelling Rule';
        explanation = 'Look closely at the animal or item emoji and assemble the letters in the correct spelling order.';
        calculation = `Word to spell: ${word}`;
        break;
      }
      case 'story-builder': {
        formula = 'Subject + Verb + Object';
        explanation = 'Sentences start with a Capital letter, place action verbs after nouns, and end with punctuation.';
        calculation = 'Arrange words logically to build a story.';
        break;
      }

      /* ─── MIDDLE SCHOOL LOWER ─── */
      case 'equation-quest': {
        const eqStr = problem.equation || '';
        formula = 'For x + b = c ➔ x = c - b\nFor ax + b = c ➔ x = (c - b) / a';
        explanation = 'Isolate x by performing inverse operations. Subtract constants first, then divide by coefficients.';
        
        // Parse equation variables dynamically if possible
        let parsedCalc = '';
        const match1 = eqStr.match(/x\s*\+\s*(\d+)\s*=\s*(\d+)/);
        const match2 = eqStr.match(/(\d+)x\s*\+\s*(\d+)\s*=\s*(\d+)/);
        const match3 = eqStr.match(/(\d+)x\s*-\s*(\d+)\s*=\s*(\d+)x\s*\+\s*(\d+)/);
        
        if (match1) {
          const bVal = parseInt(match1[1]);
          const cVal = parseInt(match1[2]);
          parsedCalc = `x + ${bVal} = ${cVal}\n➔ x = ${cVal} - ${bVal} = ${cVal - bVal}`;
        } else if (match2) {
          const aVal = parseInt(match2[1]);
          const bVal = parseInt(match2[2]);
          const cVal = parseInt(match2[3]);
          parsedCalc = `${aVal}x + ${bVal} = ${cVal}\n➔ ${aVal}x = ${cVal} - ${bVal} = ${cVal - bVal}\n➔ x = ${cVal - bVal} / ${aVal} = ${(cVal - bVal) / aVal}`;
        } else if (match3) {
          const aVal = parseInt(match3[1]);
          const bVal = parseInt(match3[2]);
          const cVal = parseInt(match3[3]);
          const dVal = parseInt(match3[4]);
          parsedCalc = `${aVal}x - ${bVal} = ${cVal}x + ${dVal}\n➔ (${aVal} - ${cVal})x = ${dVal} + ${bVal}\n➔ ${aVal - cVal}x = ${dVal + bVal}\n➔ x = ${dVal + bVal} / ${aVal - cVal} = ${(dVal + bVal) / (aVal - cVal)}`;
        }
        
        calculation = parsedCalc || (problem.equation ? `Solve: ${problem.equation} ➔ x = ${problem.answer}` : 'Solve for x to balance the scale.');
        break;
      }
      case 'shape-shift': {
        const sType = problem.shapeType || 'rectangle';
        const sw = problem.width || 6;
        const sh = problem.height || 4;
        if (sType === 'rectangle') {
          formula = 'Area = w × h\nPerimeter = 2 × (w + h)';
          explanation = 'To find Area, multiply side lengths. For Perimeter, add all four side lengths together.';
          calculation = `w = ${sw}, h = ${sh}\nArea = ${sw} × ${sh} = ${sw * sh}\nPerimeter = 2 × (${sw} + ${sh}) = ${2 * (sw + sh)}`;
        } else if (sType === 'triangle') {
          formula = 'Area = 0.5 × Base × Height';
          explanation = 'Multiply base by height, then divide by 2.';
          calculation = `Base = ${sw}, Height = ${sh}\nArea = 0.5 × ${sw} × ${sh} = ${0.5 * sw * sh}`;
        } else {
          formula = 'θ = 180° - Angle A - Angle B';
          explanation = 'The interior angles of any triangle always add up to exactly 180°.';
          calculation = `Given angles: ${sw}° and ${sh}°\nθ = 180° - ${sw}° - ${sh}° = ${180 - sw - sh}°`;
        }
        break;
      }
      case 'ratio-rally': {
        const eqStr = problem.equation || '';
        let formulaStr = 'Proportion: a/b = c/d ➔ ad = bc';
        let explanationStr = 'Set up equivalent ratios or divide to find unit rate.';
        let calculationStr = '';
        
        const propMatch = eqStr.match(/If (\d+):(\d+) = (\d+):x/);
        const pctMatch = eqStr.match(/What is (\d+)% of (\d+)/);
        const rateMatch = eqStr.match(/If (\d+) items cost \$(\d+), how much do (\d+) cost/);
        
        if (propMatch) {
          const a = parseInt(propMatch[1]);
          const b = parseInt(propMatch[2]);
          const c = parseInt(propMatch[3]);
          formulaStr = 'Proportion: a/b = c/x ➔ x = (b × c) / a';
          explanationStr = 'Find the missing term x by multiplying the means and dividing by the extreme.';
          calculationStr = `If ${a}/${b} = ${c}/x ➔ x = (${b} × ${c}) / ${a} = ${b * c} / ${a} = ${problem.answer}`;
        } else if (pctMatch) {
          const pct = parseInt(pctMatch[1]);
          const base = parseInt(pctMatch[2]);
          formulaStr = 'Percentage: Part = (Percent / 100) × Base';
          explanationStr = 'Multiply the base value by the percentage expressed as a decimal.';
          calculationStr = `${pct}% of ${base} = (${pct} / 100) × ${base} = ${pct / 100} × ${base} = ${problem.answer}`;
        } else if (rateMatch) {
          const items = parseInt(rateMatch[1]);
          const price = parseInt(rateMatch[2]);
          const target = parseInt(rateMatch[3]);
          formulaStr = 'Unit Rate: Unit Price = Cost / Items\nTotal = Unit Price × Target Items';
          explanationStr = 'Find the cost of a single item first, then multiply by the desired quantity.';
          calculationStr = `Unit Price = $${price} / ${items} = $${price / items} per item\nTotal for ${target} items = $${price / items} × ${target} = $${problem.answer}`;
        }
        
        formula = formulaStr;
        explanation = explanationStr;
        calculation = calculationStr || (eqStr ? `Solve in context: "${eqStr}"` : 'Match terms proportionally.');
        break;
      }
      case 'data-detective': {
        const numsStr = problem.numsString || '';
        const nums = numsStr.split(',').map((x: string) => parseInt(x.trim())).filter((x: number) => !isNaN(x));
        const sum = nums.reduce((a: number, b: number) => a + b, 0);
        const count = nums.length;
        
        if (numsStr.includes('Mean') || problem.equation?.toLowerCase().includes('mean')) {
          formula = 'Mean = Sum of Values / Count of Values';
          explanation = 'Add all the numbers together, then divide by the total count of numbers.';
          calculation = `Values: [${nums.join(', ')}]\nSum = ${sum}, Count = ${count}\nMean = ${sum} / ${count} = ${problem.answer}`;
        } else if (numsStr.includes('Median') || problem.equation?.toLowerCase().includes('median')) {
          const sorted = [...nums].sort((a, b) => a - b);
          formula = 'Median = Middle Value (when sorted)';
          explanation = 'Arrange the numbers in order from least to greatest and select the middle number.';
          calculation = `Sorted Values: [${sorted.join(', ')}]\nMiddle Value (Index ${Math.floor(count / 2)}): ${problem.answer}`;
        } else {
          formula = 'Mode = Most Frequent Value';
          explanation = 'Look for the value that appears most often in the dataset.';
          calculation = `Values: [${nums.join(', ')}]\nValue appearing most frequently: ${problem.answer}`;
        }
        break;
      }
      case 'grammar-galaxy': {
        formula = 'Noun (thing), Verb (action), Adjective (descriptor), Adverb (describes action)';
        explanation = 'Classify the part of speech of the highlighted/underlined word in the cosmic sentence.';
        calculation = `Sentence: "${problem.sentence || ''}"\nTarget Word: "${problem.targetWord || ''}" ➔ Part of Speech: ${problem.answer}`;
        break;
      }
      case 'vocab-vault': {
        formula = 'Context + Definition Match';
        explanation = 'Match the vocabulary term or root that fits the clue description perfectly.';
        calculation = `Question: "${problem.equation}"\nEtymology Clue: "${problem.clue || ''}" ➔ Answer: "${problem.answer}"`;
        break;
      }

      /* ─── MIDDLE SCHOOL UPPER ─── */
      case 'function-forge': {
        const eqStr = problem.equation || '';
        const matchLin = eqStr.match(/f\(x\)\s*=\s*(\d+)x\s*\+\s*(\d+),\s*find f\((\d+)\)/);
        const matchQuad = eqStr.match(/f\(x\)\s*=\s*x²\s*\+\s*(\d+)x\s*\+\s*(\d+),\s*find f\((\d+)\)/);
        
        if (matchLin) {
          const a = parseInt(matchLin[1]);
          const b = parseInt(matchLin[2]);
          const x = parseInt(matchLin[3]);
          formula = 'Linear Function: f(x) = ax + b';
          explanation = 'Substitute the input value x into the linear equation and evaluate.';
          calculation = `f(${x}) = ${a}(${x}) + ${b}\n➔ f(${x}) = ${a * x} + ${b} = ${problem.answer}`;
        } else if (matchQuad) {
          const a = parseInt(matchQuad[1]);
          const b = parseInt(matchQuad[2]);
          const x = parseInt(matchQuad[3]);
          formula = 'Quadratic Function: f(x) = x² + ax + b';
          explanation = 'Substitute the input value x into the quadratic expression and evaluate.';
          calculation = `f(${x}) = (${x})² + ${a}(${x}) + ${b}\n➔ f(${x}) = ${x * x} + ${a * x} + ${b} = ${problem.answer}`;
        } else {
          formula = 'f(x) = Evaluation Rule';
          explanation = 'Substitute the input value x into the function equation and evaluate the arithmetic expression.';
          calculation = problem.equation ? `Evaluate: ${problem.equation} ➔ Answer: ${problem.answer}` : 'Evaluate f(x) for the given input.';
        }
        break;
      }
      case 'proof-quest': {
        formula = 'AND (∧): Both must be True\nOR (∨): At least one must be True';
        explanation = 'Verify structural proofs or boolean logic gates to determine the truth value.';
        calculation = `Logic query: "${problem.equation}"\nLogical Rule: "${problem.logic || ''}" ➔ Answer: "${problem.answer}"`;
        break;
      }
      case 'probability-pinball': {
        const eqStr = problem.equation || '';
        const dieMatch = eqStr.match(/greater than (\d+)/);
        
        if (dieMatch) {
          const side = parseInt(dieMatch[1]);
          formula = 'P(Event) = Favorable Outcomes / Total Outcomes';
          explanation = 'A standard 6-sided die has 6 outcomes. Count how many outcomes are favorable.';
          calculation = `Numbers greater than ${side}: [${Array.from({ length: 6 - side }, (_, i) => side + 1 + i).join(', ')}] (count = ${6 - side})\nTotal outcomes: 6\nProbability = ${6 - side} / 6 = ${problem.answer}`;
        } else {
          formula = 'P(A and B) = P(A) × P(B) [Independent Events]';
          explanation = 'For independent events in succession, multiply the probability of each event.';
          calculation = `Flipping Heads twice:\n➔ P(Heads 1st) = 1/2\n➔ P(Heads 2nd) = 1/2\n➔ P(Two Heads) = 1/2 × 1/2 = 1/4`;
        }
        break;
      }
      case 'coordinate-clash': {
        const p1 = problem.p1 || [3, 2];
        const p2 = problem.p2 || [-2, -3];
        
        if (problem.type === 'distance') {
          formula = 'Distance d = √((x2 - x1)² + (y2 - y1)²)';
          explanation = 'Subtract x-coordinates and square the result. Do the same for y-coordinates. Add them, then take the square root.';
          calculation = `P1: (${p1[0]}, ${p1[1]}) , P2: (${p2[0]}, ${p2[1]})\nd = √(({p2[0]} - {p1[0]})² + ({p2[1]} - {p1[1]})²)\nd = √((${p2[0] - p1[0]})² + (${p2[1] - p1[1]})²)\nd = √(${(p2[0] - p1[0]) ** 2} + ${(p2[1] - p1[1]) ** 2})\nd = √(${(p2[0] - p1[0]) ** 2 + (p2[1] - p1[1]) ** 2}) = ${problem.answer}`;
        } else {
          formula = 'Slope m = (y2 - y1) / (x2 - x1)';
          explanation = 'Calculate the rise (change in y) divided by the run (change in x).';
          calculation = `P1: (${p1[0]}, ${p1[1]}) , P2: (${p2[0]}, ${p2[1]})\nm = (${p2[1]} - ${p1[1]}) / (${p2[0]} - ${p1[0]})\nm = ${p2[1] - p1[1]} / ${p2[0] - p1[0]} = ${problem.answer}`;
        }
        break;
      }
      case 'essay-engine': {
        formula = 'Hook ➔ Thesis ➔ Evidence ➔ Analysis ➔ Restatement';
        explanation = 'Make sure sections flow logically: Introduction states thesis, Body gives evidence, Conclusion summarizes.';
        calculation = problem.hint ? `Tip: ${problem.hint}` : 'Writing organization hierarchy.';
        break;
      }
      case 'rhetoric-arena': {
        formula = 'Ethos (Trust/Authority)\nLogos (Logic/Reasoning)\nPathos (Emotion/Values)';
        explanation = 'Identify which persuasive appeal the speaker is exploiting in the given argument passage.';
        calculation = `Argument: "${problem.equation}" ➔ Appeal: ${problem.answer}`;
        break;
      }

      /* ─── HIGH SCHOOL ─── */
      case 'trig-tower': {
        const eqStr = problem.equation || '';
        formula = 'sin(θ) = Opp / Hyp\ncos(θ) = Adj / Hyp\ntan(θ) = Opp / Adj';
        explanation = 'Look up the trig ratio for the given angle on the unit circle (using degrees or radians).';
        
        let explanationText = 'Use special right triangles (30-60-90 or 45-45-90) or the Unit Circle.';
        if (eqStr.includes('30°')) {
          explanationText = 'For 30°, the coordinates are (√3/2, 1/2). sin(30°) is the y-coordinate (1/2).';
        } else if (eqStr.includes('60°')) {
          explanationText = 'For 60°, the coordinates are (1/2, √3/2). cos(60°) is the x-coordinate (1/2).';
        } else if (eqStr.includes('45°')) {
          explanationText = 'For 45°, sin and cos are √2/2. tan(45°) = sin/cos = 1.';
        } else if (eqStr.includes('π/2')) {
          explanationText = 'π/2 radians corresponds to 90°. The coordinates are (0, 1). sin(π/2) = 1.';
        } else if (eqStr.includes('π')) {
          explanationText = 'π radians corresponds to 180°. The coordinates are (-1, 0). cos(π) = -1.';
        }
        
        explanation = explanationText;
        calculation = `${eqStr} = ${problem.answer}`;
        break;
      }
      case 'matrix-maze': {
        formula = 'Determinant of [[a, b], [c, d]] = ad - bc';
        explanation = 'Multiply the main diagonal elements (a × d) and subtract the product of secondary diagonal elements (b × c).';
        
        let mStr = problem.matrixStr || '[[1, 2], [3, 4]]';
        const match = mStr.match(/\[\[(\d+),\s*(\d+)\],\s*\[(\d+),\s*(\d+)\]\]/);
        if (match) {
          const a = parseInt(match[1]);
          const b = parseInt(match[2]);
          const c = parseInt(match[3]);
          const d = parseInt(match[4]);
          calculation = `Matrix = [[${a}, ${b}], [${c}, ${d}]]\nDet = (${a} × ${d}) - (${b} × ${c}) = ${a * d} - ${b * c} = ${a * d - b * c}`;
        } else {
          calculation = `Det = ad - bc = ${problem.answer}`;
        }
        break;
      }
      case 'limit-launcher': {
        const eqStr = problem.equation || '';
        if (eqStr.startsWith('d/dx')) {
          formula = 'Power Rule: d/dx [x^n] = n × x^(n-1)';
          explanation = 'To find the derivative of x^n, multiply the term by its exponent, then subtract 1 from the power.';
          
          let steps = '';
          if (eqStr.includes('x² + 5x')) steps = 'd/dx [x²] + d/dx [5x] = 2x + 5';
          else if (eqStr.includes('3x²')) steps = '3 × d/dx [x²] = 3 × 2x = 6x';
          else if (eqStr.includes('x³')) steps = '3 × x^(3-1) = 3x²';
          
          calculation = `Solve derivative:\n➔ ${eqStr}\n➔ ${steps || problem.answer}`;
        } else {
          formula = 'lim (x ➔ c) f(x) = f(c)';
          explanation = 'Attempt direct substitution. Substitute the value that x approaches directly into the function.';
          
          let steps = '';
          if (eqStr.includes('x² - 2x') && eqStr.includes('3')) steps = '(3)² - 2(3) = 9 - 6 = 3';
          else if (eqStr.includes('3x + 1') && eqStr.includes('2')) steps = '3(2) + 1 = 6 + 1 = 7';
          else if (eqStr.includes('x³ + x') && eqStr.includes('1')) steps = '(1)³ + (1) = 1 + 1 = 2';
          
          calculation = `Evaluate limit:\n➔ ${eqStr}\n➔ Substitution: ${steps || problem.answer}`;
        }
        break;
      }
      case 'stats-showdown': {
        // Parse x, mu, sigma if possible
        const eqStr = problem.equation || '';
        const match = eqStr.match(/x\s*=\s*(\d+)\s*given mu\s*=\s*(\d+)\s*and sigma\s*=\s*(\d+)/);
        
        formula = 'Z-Score: Z = (X - μ) / σ';
        explanation = 'Standardize the raw value X by subtracting the population mean μ, then dividing by the standard deviation σ.';
        
        if (match) {
          const x = parseInt(match[1]);
          const mu = parseInt(match[2]);
          const sigma = parseInt(match[3]);
          calculation = `X = ${x}, μ = ${mu}, σ = ${sigma}\nZ = (${x} - ${mu}) / ${sigma}\nZ = ${x - mu} / ${sigma} = ${((x - mu) / sigma).toFixed(1)}`;
        } else {
          calculation = `Z = (130 - 100) / 15 = 30 / 15 = ${problem.answer}`;
        }
        break;
      }
      case 'lit-labyrinth': {
        formula = 'Narrative Perspective & Literary Devices';
        explanation = 'Analyze narrative voice (1st, 2nd, 3rd person), tone, irony, metaphors, or themes in the literary passage.';
        calculation = `Read passage: "${problem.equation}" ➔ device/point of view is "${problem.answer}"`;
        break;
      }
      case 'debate-dojo': {
        formula = 'Fallacy Identification';
        explanation = 'Recognize flaws in reasoning such as Ad Hominem (personal attack), Strawman, or Slippery Slope.';
        calculation = `Statement: "${problem.equation}" ➔ Fallacy: ${problem.answer}`;
        break;
      }

      /* ─── UNIVERSITY ─── */
      case 'calculus-cascade': {
        const eqStr = problem.equation || '';
        if (eqStr.includes('∫')) {
          formula = 'Power Rule for Integration: ∫ x^n dx = (x^(n+1)) / (n+1) + C';
          explanation = 'To integrate x^n, add 1 to the exponent, then divide by the new exponent.';
          
          let steps = '';
          if (eqStr.includes('x²')) steps = 'x^(2+1) / (2+1) + C = x³/3 + C';
          else if (eqStr.includes('sin(x)')) steps = 'Anti-derivative of sin(x) is -cos(x) + C';
          
          calculation = `Evaluate Integral:\n➔ ${eqStr}\n➔ ${steps || problem.answer}`;
        } else if (eqStr.includes('d/dx')) {
          formula = 'Derivative Formulas: d/dx [ln(x)] = 1/x\nd/dx [e^(ax)] = a × e^(ax)';
          explanation = 'Apply standard differentiation rules for natural logarithms and exponential functions.';
          
          let steps = '';
          if (eqStr.includes('ln(x)')) steps = 'd/dx [ln(x)] = 1/x';
          else if (eqStr.includes('e^(2x)')) steps = 'Chain Rule: e^(2x) × d/dx [2x] = 2e^(2x)';
          
          calculation = `Evaluate Derivative:\n➔ ${eqStr}\n➔ ${steps || problem.answer}`;
        } else {
          formula = 'p-series Test: Σ 1/n^p converges if p > 1, diverges if p ≤ 1';
          explanation = 'Examine the exponent p of n in the denominator to check convergence.';
          
          let reason = '';
          if (eqStr.includes('1/n²')) reason = 'p = 2 > 1, so it converges.';
          else if (eqStr.includes('1/2^n')) reason = 'Geometric series with ratio r = 1/2 < 1, so it converges.';
          else if (eqStr.includes('1/n')) reason = 'p = 1 ≤ 1 (Harmonic Series), so it diverges.';
          
          calculation = `Evaluate Series:\n➔ ${eqStr}\n➔ Result: ${problem.answer}\n➔ Reason: ${reason}`;
        }
        break;
      }
      case 'proof-architect': {
        formula = 'Induction: Prove base case, assume k, prove k+1.\nContrapositive: p ➔ q ≡ ¬q ➔ ¬p\nContradiction: Assume ¬p ➔ Contradiction.';
        explanation = 'Choose the mathematical proof framework that builds the logical architecture.';
        
        let steps = '';
        if (problem.answer === 'Mathematical Induction') steps = 'Standard for proving statements P(n) for all integers n.';
        else if (problem.answer === 'Proof by Contrapositive') steps = 'Proving the equivalent negated reverse implication.';
        else if (problem.answer === 'Proof by Contradiction') steps = 'Showing the assumption that the claim is false leads to an impossibility.';
        
        calculation = `Question: "${problem.equation}"\nMethod: "${problem.answer}"\nArchitecture: ${steps}`;
        break;
      }
      case 'abstract-arena': {
        formula = 'Group Axioms:\nClosure: a * b ∈ G\nAssociativity: a * (b * c) = (a * b) * c\nIdentity: a * e = e * a = a';
        explanation = 'Verify if the given mathematical set and binary operation satisfy the fundamental axioms of a Group.';
        calculation = `Axiom query: "${problem.equation}"\nGroup Property: "${problem.answer}"\nDetails: ${problem.groupProps || ''}`;
        break;
      }
      case 'diff-eq-duel': {
        const eqStr = problem.equation || '';
        if (eqStr.includes('dy/dx = 2x')) {
          formula = 'Separable 1st Order ODE: dy = 2x dx';
          explanation = 'Integrate both sides of the separated equation: ∫ dy = ∫ 2x dx.';
          calculation = `dy/dx = 2x ➔ y = ∫ 2x dx = x² + C`;
        } else if (eqStr.includes('dy/dx = y')) {
          formula = 'Separable 1st Order Linear ODE: (1/y) dy = dx';
          explanation = 'Integrate both sides: ln|y| = x + C1 ➔ y = e^(x + C1) = Ce^x.';
          calculation = `dy/dx = y ➔ y = Ce^x`;
        } else {
          formula = '2nd Order Homogeneous ODE: y" + y = 0';
          explanation = 'Solve the auxiliary equation: r² + 1 = 0 ➔ r = ±i. General solution is y = A cos(x) + B sin(x).';
          calculation = `d²y/dx² + y = 0 ➔ auxiliary r² + 1 = 0 ➔ y = A cos(x) + B sin(x)`;
        }
        break;
      }
      case 'thesis-forge': {
        formula = 'APA: (Author, Year)\nMLA: (Author Page)\nChicago: Footnote notations';
        explanation = 'Determine the bibliography and in-text citation styling rules for scientific publishing.';
        calculation = `Cite style check for "${problem.equation}" ➔ Style is ${problem.answer}`;
        break;
      }
      case 'critical-lens': {
        formula = 'Critical Theory Frameworks:\nMarxist (wealth/class), Feminist (gender), Deconstruction (contradictions)';
        explanation = 'Apply the specified literary theory lens to critique structural power dynamics in the passage.';
        calculation = `Critique: "${problem.equation}" ➔ Analytical lens: ${problem.answer}`;
        break;
      }

      /* ─── DEFAULT FALLBACK ─── */
      default: {
        formula = 'Educational Rule / Concept';
        explanation = 'Analyze the question parameters carefully and pick the correct option.';
        calculation = problem.equation ? `Problem: ${problem.equation}` : '';
        break;
      }
    }

    return { formula, explanation, calculation };
  }, [slug, problem]);

  if (!hintData || !hintData.formula) return null;

  return (
    <div className="w-full mt-4 select-none">
      {/* Toggle button header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 active:bg-white/15 transition-all text-left group"
      >
        <span className="flex items-center gap-2 font-display text-sm font-bold text-yellow-300 group-hover:text-yellow-200">
          <span>💡</span> HINT
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/40 text-sm font-bold"
        >
          ▼
        </motion.span>
      </button>

      {/* Expandable Content Container */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-2.5 p-5 rounded-2xl bg-[#0d1528]/80 backdrop-blur-md border border-yellow-500/25 flex flex-col gap-3 shadow-xl shadow-black/35">
              
              {/* Formula Section */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-yellow-400 uppercase tracking-widest">Formula / Concept:</span>
                <pre className="p-3 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-white leading-relaxed whitespace-pre-wrap">
                  {hintData.formula}
                </pre>
              </div>

              {/* Explanation Section */}
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-extrabold text-cyan-400 uppercase tracking-widest">Explanation:</span>
                <p className="text-xs text-white/75 leading-relaxed font-semibold">
                  {hintData.explanation}
                </p>
              </div>

              {/* Dynamic Calculation Section (only if available) */}
              {hintData.calculation && (
                <div className="flex flex-col gap-1 border-t border-white/5 pt-2 mt-1">
                  <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-widest">Active Calculation:</span>
                  <pre className="p-2.5 bg-black/40 rounded-xl border border-white/5 font-mono text-xs text-emerald-300 whitespace-pre-wrap">
                    {hintData.calculation}
                  </pre>
                </div>
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
