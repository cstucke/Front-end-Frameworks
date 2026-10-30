import { SyntheticEvent, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Hls from "hls.js";
import { Movie } from "../types";
import { getGenreNames } from "../data/genres";
import { useAppContext } from "../context/AppContext";
import UpNext from "./UpNext";
import {
    MediaController,
    MediaControlBar,
    MediaLoadingIndicator,
    MediaPlayButton,
    MediaSeekBackwardButton,
    MediaSeekForwardButton,
    MediaTimeRange,
    MediaTimeDisplay,
    MediaMuteButton,
    MediaVolumeRange,
    MediaPlaybackRateButton,
    MediaPipButton,
    MediaFullscreenButton,
} from "media-chrome/react";

const STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";
const SAVE_EVERY_SECONDS = 10;
const SEEK_SECONDS = 10;

type StreamPlayerProps = {
    movie?: Movie;
    next?: Movie;
};

const StreamPlayer = ({ movie, next }: StreamPlayerProps) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const lastSaved = useRef(0);
    const navigate = useNavigate();
    const { id } = useParams();
    const { state } = useLocation();
    const { saveProgress, getProgress } = useAppContext();
    const startAt = useRef(getProgress(Number(id))?.time ?? -1);
    const [quality, setQuality] = useState("");
    const [ended, setEnded] = useState(false);
    const [failed, setFailed] = useState(false);

    const save = (video: HTMLVideoElement) => {
        if (!movie || !video.duration) return;
        lastSaved.current = video.currentTime;
        saveProgress(movie, video.currentTime, video.duration);
    };
    const saveOnExit = useRef(save);
    saveOnExit.current = save;

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !Hls.isSupported()) return;

        const hls = new Hls({ startPosition: startAt.current });
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // Browsers can refuse this on a direct link; the play button still works then
            video.play().catch(() => {});
        });
        hls.on(Hls.Events.LEVEL_SWITCHED, (_, { level }) => {
            setQuality(`${hls.levels[level].height}p`);
        });
        hls.on(Hls.Events.ERROR, (_, { fatal }) => {
            if (fatal) setFailed(true);
        });
        hls.loadSource(STREAM_URL);
        hls.attachMedia(video);

        // `video`, not videoRef: React has cleared the ref by the time this runs
        return () => {
            saveOnExit.current(video);
            hls.destroy();
        };
    }, []);

    const handleTimeUpdate = (e: SyntheticEvent<HTMLVideoElement>) => {
        const video = e.currentTarget;
        if (Math.abs(video.currentTime - lastSaved.current) >= SAVE_EVERY_SECONDS) save(video);
    };

    const handleEnded = (e: SyntheticEvent<HTMLVideoElement>) => {
        save(e.currentTarget);
        setEnded(true);
    };

    // Only a player opened from inside the app has somewhere to go back to
    const goBack = () => (state?.background ? navigate(-1) : navigate(`/movies/${id}`, { replace: true }));

    return (
        <MediaController className="watch-player">
            <video
                ref={videoRef}
                slot="media"
                onTimeUpdate={handleTimeUpdate}
                onPause={(e) => save(e.currentTarget)}
                onPlay={() => setEnded(false)}
                onEnded={handleEnded}
            />
            <div slot="top-chrome" className="watch-top-bar">
                <button className="watch-back-btn" aria-label="Back" onClick={goBack}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="12" x2="5" y2="12" />
                        <polyline points="12 19 5 12 12 5" />
                    </svg>
                </button>
                <h1 className="watch-title">{movie?.title}</h1>
                {quality && <span className="watch-quality" title="Quality chosen for your connection">{quality}</span>}
            </div>
            <MediaLoadingIndicator slot="centered-chrome" noAutohide />
            {movie && !ended && (
                <div slot="centered-chrome" className="watch-pause-info">
                    <p className="watch-pause-muted">You&rsquo;re watching</p>
                    <p className="watch-pause-title">{movie.title}</p>
                    <p className="watch-pause-muted">
                        {movie.release_date.substring(0, 4)} · &#9733; {movie.vote_average.toFixed(1)} · {getGenreNames(movie.genre_ids).join(", ")}
                    </p>
                    <p>{movie.overview}</p>
                </div>
            )}
            {failed && (
                <p slot="centered-chrome" className="watch-error">The demo stream isn&rsquo;t responding. Try again later.</p>
            )}
            {ended && next && <UpNext movie={next} onCancel={() => setEnded(false)} />}
            <div className="watch-bottom-bar">
                <MediaControlBar>
                    <MediaTimeRange />
                    <MediaTimeDisplay remaining />
                </MediaControlBar>
                <MediaControlBar>
                    <MediaPlayButton />
                    <MediaSeekBackwardButton seekOffset={SEEK_SECONDS} />
                    <MediaSeekForwardButton seekOffset={SEEK_SECONDS} />
                    <MediaMuteButton />
                    <MediaVolumeRange />
                    <MediaPlaybackRateButton />
                    <MediaPipButton />
                    <MediaFullscreenButton />
                </MediaControlBar>
            </div>
        </MediaController>
    );
};

export default StreamPlayer;
