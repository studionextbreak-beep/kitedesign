import { Link } from 'react-router-dom'
import { Logo } from './Logo'
import { FORMATS } from '@/lib/constants'

const COLUMNS = [
  {
    title: 'Design',
    links: [
      { label: 'Templates', to: '/templates' },
      { label: 'Your work', to: '/dashboard' },
      { label: 'Plans', to: '/pricing' },
      { label: 'Brand kit', to: '/dashboard' },
    ],
  },
  {
    title: 'Create',
    links: [
      { label: 'Instagram post', to: '/templates' },
      { label: 'Presentation', to: '/templates' },
      { label: 'Poster', to: '/templates' },
      { label: 'Resume', to: '/templates' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/' },
      { label: 'Careers', to: '/' },
      { label: 'Press', to: '/' },
      { label: 'Contact', to: '/' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink/10 bg-cream">
      <div className="page-wrap py-14">
        <div className="grid gap-10 md:grid-cols-[1.3fr_repeat(3,1fr)]">
          <div>
            <Logo size="md" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink-mute">
              Kite is the design studio for people with things to say. Make it, move it, ship it — from one canvas.
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {FORMATS.slice(0, 3).map((format) => (
                <Link
                  key={format.id}
                  to="/templates"
                  className="rounded-full border border-ink/12 px-2.5 py-1 text-[11px] font-medium text-ink-mute hover:border-ink/30 hover:text-ink"
                >
                  {format.label}
                </Link>
              ))}
            </div>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <p className="label">{column.title}</p>
              <ul className="mt-3 space-y-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-ink/75 transition-colors hover:text-coral">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-ink/10 pt-6 text-xs text-ink-mute sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Kite Studio. A design tool built for the rest of us.</p>
          <div className="flex gap-5">
            <Link to="/" className="hover:text-ink">Terms</Link>
            <Link to="/" className="hover:text-ink">Privacy</Link>
            <span>Made on Kite</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
