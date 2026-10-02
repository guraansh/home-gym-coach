import { describe, expect, it } from 'vitest'
import { chainOf, chains, demoUrl, exercises, getExercise } from './exercises'

describe('exercise library', () => {
  it('has unique ids', () => {
    const ids = exercises.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('only references real exercises in chains', () => {
    for (const [name, ids] of Object.entries(chains)) {
      for (const id of ids) expect(getExercise(id), `${name}: ${id}`).toBeDefined()
    }
  })

  it('puts each exercise in at most one chain', () => {
    const all = Object.values(chains).flat()
    expect(new Set(all).size).toBe(all.length)
  })

  it('gives every exercise cues and a muscle', () => {
    for (const e of exercises) {
      expect(e.cues.length, e.id).toBeGreaterThan(0)
      expect(e.primary.length, e.id).toBeGreaterThan(0)
    }
  })

  it('locates an exercise in its chain', () => {
    expect(chainOf('push-up')).toMatchObject({ name: 'pushUp', index: 2 })
    expect(chainOf('band-pull-apart')).toBeUndefined()
  })

  it('prefers a pinned video over the search link', () => {
    const e = getExercise('plank')!
    expect(demoUrl(e)).toContain('youtube.com/results?search_query=plank')
    expect(demoUrl(e, 'https://youtu.be/x')).toBe('https://youtu.be/x')
  })
})
