import { Link } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { useGenres } from "../hooks/useGenres";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { genresUrl } from "../data/tmdb";
import MovieList from "../components/MovieList";

const WatchlistPage = () => {
    const { favorites } = useAppContext();
    const { genres } = useGenres(genresUrl);

    useDocumentTitle("Watchlist");

    return (
        <main className="main-container">
            {favorites.length > 0 ? (
                <>
                    <h1 className="row-title">Your Watchlist</h1>
                    <MovieList movies={favorites} genres={genres} />
                </>
            ) : (
                <div className="empty-state">
                    <h1 className="empty-title">Your watchlist is empty</h1>
                    <p className="empty-text">Press the heart on any movie to save it here for later.</p>
                    <Link to="/" className="btn-secondary">Browse movies</Link>
                </div>
            )}
        </main>
    );
};

export default WatchlistPage;
