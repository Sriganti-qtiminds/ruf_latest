import { useState, useEffect, useRef } from "react";
import axios from "axios";
import tailwindStyles from "../../../utils/tailwindStyles"; 
import { motion } from "framer-motion";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const CompactCallbackForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    userType: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [countries, setCountries] = useState([]);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [userTypes, setUserTypes] = useState([]);
  const [loadingUserTypes, setLoadingUserTypes] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);

  // Fetch countries data and user types
  useEffect(() => {
    async function fetchCountries() {
      try {
        const response = await axios.get("https://restcountries.com/v3.1/all?fields=name,cca2,flags,idd");
        const data = response.data.map((country) => ({
          name: country.name.common,
          code: country.idd?.root + (country.idd?.suffixes?.[0] || ""),
          flag: country.flags?.png || "",
        }));
        setCountries(data);
        const india = data.find((country) => country.name === "India");
        if (india) setSelectedCountry(india);
      } catch (error) {
        console.error("Failed to load country data:", error);
      }
    }

   

    async function fetchUserTypes() {
      try {
        setLoadingUserTypes(true);
        const url = `${apiUrl}/getEnquirerCatCode`;
        const response = await axios.get(url);
        console.log(response);
        
        if (response.data.success) {
          setUserTypes(response.data.data);
        }
      } catch (error) {
        console.error("Failed to load user types:", error);
      } finally {
        setLoadingUserTypes(false);
      }
    }

    fetchCountries();
    fetchUserTypes();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobile" && value.length > 10) return;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validation
    if (!formData.name || !formData.mobile || !formData.userType) {
      setError("Please fill all required fields");
      setIsSubmitting(false);
      return;
    }

    if (formData.mobile.length < 10) {
      setError("Please enter a valid 10-digit mobile number");
      setIsSubmitting(false);
      return;
    }

    try {
      // Find the selected user type ID
        const selectedUserType = userTypes.find(
          (type) => type.category.toLowerCase() === formData.userType.toLowerCase()
        );

        if (!selectedUserType) {
          throw new Error("Invalid user type selected");
        }

        const payload = {
                          usercat: selectedUserType.id,
                          name: formData.name,
                          country_code: selectedCountry.code,
                          mobile_no: formData.mobile,         
                          status: 25,
                        };

      console.log("Submitting payload:", payload);
      const url = `${apiUrl}/addNewEnquiryRecord`;        
      const response = await fetch(
        url,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Request failed");
      }

      const data = await response.json();

      setShowSuccess(true);
      setFormData({
        name: "",
        mobile: "",
        userType: "",
      });

      // Show success message for 3 seconds then close popup
      setTimeout(() => {
        setShowSuccess(false);
        setShowPopup(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCountries = countries.filter((country) =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="rounded-lg mx-auto">
      {showSuccess ? (
        <div className="text-center py-2 px-2 text-blue-600 font-medium">
          Request submitted successfully! We will contact you soon.
        </div>
      ) : (
        <div>
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 mb-8">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white rounded-md md:rounded-2xl">
                Need a Tenant or Home Quickly? We Can Help!
              </h1>
            </div>
            <button
              onClick={() => setShowPopup(true)}
              className="bg-yellow-500 hover:bg-yellow-400 text-black text-xl font-semibold py-2 px-4 rounded-lg shadow-md transition-transform duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              Request Callback
            </button>
          </div>

          {showPopup && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 transition-opacity duration-300">
              <div className="bg-white p-6 rounded-xl max-w-md w-full relative shadow-xl transform transition-transform duration-300 scale-100">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setError(null);
                  }}
                  className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

                {showSuccess ? (
                  <div className="text-center py-4 px-2 text-green-600 font-medium">
                    Request submitted successfully! We will contact you soon.
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold mb-4">Request Callback</h2>
                    {error && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded text-sm">
                        {error}
                      </div>
                    )}
                    <div className="space-y-4">
                      <select
                        name="userType"
                        value={formData.userType}
                        onChange={handleChange}
                        required
                        className="w-full p-2 border rounded text-gray-500 disabled:opacity-50"
                        disabled={loadingUserTypes || isSubmitting}
                      >
                        <option value="" disabled hidden>
                          {loadingUserTypes ? "Loading..." : "Select"}
                        </option>
                        {userTypes.map((type) => (
                          <option key={type.id} value={type.category}>
                            {type.category}
                          </option>
                        ))}
                      </select>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your Name"
                        required
                        className="w-full p-2 border rounded disabled:opacity-50"
                        disabled={isSubmitting}
                      />

                      <div className="flex items-center">
                        <div className="relative w-1/3 mr-2" ref={dropdownRef}>
                          <button
                            type="button"
                            className="w-full p-2 border rounded flex items-center justify-between bg-white disabled:opacity-50"
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            disabled={isSubmitting}
                          >
                            {selectedCountry ? (
                              <div className="flex items-center space-x-2">
                                <img
                                  src={selectedCountry.flag}
                                  alt={selectedCountry.name}
                                  className="w-5 h-5"
                                />
                                <span>{selectedCountry.code}</span>
                              </div>
                            ) : (
                              <span>Code</span>
                            )}
                          </button>
                          {isDropdownOpen && (
                            <div className="absolute z-10 mt-1 bg-white border rounded shadow-lg w-full min-w-[240px]">
                              <div className="p-2 border-b">
                                <input
                                  type="text"
                                  placeholder="Search countries"
                                  className="w-full p-2 border rounded text-gray-500"
                                  value={searchTerm}
                                  onChange={(e) =>
                                    setSearchTerm(e.target.value)
                                  }
                                  autoFocus
                                />
                              </div>
                              <ul className="max-h-60 overflow-y-auto">
                                {filteredCountries.map((country, index) => (
                                  <li
                                    key={index}
                                    className="p-2 flex items-center cursor-pointer hover:bg-gray-100"
                                    onClick={() => {
                                      setSelectedCountry(country);
                                      setIsDropdownOpen(false);
                                      setSearchTerm("");
                                    }}
                                  >
                                    <img
                                      src={country.flag}
                                      alt={country.name}
                                      className="w-5 h-5 mr-2"
                                    />
                                    <span className="truncate">
                                      {country.name} {country.code}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                        <input
                          type="tel"
                          name="mobile"
                          value={formData.mobile}
                          onChange={handleChange}
                          placeholder="10-digit number"
                          required
                          minLength={10}
                          maxLength={10}
                          className="w-2/3 p-2 border rounded disabled:opacity-50"
                          disabled={isSubmitting}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        Enter your 10-digit mobile number
                      </p>

                      <div className="flex justify-end space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowPopup(false);
                            setError(null);
                          }}
                          className="px-4 py-2 border rounded text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          disabled={isSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={isSubmitting || loadingUserTypes}
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? "Submitting..." : "Submit"}
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompactCallbackForm;
