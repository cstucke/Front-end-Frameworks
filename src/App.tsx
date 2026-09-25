import { useState, useEffect } from "react"
import MovieList from "./components/MovieList"
import SearchBar from "./components/SearchBar"
import { SAMPLE_MOVIES } from "./data/sampleMovies"

const App = () => {
  useEffect(() => {
    const options = {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization:
          "Bearer 067fee02ac505cbf7b880b0312466038",
      },
    };

    fetch(
      "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
      options,
    )
      .then((res) => res.json())
      .then((res) => console.log(res))
      .catch((err) => console.error(err));
  }, []);

  const [movies, setMovies] = useState(SAMPLE_MOVIES);
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
        <MovieList movies={filteredMovies} />
      </main>
    </div>
  );
};

export default App
