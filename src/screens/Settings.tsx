import { useEffect, useRef, useState } from 'react'
import { db, eraseEverything, exportBackup, importBackup } from '../db'
import { toISODate } from '../domain/program'
import type { Equipment, Profile } from '../domain/types'
import { useEquipment } from '../hooks'
import { EquipmentEditor } from '../ui/EquipmentEditor'

export function Settings({ profile }: { profile: Profile }) {
  const saved = useEquipment()
  const [equipment, setEquipment] = useState<Equipment | undefined>(saved)
  const [status, setStatus] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (saved && !equipment) setEquipment(saved)
  }, [saved, equipment])

  const dirty = !!equipment && JSON.stringify(equipment) !== JSON.stringify(saved)

  const saveEquipment = async () => {
    if (!equipment) return
    await db.equipment.put(equipment)
    setStatus('Equipment saved. Exercises that use it are now unlocked.')
  }

  const updateProfile = (patch: Partial<Profile>) => db.profile.put({ ...profile, ...patch })

  const download = async () => {
    const data = await exportBackup()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `home-gym-backup-${toISODate(new Date())}.json`
    a.click()
    URL.revokeObjectURL(url)
    setStatus('Backup downloaded. Keep it somewhere safe, like Google Drive.')
  }

  const restore = async (file: File) => {
    try {
      await importBackup(JSON.parse(await file.text()))
      setStatus('Backup restored.')
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'That file could not be read.')
    }
  }

  const erase = async () => {
    if (!confirm('Erase all your training data from this phone? This cannot be undone.')) return
    await eraseEverything()
  }

  return (
    <main className="page">
      <div className="page-head">
        <h1>Settings</h1>
      </div>

      {status && (
        <p className="notice small" role="status">
          {status}
        </p>
      )}

      <section className="section">
        <h2>You</h2>
        <label className="field">
          <span>Name</span>
          <input className="input" defaultValue={profile.name ?? ''} onBlur={(e) => updateProfile({ name: e.target.value || undefined })} />
        </label>
        <div className="fields-2">
          <label className="field">
            <span>Start date</span>
            <input className="input" type="date" value={profile.startDate} onChange={(e) => updateProfile({ startDate: e.target.value })} />
          </label>
          <label className="field">
            <span>Training time</span>
            <input
              className="input"
              type="time"
              value={profile.trainingTime}
              onChange={(e) => updateProfile({ trainingTime: e.target.value })}
            />
          </label>
        </div>
      </section>

      <section className="section">
        <h2>Equipment</h2>
        <p className="muted small">Bought something new? Add it here and the coach starts using it.</p>
        {equipment && <EquipmentEditor value={equipment} onChange={setEquipment} />}
        <button type="button" className="btn btn-primary btn-block" disabled={!dirty} onClick={saveEquipment}>
          {dirty ? 'Save equipment' : 'Equipment saved'}
        </button>
      </section>

      <section className="section">
        <h2>Backup</h2>
        <p className="muted small">
          Your training history lives only on this phone. Download a backup every week or two, especially before clearing
          browser data or changing phones.
        </p>
        <div className="btn-row">
          <button type="button" className="btn btn-primary" onClick={download}>
            Download backup
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => fileInput.current?.click()}>
            Restore from file
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) restore(f)
              e.target.value = ''
            }}
          />
        </div>
      </section>

      <section className="section">
        <h2>Start over</h2>
        <button type="button" className="btn btn-danger" onClick={erase}>
          Erase all data
        </button>
      </section>
    </main>
  )
}
