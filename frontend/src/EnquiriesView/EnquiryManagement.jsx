



import { useState, useEffect, useCallback, forwardRef } from "react";
import {
  fetchEnquiries,
  fetchEnquiryDetails,
  updateEnquiry,
  fetchEnquiryDropdownOptions,
} from "../services/adminapiservices";
import tailwindStyles from "../utils/tailwindStyles";
import React from "react";

// InputField Component
const InputField = forwardRef(
  ({ id, label, value, onChange, type = "text", disabled = false }, ref) => {
    return (
      <div className="grid gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <input
          ref={ref}
          id={id}
          type={type}
          value={value || ""}
          onChange={onChange}
          disabled={disabled}
          className="h-9 px-2 border border-gray-300 rounded text-sm w-full"
        />
      </div>
    );
  }
);
InputField.displayName = "InputField";

// Memoize InputField to prevent unnecessary re-renders
const MemoizedInputField = React.memo(InputField);

// Memoized Tab Components
const BasicInfoTab = React.memo(({ data, modalMode, handleFieldChange }) => {
  return (
    <div className="grid grid-cols-2 gap-6">
      <MemoizedInputField
        id="enq_name"
        label="Name"
        value={data.enq_name}
        onChange={
          modalMode === "edit" ? handleFieldChange("enq_name") : undefined
        }
        disabled
      />
      <MemoizedInputField
        id="enq_mobile"
        label="Mobile"
        value={data.enq_mobile}
        onChange={
          modalMode === "edit" ? handleFieldChange("enq_mobile") : undefined
        }
        disabled
      />
      <MemoizedInputField
        id="category_name"
        label="Category"
        value={data.category_name}
        onChange={
          modalMode === "edit" ? handleFieldChange("category_name") : undefined
        }
        disabled
      />
    </div>
  );
});

const PropertyDetailsTab = React.memo(
  ({ data, dropdownOptions, modalMode, handleFieldChange }) => {
    const renderField = (label, value) => (
      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <div className="h-9 px-2 py-2 border border-gray-200 rounded text-sm bg-gray-50">
          {value || "-"}
        </div>
      </div>
    );

    const renderSelect = (id, label, value, options, numeric = false) => (
      <div className="grid gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <select
          id={id}
          value={value ?? ""}
          onChange={handleFieldChange(id)}
          disabled={modalMode === "view"}
          className="h-9 px-2 border border-gray-300 rounded text-sm w-full"
        >
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
          {options?.map((o) => (
            <option key={o.id} value={numeric ? Number(o.id) : o.id}>
              {o.name ||
                o.home_type ||
                o.parking_type ||
                o.prop_type ||
                o.tenant_type ||
                o.nbaths ||
                o.parking_count ||
                o.prop_desc ||
                o.eat_pref ||
                o.prop_facing ||
                o.available}
            </option>
          ))}
        </select>
      </div>
    );

    return (
      <div className="grid grid-cols-2 gap-6">
        {modalMode === "view" ? (
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
            {renderSelect(
              "enq_city",
              "City",
              data.enq_city,
              dropdownOptions.cities
            )}
            {renderSelect(
              "enq_builder",
              "Builder",
              data.enq_builder,
              dropdownOptions.builders
            )}
            {renderSelect(
              "enq_community",
              "Community",
              data.enq_community,
              dropdownOptions.communities
            )}
            {renderSelect(
              "enq_bhk_type",
              "BHK Type",
              data.enq_bhk_type,
              dropdownOptions.homeTypes
            )}
            {renderSelect(
              "enq_prop_type",
              "Property Type",
              data.enq_prop_type,
              dropdownOptions.propType
            )}
            {renderSelect(
              "enq_prop_desc",
              "Property Description",
              data.enq_prop_desc,
              dropdownOptions.propDesc
            )}
            {renderSelect(
              "enq_prop_facing",
              "Facing",
              data.enq_prop_facing,
              dropdownOptions.facing
            )}
            <MemoizedInputField
              id="enq_flat_details"
              label="Flat/Property Address"
              value={data.enq_flat_details}
              onChange={handleFieldChange("enq_flat_details")}
            />
          </>
        )}
      </div>
    );
  }
);

const PreferencesTab = React.memo(
  ({
    data,
    dropdownOptions,
    modalMode,
    handleFieldChange,
    handleNumericFieldChange,
  }) => {
    const renderField = (label, value) => (
      <div className="grid gap-2">
        <label className="text-sm font-medium text-gray-500">{label}</label>
        <div className="h-9 px-2 py-2 border border-gray-200 rounded text-sm bg-gray-50">
          {value || "-"}
        </div>
      </div>
    );

    const renderSelect = (id, label, value, options, numeric = false) => (
      <div className="grid gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        <select
          id={id}
          value={value ?? ""}
          onChange={handleFieldChange(id)}
          disabled={modalMode === "view"}
          className="h-9 px-2 border border-gray-300 rounded text-sm w-full"
        >
          <option value="" disabled>
            Select {label.toLowerCase()}
          </option>
          {options?.map((o) => (
            <option key={o.id} value={numeric ? Number(o.id) : o.id}>
              {o.name ||
                o.home_type ||
                o.parking_type ||
                o.prop_type ||
                o.tenant_type ||
                o.nbaths ||
                o.parking_count ||
                o.prop_desc ||
                o.eat_pref ||
                o.prop_facing ||
                o.available}
            </option>
          ))}
        </select>
      </div>
    );

    return (
      <div className="grid grid-cols-2 gap-6">
        {modalMode === "view" ? (
          <>
            {renderField("Rental Low", data.enq_rental_low)}
            {renderField("Rental High", data.enq_rental_high)}
            {renderField("Parking Type", data.parking_type_name)}
            {renderField("Parking Count", data.parking_count_value)}
            {renderField("Availability", data.availability_status)}
            {renderField("Super Area", data.enq_super_area)}
            {renderField("Tenant Type", data.tenant_type_name)}
            {renderField("Eating Preference", data.eat_pref_name)}
            {renderField("Bathrooms", data.no_baths_count)}
          </>
        ) : (
          <>
            <MemoizedInputField
              id="enq_rental_low"
              label="Rental Low"
              value={data.enq_rental_low}
              onChange={handleNumericFieldChange("enq_rental_low")}
              type="number"
            />
            <MemoizedInputField
              id="enq_rental_high"
              label="Rental High"
              value={data.enq_rental_high}
              onChange={handleNumericFieldChange("enq_rental_high")}
              type="number"
            />
            {/* {renderSelect(
              "enq_parking_type",
              "Parking Type",
              data.enq_parking_type,
              dropdownOptions.parkingType
            )} */}
            {renderSelect(
              "enq_parking_count",
              "Parking Count",
              data.enq_parking_count,
              dropdownOptions.parkingCounts
            )}
            {renderSelect(
              "enq_available",
              "Availability",
              data.enq_available,
              dropdownOptions.availability
            )}
            <MemoizedInputField
              id="enq_super_area"
              label="Super Area"
              value={data.enq_super_area}
              onChange={handleNumericFieldChange("enq_super_area")}
              type="number"
            />
            {renderSelect(
              "enq_tenant_type",
              "Tenant Type",
              data.enq_tenant_type,
              dropdownOptions.tenants
            )}
            {renderSelect(
              "enq_tenant_eat_pref",
              "Eating Preference",
              data.enq_tenant_eat_pref,
              dropdownOptions.tenantEatPrefs
            )}
            {renderSelect(
              "enq_no_baths",
              "Bathrooms",
              data.enq_no_baths,
              dropdownOptions.baths
            )}
          </>
        )}
      </div>
    );
  }
);

const EnquiryManagementDashboard = () => {
  /* ──────────────────────────────────────────
     BASIC STATE
  ────────────────────────────────────────── */
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /* ──────────────────────────────────────────
     MODAL / FORM STATE
  ────────────────────────────────────────── */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // "view" | "edit"
  const [activeTab, setActiveTab] = useState("basic-info");
  const [currentEnquiry, setCurrentEnquiry] = useState(null);
  const [editForm, setEditForm] = useState(null);

  /* ──────────────────────────────────────────
     DROPDOWN OPTIONS
  ────────────────────────────────────────── */
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
    //parkingType: [],
  });

  /* ──────────────────────────────────────────
     FETCH ENQUIRIES
  ────────────────────────────────────────── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await fetchEnquiries();
        console.log("fetchEnquiries data:", data);
        setEnquiries(data);
      } catch (err) {
        console.error("Error fetching enquiries:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  /* ──────────────────────────────────────────
     FETCH DROPDOWN OPTIONS (only when editing)
  ────────────────────────────────────────── */
  useEffect(() => {
    if (modalMode !== "edit") return;
    const fetchOptions = async () => {
      try {
        const data = await fetchEnquiryDropdownOptions();
        console.log("fetchEnquiryDropdownOptions data:", data);
        setDropdownOptions(data);
      } catch (err) {
        console.error("Error fetching dropdown options:", err.message);
      }
    };
    fetchOptions();
  }, [modalMode]);

  /* ──────────────────────────────────────────
     HANDLERS
  ────────────────────────────────────────── */
  const handleMoreInfoClick = async (enquiryRow) => {
    try {
      const enquiry = await fetchEnquiryDetails(enquiryRow.enq_id);
      console.log("fetchEnquiryDetails data:", enquiry);
      if (enquiry) {
        setCurrentEnquiry(enquiry);
        setModalMode("view");
        setIsModalOpen(true);
      } else {
        console.error("No enquiry data returned for enq_id:", enquiryRow.enq_id);
      }
    } catch (err) {
      console.error("Error fetching enquiry details:", err.message);
    }
  };

  const handleEditClick = () => {
    setEditForm({
      ...currentEnquiry,
      enq_rental_low: currentEnquiry.enq_rental_low ?? "",
      enq_rental_high: currentEnquiry.enq_rental_high ?? "",
      enq_super_area: currentEnquiry.enq_super_area ?? "",
      enq_flat_details: currentEnquiry.enq_flat_details ?? "",
    });
    setModalMode("edit");
    setActiveTab("basic-info");
  };

  const handleFieldChange = useCallback(
    (field) => (e) => {
      const val = e.target.value;
      setEditForm((f) => ({ ...f, [field]: val }));
    },
    []
  );

  const handleNumericFieldChange = useCallback(
    (field) => (e) => {
      const val = e.target.value;
      if (val === "" || /^[0-9]*$/.test(val))
        setEditForm((f) => ({ ...f, [field]: val }));
    },
    []
  );

  const handleUpdate = async () => {
    if (!editForm) return;
    const payload = {
      ...editForm,
      enq_status: 26,
      enq_rental_low:
        editForm.enq_rental_low === "" ? null : Number(editForm.enq_rental_low),
      enq_rental_high:
        editForm.enq_rental_high === ""
          ? null
          : Number(editForm.enq_rental_high),
      enq_super_area:
        editForm.enq_super_area === "" ? null : Number(editForm.enq_super_area),
    };
    try {
      const result = await updateEnquiry(payload);
      if (result.success) {
        setEnquiries((prev) =>
          prev.map((q) => (q.enq_id === payload.enq_id ? payload : q))
        );
        setCurrentEnquiry(payload);
        setIsModalOpen(false);
        setModalMode("view");
        setEditForm(null);
      } else {
        throw new Error(result.error || "Update failed");
      }
    } catch (err) {
      console.error("Update failed:", err.message);
      alert(`Update failed: ${err.message}`);
    }
  };

  /* ──────────────────────────────────────────
     MAIN RENDER
  ────────────────────────────────────────── */
  return (
    <div
      className={`container mx-auto py-8 px-4 ${tailwindStyles.mainBackground}`}
    >
      <h1 className={`text-2xl font-semibold mb-6 ${tailwindStyles.heading}`}>
        Dashboard for Enquiry Management
      </h1>

      {loading ? (
        <div>Loading...</div>
      ) : enquiries.length === 0 ? (
        <div className="text-red-500">No Enquiries Found</div>
      ) : error ? (
        <div className="text-red-500">Error: {error}</div>
      ) : (
        <div
          className={`rounded-lg shadow overflow-hidden ${tailwindStyles.whiteCard}`}
        >
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
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-200">
                {enquiries.length > 0 ? (
                  enquiries.map((e) => (
                    <tr key={e.enq_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {e.enq_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {e.category_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {e.enq_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {e.enq_mobile}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {e.enq_rec_create_time
                          ? new Date(e.enq_rec_create_time).toLocaleString(
                              "en-US",
                              {
                                dateStyle: "medium",
                                timeStyle: "short",
                              }
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          onClick={() => handleMoreInfoClick(e)}
                          className={`${tailwindStyles.secondaryButton} mr-3`}
                        >
                          Add Details
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-sm text-gray-500">
                      No Enquiries Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ──────────── MODAL ──────────── */}
      {isModalOpen && currentEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3">
          <div
            key="enquiry-modal"
            className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto"
          >
            <div className="px-4 py-3 border-b sticky top-0 bg-white z-10 flex justify-between items-center">
              <h2 className={`text-base font-medium ${tailwindStyles.heading}`}>
                {modalMode === "view" ? "Enquiry Details" : "Edit Enquiry"} #
                {currentEnquiry.enq_id}
              </h2>
              <div className="flex items-center gap-2">
                {modalMode === "view" && (
                  <button
                    onClick={handleEditClick}
                    className={tailwindStyles.secondaryButton}
                  >
                    Edit
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setModalMode("view");
                    setEditForm(null);
                  }}
                  className={tailwindStyles.thirdButton}
                >
                  Close
                </button>
              </div>
            </div>

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

            <div className="p-4">
              <div
                style={{
                  display: activeTab === "basic-info" ? "block" : "none",
                }}
              >
                {modalMode === "view" ? (
                  <BasicInfoTab
                    data={currentEnquiry}
                    modalMode={modalMode}
                    handleFieldChange={handleFieldChange}
                  />
                ) : (
                  <BasicInfoTab
                    data={editForm}
                    modalMode={modalMode}
                    handleFieldChange={handleFieldChange}
                  />
                )}
              </div>
              <div
                style={{
                  display: activeTab === "property-details" ? "block" : "none",
                }}
              >
                {modalMode === "view" ? (
                  <PropertyDetailsTab
                    data={currentEnquiry}
                    dropdownOptions={dropdownOptions}
                    modalMode={modalMode}
                    handleFieldChange={handleFieldChange}
                  />
                ) : (
                  <PropertyDetailsTab
                    data={editForm}
                    dropdownOptions={dropdownOptions}
                    modalMode={modalMode}
                    handleFieldChange={handleFieldChange}
                  />
                )}
              </div>
              <div
                style={{
                  display: activeTab === "preferences" ? "block" : "none",
                }}
              >
                {modalMode === "view" ? (
                  <PreferencesTab
                    data={currentEnquiry}
                    dropdownOptions={dropdownOptions}
                    modalMode={modalMode}
                    handleFieldChange={handleFieldChange}
                    handleNumericFieldChange={handleNumericFieldChange}
                  />
                ) : (
                  <PreferencesTab
                    data={editForm}
                    dropdownOptions={dropdownOptions}
                    modalMode={modalMode}
                    handleFieldChange={handleFieldChange}
                    handleNumericFieldChange={handleNumericFieldChange}
                  />
                )}
              </div>
            </div>

            {modalMode === "edit" && (
              <div className="flex justify-end gap-2 px-4 py-3 border-t sticky bottom-0 bg-white z-10">
                <button
                  onClick={() => {
                    setModalMode("view");
                    setEditForm(null);
                  }}
                  className={tailwindStyles.thirdButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className={tailwindStyles.secondaryButton}
                >
                  Update Enquiry
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
