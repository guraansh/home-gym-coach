export type Muscle =
  | 'chest'
  | 'front_delts'
  | 'side_delts'
  | 'rear_delts'
  | 'lats'
  | 'upper_back'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core'

export type Pattern =
  | 'squat'
  | 'hinge'
  | 'h_push'
  | 'v_push'
  | 'h_pull'
  | 'v_pull'
  | 'side_delt'
  | 'rear_delt'
  | 'arms'
  | 'core'
  | 'glute'
  | 'calf'
  | 'mobility'

/** Things an exercise can require. Household items (chair, couch, wall, sturdy table) are assumed. */
export type Gear =
  | 'dumbbells'
  | 'mini_bands'
  | 'theraband'
  | 'tube_bands'
  | 'door_anchor'
  | 'pullup_bar'
  | 'bench'
  | 'mat'

/** How load is expressed and progressed for an exercise. */
export type LoadType = 'dumbbell' | 'band' | 'bodyweight' | 'hold'

/** Which rep range the coach targets. */
export type Scheme = 'compound' | 'isolation' | 'hold' | 'mobility'

export interface Exercise {
  id: string
  name: string
  pattern: Pattern
  primary: Muscle[]
  secondary: Muscle[]
  gear: Gear[]
  loadType: LoadType
  scheme: Scheme
  /** Done one side at a time; reps and holds are per side. */
  perSide?: boolean
  cues: string[]
  mistakes: string[]
  /** YouTube search phrase for the demo link. */
  search: string
}

export type BandKind = 'mini' | 'tube' | 'theraband' | 'long_loop'

export interface Band {
  id: string
  name: string
  kind: BandKind
  /** Approximate peak resistance in kg, if known. Used only for ordering. */
  kg?: number
}

export interface PlateStack {
  kg: number
  /** Total number of plates of this size you own. */
  count: number
}

export type Dumbbells =
  | { mode: 'none' }
  | { mode: 'adjustable'; handleKg: number; plates: PlateStack[] }
  | { mode: 'fixed'; pairsKg: number[] }

export interface Equipment {
  id: 'me'
  dumbbells: Dumbbells
  /** Ordered light → heavy within each kind. */
  bands: Band[]
  doorAnchor: boolean
  pullupBar: boolean
  bench: boolean
  mat: boolean
  cycle: { owned: boolean; knobLevels: number }
}

export interface Profile {
  id: 'me'
  name?: string
  age?: number
  heightCm?: number
  startDate: string // YYYY-MM-DD
  trainingTime: string // HH:MM
  onboarded: boolean
}

export interface ExercisePref {
  exerciseId: string
  videoUrl?: string
}

export interface BodyMetric {
  id?: number
  date: string
  waistCm: number
  weightKg?: number
}
