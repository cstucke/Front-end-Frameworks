import { createContext, useContext, useReducer, useEffect } from "react";
import type { Movie, Theme, WatchProgress } from "../types";

// Under this many seconds a title doesn't count as started
const MIN_WATCHED_SECONDS = 5;
// Past this share of the runtime a title counts as finished
const FINISHED_RATIO = 0.95;

type State = {
    theme: Theme;
    favorites: Movie[];
    progress: WatchProgress[]; // most recently watched first
};

type Action =
    | { type: "SET_THEME" }
    | { type: "TOGGLE_FAVOURITE"; payload: Movie }
    | { type: "SAVE_PROGRESS"; payload: WatchProgress }
    | { type: "REMOVE_PROGRESS"; payload: number };

// 2. Reducer — pure function, no side effects
const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "SET_THEME":
            return {
                ...state,
                theme: state.theme === "dark" ? "light" : "dark",
            };
        case "TOGGLE_FAVOURITE": {
            const exists = state.favorites.some((m) => m.id === action.payload.id);
            return {
                ...state,
                favorites: exists
                    ? state.favorites.filter((m) => m.id !== action.payload.id) // remove
                    : [...state.favorites, action.payload], // add
            };
        }
        case "SAVE_PROGRESS": {
            const { movie, time, duration } = action.payload;
            if (time < MIN_WATCHED_SECONDS) return state;
            const others = state.progress.filter((p) => p.movie.id !== movie.id);
            return {
                ...state,
                progress: time / duration >= FINISHED_RATIO ? others : [action.payload, ...others],
            };
        }
        case "REMOVE_PROGRESS":
            return {
                ...state,
                progress: state.progress.filter((p) => p.movie.id !== action.payload),
            };
        default:
            return state;
    }
};

// 3. Context shape (what consumers will receive)
type AppContextType = {
    theme: Theme;
    toggleTheme: () => void;
    favorites: Movie[];
    toggleFavorite: (movie: Movie) => void;
    isFavorite: (id: number) => boolean;
    progress: WatchProgress[];
    saveProgress: (movie: Movie, time: number, duration: number) => void;
    getProgress: (id: number) => WatchProgress | undefined;
    removeProgress: (id: number) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// Saved data can be damaged or from an older version; a bad value must not stop the app starting
function readSavedList<T>(key: string): T[] {
    try {
        const saved = JSON.parse(localStorage.getItem(key) ?? "[]");
        return Array.isArray(saved) ? saved : [];
    } catch {
        return [];
    }
}

// 4. Provider — wraps the app, owns the state
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const initialTheme =
        (localStorage.getItem("cinegrid_theme") as Theme) || "dark";

    const [state, dispatch] = useReducer(reducer, {
        theme: initialTheme,
        favorites: readSavedList<Movie>("cinegrid_favorites"),
        progress: readSavedList<WatchProgress>("cinegrid_progress"),
    });

    // Sync to localStorage + DOM whenever theme changes
    useEffect(() => {
        localStorage.setItem("cinegrid_theme", state.theme);
        document.documentElement.setAttribute("data-theme", state.theme);
    }, [state.theme]);

    // Sync to localStorage whenever favorites change
    useEffect(() => {
        localStorage.setItem("cinegrid_favorites", JSON.stringify(state.favorites));
    }, [state.favorites]);

    // Sync to localStorage whenever watch progress changes
    useEffect(() => {
        localStorage.setItem("cinegrid_progress", JSON.stringify(state.progress));
    }, [state.progress]);

    const toggleTheme = () => dispatch({ type: "SET_THEME" });

    const toggleFavorite = (movie: Movie) =>
        dispatch({ type: "TOGGLE_FAVOURITE", payload: movie });

    const isFavorite = (id: number) =>
        state.favorites.some((m) => m.id === id);

    const saveProgress = (movie: Movie, time: number, duration: number) =>
        dispatch({ type: "SAVE_PROGRESS", payload: { movie, time, duration } });

    const getProgress = (id: number) =>
        state.progress.find((p) => p.movie.id === id);

    const removeProgress = (id: number) =>
        dispatch({ type: "REMOVE_PROGRESS", payload: id });

    return (
        <AppContext.Provider
            value={{
                theme: state.theme,
                toggleTheme,
                favorites: state.favorites,
                toggleFavorite,
                isFavorite,
                progress: state.progress,
                saveProgress,
                getProgress,
                removeProgress,
            }}
        >
            {children}
        </AppContext.Provider>
    );
};

// 5. Custom hook — enforces usage inside Provider
export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error("useAppContext must be used within an AppProvider");
    }
    return context;
};