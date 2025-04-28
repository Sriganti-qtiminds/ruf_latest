

// export default FilterSection;

import React, { useState, useEffect } from "react";
import { FaFilter } from "react-icons/fa6";
import { Check } from "lucide-react";

import tailwindStyles from "../../../utils/tailwindStyles";
import useFilterStore from "../../../store/filterStore";
import SearchableDropdown from "./SearchableDropdown";

const FilterSection = ({
  currentPageChange,
  setSearchParams,
  searchParams,
}) => {
  const [isShow, setIsShow] = useState(false);
  const {
    dropdownData,
    fetchFilters,
    fetchBuildersList,
    fetchCommunitiesList,
    setDropdownData,
  } = useFilterStore();

  const [filters, setFilters] = useState(() => ({
    city: searchParams.get("city") || "",
    builders: searchParams.get("builders") || "",
    community: searchParams.get("community") || "",
    hometype: searchParams.get("hometype")?.split(",").filter(Boolean) || [],
    propertydescription:
      searchParams.get("propertydescription")?.split(",").filter(Boolean) || [],
    availability:
      searchParams.get("availability")?.split(",").filter(Boolean) || [],
    tenanttype:
      searchParams.get("tenanttype")?.split(",").filter(Boolean) || [],
  }));

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  useEffect(() => {
    if (filters.city) fetchBuildersList(filters.city);
    else setDropdownData({ builderList: [], communityList: [] });
  }, [filters.city, fetchBuildersList, setDropdownData]);

  useEffect(() => {
    if (filters.builders) fetchCommunitiesList(filters.builders);
    else setDropdownData({ communityList: [] });
  }, [filters.builders, fetchCommunitiesList, setDropdownData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((prev) => {
      if (type === "checkbox") {
        const currentValues = Array.isArray(prev[name]) ? prev[name] : [];
        return {
          ...prev,
          [name]: checked
            ? [...currentValues, value]
            : currentValues.filter((item) => item !== value),
        };
      }
      return {
        ...prev,
        [name]: value,
        ...(name === "city" && { builders: "", community: "" }),
        ...(name === "builders" && { community: "" }),
      };
    });
  };

  const handleApplyFilters = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length) {
        params.set(key, value.join(","));
      } else if (value && !Array.isArray(value)) {
        params.set(key, value);
      }
    });
    setSearchParams(params);
    currentPageChange(filters);
    setIsShow(false);
  };

  const handleClearFilters = () => {
    const emptyFilters = {
      city: "",
      builders: "",
      community: "",
      hometype: [],
      propertydescription: [],
      availability: [],
      tenanttype: [],
    };
    setFilters(emptyFilters);
    setDropdownData({ builderList: [], communityList: [] });
    setSearchParams(new URLSearchParams());
    currentPageChange(emptyFilters);
    setIsShow(false);
  };

  // Reusable dropdown renderer
  const renderDropdown = (name, options, label) => (
    <div className={`${label == "Community" && "col-span-2"}`}>
      <p className={`${tailwindStyles.paragraph_b} mb-1`}>{label}</p>
      <SearchableDropdown
        name={name}
        options={options}
        value={filters[name]}
        onChange={handleChange}
        placeholder={`Select ${label}`}
        displayKey="name"
        valueKey="name"
      />
    </div>
  );


  const renderCheckboxGroup = (
    name,
    options,
    label,
    gridCols = "grid-cols-3"
  ) => (
    <div className="flex flex-col">
      <p className={`${tailwindStyles.paragraph_b} text-start pb-2`}>{label}</p>
      <div className={`grid ${gridCols} gap-2`}>
        {options.map((item) => {
          const isSelected = filters[name].includes(String(item.name));
          return (
            <label
              key={item.id}
              className={`
                flex items-center justify-between 
                px-2 py-1 rounded-full 
                border transition-all duration-200
                cursor-pointer
                ${
                  isSelected
                    ? "bg-blue-500 text-white border-blue-500"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <span className="text-[10px] lg:text-xs 2xl:text-md">
                {item.name}
              </span>
              <input
                type="checkbox"
                name={name}
                value={item.name}
                checked={isSelected}
                onChange={handleChange}
                className="hidden" // Hide the actual checkbox
              />
              <span
                className={`
                  w-3 h-3 rounded-full 
                  flex items-center justify-center 
                  transition-colors duration-200
                  ${
                    isSelected
                      ? "bg-white text-blue-500"
                      : "bg-gray-200 text-gray-400"
                  }
                `}
              >
                {isSelected && <Check className="w-2 h-2 font-bold" />}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );

  const renderFilterForm = () => (
    <form
      onSubmit={handleApplyFilters}
      className="space-y-2 overflow-y-auto h-full scroll-smooth [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:bg-white [&::-webkit-scrollbar-thumb]:bg-gray-300"
      style={{ maxHeight: "calc(100% - 50px)" }}
    >
      <div className="grid grid-cols-2 gap-2">
        {renderDropdown("city", dropdownData.cityList, "City")}
        {renderDropdown("builders", dropdownData.builderList, "Builder")}
        {renderDropdown("community", dropdownData.communityList, "Community")}
      </div>

      {renderCheckboxGroup(
        "hometype",
        dropdownData.bedroomTypes,
        "House Type",
        "grid-cols-2 lg:grid-cols-4"
      )}
      {renderCheckboxGroup(
        "propertydescription",
        dropdownData.propertyDescriptions,
        "Furnishing",
        "grid-cols-2"
      )}
      {renderCheckboxGroup(
        "availability",
        dropdownData.availability,
        "Availability",
        "grid-cols-2"
      )}
      {renderCheckboxGroup(
        "tenanttype",
        dropdownData.tenanttype,
        "Preferred Tenant",
        "grid-cols-2 lg:grid-cols-4"
      )}

      <div className="flex space-x-2">
        <button
          type="button"
          onClick={handleClearFilters}
          className={`${tailwindStyles.secondaryButton} w-full`}
        >
          Clear
        </button>
        <button
          type="submit"
          className={`${tailwindStyles.secondaryButton} w-full`}
        >
          Apply
        </button>
      </div>
    </form>
  );

  return (
    <div className="w-full rounded-md bg-white h-auto md:h-full">
      <button
        className="md:hidden fixed left-2 top-14 z-20"
        onClick={() => setIsShow(!isShow)}
      >
        <div className="rounded-full h-7 w-7 flex items-center justify-center bg-[#001433]">
          <FaFilter className="w-3 h-3 text-[#FFC107]" />
        </div>
      </button>

      <div className="hidden md:block w-full h-full rounded-lg px-4">
        <h2 className={`${tailwindStyles.heading_3} py-2`}>Filters</h2>
        {renderFilterForm()}
      </div>

      {isShow && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed top-0 left-0 sm:w-3/4 md:w-2/4 h-full bg-white shadow-lg z-50 p-4">
            <button
              className="absolute top-4 right-4 text-lg"
              onClick={() => setIsShow(false)}
            >
              ✕
            </button>
            <h2 className="text-lg font-semibold mb-4">Filters</h2>
            {renderFilterForm()}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
