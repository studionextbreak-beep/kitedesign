import { Check } from 'lucide-react'
import { useCloud } from '@/components/AccountMenu'
import { signInHref } from '@/lib/cloud'

export function CloudCard() {
  const cloud = useCloud()

  if (cloud.status === 'signed-in' && cloud.user) {
    const name = cloud.user.name ?? cloud.user.email ?? 'your account'
    return (
      <div className="rounded-2xl border border-mint/30 bg-mint/10 p-5">
        <p className="label">Cloud sync</p>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-semibold">
          <Check size={13} className="text-mint" />
          Synced as {name}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-mute">
          Designs are stored with your account, so they follow you to any device you sign in on.
        </p>
      </div>
    )
  }

  if (cloud.status === 'unavailable') {
    return (
      <div className="rounded-2xl border border-ink/10 bg-white p-5">
        <p className="label">Cloud sync</p>
        <p className="mt-1 text-sm font-semibold">Local workspace</p>
        <p className="mt-1 text-[11px] leading-relaxed text-ink-mute">
          This build is running without the sync backend, so designs stay in this browser. Sign-in and cross-device sync
          are live on the hosted deployment.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-ink/10 bg-white p-5">
      <p className="label">Cloud sync</p>
      <p className="mt-1 text-sm font-semibold">Keep your work on your account</p>
      <p className="mt-1 text-[11px] leading-relaxed text-ink-mute">
        Sign in with Freebuff — Google, GitHub or Apple — and every design here follows you to other devices. No password
        to remember.
      </p>
      <a href={signInHref('/dashboard')} className="btn btn-ink mt-3 h-8 px-3 text-[11px]">
        Sign in with Freebuff
      </a>
    </div>
  )
}
