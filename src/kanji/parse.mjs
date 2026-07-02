/**
 * @typedef {Object} Reading
 * @property {string} value    stem reading (e.g. "ただ" for 正しい)
 * @property {string} [okurigana]  hiragana suffix that combines with the stem
 * @property {"kun" | "on"} type
 * @property {boolean} primary
 */

/**
 * @typedef {Object} Example
 * @property {string} text
 * @property {string} target
 */

/**
 * @typedef {Object} KanjiEntry
 * @property {string} kanji
 * @property {number} grade
 * @property {Reading[]} readings
 * @property {string} meaning
 * @property {Example[]} examples
 * @property {string[]} similar
 * @property {string[]} tags
 */

/**
 * @typedef {Object} Dictionary
 * @property {KanjiEntry[]} entries
 * @property {Map<string, KanjiEntry>} byChar
 */

/**
 * Parse a JSONL string into KanjiEntry records.
 * @param {string} text
 * @returns {KanjiEntry[]}
 */
export function parseJsonl(text) {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => JSON.parse(line));
}

/**
 * Build a Dictionary keyed by kanji character.
 * @param {KanjiEntry[]} entries
 * @returns {Dictionary}
 */
export function buildDictionary(entries) {
  const byChar = new Map();
  for (const entry of entries) {
    byChar.set(entry.kanji, entry);
  }
  return { entries, byChar };
}

/**
 * Return the primary reading of an entry, or null if none exists.
 * @param {KanjiEntry} entry
 * @returns {Reading | null}
 */
export function primaryReading(entry) {
  return entry.readings.find((r) => r.primary) ?? null;
}
