import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <main className="main-container">
      <div className="empty-state">
        <h1>About CineGrid</h1>
        <p className="empty-text">A movie discovery app built with React and the TMDB API.</p>
        <p className="empty-text">This product uses the TMDB API but is not endorsed or certified by TMDB.</p>
        <Link to="/" className="btn-secondary">Back to movies</Link>
      </div>
    </main>
  );
};

export default AboutPage;