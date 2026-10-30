import { useState } from "react";
import { Movie, MovieDetails } from "../types";
import { getPosterUrl, getBackdropUrl } from "../data/sampleMovies";
import { getGenreNames } from "../data/genres";
import { genresUrl } from "../data/tmdb";
import { useAppContext } from "../context/AppContext";
import { useGenres } from "../hooks/useGenres";
import { PlayLink, ShareButton, WatchlistButton } from "./MovieActions";
import MovieRow from "./MovieRow";

const MAX_PROVIDERS = 6;

const formatRuntime = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`;

const getCertification = (details: MovieDetails | null) =>
    details?.release_dates.results
        .find((r) => r.iso_3166_1 === "US")
        ?.release_dates.find((d) => d.certification)?.certification;

type MovieInfoProps = {
    movie: Movie;
    details: MovieDetails | null;
};

// The title view shared by the /movies/:id page and its overlay.
// `movie` is on screen straight away; `details` fills in the rest when TMDB answers.
const MovieInfo = ({ movie, details }: MovieInfoProps) => {
    const [showTrailer, setShowTrailer] = useState(false);
    const { getProgress } = useAppContext();
    const { genres } = useGenres(genresUrl);

    const trailer = details?.videos.results.find((v) => v.site === "YouTube" && v.type === "Trailer");
    const director = details?.credits.crew.find((c) => c.job === "Director");
    const cast = details?.credits.cast.filter((c) => c.profile_path).slice(0, 8) ?? [];
    const certification = getCertification(details);
    const recommendations = details?.recommendations.results ?? [];
    const progress = getProgress(movie.id);
    const region = navigator.language.split("-")[1] ?? "US";
    const watchOptions = details?.["watch/providers"].results[region];
    const providers = watchOptions?.flatrate ?? watchOptions?.rent ?? watchOptions?.buy;

    return (
        <>
            {showTrailer && trailer ? (
                <iframe
                    className="modal-trailer"
                    src={`https://www.youtube-nocookie.com/embed/${trailer.key}?autoplay=1&rel=0`}
                    title={`${movie.title} trailer`}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                ></iframe>
            ) : (
                <div
                    className="modal-backdrop-hero"
                    style={{ backgroundImage: `url('${getBackdropUrl(movie.backdrop_path)}')` }}
                ></div>
            )}
            <div className="modal-body">
                <img className="modal-poster" src={getPosterUrl(movie.poster_path)} alt={movie.title} />
                <div className="modal-content-details">
                    <h2 className="modal-title" id="modal-movie-title">{movie.title}</h2>
                    {details?.tagline && <p className="modal-original-title">{details.tagline}</p>}
                    <div className="modal-meta-row">
                        {movie.vote_count > 0 && (
                            <span className="rating-badge">
                                <svg viewBox="0 0 24 24">
                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                </svg>
                                {movie.vote_average.toFixed(1)}
                            </span>
                        )}
                        <span className="modal-meta-item">{movie.release_date.substring(0, 4)}</span>
                        {details?.runtime ? <span className="modal-meta-item">{formatRuntime(details.runtime)}</span> : null}
                        {certification && <span className="certification-badge">{certification}</span>}
                    </div>
                    <div className="movie-genres-tags">
                        {getGenreNames(movie.genre_ids).map((genre) => (
                            <span key={genre} className="genre-tag">{genre}</span>
                        ))}
                    </div>
                    <p className="modal-overview">{movie.overview}</p>
                    <div className="modal-footer-actions">
                        <PlayLink movie={movie} />
                        {trailer && !showTrailer && (
                            <button className="btn-secondary" onClick={() => setShowTrailer(true)}>Trailer</button>
                        )}
                        <WatchlistButton movie={movie} />
                        <ShareButton movie={movie} />
                    </div>
                    {progress && (
                        <p className="modal-meta-item">
                            {Math.ceil((progress.duration - progress.time) / 60)} min left
                        </p>
                    )}
                    {director && (
                        <p className="modal-overview">
                            <span className="modal-overview-heading">Director </span>
                            <span>{director.name}</span>
                        </p>
                    )}
                </div>
            </div>
            {watchOptions && providers && (
                <div className="modal-section">
                    <h3 className="modal-overview-heading">Where to Watch</h3>
                    <a className="provider-list" href={watchOptions.link} target="_blank" rel="noreferrer">
                        {providers.slice(0, MAX_PROVIDERS).map((provider) => (
                            <img
                                key={provider.provider_id}
                                className="provider-logo"
                                src={getPosterUrl(provider.logo_path, "w92")}
                                alt={provider.provider_name}
                                title={provider.provider_name}
                            />
                        ))}
                    </a>
                    <p className="cast-character">
                        {watchOptions.flatrate ? "Streaming" : "To rent or buy"} · Availability from JustWatch
                    </p>
                </div>
            )}
            {cast.length > 0 && (
                <div className="modal-section">
                    <h3 className="modal-overview-heading">Cast</h3>
                    <ul className="cast-list">
                        {cast.map((person) => (
                            <li key={person.id} className="cast-member">
                                <img className="cast-photo" src={getPosterUrl(person.profile_path, "w185")} alt="" loading="lazy" />
                                <span className="cast-name">{person.name}</span>
                                <span className="cast-character">{person.character}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {recommendations.length > 0 && (
                <div className="modal-section">
                    <MovieRow title="More Like This" movies={recommendations} genres={genres} />
                </div>
            )}
        </>
    );
};

export default MovieInfo;
