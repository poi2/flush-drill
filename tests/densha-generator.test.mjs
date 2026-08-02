import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeRng } from '../src/kanji/random.mjs';
import { TRAIN_ENTRIES } from '../src/densha/data.mjs';
import {
  generateTrainHiraToKanji,
  generateTrainKanjiToHira,
} from '../src/densha/generator.mjs';

function assertChoiceShape(p, subtype) {
  assert.equal(p.subtype, subtype);
  assert.equal(p.choices.length, 4);
  assert.ok(Number.isInteger(p.answerIndex));
  assert.ok(p.answerIndex >= 0 && p.answerIndex < 4);
  assert.equal(new Set(p.choices).size, 4, 'choices must be unique');
  assert.ok(typeof p.description === 'string' && p.description.length > 0, 'description must be non-empty');
}

test('TRAIN_ENTRIES: kanji と hiragana がそれぞれ一意', () => {
  const seenK = new Set();
  const seenH = new Set();
  for (const e of TRAIN_ENTRIES) {
    assert.ok(!seenK.has(e.kanji), `duplicate kanji: ${e.kanji}`);
    assert.ok(!seenH.has(e.hiragana), `duplicate hiragana: ${e.hiragana}`);
    seenK.add(e.kanji);
    seenH.add(e.hiragana);
  }
});

test('TRAIN_ENTRIES: description がすべて非空', () => {
  for (const e of TRAIN_ENTRIES) {
    assert.ok(typeof e.description === 'string' && e.description.length > 0, `empty description: ${e.kanji}`);
  }
});

test('TRAIN_ENTRIES: kind は station | line のみ', () => {
  for (const e of TRAIN_ENTRIES) {
    assert.ok(e.kind === 'station' || e.kind === 'line', `bad kind: ${e.kanji} = ${e.kind}`);
  }
});

test('TRAIN_ENTRIES: station も line も少なくとも 1 件は含む', () => {
  const stations = TRAIN_ENTRIES.filter((e) => e.kind === 'station');
  const lines = TRAIN_ENTRIES.filter((e) => e.kind === 'line');
  assert.ok(stations.length >= 1, 'no station entries');
  assert.ok(lines.length >= 1, 'no line entries');
});

test('generateTrainHiraToKanji: 問題が hiragana、正解が対応する kanji', () => {
  const rng = makeRng(51);
  for (let i = 0; i < 40; i++) {
    const p = generateTrainHiraToKanji(rng);
    assertChoiceShape(p, 'train-h-to-k');
    const entry = TRAIN_ENTRIES.find((e) => e.hiragana === p.question);
    assert.ok(entry, `unknown hiragana: ${p.question}`);
    assert.equal(p.choices[p.answerIndex], entry.kanji);
    assert.equal(p.description, entry.description);
  }
});

test('generateTrainKanjiToHira: 問題が kanji、正解が対応する hiragana', () => {
  const rng = makeRng(52);
  for (let i = 0; i < 40; i++) {
    const p = generateTrainKanjiToHira(rng);
    assertChoiceShape(p, 'train-k-to-h');
    const entry = TRAIN_ENTRIES.find((e) => e.kanji === p.question);
    assert.ok(entry, `unknown kanji: ${p.question}`);
    assert.equal(p.choices[p.answerIndex], entry.hiragana);
    assert.equal(p.description, entry.description);
  }
});

test('generateTrainHiraToKanji: 同じ seed で同じ出力（決定的）', () => {
  const a = generateTrainHiraToKanji(makeRng(7));
  const b = generateTrainHiraToKanji(makeRng(7));
  assert.deepEqual(a, b);
});

test('generateTrainKanjiToHira: 同じ seed で同じ出力（決定的）', () => {
  const a = generateTrainKanjiToHira(makeRng(9));
  const b = generateTrainKanjiToHira(makeRng(9));
  assert.deepEqual(a, b);
});
