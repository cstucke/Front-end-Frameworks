import { useState } from "react"
import {Movie} from "../types"
import { getPosterUrl } from "../data/sampleMovies";

type MovieCardProps = {
    movie: Movie;
    onClick?: () => void;
};

const MovieCard = ({movie, onClick}: MovieCardProps) => {
    const [isFavourite, setIsFavourite] = useState(false);

    return (
        <section className="movie-card" onClick={onClick}>
            <img className="poster-img" src={getPosterUrl(movie.poster_path)} alt={movie.title}/>
            <h2>{movie.title}</h2>
            <span className="rating-badge">{movie.vote_average.toFixed(1)}</span>
            <button
                className={`favorite-btn${isFavourite ? " is-favorite" : ""}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setIsFavourite((prev) => !prev);
                }}
            >
                {isFavourite ? "Remove from Favourites" : "Add to Favourites"}
            </button>
        </section>
    )
}

export default MovieCard
