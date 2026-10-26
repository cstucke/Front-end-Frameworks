import { NavLink } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import SearchBar from "./SearchBar";

type HeaderProps = {
    searchQuery: string;
    onChange: (value: string) => void;
};

const HeaderComponent = ({ searchQuery, onChange }: HeaderProps) => {
    const { theme, toggleTheme } = useAppContext();

    return (
        <header className="site-header">
            <div className="header-inner">
                <div className="header-left">
                    <div className="brand-logo">
                        <div className="logo-dot"></div>
                        <span className="logo-text">CINE&middot;GRID</span>
                    </div>
                    <nav className="header-nav">
                        <NavLink to="/" end>Home</NavLink>
                        <NavLink to="/about">About</NavLink>
                    </nav>
                </div>

                <div className="header-search">
                    <SearchBar query={searchQuery} onChange={onChange} />
                </div>

                <div className="header-actions">
                    <button className="btn-icon-label">Watchlist 0</button>
                    <button className="theme-toggle-btn" onClick={toggleTheme}>
                        {theme === "dark" ? (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="5" />
                                <line x1="12" y1="1" x2="12" y2="3" />
                                <line x1="12" y1="21" x2="12" y2="23" />
                                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                                <line x1="1" y1="12" x2="3" y2="12" />
                                <line x1="21" y1="12" x2="23" y2="12" />
                                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                            </svg>
                        ) : (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                            </svg>
                        )}
                    </button>
                </div>
            </div>
        </header>
    );
};

export default HeaderComponent;