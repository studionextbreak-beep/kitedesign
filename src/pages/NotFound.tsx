import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center bg-cream px-6">
      <div className="text-center">
        <div className="mb-6 flex justify-center">
          <Logo size="lg" />
        </div>
        <p className="font-display text-[7rem] font-extrabold leading-none tracking-tighter text-coral">404</p>
        <h1 className="mt-2 text-3xl font-bold">This page flew away</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-mute">
          The link might be old, or the design might have been deleted. Either way, there is plenty back at the studio.
        </p>
        <div className="mt-7 flex justify-center gap-2">
          <Link to="/" className="btn btn-coral">
            <ArrowLeft size={15} /> Back to Kite
          </Link>
          <Link to="/templates" className="btn btn-ghost">
            Browse templates
          </Link>
        </div>
      </div>
    </div>
  )
}
