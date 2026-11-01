import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Copy,
  FolderOpen,
  LayoutTemplate,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react'
import { SiteNav } from '@/components/SiteNav'
import { SiteFooter } from '@/components/SiteFooter'
import { ResponsivePageThumb } from '@/editor/render'
import { CloudCard } from '@/components/CloudCard'
import { FORMATS, PALETTES } from '@/lib/constants'
import {
  createBlankDesign,
  createDesignFromTemplateId,
  deleteDesign,
  duplicateDesign,
  loadDesigns,
  loadProfile,
  subscribeDesigns,
} from '@/lib/storage'
import { TEMPLATES } from '@/lib/templates'
import type { Design } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'

type SortMode = 'recent' | 'alpha'

export default function Dashboard() {
  const navigate = useNavigate()
  const [designs, setDesigns] = useState<Design[]>(() => loadDesigns())
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortMode>('recent')
  const [creating, setCreating] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const profile = useMemo(() => loadProfile(), [])

  useEffect(() => {
    const refresh = () => setDesigns(loadDesigns())
    refresh()
    return subscribeDesigns(refresh)
  }, [])

  const visible = useMemo(() => {
    const list = designs.filter((design) => design.title.toLowerCase().includes(query.trim().toLowerCase()))
    if (sort === 'alpha') return [...list].sort((a, b) => a.title.localeCompare(b.title))
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [designs, query, sort])

  function openDesign(id: string) {
    navigate(`/editor/${id}`)
  }

  function startBlank(formatId: string) {
    const format = FORMATS.find((item) => item.id === formatId) ?? FORMATS[0]
    const design = createBlankDesign({ width: format.w, height: format.h, title: `Untitled ${format.label}` })
    navigate(`/editor/${design.id}`)
  }

  function handleDuplicate(id: string) {
    const copy = duplicateDesign(id)
    if (copy) setDesigns(loadDesigns())
    setOpenMenu(null)
  }

  function handleDelete(id: string) {
    if (!window.confirm('Delete this design? This cannot be undone.')) return
    deleteDesign(id)
    setDesigns(loadDesigns())
    setOpenMenu(null)
  }

  const suggestions = ['growth-tips', 'pitch-deck', 'studio-card', 'quote-lilac']
    .map((id) => TEMPLATES.find((template) => template.id === id))
    .filter((template): template is (typeof TEMPLATES)[number] => Boolean(template))

  return (
    <div className="min-h-screen bg-cream">
      <SiteNav />

      <section className="page-wrap pt-10">
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="label">Your work</p>
            <h1 className="mt-2 text-4xl font-bold sm:text-5xl">
              {designs.length ? `Welcome back, ${profile.name.split(' ')[0]}` : 'Let’s make your first thing'}
            </h1>
            <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-ink-mute">
              {designs.length
                ? `${designs.length} ${designs.length === 1 ? 'design' : 'designs'} in this workspace. Everything autosaves as you work.`
                : 'Start from a blank canvas or borrow one of ours. It takes about thirty seconds to have something worth showing.'}
            </p>
          </div>
          <button type="button" onClick={() => setCreating(true)} className="btn btn-coral">
            <Plus size={16} />
            Create a design
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <div className="relative min-w-[220px] flex-1">
            <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-mute" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Find a design"
              className="field h-10 rounded-full pl-10"
            />
          </div>
          <div className="flex rounded-full border border-ink/12 bg-white p-1">
            {(['recent', 'alpha'] as SortMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setSort(mode)}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium capitalize transition-colors',
                  sort === mode ? 'bg-ink text-cream' : 'text-ink-mute hover:text-ink',
                )}
              >
                {mode === 'recent' ? 'Recent' : 'A–Z'}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="page-wrap mt-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <div>
            {visible.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-ink/20 bg-white/70 px-8 py-16 text-center">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-sand">
                  <FolderOpen size={22} className="text-ink" />
                </div>
                <h3 className="mt-4 text-xl font-semibold">{query ? 'No match for that' : 'Nothing here yet'}</h3>
                <p className="mx-auto mt-1 max-w-sm text-sm text-ink-mute">
                  {query
                    ? 'Try a different word, or clear the search to see everything.'
                    : 'Blank canvas or template — either way you will have something in a minute.'}
                </p>
                <div className="mt-5 flex justify-center gap-2">
                  <button type="button" onClick={() => setCreating(true)} className="btn btn-coral">
                    <Plus size={15} /> New design
                  </button>
                  <Link to="/templates" className="btn btn-ghost">
                    Browse templates
                  </Link>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((design) => (
                  <div
                    key={design.id}
                    className="group relative rounded-2xl border border-ink/8 bg-white p-2.5 transition-all hover:-translate-y-1 hover:border-ink/20 hover:shadow-[0_20px_45px_-30px_rgba(20,20,27,0.6)]"
                  >
                    <button type="button" onClick={() => openDesign(design.id)} className="block w-full text-left">
                      <div className="overflow-hidden rounded-xl bg-cream">
                        <ResponsivePageThumb design={design} page={design.pages[0]} radius={10} />
                      </div>
                    </button>

                    <div className="flex items-start justify-between gap-2 px-0.5 pt-2.5">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => openDesign(design.id)}
                          className="block max-w-full truncate text-left text-sm font-semibold hover:text-coral"
                        >
                          {design.title}
                        </button>
                        <p className="text-[11px] text-ink-mute">
                          {design.pages.length > 1 ? `${design.pages.length} pages · ` : ''}
                          Edited {formatDate(design.updatedAt)}
                        </p>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setOpenMenu((value) => (value === design.id ? null : design.id))}
                          className="grid h-7 w-7 place-items-center rounded-full text-ink-mute hover:bg-cream hover:text-ink"
                          aria-label="Design actions"
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenu === design.id ? (
                          <>
                            <button
                              type="button"
                              className="fixed inset-0 z-10 cursor-default"
                              onClick={() => setOpenMenu(null)}
                              aria-label="Close menu"
                            />
                            <div className="absolute right-0 top-8 z-20 w-40 overflow-hidden rounded-xl border border-ink/10 bg-white py-1 shadow-xl">
                              <button
                                type="button"
                                onClick={() => openDesign(design.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-cream"
                              >
                                <FolderOpen size={13} /> Open
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicate(design.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium hover:bg-cream"
                              >
                                <Copy size={13} /> Duplicate
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDelete(design.id)}
                                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-coral hover:bg-coral/8"
                              >
                                <Trash2 size={13} /> Delete
                              </button>
                            </div>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <p className="label">Brand kit</p>
              <p className="mt-2 text-sm font-semibold">{profile.name}</p>
              <p className="text-xs text-ink-mute">{profile.email}</p>
              <div className="mt-4 space-y-3">
                {PALETTES.slice(0, 2).map((palette) => (
                  <div key={palette.name}>
                    <p className="text-[11px] font-medium text-ink-mute">{palette.name}</p>
                    <div className="mt-1.5 flex gap-1.5">
                      {palette.colors.map((color) => (
                        <span
                          key={color}
                          className="h-7 flex-1 rounded-md ring-1 ring-inset ring-ink/10"
                          style={{ background: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-ink-mute">
                These colours appear in the editor sidebar so every design stays on brand.
              </p>
            </div>

            <CloudCard />

            <div className="rounded-2xl border border-ink/10 bg-ink p-5 text-cream">
              <Sparkles size={18} className="text-coral" />
              <p className="mt-3 text-sm font-semibold">Kite Pro</p>
              <p className="mt-1 text-xs leading-relaxed text-cream/70">
                2× exports, shared brand kits and multi-page decks. Nine euros, no annual lock-in.
              </p>
              <Link to="/pricing" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-coral hover:gap-2.5">
                See plans <ArrowRight size={13} />
              </Link>
            </div>

            <div className="rounded-2xl border border-ink/10 bg-white p-5">
              <p className="label">Quick start</p>
              <div className="mt-3 space-y-1.5">
                {FORMATS.slice(0, 5).map((format) => (
                  <button
                    key={format.id}
                    type="button"
                    onClick={() => startBlank(format.id)}
                    className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left text-xs font-medium hover:bg-cream"
                  >
                    <span>{format.label}</span>
                    <Plus size={13} className="text-ink-mute" />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="page-wrap py-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="label">Suggested</p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">Templates for this workspace</h2>
          </div>
          <Link to="/templates" className="btn btn-white">
            All templates <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {suggestions.map((template) => (
            <button
              key={template.id}
              type="button"
              onClick={() => {
                const design = createDesignFromTemplateId(template.id)
                if (design) navigate(`/editor/${design.id}`)
              }}
              className="group overflow-hidden rounded-2xl border border-ink/8 bg-white p-2.5 text-left transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <ResponsivePageThumb design={template.design} page={template.design.pages[0]} radius={10} />
              <p className="mt-2.5 truncate text-sm font-semibold">{template.name}</p>
              <p className="text-[11px] text-ink-mute">{template.category}</p>
            </button>
          ))}
        </div>
      </section>

      <SiteFooter />

      {creating ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 backdrop-blur-sm sm:items-center">
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl bg-cream shadow-2xl">
            <div className="flex items-center justify-between border-b border-ink/10 px-6 py-4">
              <div className="flex items-center gap-2">
                <LayoutTemplate size={18} className="text-coral" />
                <h2 className="text-lg font-semibold">Create a design</h2>
              </div>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="grid h-8 w-8 place-items-center rounded-full hover:bg-ink/5"
                aria-label="Close"
              >
                <X size={17} />
              </button>
            </div>
            <div className="max-h-[65vh] overflow-y-auto p-5">
              {(['Social', 'Work', 'Marketing', 'Brand'] as const).map((group) => (
                <div key={group} className="mb-5 last:mb-0">
                  <p className="label mb-2">{group}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {FORMATS.filter((format) => format.group === group).map((format) => (
                      <button
                        key={format.id}
                        type="button"
                        onClick={() => startBlank(format.id)}
                        className="flex items-center justify-between rounded-xl border border-ink/10 bg-white px-3.5 py-3 text-left transition-colors hover:border-ink/30 hover:bg-white"
                      >
                        <span>
                          <span className="block text-sm font-medium">{format.label}</span>
                          <span className="block text-[11px] text-ink-mute">
                            {format.w} × {format.h} · {format.hint}
                          </span>
                        </span>
                        <Plus size={15} className="text-ink-mute" />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
