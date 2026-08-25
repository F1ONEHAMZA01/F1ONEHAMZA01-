import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadSourceModule } from '../helpers/load-module.js';

const { numberToFrench, parseLocalizedChequeAmount, buildChequeAmountWords } = loadSourceModule(
  'src/modules/tabs/cheques-tab.js',
  ['numberToFrench', 'parseLocalizedChequeAmount', 'buildChequeAmountWords']
);

test('numberToFrench handles Academy-legal special forms', () => {
  const cases = new Map([
    [0, 'zéro'],
    [1, 'un'],
    [16, 'seize'],
    [17, 'dix-sept'],
    [20, 'vingt'],
    [21, 'vingt et un'],
    [22, 'vingt-deux'],
    [31, 'trente et un'],
    [61, 'soixante et un'],
    [70, 'soixante-dix'],
    [71, 'soixante et onze'],
    [72, 'soixante-douze'],
    [79, 'soixante-dix-neuf'],
    [80, 'quatre-vingts'],
    [81, 'quatre-vingt-un'],
    [89, 'quatre-vingt-neuf'],
    [90, 'quatre-vingt-dix'],
    [91, 'quatre-vingt-onze'],
    [99, 'quatre-vingt-dix-neuf'],
    [100, 'cent'],
    [101, 'cent un'],
    [200, 'deux cents'],
    [201, 'deux cent un'],
    [1000, 'mille'],
    [1100, 'mille cent'],
    [2000, 'deux mille'],
    [80000, 'quatre-vingt mille'],
    [100000, 'cent mille'],
    [200000, 'deux cent mille'],
    [1000000, 'un million'],
    [2000000, 'deux millions'],
    [10000000, 'dix millions'],
    [21000000, 'vingt et un millions']
  ]);
  cases.forEach((expected, value) => assert.equal(numberToFrench(value), expected, String(value)));
});

test('parseLocalizedChequeAmount accepts Moroccan/European/US formats', () => {
  const cases = new Map([
    ['4500', 4500],
    ['4 500,50', 4500.5],
    ['4.500,50', 4500.5],
    ['4,500.50', 4500.5],
    ['٤ ٥٠٠٫٥٠', 4500.5],
    ['12,345', 12345],
    ['0', 0]
  ]);
  cases.forEach((expected, raw) => {
    const parsed = parseLocalizedChequeAmount(raw);
    assert.equal(parsed.kind, 'valid', raw);
    assert.equal(parsed.amount, expected, raw);
  });
});

test('parseLocalizedChequeAmount rejects scientific notation and empty input', () => {
  assert.equal(parseLocalizedChequeAmount('1e3').kind, 'invalid');
  assert.equal(parseLocalizedChequeAmount('abc').kind, 'invalid');
  assert.equal(parseLocalizedChequeAmount('').kind, 'empty');
  assert.equal(parseLocalizedChequeAmount('   ').kind, 'empty');
});

test('buildChequeAmountWords renders dirhams and centimes bilingually', () => {
  const words = buildChequeAmountWords(450050);
  assert.equal(words.fr, 'quatre mille cinq cents dirhams et cinquante centimes');
  assert.ok(typeof words.ar === 'string' && words.ar.includes('درهم'));
});
