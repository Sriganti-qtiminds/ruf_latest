import React, { useEffect, useState } from "react";
import tailwindStyles from "../../../utils/tailwindStyles";
import { fetchCommunityAmenities } from "../../../services/newapiservices";

const AmenitiesList = ({ communityId, isOpen }) => {
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch amenities on mount
  useEffect(() => {
    const getAmenities = async () => {
      try {
        if (communityId) {
          const response = await fetchCommunityAmenities(communityId);
          if (response && Array.isArray(response.amenities)) {
            setAmenities(response.amenities);
          } else {
            setAmenities([]);
          }
        }
      } catch (error) {
        console.error("Error fetching amenities:", error);
        setAmenities([]);
      } finally {
        setLoading(false);
      }
    };

    getAmenities();
  }, [communityId]);

  return (
    <div
      className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
      }`}
    >
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className={`${tailwindStyles.heading_4} mb-3`}>Amenities</h3>

        {loading ? (
          <p className="text-gray-500 text-sm">Loading amenities...</p>
        ) : amenities.length > 0 ? (
          <div className="space-y-3">
            {amenities.map((categoryObj, index) => (
              <div key={index}>
                {/* Category Name */}
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  {categoryObj.category}
                </p>
                <div className="flex flex-wrap gap-2">
                  {categoryObj.amenities.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded text-[9px] sm:text-xs"
                    >
                      <img
                        src="/ammenity/home_2.png"
                        className="w-3 h-3"
                        alt="amenity"
                      />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm">No amenities available</p>
        )}
      </div>
    </div>
  );
};

export default AmenitiesList;
