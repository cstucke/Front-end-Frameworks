import { createContext, useContext, useReducer, useEffect } from "react";
import type { Theme } from "../types";

// 1. Define state shape and actions
type State = {
    theme: Theme;
};

type Action = { type: "SET_THEME" };

// 2. Reducer — pure function, no side effects
const reducer = (state: State, action: Action): State => {
    switch (action.type) {
        case "SET_THEME":
            return {
                ...state,
                theme: state.theme === "dark" ? "light" : "dark",
            };
        default:
            return state;
    }
};

// 3. Context shape (what consumers will receive)
type AppContextType = {
    theme: Theme;
    toggleTheme: () => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

// 4. Provider — wraps the app, owns the state
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
    const initialTheme =
        (localStorage.getItem("cinegrid_theme") as Theme) || "dark";

    const [state, dispatch] = useReducer(reducer, { theme: initialTheme });

    // Sync to localStorage + DOM whenever theme changes
    useEffect(() => {
        localStorage.setItem("cinegrid_theme", state.theme);
        document.documentElement.setAttribute("data-theme", state.theme);
    }, [state.theme]);

    const toggleTheme = () => dispatch({ type: "SET_THEME" });

    return (
        <AppContext.Provider value={{ theme: state.theme, toggleTheme }}>
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