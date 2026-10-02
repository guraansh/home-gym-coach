import { useEffect } from 'react'
import { NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { useProfile } from './hooks'
import { Onboarding } from './screens/Onboarding'
import { Today } from './screens/Today'
import { Library } from './screens/Library'
import { ExerciseDetail } from './screens/ExerciseDetail'
import { Settings } from './screens/Settings'
import { IconLibrary, IconSettings, IconToday } from './ui/icons'

export function App() {
  const profile = useProfile()
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (profile === undefined) return null
  if (!profile?.onboarded) return <Onboarding existing={profile ?? undefined} />

  return (
    <div className="shell">
      <Routes>
        <Route path="/" element={<Today profile={profile} />} />
        <Route path="/exercises" element={<Library />} />
        <Route path="/exercises/:id" element={<ExerciseDetail />} />
        <Route path="/settings" element={<Settings profile={profile} />} />
      </Routes>
      <nav className="nav" aria-label="Main">
        <div className="nav-inner">
          <NavLink to="/" end>
            <IconToday />
            Today
          </NavLink>
          <NavLink to="/exercises">
            <IconLibrary />
            Exercises
          </NavLink>
          <NavLink to="/settings">
            <IconSettings />
            Settings
          </NavLink>
        </div>
      </nav>
    </div>
  )
}
