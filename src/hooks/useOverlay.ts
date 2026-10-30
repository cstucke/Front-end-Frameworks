import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Movie } from "../types";

// Link state for /movies/:id and /watch/:id. App.tsx keeps `background` rendered behind
// them, so closing a title lands on the same page, at the same scroll position.
// `depth` counts the overlays opened in a row, so closing can step back past all of them.
export function useOverlayState() {
    const location = useLocation();

    return (movie: Movie) => ({
        movie,
        background: location.state?.background ?? location,
        depth: (location.state?.depth ?? 0) + 1,
    });
}

export function useScrollLock() {
    useEffect(() => {
        document.documentElement.classList.add("no-scroll");
        return () => document.documentElement.classList.remove("no-scroll");
    }, []);
}
