import { useParams } from "react-router-dom";
import MovieInfo from "../components/MovieInfo";
import NotFoundPage from "./NotFoundPage";
import { useMovieDetails } from "../hooks/useMovieDetails";
import { useDocumentTitle } from "../hooks/useDocumentTitle";

const MoviePage = () => {
    const { id } = useParams();
    const { movie, details, error } = useMovieDetails(id);

    useDocumentTitle(movie?.title);

    if (error) return <NotFoundPage />;

    return (
        <main className="main-container">
            <article className="movie-page">
                {movie ? <MovieInfo key={id} movie={movie} details={details} /> : <div className="modal-backdrop-hero"></div>}
            </article>
        </main>
    );
};

export default MoviePage;
