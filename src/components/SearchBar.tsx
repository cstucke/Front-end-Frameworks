type SearchBarProps = {
    query: string;
    onChange: (value: string) => void;
};

const SearchBar = ({ query, onChange }: SearchBarProps) => {
    return (
        <div className="header-search">
            <div className="search-input-wrapper">
                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input
                    className="search-input"
                    type="text"
                    placeholder="Search movies..."
                    value={query}
                    onChange={(e) => onChange(e.target.value)}
                    autoComplete="off"
                />
                <button
                    className="search-clear-btn"
                    title="Clear search"
                    onClick={() => onChange("")}
                >
                    &times;
                </button>
            </div>
        </div>
    );
};

export default SearchBar;
