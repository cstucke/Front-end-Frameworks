export const tmdbUrl = (path: string) => `${import.meta.env.VITE_TMDB_BASE_URL}${path}`;

export const genresUrl = tmdbUrl("/genre/movie/list?language=en-US");

export async function tmdbFetch(url: string) {
    const response = await fetch(url, {
        headers: {
            Authorization: `Bearer ${import.meta.env.VITE_TMDB_API_KEY}`,
            accept: "application/json",
        },
    });
    if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
    }
    return response.json();
}
