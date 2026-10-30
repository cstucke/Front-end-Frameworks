import { Genre, Movie } from "../types";
import { useAppContext } from "../context/AppContext";
import { useMovies } from "../hooks/useMovies";
import { tmdbUrl } from "../data/tmdb";
import MovieRow from "./MovieRow";

const MoreLike = ({ movie, genres }: { movie: Movie; genres: Genre[] }) => {
    const { movies } = useMovies(tmdbUrl(`/movie/${movie.id}/recommendations?language=en-US`));

    if (movies.length === 0) return null;
    return <MovieRow title={`More Like ${movie.title}`} movies={movies} genres={genres} />;
};

const PersonalRows = ({ genres }: { genres: Genre[] }) => {
    const { progress, favorites, removeProgress } = useAppContext();
    const lastWatched = progress[0]?.movie;

    return (
        <>
            {progress.length > 0 && (
                <MovieRow
                    title="Continue Watching"
                    movies={progress.map((p) => p.movie)}
                    genres={genres}
                    onRemove={(movie) => removeProgress(movie.id)}
                />
            )}
            {favorites.length > 0 && <MovieRow title="Your Watchlist" movies={favorites} genres={genres} />}
            {lastWatched && <MoreLike key={lastWatched.id} movie={lastWatched} genres={genres} />}
        </>
    );
};

export default PersonalRows;
