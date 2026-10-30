import { useState, useEffect } from "react";
import { Movie } from "../types";
import { tmdbFetch } from "../data/tmdb";

export function useMovies(url: string) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [totalPages, setTotalPages] = useState(1);
    const [loadedUrl, setLoadedUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        async function getData() {
            try {
                const result = await tmdbFetch(url);
                if (!ignore) {
                    setMovies((prev) => [
                        ...prev,
                        ...result.results.filter((m: Movie) => !prev.some((p) => p.id === m.id)),
                    ]);
                    setTotalPages(result.total_pages);
                }
            } catch (error) {
                console.error(error instanceof Error ? error.message : error);
                if (!ignore) setError("Something went wrong.");
            } finally {
                if (!ignore) setLoadedUrl(url);
            }
        }

        getData();

        return () => {
            ignore = true;
        };
    }, [url]);

    return { movies, totalPages, loading: loadedUrl !== url, error };
}
