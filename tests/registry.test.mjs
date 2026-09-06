import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  MODES,
  CATEGORIES,
  STATE_MODES,
  MODE_BREAKDOWN_DEFS,
  kindOfStateMode,
} from '../src/modes/registry.mjs';

const KIND_VALUES = ['keypad', 'kanji', 'clock', 'choice', '100masu'];

test('MODES: 各エントリに key/label/emoji/category/kind が揃っている', () => {
  for (const m of MODES) {
    assert.ok(m.key, `entry needs key: ${JSON.stringify(m)}`);
    assert.equal(typeof m.label, 'string');
    assert.ok(m.label.length > 0);
    assert.equal(typeof m.emoji, 'string');
    assert.ok(m.emoji.length > 0);
    assert.equal(typeof m.category, 'string');
    assert.ok(KIND_VALUES.includes(m.kind), `unknown kind ${m.kind} on ${m.key}`);
  }
});

test('MODES: key はユニーク', () => {
  const seen = new Set();
  for (const m of MODES) {
    assert.ok(!seen.has(m.key), `duplicate mode key: ${m.key}`);
    seen.add(m.key);
  }
});

test('MODES: category は CATEGORIES に存在するキーのみ', () => {
  const catKeys = new Set(CATEGORIES.map(c => c.key));
  for (const m of MODES) {
    assert.ok(catKeys.has(m.category), `${m.key} has unknown category ${m.category}`);
  }
});

test('MODES: kind==="choice" は generator を持つ', () => {
  for (const m of MODES) {
    if (m.kind === 'choice') {
      assert.equal(typeof m.generator, 'function', `${m.key} needs generator`);
    }
  }
});

test('MODES: kind==="keypad" は symbol を持つ', () => {
  for (const m of MODES) {
    if (m.kind === 'keypad') {
      assert.equal(typeof m.symbol, 'string', `${m.key} needs symbol`);
    }
  }
});

test('MODES: kind==="kanji" は subModes を持ち各 subMode に key/label/shortLabel', () => {
  const kanji = MODES.find(m => m.kind === 'kanji');
  assert.ok(kanji, 'expected at least one kanji entry');
  assert.ok(Array.isArray(kanji.subModes) && kanji.subModes.length > 0);
  for (const sm of kanji.subModes) {
    assert.ok(sm.key);
    assert.ok(sm.label);
    assert.ok(sm.shortLabel);
  }
});

test('STATE_MODES: 既知の全 state mode を含む (kanji / masu100 展開後)', () => {
  const expected = [
    'add', 'sub', 'mul', 'ten-comp', 'parity',
    'masu100-add', 'masu100-sub', 'masu100-mul',
    'k2r', 'r2k', 'ksent',
    'hira-to-kata', 'kata-to-hira', 'antonym',
    'ja-to-en', 'en-to-ja',
    'clock', 'season', 'group',
    'train-h2k', 'train-k2h',
  ];
  for (const k of expected) {
    assert.ok(STATE_MODES.has(k), `state mode ${k} missing`);
  }
});

test('STATE_MODES: masu100 サブモードは kind === "100masu" と parent.key === "masu100"', () => {
  for (const k of ['masu100-add', 'masu100-sub', 'masu100-mul']) {
    const sm = STATE_MODES.get(k);
    assert.equal(sm.kind, '100masu');
    assert.equal(sm.parent?.key, 'masu100');
  }
});

test('STATE_MODES: kanji サブモードは parent.key === "kanji"', () => {
  for (const k of ['k2r', 'r2k', 'ksent']) {
    const sm = STATE_MODES.get(k);
    assert.equal(sm.parent?.key, 'kanji');
  }
});

test('STATE_MODES: サブメニューを持たないモードは parent === null', () => {
  for (const k of ['add', 'sub', 'clock', 'train-h2k']) {
    assert.equal(STATE_MODES.get(k).parent, null, `${k} should be top-level`);
  }
});

test('MODE_BREAKDOWN_DEFS: train-h2k / train-k2h を含む (B-13, AC-1)', () => {
  const keys = MODE_BREAKDOWN_DEFS.map(d => d.key);
  assert.ok(keys.includes('train-h2k'));
  assert.ok(keys.includes('train-k2h'));
});

test('MODE_BREAKDOWN_DEFS: 100masu を除いた STATE_MODES と過不足なく一致する', () => {
  const defKeys = [...MODE_BREAKDOWN_DEFS.map(d => d.key)].sort();
  const stateKeys = [...STATE_MODES.values()]
    .filter(m => m.kind !== '100masu')
    .map(m => m.key)
    .sort();
  assert.deepEqual(defKeys, stateKeys);
});

test('MODE_BREAKDOWN_DEFS: masu100-* を含まない (別 storage なので混ぜない)', () => {
  const keys = MODE_BREAKDOWN_DEFS.map(d => d.key);
  for (const k of ['masu100-add', 'masu100-sub', 'masu100-mul']) {
    assert.ok(!keys.includes(k), `${k} must NOT be in breakdown defs`);
  }
});

test('kindOfStateMode: 直接モードは自 kind を返す', () => {
  assert.equal(kindOfStateMode('add'), 'keypad');
  assert.equal(kindOfStateMode('clock'), 'clock');
  assert.equal(kindOfStateMode('season'), 'choice');
});

test('kindOfStateMode: kanji サブモードは "kanji" を返す', () => {
  assert.equal(kindOfStateMode('k2r'), 'kanji');
  assert.equal(kindOfStateMode('ksent'), 'kanji');
});

test('kindOfStateMode: 未知のキーは null', () => {
  assert.equal(kindOfStateMode('nope'), null);
});
