import { useState } from "react";
import { Link } from "react-router-dom";
import { Movie } from "../types";
import { useAppContext } from "../context/AppContext";
import { useOverlayState } from "../hooks/useOverlay";

export const PlayLink = ({ movie }: { movie: Movie }) => {
    const { getProgress } = useAppContext();
    const overlayState = useOverlayState();

    return (
        <Link to={`/watch/${movie.id}`} state={overlayState(movie)} className="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
                <polygon points="8.5 5.5 18.5 12 8.5 18.5"></polygon>
            </svg>
            {getProgress(movie.id) ? "Resume" : "Play"}
        </Link>
    );
};

export const WatchlistButton = ({ movie }: { movie: Movie }) => {
    const { toggleFavorite, isFavorite } = useAppContext();
    const saved = isFavorite(movie.id);

    return (
        <button className="btn-secondary" onClick={() => toggleFavorite(movie)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill={saved ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.78-8.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            {saved ? "Remove from Watchlist" : "Add to Watchlist"}
        </button>
    );
};

export const ShareButton = ({ movie }: { movie: Movie }) => {
    const [copied, setCopied] = useState(false);

    const share = async () => {
        const url = `${window.location.origin}/movies/${movie.id}`;
        if (navigator.share) {
            await navigator.share({ title: movie.title, url }).catch(() => {});
            return;
        }
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button className="btn-secondary" onClick={share}>
            {copied ? "Link copied" : "Share"}
        </button>
    );
};
