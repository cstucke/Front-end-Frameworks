import { Link } from "react-router-dom";

const NotFoundPage = () => {
    return (
      <main className="main-container">
        <h1>404</h1>
        <p>Page not found.</p>
        <Link to="/">Back to Home</Link>
      </main>
    );
  };
  
 export default NotFoundPage;