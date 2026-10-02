import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { defaultEquipment, gearLabels, missingGear, ownedGear } from '../domain/equipment'
import { exercises, muscleLabels, patternLabels } from '../domain/exercises'
import type { Muscle, Pattern } from '../domain/types'
import { useEquipment } from '../hooks'

const muscleFilters: Muscle[] = ['side_delts', 'rear_delts', 'lats', 'chest', 'quads', 'glutes', 'hamstrings', 'core']

export function Library() {
  const equipment = useEquipment()
  const [query, setQuery] = useState('')
  const [muscle, setMuscle] = useState<Muscle | null>(null)
  const [onlyDoable, setOnlyDoable] = useState(false)

  const owned = useMemo(() => ownedGear(equipment ?? defaultEquipment), [equipment])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = exercises
      .map((ex) => ({ ex, missing: missingGear(ex, owned) }))
      .filter(({ ex, missing }) => {
        if (q && !ex.name.toLowerCase().includes(q)) return false
        if (muscle && !ex.primary.includes(muscle)) return false
        if (onlyDoable && missing.length) return false
        return true
      })
    const byPattern = new Map<Pattern, typeof list>()
    for (const item of list) {
      const arr = byPattern.get(item.ex.pattern) ?? []
      arr.push(item)
      byPattern.set(item.ex.pattern, arr)
    }
    return [...byPattern.entries()]
  }, [query, muscle, onlyDoable, owned])

  return (
    <main className="page">
      <div className="page-head">
        <h1>Exercises</h1>
        <p className="muted">How to do every move, with a demo link. Greyed-out ones need gear you don't have yet.</p>
      </div>

      <div className="section">
        <input
          className="input"
          type="search"
          placeholder="Search exercises"
          aria-label="Search exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Filter">
          <button type="button" className="chip" aria-pressed={onlyDoable} onClick={() => setOnlyDoable(!onlyDoable)}>
            Can do now
          </button>
          {muscleFilters.map((m) => (
            <button
              key={m}
              type="button"
              className="chip"
              aria-pressed={muscle === m}
              onClick={() => setMuscle(muscle === m ? null : m)}
            >
              {muscleLabels[m]}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="muted">No exercises match. Clear a filter to see more.</p>}

      {groups.map(([pattern, items]) => (
        <section key={pattern} className="ex-group">
          <h3>{patternLabels[pattern]}</h3>
          {items.map(({ ex, missing }) => (
            <Link key={ex.id} to={`/exercises/${ex.id}`} className={`ex-row${missing.length ? ' locked' : ''}`}>
              <div>
                <div className="name">{ex.name}</div>
                <div className="small muted">{ex.primary.map((m) => muscleLabels[m]).join(', ')}</div>
              </div>
              {missing.length > 0 && <span className="tag tag-lock">Needs {gearLabels[missing[0]].toLowerCase()}</span>}
            </Link>
          ))}
        </section>
      ))}
    </main>
  )
}
