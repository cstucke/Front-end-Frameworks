import { useEffect, useRef } from "react";
import Hls from "hls.js";

const STREAM_URL = "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8";

const StreamPlayer = () => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const video = videoRef.current;
        if (!video || !Hls.isSupported()) return;

        const hls = new Hls();
        hls.loadSource(STREAM_URL);
        hls.attachMedia(video);

        return () => hls.destroy();
    }, []);

    return <video ref={videoRef} className="poster-img" controls />;
};

export default StreamPlayer;