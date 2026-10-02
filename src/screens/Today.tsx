import { foundationWeek, fromISODate, kindLabels, toISODate, trainingWeek, weekOf } from '../domain/program'
import type { Profile } from '../domain/types'
import { IconPlay } from '../ui/icons'
import { kindStyle } from '../ui/kind'

const weekdayShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const weekdayLong = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function Today({ profile }: { profile: Profile }) {
  const now = new Date()
  const todayISO = toISODate(now)
  const week = trainingWeek(profile.startDate, now)
  const notStarted = todayISO < profile.startDate
  const plan = foundationWeek[now.getDay()]
  const days = weekOf(now)

  const dateLine = notStarted
    ? `Starts ${fromISODate(profile.startDate).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}`
    : `${weekdayLong[now.getDay()]}, week ${week} of foundation`

  return (
    <main className="page">
      <section className="today-hero" style={kindStyle(plan.kind)}>
        <p className="date-line">{greeting(now, profile.name)}</p>
        <h1 className="session-title">{plan.title}</h1>
        <div className="session-meta">
          <span>
            <span className="kind-dot" />
            {kindLabels[plan.kind]}
          </span>
          <span>{plan.minutes} min</span>
        </div>
        <p>{plan.summary}</p>
        <button type="button" className="btn btn-go btn-block" disabled>
          <IconPlay />
          Start session
        </button>
        <p className="small" style={{ opacity: 0.7 }}>
          {dateLine}. Session logging arrives in the next update.
        </p>
      </section>

      <section className="section">
        <div className="section-head">
          <h2>This week</h2>
        </div>
        <div className="week-strip" aria-hidden="true">
          {days.map((d) => {
            const p = foundationWeek[d.getDay()]
            const isToday = toISODate(d) === todayISO
            return (
              <div key={d.getDay()} className={`week-day${isToday ? ' is-today' : ''}`} style={kindStyle(p.kind)}>
                <div className="bar" />
                {weekdayShort[d.getDay()][0]}
              </div>
            )
          })}
        </div>
        <div className="week-list">
          {days.map((d) => {
            const p = foundationWeek[d.getDay()]
            const isToday = toISODate(d) === todayISO
            return (
              <div key={d.getDay()} className={`week-row${isToday ? ' is-today' : ''}`} style={kindStyle(p.kind)}>
                <span className="day">{weekdayShort[d.getDay()]}</span>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.title}</div>
                  <div className="small muted">
                    <span className="kind-dot" />
                    {kindLabels[p.kind]}
                  </div>
                </div>
                <span className="small muted">{p.minutes} min</span>
              </div>
            )
          })}
        </div>
      </section>
    </main>
  )
}

function greeting(now: Date, name?: string) {
  const h = now.getHours()
  const part = h < 12 ? 'Morning' : h < 17 ? 'Afternoon' : 'Evening'
  return name ? `${part}, ${name}` : part
}
