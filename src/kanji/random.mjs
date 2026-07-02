/**
 * mulberry32 — a deterministic 32bit PRNG used for testability.
 * @param {number} seed
 * @returns {() => number} function returning a number in [0, 1)
 */
export function makeRng(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6D2B79F5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Pick one element from an array using rng.
 * @template T
 * @param {T[]} arr
 * @param {() => number} rng
 * @returns {T}
 */
export function pickRandom(arr, rng = Math.random) {
  if (arr.length === 0) throw new Error('pickRandom: empty array');
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Return a shuffled copy of arr using Fisher-Yates.
 * @template T
 * @param {T[]} arr
 * @param {() => number} rng
 * @returns {T[]}
 */
export function shuffle(arr, rng = Math.random) {
  const result = arr.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Return up to n unique elements sampled from arr.
 * @template T
 * @param {T[]} arr
 * @param {number} n
 * @param {() => number} rng
 * @returns {T[]}
 */
export function sample(arr, n, rng = Math.random) {
  return shuffle(arr, rng).slice(0, n);
}
