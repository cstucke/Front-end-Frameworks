import { useState } from "react";
import { useMovies } from "../hooks/useMovies";
import { useGenres } from "../hooks/useGenres";
import { Movie } from "../types";
import MovieModal from "../components/MovieModal";
import MovieList from "../components/MovieList";
const apiUrl = `${import.meta.env.VITE_TMDB_BASE_URL}/movie/popular?language=en-US&page=1`;
const genresUrl = `${import.meta.env.VITE_TMDB_BASE_URL}/genre/movie/list?language=en-US`;

const HomePage = ({ searchQuery = "" }: { searchQuery?: string }) => {
    const { movies, loading, error } = useMovies(apiUrl);
    const { genres } = useGenres(genresUrl);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const filteredMovies = movies.filter((m) =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    return (
        <main className="main-container">
            {loading && <p>Loading...</p>}
            {error && <p>Something went wrong. </p>}
            {!loading && !error && <MovieList movies={filteredMovies} genres={genres} onMovieClick={setSelectedMovie} />}
            {selectedMovie && (
                <MovieModal movie={selectedMovie} onClose={() => setSelectedMovie(null)} />
            )}
        </main>
    )
}

export default HomePage;