import { useState } from "react"
import MovieList from "./components/MovieList"
import SearchBar from "./components/SearchBar"
import { SAMPLE_MOVIES } from "./data/sampleMovies"

const App = () => {
  const [movies] = useState(SAMPLE_MOVIES);
  const [query, setQuery] = useState("");
  const [minRating] = useState(0);

  const filteredMovies = movies.filter(
    (movie) =>
      movie.title.toLowerCase().includes(query.toLowerCase()) &&
      movie.vote_average >= minRating
  );

  return (
    <div className="app-layout">
      <h1>Movie App</h1>
      <SearchBar query={query} onChange={setQuery} />
      <MovieList movies={filteredMovies} />
    </div>
  );
};

export default App
