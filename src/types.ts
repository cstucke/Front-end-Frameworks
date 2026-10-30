export interface Movie {
    id: number;
    title: string;
    original_title?: string;
    overview: string;
    poster_path: string | null;
    backdrop_path: string | null;
    genre_ids: number[];
    release_date: string;
    vote_average: number;
    vote_count: number;
    popularity: number;
    adult: boolean;
}

export interface Genre {
    id: number;
    name: string;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
}

export interface CrewMember {
    id: number;
    name: string;
    job: string;
}

export interface Video {
    key: string;
    name: string;
    site: string;
    type: string;
    official: boolean;
}

export interface WatchProvider {
    provider_id: number;
    provider_name: string;
    logo_path: string;
}

export interface MovieDetails extends Movie {
    tagline: string;
    runtime: number | null;
    genres: Genre[];
    credits: { cast: CastMember[]; crew: CrewMember[] };
    videos: { results: Video[] };
    recommendations: { results: Movie[] };
    "watch/providers": {
        results: Record<string, { link: string; flatrate?: WatchProvider[]; rent?: WatchProvider[]; buy?: WatchProvider[] }>;
    };
    release_dates: {
        results: { iso_3166_1: string; release_dates: { certification: string }[] }[];
    };
}

export interface WatchProgress {
    movie: Movie;
    time: number;
    duration: number;
}

export type SortOption = 'popularity' | 'rating' | 'release_date' | 'title';
export type ViewMode = 'grid' | 'list';
export type Theme = 'dark' | 'light';
