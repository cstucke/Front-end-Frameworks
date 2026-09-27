import { useState } from "react"
import MovieList from "./components/MovieList"
import SearchBar from "./components/SearchBar"
import { useMovies } from "./hooks/useMovies"

const App = () => {
  const apiUrl = `${import.meta.env.VITE_TMDB_BASE_URL}/movie/popular?language=en-US&page=1`;
  const { movies, loading, error } = useMovies(apiUrl);
  const [query, setQuery] = useState("");
  const [minRating] = useState(0);

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase()) &&
      movie.vote_average >= minRating
  );

  return (
    <div className="app-layout">
      <main className="main-container">
        <h1>Movie App</h1>
        <SearchBar query={query} onChange={setQuery} />
        {loading && <p>Loading...</p>}
        {error && <p>Something went wrong.</p>}
        {!loading && !error && <MovieList movies={filteredMovies} />}
      </main>
    </div>
  );
};

export default App
