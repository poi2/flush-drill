import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeRng } from '../src/kanji/random.mjs';
import {
  SEASON_WORDS,
  SEASONS,
  GROUP_CATEGORIES,
} from '../src/seikatsu/data.mjs';
import {
  generateSeason,
  generateGroup,
} from '../src/seikatsu/generator.mjs';

function assertChoiceShape(p, subtype) {
  assert.equal(p.subtype, subtype);
  assert.equal(p.choices.length, 4);
  assert.ok(Number.isInteger(p.answerIndex));
  assert.ok(p.answerIndex >= 0 && p.answerIndex < 4);
  assert.equal(new Set(p.choices).size, 4, 'choices must be unique');
}

test('GROUP_CATEGORIES: 全カテゴリを通して要素が一意（同じ語が複数カテゴリに登場しない）', () => {
  const seen = new Map(); // word -> category
  for (const [cat, words] of Object.entries(GROUP_CATEGORIES)) {
    for (const w of words) {
      const prev = seen.get(w);
      assert.ok(!prev, `"${w}" appears in both ${prev} and ${cat}`);
      seen.set(w, cat);
    }
  }
});

test('generateSeason: 正解が単語のきせつと一致し、選択肢は 4 季すべて', () => {
  const rng = makeRng(32);
  for (let i = 0; i < 30; i++) {
    const p = generateSeason(rng);
    assertChoiceShape(p, 'season');
    // 選択肢は はる/なつ/あき/ふゆ の全て
    assert.deepEqual([...p.choices].sort(), [...SEASONS].sort());
    const m = p.question.match(/^「(.+?)」は どの きせつ？$/);
    assert.ok(m, `unexpected format: ${p.question}`);
    const entry = SEASON_WORDS.find(w => w.word === m[1]);
    assert.ok(entry, `unknown season word: ${m[1]}`);
    assert.equal(p.choices[p.answerIndex], entry.season);
  }
});

test('generateGroup: 正解が対象カテゴリに属し、他 3 つは他カテゴリ', () => {
  const rng = makeRng(33);
  for (let i = 0; i < 30; i++) {
    const p = generateGroup(rng);
    assertChoiceShape(p, 'group');
    const m = p.question.match(/^つぎの なかで「(.+?)」は どれ？$/);
    assert.ok(m, `unexpected format: ${p.question}`);
    const targetCat = m[1];
    const members = GROUP_CATEGORIES[targetCat];
    assert.ok(members, `unknown category: ${targetCat}`);
    const correct = p.choices[p.answerIndex];
    assert.ok(members.includes(correct), `correct "${correct}" not in ${targetCat}`);
    p.choices.forEach((c, i) => {
      if (i === p.answerIndex) return;
      assert.ok(!members.includes(c), `distractor "${c}" is also in ${targetCat}`);
    });
  }
});
