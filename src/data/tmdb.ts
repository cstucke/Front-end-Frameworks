// Requests go to our own /api/tmdb route, which adds the token on the server (api/tmdb.js)
export const tmdbUrl = (path: string) => `/api/tmdb?path=${path.replace("?", "&")}`;

export const genresUrl = tmdbUrl("/genre/movie/list?language=en-US");

export async function tmdbFetch(url: string) {
    const response = await fetch(url, { headers: { accept: "application/json" } });
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    return response.json();
}
