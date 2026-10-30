# CineGrid

A movie browser built with React and TypeScript on the TMDB API, with a full-page player that streams video the way Netflix does.

![CineGrid home page](docs/screenshot.png)

---

## Features

- **Popular movies, endlessly:** the home grid loads TMDB's popular list and fetches the next page as you scroll near the bottom.
- **Search:** filters the loaded movies by title as you type.
- **Movie details:** hovering a card shows a Play button and View Details. The details view shows the backdrop, rating, release date, genres and overview.
- **Favourites:** the heart on each card saves a movie. The Watchlist count in the header updates, and favourites are kept between visits.
- **Light and dark themes**, also kept between visits.
- **Streaming player:** Play opens the video on a full page. A back arrow and the title sit at the top; the seek bar, time remaining, play/pause, volume and fullscreen sit at the bottom. The controls hide when the mouse is idle.
- **Pause screen:** pausing for two seconds dims the video and shows the movie's details.

---

## Tech stack

| Tool | Purpose |
|---|---|
| React 18 + TypeScript | UI and static typing |
| Vite | Dev server and build |
| React Router | Pages: Home, About, Watch, 404 |
| Context API + `useReducer` | Theme and favourites, saved to `localStorage` |
| hls.js | HLS video playback |
| Media Chrome | Player controls |
| Vitest + Testing Library | Tests |
| TMDB API v3 | Movie data and images |

---

## Getting started

**Prerequisites:** Node.js 20 or newer and a free [TMDB account](https://www.themoviedb.org/signup).

**1. Install dependencies**
```bash
npm install
```

**2. Add your TMDB token**
```bash
cp .env.example .env
```
Open `.env` and set `VITE_TMDB_API_KEY` to your **API Read Access Token**: the long token under TMDB Settings → API, not the short API key. The other values can stay as they are.

**3. Start the dev server**
```bash
npm run dev
```

The app runs at http://localhost:5173.

---

## Scripts

```bash
npm run dev              # Start the dev server
npm run build            # Type-check and build for production
npm run preview          # Serve the production build
npm run lint             # Run ESLint
npm run type-check       # TypeScript check
npm run test             # Tests in watch mode
npm run test:run         # Run all tests once
npm run test:m2          # Milestone 2 suite
npm run test:m3          # Milestone 3 suite
```

The milestone 1 suite (`npm run test:m1`) was written before favourites moved into the global context in Session 5, so it no longer passes. The milestone 2 and 3 suites pass.

---

## How the streaming works

TMDB doesn't host films, so every movie plays the same demo video. The point is to show how streaming services deliver video: **adaptive bitrate streaming over HLS**.

- The player first loads a master playlist (`.m3u8`) that lists the same video at five qualities, from 240p to 1080p.
- Each quality is cut into segments of about 10 seconds. The player downloads a few at a time, so playback starts quickly and seeking only fetches the segments near the new position.
- hls.js measures the download speed and switches to the quality the connection can handle.

**See it happen:** open DevTools → Network and press Play on any movie. You'll see the master playlist, then one quality's playlist, then its `.ts` segments. The quality is in each segment's file name (`ld` 240p, `hq` 480p, `hd` 720p, `fhd` 1080p). Throttle the network to "Slow 4G" and the new segments switch to a lower quality.

---

## Project structure

```
src/
├── components/     # HeaderComp, SearchBar, MovieList, MovieCard, MovieModal, StreamPlayer
├── context/        # AppContext: theme and favourites (useReducer + localStorage)
├── data/           # genre map, image URL helpers, sample movies
├── hooks/          # useMovies (paged, appends results), useGenres
├── pages/          # HomePage, AboutPage, WatchPage, NotFoundPage
├── test/           # milestone test suites
├── App.tsx         # routes
└── index.css       # all styles, with light/dark theme variables
vanilaVersion/      # the original plain-JavaScript version the React app was ported from
```

---

## Known limitations

- The movie's title and pause details reach the player through the link, so opening `/watch` directly (new tab, shared link) plays the video without them.
- Leaving the player returns to the top of the home page.
- Search only covers the movies already loaded, not the whole TMDB catalogue.
- The Watchlist button shows the count; there's no watchlist page yet.
- On iPhones, fullscreen switches to the system player, so the custom controls don't show there.

---

## Credits

- Movie data and images come from [TMDB](https://www.themoviedb.org). This product uses the TMDB API but is not endorsed or certified by TMDB.
- The demo video is [Big Buck Bunny](https://peach.blender.org), © 2008 Blender Foundation, licensed under [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). The stream is one of Mux's public test streams.

---

## Course

Built for **Front-End Frameworks** (2627_BSI_CS_S05_PROG_FEF), EPITA Bachelor in Computer Science, S5. Each session has its own branch (`01` to `04`).

Milestones are submitted by pushing a tag. The tag starts a GitHub Actions workflow that runs the tests and reports the result to the course sheet. The workflow needs the `SHEETS_WEBHOOK_URL` repository secret (Settings → Secrets and variables → Actions), provided by the teacher.

| Milestone | Tag |
|---|---|
| 1: Props, State, and useState | `milestone-1` |
| 2: Routing and SPA Architecture | `milestone-2` |
| 3: Global State with Context API | `milestone-3` |

```bash
git tag milestone-3
git push origin milestone-3
```

Tags are unique. To resubmit, delete the old tag first:
```bash
git tag -d milestone-3
git push origin --delete milestone-3
git tag milestone-3 && git push origin milestone-3
```
