import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeRng } from '../src/kanji/random.mjs';
import { VOCAB } from '../src/eigo/vocab-data.mjs';
import { generateJaToEn, generateEnToJa } from '../src/eigo/generator.mjs';

function assertChoiceShape(p, subtype) {
  assert.equal(p.subtype, subtype);
  assert.equal(p.choices.length, 4);
  assert.ok(Number.isInteger(p.answerIndex));
  assert.ok(p.answerIndex >= 0 && p.answerIndex < 4);
  assert.equal(new Set(p.choices).size, 4, 'choices must be unique');
}

test('VOCAB: ja と en がそれぞれ一意（同音・同綴りの衝突がない）', () => {
  const ja = new Set(), en = new Set();
  for (const v of VOCAB) {
    assert.ok(!ja.has(v.ja), `duplicate ja: ${v.ja}`);
    assert.ok(!en.has(v.en), `duplicate en: ${v.en}`);
    ja.add(v.ja); en.add(v.en);
  }
});

test('generateJaToEn: 問題が ja、正解が対応する en', () => {
  const rng = makeRng(21);
  for (let i = 0; i < 40; i++) {
    const p = generateJaToEn(rng);
    assertChoiceShape(p, 'ja-to-en');
    const entry = VOCAB.find(v => v.ja === p.question);
    assert.ok(entry, `unknown ja: ${p.question}`);
    assert.equal(p.choices[p.answerIndex], entry.en);
  }
});

test('generateEnToJa: 問題が en、正解が対応する ja', () => {
  const rng = makeRng(22);
  for (let i = 0; i < 40; i++) {
    const p = generateEnToJa(rng);
    assertChoiceShape(p, 'en-to-ja');
    const entry = VOCAB.find(v => v.en === p.question);
    assert.ok(entry, `unknown en: ${p.question}`);
    assert.equal(p.choices[p.answerIndex], entry.ja);
  }
});
