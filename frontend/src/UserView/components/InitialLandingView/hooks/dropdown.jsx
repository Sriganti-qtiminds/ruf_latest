import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";

const SearchableDropdown = ({ label, value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Focus input when dropdown opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Get selected option or use label
  const selectedOption = options.find((option) => option.name === value);
  const displayText = selectedOption ? selectedOption.name : label;

  // Filter options based on search term, removing spaces
  const filteredOptions = options.filter((option) => {
    const optionNameNoSpaces = option.name.toLowerCase().replace(/\s/g, "");
    const searchTermNoSpaces = searchTerm.toLowerCase().replace(/\s/g, "");
    return optionNameNoSpaces.includes(searchTermNoSpaces);
  });

  // Handlers
  const handleOptionClick = (optionId) => {
    onChange({ target: { value: optionId } });
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleInputClick = (e) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Search Input Trigger */}
      <div className="relative cursor-pointer" onClick={handleInputClick}>
        <input
          ref={inputRef}
          type="text"
          value={searchTerm || (isOpen ? "" : displayText)}
          onChange={handleSearchChange}
          placeholder={label}
          className={`cursor-pointer bg-white w-full px-2 py-1 text-xs text-[#001433] bg-transparent border border-gray-300 rounded-lg focus:outline-none focus:border-[#4A628A] pr-8 ${
            !value && !searchTerm ? "text-gray-500" : ""
          }`}
          autoComplete="off"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && !searchTerm ? (
            <button
              onClick={() => handleOptionClick("")}
              className="ml-2 text-gray-400"
              aria-label="Clear selection"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <Search className="h-3 w-3 text-gray-400" />
          )}
        </div>
      </div>

      {/* Dropdown Modal */}
      {isOpen && (
        <ul
          className="absolute w-full text-left bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto z-20"
          style={{ top: "calc(100% + 2px)" }} // Small gap below input
        >
          {filteredOptions.length === 0 ? (
            <li className="px-2 py-1 text-gray-400 text-xs">
              No Results Found
            </li>
          ) : (
            filteredOptions.map((option) => (
              <li
                key={option.id}
                onClick={() => handleOptionClick(option.name)}
                className={`px-2 py-1 text-xs text-[#001433] hover:bg-gray-100 cursor-pointer ${
                  option.name === value ? "bg-gray-200" : ""
                }`}
              >
                {option.name}
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
};

export default SearchableDropdown;
