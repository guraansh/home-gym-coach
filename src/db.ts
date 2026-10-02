import Dexie, { type EntityTable } from 'dexie'
import type { BodyMetric, Equipment, ExercisePref, Profile } from './domain/types'

/**
 * All training data lives on this device in IndexedDB.
 * Tables for later stages (sessions, logs, assessments) are declared now
 * so the schema doesn't need a migration when those features land.
 */
export const db = new Dexie('home-gym-coach') as Dexie & {
  profile: EntityTable<Profile, 'id'>
  equipment: EntityTable<Equipment, 'id'>
  exercisePrefs: EntityTable<ExercisePref, 'exerciseId'>
  bodyMetrics: EntityTable<BodyMetric, 'id'>
  programState: EntityTable<{ id: 'me' } & Record<string, unknown>, 'id'>
  exerciseState: EntityTable<{ exerciseId: string } & Record<string, unknown>, 'exerciseId'>
  sessions: EntityTable<{ id?: number; date: string } & Record<string, unknown>, 'id'>
  setLogs: EntityTable<{ id?: number; sessionId: number; exerciseId: string; date: string } & Record<string, unknown>, 'id'>
  cardioLogs: EntityTable<{ id?: number; sessionId: number; date: string } & Record<string, unknown>, 'id'>
  assessments: EntityTable<{ id?: number; date: string } & Record<string, unknown>, 'id'>
  achievements: EntityTable<{ id?: number; kind: string; date: string } & Record<string, unknown>, 'id'>
}

db.version(1).stores({
  profile: 'id',
  equipment: 'id',
  exercisePrefs: 'exerciseId',
  bodyMetrics: '++id, date',
  programState: 'id',
  exerciseState: 'exerciseId',
  sessions: '++id, date, kind, status',
  setLogs: '++id, sessionId, exerciseId, date',
  cardioLogs: '++id, sessionId, date',
  assessments: '++id, date',
  achievements: '++id, kind, date',
})

const tableNames = [
  'profile',
  'equipment',
  'exercisePrefs',
  'bodyMetrics',
  'programState',
  'exerciseState',
  'sessions',
  'setLogs',
  'cardioLogs',
  'assessments',
  'achievements',
] as const

export interface Backup {
  app: 'home-gym-coach'
  version: 1
  exportedAt: string
  tables: Record<string, unknown[]>
}

export async function exportBackup(): Promise<Backup> {
  const tables: Record<string, unknown[]> = {}
  for (const name of tableNames) tables[name] = await db.table(name).toArray()
  return { app: 'home-gym-coach', version: 1, exportedAt: new Date().toISOString(), tables }
}

/** Replaces everything on this device with the backup's contents. */
export async function importBackup(data: unknown): Promise<void> {
  const backup = data as Partial<Backup>
  if (backup?.app !== 'home-gym-coach' || typeof backup.tables !== 'object' || !backup.tables) {
    throw new Error('This file is not a Home Gym Coach backup.')
  }
  const tables = backup.tables
  await db.transaction('rw', tableNames.map((n) => db.table(n)), async () => {
    for (const name of tableNames) {
      await db.table(name).clear()
      const rows = tables[name]
      if (Array.isArray(rows) && rows.length) await db.table(name).bulkAdd(rows)
    }
  })
}

export async function eraseEverything(): Promise<void> {
  await db.transaction('rw', tableNames.map((n) => db.table(n)), async () => {
    for (const name of tableNames) await db.table(name).clear()
  })
}
