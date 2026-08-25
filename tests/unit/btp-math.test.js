import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeConcreteMix,
  steelUnitWeight,
  computeSteelWeight,
  computeBrickwork,
  computeTiling,
  computeFinancialDecompte,
  computeTruckLoads,
  computePlasterBags
} from '../../src/modules/btp-math.js';

test('concrete mix: volume, waste, cement bags and water ratio', () => {
  const mix = computeConcreteMix({ l: 10, w: 8, h: 0.2, dosage: 350 });
  assert.equal(mix.vol, 16);
  assert.ok(Math.abs(mix.volWithWaste - 16.48) < 1e-9);
  assert.equal(mix.totalCementKg, 5600);
  assert.equal(mix.bags, 112);
  assert.equal(mix.sand, 6.4);
  assert.equal(mix.gravel, 12.8);
  assert.equal(mix.waterLiters, 2800);
});

test('concrete mix returns null for non-positive volumes', () => {
  assert.equal(computeConcreteMix({ l: 0, w: 2, h: 1 }), null);
  assert.equal(computeConcreteMix({ l: -3, w: 2, h: 1 }), null);
});

test('steel unit weights match NM table (D²/162 convention)', () => {
  assert.equal(steelUnitWeight(8), 0.395);
  assert.equal(steelUnitWeight(12), 0.888);
  assert.equal(steelUnitWeight(25), 3.853);
  for (const [d, expected] of Object.entries({ 10: 100 / 162, 12: 144 / 162, 16: 256 / 162 })) {
    assert.ok(Math.abs(steelUnitWeight(+d) - expected) < 0.01, `HA ${d}`);
  }
  assert.equal(steelUnitWeight(999), steelUnitWeight(12), 'unknown diameter falls back to T12');
});

test('steel weight computes bars of 12m and 6m', () => {
  const s = computeSteelWeight(12, 30);
  assert.ok(Math.abs(s.kg - 26.64) < 1e-9);
  assert.equal(s.barres12m, 3);
  assert.equal(s.barres6m, 5);
  assert.equal(computeSteelWeight(12, 0), null);
});

test('brickwork adds 5% field waste', () => {
  const b = computeBrickwork(100, 12.5);
  assert.equal(b.count, Math.ceil(100 * 12.5 * 1.05));
  assert.equal(b.cimentBags, 25);
  assert.equal(computeBrickwork(0), null);
});

test('tiling order covers waste and adhesive/joint bagging', () => {
  const t = computeTiling(50, 10);
  assert.ok(Math.abs(t.totalArea - 55) < 1e-9);
  assert.equal(t.colleBags, Math.ceil((55 * 4) / 25));
  assert.equal(t.jointBags, Math.ceil((55 * 0.3) / 5));
  assert.equal(computeTiling(0), null);
});

test('financial decompte: TVA 20% + retenue 10% on HT (CCAG-T default)', () => {
  const r = computeFinancialDecompte(100000, 20, 10, 'ht');
  assert.equal(r.tva, 20000);
  assert.equal(r.ttc, 120000);
  assert.equal(r.retenue, 10000);
  assert.equal(r.net, 110000);
});

test('financial decompte: retention basis can be TTC', () => {
  const r = computeFinancialDecompte(100000, 20, 10, 'ttc');
  assert.equal(r.retenue, 12000);
  assert.equal(r.net, 108000);
});

test('financial decompte clamps negative/oversized rates', () => {
  const r = computeFinancialDecompte(1000, -50, 250);
  assert.equal(r.tva, 0);
  assert.equal(r.retenue, 1000);
  assert.equal(r.net, 0);
});

test('truck loads round up to full toupies', () => {
  assert.equal(computeTruckLoads(17, 8), 3);
  assert.equal(computeTruckLoads(16, 8), 2);
  assert.equal(computeTruckLoads(0, 8), null);
  assert.equal(computeTruckLoads(5, 0), null);
});

test('plaster bags use 10kg/m² over 40kg bags', () => {
  assert.equal(computePlasterBags(40), 10);
  assert.equal(computePlasterBags(41), 11);
  assert.equal(computePlasterBags(0), null);
});
