import { useEffect, useLayoutEffect, useRef, useState, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet, useLocation, useNavigationType } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import HeaderComponent from "./components/HeaderComp";
import MovieModal from "./components/MovieModal";
import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import MoviePage from "./pages/MoviePage";
import WatchlistPage from "./pages/WatchlistPage";
import NotFoundPage from "./pages/NotFoundPage";

const WatchPage = lazy(() => import("./pages/WatchPage"));

const player = (
  <Suspense fallback={<div className="watch-loading"></div>}>
    <WatchPage />
  </Suspense>
);

type SiteLayoutProps = {
  searchQuery: string;
  onChange: (value: string) => void;
};

const SiteLayout = ({ searchQuery, onChange }: SiteLayoutProps) => {
  const { pathname } = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    if (navigationType === "PUSH") window.scrollTo(0, 0);
  }, [pathname, navigationType]);

  return (
    <>
      <HeaderComponent searchQuery={searchQuery} onChange={onChange} />
      <Outlet />
    </>
  );
};

const AppRoutes = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();
  const pageRef = useRef<HTMLDivElement>(null);

  // A title opened from inside the app carries the page it was opened on in link state.
  // That page keeps rendering, so it stays mounted behind the overlay routes below.
  const background = location.state?.background;

  useLayoutEffect(() => {
    pageRef.current?.toggleAttribute("inert", Boolean(background));
  }, [background]);

  return (
    <>
      <div className="app-layout" ref={pageRef}>
        <Routes location={background ?? location}>
          <Route element={<SiteLayout searchQuery={searchQuery} onChange={setSearchQuery} />}>
            <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/movies/:id" element={<MoviePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
          <Route path="/watch/:id" element={player} />
        </Routes>
      </div>
      {background && (
        <Routes>
          <Route path="/movies/:id" element={<MovieModal />} />
          <Route path="/watch/:id" element={player} />
        </Routes>
      )}
    </>
  );
};

const App = () => {
  return (
    <AppProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AppProvider>
  );
};

export default App;
