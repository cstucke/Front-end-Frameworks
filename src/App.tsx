import { useState } from "react";
import { BrowserRouter, Routes, Route, NavLink, Outlet } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HeaderComponent from "./components/HeaderComp";
import SearchBar from "./components/SearchBar";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";
import WatchPage from "./pages/WatchPage";

const App = () => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <AppProvider>
      <BrowserRouter>
        <div className="app-layout">
          <Routes>
            <Route
              element={
                <>
                  <HeaderComponent
                    searchQuery={searchQuery}
                    onChange={setSearchQuery}
                  />
                  <Outlet />
                </>
              }
            >
              <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="/watch" element={<WatchPage />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
