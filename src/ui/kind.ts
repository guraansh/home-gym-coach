import type { CSSProperties } from 'react'
import type { SessionKind } from '../domain/program'

/** Session types wear the resistance-band colour that matches their intensity. */
const kindColor: Record<SessionKind, string> = {
  recovery: 'var(--band-yellow)',
  mobility: 'var(--band-green)',
  zone2: 'var(--band-blue)',
  intervals: 'var(--band-red)',
  strength: 'var(--band-black)',
}

export function kindStyle(kind: SessionKind): CSSProperties {
  return { ['--kind-color' as string]: kindColor[kind] }
}
