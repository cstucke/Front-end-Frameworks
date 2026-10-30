import { useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HeaderComponent from "./components/HeaderComp";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import NotFoundPage from "./pages/NotFoundPage";

const WatchPage = lazy(() => import("./pages/WatchPage"));

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
            <Route path="/watch" element={<Suspense><WatchPage /></Suspense>} />
          </Routes>
        </div>
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
