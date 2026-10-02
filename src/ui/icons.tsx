import type { SVGProps } from 'react'

const base: SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
}

export const IconToday = () => (
  <svg {...base}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </svg>
)

export const IconLibrary = () => (
  <svg {...base}>
    <path d="M6 7v10M18 7v10M3 9v6M21 9v6M6 12h12" />
  </svg>
)

export const IconSettings = () => (
  <svg {...base}>
    <path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0" />
    <circle cx="16" cy="6" r="2" />
    <circle cx="10" cy="12" r="2" />
    <circle cx="18" cy="18" r="2" />
  </svg>
)

export const IconUp = () => (
  <svg {...base}>
    <path d="M6 15l6-6 6 6" />
  </svg>
)

export const IconDown = () => (
  <svg {...base}>
    <path d="M6 9l6 6 6-6" />
  </svg>
)

export const IconRemove = () => (
  <svg {...base}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconBack = () => (
  <svg {...base}>
    <path d="M15 6l-6 6 6 6" />
  </svg>
)

export const IconPlay = () => (
  <svg {...base} fill="currentColor" stroke="none">
    <path d="M8 5v14l11-7z" />
  </svg>
)
