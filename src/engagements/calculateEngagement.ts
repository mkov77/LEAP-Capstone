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
  "Infantry":                       { w: 12, A: 45, t: 1,  r: 8,  v: 1,  rho: 8,  b: 10, H: 100, D_mi: 25 },
  "Reconnaissance":                 { w: 12, A: 30, t: 1,  r: 3,  v: 1,  rho: 18, b: 15, H: 100, D_mi: 10 },
  "Armored Mechanized":             { w: 17, A: 25, t: 1,  r: 15, v: 2,  rho: 10, b: 10, H: 100, D_mi: 35 },
  "Combined Arms":                  { w: 15, A: 50, t: 1,  r: 8,  v: 1,  rho: 5,  b: 10, H: 100, D_mi: 35 },
  "Armored Mechanized Tracked":     { w: 17, A: 20, t: 1,  r: 10, v: 2,  rho: 6,  b: 15, H: 100, D_mi: 35 },
  "Field Artillery":                { w: 18, A: 15, t: 1,  r: 20, v: 2,  rho: 6,  b: 15, H: 100, D_mi: 40 },
  "Self-propelled":                 { w: 18, A: 22, t: 1,  r: 12, v: 2,  rho: 6,  b: 15, H: 100, D_mi: 35 },
  "Electronic Warfare":             { w: 20, A: 10, t: 1,  r: 15, v: 0,  rho: 0,  b: 30, H: 100, D_mi: 0  },
  "Signal":                         { w: 20, A: 40, t: 1,  r: 5,  v: 0,  rho: 0,  b: 30, H: 100, D_mi: 5  },
  "Special Operations Forces":      { w: 5,  A: 80, t: 1,  r: 7,  v: 1,  rho: 4,  b: 10, H: 100, D_mi: 25 },
  "Ammunition":                     { w: 10, A: 10, t: 1,  r: 10, v: 0,  rho: 0,  b: 0,  H: 100, D_mi: 0  },
  "Air Defense":                    { w: 30, A: 10, t: 1,  r: 15, v: 1,  rho: 5,  b: 40, H: 100, D_mi: 30 },
  "Engineer":                       { w: 17, A: 20, t: 1,  r: 5,  v: 1,  rho: 15, b: 15, H: 100, D_mi: 18 },
  "Air Assault":                    { w: 15, A: 50, t: 1,  r: 8,  v: 1,  rho: 5,  b: 10, H: 100, D_mi: 35 },
  "Medical Treatment Facility":     { w: 12, A: 15, t: 0,  r: 20, v: 0,  rho: 0,  b: 0,  H: 100, D_mi: 0  },
  "Aviation Rotary Wing":           { w: 15, A: 50, t: 1,  r: 10, v: 1,  rho: 0,  b: 20, H: 100, D_mi: 20 },
  "Combat Support":                 { w: 17, A: 20, t: 1,  r: 5,  v: 1,  rho: 15, b: 15, H: 100, D_mi: 15 },
  "Sustainment":                    { w: 17, A: 20, t: 1,  r: 5,  v: 1,  rho: 15, b: 15, H: 100, D_mi: 15 },
  "Unmanned Aerial Systems":        { w: 3,  A: 10, t: 1,  r: 8,  v: 1,  rho: 4,  b: 20, H: 100, D_mi: 15 },
  "Combat Service Support":         { w: 10, A: 10, t: 1,  r: 12, v: 0,  rho: 0,  b: 0,  H: 100, D_mi: 0  },
  "Petroleum, Oil and Lubricants":  { w: 10, A: 15, t: 0,  r: 12, v: 0,  rho: 0,  b: 0,  H: 100, D_mi: 0  },
  "Sea Port":                       { w: 20, A: 10, t: 0,  r: 12, v: 0,  rho: 0,  b: 0,  H: 100, D_mi: 0  },
  "Railhead":                       { w: 20, A: 10, t: 1,  r: 11, v: 0,  rho: 0,  b: 0,  H: 100, D_mi: 0  },
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
}): CalculationResult {

  const { friendly, enemy, friendlyMods, enemyMods } = params;

  // 1) Grab base table rows
  const friendBase = BASE_VALUES[friendly.unit_type] ?? DEFAULT_BASE;
  const foeBase = BASE_VALUES[enemy.unit_type] ?? DEFAULT_BASE;

  // 2) Apply all table-based modifiers to each side
  const fFinal = applyTableModifiers(friendBase, friendlyMods);
  const eFinal = applyTableModifiers(foeBase, enemyMods);

  // 3) For convenience, rename v -> sigma
  const sigmaF = fFinal.v;
  const sigmaE = eFinal.v;

  // 4) Detection Probability (example formula)
  const PF = 1 - Math.exp((-fFinal.w * fFinal.t) / fFinal.A);
  const PE = 1 - Math.exp((-eFinal.w * eFinal.t) / eFinal.A);

  // 5) We define final radius from area or just use r from table (your call).
  //    If you prefer "r = sqrt(A / pi)" do that here:
  //    let rF = Math.sqrt(fFinal.A / Math.PI);
  //    let rE = Math.sqrt(eFinal.A / Math.PI);
  //    Or just use rF = fFinal.r if you want the table's r.

  const rF = fFinal.r;
  const rE = eFinal.r;

  // 6) Probability of Hit
  const PhF = 1 - Math.exp(-(rF ** 2) / (2 * sigmaF ** 2));
  const PhE = 1 - Math.exp(-(rE ** 2) / (2 * sigmaE ** 2));

  // 7) Attacker Accuracy
  const drF = Math.exp(-(rF ** 2) / (2 * fFinal.b ** 2));
  const drE = Math.exp(-(rE ** 2) / (2 * eFinal.b ** 2));

  // 8) Health from DB (if zero or negative, fallback to base H)
  const Fi = friendly.unit_health > 0 ? friendly.unit_health : fFinal.H;
  const Ei = enemy.unit_health > 0 ? enemy.unit_health : eFinal.H;

  // 9) Damage inflicted
  let FD = fFinal.D_mi * PhF * drF;  // damage by friendly on enemy
  FD = Math.min(FD, Ei);            // clamp so we don't exceed enemy HP

  let ED = eFinal.D_mi * PhE * drE; // damage by enemy on friendly
  ED = Math.min(ED, Fi);           // clamp so we don't exceed friendly HP

  // 10) Final HP
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
    D: FD,    // how much damage this side inflicted on the enemy
    Fi: Fi,   // initial HP
    Fn: FFn,  // final HP after taking ED damage from enemy
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
    D: ED,    // how much damage enemy inflicted on friendly
    Fi: Ei,
    Fn: EFn,
  };

  return {
    friendly: friendlyData,
    enemy: enemyData,
  };
}