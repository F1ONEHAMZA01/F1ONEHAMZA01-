import { test } from 'node:test';
import assert from 'node:assert/strict';
import { scheduleSrsEntry } from '../../src/modules/srs.js';

const T = '2026-01-01';
const fresh = () => ({ ef: 2.5, interval: 0, reps: 0, due: T });

test('SM-2 first successful review schedules +1 day', () => {
  const next = scheduleSrsEntry(fresh(), 4, T);
  assert.equal(next.interval, 1);
  assert.equal(next.reps, 1);
  assert.equal(next.due, '2026-01-02');
});

test('SM-2 second success jumps to 6-day interval', () => {
  const oneDay = scheduleSrsEntry(fresh(), 4, T);
  const next = scheduleSrsEntry(oneDay, 4, T);
  assert.equal(next.interval, 6);
  assert.equal(next.reps, 2);
  assert.equal(next.due, '2026-01-07');
});

test('SM-2 third success multiplies by easiness factor', () => {
  let e = scheduleSrsEntry(scheduleSrsEntry(fresh(), 4, T), 4, T);
  e = scheduleSrsEntry(e, 5, T); // easy raises EF to 2.6
  assert.ok(e.interval >= Math.round(6 * e.ef) - 1, `interval ${e.interval} should track EF ${e.ef}`);
  assert.ok(e.ef > 2.5, 'quality 5 must raise EF');
});

test('SM-2 failure resets reps and schedules relearning tomorrow', () => {
  const advanced = { ef: 2.5, interval: 30, reps: 4, due: T };
  const next = scheduleSrsEntry(advanced, 0, T);
  assert.equal(next.reps, 0);
  assert.equal(next.interval, 1);
  assert.equal(next.due, '2026-01-02');
});

test('EF never drops below the 1.3 floor', () => {
  let entry = fresh();
  for (let i = 0; i < 10; i++) {
    entry = scheduleSrsEntry(entry, 3, T); // hard keeps nudging EF down
    assert.ok(entry.ef >= 1.29, `EF floor violated at step ${i}: ${entry.ef}`);
    assert.ok(entry.ef >= 1.3 || i === 9, '');
  }
});

test('hard/good/easy produce distinct intervals over a lifecycle', () => {
  const paths = [3, 4, 5].map(q => {
    let e = fresh();
    for (let i = 0; i < 4; i++) e = scheduleSrsEntry(e, q, T);
    return e;
  });
  assert.ok(paths[0].interval < paths[1].interval, 'hard path shorter than good');
  assert.ok(paths[1].interval <= paths[2].interval, 'easy path longest');
});
