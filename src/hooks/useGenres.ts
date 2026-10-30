import { useState, useEffect } from "react";
import { Genre } from "../types";
import { tmdbFetch } from "../data/tmdb";

export function useGenres(url: string) {
    const [genres, setGenres] = useState<Genre[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function getData() {
            try {
                const result = await tmdbFetch(url);
                setGenres(result.genres ?? []);
            } catch (error) {
                console.error(error instanceof Error ? error.message : error);
                setError("Something went wrong.");
            } finally {
                setLoading(false);
            }
        }

        getData();
    }, [url]);

    return { genres, loading, error };
}
