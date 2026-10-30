import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Hls from "hls.js";
import { Movie } from "../types";
import { getGenreNames } from "../data/genres";
import {
    MediaController,
    MediaControlBar,
    MediaPlayButton,
    MediaTimeRange,
    MediaTimeDisplay,
    MediaMuteButton,
    MediaVolumeRange,
    MediaFullscreenButton,
} from "media-chrome/react";

const STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const StreamPlayer = ({ movie }: { movie?: Movie }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const navigate = useNavigate();

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !Hls.isSupported()) return;

        const hls = new Hls();
        hls.loadSource(STREAM_URL);
        hls.attachMedia(video);

        return () => hls.destroy();
    }, []);

    return (
        <MediaController className="watch-player">
            <video ref={videoRef} slot="media" />
            <div slot="top-chrome" className="watch-top-bar">
                <button className="watch-back-btn" aria-label="Back" onClick={() => navigate(-1)}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>
                <h1 className="watch-title">{movie?.title}</h1>
            </div>
            {movie && (
                <div slot="centered-chrome" className="watch-pause-info">
                    <p className="watch-pause-muted">You&rsquo;re watching</p>
                    <p className="watch-pause-title">{movie.title}</p>
                    <p className="watch-pause-muted">
                        {movie.release_date.substring(0, 4)} · &#9733; {movie.vote_average.toFixed(1)} · {getGenreNames(movie.genre_ids).join(", ")}
                    </p>
                    <p>{movie.overview}</p>
                </div>
            )}
            <div className="watch-bottom-bar">
                <MediaControlBar>
                    <MediaTimeRange />
                    <MediaTimeDisplay remaining />
                </MediaControlBar>
                <MediaControlBar>
                    <MediaPlayButton />
                    <MediaMuteButton />
                    <MediaVolumeRange />
                    <MediaFullscreenButton />
                </MediaControlBar>
            </div>
        </MediaController>
    );
};

export default StreamPlayer;