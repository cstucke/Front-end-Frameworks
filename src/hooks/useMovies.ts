import { useState, useEffect } from "react";
import { Movie } from "../types";

export function useMovies(url: string) {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
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
                setMovies(result.results);
            } catch (error) {
                console.error(error instanceof Error ? error.message : error);
                setError("Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        getData();
    }, [url]);

    return { movies, loading, error };
}
