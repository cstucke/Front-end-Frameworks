import { createContext, useContext, useReducer, useEffect } from "react";
import type { Movie, Theme } from "../types";

type State = {
    theme: Theme;
    favorites: Movie[];
};

type Action =
    | { type: "SET_THEME" }
    | { type: "TOGGLE_FAVOURITE"; payload: Movie };

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
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// 4. Provider — wraps the app, owns the state
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const initialTheme =
        (localStorage.getItem("cinegrid_theme") as Theme) || "dark";

    const initialFavorites: Movie[] = JSON.parse(
        localStorage.getItem("cinegrid_favorites") || "[]"
    );

    const [state, dispatch] = useReducer(reducer, {
        theme: initialTheme,
        favorites: initialFavorites,
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

    const toggleTheme = () => dispatch({ type: "SET_THEME" });

    const toggleFavorite = (movie: Movie) =>
        dispatch({ type: "TOGGLE_FAVOURITE", payload: movie });

    const isFavorite = (id: number) =>
        state.favorites.some((m) => m.id === id);

    return (
        <AppContext.Provider
            value={{
                theme: state.theme,
                toggleTheme,
                favorites: state.favorites,
                toggleFavorite,
                isFavorite,
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