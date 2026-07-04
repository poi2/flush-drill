import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { parseJsonl, buildDictionary, primaryReading } from '../src/kanji/parse.mjs';
import { makeRng } from '../src/kanji/random.mjs';
import {
  generateKanjiToReading,
  generateReadingToKanji,
  generateSentenceReading,
  KANJI_MODES,
} from '../src/kanji/generator.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const JSONL_PATH = resolve(__dirname, '../kanji.jsonl');

async function loadDictionary() {
  const text = await readFile(JSONL_PATH, 'utf8');
  return buildDictionary(parseJsonl(text));
}

test('parseJsonl loads all 80 entries', async () => {
  const dict = await loadDictionary();
  assert.equal(dict.entries.length, 80);
  assert.equal(dict.byChar.size, 80);
});

test('every entry has at least one primary reading', async () => {
  const dict = await loadDictionary();
  for (const e of dict.entries) {
    const p = primaryReading(e);
    assert.ok(p, `entry ${e.kanji} has no primary reading`);
    assert.equal(p.primary, true);
  }
});

test('generateKanjiToReading returns 4 choices with correct answer at answerIndex', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('山');
  const problem = generateKanjiToReading(entry, dict, makeRng(1));
  assert.equal(problem.type, 'choice');
  assert.equal(problem.subtype, 'kanji-to-reading');
  assert.equal(problem.question, '山');
  assert.equal(problem.choices.length, 4);
  assert.equal(problem.choices[problem.answerIndex], 'やま');
});

test('generateReadingToKanji returns 4 choices with correct answer at answerIndex', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('山');
  const problem = generateReadingToKanji(entry, dict, makeRng(1));
  assert.equal(problem.subtype, 'reading-to-kanji');
  assert.equal(problem.question, 'やま');
  assert.equal(problem.choices.length, 4);
  assert.equal(problem.choices[problem.answerIndex], '山');
});

test('generateSentenceReading picks an example and asks about its target', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('山');
  const problem = generateSentenceReading(entry, dict, makeRng(1));
  assert.equal(problem.type, 'sentence');
  assert.equal(problem.subtype, 'sentence-reading');
  assert.ok(entry.examples.some((ex) => ex.text === problem.sentence));
  assert.equal(problem.target, '山');
  assert.equal(problem.choices[problem.answerIndex], 'やま');
});

test('distractors are drawn from similar entries when possible', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('山'); // no okurigana
  const similarReadings = new Set(
    entry.similar
      .map((c) => primaryReading(dict.byChar.get(c)))
      .filter(Boolean)
      .map((r) => r.value),
  );
  const problem = generateKanjiToReading(entry, dict, makeRng(42));
  const distractors = problem.choices.filter((_, i) => i !== problem.answerIndex);
  for (const d of distractors) {
    assert.ok(
      similarReadings.has(d),
      `distractor ${d} should come from similar readings ${[...similarReadings].join(',')}`,
    );
  }

  const problem2 = generateReadingToKanji(entry, dict, makeRng(42));
  const similarKanji = new Set(entry.similar);
  const distractors2 = problem2.choices.filter((_, i) => i !== problem2.answerIndex);
  for (const d of distractors2) {
    assert.ok(similarKanji.has(d), `distractor ${d} should come from similar kanji`);
  }
});

test('okurigana: kanji-to-reading question and choices carry the okurigana', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('正');
  const p = generateKanjiToReading(entry, dict, makeRng(1));
  assert.equal(p.question, '正しい');
  assert.equal(p.choices[p.answerIndex], 'ただしい');
  for (const c of p.choices) {
    assert.ok(c.endsWith('しい'), `expected all choices to end with しい, got ${c}`);
  }
});

test('okurigana: reading-to-kanji question and choices carry the okurigana', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('正');
  const p = generateReadingToKanji(entry, dict, makeRng(1));
  assert.equal(p.question, 'ただしい');
  assert.equal(p.choices[p.answerIndex], '正しい');
  for (const c of p.choices) {
    assert.ok(c.endsWith('しい'), `expected all choices to end with しい, got ${c}`);
  }
});

test('okurigana: reading-to-kanji distractors are similar kanji + same okurigana', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('正');
  const p = generateReadingToKanji(entry, dict, makeRng(1));
  const distractors = p.choices.filter((_, i) => i !== p.answerIndex);
  const expectedForms = new Set(entry.similar.map((c) => c + 'しい'));
  for (const d of distractors) {
    assert.ok(expectedForms.has(d), `distractor ${d} not in ${[...expectedForms].join(',')}`);
  }
});

test('okurigana: no-okurigana entries keep the plain form', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('山');
  const p1 = generateKanjiToReading(entry, dict, makeRng(1));
  assert.equal(p1.question, '山');
  assert.equal(p1.choices[p1.answerIndex], 'やま');
  const p2 = generateReadingToKanji(entry, dict, makeRng(1));
  assert.equal(p2.question, 'やま');
  assert.equal(p2.choices[p2.answerIndex], '山');
});

test('sentence-reading: uses word form when the sentence contains it', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('正');
  // seed until we pick the "正しい答え。" example
  for (let seed = 0; seed < 50; seed++) {
    const p = generateSentenceReading(entry, dict, makeRng(seed));
    if (p.sentence === '正しい答え。') {
      assert.equal(p.target, '正しい');
      assert.equal(p.choices[p.answerIndex], 'ただしい');
      return;
    }
  }
  assert.fail('did not find the 正しい example within 50 seeds');
});

test('sentence-reading: falls back to bare kanji when sentence does not contain the primary word form', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('正');
  for (let seed = 0; seed < 50; seed++) {
    const p = generateSentenceReading(entry, dict, makeRng(seed));
    if (p.sentence === '正しく書く。') {
      assert.equal(p.target, '正');
      assert.equal(p.choices[p.answerIndex], 'ただ');
      return;
    }
  }
  assert.fail('did not find the 正しく example within 50 seeds');
});

test('kanji-to-reading correct answer is always the entry primary reading form', async () => {
  const dict = await loadDictionary();
  const rng = makeRng(7);
  for (const e of dict.entries) {
    const p = generateKanjiToReading(e, dict, rng);
    const primary = primaryReading(e);
    const expected = primary.value + (primary.okurigana ?? '');
    assert.equal(p.choices[p.answerIndex], expected, `wrong correct for ${e.kanji}`);
  }
});

test('kanji-to-reading distractors are all valid reading forms of some entry', async () => {
  const dict = await loadDictionary();
  // A reading form = value + (okurigana ?? '') for any reading of any entry.
  const validForms = new Set();
  for (const e of dict.entries) {
    for (const r of e.readings) validForms.add(r.value + (r.okurigana ?? ''));
  }
  const rng = makeRng(7);
  for (const e of dict.entries) {
    const primary = primaryReading(e);
    const okuri = primary.okurigana ?? '';
    const p = generateKanjiToReading(e, dict, rng);
    for (const c of p.choices) {
      // Either the choice is a valid reading form as-is (from a matching okurigana entry),
      // or it's a primary-value + this-entry's-okurigana pseudo-form.
      const stem = okuri && c.endsWith(okuri) ? c.slice(0, -okuri.length) : c;
      const primaryValues = new Set(dict.entries.map((x) => primaryReading(x).value));
      const ok = validForms.has(c) || primaryValues.has(stem);
      assert.ok(ok, `unexpected distractor "${c}" for ${e.kanji}`);
    }
  }
});

test('sentence-reading: target appears exactly once in the sentence (no ambiguous underline)', async () => {
  const dict = await loadDictionary();
  for (const e of dict.entries) {
    for (const ex of e.examples) {
      const baseReading = ex.reading ?? primaryReading(e);
      const wordForm = ex.target + (baseReading?.okurigana ?? '');
      const useWordForm = !!baseReading?.okurigana && ex.text.includes(wordForm);
      const shown = useWordForm ? wordForm : ex.target;
      const parts = ex.text.split(shown);
      const occ = parts.length - 1;
      // If shown is the wordForm (with okurigana), extra bare-target chars in text are fine
      // because the UI only highlights `shown`. But bare targets outside wordForm are ambiguous
      // when we're showing just the bare target.
      if (!useWordForm) {
        assert.equal(occ, 1, `${e.kanji} example "${ex.text}": bare target appears ${occ}x`);
      } else {
        assert.ok(occ >= 1, `${e.kanji} example "${ex.text}": wordForm ${wordForm} not found`);
      }
    }
  }
});

test('sentence-reading uses example.reading when specified', async () => {
  const dict = await loadDictionary();
  for (const e of dict.entries) {
    for (let seed = 0; seed < 30; seed++) {
      const p = generateSentenceReading(e, dict, makeRng(seed));
      const ex = e.examples.find((x) => x.text === p.sentence);
      const baseReading = ex.reading ?? primaryReading(e);
      const wordForm = ex.target + (baseReading.okurigana ?? '');
      const useWordForm = !!baseReading.okurigana && ex.text.includes(wordForm);
      const expected = baseReading.value + (useWordForm ? baseReading.okurigana : '');
      assert.equal(p.choices[p.answerIndex], expected, `wrong correct for ${e.kanji} / ${p.sentence}`);
    }
  }
});

test('generateSentenceReading eventually picks each example (random selection)', async () => {
  const dict = await loadDictionary();
  const entry = dict.byChar.get('一');
  const texts = new Set(entry.examples.map((ex) => ex.text));
  const seen = new Set();
  for (let seed = 0; seed < 100; seed++) {
    const p = generateSentenceReading(entry, dict, makeRng(seed));
    seen.add(p.sentence);
    if (seen.size === texts.size) break;
  }
  assert.equal(seen.size, texts.size, `expected all ${texts.size} examples to be seen, got ${seen.size}`);
});

test('all 80 entries can generate problems for every mode', async () => {
  const dict = await loadDictionary();
  const rng = makeRng(123);
  for (const entry of dict.entries) {
    for (const kind of KANJI_MODES) {
      const gen = {
        'kanji-to-reading': generateKanjiToReading,
        'reading-to-kanji': generateReadingToKanji,
        'sentence-reading': generateSentenceReading,
      }[kind];
      const p = gen(entry, dict, rng);
      assert.equal(p.choices.length, 4, `${kind} for ${entry.kanji}: expected 4 choices`);
      assert.ok(p.answerIndex >= 0 && p.answerIndex < 4, `${kind} for ${entry.kanji}: answerIndex out of range`);
      const uniq = new Set(p.choices);
      assert.equal(uniq.size, 4, `${kind} for ${entry.kanji}: choices contain duplicates: ${p.choices.join(',')}`);
    }
  }
});

test('makeRng is deterministic across runs', () => {
  const a = makeRng(1);
  const b = makeRng(1);
  for (let i = 0; i < 10; i++) {
    assert.equal(a(), b());
  }
});
