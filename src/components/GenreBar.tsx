import { Link } from "react-router-dom";
import { Genre, SortOption } from "../types";

const SORT_LABELS: Record<SortOption, string> = {
    popularity: "Most popular",
    rating: "Top rated",
    release_date: "Newest",
    title: "A to Z",
};

type GenreBarProps = {
    genres: Genre[];
    activeId: string | null;
    sort: SortOption;
    onSortChange: (sort: SortOption) => void;
};

const GenreBar = ({ genres, activeId, sort, onSortChange }: GenreBarProps) => {
    return (
        <div className="filter-bar">
            <div className="genre-pills-scroll">
                <Link to="/" className={`genre-pill${activeId ? "" : " active"}`}>All</Link>
                {genres.map((genre) => (
                    <Link
                        key={genre.id}
                        to={`/?genre=${genre.id}`}
                        className={`genre-pill${String(genre.id) === activeId ? " active" : ""}`}
                    >
                        {genre.name}
                    </Link>
                ))}
            </div>
            {activeId && (
                <div className="sort-select-wrapper">
                    <select
                        className="sort-select"
                        aria-label="Sort by"
                        value={sort}
                        onChange={(e) => onSortChange(e.target.value as SortOption)}
                    >
                        {Object.entries(SORT_LABELS).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                </div>
            )}
        </div>
    );
};

export default GenreBar;
