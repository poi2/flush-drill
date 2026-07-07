import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeRng } from '../src/kanji/random.mjs';
import { KANA_PAIRS } from '../src/kokugo/kana-data.mjs';
import { ANTONYM_PAIRS } from '../src/kokugo/antonym-data.mjs';
import {
  generateHiraToKata,
  generateKataToHira,
  generateAntonym,
} from '../src/kokugo/generator.mjs';

function assertChoiceShape(p, subtype) {
  assert.equal(p.subtype, subtype);
  assert.equal(p.choices.length, 4);
  assert.ok(Number.isInteger(p.answerIndex));
  assert.ok(p.answerIndex >= 0 && p.answerIndex < 4);
  assert.equal(new Set(p.choices).size, 4, 'choices must be unique');
}

test('KANA_PAIRS has no duplicate hiragana or katakana', () => {
  const h = new Set(), k = new Set();
  for (const [hi, ka] of KANA_PAIRS) {
    assert.ok(!h.has(hi), `duplicate hira: ${hi}`);
    assert.ok(!k.has(ka), `duplicate kata: ${ka}`);
    h.add(hi); k.add(ka);
  }
});

test('ANTONYM_PAIRS: 各語がリスト全体で一意（片方の語で複数ペアに登場しない）', () => {
  const seen = new Set();
  for (const [a, b] of ANTONYM_PAIRS) {
    assert.ok(!seen.has(a), `duplicated word appears in multiple pairs: ${a}`);
    assert.ok(!seen.has(b), `duplicated word appears in multiple pairs: ${b}`);
    seen.add(a); seen.add(b);
  }
});

test('generateHiraToKata: 問題がひらがな、正解が対応するカタカナ', () => {
  const rng = makeRng(1);
  for (let i = 0; i < 30; i++) {
    const p = generateHiraToKata(rng);
    assertChoiceShape(p, 'hira-to-kata');
    const pair = KANA_PAIRS.find(([h]) => h === p.question);
    assert.ok(pair, `question must be a known hiragana: ${p.question}`);
    assert.equal(p.choices[p.answerIndex], pair[1]);
  }
});

test('generateKataToHira: 問題がカタカナ、正解が対応するひらがな', () => {
  const rng = makeRng(2);
  for (let i = 0; i < 30; i++) {
    const p = generateKataToHira(rng);
    assertChoiceShape(p, 'kata-to-hira');
    const pair = KANA_PAIRS.find(([, k]) => k === p.question);
    assert.ok(pair, `question must be a known katakana: ${p.question}`);
    assert.equal(p.choices[p.answerIndex], pair[0]);
  }
});

test('generateAntonym: 正解が問題語とペアの相方', () => {
  const rng = makeRng(3);
  for (let i = 0; i < 50; i++) {
    const p = generateAntonym(rng);
    assertChoiceShape(p, 'antonym');
    const correct = p.choices[p.answerIndex];
    const pairMatch = ANTONYM_PAIRS.find(
      ([a, b]) => (a === p.question && b === correct) || (b === p.question && a === correct),
    );
    assert.ok(pairMatch, `no matching antonym pair for ${p.question} vs ${correct}`);
  }
});
