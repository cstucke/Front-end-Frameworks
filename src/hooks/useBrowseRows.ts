import { useState, useEffect, useMemo } from "react";
import { Movie } from "../types";
import { tmdbFetch, tmdbUrl } from "../data/tmdb";

const ROWS = [
    { title: "Trending This Week", path: "/trending/movie/week?language=en-US" },
    { title: "Now in Theaters", path: "/movie/now_playing?language=en-US" },
    { title: "Top Rated", path: "/movie/top_rated?language=en-US" },
    { title: "Coming Soon", path: "/movie/upcoming?language=en-US" },
    { title: "Laugh Out Loud", path: "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=35" },
    { title: "Edge of Your Seat", path: "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=53" },
    { title: "Out of This World", path: "/discover/movie?language=en-US&sort_by=popularity.desc&with_genres=878" },
];

const TOP_SIZE = 10;

// TMDB's lists overlap heavily. Each title appears once on the page, in the first row that has it.
function buildPage(lists: Movie[][]) {
    const [trending] = lists;
    const hero = trending.find((m) => m.backdrop_path);
    const top10 = trending.length >= TOP_SIZE ? trending.slice(0, TOP_SIZE) : [];
    const seen = new Set<number>([...top10, ...(hero ? [hero] : [])].map((m) => m.id));

    const rows = ROWS.map((row, i) => {
        const movies = lists[i].filter((m) => !seen.has(m.id));
        movies.forEach((m) => seen.add(m.id));
        return { title: row.title, movies };
    }).filter((row) => row.movies.length > 0);

    return { hero, top10, rows, seen };
}

export function useBrowseRows() {
    const [lists, setLists] = useState<Movie[][] | null>(null);
    const [attempt, setAttempt] = useState(0);

    useEffect(() => {
        let ignore = false;

        async function getData() {
            const results = await Promise.allSettled(ROWS.map((row) => tmdbFetch(tmdbUrl(row.path))));
            if (!ignore) {
                setLists(results.map((r) => (r.status === "fulfilled" ? r.value.results : [])));
            }
        }

        getData();

        return () => {
            ignore = true;
        };
    }, [attempt]);

    const retry = () => {
        setLists(null);
        setAttempt((a) => a + 1);
    };

    const page = useMemo(() => (lists ? buildPage(lists) : null), [lists]);

    return {
        hero: page?.hero,
        top10: page?.top10 ?? [],
        rows: page?.rows ?? [],
        seen: page?.seen,
        loading: !lists,
        error: page !== null && page.rows.length === 0 && !page.hero,
        retry,
    };
}
