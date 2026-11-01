import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { useLocation } from 'react-router-dom'
import { Check, Loader2, LogOut, UserRound } from 'lucide-react'
import { getCloudSnapshot, signInHref, subscribeCloud } from '@/lib/cloud'
import type { CloudSnapshot } from '@/lib/cloud'

export function useCloud(): CloudSnapshot {
  return useSyncExternalStore(subscribeCloud, getCloudSnapshot, getCloudSnapshot)
}

function initialsOf(name: string): string {
  return name
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AccountMenu() {
  const cloud = useCloud()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onPointerDown = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [])

  if (cloud.status === 'unknown') {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-full border border-ink/12 text-ink-mute" title="Checking session">
        <Loader2 size={14} className="animate-spin" />
      </span>
    )
  }

  if (cloud.status === 'unavailable') {
    return (
      <span
        className="hidden items-center gap-1.5 rounded-full border border-ink/12 px-3 py-1.5 text-xs font-medium text-ink-mute sm:inline-flex"
        title="This build has no sync backend. Sign-in and cross-device sync work on the hosted deployment."
      >
        <UserRound size={13} />
        Local workspace
      </span>
    )
  }

  if (cloud.status === 'signed-out' || !cloud.user) {
    return (
      <a
        href={signInHref(location.pathname)}
        className="btn btn-ghost h-9 px-3 text-xs"
        aria-label="Sign in with Freebuff"
        title="Sign in with Freebuff"
      >
        Sign in
      </a>
    )
  }

  const user = cloud.user
  const name = user.name ?? user.email ?? 'Your account'
  const initials = initialsOf(name) || 'K'

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-ink text-[11px] font-semibold text-cream transition-transform hover:-translate-y-0.5"
        title={name}
        aria-label="Account menu"
      >
        {user.picture ? (
          <img src={user.picture} alt="" className="h-full w-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-11 z-50 w-60 overflow-hidden rounded-2xl border border-ink/10 bg-white p-3 shadow-xl">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-cream text-[11px] font-semibold text-ink">
              {user.picture ? <img src={user.picture} alt="" className="h-full w-full object-cover" /> : initials}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{name}</span>
              {user.email ? <span className="block truncate text-[11px] text-ink-mute">{user.email}</span> : null}
            </span>
          </div>

          <p className="mt-3 flex items-center gap-1.5 rounded-lg bg-mint/12 px-2 py-1.5 text-[11px] font-medium text-ink">
            <Check size={12} className="text-mint" />
            Designs synced to your account
          </p>

          <a href="/dashboard" className="mt-2 block rounded-lg px-2 py-1.5 text-xs font-medium hover:bg-cream">
            Your work
          </a>

          <form method="post" action="/auth/freebuff/signout">
            <button
              type="submit"
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs font-medium text-ink hover:bg-cream"
            >
              <LogOut size={13} />
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
