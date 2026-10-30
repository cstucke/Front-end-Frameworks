import { useState, useEffect } from "react";
import { Movie } from "../types";

export function useMovies(url: string) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loadedUrl, setLoadedUrl] = useState("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let ignore = false;

        async function getData() {
            try {
                const response = await fetch(url, {
                    headers: {
                        Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
                        accept: "application/json",
                    },
                });
                if (!response.ok) {
                    throw new Error(`Response status: ${response.status}`);
                }
                const result = await response.json();
                if (!ignore) {
                    setMovies((prev) => [
                        ...prev,
                        ...result.results.filter((m: Movie) => !prev.some((p) => p.id === m.id)),
                    ]);
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

    return { movies, loading: loadedUrl !== url, error };
}
