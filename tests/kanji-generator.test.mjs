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
  const entry = dict.byChar.get('山');
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

test('primary=false readings are never used as correct or distractor (10級 constraint)', async () => {
  const dict = await loadDictionary();
  const nonPrimary = new Set();
  for (const e of dict.entries) {
    for (const r of e.readings) {
      if (!r.primary) nonPrimary.add(r.value);
    }
  }
  const rng = makeRng(7);
  for (const e of dict.entries) {
    for (const kind of ['kanji-to-reading', 'sentence-reading']) {
      const gen = kind === 'kanji-to-reading' ? generateKanjiToReading : generateSentenceReading;
      const p = gen(e, dict, rng);
      for (const choice of p.choices) {
        assert.ok(
          !nonPrimary.has(choice),
          `non-primary reading "${choice}" leaked into ${kind} for ${e.kanji}`,
        );
      }
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
