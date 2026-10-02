import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'
import { defaultEquipment } from './domain/equipment'

/** `undefined` while loading, `null` when there is no profile yet. */
export function useProfile() {
  return useLiveQuery(async () => (await db.profile.get('me')) ?? null)
}

export function useEquipment() {
  return useLiveQuery(async () => (await db.equipment.get('me')) ?? defaultEquipment)
}
