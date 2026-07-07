import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeRng } from '../src/kanji/random.mjs';
import {
  generateTenComp,
  generateParity,
} from '../src/sansu/generator.mjs';

function assertChoiceShape(p, subtype) {
  assert.equal(p.subtype, subtype);
  assert.equal(p.choices.length, 4);
  assert.ok(Number.isInteger(p.answerIndex));
  assert.ok(p.answerIndex >= 0 && p.answerIndex < 4);
  assert.equal(new Set(p.choices).size, 4, 'choices must be unique');
}

test('generateTenComp: n と 正解 answer が n + answer === 10 を満たす', () => {
  const rng = makeRng(11);
  for (let i = 0; i < 60; i++) {
    const p = generateTenComp(rng);
    assertChoiceShape(p, 'ten-comp');
    const m = p.question.match(/^(\d+) \+ ？ = 10$/);
    assert.ok(m, `unexpected question format: ${p.question}`);
    const n = parseInt(m[1], 10);
    const answer = parseInt(p.choices[p.answerIndex], 10);
    assert.equal(n + answer, 10);
  }
});

test('generateParity: 正解のパリティが問題文と一致', () => {
  const rng = makeRng(13);
  for (let i = 0; i < 60; i++) {
    const p = generateParity(rng);
    assertChoiceShape(p, 'parity');
    const isEvenQ = p.question === 'ぐうすうは どれ？';
    const isOddQ = p.question === 'きすうは どれ？';
    assert.ok(isEvenQ || isOddQ, `unexpected question: ${p.question}`);
    const answer = parseInt(p.choices[p.answerIndex], 10);
    const isEven = answer % 2 === 0;
    assert.equal(isEven, isEvenQ);
    // 他 3 つは逆パリティ
    p.choices.forEach((c, i) => {
      if (i === p.answerIndex) return;
      assert.equal(parseInt(c, 10) % 2 === 0, !isEvenQ);
    });
  }
});
