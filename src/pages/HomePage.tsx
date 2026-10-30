import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useGenres } from "../hooks/useGenres";
import { useBrowseRows } from "../hooks/useBrowseRows";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { SortOption } from "../types";
import { genresUrl, tmdbUrl } from "../data/tmdb";
import Billboard from "../components/Billboard";
import GenreBar from "../components/GenreBar";
import InfiniteGrid from "../components/InfiniteGrid";
import MovieRow, { SkeletonCards } from "../components/MovieRow";
import PersonalRows from "../components/PersonalRows";

const popularUrl = tmdbUrl("/movie/popular?language=en-US");

const searchUrl = (query: string) =>
    tmdbUrl(`/search/movie?language=en-US&include_adult=false&query=${encodeURIComponent(query)}`);

// The vote floors keep TMDB's unrated long tail out of the sorted lists
const SORTS: Record<SortOption, string> = {
    popularity: "sort_by=popularity.desc",
    rating: "sort_by=vote_average.desc&vote_count.gte=500",
    release_date: `sort_by=primary_release_date.desc&vote_count.gte=50&primary_release_date.lte=${new Date().toISOString().slice(0, 10)}`,
    title: "sort_by=title.asc&vote_count.gte=500",
};

const genreUrl = (genreId: string, sort: SortOption) =>
    tmdbUrl(`/discover/movie?language=en-US&with_genres=${genreId}&${SORTS[sort]}`);

const HomePage = ({ searchQuery = "" }: { searchQuery?: string }) => {
    const [params, setParams] = useSearchParams();
    const typedQuery = searchQuery.trim();
    const debouncedQuery = useDebouncedValue(typedQuery, 300);
    const query = typedQuery && debouncedQuery;
    const genreId = params.get("genre");
    const sort = (params.get("sort") ?? "popularity") as SortOption;
    const { genres } = useGenres(genresUrl);
    const { hero, rows, seen, loading, error } = useBrowseRows();
    const genreName = genres.find((g) => String(g.id) === genreId)?.name;

    useEffect(() => {
        if (query || genreId) window.scrollTo(0, 0);
    }, [query, genreId]);

    if (query) {
        return (
            <main className="main-container">
                <InfiniteGrid key={query} url={searchUrl(query)} title={`Results for “${query}”`} genres={genres} />
            </main>
        );
    }

    return (
        <>
            {!genreId && hero && <Billboard movie={hero} />}
            {!genreId && loading && <div className="billboard billboard-skeleton"></div>}
            <main className="main-container">
                {genres.length > 0 && (
                    <GenreBar
                        genres={genres}
                        activeId={genreId}
                        sort={sort}
                        onSortChange={(value) => setParams({ genre: genreId ?? "", sort: value })}
                    />
                )}
                {genreId ? (
                    <InfiniteGrid key={genreId + sort} url={genreUrl(genreId, sort)} title={genreName} genres={genres} />
                ) : (
                    <>
                        {loading && (
                            <div className="row-track">
                                <SkeletonCards count={8} />
                            </div>
                        )}
                        {error && (
                            <div className="empty-state">
                                <p className="empty-text">We couldn&rsquo;t load movies right now. Check your connection and try again.</p>
                            </div>
                        )}
                        {!loading && !error && (
                            <>
                                <PersonalRows genres={genres} />
                                {rows.map((row) => (
                                    <MovieRow key={row.title} title={row.title} movies={row.movies} genres={genres} />
                                ))}
                                <InfiniteGrid url={popularUrl} title="Popular on CineGrid" genres={genres} exclude={seen} />
                            </>
                        )}
                    </>
                )}
            </main>
        </>
    );
};

export default HomePage;
