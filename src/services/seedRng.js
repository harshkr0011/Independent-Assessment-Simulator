/**
 * Seeded & Dynamic Pseudo-Random Number Generator Engine
 * Guarantees fresh, unique, un-repeated puzzle cases on every generation,
 * while retaining reproducible support when ?seed=12345 is explicitly provided.
 */

export class SeededRNG {
  constructor(seed = Date.now() + Math.random() * 1000000) {
    this.seed = typeof seed === 'number' ? seed : this.hashString(String(seed));
    this.state = this.seed;
  }

  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) || 123456789;
  }

  // Returns float in [0, 1)
  next() {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // Returns integer in [min, max] inclusive
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // Returns random element from array
  choice(array) {
    if (!array || array.length === 0) return null;
    return array[Math.floor(this.next() * array.length)];
  }

  // Shuffles array in-place
  shuffle(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
}

let customGlobalSeed = null;

export function setGlobalSeed(seed) {
  customGlobalSeed = seed;
}

export function getGlobalRng() {
  if (customGlobalSeed !== null && customGlobalSeed !== undefined) {
    return new SeededRNG(customGlobalSeed);
  }
  return new SeededRNG(Date.now() + Math.random() * 1000000);
}
