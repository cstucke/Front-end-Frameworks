import { Movie } from "../types";
import { getPosterUrl, getBackdropUrl } from "../data/sampleMovies";
import { getGenreNames } from "../data/genres";

type MovieModalProps = {
    movie: Movie;
    onClose: () => void;
};

const MovieModal = ({ movie, onClose }: MovieModalProps) => {
    return (
        <div className="modal-overlay active" onClick={onClose}>
            <div
                className="modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-movie-title"
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close-btn" aria-label="Close" onClick={onClose}>
                    ×
                </button>
                <div
                    className="modal-backdrop-hero"
                    style={{ backgroundImage: `url('${getBackdropUrl(movie.backdrop_path)}')` }}
                ></div>
                <div className="modal-body">
                    <img className="modal-poster" src={getPosterUrl(movie.poster_path)} alt={movie.title} />
                    <div className="modal-content-details">
                        <h2 className="modal-title" id="modal-movie-title">{movie.title}</h2>
                        <div className="modal-meta-row">
                            <span className="rating-badge">{movie.vote_average.toFixed(1)}</span>
                            <span className="modal-meta-item">{movie.release_date}</span>
                        </div>
                        <div className="movie-genres-tags">
                            {getGenreNames(movie.genre_ids).map((genre) => (
                                <span key={genre} className="genre-tag">{genre}</span>
                            ))}
                        </div>
                        <p className="modal-overview">{movie.overview}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MovieModal;