import { useLocation } from "react-router-dom";
import StreamPlayer from "../components/StreamPlayer";

const WatchPage = () => {
    const { state } = useLocation();

    return <StreamPlayer movie={ state?.movie } />;
};

export default WatchPage;