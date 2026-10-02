import { describe, expect, it } from 'vitest'
import { defaultEquipment, dumbbellLoads, missingGear, nearestDumbbellLoadAtOrBelow, nextDumbbellLoad, ownedGear } from './equipment'
import type { Dumbbells } from './types'
import { exercises } from './exercises'

const spinLock: Dumbbells = {
  mode: 'adjustable',
  handleKg: 2,
  plates: [
    { kg: 1.25, count: 4 },
    { kg: 2.5, count: 4 },
    { kg: 5, count: 4 },
  ],
}

describe('dumbbellLoads', () => {
  it('returns nothing without dumbbells', () => {
    expect(dumbbellLoads({ mode: 'none' })).toEqual([])
  })

  it('loads a pair with one plate of each size per side', () => {
    // handle 2 + any subset of {2.5, 5, 10} (plates doubled for both sides)
    expect(dumbbellLoads(spinLock)).toEqual([2, 4.5, 7, 9.5, 12, 14.5, 17, 19.5])
  })

  it('allows twice as many plates per side on a single dumbbell', () => {
    const single = dumbbellLoads(spinLock, false)
    expect(single[single.length - 1]).toBe(2 + 2 * (2 * 1.25 + 2 * 2.5 + 2 * 5))
    expect(single).toContain(4.5)
  })

  it('dedupes and sorts fixed pairs', () => {
    expect(dumbbellLoads({ mode: 'fixed', pairsKg: [10, 5, 5, 7.5] })).toEqual([5, 7.5, 10])
  })

  it('finds the next and nearest loads', () => {
    expect(nextDumbbellLoad(spinLock, 7)).toBe(9.5)
    expect(nextDumbbellLoad(spinLock, 19.5)).toBeUndefined()
    expect(nearestDumbbellLoadAtOrBelow(spinLock, 11)).toBe(9.5)
    expect(nearestDumbbellLoadAtOrBelow(spinLock, 1)).toBe(2)
  })
})

describe('gear', () => {
  it('locks dumbbell exercises with the starting equipment', () => {
    const owned = ownedGear(defaultEquipment)
    const goblet = exercises.find((e) => e.id === 'goblet-squat')!
    expect(missingGear(goblet, owned)).toEqual(['dumbbells'])
  })

  it('has bodyweight and band options for every main pattern on day one', () => {
    const owned = ownedGear(defaultEquipment)
    const doable = exercises.filter((e) => missingGear(e, owned).length === 0)
    for (const p of ['squat', 'hinge', 'h_push', 'v_push', 'h_pull', 'rear_delt', 'core'] as const) {
      expect(doable.some((e) => e.pattern === p), p).toBe(true)
    }
  })
})
