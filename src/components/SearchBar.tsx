type SearchBarProps = {
    query: string;
    onChange: (value: string) => void;
};

const SearchBar = ({ query, onChange }: SearchBarProps) => {
    return (
        <input
            className="search-input"
            type="text"
            placeholder="Search movies..."
            value={query}
            onChange={(e) => onChange(e.target.value)}
        />
    );
};

export default SearchBar;
