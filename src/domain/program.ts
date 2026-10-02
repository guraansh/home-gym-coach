export type SessionKind = 'strength' | 'zone2' | 'intervals' | 'mobility' | 'recovery'

export interface DayPlan {
  kind: SessionKind
  title: string
  summary: string
  minutes: number
}

/** Phase 1 (weeks 1–4) weekly template, keyed by JS weekday (0 = Sunday). */
export const foundationWeek: Record<number, DayPlan> = {
  1: { kind: 'strength', title: 'Full body A', summary: 'Squat, push, row, core. Learning the movements.', minutes: 50 },
  2: { kind: 'zone2', title: 'Easy ride + desk reset', summary: '25 min at talking pace, then posture mobility.', minutes: 40 },
  3: { kind: 'strength', title: 'Full body B', summary: 'Hinge, overhead push, pull-down, glutes.', minutes: 50 },
  4: { kind: 'mobility', title: 'Mobility + core', summary: 'Hips, upper back, core, and an easy 15 min ride.', minutes: 35 },
  5: { kind: 'strength', title: 'Full body C', summary: 'Lunge, push-ups, rows, shoulders.', minutes: 50 },
  6: { kind: 'intervals', title: 'Intro intervals', summary: '6 × 30 s hard / 90 s easy on the cycle.', minutes: 30 },
  0: { kind: 'recovery', title: 'Recovery + check-in', summary: 'Walk or stretch, then log your waist.', minutes: 20 },
}

export const kindLabels: Record<SessionKind, string> = {
  strength: 'Strength',
  zone2: 'Easy cardio',
  intervals: 'Intervals',
  mobility: 'Mobility',
  recovery: 'Recovery',
}

/** Local-date helpers. All dates are stored as YYYY-MM-DD in the user's timezone. */
export function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function fromISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Monday-start week containing `d`. */
export function weekOf(d: Date): Date[] {
  const monday = new Date(d.getFullYear(), d.getMonth(), d.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i))
}

/** 1-based training week number since the start date (week 0 = before start). */
export function trainingWeek(startDate: string, today: Date): number {
  const start = weekOf(fromISODate(startDate))[0]
  const thisMonday = weekOf(today)[0]
  const days = Math.round((thisMonday.getTime() - start.getTime()) / 86_400_000)
  if (today < fromISODate(startDate)) return 0
  return Math.floor(days / 7) + 1
}
