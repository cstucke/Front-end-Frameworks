import { useEffect, useRef, useState } from "react";
import { Genre } from "../types";
import { useMovies } from "../hooks/useMovies";
import MovieList from "./MovieList";
import { SkeletonCards } from "./MovieRow";

const TMDB_PAGE_LIMIT = 500;

type InfiniteGridProps = {
    url: string;
    title?: string;
    genres?: Genre[];
    exclude?: Set<number>;
};

// useMovies appends, so give this a `key` that changes with the list to start it over.
const InfiniteGrid = ({ url, title, genres = [], exclude }: InfiniteGridProps) => {
    const [page, setPage] = useState(1);
    const { movies, totalPages, loading, error } = useMovies(`${url}&page=${page}`);
    const loaderRef = useRef<HTMLDivElement>(null);
    const hasMore = page < Math.min(totalPages, TMDB_PAGE_LIMIT);
    const visible = exclude ? movies.filter((m) => !exclude.has(m.id)) : movies;

    useEffect(() => {
        const loader = loaderRef.current;
        if (!loader || typeof IntersectionObserver === "undefined") return;
        if (loading || error || !hasMore) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) setPage((p) => p + 1);
            },
            { rootMargin: "400px" },
        );
        observer.observe(loader);

        return () => observer.disconnect();
    }, [loading, error, hasMore]);

    return (
        <section className="movie-row">
            {title && visible.length > 0 && <h2 className="row-title">{title}</h2>}
            {(visible.length > 0 || (!loading && !error && movies.length === 0)) && (
                <MovieList movies={visible} genres={genres} />
            )}
            {loading && (
                <div className={`movies-grid${visible.length > 0 ? " movies-grid-more" : ""}`}>
                    <SkeletonCards count={6} />
                </div>
            )}
            {error && <p className="empty-text">Couldn&rsquo;t load more movies.</p>}
            <div ref={loaderRef}></div>
        </section>
    );
};

export default InfiniteGrid;
