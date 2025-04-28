import React, { useState, useRef, useEffect } from "react";

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  isLoading,
  disabled,
  error,
  helperText,
  displayKey,
  valueKey,
  name,
  transactionId,
  currentStatusId,
}) => {
  const [isOpen, setIsOpen] = useState(false); // Controls dropdown visibility
  const [searchTerm, setSearchTerm] = useState(value || ""); // Current search term
  const [touched, setTouched] = useState(false); // Tracks if the input has been interacted with
  const [highlightedIndex, setHighlightedIndex] = useState(-1); // Index of the currently highlighted option
  const dropdownRef = useRef(null); // Ref for dropdown container
  const inputRef = useRef(null); // Ref for input field

  // Find the currently selected option
  const selectedOption = options.find(
    (opt) => opt[valueKey]?.toString() === value?.toString()
  );

  // Set the search term based on the selected option
  useEffect(() => {
    if (selectedOption && !touched) {
      setSearchTerm(selectedOption[displayKey] || "");
    } else if (!value && !touched) {
      setSearchTerm(""); // Reset searchTerm if value is cleared externally
    }
  }, [selectedOption, displayKey, value, touched]);

  // Filter options based on the search term
  const filteredOptions = searchTerm
    ? options.filter((option) =>
        option[displayKey].toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setTouched(false);
        // Only reset searchTerm to selectedOption's display value or empty if no selection
        setSearchTerm(selectedOption ? selectedOption[displayKey] : "");
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedOption, displayKey]);

  // Handle changes to the input field
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setTouched(true);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle clicking on an option
  const handleOptionClick = (option) => {
    setTouched(false);
    setSearchTerm(option[displayKey]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    const value = `${option[valueKey]}`;
    onChange(transactionId, name, value); // Notify parent of the new value
  };

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        setHighlightedIndex((prev) =>
          prev + 1 >= filteredOptions.length ? 0 : prev + 1
        );
        e.preventDefault();
        break;
      case "ArrowUp":
        setHighlightedIndex((prev) =>
          prev - 1 < 0 ? filteredOptions.length - 1 : prev - 1
        );
        e.preventDefault();
        break;
      case "Enter":
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredOptions.length
        ) {
          handleOptionClick(filteredOptions[highlightedIndex]);
        }
        e.preventDefault();
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        inputRef.current?.blur();
        break;
      default:
        break;
    }
  };

  // Handle input focus
  const handleFocus = () => {
    setIsOpen(true);
    setTouched(true);
  };

  // Clear the search term and value
  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm(""); // Clear local search term state
    setTouched(false);
    setIsOpen(false); // Close dropdown
    setHighlightedIndex(-1); // Reset highlighted index
    onChange(transactionId, name, ""); // Notify parent about cleared value
    // Note: currentStatusId is not modified here; it persists as a prop
  };

  // Scroll the highlighted option into view
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0) {
      const optionElement = document.getElementById(
        `option-${highlightedIndex}`
      );
      if (optionElement) {
        optionElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [highlightedIndex, isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Input field */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`w-full px-2 py-1 border rounded-md ${
            error ? "border-red-500" : "border-gray-300"
          } ${disabled ? "bg-gray-100" : ""}`}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />

        {searchTerm && (
          <button
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={handleClear}
            type="button"
          >
            × {/* You can replace this with an icon if needed */}
          </button>
        )}
      </div>

      {/* Loading spinner */}
      {isLoading && (
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* Dropdown options */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(
              (option, index) =>
                (currentStatusId === 28 ||
                  name === "schedule_time" ||
                  option.id >= currentStatusId) && (
                  <div
                    id={`option-${index}`}
                    key={option[valueKey]}
                    className={`p-1 cursor-pointer ${
                      option[valueKey]?.toString() === value?.toString()
                        ? "bg-blue-50"
                        : ""
                    } ${
                      index === highlightedIndex
                        ? "bg-blue-100"
                        : "hover:bg-gray-100"
                    }`}
                    onClick={() => handleOptionClick(option)}
                  >
                    {option[displayKey]}
                  </div>
                )
            )
          ) : (
            <div className="p-2 text-gray-500">No results found</div>
          )}
        </div>
      )}

      {/* Error and helper text */}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helperText && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    </div>
  );
};

export default SearchableDropdown;
