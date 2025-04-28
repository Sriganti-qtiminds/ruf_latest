import React, { useEffect, useState, useRef } from "react"; // Importing necessary React hooks
import axios from "axios"; // Importing axios for making HTTP requests
import CountryDropdown from "./CountryDropdown"; // Importing the CountryDropdown component
import tailwindStyles from "../../../utils/tailwindStyles"; // Importing custom Tailwind CSS styles

const endPoint = `${import.meta.env.VITE_API_URL}`; // API endpoint for user profile

const UserProfileView = ({ userID, profile }) => {
  // UserProfileView component that takes userID as a prop
  const [profileData, setProfileData] = useState(null); // State to hold profile data
  const [countries, setCountries] = useState([]); // State to hold list of countries
  const [selectedCountry, setSelectedCountry] = useState(null); // State for selected country
  const [selectedAltCountry, setSelectedAltCountry] = useState(null); // State for selected alternate country
  const [updatedData, setUpdatedData] = useState({}); // State to hold updated profile data
  const [isEditing, setIsEditing] = useState(false); // State to track if the profile is being edited
  const [message, setMessage] = useState({}); // State to hold messages (success/error)
  const [isCountryDropdownOpen, setCountryDropdownOpen] = useState(false); // State for country dropdown visibility
  const [isAltCountryDropdownOpen, setAltCountryDropdownOpen] = useState(false); // State for alternate country dropdown visibility
  const [countrySearchTerm, setCountrySearchTerm] = useState(""); // State for country search term
  const [altCountrySearchTerm, setAltCountrySearchTerm] = useState(""); // State for alternate country search term
  const countryDropdownRef = useRef(null); // Ref for country dropdown
  const altCountryDropdownRef = useRef(null); // Ref for alternate country dropdown

  const id = userID; // Extracting userID from props

  useEffect(() => {
    // Effect to fetch data when component mounts
    const fetchData = async () => {
      // Async function to fetch data
      try {
        const [countryResponse] = await Promise.all([
          // Fetching countries and profile data concurrently
          axios.get("https://restcountries.com/v3.1/all"),
        ]);

        const countryData = countryResponse.data.map((country) => ({
          // Mapping country data to desired format
          name: country.name.common,
          code: country.idd?.root + (country.idd?.suffixes?.[0] || ""),
          flag: country.flags?.png || "",
        }));

        setCountries(countryData); // Setting countries state

        if (profile) {
          const mobileNoWithCountryCode = profile.mobile_no || ""; // Extracting mobile number
          const altMobileNoWithCountryCode = profile.alt_mobile_no || ""; // Extracting alternate mobile number

          // Finding selected country based on mobile number
          const selectedCountryFromProfile = countryData.find(
            (country) =>
              country.code ===
              mobileNoWithCountryCode.slice(
                0,
                mobileNoWithCountryCode.length - 10
              )
          );
          // Finding selected alternate country based on alternate mobile number
          const selectedAltCountryFromProfile = countryData.find(
            (country) =>
              country.code ===
              altMobileNoWithCountryCode.slice(
                0,
                altMobileNoWithCountryCode.length - 10
              )
          );

          // Setting selected countries or defaulting to India
          setSelectedCountry(
            selectedCountryFromProfile ||
              countryData.find((country) => country.name === "India")
          );
          setSelectedAltCountry(
            selectedAltCountryFromProfile ||
              countryData.find((country) => country.name === "India")
          );

          setProfileData(profile); // Setting profile data
          setUpdatedData({
            // Setting updated data with mobile numbers
            ...profile,
            mobile_no: mobileNoWithCountryCode.slice(-10),
            alt_mobile_no: altMobileNoWithCountryCode.slice(-10),
          });
        } else {
          setMessage({ general: "Profile data not found." }); // Setting error message if profile not found
        }
      } catch (error) {
        console.error("Error fetching data:", error); // Logging error
        setMessage({ general: "Error loading data." }); // Setting error message
      }
    };

    fetchData(); // Calling fetchData function
  }, [profile]); // Empty dependency array means this runs once on mount

  useEffect(() => {
    // Effect to handle clicks outside dropdowns
    const handleClickOutside = (event) => {
      // Function to handle clicks outside the dropdowns
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target) // Check if click is outside country dropdown
      ) {
        setCountryDropdownOpen(false); // Close country dropdown
      }
      if (
        altCountryDropdownRef.current &&
        !altCountryDropdownRef.current.contains(event.target) // Check if click is outside alternate country dropdown
      ) {
        setAltCountryDropdownOpen(false); // Close alternate country dropdown
      }
    };
    document.addEventListener("mousedown", handleClickOutside); // Adding event listener for mouse down
    return () => document.removeEventListener("mousedown", handleClickOutside); // Cleanup listener on unmount
  }, []); // Empty dependency array means this runs once on mount

  const handleSave = async () => {
    // Function to handle saving updates
    try {
      const updates = []; // Array to hold fields that need to be updated

      const newMobileFull = `${selectedCountry.code}${updatedData.mobile_no}`; // Constructing full mobile number
      const newAltMobileFull = selectedAltCountry
        ? `${selectedAltCountry.code}${updatedData.alt_mobile_no}` // Constructing full alternate mobile number
        : updatedData.alt_mobile_no;

      // Checking if mobile number has changed
      if (profileData.mobile_no !== newMobileFull) {
        updates.push({ field: "mobile_no", value: newMobileFull }); // Adding mobile number update
      }
      // Checking if alternate mobile number has changed
      if (profileData.alt_mobile_no !== newAltMobileFull) {
        updates.push({ field: "alt_mobile_no", value: newAltMobileFull }); // Adding alternate mobile number update
      }

      for (const field in updatedData) {
        // Iterating through updated data fields
        if (
          updatedData[field] !== profileData[field] && // Checking if field value has changed
          !["mobile_no", "alt_mobile_no"].includes(field) // Excluding mobile number fields
        ) {
          updates.push({ field, value: updatedData[field] }); // Adding other field updates
        }
      }

      if (updates.length > 0) {
        // If there are updates to be made
        for (const update of updates) {
          // Iterating through updates
          const { field, value } = update; // Destructuring field and value
          const tableName = ["mobile_no", "user_name"].includes(field) // Determining table name based on field
            ? "dy_user"
            : "dy_user_profile";
          const whereCondition =
            tableName === "dy_user" ? `id="${id}"` : `user_id="${id}"`; // Setting where condition for update

          await axios.put(`${endPoint}/updateRecord`, {
            // Making PUT request to update record
            tableName,
            fieldValuePairs: { [field]: value },
            whereCondition,
          });
        }

        setProfileData({ ...updatedData }); // Updating profile data state
        setIsEditing(false); // Exiting editing mode
        setMessage({
          // Setting success message
          general: "Profile updated successfully.",
          color: "green",
        });
      } else {
        setMessage({ general: "No changes detected.", color: "blue" }); // Setting message if no changes
      }
    } catch (error) {
      console.error("Error saving updates:", error); // Logging error
      setMessage({ general: "Error saving updates.", color: "red" }); // Setting error message
    }
    setTimeout(() => setMessage({}), 3000); // Clearing message after 3 seconds
  };

  const handleCancel = () => {
    // Function to handle canceling edits
    setIsEditing(false); // Exiting editing mode
    setUpdatedData({
      // Resetting updated data to original profile data
      ...profileData,
      mobile_no: profileData.mobile_no ? profileData.mobile_no.slice(-10) : "", // Resetting mobile number
      alt_mobile_no: profileData.alt_mobile_no
        ? profileData.alt_mobile_no.slice(-10)
        : "", // Resetting alternate mobile number
    });
    setMessage({}); // Clearing message
  };

  const filterCountries = (
    countries,
    searchTerm // Function to filter countries based on search term
  ) =>
    countries.filter(
      (country) => country.name.toLowerCase().includes(searchTerm.toLowerCase()) // Filtering countries
    );

  if (!profileData) return <div>Loading...</div>; // Loading state if profile data is not available

  return (
    // Rendering the component
    <div className="bg-white shadow-sm p-2 rounded-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h1 className={`${tailwindStyles.heading_2}`}>Profile</h1>
        <div className="space-x-3">
          {isEditing ? ( // Conditional rendering based on editing state
            <>
              <button
                onClick={handleSave} // Save button
                className={`${tailwindStyles.secondaryButton}`}
              >
                Save
              </button>
              <button
                onClick={handleCancel} // Discard button
                className={`${tailwindStyles.secondaryButton} bg-gray-600 hover:bg-gray-700`}
              >
                Discard
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)} // Edit button
              className="bg-blue-500 text-white hover:bg-blue-600 px-4 py-1 text-sm font-semibold rounded-md"
            >
              Edit
            </button>
          )}
        </div>
      </div>
      {message.general && ( // Conditional rendering for messages
        <div
          className={`mb-4 p-3 rounded-md text-white ${message.color === "green" ? "bg-green-500" : message.color === "blue" ? "bg-blue-500" : "bg-red-500"}`}
        >
          {message.general}
        </div>
      )}
      <div className="grid w-full">
        {["user_name", "email_id", "current_city"].map(
          (
            field // Mapping through fields to display
          ) => (
            <div className="mb-4 w-full" key={field}>
              <label className={`${tailwindStyles.paragraph_b}`}>
                {field
                  .replace(/_/g, " ") // Formatting field name
                  .replace(/\b\w/g, (l) => l.toUpperCase())}
              </label>
              {isEditing && field !== "email_id" ? ( // Conditional rendering for input or display
                <input
                  type="text"
                  value={updatedData[field] || ""} // Input value
                  onChange={(e) =>
                    setUpdatedData({
                      ...updatedData,
                      [field]: e.target.value,
                    })
                  }
                  className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md w-full`}
                />
              ) : (
                <div
                  className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md w-full`}
                >
                  {profileData[field] || "N/A"}
                </div>
              )}
            </div>
          )
        )}
        <div className="mb-4">
          {" "}
          {/* Mobile number section */}
          <label className={`${tailwindStyles.paragraph_b}`}>
            Mobile Number
          </label>
          <div className="flex flex-row items-center w-full space-x-2">
            {" "}
            {/* Mobile number input and dropdown */}
            <CountryDropdown
              selectedCountry={selectedCountry} // Country dropdown for mobile number
              setSelectedCountry={setSelectedCountry}
              isDropdownOpen={isCountryDropdownOpen}
              setDropdownOpen={setCountryDropdownOpen}
              searchTerm={countrySearchTerm}
              setSearchTerm={setCountrySearchTerm}
              countries={filterCountries(countries, countrySearchTerm)} // Filtering countries based on search term
              dropdownRef={countryDropdownRef}
              isEditing={isEditing}
            />
            <input
              type="text"
              placeholder="Mobile Number"
              value={updatedData.mobile_no || ""} // Mobile number input value
              onChange={(e) =>
                setUpdatedData({
                  ...updatedData,
                  mobile_no: e.target.value.replace(/\D/g, "").slice(-10), // Updating mobile number state
                })
              }
              className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md w-full`}
              maxLength="10" // Limiting input length
              disabled={!isEditing} // Disabling input if not editing
            />
          </div>
        </div>
        <div className="mb-4">
          {" "}
          {/* Alternate mobile number section */}
          <label className={`${tailwindStyles.paragraph_b}`}>
            Alt Mobile Number
          </label>
          <div className="flex flex-row items-center w-full space-x-2">
            {" "}
            {/* Alternate mobile number input and dropdown */}
            <CountryDropdown
              selectedCountry={selectedAltCountry} // Country dropdown for alternate mobile number
              setSelectedCountry={setSelectedAltCountry}
              isDropdownOpen={isAltCountryDropdownOpen}
              setDropdownOpen={setAltCountryDropdownOpen}
              searchTerm={altCountrySearchTerm}
              setSearchTerm={setAltCountrySearchTerm}
              countries={filterCountries(countries, altCountrySearchTerm)} // Filtering countries based on search term
              dropdownRef={altCountryDropdownRef}
              isEditing={isEditing}
            />
            <input
              type="text"
              placeholder="Alt Mobile Number"
              value={updatedData.alt_mobile_no || ""} // Alternate mobile number input value
              onChange={(e) =>
                setUpdatedData({
                  ...updatedData,
                  alt_mobile_no: e.target.value.replace(/\D/g, "").slice(-10), // Updating alternate mobile number state
                })
              }
              className={`${tailwindStyles.paragraph} border px-4 py-2 rounded-md w-full`}
              maxLength="10" // Limiting input length
              disabled={!isEditing} // Disabling input if not editing
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileView; // Exporting the UserProfileView component for use in other parts of the application
