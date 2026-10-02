import { useState } from 'react'
import { db } from '../db'
import { defaultEquipment } from '../domain/equipment'
import { toISODate } from '../domain/program'
import type { Equipment, Profile } from '../domain/types'
import { EquipmentEditor } from '../ui/EquipmentEditor'

const STEPS = 3

export function Onboarding({ existing }: { existing?: Profile }) {
  const [step, setStep] = useState(0)
  const [profile, setProfile] = useState<Profile>(
    existing ?? { id: 'me', startDate: toISODate(new Date()), trainingTime: '17:00', onboarded: false },
  )
  const [equipment, setEquipment] = useState<Equipment>(defaultEquipment)

  const finish = async () => {
    await db.transaction('rw', db.profile, db.equipment, async () => {
      await db.equipment.put(equipment)
      await db.profile.put({ ...profile, onboarded: true })
    })
  }

  return (
    <main className="onboard">
      <div className="steps" aria-label={`Step ${step + 1} of ${STEPS}`}>
        {Array.from({ length: STEPS }, (_, i) => (
          <span key={i} className={i <= step ? 'done' : ''} />
        ))}
      </div>

      {step === 0 && (
        <>
          <h1 className="onboard-hero">Let's get you strong.</h1>
          <p>
            I'll plan every session, adjust it to how you're feeling, and add weight when you're ready. You just show up and
            log your sets.
          </p>
          <div className="section">
            <label className="field">
              <span>What should I call you?</span>
              <input
                className="input"
                value={profile.name ?? ''}
                autoComplete="given-name"
                onChange={(e) => setProfile({ ...profile, name: e.target.value || undefined })}
              />
            </label>
            <div className="fields-2">
              <label className="field">
                <span>Age</span>
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  value={profile.age ?? ''}
                  onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || undefined })}
                />
              </label>
              <label className="field">
                <span>Height (cm)</span>
                <input
                  className="input"
                  type="number"
                  inputMode="numeric"
                  value={profile.heightCm ?? ''}
                  onChange={(e) => setProfile({ ...profile, heightCm: parseInt(e.target.value) || undefined })}
                />
              </label>
            </div>
          </div>
        </>
      )}

      {step === 1 && (
        <>
          <div className="page-head">
            <h1>Your equipment</h1>
            <p className="muted">
              I've filled in what you told me. Adjust anything that's off. You can change this any time in Settings.
            </p>
          </div>
          <EquipmentEditor value={equipment} onChange={setEquipment} />
        </>
      )}

      {step === 2 && (
        <>
          <div className="page-head">
            <h1>Your schedule</h1>
            <p className="muted">Every day has a session. Most are light; three are strength days.</p>
          </div>
          <div className="fields-2">
            <label className="field">
              <span>Start date</span>
              <input
                className="input"
                type="date"
                value={profile.startDate}
                onChange={(e) => setProfile({ ...profile, startDate: e.target.value })}
              />
            </label>
            <label className="field">
              <span>Training time</span>
              <input
                className="input"
                type="time"
                value={profile.trainingTime}
                onChange={(e) => setProfile({ ...profile, trainingTime: e.target.value })}
              />
            </label>
          </div>
          <p className="notice small">
            Your first session is a short fitness test. It sets your starting levels so the plan fits you from day one.
          </p>
        </>
      )}

      <div className="onboard-actions">
        {step > 0 && (
          <button type="button" className="btn btn-quiet" onClick={() => setStep(step - 1)}>
            Back
          </button>
        )}
        {step < STEPS - 1 ? (
          <button type="button" className="btn btn-primary" onClick={() => setStep(step + 1)}>
            Continue
          </button>
        ) : (
          <button type="button" className="btn btn-primary" onClick={finish}>
            Start training
          </button>
        )}
      </div>
    </main>
  )
}
