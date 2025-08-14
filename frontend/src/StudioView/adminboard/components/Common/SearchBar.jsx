import React, { useState, useEffect, useRef } from "react";

const SearchBar = ({
  data = [],
  fields = [],
  onResultClick,
  placeholder = "Search...",
  displayFn = (item) => item?.id || "Result",
  resultTypeFn = () => "",
  className = "",
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.trim() === "") {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const searchLower = value.toLowerCase();
    const results = data.filter((item) =>
      fields.some((field) => {
        const val = typeof field === "function" ? field(item) : item[field];
        return val && val.toString().toLowerCase().includes(searchLower);
      })
    );
    setSearchResults(results);
    setShowSearchResults(results.length > 0);
  };

  const handleResultClick = (result) => {
    setSearchTerm("");
    setSearchResults([]);
    setShowSearchResults(false);
    if (onResultClick) onResultClick(result);
  };

  return (
    <div className={`relative search-container ${className}`} ref={containerRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleSearch}
        className="w-64 px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent bg-white shadow-lg"
      />
      <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      {showSearchResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50">
          {searchResults.map((result, idx) => (
            <div
              key={idx}
              className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
              onClick={() => handleResultClick(result)}
            >
              <div className="font-medium text-gray-900 text-sm">
                {displayFn(result)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {resultTypeFn(result)}
              </div>
            </div>
          ))}
        </div>
      )}
      {showSearchResults && searchResults.length === 0 && searchTerm.trim() !== "" && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4 z-50">
          <div className="text-gray-500 text-sm">No results found</div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;