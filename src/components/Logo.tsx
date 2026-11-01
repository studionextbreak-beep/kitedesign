import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'

export function KiteMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" className={className} aria-hidden="true">
      <path d="M16 1.5 30 16 16 30.5 2 16Z" fill="url(#kiteGrad)" />
      <path d="M16 1.5v29M2 16h28" stroke="#14141b" strokeWidth="1.6" opacity="0.55" />
      <path d="M16 30.5c1.4 1.6 3 2.2 4.6 1.6" stroke="#14141b" strokeWidth="1.6" strokeLinecap="round" opacity="0.55" />
      <defs>
        <linearGradient id="kiteGrad" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff8a70" />
          <stop offset="1" stopColor="#ff5b3c" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function Logo({
  to = '/',
  light = false,
  size = 'md',
  showWord = true,
}: {
  to?: string
  light?: boolean
  size?: 'sm' | 'md' | 'lg'
  showWord?: boolean
}) {
  const markSize = size === 'lg' ? 40 : size === 'sm' ? 24 : 30
  const textSize = size === 'lg' ? 'text-4xl' : size === 'sm' ? 'text-lg' : 'text-2xl'
  return (
    <Link to={to} className="group inline-flex items-center gap-2.5" aria-label="Kite home">
      <span className="transition-transform duration-300 group-hover:-rotate-6">
        <KiteMark size={markSize} />
      </span>
      {showWord ? (
        <span
          className={cn(
            'font-display font-extrabold tracking-[-0.05em] leading-none',
            textSize,
            light ? 'text-cream' : 'text-ink',
          )}
        >
          kite
        </span>
      ) : null}
    </Link>
  )
}
