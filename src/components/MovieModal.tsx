import { useEffect, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import MovieInfo from "./MovieInfo";
import { useMovieDetails } from "../hooks/useMovieDetails";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { useScrollLock } from "../hooks/useOverlay";

const MovieModal = () => {
    const { id } = useParams();
    const { state } = useLocation();
    const navigate = useNavigate();
    const { movie, details, error } = useMovieDetails(id);
    const dialogRef = useRef<HTMLDivElement>(null);
    // Read during render: the page behind turns inert on commit, which drops its focus
    const opener = useRef(document.activeElement as HTMLElement | null);
    const shown = movie ?? state?.movie;

    const close = () => navigate(-(state?.depth ?? 1));

    useScrollLock();
    useDocumentTitle(shown?.title);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") close();
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    });

    // Focus moves into the dialog and back to whatever opened it
    useEffect(() => {
        const returnTo = opener.current;
        dialogRef.current?.focus();
        return () => returnTo?.focus({ preventScroll: true });
    }, []);

    // A title opened from "More Like This" starts from the top
    useEffect(() => {
        if (dialogRef.current) dialogRef.current.scrollTop = 0;
    }, [id]);

    return (
        <div className="modal-overlay active" onClick={close}>
            <div
                ref={dialogRef}
                className="modal-dialog"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-movie-title"
                tabIndex={-1}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close-btn" aria-label="Close" onClick={close}>
                    ×
                </button>
                {shown && <MovieInfo key={id} movie={shown} details={details} />}
                {!shown && !error && <div className="modal-backdrop-hero"></div>}
                {!shown && error && (
                    <div className="empty-state">
                        <p className="empty-text">We couldn&rsquo;t load this movie.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MovieModal;
