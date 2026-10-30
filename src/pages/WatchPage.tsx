import { useLocation, useParams } from "react-router-dom";
import StreamPlayer from "../components/StreamPlayer";
import NotFoundPage from "./NotFoundPage";
import { useMovieDetails } from "../hooks/useMovieDetails";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useScrollLock } from "../hooks/useOverlay";

const WatchPage = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const { movie, details, error } = useMovieDetails(id);
    const shown = movie ?? state?.movie;

    useScrollLock();
    useDocumentTitle(shown && `Watching ${shown.title}`);

    if (error && !shown) return <NotFoundPage />;

    return <StreamPlayer key={id} movie={shown} next={details?.recommendations.results[0]} />;
};

export default WatchPage;
