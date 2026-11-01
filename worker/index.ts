import { createFreebuffAuth, isSameOriginRequest } from '@freebuff/auth'
import type { FreebuffAuth } from '@freebuff/auth'

// Minimal structural types so the Worker builds without Workers type packages.
interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement
  run(): Promise<unknown>
  all<T = Record<string, unknown>>(): Promise<{ results?: T[] }>
}
interface D1Database {
  prepare(query: string): D1PreparedStatement
}
interface AssetFetcher {
  fetch(request: Request): Promise<Response>
}

interface Env {
  ASSETS: AssetFetcher
  DB: D1Database
  FREEBUFF_CLIENT_ID: string
  FREEBUFF_ISSUER?: string
  APP_ORIGIN: string
}

interface DesignPayload {
  id: string
  title: string
  width: number
  height: number
  pages: unknown[]
  createdAt?: number
  updatedAt?: number
}

const MAX_BODY_BYTES = 2_000_000

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'private, no-store',
    },
  })
}

let auth: FreebuffAuth | undefined
let app: ((request: Request, env: Env) => Promise<Response>) | undefined

function setup(env: Env) {
  // Loopback http origins are a local-development only escape hatch; deployed
  // origins are https and never get it.
  const isLoopback = /^http:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(env.APP_ORIGIN)

  // One auth instance per isolate so discovery documents and signing keys are cached.
  auth ??= createFreebuffAuth({
    clientId: env.FREEBUFF_CLIENT_ID,
    issuer: env.FREEBUFF_ISSUER,
    baseUrl: env.APP_ORIGIN,
    allowInsecureLocalhost: isLoopback,
  })
  const signedIn = auth
  app ??= signedIn.wrap(async (request: Request, env: Env) => {
    const url = new URL(request.url)
    if (url.pathname.startsWith('/api/')) return handleApi(request, env, signedIn, url)
    return env.ASSETS.fetch(request)
  })
  return app
}

let schema: Promise<void> | undefined

function ensureSchema(env: Env): Promise<void> {
  schema ??= (async () => {
    await env.DB.prepare(
      `CREATE TABLE IF NOT EXISTS designs (
         user_sub   TEXT    NOT NULL,
         id         TEXT    NOT NULL,
         title      TEXT    NOT NULL,
         width      INTEGER NOT NULL,
         height     INTEGER NOT NULL,
         data       TEXT    NOT NULL,
         created_at INTEGER NOT NULL,
         updated_at INTEGER NOT NULL,
         PRIMARY KEY (user_sub, id)
       )`,
    ).run()
    await env.DB.prepare(
      `CREATE INDEX IF NOT EXISTS designs_user_updated ON designs (user_sub, updated_at DESC)`,
    ).run()
  })().catch((error) => {
    schema = undefined
    throw error
  })
  return schema
}

function isDesign(value: unknown): value is DesignPayload {
  if (!value || typeof value !== 'object') return false
  const design = value as Record<string, unknown>
  return (
    typeof design.id === 'string' &&
    design.id.length > 0 &&
    design.id.length <= 120 &&
    typeof design.title === 'string' &&
    typeof design.width === 'number' &&
    Number.isFinite(design.width) &&
    typeof design.height === 'number' &&
    Number.isFinite(design.height) &&
    Array.isArray(design.pages)
  )
}

async function handleApi(request: Request, env: Env, auth: FreebuffAuth, url: URL): Promise<Response> {
  // Authorization always comes from the session, never from the request body or URL.
  const user = await auth.getUser(request)
  if (!user) return json({ error: 'Sign in required' }, 401)

  const mutating = request.method === 'PUT' || request.method === 'POST' || request.method === 'DELETE'
  if (mutating && !isSameOriginRequest(request, env.APP_ORIGIN)) {
    return json({ error: 'Cross-origin request refused' }, 403)
  }

  await ensureSchema(env)

  if (url.pathname === '/api/designs' && request.method === 'GET') {
    const { results } = await env.DB.prepare(
      'SELECT data FROM designs WHERE user_sub = ?1 ORDER BY updated_at DESC LIMIT 200',
    )
      .bind(user.sub)
      .all<{ data: string }>()

    const designs = (results ?? []).flatMap((row) => {
      try {
        return [JSON.parse(row.data) as unknown]
      } catch {
        return []
      }
    })
    return json({ designs })
  }

  const match = /^\/api\/designs\/([^/]+)$/.exec(url.pathname)
  if (!match) return json({ error: 'Not found' }, 404)
  const id = decodeURIComponent(match[1])

  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM designs WHERE user_sub = ?1 AND id = ?2').bind(user.sub, id).run()
    return json({ ok: true })
  }

  if (request.method === 'PUT') {
    const declared = Number(request.headers.get('content-length') ?? '0')
    if (declared > MAX_BODY_BYTES) return json({ error: 'Design is too large to sync' }, 413)

    const raw = await request.text()
    if (raw.length > MAX_BODY_BYTES) return json({ error: 'Design is too large to sync' }, 413)

    let payload: unknown
    try {
      payload = JSON.parse(raw)
    } catch {
      return json({ error: 'Invalid JSON' }, 400)
    }
    if (!isDesign(payload)) return json({ error: 'Invalid design' }, 400)
    if (payload.id !== id) return json({ error: 'Design id mismatch' }, 400)

    const now = Date.now()
    const createdAt = typeof payload.createdAt === 'number' ? payload.createdAt : now

    await env.DB.prepare(
      `INSERT INTO designs (user_sub, id, title, width, height, data, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
       ON CONFLICT(user_sub, id) DO UPDATE SET
         title      = excluded.title,
         width      = excluded.width,
         height     = excluded.height,
         data       = excluded.data,
         updated_at = excluded.updated_at`,
    )
      .bind(
        user.sub,
        id,
        payload.title.slice(0, 200),
        Math.round(payload.width),
        Math.round(payload.height),
        raw,
        createdAt,
        now,
      )
      .run()

    return json({ ok: true, updatedAt: now })
  }

  return json({ error: 'Method not allowed' }, 405)
}

export default {
  fetch(request: Request, env: Env): Promise<Response> {
    return setup(env)(request, env)
  },
}
