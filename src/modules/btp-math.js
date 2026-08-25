/**
 * Pure BTP calculation formulas — no DOM dependencies, fully unit-testable.
 * Extracted from calc-tab.js rendering logic.
 */

const STEEL_UNIT_WEIGHTS = { 6: 0.222, 8: 0.395, 10: 0.617, 12: 0.888, 14: 1.208, 16: 1.578, 20: 2.466, 25: 3.853 };

/**
 * Concrete mix quantities for a rectangular pour (B25 CPJ 45 dosage)
 * @param {{l:number, w:number, h:number, dosage?:number}} dims
 */
export function computeConcreteMix({ l, w, h, dosage = 350 }) {
  const vol = l * w * h;
  if (!(vol > 0)) return null;
  const totalCementKg = vol * dosage;
  return {
    vol,
    volWithWaste: vol * 1.03,
    totalCementKg,
    bags: Math.ceil(totalCementKg / 50),
    sand: +(vol * 0.4).toFixed(2),
    gravel: +(vol * 0.8).toFixed(2),
    waterLiters: Math.round(vol * dosage * 0.5)
  };
}

/**
 * Rebar weight per meter (kg/ml) ≈ D²/162 per NM 01.4.096 convention
 */
export function steelUnitWeight(d) {
  return STEEL_UNIT_WEIGHTS[d] || STEEL_UNIT_WEIGHTS[12];
}

/** @returns {{kg:number, tonnes:number, barres12m:number, barres6m:number}|null} */
export function computeSteelWeight(d, len) {
  if (!(len > 0)) return null;
  const unitW = steelUnitWeight(d);
  const kg = len * unitW;
  return {
    kg,
    tonnes: kg / 1000,
    unitW,
    barres12m: Math.ceil(len / 12),
    barres6m: Math.ceil(len / 6)
  };
}

/** Bricks count with 5% waste + mortar needs @returns {{count:number, cimentBags:number, sandVolume:number}|null} */
export function computeBrickwork(area, rate = 12.5) {
  if (!(area > 0)) return null;
  return {
    count: Math.ceil(area * rate * 1.05),
    cimentBags: Math.ceil(area * 0.25),
    sandVolume: +(area * 0.035).toFixed(2)
  };
}

/** Tiling order incl. waste + adhesive/joint bags @returns {{totalArea:number, colleBags:number, jointBags:number}|null} */
export function computeTiling(area, wastePct = 10) {
  if (!(area > 0)) return null;
  const totalArea = area * (1 + wastePct / 100);
  return {
    totalArea,
    colleBags: Math.ceil((totalArea * 4) / 25),
    jointBags: Math.ceil((totalArea * 0.3) / 5)
  };
}

/**
 * CCAG-T style payment decomposition (Morocco: TVA 20%, retenue de garantie)
 * @returns {{tva:number, ttc:number, retenue:number, net:number}}
 */
export function computeFinancialDecompte(ht, tvaRate, retentionRate, retentionBasis = 'ht') {
  const safeHt = Math.max(0, ht || 0);
  const tvaRateSafe = Math.max(0, tvaRate || 0);
  const retentionRateSafe = Math.min(100, Math.max(0, retentionRate || 0));
  const tva = safeHt * (tvaRateSafe / 100);
  const ttc = safeHt + tva;
  const retentionBaseAmount = retentionBasis === 'ttc' ? ttc : safeHt;
  const retenue = retentionBaseAmount * (retentionRateSafe / 100);
  return { tva, ttc, retenue, net: ttc - retenue };
}

/** Ready-mix truck loads @returns {number|null} */
export function computeTruckLoads(volume, capacity = 8) {
  if (!(volume > 0) || !(capacity > 0)) return null;
  return Math.ceil(volume / capacity);
}

/** Plaster bags (10 kg/m² per cm thickness, 40 kg bags) @returns {number|null} */
export function computePlasterBags(area) {
  if (!(area > 0)) return null;
  return Math.ceil((area * 10) / 40);
}
