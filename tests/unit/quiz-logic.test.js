import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSourceModule, loadDataset } from '../helpers/load-module.js';

const { shuffleArray } = loadSourceModule('src/modules/tabs/quiz-tab.js', ['shuffleArray']);
const vocab = loadDataset('data/vocab.js', 'VOCAB_DATA');

test('shuffleArray is a pure permutation (no mutation, same elements)', () => {
  const input = [1, 2, 3, 4, 5, 6, 7, 8];
  const snapshot = [...input];
  const output = shuffleArray(input);
  assert.deepEqual(input, snapshot, 'input array must not be mutated');
  assert.equal(output.length, input.length);
  assert.deepEqual([...output].sort((a, b) => a - b), input);
});

test('shuffleArray actually shuffles over repeated runs', () => {
  const input = Array.from({ length: 12 }, (_, i) => i);
  const seenFirst = new Set();
  let identical = 0;
  for (let run = 0; run < 200; run++) {
    const out = shuffleArray(input);
    if (out.every((v, i) => v === input[i])) identical++;
    seenFirst.add(out[0]);
  }
  assert.ok(identical <= 4, `identity permutations too frequent: ${identical}/200`);
  assert.ok(seenFirst.size >= 6, 'first slot should see varied candidates');
});

test('quiz dataset integrity: required fields and CEFR levels', () => {
  assert.ok(vocab.length >= 1900, `expected ~2000 words, got ${vocab.length}`);
  const levels = new Set(['A1', 'A2', 'B1', 'B2']);
  vocab.forEach(w => {
    assert.ok(w.fr && w.ar && w.category, 'missing core field');
    assert.ok(levels.has(w.level), `bad level: ${w.level}`);
  });
});

test('cloze mode has enough example sentences with distinct tokens', () => {
  const clozeEligible = vocab.filter(w => w.example_fr && w.example_fr.length > 25);
  assert.ok(clozeEligible.length > 500, `too few cloze-eligible examples: ${clozeEligible.length}`);
});
