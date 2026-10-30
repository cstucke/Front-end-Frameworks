import { Link } from "react-router-dom";
import { Movie } from "../types";
import { getBackdropUrl } from "../data/sampleMovies";
import { getGenreNames } from "../data/genres";
import { useOverlayState } from "../hooks/useOverlay";
import { PlayLink, WatchlistButton } from "./MovieActions";

const Billboard = ({ movie }: { movie: Movie }) => {
    const overlayState = useOverlayState();

    return (
        <section className="billboard" style={{ backgroundImage: `url('${getBackdropUrl(movie.backdrop_path)}')` }}>
            <div className="billboard-content">
                <h1 className="billboard-title">{movie.title}</h1>
                <p className="modal-meta-item">
                    {movie.release_date.substring(0, 4)} · &#9733; {movie.vote_average.toFixed(1)} · {getGenreNames(movie.genre_ids).join(", ")}
                </p>
                <p className="billboard-overview">{movie.overview}</p>
                <div className="modal-footer-actions">
                    <PlayLink movie={movie} />
                    <Link to={`/movies/${movie.id}`} state={overlayState(movie)} className="btn-secondary">
                        More Info
                    </Link>
                    <WatchlistButton movie={movie} />
                </div>
            </div>
        </section>
    );
};

export default Billboard;
