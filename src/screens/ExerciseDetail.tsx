import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { db } from '../db'
import { gearLabels, missingGear, ownedGear } from '../domain/equipment'
import { chainOf, demoUrl, getExercise, muscleLabels } from '../domain/exercises'
import { useEquipment } from '../hooks'
import { IconBack, IconPlay } from '../ui/icons'

export function ExerciseDetail() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const ex = getExercise(id)
  const equipment = useEquipment()
  const pref = useLiveQuery(() => db.exercisePrefs.get(id), [id])
  const [videoDraft, setVideoDraft] = useState('')

  useEffect(() => {
    setVideoDraft(pref?.videoUrl ?? '')
  }, [pref])

  if (!ex) {
    return (
      <main className="page">
        <p>That exercise doesn't exist.</p>
        <Link to="/exercises" className="btn btn-quiet">
          Back to exercises
        </Link>
      </main>
    )
  }

  const missing = equipment ? missingGear(ex, ownedGear(equipment)) : []
  const chain = chainOf(ex.id)

  const saveVideo = async () => {
    const url = videoDraft.trim()
    if (url) await db.exercisePrefs.put({ exerciseId: ex.id, videoUrl: url })
    else await db.exercisePrefs.delete(ex.id)
  }

  return (
    <main className="page">
      <div className="page-head">
        <button type="button" className="icon-btn" aria-label="Back" onClick={() => navigate(-1)}>
          <IconBack />
        </button>
        <h1 style={{ marginTop: 8 }}>{ex.name}</h1>
        <p className="muted">
          {ex.primary.map((m) => muscleLabels[m]).join(', ')}
          {ex.secondary.length > 0 && <> (also {ex.secondary.map((m) => muscleLabels[m].toLowerCase()).join(', ')})</>}
          {ex.perSide && '. Each side.'}
        </p>
        {missing.length > 0 && (
          <p className="notice small">
            Needs {missing.map((g) => gearLabels[g].toLowerCase()).join(' and ')}. Add it in Settings to use this exercise.
          </p>
        )}
      </div>

      <a className="btn btn-primary btn-block" href={demoUrl(ex, pref?.videoUrl)} target="_blank" rel="noreferrer">
        <IconPlay />
        {pref?.videoUrl ? 'Watch your saved demo' : 'Watch demos on YouTube'}
      </a>

      <section className="section">
        <h2>How to do it</h2>
        <ol className="cue-list">
          {ex.cues.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ol>
      </section>

      <section className="section">
        <h2>Watch out for</h2>
        <ul className="cue-list mistakes">
          {ex.mistakes.map((m) => (
            <li key={m}>{m}</li>
          ))}
        </ul>
      </section>

      {chain && (
        <section className="section">
          <h2>Progression</h2>
          <p className="muted small">The coach moves you up this ladder as you get stronger.</p>
          <div className="ladder">
            {chain.ids.map((cid, i) => {
              const step = getExercise(cid)!
              const content = (
                <>
                  <span className="rung">{i + 1}</span>
                  <span>{step.name}</span>
                  <span className="small muted">{i < chain.index ? 'Easier' : i > chain.index ? 'Harder' : 'This one'}</span>
                </>
              )
              return i === chain.index ? (
                <span key={cid} className="current">
                  {content}
                </span>
              ) : (
                <Link key={cid} to={`/exercises/${cid}`} replace>
                  {content}
                </Link>
              )
            })}
          </div>
        </section>
      )}

      <section className="section">
        <h2>Your demo video</h2>
        <p className="muted small">Found a video you like? Paste its link and it replaces the search results.</p>
        <div className="row-edit">
          <input
            className="input grow"
            type="url"
            inputMode="url"
            placeholder="https://youtube.com/…"
            aria-label="Demo video link"
            value={videoDraft}
            onChange={(e) => setVideoDraft(e.target.value)}
          />
          <button type="button" className="btn btn-quiet" onClick={saveVideo}>
            Save
          </button>
        </div>
      </section>
    </main>
  )
}
