import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Movie } from "../types";
import { getBackdropUrl } from "../data/sampleMovies";

const COUNTDOWN_SECONDS = 10;

const UpNext = ({ movie, onCancel }: { movie: Movie; onCancel: () => void }) => {
    const [seconds, setSeconds] = useState(COUNTDOWN_SECONDS);
    const navigate = useNavigate();
    const { state } = useLocation();
    const nextState = { ...state, movie };

    useEffect(() => {
        if (seconds === 0) {
            navigate(`/watch/${movie.id}`, { replace: true, state: nextState });
            return;
        }
        const timer = setTimeout(() => setSeconds((s) => s - 1), 1000);
        return () => clearTimeout(timer);
    });

    return (
        <div slot="centered-chrome" className="up-next">
            <img className="up-next-image" src={getBackdropUrl(movie.backdrop_path, "w500")} alt="" />
            <div className="up-next-body">
                <p className="watch-pause-muted">Up next in {seconds}s</p>
                <p className="up-next-title">{movie.title}</p>
                <div className="up-next-actions">
                    <Link to={`/watch/${movie.id}`} replace state={nextState} className="btn-primary">
                        Play Now
                    </Link>
                    <button className="btn-secondary" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default UpNext;
