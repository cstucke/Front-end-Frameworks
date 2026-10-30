import { useState, useEffect } from "react";
import { Genre, Movie, MovieDetails } from "../types";
import { tmdbFetch, tmdbUrl } from "../data/tmdb";

const APPENDED = "credits,videos,recommendations,release_dates,watch/providers";

// The plain Movie part of a details response, which is what gets saved to localStorage.
// /movie/{id} sends genres where the lists send genre_ids.
const toMovie = (details: MovieDetails): Movie => ({
    id: details.id,
    title: details.title,
    overview: details.overview,
    poster_path: details.poster_path,
    backdrop_path: details.backdrop_path,
    genre_ids: details.genres.map((g: Genre) => g.id),
    release_date: details.release_date,
    vote_average: details.vote_average,
    vote_count: details.vote_count,
    popularity: details.popularity,
    adult: details.adult,
});

export function useMovieDetails(id: string | undefined) {
    const [loaded, setLoaded] = useState<{ id?: string; details: MovieDetails | null } | null>(null);

    useEffect(() => {
        let ignore = false;

        async function getData() {
            try {
                const details = await tmdbFetch(
                    tmdbUrl(`/movie/${encodeURIComponent(id ?? "")}?language=en-US&append_to_response=${APPENDED}`),
                );
                if (!ignore) setLoaded({ id, details });
            } catch (error) {
                console.error(error instanceof Error ? error.message : error);
                if (!ignore) setLoaded({ id, details: null });
            }
        }

        getData();

        return () => {
            ignore = true;
        };
    }, [id]);

    const current = loaded?.id === id ? loaded : null;
    const details = current?.details ?? null;

    return {
        movie: details ? toMovie(details) : undefined,
        details,
        error: current !== null && details === null,
    };
}
