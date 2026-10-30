import { Movie, Genre } from "../types";
import MovieCard from "./MovieCard";

type MovieListProps = {
    movies: Movie[];
    genres?: Genre[];
};

const MovieList = ({ movies, genres = [] }: MovieListProps) => {
    if (movies.length === 0) {
        return (
            <div className="empty-state">
                <div className="empty-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                </div>
                <h3 className="empty-title">No movies found</h3>
                <p className="empty-text">Try searching for a different movie.</p>
            </div>
        );
    }

    return (
        <div className="movies-grid">
            {movies.map((movie) => (
                <MovieCard key={movie.id} movie={movie} genres={genres} />
            ))}
        </div>
    );
};

export default MovieList;
