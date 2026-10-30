import { useRef, useState } from "react";
import { Movie, Genre } from "../types";
import MovieCard from "./MovieCard";

type MovieRowProps = {
    title: string;
    movies: Movie[];
    genres?: Genre[];
};

export const SkeletonCards = ({ count }: { count: number }) => (
    <>
        {Array.from({ length: count }, (_, i) => (
            <div key={i} className="skeleton-card"></div>
        ))}
    </>
);

const MovieRow = ({ title, movies, genres = [] }: MovieRowProps) => {
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
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} genres={genres} />
                    ))}
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
