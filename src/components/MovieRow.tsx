import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Movie, Genre } from "../types";
import { getPosterUrl } from "../data/sampleMovies";
import { useOverlayState } from "../hooks/useOverlay";
import MovieCard from "./MovieCard";

type MovieRowProps = {
    title: string;
    movies: Movie[];
    genres?: Genre[];
    ranked?: boolean;
    onRemove?: (movie: Movie) => void;
};

export const SkeletonCards = ({ count }: { count: number }) => (
    <>
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="skeleton-card"></div>
        ))}
    </>
);

const RankedCard = ({ movie, rank }: { movie: Movie; rank: number }) => {
    const overlayState = useOverlayState();

    return (
        <Link
            to={`/movies/${movie.id}`}
            state={overlayState(movie)}
            className="ranked-card"
            aria-label={`${rank}. ${movie.title}`}
        >
            <span className={`rank-number${rank > 9 ? " rank-number-wide" : ""}`}>{rank}</span>
            <img className="ranked-poster" src={getPosterUrl(movie.poster_path)} alt="" loading="lazy" />
        </Link>
    );
};

const MovieRow = ({ title, movies, genres = [], ranked = false, onRemove }: MovieRowProps) => {
    const trackRef = useRef<HTMLDivElement>(null);
    const [canScroll, setCanScroll] = useState({ left: false, right: false });

    const updateArrows = () => {
        const track = trackRef.current;
        if (!track) return;
        setCanScroll({
            left: track.scrollLeft > 0,
            right: track.scrollLeft + track.clientWidth < track.scrollWidth - 1,
        });
    };

    const scrollPage = (direction: number) => {
        const track = trackRef.current;
        track?.scrollBy({ left: direction * track.clientWidth * 0.9, behavior: "smooth" });
    };

    return (
        <section className="movie-row" onMouseEnter={updateArrows}>
            <h2 className="row-title">{title}</h2>
            <div className="row-viewport">
                {canScroll.left && (
                    <button className="row-arrow row-arrow-left" tabIndex={-1} aria-label={`Scroll ${title} left`} onClick={() => scrollPage(-1)}>
                        &#8249;
                    </button>
                )}
                <div className="row-track" ref={trackRef} onScroll={updateArrows}>
                    {movies.map((movie, i) =>
                        ranked ? (
                            <RankedCard key={movie.id} movie={movie} rank={i + 1} />
                        ) : (
                            <MovieCard key={movie.id} movie={movie} genres={genres} onRemove={onRemove} />
                        ),
                    )}
                </div>
                {canScroll.right && (
                    <button className="row-arrow row-arrow-right" tabIndex={-1} aria-label={`Scroll ${title} right`} onClick={() => scrollPage(1)}>
                        &#8250;
                    </button>
                )}
            </div>
        </section>
    );
};

export default MovieRow;
