// Vercel Function: the only place that sees TMDB_API_KEY, so the token never reaches the browser.
// `npm run dev` has no Functions; the proxy in vite.config.ts does this job there.

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Only the endpoints the app reads, so this route can't reach the rest of TMDB with our token
const ALLOWED_PATHS =
    /^\/(trending\/movie\/week|genre\/movie\/list|search\/movie|discover\/movie|movie\/(popular|now_playing|top_rated|upcoming|\d+(\/recommendations)?))$/;

export default {
    async fetch(request) {
        if (request.method !== "GET") {
            return Response.json({ error: "Method not allowed" }, { status: 405 });
        }

        const url = new URL(request.url);
        const path = url.searchParams.get("path") ?? "";
        url.searchParams.delete("path");

        if (!ALLOWED_PATHS.test(path)) {
            return Response.json({ error: "Not found" }, { status: 404 });
        }

        const response = await fetch(`${TMDB_BASE_URL}${path}?${url.searchParams}`, {
            headers: {
                Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
                accept: "application/json",
            },
        });

        return new Response(await response.text(), {
            status: response.status,
            headers: { "content-type": "application/json" },
        });
    },
};
