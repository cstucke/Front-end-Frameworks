// @vitest-environment node

/**
 * The /api/tmdb Vercel Function: it holds the TMDB token, so the browser never sees it.
 *
 * Run: npm run test:features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// @ts-expect-error plain JS, so Vercel has no TypeScript to compile for this Function
import handler from '../../api/tmdb.js'

const callApi = (query: string, method = 'GET') =>
  handler.fetch(new Request(`https://cinegrid.test/api/tmdb?${query}`, { method }))

const upstream = () => vi.mocked(fetch).mock.calls[0]

beforeEach(() => {
  vi.stubEnv('TMDB_API_KEY', 'server-side-token')
  vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(Response.json({ results: [] }))))
})

afterEach(() => {
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

describe('/api/tmdb', () => {
  it('adds the token on the server', async () => {
    await callApi('path=/movie/popular&language=en-US')
    expect(upstream()[1]?.headers).toMatchObject({ Authorization: 'Bearer server-side-token' })
  })

  it('forwards the path and the rest of the query to TMDB', async () => {
    await callApi('path=/movie/popular&language=en-US&page=2')
    expect(upstream()[0]).toBe('https://api.themoviedb.org/3/movie/popular?language=en-US&page=2')
  })

  it('returns what TMDB returned', async () => {
    const response = await callApi('path=/genre/movie/list')
    expect(response.status).toBe(200)
    expect(await response.json()).toEqual({ results: [] })
  })

  it('lets the CDN cache a good response', async () => {
    const response = await callApi('path=/genre/movie/list')
    expect(response.headers.get('cache-control')).toContain('s-maxage=')
  })

  it('never caches an error', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(Response.json({}, { status: 500 }))))
    const response = await callApi('path=/genre/movie/list')
    expect(response.headers.get('cache-control')).toBeNull()
  })

  it('passes on a TMDB error status', async () => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(Response.json({}, { status: 404 }))))
    const response = await callApi('path=/movie/999999999')
    expect(response.status).toBe(404)
  })

  it.each([
    '/trending/movie/week',
    '/genre/movie/list',
    '/search/movie',
    '/discover/movie',
    '/movie/popular',
    '/movie/now_playing',
    '/movie/top_rated',
    '/movie/upcoming',
    '/movie/550',
    '/movie/550/recommendations',
  ])('allows %s, which the app uses', async (path) => {
    const response = await callApi(`path=${path}`)
    expect(response.status).toBe(200)
  })

  it.each([
    ['nothing at all', ''],
    ['another TMDB endpoint', 'path=/account'],
    ['a sub-resource the app does not use', 'path=/movie/550/account_states'],
    ['a climb out of the allowed path', 'path=/movie/550/../../account'],
    ['another site', 'path=https://example.com/'],
    ['a TV endpoint', 'path=/tv/popular'],
  ])('refuses %s without calling TMDB', async (_name, query) => {
    const response = await callApi(query)
    expect(response.status).toBe(404)
    expect(fetch).not.toHaveBeenCalled()
  })

  it('refuses anything but GET', async () => {
    const response = await callApi('path=/movie/popular', 'POST')
    expect(response.status).toBe(405)
    expect(fetch).not.toHaveBeenCalled()
  })
})
