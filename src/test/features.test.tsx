/**
 * Streaming-service features: browsing rows, title pages, search, genres,
 * the watchlist and resume playback.
 *
 * fetch is replaced by a small fake TMDB that answers by URL, so each test
 * reads like the real app: routes go through BrowserRouter and the real context.
 *
 * Run: npm run test:features
 */

import { render, screen, fireEvent, waitFor, within, act } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

import App from '../App'
import { AppProvider, useAppContext } from '../context/AppContext'
import type { Movie } from '../types'

// ── Fixtures ──────────────────────────────────────────────────────────────────

const movie = (id: number, title: string, extra: Partial<Movie> = {}): Movie => ({
  id,
  title,
  overview: `${title} overview.`,
  poster_path: `/poster-${id}.jpg`,
  backdrop_path: `/backdrop-${id}.jpg`,
  release_date: '2024-05-01',
  vote_average: 7.5,
  vote_count: 1200,
  popularity: 100,
  genre_ids: [28],
  adult: false,
  ...extra,
})

const HERO = movie(1, 'Hero Movie')
const SHARED = movie(2, 'Shared Movie')
const RATED = movie(3, 'Rated Movie')
const POPULAR = movie(4, 'Popular Movie')
const SEARCHED = movie(5, 'Searched Movie')
const NEXT = movie(6, 'Next Movie')

const LISTS: Record<string, Movie[]> = {
  '/trending/movie/week': [HERO, SHARED],
  '/movie/now_playing': [SHARED],
  '/movie/top_rated': [SHARED, RATED],
  '/movie/popular': [HERO, SHARED, POPULAR],
}

const DETAILS = {
  ...HERO,
  genre_ids: undefined,
  genres: [{ id: 28, name: 'Action' }],
  tagline: 'One tagline to rule them all.',
  runtime: 130,
  credits: {
    cast: [{ id: 9, name: 'Ada Actor', character: 'Lead', profile_path: '/ada.jpg' }],
    crew: [{ id: 8, name: 'Dan Director', job: 'Director' }],
  },
  videos: { results: [{ key: 'abc123', name: 'Trailer', site: 'YouTube', type: 'Trailer', official: true }] },
  recommendations: { results: [NEXT] },
  release_dates: {
    results: [{ iso_3166_1: 'US', release_dates: [{ certification: '' }, { certification: 'PG-13' }] }],
  },
}

// ── Fake TMDB ─────────────────────────────────────────────────────────────────

const respond = (body: unknown, ok = true) =>
  Promise.resolve({ ok, status: ok ? 200 : 404, json: () => Promise.resolve(body) })

const fakeTmdb = (input: string) => {
  const url = new URL(input)
  const path = url.pathname.replace('/3', '')

  if (path === '/genre/movie/list') {
    return respond({ genres: [{ id: 28, name: 'Action' }, { id: 35, name: 'Comedy' }] })
  }
  if (path === '/search/movie') {
    const results = url.searchParams.get('query') === 'nothing' ? [] : [SEARCHED]
    return respond({ results, page: 1, total_pages: 1 })
  }
  if (path === '/discover/movie' && url.searchParams.get('with_genres') === '35') {
    return respond({ results: [RATED], page: 1, total_pages: 1 })
  }
  if (path === '/movie/1') return respond(DETAILS)
  if (/^\/movie\/\d+$/.test(path)) return respond({}, false)
  if (/^\/movie\/\d+\/recommendations$/.test(path)) return respond({ results: [NEXT], total_pages: 1 })

  return respond({ results: LISTS[path] ?? [], page: 1, total_pages: 1 })
}

const fetchedPaths = () =>
  vi.mocked(fetch).mock.calls.map(([input]) => {
    const url = new URL(String(input))
    return url.pathname.replace('/3', '') + url.search
  })

const renderAt = (path: string) => {
  window.history.pushState({}, '', path)
  return render(<App />)
}

const saveWatchProgress = (entries: { movie: Movie; time: number; duration: number }[]) =>
  localStorage.setItem('cinegrid_progress', JSON.stringify(entries))

beforeEach(() => {
  localStorage.clear()
  vi.stubGlobal('fetch', vi.fn(fakeTmdb))
  vi.stubGlobal('scrollTo', vi.fn())
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
  window.history.pushState({}, '', '/')
})

// ── Home: billboard and rows ──────────────────────────────────────────────────

describe('Home — billboard and rows', () => {
  it('features the top trending movie in a billboard with a Play link', async () => {
    renderAt('/')
    const heading = await screen.findByRole('heading', { level: 1, name: HERO.title })
    const billboard = heading.closest('section')!
    expect(within(billboard).getByRole('link', { name: 'Play' })).toHaveAttribute('href', '/watch/1')
    expect(within(billboard).getByRole('link', { name: 'More Info' })).toHaveAttribute('href', '/movies/1')
  })

  it('shows each title once even when TMDB repeats it across lists', async () => {
    renderAt('/')
    await screen.findByRole('heading', { name: 'Trending This Week' })
    expect(screen.getAllByText(SHARED.title)).toHaveLength(1)
    expect(screen.getAllByText(HERO.title)).toHaveLength(1)
  })

  it('leaves out a row with nothing new to show', async () => {
    renderAt('/')
    await screen.findByRole('heading', { name: 'Top Rated' })
    expect(screen.queryByRole('heading', { name: 'Now in Theaters' })).not.toBeInTheDocument()
  })

  it('shows popular movies below the rows without repeating them', async () => {
    renderAt('/')
    const heading = await screen.findByRole('heading', { name: 'Popular on CineGrid' })
    const grid = heading.closest('section')!
    expect(within(grid).getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
      'Popular on CineGrid',
      POPULAR.title,
    ])
  })

  it('still shows the other rows when one list fails', async () => {
    const working = fakeTmdb
    vi.stubGlobal('fetch', vi.fn((input: string) =>
      input.includes('/movie/top_rated') ? respond({}, false) : working(input)
    ))
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Trending This Week' })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Top Rated' })).not.toBeInTheDocument()
  })

  it('tells the user when nothing could be loaded', async () => {
    vi.stubGlobal('fetch', vi.fn(() => respond({}, false)))
    renderAt('/')
    expect(await screen.findByText(/couldn.t load movies/i)).toBeInTheDocument()
  })
})

// ── Title pages ───────────────────────────────────────────────────────────────

describe('/movies/:id — title page', () => {
  it('opens from a direct link as a full page with the site header', async () => {
    renderAt('/movies/1')
    expect(await screen.findByRole('heading', { name: HERO.title })).toBeInTheDocument()
    expect(await screen.findByText(DETAILS.tagline)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('shows runtime, certification, director and cast from TMDB', async () => {
    renderAt('/movies/1')
    expect(await screen.findByText('2h 10m')).toBeInTheDocument()
    expect(screen.getByText('PG-13')).toBeInTheDocument()
    expect(screen.getByText('Dan Director')).toBeInTheDocument()
    expect(screen.getByText('Ada Actor')).toBeInTheDocument()
  })

  it('links Play to the title in the player', async () => {
    renderAt('/movies/1')
    await screen.findByText(DETAILS.tagline)
    expect(screen.getByRole('link', { name: 'Play' })).toHaveAttribute('href', '/watch/1')
  })

  it('loads the trailer only after it is requested', async () => {
    renderAt('/movies/1')
    await screen.findByText(DETAILS.tagline)
    expect(screen.queryByTitle(/trailer/i)).not.toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /trailer/i }))
    expect(screen.getByTitle(/trailer/i)).toHaveAttribute('src', expect.stringContaining('/embed/abc123'))
  })

  it('offers titles like this one', async () => {
    renderAt('/movies/1')
    expect(await screen.findByRole('heading', { name: 'More Like This' })).toBeInTheDocument()
    expect(screen.getByText(NEXT.title)).toBeInTheDocument()
  })

  it('shows the 404 page for a movie TMDB does not know', async () => {
    renderAt('/movies/999')
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument()
  })

  it('names the browser tab after the movie', async () => {
    renderAt('/movies/1')
    await screen.findByRole('heading', { name: HERO.title })
    await waitFor(() => expect(document.title).toBe(`${HERO.title} — CineGrid`))
  })
})

describe('Title overlay', () => {
  const openDetails = async () => {
    renderAt('/')
    const card = (await screen.findByRole('heading', { name: SHARED.title })).closest('.movie-card')!
    fireEvent.click(within(card as HTMLElement).getByRole('link', { name: 'View Details' }))
    return screen.findByRole('dialog')
  }

  it('opens over the page and moves the URL to /movies/:id', async () => {
    await openDetails()
    expect(window.location.pathname).toBe('/movies/2')
    expect(screen.getByRole('heading', { level: 1, name: HERO.title })).toBeInTheDocument()
  })

  it('shows the card data straight away, before TMDB answers', async () => {
    const dialog = await openDetails()
    expect(within(dialog).getByRole('heading', { name: SHARED.title })).toBeInTheDocument()
  })

  it('locks page scrolling while open', async () => {
    await openDetails()
    await waitFor(() => expect(document.documentElement).toHaveClass('no-scroll'))
  })

  it('closes on Escape without reloading the page behind it', async () => {
    await openDetails()
    const requestsBefore = fetchedPaths().filter((p) => p.startsWith('/movie/popular')).length
    fireEvent.keyDown(window, { key: 'Escape' })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(window.location.pathname).toBe('/')
    expect(document.documentElement).not.toHaveClass('no-scroll')
    expect(fetchedPaths().filter((p) => p.startsWith('/movie/popular'))).toHaveLength(requestsBefore)
  })

  it('makes the page behind inert while open', async () => {
    await openDetails()
    await waitFor(() => expect(document.querySelector('.app-layout')).toHaveAttribute('inert'))
  })
})

// ── Player ────────────────────────────────────────────────────────────────────

describe('/watch/:id — player', () => {
  it('shows the title when opened directly, without link state', async () => {
    renderAt('/watch/1')
    expect(await screen.findByRole('heading', { level: 1, name: HERO.title }, { timeout: 5000 })).toBeInTheDocument()
  })

  it('shows the pause details when opened directly', async () => {
    renderAt('/watch/1')
    expect(await screen.findByText(`${HERO.title} overview.`, {}, { timeout: 5000 })).toBeInTheDocument()
  })

  it('shows the 404 page for a movie TMDB does not know', async () => {
    renderAt('/watch/999')
    expect(await screen.findByText(/page not found/i, {}, { timeout: 5000 })).toBeInTheDocument()
  })

  it('Back goes to the title page when nothing opened the player', async () => {
    renderAt('/watch/1')
    fireEvent.click(await screen.findByRole('button', { name: 'Back' }, { timeout: 5000 }))
    await waitFor(() => expect(window.location.pathname).toBe('/movies/1'))
  })

  it('Back still goes to the title page after Up Next replaced a direct link', async () => {
    window.history.pushState({ usr: { movie: NEXT }, key: 'replaced', idx: 0 }, '', '/watch/1')
    render(<App />)
    fireEvent.click(await screen.findByRole('button', { name: 'Back' }, { timeout: 5000 }))
    await waitFor(() => expect(window.location.pathname).toBe('/movies/1'))
  })

  it('no longer has a bare /watch route', async () => {
    renderAt('/watch')
    expect(await screen.findByText(/page not found/i)).toBeInTheDocument()
  })
})

// ── Search ────────────────────────────────────────────────────────────────────

describe('Search', () => {
  it('searches all of TMDB, not just the loaded movies', async () => {
    renderAt('/')
    await screen.findByRole('heading', { name: 'Trending This Week' })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'dark knight' } })
    expect(await screen.findByRole('heading', { name: SEARCHED.title })).toBeInTheDocument()
    expect(fetchedPaths().some((p) => p.startsWith('/search/movie') && p.includes('query=dark%20knight'))).toBe(true)
  })

  it('waits for typing to stop before calling TMDB', async () => {
    renderAt('/')
    await screen.findByRole('heading', { name: 'Trending This Week' })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'd' } })
    fireEvent.change(input, { target: { value: 'da' } })
    fireEvent.change(input, { target: { value: 'dark' } })
    await screen.findByRole('heading', { name: SEARCHED.title })
    expect(fetchedPaths().filter((p) => p.startsWith('/search/movie'))).toHaveLength(1)
  })

  it('replaces the rows with the results', async () => {
    renderAt('/')
    await screen.findByRole('heading', { name: 'Trending This Week' })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'dark' } })
    await screen.findByRole('heading', { name: SEARCHED.title })
    expect(screen.queryByRole('heading', { name: 'Trending This Week' })).not.toBeInTheDocument()
  })

  it('brings the rows back when the search is cleared', async () => {
    renderAt('/')
    await screen.findByRole('heading', { name: 'Trending This Week' })
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'dark' } })
    await screen.findByRole('heading', { name: SEARCHED.title })
    fireEvent.change(input, { target: { value: '' } })
    expect(await screen.findByRole('heading', { name: 'Trending This Week' })).toBeInTheDocument()
  })

  it('shows the empty state when nothing matches', async () => {
    renderAt('/')
    await screen.findByRole('heading', { name: 'Trending This Week' })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'nothing' } })
    expect(await screen.findByText('No movies found')).toBeInTheDocument()
  })

  it('goes to the results when typing on another page', async () => {
    renderAt('/about')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'dark' } })
    expect(await screen.findByRole('heading', { name: SEARCHED.title })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/')
  })

  it('stays on the page when a leftover search is cleared there', async () => {
    renderAt('/')
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'dark' } })
    fireEvent.click(screen.getByRole('link', { name: /about/i }))
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '' } })
    expect(window.location.pathname).toBe('/about')
  })
})

// ── Genres ────────────────────────────────────────────────────────────────────

describe('Genre browsing', () => {
  it('lists genres as links', async () => {
    renderAt('/')
    expect(await screen.findByRole('link', { name: 'Comedy' })).toHaveAttribute('href', '/?genre=35')
  })

  it('swaps the rows for that genre when ?genre= is set', async () => {
    renderAt('/?genre=35')
    expect(await screen.findByRole('heading', { name: RATED.title })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'Trending This Week' })).not.toBeInTheDocument()
    expect(fetchedPaths().some((p) => p.startsWith('/discover/movie') && p.includes('with_genres=35'))).toBe(true)
  })

  it('re-fetches the genre when the sort changes', async () => {
    renderAt('/?genre=35')
    await screen.findByRole('heading', { name: RATED.title })
    fireEvent.change(screen.getByRole('combobox', { name: /sort/i }), { target: { value: 'rating' } })
    await waitFor(() =>
      expect(fetchedPaths().some((p) => p.includes('with_genres=35') && p.includes('sort_by=vote_average.desc'))).toBe(true)
    )
    expect(window.location.search).toContain('sort=rating')
  })
})

// ── Infinite scroll ───────────────────────────────────────────────────────────

describe('Infinite grid', () => {
  it('stops asking for pages at total_pages', async () => {
    const observe = vi.fn()
    vi.stubGlobal('IntersectionObserver', vi.fn(function () {
      return { observe, disconnect: vi.fn() }
    }))
    renderAt('/')
    await screen.findByRole('heading', { name: 'Popular on CineGrid' })
    expect(observe).not.toHaveBeenCalled()
  })
})

// ── Watchlist ─────────────────────────────────────────────────────────────────

describe('Watchlist', () => {
  it('links from the header with the count', async () => {
    localStorage.setItem('cinegrid_favorites', JSON.stringify([SHARED]))
    renderAt('/about')
    const link = screen.getByRole('link', { name: /watchlist/i })
    expect(link).toHaveAttribute('href', '/watchlist')
    expect(link).toHaveTextContent('1')
  })

  it('lists saved movies', async () => {
    localStorage.setItem('cinegrid_favorites', JSON.stringify([SHARED]))
    renderAt('/watchlist')
    expect(await screen.findByRole('heading', { name: SHARED.title })).toBeInTheDocument()
  })

  it('explains itself when empty', async () => {
    renderAt('/watchlist')
    expect(await screen.findByText(/your watchlist is empty/i)).toBeInTheDocument()
  })

  it('can be changed from the title page', async () => {
    renderAt('/movies/1')
    await screen.findByText(DETAILS.tagline)
    fireEvent.click(screen.getByRole('button', { name: 'Add to Watchlist' }))
    expect(screen.getByRole('button', { name: 'Remove from Watchlist' })).toBeInTheDocument()
    const saved = JSON.parse(localStorage.getItem('cinegrid_favorites')!)[0]
    expect(saved).toMatchObject({ id: 1, genre_ids: [28] })
    expect(saved).not.toHaveProperty('credits')
  })

  it('appears as a row on Home', async () => {
    localStorage.setItem('cinegrid_favorites', JSON.stringify([movie(7, 'Saved Movie')]))
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'Your Watchlist' })).toBeInTheDocument()
    expect(screen.getByText('Saved Movie')).toBeInTheDocument()
  })
})

// ── Continue watching ─────────────────────────────────────────────────────────

describe('Continue Watching', () => {
  it('shows unfinished movies first on Home', async () => {
    saveWatchProgress([{ movie: movie(7, 'Half Watched'), time: 300, duration: 600 }])
    renderAt('/')
    const heading = await screen.findByRole('heading', { name: 'Continue Watching' })
    expect(within(heading.closest('section')!).getByText('Half Watched')).toBeInTheDocument()
  })

  it('draws how far the viewer got on the card', async () => {
    saveWatchProgress([{ movie: movie(7, 'Half Watched'), time: 300, duration: 600 }])
    renderAt('/')
    await screen.findByRole('heading', { name: 'Continue Watching' })
    expect(screen.getByRole('progressbar', { name: /half watched/i })).toHaveAttribute('aria-valuenow', '50')
  })

  it('suggests more like the last movie watched', async () => {
    saveWatchProgress([{ movie: movie(7, 'Half Watched'), time: 300, duration: 600 }])
    renderAt('/')
    expect(await screen.findByRole('heading', { name: 'More Like Half Watched' })).toBeInTheDocument()
    expect(fetchedPaths().some((p) => p.startsWith('/movie/7/recommendations'))).toBe(true)
  })

  it('turns Play into Resume with the time left', async () => {
    saveWatchProgress([{ movie: { ...HERO }, time: 3000, duration: 7800 }])
    renderAt('/movies/1')
    await screen.findByText(DETAILS.tagline)
    expect(screen.getByRole('link', { name: 'Resume' })).toHaveAttribute('href', '/watch/1')
    expect(screen.getByText('80 min left')).toBeInTheDocument()
  })
})

describe('AppContext — watch progress', () => {
  const Probe = () => {
    const { progress, saveProgress } = useAppContext()
    return (
      <div>
        <span data-testid="ids">{progress.map((p) => p.movie.id).join(',')}</span>
        <button onClick={() => saveProgress(HERO, 120, 600)}>save hero</button>
        <button onClick={() => saveProgress(SHARED, 120, 600)}>save shared</button>
        <button onClick={() => saveProgress(HERO, 590, 600)}>finish hero</button>
        <button onClick={() => saveProgress(RATED, 2, 600)}>barely started</button>
      </div>
    )
  }

  const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }))
  const ids = () => screen.getByTestId('ids').textContent

  beforeEach(() => {
    render(<AppProvider><Probe /></AppProvider>)
  })

  it('keeps the most recently watched first', () => {
    click('save hero')
    click('save shared')
    click('save hero')
    expect(ids()).toBe('1,2')
  })

  it('drops a movie once it is finished', () => {
    click('save hero')
    click('finish hero')
    expect(ids()).toBe('')
  })

  it('ignores a movie that was only just started', () => {
    click('barely started')
    expect(ids()).toBe('')
  })

  it('persists to localStorage', () => {
    click('save hero')
    act(() => {})
    expect(JSON.parse(localStorage.getItem('cinegrid_progress')!)[0]).toMatchObject({ time: 120, duration: 600 })
  })
})

// ── Card polish ───────────────────────────────────────────────────────────────

describe('MovieCard', () => {
  it('swaps a broken poster for the placeholder', async () => {
    renderAt('/')
    const poster = await screen.findByRole('img', { name: SHARED.title })
    fireEvent.error(poster)
    expect(poster.getAttribute('src')).toMatch(/^data:image\/svg/)
  })
})
