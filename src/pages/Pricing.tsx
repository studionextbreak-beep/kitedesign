import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, ChevronDown, Minus, Sparkles, Users } from 'lucide-react'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { cn } from '@/lib/utils'

const TIERS = [
  {
    name: 'Free',
    monthly: 0,
    yearly: 0,
    blurb: 'For one person making good-looking work without a budget.',
    cta: 'Start free',
    to: '/templates',
    features: ['All 26 templates', 'Unlimited designs', 'PNG export at 1×', 'Personal brand colours', 'Browser autosave'],
  },
  {
    name: 'Pro',
    monthly: 9,
    yearly: 7,
    blurb: 'For freelancers and small teams shipping design every week.',
    cta: 'Go Pro',
    to: '/templates',
    highlight: true,
    features: [
      'Everything in Free',
      '2× high-resolution export',
      'Shared brand kit (3 brands)',
      'Multi-page decks',
      'Template history',
      'Priority email support',
    ],
  },
  {
    name: 'Teams',
    monthly: 24,
    yearly: 19,
    blurb: 'One brand, many hands, no version chaos.',
    cta: 'Talk to us',
    to: '/dashboard',
    features: [
      'Everything in Pro',
      'Shared folders and handoff',
      'Approval notes on any page',
      'Brand lock on colours and type',
      'Unlimited brand kits',
      'SSO on request',
    ],
  },
]

const MATRIX = [
  { label: 'Templates and canvas editor', free: true, pro: true, teams: true },
  { label: 'PNG export', free: '1×', pro: '2× / 4×', teams: '2× / 4×' },
  { label: 'Multi-page designs', free: true, pro: true, teams: true },
  { label: 'Brand kits', free: '1', pro: '3', teams: 'Unlimited' },
  { label: 'Shared folders', free: false, pro: false, teams: true },
  { label: 'Approval notes', free: false, pro: false, teams: true },
  { label: 'Brand lock', free: false, pro: false, teams: true },
  { label: 'Priority support', free: false, pro: true, teams: true },
]

const FAQ = [
  {
    q: 'Is the free plan really free?',
    a: 'Yes. Every template, unlimited designs and PNG export stay free forever. There is no watermark and we do not ask for a card when you sign up.',
  },
  {
    q: 'What counts as a brand kit?',
    a: 'A saved set of colours and fonts that shows up in the editor sidebar. Free includes one kit, Pro includes three, and Teams gets as many as you need.',
  },
  {
    q: 'Can I export for print?',
    a: 'Pro and Teams export at up to 4× the canvas size. A poster at 1080 × 1440 becomes 4320 × 5760, which is comfortable for large-format print.',
  },
  {
    q: 'Do you offer education or non-profit pricing?',
    a: 'We do — Teams at 50% for verified classrooms and registered non-profits. Email hello@kite.studio with a little context and we will sort it out.',
  },
  {
    q: 'What happens to my designs if I cancel?',
    a: 'Nothing. Everything you made stays available on the free plan, and everything you already exported is yours to keep.',
  },
]

function Cell({ value }: { value: boolean | string }) {
  if (value === true) return <Check size={16} className="mx-auto text-mint" />
  if (value === false) return <Minus size={16} className="mx-auto text-ink/25" />
  return <span className="text-xs font-medium text-ink/80">{value}</span>
}

export default function Pricing() {
  const [yearly, setYearly] = useState(false)
  const [open, setOpen] = useState<number | null>(0)

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />

      <section className="page-wrap pb-10 pt-12 text-center">
        <p className="label">Plans</p>
        <h1 className="mx-auto mt-3 max-w-2xl text-4xl font-bold sm:text-6xl">
          Pay for exports, not for <span className="text-coral">permission</span>
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-[15px] leading-relaxed text-ink-mute">
          The canvas, the templates and the good type are free. Upgrade when you need resolution, shared brand tools, or
          a second pair of hands on the file.
        </p>

        <div className="mt-7 inline-flex items-center gap-1 rounded-full border border-ink/12 bg-white p-1">
          <button
            type="button"
            onClick={() => setYearly(false)}
            className={cn('rounded-full px-4 py-1.5 text-xs font-semibold transition-colors', !yearly ? 'bg-ink text-cream' : 'text-ink-mute')}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setYearly(true)}
            className={cn('rounded-full px-4 py-1.5 text-xs font-semibold transition-colors', yearly ? 'bg-ink text-cream' : 'text-ink-mute')}
          >
            Yearly <span className="ml-1 text-[10px] text-mint">−20%</span>
          </button>
        </div>
      </section>

      <section className="page-wrap">
        <div className="grid gap-4 lg:grid-cols-3">
          {TIERS.map((tier) => {
            const price = yearly ? tier.yearly : tier.monthly
            return (
              <div
                key={tier.name}
                className={cn(
                  'relative flex flex-col rounded-3xl border p-7',
                  tier.highlight ? 'border-ink bg-ink text-cream shadow-2xl lg:-mt-3 lg:mb-3' : 'border-ink/10 bg-white',
                )}
              >
                {tier.highlight ? (
                  <span className="absolute right-6 top-6 rounded-full bg-coral px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </span>
                ) : null}
                <p className={cn('text-sm font-semibold', tier.highlight ? 'text-cream/70' : 'text-ink-mute')}>{tier.name}</p>
                <p className="mt-3 flex items-baseline gap-1.5">
                  <span className="font-display text-5xl font-extrabold tracking-tight">€{price}</span>
                  <span className={cn('text-xs', tier.highlight ? 'text-cream/60' : 'text-ink-mute')}>
                    {price === 0 ? 'forever' : yearly ? 'per month, billed yearly' : 'per month'}
                  </span>
                </p>
                <p className={cn('mt-3 text-sm leading-relaxed', tier.highlight ? 'text-cream/70' : 'text-ink-mute')}>{tier.blurb}</p>

                <ul className="mt-6 flex-1 space-y-2.5">
                  {tier.features.map((feature) => (
                    <li key={feature} className={cn('flex items-start gap-2 text-sm', tier.highlight ? 'text-cream/85' : 'text-ink/80')}>
                      <Check size={15} className="mt-0.5 shrink-0 text-mint" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <Link to={tier.to} className={cn('btn mt-7 w-full', tier.highlight ? 'btn-coral' : 'btn-ghost')}>
                  {tier.cta}
                  <ArrowRight size={15} />
                </Link>
              </div>
            )
          })}
        </div>
      </section>

      <section className="page-wrap py-16">
        <div className="overflow-hidden rounded-3xl border border-ink/10 bg-white">
          <div className="grid grid-cols-4 gap-2 border-b border-ink/10 bg-cream/60 px-5 py-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink-mute">
            <span>What you get</span>
            <span className="text-center">Free</span>
            <span className="text-center">Pro</span>
            <span className="text-center">Teams</span>
          </div>
          {MATRIX.map((row, index) => (
            <div
              key={row.label}
              className={cn('grid grid-cols-4 items-center gap-2 px-5 py-3 text-sm', index % 2 === 1 && 'bg-cream/40')}
            >
              <span className="text-ink/85">{row.label}</span>
              <span className="text-center"><Cell value={row.free} /></span>
              <span className="text-center"><Cell value={row.pro} /></span>
              <span className="text-center"><Cell value={row.teams} /></span>
            </div>
          ))}
        </div>
      </section>

      <section className="page-wrap pb-16">
        <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <p className="label">Questions</p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">The fine print, in plain words</h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-ink-mute">
              Anything else? Write to <span className="font-medium text-ink">hello@kite.studio</span> — a human answers,
              usually within a day.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs font-medium">
                <Users size={14} className="text-coral" /> 41,000+ makers
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-ink/10 bg-white px-3 py-2 text-xs font-medium">
                <Sparkles size={14} className="text-coral" /> No watermark
              </div>
            </div>
          </div>

          <div className="divide-y divide-ink/10 rounded-3xl border border-ink/10 bg-white">
            {FAQ.map((item, index) => (
              <div key={item.q}>
                <button
                  type="button"
                  onClick={() => setOpen(open === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-semibold">{item.q}</span>
                  <ChevronDown size={16} className={cn('shrink-0 transition-transform', open === index && 'rotate-180')} />
                </button>
                {open === index ? <p className="px-5 pb-5 text-sm leading-relaxed text-ink-mute">{item.a}</p> : null}
              </div>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
