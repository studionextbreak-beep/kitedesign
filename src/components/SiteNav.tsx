import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, Search, Sparkles, X } from 'lucide-react'
import { Logo } from './Logo'
import { AccountMenu } from './AccountMenu'
import { NAV_LINKS } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        scrolled ? 'border-b border-ink/10 bg-cream/85 backdrop-blur-xl' : 'border-b border-transparent bg-transparent',
      )}
    >
      <div className="page-wrap flex h-16 items-center gap-6">
        <Logo />

        <nav className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              className={({ isActive }) =>
                cn(
                  'rounded-full px-3.5 py-2 text-sm font-medium transition-colors',
                  isActive && link.to !== '/'
                    ? 'bg-ink/6 text-ink'
                    : 'text-ink/70 hover:bg-ink/5 hover:text-ink',
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to="/templates"
            className="hidden items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-3.5 py-2 text-sm text-ink-mute transition-colors hover:border-ink/40 hover:text-ink sm:flex"
          >
            <Search size={15} />
            <span>Search templates</span>
            <kbd className="ml-2 rounded border border-ink/15 bg-cream px-1.5 py-0.5 text-[10px] font-medium text-ink-mute">⌘K</kbd>
          </Link>
          <AccountMenu />
          <Link to="/templates" className="btn btn-coral hidden sm:inline-flex">
            <Sparkles size={16} />
            Start designing
          </Link>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-full border border-ink/15 md:hidden"
            aria-label="Toggle menu"
          >
            {open ? <X size={17} /> : <Menu size={17} />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-ink/10 bg-cream px-5 pb-5 pt-3 md:hidden">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link key={link.label} to={link.to} className="rounded-xl px-3 py-2.5 text-sm font-medium hover:bg-ink/5">
                {link.label}
              </Link>
            ))}
            <Link to="/templates" className="btn btn-coral mt-2">
              Start designing
            </Link>
          </div>
        </div>
      ) : null}
    </header>
  )
}
