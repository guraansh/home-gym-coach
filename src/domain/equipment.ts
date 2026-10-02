import type { Dumbbells, Equipment, Exercise, Gear } from './types'

export const defaultEquipment: Equipment = {
  id: 'me',
  dumbbells: { mode: 'none' },
  bands: [
    { id: 'mini-light', name: 'Mini loop, light', kind: 'mini', kg: 4 },
    { id: 'mini-medium-light', name: 'Mini loop, medium-light', kind: 'mini', kg: 7 },
    { id: 'mini-medium', name: 'Mini loop, medium', kind: 'mini', kg: 11 },
    { id: 'theraband', name: 'Theraband', kind: 'theraband', kg: 3 },
  ],
  doorAnchor: false,
  pullupBar: false,
  bench: false,
  mat: true,
  cycle: { owned: true, knobLevels: 8 },
}

export const gearLabels: Record<Gear, string> = {
  dumbbells: 'Dumbbells',
  mini_bands: 'Mini loop bands',
  theraband: 'Theraband',
  tube_bands: 'Tube bands with handles',
  door_anchor: 'Door anchor',
  pullup_bar: 'Pull-up bar',
  bench: 'Bench',
  mat: 'Mat',
}

export function ownedGear(eq: Equipment): Set<Gear> {
  const owned = new Set<Gear>()
  if (eq.dumbbells.mode !== 'none') owned.add('dumbbells')
  if (eq.bands.some((b) => b.kind === 'mini')) owned.add('mini_bands')
  if (eq.bands.some((b) => b.kind === 'theraband')) owned.add('theraband')
  if (eq.bands.some((b) => b.kind === 'tube' || b.kind === 'long_loop')) owned.add('tube_bands')
  if (eq.doorAnchor) owned.add('door_anchor')
  if (eq.pullupBar) owned.add('pullup_bar')
  if (eq.bench) owned.add('bench')
  if (eq.mat) owned.add('mat')
  return owned
}

/** Gear the exercise needs that you don't own yet. Empty means you can do it. */
export function missingGear(ex: Exercise, owned: Set<Gear>): Gear[] {
  // A mat is nice to have, never a blocker.
  return ex.gear.filter((g) => g !== 'mat' && !owned.has(g))
}

/**
 * Every per-dumbbell weight you can actually load.
 * `pair` means both dumbbells loaded identically (most exercises);
 * otherwise a single dumbbell (one-arm rows, goblet squats).
 * Plates go on in matching pairs, one each side of the handle.
 */
export function dumbbellLoads(db: Dumbbells, pair = true): number[] {
  if (db.mode === 'none') return []
  if (db.mode === 'fixed') return [...new Set(db.pairsKg)].sort((a, b) => a - b)

  const platesPerSide = pair ? 4 : 2
  let totals = [0]
  for (const stack of db.plates) {
    const maxPerSide = Math.floor(stack.count / platesPerSide)
    const next: number[] = []
    for (const t of totals) {
      for (let k = 0; k <= maxPerSide; k++) next.push(t + 2 * k * stack.kg)
    }
    totals = next
  }
  const loads = totals.map((t) => round(db.handleKg + t))
  return [...new Set(loads)].sort((a, b) => a - b)
}

/** Smallest loadable weight strictly heavier than `current`, or undefined at the top. */
export function nextDumbbellLoad(db: Dumbbells, current: number, pair = true): number | undefined {
  return dumbbellLoads(db, pair).find((w) => w > current + 1e-9)
}

/** Heaviest loadable weight at or below `target`. Falls back to the lightest. */
export function nearestDumbbellLoadAtOrBelow(db: Dumbbells, target: number, pair = true): number | undefined {
  const loads = dumbbellLoads(db, pair)
  if (loads.length === 0) return undefined
  const below = loads.filter((w) => w <= target + 1e-9)
  return below.length ? below[below.length - 1] : loads[0]
}

function round(n: number) {
  return Math.round(n * 100) / 100
}
