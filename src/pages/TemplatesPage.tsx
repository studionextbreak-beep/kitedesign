import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, LayoutGrid, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { ResponsivePageThumb } from '@/editor/render'
import { TEMPLATES } from '@/lib/templates'
import { FORMATS, TEMPLATE_CATEGORIES } from '@/lib/constants'
import { createBlankDesign, createDesignFromTemplateId } from '@/lib/storage'
import { cn } from '@/lib/utils'

export default function TemplatesPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const activeCategory = params.get('cat') ?? 'All'
  const activeFormat = params.get('format') ?? ''

  const results = useMemo(() => {
    const format = FORMATS.find((item) => item.id === activeFormat)
    return TEMPLATES.filter((template) => {
      if (activeCategory !== 'All' && template.category !== activeCategory) return false
      if (format && (template.width !== format.w || template.height !== format.h)) return false
      if (!query.trim()) return true
      const haystack = `${template.name} ${template.category} ${template.tags.join(' ')}`.toLowerCase()
      return haystack.includes(query.trim().toLowerCase())
    })
  }, [activeCategory, activeFormat, query])

  function setCategory(category: string) {
    const next = new URLSearchParams(params)
    if (category === 'All') next.delete('cat')
    else next.set('cat', category)
    setParams(next, { replace: true })
  }

  function useTemplate(id: string) {
    const design = createDesignFromTemplateId(id)
    if (design) navigate(`/editor/${design.id}`)
  }

  function startBlank(formatId: string) {
    const format = FORMATS.find((item) => item.id === formatId) ?? FORMATS[0]
    const design = createBlankDesign({ width: format.w, height: format.h, title: format.label })
    navigate(`/editor/${design.id}`)
  }

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />

      <section className="page-wrap pb-8 pt-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <p className="label">Templates</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Start from something good</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-ink-mute">
              Every template is built in-house, fully editable, and free. Change the words, swap the colours, export.
            </p>
          </div>

          <div className="relative w-full max-w-sm">
            <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name, category or tag"
              className="field h-11 rounded-full pl-10 pr-10"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full bg-cream text-ink-mute hover:text-ink"
                aria-label="Clear search"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-2">
          {TEMPLATE_CATEGORIES.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setCategory(category)}
              className={cn('chip', activeCategory === category && 'chip-active')}
            >
              {category}
            </button>
          ))}
          {activeFormat ? (
            <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-medium text-cream">
              {FORMATS.find((item) => item.id === activeFormat)?.label}
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(params)
                  next.delete('format')
                  setParams(next, { replace: true })
                }}
                aria-label="Clear format filter"
              >
                <X size={12} />
              </button>
            </span>
          ) : null}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-ink/10 pt-4 text-sm text-ink-mute">
          <span className="inline-flex items-center gap-2">
            <SlidersHorizontal size={14} />
            {results.length} {results.length === 1 ? 'template' : 'templates'}
          </span>
          <Link to="/dashboard" className="inline-flex items-center gap-1.5 font-medium text-ink hover:text-coral">
            Jump to your work <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* Blank canvas quick starts */}
      <section className="page-wrap pb-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FORMATS.slice(0, 4).map((format) => (
            <button
              key={format.id}
              type="button"
              onClick={() => startBlank(format.id)}
              className="group flex items-center gap-3 rounded-2xl border border-ink/10 bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-ink/25 hover:shadow-md"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cream text-ink transition-colors group-hover:bg-coral group-hover:text-white">
                <LayoutGrid size={17} />
              </span>
              <span>
                <span className="block text-sm font-semibold">Blank {format.label}</span>
                <span className="block text-xs text-ink-mute">
                  {format.w} × {format.h} px
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="page-wrap py-8">
        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 bg-white py-20 text-center">
            <Sparkles size={22} className="mx-auto text-coral" />
            <h3 className="mt-4 text-xl font-semibold">Nothing on the shelf for that</h3>
            <p className="mt-1 text-sm text-ink-mute">Try a different search, or start from a blank canvas instead.</p>
            <div className="mt-5 flex justify-center gap-2">
              <button type="button" onClick={() => { setQuery(''); setCategory('All') }} className="btn btn-ghost">
                Clear filters
              </button>
              <button type="button" onClick={() => startBlank('instagram-post')} className="btn btn-coral">
                Blank canvas
              </button>
            </div>
          </div>
        ) : (
          <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
            {results.map((template) => (
              <div key={template.id} className="mb-4 break-inside-avoid">
                <div className="group relative overflow-hidden rounded-2xl border border-ink/8 bg-white p-2.5 transition-all hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_20px_40px_-24px_rgba(20,20,27,0.5)]">
                  <div className="overflow-hidden rounded-xl">
                    <ResponsivePageThumb design={template.design} page={template.design.pages[0]} radius={10} />
                  </div>
                  <div className="flex items-center justify-between gap-2 px-0.5 pb-0.5 pt-2.5">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{template.name}</p>
                      <p className="truncate text-[11px] text-ink-mute">
                        {template.category} · {template.width} × {template.height}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => useTemplate(template.id)}
                      className="shrink-0 rounded-full bg-ink px-3 py-1.5 text-[11px] font-semibold text-cream transition-colors hover:bg-coral"
                    >
                      Use
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => useTemplate(template.id)}
                    className="absolute inset-2.5 bottom-14 flex items-center justify-center rounded-xl bg-ink/0 opacity-0 transition-all group-hover:bg-ink/25 group-hover:opacity-100"
                  >
                    <span className="flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink shadow">
                      <Sparkles size={12} /> Customise this
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <SiteFooter />
    </div>
  )
}
