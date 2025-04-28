import { useState, useEffect, useRef } from "react";
import axios from "axios";
import tailwindStyles from "../../../utils/tailwindStyles"; 

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const EnquiryManagementDashboard = () => {
  // State for enquiries data
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentEnquiry, setCurrentEnquiry] = useState(null);
  const [modalMode, setModalMode] = useState("view"); // 'view' or 'edit'
  const [activeTab, setActiveTab] = useState("basic-info");
  
  // State for dropdown options
  const [dropdownOptions, setDropdownOptions] = useState({
    cities: [],
    builders: [],
    communities: [],
    balconies: [],
    baths: [],
    beds: [],
    homeTypes: [],
    parkingCounts: [],
    propDesc: [],
    tenants: [],
    tenantEatPrefs: [],
    propType: [],
    availability: [],
    facing: [],
    parkingType: []
  });
  
  // State for form changes
  const [formChanges, setFormChanges] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  // Refs for input fields to maintain focus
  const rentalLowRef = useRef(null);
  const rentalHighRef = useRef(null);
  const superAreaRef = useRef(null);
  const flatDetailsRef = useRef(null);

  // Fetch initial enquiries data
  useEffect(() => {
    const fetchEnquiries = async () => {
      try {
        setLoading(true);
        const url = `${apiUrl}/getNewEnquiryRecord`; 
        const response = await axios.get(url);
        setEnquiries(response.data.result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchEnquiries();
  }, []);

  // Fetch dropdown options when edit modal opens
  useEffect(() => {
    const fetchDropdownOptions = async () => {
      if (modalMode !== 'edit') return;
      
      try {
        const url = `${apiUrl}/getPostData`; 
        const response = await axios.get(url);
        setDropdownOptions(response.data.result);
      } catch (err) {
        console.error("Error fetching dropdown options:", err);
      }
    };
    
    fetchDropdownOptions();
  }, [modalMode]);

  // Handlers
  const handleMoreInfoClick = async (enquiry) => {
    try {
      const url = `${apiUrl}/getNewEnquiryRecord?enq_id=${enquiry.enq_id}`; 
      const response = await axios.get(url);
      setCurrentEnquiry(response.data.result[0]);
      setModalMode("view");
      setIsModalOpen(true);
      setFormChanges({});
    } catch (err) {
      console.error("Error fetching enquiry details:", err);
    }
  };

  const handleEditClick = () => {
    setModalMode("edit");
    setActiveTab("basic-info");
  };

  const handleInputChange = (field, value) => {
    setFormChanges(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNumericInputChange = (field, e) => {
    const value = e.target.value;
    // Allow only numbers and empty string
    if (value === '' || /^[0-9]*$/.test(value)) {
      handleInputChange(field, value);
    }
  };

  const handleUpdate = async () => {
    if (!currentEnquiry) return;
    
    try {
      setIsUpdating(true);
      
      // Prepare payload with properly formatted numeric values
      const payload = {
        enq_id: currentEnquiry.enq_id,
        enq_status: 26, // Update status from 25 to 26
        ...Object.fromEntries(
          Object.entries(formChanges).map(([key, value]) => {
            // Convert numeric fields to integers
            if (['enq_rental_low', 'enq_rental_high', 'enq_super_area'].includes(key)) {
              return [key, value === '' ? null : parseInt(value)];
            }
            return [key, value];
          })
        )
      };
      const url = `${apiUrl}/updatenq`; 
  
      await axios.put(
        url,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      
      // Update local state
      setEnquiries(prev => prev.map(enquiry => 
        enquiry.enq_id === currentEnquiry.enq_id 
          ? { ...enquiry, ...formChanges, enq_status: 26 } 
          : enquiry
      ));
      
      // Update current enquiry
      setCurrentEnquiry(prev => ({ ...prev, ...formChanges, enq_status: 26 }));
      
      setIsModalOpen(false);
      setFormChanges({});
      setModalMode("view");
      
    } catch (err) {
      console.error("Error updating enquiry:", err);
      console.error("Error details:", err.response?.data);
      alert(`Update failed: ${err.response?.data?.error || err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  // Helper components
  const renderInput = (id, label, value, type = "text", disabled = false) => {
    // Assign the appropriate ref based on field ID
    let inputRef = null;
    if (id === 'enq_rental_low') inputRef = rentalLowRef;
    else if (id === 'enq_rental_high') inputRef = rentalHighRef;
    else if (id === 'enq_super_area') inputRef = superAreaRef;
    else if (id === 'enq_flat_details') inputRef = flatDetailsRef;

    return (
      <div className="grid gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <input
          id={id}
          type={type}
          ref={inputRef}
          value={value || ""}
          onChange={(e) => type === "number" ? 
            handleNumericInputChange(id, e) : 
            handleInputChange(id, e.target.value)}
          disabled={disabled || modalMode === 'view'}
          className="h-9 px-2 border border-gray-300 rounded text-sm w-full"
        />
      </div>
    );
  };

  const renderSelect = (id, label, value, options, disabled = false) => (
    <div className="grid gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <select
        id={id}
        value={value || ""}
        onChange={(e) => handleInputChange(id, e.target.value)}
        disabled={disabled || modalMode === 'view'}
        className="h-9 px-2 border border-gray-300 rounded text-sm w-full"
      >
        <option value="" disabled>
          Select {label.toLowerCase()}
        </option>
        {options?.map((option) => (
          <option key={option.id} value={option.id}>
            {option.name || option.home_type||option.parking_type || option.prop_type || option.tenant_type||option.nbaths ||option.parking_count||option.prop_desc|| option.eat_pref || option.prop_facing || option.available}
          </option>
        ))}
      </select>
    </div>
  );

  const renderField = (label, value) => (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-gray-500">{label}</label>
      <div className="h-9 px-2 py-2 border border-gray-200 rounded text-sm bg-gray-50">
        {value || "-"}
      </div>
    </div>
  );

  // Tab components
  const BasicInfoTab = ({ data, mode }) => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {mode === 'view' ? (
        <>
          {renderField("Name", data.enq_name)}
          {renderField("Mobile Number", data.enq_mobile)}
          {renderField("Category", data.category_name)}
        </>
      ) : (
        <>
          {renderInput("enq_name", "Name", data.enq_name, "text", true)}
          {renderInput("enq_mobile", "Mobile Number", data.enq_mobile, "text", true)}
          {renderInput("category_name", "Category", data.category_name, "text", true)}
        </>
      )}
    </div>
  );

  const PropertyDetailsTab = ({ data, mode }) => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {mode === 'view' ? (
        <>
          {renderField("City", data.city_name)}
          {renderField("Builder", data.builder_name)}
          {renderField("Community", data.community_name)}
          {renderField("BHK Type", data.bhk_name)}
          {renderField("Property Type", data.prop_type_name)}
          {renderField("Property Description", data.prop_desc_name)}
          {renderField("Facing", data.prop_facing_name)}
          {renderField("Flat/Property Address", data.enq_flat_details)}
        </>
      ) : (
        <>
          {renderSelect("enq_city", "City", formChanges.enq_city || data.enq_city, dropdownOptions.cities)}
          {renderSelect("enq_builder", "Builder", formChanges.enq_builder || data.enq_builder, dropdownOptions.builders)}
          {renderSelect("enq_community", "Community", formChanges.enq_community || data.enq_community, dropdownOptions.communities)}
          {renderSelect("enq_bhk_type", "BHK Type", formChanges.enq_bhk_type || data.enq_bhk_type, dropdownOptions.homeTypes)}
          {renderSelect("enq_prop_type", "Property Type", formChanges.enq_prop_type || data.enq_prop_type, dropdownOptions.propType)}
          {renderSelect("enq_prop_desc", "Property Description", formChanges.enq_prop_desc || data.enq_prop_desc, dropdownOptions.propDesc)}
          {renderSelect("enq_prop_facing", "Facing", formChanges.enq_prop_facing || data.enq_prop_facing, dropdownOptions.facing)}
          {renderInput("enq_flat_details", "Flat/Property Address", formChanges.enq_flat_details || data.enq_flat_details)}
        </>
      )}
    </div>
  );

  const PreferencesTab = ({ data, mode }) => (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
      {mode === 'view' ? (
        <>
          {renderField("Rental Range Low", data.enq_rental_low)}
          {renderField("Rental Range High", data.enq_rental_high)}
          {renderField("Parking Type", data.parking_type_name)}
          {renderField("Parking Count", data.parking_count_value)}
          {renderField("Availability", data.availability_status)}
          {renderField("Super Area", data.enq_super_area)}
          {renderField("Tenant Type", data.tenant_type_name)}
          {renderField("Eating Preference", data.eat_pref_name)}
          {renderField("Number of Bathrooms", data.no_baths_count)}
        </>
      ) : (
        <>
          {renderInput("enq_rental_low", "Rental Range Low", 
            formChanges.enq_rental_low !== undefined ? formChanges.enq_rental_low : data.enq_rental_low, 
            "number")}
          {renderInput("enq_rental_high", "Rental Range High", 
            formChanges.enq_rental_high !== undefined ? formChanges.enq_rental_high : data.enq_rental_high, 
            "number")}
          {renderSelect("enq_parking_type", "Parking Type", formChanges.enq_parking_type || data.enq_parking_type, dropdownOptions.parkingType)}
          {renderSelect("enq_parking_count", "Parking Count", formChanges.enq_parking_count || data.enq_parking_count, dropdownOptions.parkingCounts)}
          {renderSelect("enq_available", "Availability", formChanges.enq_available || data.enq_available, dropdownOptions.availability)}
          {renderInput("enq_super_area", "Super Area", 
            formChanges.enq_super_area !== undefined ? formChanges.enq_super_area : data.enq_super_area, 
            "number")}
          {renderSelect("enq_tenant_type", "Tenant Type", formChanges.enq_tenant_type || data.enq_tenant_type, dropdownOptions.tenants)}
          {renderSelect("enq_tenant_eat_pref", "Eating Preference", formChanges.enq_tenant_eat_pref || data.enq_tenant_eat_pref, dropdownOptions.tenantEatPrefs)}
          {renderSelect("enq_no_baths", "Number of Bathrooms", formChanges.enq_no_baths || data.enq_no_baths, dropdownOptions.baths)}
        </>
      )}
    </div>
  );

  // Main component render
  return (
    <div className={`container mx-auto py-8 px-4 ${tailwindStyles.mainBackground}`}>
      <h1 className={`text-2xl font-semibold mb-6 ${tailwindStyles.heading}`}>Dasboard for Enquiry Management</h1>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div className={`rounded-lg shadow overflow-hidden ${tailwindStyles.whiteCard}`}>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className={tailwindStyles.header}>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Enquiry ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Mobile
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enquiries.map((enquiry) => (
                  <tr key={enquiry.enq_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enquiry.enq_id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enquiry.category_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {enquiry.enq_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{enquiry.enq_mobile}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button
                        onClick={() => handleMoreInfoClick(enquiry)}
                        className={`${tailwindStyles.secondaryButton} mr-3`}
                      >
                        Add Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View/Edit Modal */}
      {isModalOpen && currentEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-4 py-3 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className={`text-base font-medium ${tailwindStyles.heading}`}>
                {modalMode === 'view' ? 'Enquiry Details' : 'Edit Enquiry'} #{currentEnquiry.enq_id}
              </h2>
              <div className="flex items-center gap-2">
                {modalMode === 'view' && (
                  <button
                    onClick={handleEditClick}
                    className={`${tailwindStyles.secondaryButton} mr-2`}
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`${tailwindStyles.thirdButton}`}
                >
                  Close
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b sticky top-[53px] bg-white z-10 flex">
              {["basic-info", "property-details", "preferences"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 px-4 py-3 text-sm font-medium border-b-2 transition ${
                    activeTab === tab
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-black"
                  }`}
                >
                  {tab === "basic-info"
                    ? "Basic Info"
                    : tab === "property-details"
                    ? "Property Details"
                    : "Preferences"}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="p-4">
              {activeTab === "basic-info" && <BasicInfoTab data={currentEnquiry} mode={modalMode} />}
              {activeTab === "property-details" && <PropertyDetailsTab data={currentEnquiry} mode={modalMode} />}
              {activeTab === "preferences" && <PreferencesTab data={currentEnquiry} mode={modalMode} />}
            </div>

            {/* Footer - Only show in edit mode */}
            {modalMode === 'edit' && (
              <div className="flex justify-end gap-2 px-4 py-3 border-t sticky bottom-0 bg-white z-10">
                <button
                  onClick={() => setModalMode('view')}
                  className={`${tailwindStyles.thirdButton}`}
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className={`${tailwindStyles.secondaryButton}`}
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Enquiry"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default EnquiryManagementDashboard;