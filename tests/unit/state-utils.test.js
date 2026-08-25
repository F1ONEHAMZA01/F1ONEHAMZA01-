import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hashString, normalizeSearchText, legacyWordKey, getWordId } from '../../src/modules/state.js';

test('hashString is deterministic and collision-distinct on samples', () => {
  const a = hashString('béton armé');
  assert.equal(a, hashString('béton armé'), 'same input must yield same hash');
  assert.notEqual(a, hashString('béton armée'));
  assert.match(a, /^[0-9a-z]+$/);
});

test('normalizeSearchText strips accents, ligatures and casing', () => {
  assert.equal(normalizeSearchText('Étanchéité'), 'etancheite');
  assert.equal(normalizeSearchText('Gros Œuvre'), 'gros oeuvre');
  assert.equal(normalizeSearchText('  COFFRAGE '), 'coffrage');
  assert.equal(normalizeSearchText(null), '');
});

test('legacyWordKey strips leading French articles', () => {
  assert.equal(legacyWordKey('le béton'), 'béton');
  assert.equal(legacyWordKey("l'armature"), 'armature');
  assert.equal(legacyWordKey('la dalle'), 'dalle');
  assert.equal(legacyWordKey('les échafaudages'), 'échafaudages');
  assert.equal(legacyWordKey('une pelle'), 'pelle');
  assert.equal(legacyWordKey('chapeau'), 'chapeau');
});

test('getWordId is stable regardless of extra fields and trims inputs', () => {
  const base = { fr: 'couler', ar: 'صب', category: 'Béton', level: 'A1' };
  const id1 = getWordId(base);
  const id2 = getWordId({ ...base, pron: 'koulé', tags: ['x'] });
  const id3 = getWordId({ fr: ' couler ', ar: ' صب ', category: ' Béton ' });
  assert.equal(id1, id2, 'optional display fields must not change identity');
  assert.equal(id1, id3, 'whitespace must not change identity');
  assert.ok(id1.startsWith('word:'));
});
