import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import SearchBar from "./components/SearchBar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <BrowserRouter>
      <div className="app-layout">
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
              <SearchBar query={searchQuery} onChange={setSearchQuery} />
            </div>

            <div className="header-actions">
              <button className="btn-icon-label">Watchlist 0</button>
              <button className="btn-icon-label">icon here</button>
            </div>
          </div>
        </header>
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
