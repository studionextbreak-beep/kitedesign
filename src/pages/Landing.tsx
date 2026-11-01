import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Check,
  Download,
  Layers,
  LayoutTemplate,
  Palette,
  PenTool,
  Play,
  Quote,
  Sparkles,
  Star,
  Type,
  Wand2,
  Zap,
} from 'lucide-react'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { ResponsivePageThumb } from '@/editor/render'
import { TEMPLATES, templateById } from '@/lib/templates'
import { FORMATS } from '@/lib/constants'

const MARQUEE = TEMPLATES.filter((template) =>
  ['new-drop', 'sunset-sessions', 'jazz-night', 'growth-tips', 'recipe-pin', 'quarterly-review', 'warehouse-sale', 'gallery-opening', 'studio-card', 'brand-strategy', 'film-fest', 'resume-designer'].includes(
    template.id,
  ),
)

const FEATURES = [
  {
    icon: LayoutTemplate,
    title: 'Templates that do not look like templates',
    body: 'Two dozen starting points designed in-house — type-led, photo-ready, and every one of them editable down to the last pixel.',
    tone: 'bg-lilac/25',
  },
  {
    icon: Layers,
    title: 'A canvas that behaves',
    body: 'Snap guides, layers, multi-page decks and real undo. The boring parts of a design tool, done properly.',
    tone: 'bg-mint/20',
  },
  {
    icon: Type,
    title: 'Type with taste built in',
    body: 'Eleven curated families with pairings that work, plus letter-spacing, line-height and opacity controls that respond live.',
    tone: 'bg-sand',
  },
  {
    icon: Palette,
    title: 'One palette, everywhere',
    body: 'Save brand colours and fonts once, then pull them into any design in a click. No more hex-code archaeology.',
    tone: 'bg-coral/15',
  },
  {
    icon: Download,
    title: 'Exports that hold up',
    body: 'PNG at 2× for the feed, a clean flat file for print. No watermarks, no “upgrade to remove” on the way out.',
    tone: 'bg-sky/30',
  },
  {
    icon: Wand2,
    title: 'Nothing to install',
    body: 'It runs in the tab you already have open. Designs autosave as you work, so closing the laptop is not a disaster.',
    tone: 'bg-sun/25',
  },
]

const STATS = [
  { value: '26', label: 'in-house templates' },
  { value: '11', label: 'curated font families' },
  { value: '2×', label: 'print-ready export' },
  { value: '0', label: 'watermarks, ever' },
]

const TESTIMONIALS = [
  {
    quote:
      'We replaced three tools with Kite. The templates are actually good, which means the team stops asking me to fix their slides.',
    name: 'Priya Raman',
    role: 'Head of brand, Northfold',
    initials: 'PR',
  },
  {
    quote:
      'The export is the thing. Everything I made in Kite went straight into a print run without a single argument with the printer.',
    name: 'Tomas Bauer',
    role: 'Founder, Field Notes Press',
    initials: 'TB',
  },
  {
    quote:
      'It feels like a real design tool that happens to be in a browser. Layers, snapping, keyboard shortcuts — all of it.',
    name: 'Adaeze Okafor',
    role: 'Freelance designer',
    initials: 'AO',
  },
]

const PLANS = [
  {
    name: 'Free',
    price: '€0',
    cadence: 'forever',
    blurb: 'Everything one person needs to make good-looking work.',
    features: ['All 26 templates', 'Unlimited designs', 'PNG export', 'Personal brand colours'],
    cta: 'Start free',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '€9',
    cadence: 'per month',
    blurb: 'For people who ship design every week.',
    features: ['Everything in Free', '2× high-res export', 'Shared brand kit', 'Multi-page decks', 'Priority support'],
    cta: 'Go Pro',
    highlight: true,
  },
  {
    name: 'Teams',
    price: '€24',
    cadence: 'per seat / month',
    blurb: 'One brand, many hands, no chaos.',
    features: ['Everything in Pro', 'Shared folders', 'Approval notes', 'Brand lock', 'SSO on request'],
    cta: 'Talk to us',
    highlight: false,
  },
]

function HeroCollage() {
  const story = templateById('sunset-sessions')!
  const square = templateById('new-drop')!
  const poster = templateById('jazz-night')!

  return (
    <div className="relative mx-auto h-[430px] w-full max-w-[520px] sm:h-[520px]">
      <div className="absolute inset-0 -z-10 rounded-[2.5rem] bg-[radial-gradient(circle_at_30%_20%,rgba(255,91,60,0.18),transparent_60%),radial-gradient(circle_at_75%_75%,rgba(185,166,255,0.28),transparent_55%)]" />

      <div className="absolute right-0 top-0 w-[54%] rotate-[5deg] animate-float">
        <div className="rounded-2xl bg-white p-2 shadow-[0_24px_60px_-24px_rgba(20,20,27,0.45)]">
          <ResponsivePageThumb design={square.design} page={square.design.pages[0]} />
          <p className="px-1 pb-0.5 pt-1.5 text-[10px] font-medium text-ink-mute">Collection 04 · Poster</p>
        </div>
      </div>

      <div className="absolute left-0 top-[16%] w-[44%] -rotate-[7deg]" style={{ animationDelay: '-2s' }}>
        <div className="rounded-2xl bg-white p-2 shadow-[0_24px_60px_-24px_rgba(20,20,27,0.4)]">
          <ResponsivePageThumb design={story.design} page={story.design.pages[0]} />
          <p className="px-1 pb-0.5 pt-1.5 text-[10px] font-medium text-ink-mute">Sunset Sessions · Story</p>
        </div>
      </div>

      <div className="absolute bottom-0 left-[24%] w-[48%] rotate-[3deg]">
        <div className="rounded-2xl bg-white p-2 shadow-[0_30px_70px_-28px_rgba(20,20,27,0.5)]">
          <ResponsivePageThumb design={poster.design} page={poster.design.pages[0]} />
          <p className="px-1 pb-0.5 pt-1.5 text-[10px] font-medium text-ink-mute">Jazz Night · Poster</p>
        </div>
      </div>

      <div className="absolute -left-2 top-[6%] flex items-center gap-2 rounded-full bg-ink px-3 py-2 text-[11px] font-medium text-cream shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
        </span>
        Autosaved just now
      </div>

      <div className="absolute -bottom-3 right-2 flex items-center gap-2 rounded-2xl bg-white px-3 py-2 shadow-lg ring-1 ring-ink/10">
        <div className="flex -space-x-1.5">
          {['MV', 'IP', 'PR'].map((initials, index) => (
            <span
              key={initials}
              className="grid h-6 w-6 place-items-center rounded-full border-2 border-white text-[9px] font-semibold text-ink"
              style={{ background: ['#ffd3c7', '#cdf3e6', '#e2d9ff'][index] }}
            >
              {initials}
            </span>
          ))}
        </div>
        <span className="text-[11px] font-medium text-ink-mute">3 people editing</span>
      </div>
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />

      {/* Hero */}
      <section className="page-wrap grid items-center gap-12 pb-10 pt-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:pb-20 lg:pt-16">
        <div className="animate-rise">
          <div className="inline-flex items-center gap-2 rounded-full border border-ink/12 bg-white px-3 py-1.5 text-xs font-medium text-ink/75">
            <Sparkles size={13} className="text-coral" />
            Brand kits are here
            <span className="h-1 w-1 rounded-full bg-ink/25" />
            <span className="text-ink-mute">New in Kite 2.0</span>
          </div>

          <h1 className="mt-5 text-[clamp(2.75rem,6.2vw,4.75rem)] font-bold">
            Make something
            <br />
            worth
            <span className="relative ml-3 inline-block">
              <span className="relative z-10">staring at.</span>
              <svg
                className="absolute -bottom-1 left-0 z-0 w-full text-coral"
                height="14"
                viewBox="0 0 300 14"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path d="M2 9c60-7 130-9 296-4" stroke="currentColor" strokeWidth="6" fill="none" strokeLinecap="round" />
              </svg>
            </span>
          </h1>

          <p className="mt-6 max-w-lg text-[1.0625rem] leading-relaxed text-ink-mute">
            Kite is a design studio for the rest of us — start from a template that already looks good, then make it
            yours. Posters, decks, stories, resumes. All of it, in one canvas.
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/templates" className="btn btn-coral text-base">
              Start designing — it’s free
              <ArrowRight size={17} />
            </Link>
            <Link to="/dashboard" className="btn btn-ghost text-base">
              <Play size={15} />
              See your work
            </Link>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-ink-mute">
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-mint" /> No card required
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-mint" /> No watermarks
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check size={14} className="text-mint" /> Works in your browser
            </span>
          </div>
        </div>

        <HeroCollage />
      </section>

      {/* Quick formats */}
      <section className="page-wrap pb-4">
        <div className="flex flex-wrap items-center gap-2 border-y border-ink/10 py-4">
          <span className="mr-1 text-xs font-semibold uppercase tracking-[0.14em] text-ink-mute">Start with</span>
          {FORMATS.slice(0, 7).map((format) => (
            <Link key={format.id} to={`/templates?format=${format.id}`} className="chip">
              {format.label}
            </Link>
          ))}
          <Link to="/templates" className="chip ml-auto border-ink bg-ink text-cream">
            All formats <ArrowRight size={13} />
          </Link>
        </div>
      </section>

      {/* Marquee */}
      <section className="overflow-hidden py-10">
        <div className="mb-6 flex items-end justify-between page-wrap">
          <div>
            <p className="label">The template shelf</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Twenty-six ways to start</h2>
          </div>
          <Link to="/templates" className="hidden items-center gap-1.5 text-sm font-semibold text-coral hover:gap-2.5 sm:flex">
            Browse all <ArrowRight size={15} />
          </Link>
        </div>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-cream to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-cream to-transparent" />
          <div className="flex w-max animate-marquee gap-4 px-5 hover:[animation-play-state:paused]">
            {[...MARQUEE, ...MARQUEE].map((template, index) => (
              <Link
                key={`${template.id}-${index}`}
                to="/templates"
                className="group w-[190px] shrink-0 rounded-2xl bg-white p-2 ring-1 ring-ink/8 transition-transform hover:-translate-y-1"
              >
                <ResponsivePageThumb design={template.design} page={template.design.pages[0]} radius={10} />
                <p className="mt-2 truncate px-0.5 text-xs font-medium text-ink/80">{template.name}</p>
                <p className="px-0.5 pb-1 text-[10px] text-ink-mute">{template.category}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="page-wrap py-16">
        <div className="max-w-2xl">
          <p className="label">Why Kite</p>
          <h2 className="mt-3 text-4xl font-bold sm:text-5xl">
            A design tool that gets out of the&nbsp;way
          </h2>
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-ink-mute">
            We built the tool we wanted to use: opinionated templates, a canvas with real controls, and an export button
            that never asks you to upgrade.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-3xl border border-ink/8 bg-white p-6 transition-all hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_20px_40px_-30px_rgba(20,20,27,0.6)]"
            >
              <div className={`grid h-11 w-11 place-items-center rounded-xl ${feature.tone}`}>
                <feature.icon size={20} className="text-ink" />
              </div>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-mute">{feature.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Editor showcase */}
      <section className="bg-ink py-20 text-cream">
        <div className="page-wrap grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-coral">The editor</p>
            <h2 className="mt-3 text-4xl font-bold text-cream sm:text-5xl">
              Everything on the canvas is yours to move
            </h2>
            <p className="mt-5 max-w-md text-[1.0625rem] leading-relaxed text-cream/70">
              Drag anything. Snap it to the grid. Recolour a whole page from one panel. Kite is a browser canvas with
              actual design controls — not a form with a preview.
            </p>
            <ul className="mt-7 space-y-3">
              {[
                'Snap guides and pixel-precise nudging with arrow keys',
                'Layers, alignment and z-order without a manual',
                'Multi-page designs with a page panel you can drag through',
                'Full undo history — and it survives a refresh',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-cream/85">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-mint/20 text-mint">
                    <Check size={12} strokeWidth={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <Link to="/editor/new" className="btn btn-coral mt-8">
              <PenTool size={16} />
              Open the canvas
            </Link>
          </div>

          <div className="relative">
            <div className="rounded-[1.75rem] border border-cream/15 bg-ink-soft p-3 shadow-2xl">
              <div className="flex items-center gap-2 px-1 pb-3">
                <span className="h-2.5 w-2.5 rounded-full bg-coral" />
                <span className="h-2.5 w-2.5 rounded-full bg-sun" />
                <span className="h-2.5 w-2.5 rounded-full bg-mint" />
                <span className="ml-2 truncate text-[11px] text-cream/50">kite.studio/editor — Sunset Sessions</span>
              </div>
              <div className="flex gap-3">
                <div className="hidden w-10 shrink-0 flex-col items-center gap-3 rounded-xl bg-cream/5 py-3 sm:flex">
                  {[LayoutTemplate, Type, Layers, Palette].map((Icon, index) => (
                    <span
                      key={index}
                      className={`grid h-7 w-7 place-items-center rounded-lg ${index === 1 ? 'bg-coral text-white' : 'text-cream/50'}`}
                    >
                      <Icon size={14} />
                    </span>
                  ))}
                </div>
                <div className="flex-1 rounded-xl bg-cream p-4">
                  <div className="mx-auto max-w-[240px]">
                    <ResponsivePageThumb
                      design={templateById('growth-tips')!.design}
                      page={templateById('growth-tips')!.design.pages[0]}
                      radius={6}
                    />
                  </div>
                </div>
                <div className="hidden w-24 shrink-0 flex-col gap-2 rounded-xl bg-cream/5 p-2.5 sm:flex">
                  <div className="h-2 w-10 rounded-full bg-cream/40" />
                  <div className="rounded-lg bg-cream/10 p-2">
                    <div className="h-1.5 w-full rounded-full bg-cream/35" />
                    <div className="mt-1.5 h-1.5 w-2/3 rounded-full bg-cream/20" />
                  </div>
                  <div className="mt-1 flex gap-1.5">
                    {['#ff5b3c', '#ffcf4d', '#1fbe8d', '#b9a6ff'].map((color) => (
                      <span key={color} className="h-4 w-4 rounded-full" style={{ background: color }} />
                    ))}
                  </div>
                  <div className="mt-1 h-8 rounded-md bg-cream/10" />
                  <div className="h-8 rounded-md bg-cream/10" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-4 flex items-center gap-2 rounded-full bg-sun px-3.5 py-2 text-xs font-semibold text-ink shadow-xl">
              <Zap size={14} /> Autosaved every few seconds
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="page-wrap py-14">
        <div className="grid gap-6 rounded-[2rem] border border-ink/10 bg-white p-8 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <p className="font-display text-5xl font-extrabold tracking-tight text-coral">{stat.value}</p>
              <p className="mt-1 text-sm text-ink-mute">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Templates spotlight */}
      <section className="page-wrap py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label">Fresh from the studio</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Made this month</h2>
          </div>
          <Link to="/templates" className="btn btn-white">
            See all templates <ArrowRight size={15} />
          </Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {['jazz-night', 'growth-tips', 'resume-designer', 'film-fest'].map((id) => {
            const template = templateById(id)!
            return (
              <Link
                key={id}
                to="/templates"
                className="group overflow-hidden rounded-3xl border border-ink/8 bg-white p-3 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <ResponsivePageThumb design={template.design} page={template.design.pages[0]} radius={14} />
                <div className="flex items-center justify-between px-1 pt-3">
                  <div>
                    <p className="text-sm font-semibold">{template.name}</p>
                    <p className="text-xs text-ink-mute">{template.category}</p>
                  </div>
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-cream text-ink transition-colors group-hover:bg-coral group-hover:text-white">
                    <ArrowRight size={14} />
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="page-wrap py-16">
        <div className="max-w-xl">
          <p className="label">Said out loud</p>
          <h2 className="mt-2 text-4xl font-bold sm:text-5xl">People keep the tab open</h2>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial) => (
            <figure key={testimonial.name} className="flex flex-col justify-between rounded-3xl bg-sand/60 p-6">
              <div>
                <Quote size={20} className="text-coral" />
                <blockquote className="mt-4 text-[15px] leading-relaxed text-ink/85">{testimonial.quote}</blockquote>
              </div>
              <figcaption className="mt-6 flex items-center gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-ink text-[11px] font-semibold text-cream">
                  {testimonial.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{testimonial.name}</span>
                  <span className="block text-xs text-ink-mute">{testimonial.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="page-wrap py-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-lg">
            <p className="label">Plans</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Free is genuinely free</h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-mute">
              No credit card, no locked templates, no watermark on your work. Pay only if you want sharper exports and
              shared brand tools.
            </p>
          </div>
          <Link to="/pricing" className="btn btn-white">
            Compare plans <ArrowRight size={15} />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl border p-6 ${
                plan.highlight ? 'border-ink bg-ink text-cream' : 'border-ink/10 bg-white'
              }`}
            >
              {plan.highlight ? (
                <span className="absolute right-5 top-5 rounded-full bg-coral px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Popular
                </span>
              ) : null}
              <p className={`text-sm font-semibold ${plan.highlight ? 'text-cream/70' : 'text-ink-mute'}`}>{plan.name}</p>
              <p className="mt-2 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className={`text-xs ${plan.highlight ? 'text-cream/60' : 'text-ink-mute'}`}>{plan.cadence}</span>
              </p>
              <p className={`mt-2 text-sm ${plan.highlight ? 'text-cream/70' : 'text-ink-mute'}`}>{plan.blurb}</p>
              <ul className="mt-5 space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className={`flex items-center gap-2 text-sm ${plan.highlight ? 'text-cream/85' : 'text-ink/80'}`}>
                    <Check size={14} className={plan.highlight ? 'text-mint' : 'text-mint'} />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to={plan.highlight ? '/pricing' : '/templates'}
                className={`btn mt-6 w-full ${plan.highlight ? 'btn-coral' : 'btn-ghost'}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="page-wrap py-16">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-coral px-8 py-14 text-center text-white sm:px-16">
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-sun/40 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-10 h-72 w-72 rounded-full bg-lilac/40 blur-3xl" />
          <div className="relative">
            <div className="mx-auto flex w-fit items-center gap-1 text-sun">
              {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} size={16} fill="currentColor" strokeWidth={0} />
              ))}
            </div>
            <h2 className="mx-auto mt-5 max-w-2xl text-4xl font-bold sm:text-5xl">
              Your next thing is 30 seconds away
            </h2>
            <p className="mx-auto mt-4 max-w-md text-white/80">
              Pick a template, change three words, export. That is the whole workflow — and it is free.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/templates" className="btn bg-ink text-white hover:bg-black">
                Browse templates
                <ArrowRight size={16} />
              </Link>
              <Link to="/editor/new" className="btn bg-white text-ink hover:bg-cream">
                Open a blank canvas
              </Link>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
