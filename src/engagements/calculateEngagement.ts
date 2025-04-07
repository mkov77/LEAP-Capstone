// calculateEngagement.ts

import { Unit } from '../types/unit';

// --------------------
// 1) Interfaces
// --------------------

/** 
 * Data returned for each side after all calculations.
 * Fields match your EngagementData structure.
 */
export interface EngagementData {
  w: number;
  A: number;
  t: number;
  P: number;       // Probability of detection (or however you use it)
  r: number;       // Radius of attack (or detection radius)
  sigma: number;   // Accuracy factor (table uses "v", but we rename to "sigma")
  Ph: number;      // Probability of hit
  b: number;       // Range
  d_r: number;     // Attacker accuracy term
  d_mi: number;    // Max damage inflicted
  D: number;       // Final damage inflicted
  Fi: number;      // Initial health
  Fn: number;      // Final health
}

/**
 * Final results from our calculation, containing:
 *  - friendly: EngagementData
 *  - enemy:    EngagementData
 */
export interface CalculationResult {
  friendly: EngagementData;
  enemy: EngagementData;
}

/**
 * This interface captures additional "modifiers" from your table:
 *  - roleType: Headquarters, Support, Facility, etc.
 *  - unitSize: Squad, Platoon, Battalion, ...
 *  - forcePosture: Offensive, Defensive, ...
 *  - forceMobility: Fixed, Mobile, ...
 *  - forceReadiness: Low, Medium, High
 *  - forceSkill: Untrained, Basic, Advanced, Elite
 *  - variable conditions: didISR, commsGood, hasCAS, gpsJammed, defendingCritical, targetInOuterSOI, etc.
 *
 * You can expand or reduce as needed.
 */
export interface UnitModifiers {
  roleType: string;
  unitSize: string;
  forcePosture: string;
  forceMobility: string;
  forceReadiness: string;
  forceSkill: string;

  // Variable condition booleans
  didISR: boolean;
  commsGood: boolean;
  hasCAS: boolean;
  gpsJammed: boolean;
  defendingCritical: boolean;
  targetInOuterSOI: boolean;
}

// --------------------
// 2) Base Values Table
// --------------------

/**
 * The base values for each unit type, 
 * matching the columns from your original spreadsheet:
 *   w, A, t, r, v (renamed to sigma in usage), rho, b, H, D_mi
 */
const BASE_VALUES: Record<string, {
  w: number;
  A: number;
  t: number;
  r: number;
  v: number;      // We'll rename this to "sigma" in final usage
  rho: number;
  b: number;
  H: number;
  D_mi: number;
}> = {
  "Infantry": { w: 12, A: 45, t: 1, r: 8, v: 1, rho: 8, b: 10, H: 100, D_mi: 25 },
  "Reconnaissance": { w: 12, A: 30, t: 1, r: 3, v: 1, rho: 18, b: 15, H: 100, D_mi: 10 },
  "Armored Mechanized": { w: 17, A: 25, t: 1, r: 15, v: 2, rho: 10, b: 10, H: 100, D_mi: 35 },
  "Combined Arms": { w: 15, A: 50, t: 1, r: 8, v: 1, rho: 5, b: 10, H: 100, D_mi: 35 },
  "Armored Mechanized Tracked": { w: 17, A: 20, t: 1, r: 10, v: 2, rho: 6, b: 15, H: 100, D_mi: 35 },
  "Field Artillery": { w: 18, A: 15, t: 1, r: 20, v: 2, rho: 6, b: 15, H: 100, D_mi: 40 },
  "Self-propelled": { w: 18, A: 22, t: 1, r: 12, v: 2, rho: 6, b: 15, H: 100, D_mi: 35 },
  "Electronic Warfare": { w: 20, A: 10, t: 1, r: 15, v: 0, rho: 0, b: 30, H: 100, D_mi: 0 },
  "Signal": { w: 20, A: 40, t: 1, r: 5, v: 0, rho: 0, b: 30, H: 100, D_mi: 5 },
  "Special Operations Forces": { w: 5, A: 80, t: 1, r: 7, v: 1, rho: 4, b: 10, H: 100, D_mi: 25 },
  "Ammunition": { w: 10, A: 10, t: 1, r: 10, v: 0, rho: 0, b: 0, H: 100, D_mi: 0 },
  "Air Defense": { w: 30, A: 10, t: 1, r: 15, v: 1, rho: 5, b: 40, H: 100, D_mi: 30 },
  "Engineer": { w: 17, A: 20, t: 1, r: 5, v: 1, rho: 15, b: 15, H: 100, D_mi: 18 },
  "Air Assault": { w: 15, A: 50, t: 1, r: 8, v: 1, rho: 5, b: 10, H: 100, D_mi: 35 },
  "Medical Treatment Facility": { w: 12, A: 15, t: 0, r: 20, v: 0, rho: 0, b: 0, H: 100, D_mi: 0 },
  "Aviation Rotary Wing": { w: 15, A: 50, t: 1, r: 10, v: 1, rho: 0, b: 20, H: 100, D_mi: 20 },
  "Combat Support": { w: 17, A: 20, t: 1, r: 5, v: 1, rho: 15, b: 15, H: 100, D_mi: 15 },
  "Sustainment": { w: 17, A: 20, t: 1, r: 5, v: 1, rho: 15, b: 15, H: 100, D_mi: 15 },
  "Unmanned Aerial Systems": { w: 3, A: 10, t: 1, r: 8, v: 1, rho: 4, b: 20, H: 100, D_mi: 15 },
  "Combat Service Support": { w: 10, A: 10, t: 1, r: 12, v: 0, rho: 0, b: 0, H: 100, D_mi: 0 },
  "Petroleum, Oil and Lubricants": { w: 10, A: 15, t: 0, r: 12, v: 0, rho: 0, b: 0, H: 100, D_mi: 0 },
  "Sea Port": { w: 20, A: 10, t: 0, r: 12, v: 0, rho: 0, b: 0, H: 100, D_mi: 0 },
  "Railhead": { w: 20, A: 10, t: 1, r: 11, v: 0, rho: 0, b: 0, H: 100, D_mi: 0 },
};

const DEFAULT_BASE = {
  w: 0, A: 0, t: 0, r: 0, v: 0, rho: 0, b: 0, H: 0, D_mi: 0,
};

// --------------------
// 3) Helper to apply all table modifiers
// --------------------
function applyTableModifiers(
  base: { w: number; A: number; t: number; r: number; v: number; rho: number; b: number; H: number; D_mi: number },
  mods: UnitModifiers
) {
  let { w, A, t, r, v, rho, b, H, D_mi } = base;

  //
  // 3a) Role Type (Command and Control changes)
  //
  switch (mods.roleType) {
    case "Headquarters":
      // Reduce A by 50%, increase w by 25%
      A *= 0.5;
      w *= 1.25;
      break;
    case "Support":
      // reduce D_mi by 50%
      D_mi *= 0.5;
      break;
    case "Supply Materials":
      D_mi = 0;  // reduce D_mi to zero
      break;
    case "Facility":
      // Increase w by 30%, reduce A by 25%
      w *= 1.3;
      A *= 0.75;
      break;
    // case "Combat": (No changes from default)
  }

  //
  // 3b) Unit Size
  //
  switch (mods.unitSize) {
    case "Squad/Team":
      D_mi *= 0.25; // reduce by 75%
      break;
    case "Platoon":
      D_mi *= 0.4;  // reduce by 60%
      break;
    case "Company/Battery":
      D_mi *= 0.6;  // reduce by 40%
      break;
    case "Battalion":
      // no change
      break;
    case "Brigade/Regiment":
      D_mi *= 1.25; // increase by 25%
      break;
    case "Division":
      D_mi *= 1.5;  // increase by 50%
      break;
    case "Corps":
      D_mi *= 2.0;  // double
      break;
    case "Aviation Section (2)":
      D_mi *= 0.6;  // reduce by 40%
      break;
    // etc. for flight (4), etc.
  }

  //
  // 3c) Force Posture
  //
  if (mods.forcePosture === "Defensive Only") {
    D_mi *= 0.5; // reduce D_mi by 50%
  }
  // Offensive Only or Offense & Defense => no change

  //
  // 3d) Force Mobility
  //
  if (mods.forceMobility === "Fixed") {
    A = 5; // reduce A to 5
  }
  // Foot, Wheeled, Track, Stationary => no change from base

  //
  // 3e) Force Readiness
  //
  switch (mods.forceReadiness) {
    case "Low":
      t *= 0.5;  // reduce t 50%
      rho *= 0.5;
      break;
    case "Medium":
      t *= 0.85; // reduce t 15%
      rho *= 0.85;
      break;
    // High => no change
  }

  //
  // 3f) Force Skill
  //
  switch (mods.forceSkill) {
    case "Untrained":
      D_mi *= 0.4;  // reduce D_mi by 60%
      break;
    case "Advanced":
      D_mi *= 1.15; // +15%
      break;
    case "Elite":
      D_mi *= 1.25; // +25%
      break;
    // Basic => no change
  }

  //
  // 3g) Variable Conditions
  //    didISR => t +25% or -25%
  //    commsGood => t +25% or -25%
  //
  if (mods.didISR) {
    t *= 1.25;
  } else {
    t *= 0.75;
  }

  if (mods.commsGood) {
    t *= 1.25;
  } else {
    t *= 0.75;
  }

  // CAS => +10% to rho
  if (mods.hasCAS) {
    rho *= 1.1;
  }
  // GPS jam => -30% to rho
  if (mods.gpsJammed) {
    rho *= 0.7;
  }
  // Defending critical location => +25% to r
  if (mods.defendingCritical) {
    r *= 1.25;
  }
  // Target in outer half => b -25%
  if (mods.targetInOuterSOI) {
    b *= 0.75;
  }

  // Return final updated
  return { w, A, t, r, v, rho, b, H, D_mi };
}

// --------------------
// 4) The main calculation function
// --------------------

/**
 * runEngagementCalculation:
 *  - Looks up base table for each Unit.
 *  - Applies all relevant table-based modifiers via applyTableModifiers.
 *  - Performs detection & engagement math for each side.
 *  - Returns final EngagementData for both friendly & enemy.
 */
export function runEngagementCalculation(params: {
  friendly: Unit;
  enemy: Unit;
  friendlyMods: UnitModifiers;
  enemyMods: UnitModifiers;
  applyFirstStrike?: boolean; // New optional flag
}): CalculationResult {
  const { friendly, enemy, friendlyMods, enemyMods, applyFirstStrike = true } = params;

  // 1) Grab base table rows
  const friendBase = BASE_VALUES[friendly.unit_type] ?? DEFAULT_BASE;
  const foeBase = BASE_VALUES[enemy.unit_type] ?? DEFAULT_BASE;

  // 2) Apply all table-based modifiers to each side
  const fFinal = applyTableModifiers(friendBase, friendlyMods);
  const eFinal = applyTableModifiers(foeBase, enemyMods);

  // 3) Rename v -> sigma for convenience
  const sigmaF = fFinal.v;
  const sigmaE = eFinal.v;
  // Ensure sigma is not zero to avoid division by zero
  const safeSigmaF = sigmaF !== 0 ? sigmaF : 0.01;
  const safeSigmaE = sigmaE !== 0 ? sigmaE : 0.01;

  // 4) Detection Probability (example formula)
  const safeAF = fFinal.A !== 0 ? fFinal.A : 0.01; // fallback value if A is 0
  const PF = 1 - Math.exp((-fFinal.w * fFinal.t) / safeAF);

  const safeAE = eFinal.A !== 0 ? eFinal.A : 0.01;
  const PE = 1 - Math.exp((-eFinal.w * eFinal.t) / safeAE);

  // 5) Compute radius (using table value here)
  const rF = fFinal.r;
  const rE = eFinal.r;

  // 6) Probability of Hit using safe sigma values
  const PhF = 1 - Math.exp(-(rF ** 2) / (2 * safeSigmaF ** 2));
  const PhE = 1 - Math.exp(-(rE ** 2) / (2 * safeSigmaE ** 2));

  // 7) Attacker Accuracy: use safe b values to avoid division by zero
  const safeBF = fFinal.b !== 0 ? fFinal.b : 0.01;
  const safeBE = eFinal.b !== 0 ? eFinal.b : 0.01;
  const drF = Math.exp(-(rF ** 2) / (2 * safeBF ** 2));
  const drE = Math.exp(-(rE ** 2) / (2 * safeBE ** 2));

  // 8) Determine initial health values (using Unit data or base H)
  let Fi = friendly.unit_health > 0 ? friendly.unit_health : fFinal.H;
  let Ei = enemy.unit_health > 0 ? enemy.unit_health : eFinal.H;

  // ---- FIRST STRIKE LOGIC (applied only in Round 1) ----
  if (applyFirstStrike) {
    const firstStrikeFactor = 0.3; // Adjust this factor based on your excel parameters
    if (PF > PE) {
      // Friendly gets first strike—reduce enemy's health before damage calculation
      const firstStrikeDamage = firstStrikeFactor * (fFinal.D_mi * PhF * drF);
      Ei = Math.max(0, Ei - firstStrikeDamage);
    } else if (PE > PF) {
      // Enemy gets first strike—reduce friendly's health before damage calculation
      const firstStrikeDamage = firstStrikeFactor * (eFinal.D_mi * PhE * drE);
      Fi = Math.max(0, Fi - firstStrikeDamage);
    }
  }
  // -------------------------------------------------------

  // 9) Calculate damage inflicted based on the updated health values, including random variation
  const randomFactorFriendly = 0.8 + Math.random() * 0.4; // range is 0.8 to 1.2
  const randomFactorEnemy = 0.8 + Math.random() * 0.4;    

  let FD = fFinal.D_mi * PhF * drF * randomFactorFriendly;  // Damage by friendly on enemy with random variation
  FD = Math.min(FD, Ei);                                      // Clamp so we don't exceed enemy HP

  let ED = eFinal.D_mi * PhE * drE * randomFactorEnemy;       // Damage by enemy on friendly with random variation
  ED = Math.min(ED, Fi);                                      // Clamp so we don't exceed friendly HP

  // 10) Final Health after both damage calculations
  const FFn = Math.max(0, Fi - ED);
  const EFn = Math.max(0, Ei - FD);

  // 11) Build final EngagementData objects
  const friendlyData: EngagementData = {
    w: fFinal.w,
    A: fFinal.A,
    t: fFinal.t,
    P: PF,
    r: rF,
    sigma: sigmaF,
    Ph: PhF,
    b: fFinal.b,
    d_r: drF,
    d_mi: fFinal.D_mi,
    D: FD,    // Damage inflicted on enemy
    Fi: Fi,   // Health after first strike (if any)
    Fn: FFn,  // Final health after enemy's damage
  };

  const enemyData: EngagementData = {
    w: eFinal.w,
    A: eFinal.A,
    t: eFinal.t,
    P: PE,
    r: rE,
    sigma: sigmaE,
    Ph: PhE,
    b: eFinal.b,
    d_r: drE,
    d_mi: eFinal.D_mi,
    D: ED,    // Damage inflicted on friendly
    Fi: Ei,
    Fn: EFn,
  };

  return {
    friendly: friendlyData,
    enemy: enemyData,
  };
}