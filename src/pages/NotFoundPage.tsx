import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main className="main-container">
      <div className="empty-state">
        <h1>404</h1>
        <p className="empty-text">Page not found.</p>
        <Link to="/" className="btn-secondary">Back to Home</Link>
      </div>
    </main>
  );
};

export default NotFoundPage;