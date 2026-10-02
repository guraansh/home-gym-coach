import { dumbbellLoads } from '../domain/equipment'
import type { Band, BandKind, Dumbbells, Equipment } from '../domain/types'
import { IconDown, IconRemove, IconUp } from './icons'

const bandKindLabels: Record<BandKind, string> = {
  mini: 'Mini loop',
  theraband: 'Theraband (flat)',
  tube: 'Tube with handles',
  long_loop: 'Long loop / pull-up band',
}

interface Props {
  value: Equipment
  onChange: (next: Equipment) => void
}

export function EquipmentEditor({ value, onChange }: Props) {
  const set = (patch: Partial<Equipment>) => onChange({ ...value, ...patch })

  return (
    <div className="section" style={{ gap: 28 }}>
      <DumbbellEditor value={value.dumbbells} onChange={(dumbbells) => set({ dumbbells })} />
      <BandEditor value={value.bands} onChange={(bands) => set({ bands })} />

      <div className="section">
        <h3>Other gear</h3>
        <div>
          <Toggle label="Door anchor for bands" checked={value.doorAnchor} onChange={(doorAnchor) => set({ doorAnchor })} />
          <Toggle label="Pull-up bar" checked={value.pullupBar} onChange={(pullupBar) => set({ pullupBar })} />
          <Toggle label="Bench" checked={value.bench} onChange={(bench) => set({ bench })} />
          <Toggle label="Exercise mat" checked={value.mat} onChange={(mat) => set({ mat })} />
          <Toggle
            label="Stationary cycle"
            checked={value.cycle.owned}
            onChange={(owned) => set({ cycle: { ...value.cycle, owned } })}
          />
        </div>
        {value.cycle.owned && (
          <label className="row-edit">
            <span className="grow">Highest resistance knob level</span>
            <NumberInput
              value={value.cycle.knobLevels}
              min={1}
              step={1}
              onChange={(knobLevels) => set({ cycle: { ...value.cycle, knobLevels } })}
              label="Highest knob level"
            />
          </label>
        )}
      </div>
    </div>
  )
}

function DumbbellEditor({ value, onChange }: { value: Dumbbells; onChange: (d: Dumbbells) => void }) {
  const loads = dumbbellLoads(value)

  return (
    <div className="section">
      <h3>Dumbbells</h3>
      <div className="segmented" role="group" aria-label="Dumbbell type">
        <button type="button" aria-pressed={value.mode === 'none'} onClick={() => onChange({ mode: 'none' })}>
          None yet
        </button>
        <button
          type="button"
          aria-pressed={value.mode === 'adjustable'}
          onClick={() =>
            value.mode !== 'adjustable' &&
            onChange({
              mode: 'adjustable',
              handleKg: 2,
              plates: [
                { kg: 1.25, count: 4 },
                { kg: 2.5, count: 4 },
                { kg: 5, count: 4 },
              ],
            })
          }
        >
          Adjustable
        </button>
        <button
          type="button"
          aria-pressed={value.mode === 'fixed'}
          onClick={() => value.mode !== 'fixed' && onChange({ mode: 'fixed', pairsKg: [5] })}
        >
          Fixed pairs
        </button>
      </div>

      {value.mode === 'none' && (
        <p className="muted small">
          No problem. You'll start with bodyweight and band exercises, and dumbbell exercises unlock when you add them here.
        </p>
      )}

      {value.mode === 'adjustable' && (
        <>
          <label className="row-edit">
            <span className="grow">Empty handle weight (kg)</span>
            <NumberInput
              value={value.handleKg}
              min={0}
              step={0.5}
              onChange={(handleKg) => onChange({ ...value, handleKg })}
              label="Handle weight"
            />
          </label>
          <div className="field">
            <span>Plates you own (total count of each size)</span>
            {value.plates.map((p, i) => (
              <div className="row-edit" key={i}>
                <NumberInput
                  value={p.kg}
                  min={0.25}
                  step={0.25}
                  onChange={(kg) => onChange({ ...value, plates: value.plates.map((q, j) => (j === i ? { ...q, kg } : q)) })}
                  label="Plate size in kg"
                />
                <span className="muted">kg ×</span>
                <NumberInput
                  value={p.count}
                  min={0}
                  step={2}
                  onChange={(count) => onChange({ ...value, plates: value.plates.map((q, j) => (j === i ? { ...q, count } : q)) })}
                  label="Number of plates"
                />
                <span className="grow" />
                <button
                  type="button"
                  className="icon-btn"
                  aria-label={`Remove ${p.kg} kg plates`}
                  onClick={() => onChange({ ...value, plates: value.plates.filter((_, j) => j !== i) })}
                >
                  <IconRemove />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn btn-quiet"
              onClick={() => onChange({ ...value, plates: [...value.plates, { kg: 2.5, count: 4 }] })}
            >
              Add plate size
            </button>
          </div>
        </>
      )}

      {value.mode === 'fixed' && (
        <label className="field">
          <span>Pair weights you own (kg, comma separated)</span>
          <input
            className="input"
            inputMode="decimal"
            defaultValue={value.pairsKg.join(', ')}
            onBlur={(e) =>
              onChange({
                mode: 'fixed',
                pairsKg: e.target.value
                  .split(',')
                  .map((s) => parseFloat(s))
                  .filter((n) => n > 0),
              })
            }
          />
        </label>
      )}

      {loads.length > 0 && (
        <div className="field">
          <span className="small muted">Weights you can load per dumbbell (in pairs)</span>
          <div className="load-chips">
            {loads.map((w) => (
              <span key={w}>{w}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function BandEditor({ value, onChange }: { value: Band[]; onChange: (b: Band[]) => void }) {
  const update = (i: number, patch: Partial<Band>) => onChange(value.map((b, j) => (j === i ? { ...b, ...patch } : b)))
  const move = (i: number, dir: -1 | 1) => {
    const next = [...value]
    const [b] = next.splice(i, 1)
    next.splice(i + dir, 0, b)
    onChange(next)
  }

  return (
    <div className="section">
      <div className="section-head">
        <h3>Bands</h3>
        <span className="small muted">Lightest first</span>
      </div>
      {value.map((b, i) => (
        <div className="panel" key={b.id} style={{ gap: 10 }}>
          <div className="row-edit">
            <input
              className="input grow"
              value={b.name}
              aria-label="Band name"
              onChange={(e) => update(i, { name: e.target.value })}
            />
            <button type="button" className="icon-btn" aria-label="Move lighter" disabled={i === 0} onClick={() => move(i, -1)}>
              <IconUp />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label="Move heavier"
              disabled={i === value.length - 1}
              onClick={() => move(i, 1)}
            >
              <IconDown />
            </button>
            <button
              type="button"
              className="icon-btn"
              aria-label={`Remove ${b.name}`}
              onClick={() => onChange(value.filter((_, j) => j !== i))}
            >
              <IconRemove />
            </button>
          </div>
          <div className="row-edit">
            <select
              className="input grow"
              value={b.kind}
              aria-label="Band type"
              onChange={(e) => update(i, { kind: e.target.value as BandKind })}
            >
              {Object.entries(bandKindLabels).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
            <NumberInput value={b.kg ?? 0} min={0} step={1} onChange={(kg) => update(i, { kg })} label="Resistance in kg" />
            <span className="muted">kg</span>
          </div>
        </div>
      ))}
      <button
        type="button"
        className="btn btn-quiet"
        onClick={() => onChange([...value, { id: `band-${Date.now()}`, name: 'New band', kind: 'tube', kg: 10 }])}
      >
        Add band
      </button>
    </div>
  )
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="toggle">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

export function NumberInput({
  value,
  onChange,
  min,
  step,
  label,
}: {
  value: number
  onChange: (n: number) => void
  min?: number
  step?: number
  label: string
}) {
  return (
    <input
      className="input input-num"
      type="number"
      inputMode="decimal"
      aria-label={label}
      value={Number.isFinite(value) ? value : ''}
      min={min}
      step={step}
      onChange={(e) => {
        const n = parseFloat(e.target.value)
        onChange(Number.isFinite(n) ? n : 0)
      }}
    />
  )
}
