import { useMovies } from "../hooks/useMovies";
import { useGenres } from "../hooks/useGenres"
import MovieList from "../components/MovieList";
const apiUrl = `${import.meta.env.VITE_TMDB_BASE_URL}/movie/popular?language=en-US&page=1`;
const genresUrl = `${import.meta.env.VITE_TMDB_BASE_URL}/genre/movie/list?language=en-US`;

const HomePage = ({ searchQuery }: { searchQuery: string }) => {
    const { movies, loading, error } = useMovies(apiUrl);
    const { genres } = useGenres(genresUrl);

    const filteredMovies = movies.filter((m) => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()),
);

return (
    <main className="main-container">
        {loading && <p>Loading...</p>}
        {error && <p>Something went wrong. </p>}
        {!loading && !error && <MovieList movies={filteredMovies} genres={genres} />}
    </main>
)
}

export default HomePage;