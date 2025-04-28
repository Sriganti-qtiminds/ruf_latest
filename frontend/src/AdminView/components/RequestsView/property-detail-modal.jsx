
import { useState, useEffect } from "react";
import { fetchPropertiesApi } from "../../../config/adminConfig";

const PropertyDetailsModal = ({ propertyId, startTime, updateTime, isExpanded, onClose }) => {
  const [propertyDetails, setPropertyDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      if (!propertyId) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetchPropertiesApi({ property_id: propertyId });
        console.log("property data: ", response);

        // Check if the response contains a single result (for property_id)
        if (response?.result) {
          setPropertyDetails(response.result);
        } else if (response?.results?.length > 0) {
          // Fallback for paginated response (if property_id isn't used)
          const property = response.results.find(
            (item) => item.id === propertyId
          );
          if (property) {
            setPropertyDetails(property);
          } else {
            setError(`Property with ID ${propertyId} not found`);
          }
        } else {
          setError("No property details found");
        }
      } catch (err) {
        console.error("Error fetching property details:", err);
        setError("Failed to load property details");
      } finally {
        setLoading(false);
      }
    };

    if (isExpanded && propertyId) {
      fetchPropertyDetails();
    }
  }, [isExpanded, propertyId]);

  if (!isExpanded) return null;

  return (
    <tr>
      <td colSpan={10} className="px-6 py-4 bg-gray-50">
        <div className="rounded-lg border border-gray-100 shadow-sm p-4">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">
              <p>{error}</p>
            </div>
          ) : propertyDetails ? (
            <>
              <h2 className="text-lg font-semibold mb-4 text-center">Property Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-4 gap-y-2 text-sm">
                <p><strong>ID:</strong> {propertyDetails.id || "N/A"}</p>
                <p><strong>Name:</strong> {propertyDetails.community_name || "N/A"}</p>
                <p><strong>Start Time:</strong> {startTime || "N/A"}</p>
                <p><strong>Update Time:</strong> {updateTime || "N/A"}</p>
                <p><strong>Rental Range:</strong> {propertyDetails.rental_low || "N/A"} INR - {propertyDetails.rental_high || "N/A"} INR</p>
                <p><strong>Property Type:</strong> {propertyDetails.prop_type || "N/A"}</p>
                <p><strong>Home Type:</strong> {propertyDetails.home_type || "N/A"}</p>
                <p><strong>Property Description:</strong> {propertyDetails.prop_desc || "N/A"}</p>
               
                <p><strong>Current Status:</strong> {propertyDetails.current_status || "N/A"}</p>
                <p><strong>Total Area:</strong> {propertyDetails.total_area || "N/A"} acres</p>
                <p><strong>Open Area:</strong> {propertyDetails.open_area || "N/A"}%</p>
                <p><strong>Number of Blocks:</strong> {propertyDetails.nblocks || "N/A"}</p>
                <p><strong>Floors per Block:</strong> {propertyDetails.nfloors_per_block || "N/A"}</p>
                <p><strong>Houses per Floor:</strong> {propertyDetails.nhouses_per_floor || "N/A"}</p>
                <p><strong>Total Flats:</strong> {propertyDetails.totflats || "N/A"}</p>
                
                <p><strong>Number of Bathrooms:</strong> {propertyDetails.nbaths || "N/A"}</p>
                <p><strong>Number of Balconies:</strong> {propertyDetails.nbalcony || "N/A"}</p>
                <p><strong>Eating Preference:</strong> {propertyDetails.eat_pref || "N/A"}</p>
                <p><strong>Parking Count:</strong> {propertyDetails.parking_count || "N/A"}</p>
                <p><strong>Deposit:</strong> {propertyDetails.deposit_amount || "N/A"}</p>
                <p><strong>Maintenance Type:</strong> {propertyDetails.maintenance_type || "N/A"}</p>
                <p className="col-span-full"><strong>Address:</strong> {propertyDetails.address || "N/A"}</p>
              </div>
              <div className="text-center mt-6">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                  Close
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <p>No property details available</p>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
};

export default PropertyDetailsModal;
