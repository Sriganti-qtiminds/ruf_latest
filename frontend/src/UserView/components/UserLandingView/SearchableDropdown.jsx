import React, { useState, useEffect, useRef } from "react";

import tailwindStyles from "../../../utils/tailwindStyles";

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
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [touched, setTouched] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Identify the selected option based on the value
  const selectedOption = options.find(
    (opt) => opt[valueKey]?.toString() === value?.toString()
  );

  // Reset searchTerm when value changes
  useEffect(() => {
    if (selectedOption) {
      setSearchTerm(selectedOption[displayKey] || "");
    } else {
      setSearchTerm(""); // Reset searchTerm if no selected option
    }
  }, [selectedOption, displayKey, value]); // Add value to dependencies

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
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle input field changes
  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setTouched(true);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  // Handle option click events
  const handleOptionClick = (option) => {
    setTouched(false);
    setSearchTerm(option[displayKey]);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange({ target: { name, value: option[valueKey] } });
  };

  // Handle keyboard navigation within the dropdown
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

  // Open dropdown and set touched state on input focus
  const handleFocus = () => {
    setIsOpen(true);
    setTouched(true);
  };

  // Clear the search term and reset the state
  const handleClear = (e) => {
    e.stopPropagation();
    setSearchTerm("");
    setTouched(false);
    onChange({ target: { name, value: "" } });
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  // Ensure the highlighted option is visible in the dropdown
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
    // <div className="relative" ref={dropdownRef}>
    //   <div className="relative">
    //     <input
    //       ref={inputRef}
    //       type="text"
    //       className={`w-full ${tailwindStyles.paragraph} px-2 py-1  border rounded-md ${
    //         error ? "border-red-500" : "border-gray-300"
    //       } ${disabled ? "bg-gray-100" : ""}`}
    //       placeholder={placeholder}
    //       value={searchTerm}
    //       onChange={handleInputChange}
    //       onFocus={handleFocus}
    //       onKeyDown={handleKeyDown}
    //       disabled={disabled}
    //       autoComplete="off"
    //     />
    //     {searchTerm && (
    //       <button
    //         className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
    //         onClick={handleClear}
    //         type="button"
    //       >
    //         ×
    //       </button>
    //     )}
    //   </div>

    //   {isLoading && (
    //     <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
    //       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
    //     </div>
    //   )}

    //   {isOpen && !disabled && (
    //     <div className="absolute z-50 w-full mt-0 bg-white border rounded-md shadow-lg max-h-40 overflow-auto">
    //       {filteredOptions.length > 0 ? (
    //         filteredOptions.map((option, index) => (
    //           <div
    //             id={`option-${index}`}
    //             key={option[valueKey]}
    //             className={`${tailwindStyles.paragraph} p-2 cursor-pointer ${
    //               option[valueKey]?.toString() === value?.toString()
    //                 ? "bg-blue-50"
    //                 : ""
    //             } ${
    //               index === highlightedIndex
    //                 ? "bg-blue-100"
    //                 : "hover:bg-blue-200"
    //             }`}
    //             onClick={() => handleOptionClick(option)}
    //           >
    //             {option[displayKey]}
    //           </div>
    //         ))
    //       ) : (
    //         <div className="p-2 text-xs text-gray-500">No results found</div>
    //       )}
    //     </div>
    //   )}

    //   {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    //   {helperText && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    // </div>
    <div className="relative" ref={dropdownRef}>
      <div className="relative m-1">
        <input
          ref={inputRef}
          type="text"
          className={`
            w-full ${tailwindStyles.paragraph} 
            px-4 py-2 rounded-full 
            border transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-200
            ${error ? "border-red-500" : "border-gray-300"}
             ${
               value !== ""
                 ? "bg-blue-500 text-white border-blue-500"
                 : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
             }
            ${disabled && "bg-gray-100 cursor-not-allowed"}
            ${isOpen ? "shadow-md" : "shadow-sm"}
           
          `}
          placeholder={placeholder}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          autoComplete="off"
        />
        {searchTerm && !isLoading && (
          <button
            className="
              absolute right-3 top-1/2 transform -translate-y-1/2 
              w-5 h-5 rounded-full
              flex items-center justify-center 
              bg-gray-200 text-gray-600 
              hover:bg-gray-300 transition-colors duration-200
            "
            onClick={handleClear}
            type="button"
          >
            <svg
              className="w-3 h-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {isLoading && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {isOpen && !disabled && (
        <div
          className="
            absolute z-50 w-full mt-1 
            bg-white border border-gray-200 
            rounded-lg shadow-lg 
            max-h-48 overflow-auto
            py-1
          "
        >
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                id={`option-${index}`}
                key={option[valueKey]}
                className={`
                  ${tailwindStyles.paragraph} 
                  px-4 py-2  
                  rounded-full 
                  cursor-pointer 
                  transition-all duration-200
                  ${
                    option[valueKey]?.toString() === value?.toString()
                      ? "bg-blue-500 text-white"
                      : "text-gray-700"
                  }
                  ${
                    index === highlightedIndex
                      ? "bg-blue-100 text-gray-900"
                      : "hover:bg-blue-50"
                  }
                `}
                onClick={() => handleOptionClick(option)}
              >
                {option[displayKey]}
              </div>
            ))
          ) : (
            <div className={`${tailwindStyles.paragraph} px-4 py-1`}>
              No results found
            </div>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm mt-1 pl-2">{error}</p>}
      {helperText && (
        <p className="text-gray-500 text-sm mt-1 pl-2">{helperText}</p>
      )}
    </div>
  );
};

export default SearchableDropdown;
