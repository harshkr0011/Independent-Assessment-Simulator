/**
 * Reusable Quick Math Expression Generator & Validator
 * Supports Levels 1-5:
 * Level 1: Single operations (+, -), small integers
 * Level 2: Multiplication/division (×, ÷), larger integers
 * Level 3: Fractions & Decimals
 * Level 4: Parentheses & PEMDAS
 * Level 5: Tricky distractors, close values, mixed operations
 */

import { getGlobalRng } from '../../services/seedRng.js';

function formatFractionHTML(num, den) {
  return `<span class="inline-flex flex-col text-center align-middle mx-1"><span class="border-b-2 border-slate-900 pb-0.5 px-1 font-semibold">${num}</span><span class="pt-0.5 px-1 font-semibold">${den}</span></span>`;
}

export function generateSingleExpression(difficulty = 1, rng = getGlobalRng()) {
  const opPool = [];

  if (difficulty === 1) {
    opPool.push('add', 'sub');
  } else if (difficulty === 2) {
    opPool.push('add', 'sub', 'mult', 'div');
  } else if (difficulty === 3) {
    opPool.push('add', 'sub', 'mult', 'div', 'frac', 'dec');
  } else if (difficulty === 4) {
    opPool.push('mult', 'div', 'frac', 'dec', 'pemdas');
  } else {
    opPool.push('add', 'sub', 'mult', 'div', 'frac', 'dec', 'pemdas', 'mod');
  }

  const type = rng.choice(opPool);

  if (type === 'add') {
    const range = difficulty * 15;
    const a = rng.nextInt(-range, range);
    const b = rng.nextInt(1, range);
    const val = a + b;
    const display = b < 0 ? `${a} + (${b})` : `${a} + ${b}`;
    return { html: display, rawText: display, value: val };
  } else if (type === 'sub') {
    const range = difficulty * 15;
    const a = rng.nextInt(-range, range);
    const b = rng.nextInt(1, range);
    const val = a - b;
    const display = b < 0 ? `${a} - (${b})` : `${a} - ${b}`;
    return { html: display, rawText: display, value: val };
  } else if (type === 'mult') {
    const a = rng.nextInt(-10, 12);
    const b = rng.nextInt(-10, 12);
    const val = a * b;
    const display = b < 0 ? `${a} × (${b})` : `${a} × ${b}`;
    return { html: display, rawText: display, value: val };
  } else if (type === 'div') {
    const b = rng.choice([-8, -6, -5, -4, -3, -2, 2, 3, 4, 5, 6, 8]);
    const mult = rng.nextInt(-8, 12);
    const a = b * mult;
    const val = mult;
    const display = b < 0 ? `${a} ÷ (${b})` : `${a} ÷ ${b}`;
    return { html: display, rawText: display, value: val };
  } else if (type === 'frac') {
    const den = rng.choice([3, 4, 5, 6, 7, 8, 9, 10]);
    let num = rng.nextInt(1, den - 1);
    const isNeg = rng.next() < 0.2;
    if (isNeg) num = -num;
    const val = parseFloat((num / den).toFixed(3));
    const htmlStr = isNeg ? `-${formatFractionHTML(Math.abs(num), den)}` : formatFractionHTML(num, den);
    const rawText = `${num}/${den}`;
    return { html: htmlStr, rawText: rawText, value: val };
  } else if (type === 'dec') {
    const val = parseFloat(((rng.next() * 3 - 1.5)).toFixed(2));
    const rawText = val.toString();
    return { html: rawText, rawText: rawText, value: val };
  } else if (type === 'mod') {
    const a = rng.nextInt(12, 50);
    const b = rng.choice([3, 4, 5, 6, 7, 8, 9]);
    const val = a % b;
    const display = `${a} % ${b}`;
    return { html: display, rawText: display, value: val };
  } else {
    // PEMDAS / Parentheses
    const pattern = rng.nextInt(1, 3);
    if (pattern === 1) {
      const a = rng.nextInt(2, 8);
      const b = rng.nextInt(1, 8);
      const c = rng.nextInt(2, 4);
      const val = (a + b) * c;
      const display = `(${a} + ${b}) × ${c}`;
      return { html: display, rawText: display, value: val };
    } else if (pattern === 2) {
      const a = rng.nextInt(-10, 15);
      const b = rng.nextInt(2, 6);
      const c = rng.nextInt(2, 5);
      const val = a + (b * c);
      const display = a < 0 ? `(${a}) + (${b} × ${c})` : `${a} + (${b} × ${c})`;
      return { html: display, rawText: display, value: val };
    } else {
      const a = rng.nextInt(10, 30);
      const b = rng.nextInt(2, 8);
      const c = rng.nextInt(2, 4);
      const val = (a - b) * c;
      const display = `(${a} - ${b}) × ${c}`;
      return { html: display, rawText: display, value: val };
    }
  }
}

/**
 * Generates a complete Quick Math Question with `count` distinct bubbles.
 * Guarantees distinct values for deterministic ascending selection.
 */
export function generateQuestion(difficulty = 1, bubbleCount = 3, rng = getGlobalRng()) {
  const expressions = [];
  let attempts = 0;

  while (expressions.length < bubbleCount && attempts < 200) {
    attempts++;
    const expr = generateSingleExpression(difficulty, rng);
    
    // Ensure distinct numeric value (diff > 0.01) to prevent tie ambiguity
    const isDuplicateValue = expressions.some(
      existing => Math.abs(existing.value - expr.value) < 0.01
    );

    if (!isDuplicateValue) {
      expressions.push({
        id: `expr_${expressions.length}_${Math.random().toString(36).substring(2, 6)}`,
        ...expr
      });
    }
  }

  // Calculate deterministic ascending order of indices
  const indexed = expressions.map((expr, idx) => ({ ...expr, originalIndex: idx }));
  indexed.sort((a, b) => a.value - b.value);

  const targetOrder = indexed.map(item => item.originalIndex);

  return {
    expressions,
    targetOrder,
    sortedExpressions: indexed,
    difficulty
  };
}

export function generateTestPaper(questionCount = 25, difficulty = 1, bubbleCount = 3, rng = getGlobalRng()) {
  const paper = [];
  for (let i = 0; i < questionCount; i++) {
    paper.push(generateQuestion(difficulty, bubbleCount, rng));
  }
  return paper;
}
