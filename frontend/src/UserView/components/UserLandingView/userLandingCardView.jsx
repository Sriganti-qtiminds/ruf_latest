

//Latest Pop up for showing benefits



import React, { useState } from "react";
import {
  Heart,
  MapPin,
  Phone,
  Home,
  IndianRupee,
  NotebookPen,
  Square,
  Armchair,
  Layers,
  Car,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Cookies from "js-cookie";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

import AuthModal from "../../../components/CommonViews/AuthModalView";
import { useRoleStore } from "../../../store/roleStore";
import useActionsListingsStore from "../../../store/userActionsListingsStore";
import {
  postRMTask,
  updateRMTask,
  deleteRMTask,
} from "../../../services/newapiservices";

import tailwindStyles from "../../../utils/tailwindStyles";
import SimilarProperties from "./SimilarPropertyCard";
import BrokerageView from "../InitialLandingView/BrokerageView";



// InfoItem Component (unchanged)
const InfoItem = ({ value, label, addBorderRight, addBorderBottom }) => {
  const icons = {
    "Rent/Month": <IndianRupee className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Deposit: <NotebookPen className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Area: <Square className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Type: <Home className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Furnishing: <Armchair className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Floor: <Layers className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Parking: <Car className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Availability: <Calendar className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    TenantType: <Users className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
  };

  return (
    <div
      className={`flex items-center gap-3 px-2 py-2 sm:px-3 sm:py-2 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200
        ${addBorderRight ? "border-r border-gray-300" : ""}
        ${addBorderBottom ? "border-b border-gray-300" : ""}
         ${label === "Rent/Month" || label === "Furnishing" || label === "Availability" ? "md:col-span-2" : ""}
         ${label === "TenantType" && "col-span-2 border-r-0 md:col-span-1"}`}
    >
      <div>{icons[label]}</div>
      <div className="flex-1">
        <p className={`${tailwindStyles.paragraph_b}`}>{value}</p>
        <p className={`${tailwindStyles.paragraph} pt-1`}>{label}</p>
      </div>
    </div>
  );
};

// mapBackendDataToComponent (unchanged)
const mapBackendDataToComponent = (property) => {
  const allImages = [property.default_img, ...(property.images || [])].filter(Boolean);
  return {
    images: allImages.length > 0 ? allImages : ["default-image.jpg"],
    name: `${property.community_name}`,
    communitydetails: `${property.total_area} Acres Campus with ${property.totflats} Units ${property.majorArea !== null ? ", Near " + property.majorArea : ""}`,
    location: property.address,
    details: {
      "Rent/Month": `₹ ${property?.rental_high || "N/A"} ${property.maintenance_type === "Included" ? " + Maintenance" : ""}`,
      Deposit: property.deposit_amount ? `₹ ${property.deposit_amount.toLocaleString()}` : "N/A",
      Type: property.home_type || "N/A",
      Furnishing: property.prop_desc || "N/A",
      Floor: property.floor_no || "N/A",
      Area: `${property.super_area !== null ? property.super_area + " sqft" : "- -"}`,
      Availability: property.available_date || "N/A",
      Parking: property.parking_count || "N/A",
      TenantType: property.tenant_type || "N/A",
    },
  };
};

const PropertyListingCard = ({ property }) => {
  if (property.similarProperties !== undefined) {
    return <SimilarProperties property={property} />;
  }

  const { userData } = useRoleStore();
  const { userProperties, fetchActionsListings } = useActionsListingsStore();
  const { images, name, location, details, communitydetails } = mapBackendDataToComponent(property);
  const [mainImage, setMainImage] = useState(images[0]);
  const [isFavoriteAnimating, setIsFavoriteAnimating] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);
  const [isRmModalOpen, setIsRmModalOpen] = useState(false);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isBrokeragePopupOpen, setIsBrokeragePopupOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const amenities = [
    "Swimming Pool",
    "Gymnasium",
    "24/7 Security",
    "Power Backup",
    "Club House",
    "Children's Play Area",
  ];

  const matchedProperty = userProperties.find((userProp) => userProp.prop_id === property.id);
  const showRmNumber = matchedProperty?.rm_name
    ? { rmNumber: matchedProperty.RM_mobile_no || "RM Assigned", rmName: matchedProperty.rm_name }
    : null;
  const isRemoveDisabled = matchedProperty?.current_status_id >= 18 && matchedProperty?.current_status_id != 28;

  const connectToRM = async (propertyId, matched) => {
    const id = userData.id;
    try {
      const jwtToken = Cookies.get(jwtSecretKey);
      if (!jwtToken) {
        openModal(); // Show login modal if not authenticated
      } else {
        setIsRmModalOpen(true); // Show "Connecting to RM" modal first
        if (id != undefined && matched !== undefined) {
          if (matched.current_status_id === 28) {
            const result = await updateRMTask(id, propertyId, 4);
            if (result.status == 200) fetchActionsListings(id);
          }
        } else if (id != undefined) {
          const result = await postRMTask(id, propertyId, 4);
          if (result.status == 200) fetchActionsListings(id);
        }
        setTimeout(() => {
          setIsRmModalOpen(false); // Close RM modal after 1.5s
          setTimeout(() => setIsBrokeragePopupOpen(true), 200); // Show Brokerage popup 200ms after RM modal closes
        }, 1500);
      }
    } catch (error) {
      console.log("Error at Connect To RM:", error.message);
      setIsRmModalOpen(false);
      setIsBrokeragePopupOpen(false);
    }
  };

  const onClickFavourite = async (propertyId, event) => {
    const id = userData.id;
    try {
      const jwtToken = Cookies.get(jwtSecretKey);
      if (!jwtToken) {
        openModal(); // Show login modal if not authenticated
      } else {
        setIsFavoriteAnimating(true);
        const rect = event.currentTarget.getBoundingClientRect();
        const newHeart = { id: Date.now(), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
        setFloatingHearts((prev) => [...prev, newHeart]);
        setTimeout(() => setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id)), 1000);

        if (id != undefined) {
          const result = await postRMTask(id, propertyId, 28);
          if (result.status == 200) {
            fetchActionsListings(id);
            setTimeout(() => {
              setIsBrokeragePopupOpen(true)
             
            }, 400); // Delay RM modal until favorite animation completes
          }
        }
        setTimeout(() => setIsFavoriteAnimating(false), 400);
      }
    } catch (error) {
      console.log("Error at Connect To RM:", error.message);
      setIsFavoriteAnimating(false);
      setIsRmModalOpen(false);
      setIsBrokeragePopupOpen(false);
    }
  };

  const onClickRemoveFavourite = async (matched) => {
    setIsConfirmPopupOpen(true);
  };

  const confirmRemoveFavourite = async (matched) => {
    const id = userData.id;
    try {
      const jwtToken = Cookies.get(jwtSecretKey);
      if (!jwtToken) {
        openModal();
      } else {
        setIsFavoriteAnimating(true);
        if (id != undefined) {
          const trId = matched.transaction_id;
          const result = await deleteRMTask(trId);
          if (result.status == 200) fetchActionsListings(id);
        }
        setTimeout(() => setIsFavoriteAnimating(false), 400);
      }
    } catch (error) {
      console.log("Error at Connect To RM:", error.message);
      setIsFavoriteAnimating(false);
    } finally {
      setIsConfirmPopupOpen(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mx-auto w-full max-w-[95%] sm:max-w-3xl lg:max-w-4xl overflow-hidden">
      <div className="flex flex-col lg:flex-row gap-3 px-4 pt-4">
        {/* Image Section */}
        <div className="flex flex-col md:flex-row md:gap-4 lg:flex-col lg:gap-2">
          <div className="order-2 md:order-1 md:items-center lg:order-2 flex md:flex-col lg:flex-row gap-1 sm:gap-2 overflow-x-auto md:overflow-y-auto lg:overflow-x-auto md:h-44 lg:h-auto pb-2 md:pb-0 lg:pb-2 scrollbar-thin scrollbar-thumb-gray-300 mt-2 sm:mt-3 md:mt-0 lg:mt-2 md:w-1/4 lg:min-w-80 lg:max-w-80">
            {images.map((image, index) => (
              <img
                key={index}
                className={`w-12 h-12 mt-0.5 ml-0.5 sm:w-14 sm:h-14 md:w-3/4 md:h-14 lg:w-14 lg:h-14 object-cover rounded-md cursor-pointer flex-shrink-0 transition-all duration-200
                  ${mainImage === image ? "ring-2 ring-blue-500" : "opacity-75 hover:opacity-100"}`}
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                onClick={() => setMainImage(image)}
              />
            ))}
          </div>
          <div className="order-1 md:order-2 lg:order-1 relative group w-full md:w-3/4 lg:w-full">
            <img
              className="w-full lg:min-w-80 lg:max-w-80 h-40 sm:h-48 md:h-44 lg:h-46 object-cover rounded-lg transition-transform duration-300"
              src={mainImage}
              alt={name}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-2 relative">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className={`${tailwindStyles.heading_3}`}>{name}</h2>
                <a href={property.map_url} target="_blank" className="hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </a>
              </div>
              <p className={`${tailwindStyles.paragraph_b}`}>{communitydetails}</p>
              <p className={`${tailwindStyles.paragraph}`}>{location}</p>
            </div>
            <button
              onClick={(e) => (showRmNumber ? onClickRemoveFavourite(matchedProperty) : onClickFavourite(property.id, e))}
              className={`p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${isRemoveDisabled ? "opacity-50 cursor-not-allowed" : ""} ${isFavoriteAnimating ? "animate-favorite" : ""}`}
              disabled={isRemoveDisabled}
            >
              <Heart
                className={`w-4 h-4 sm:w-5 sm:h-5 ${showRmNumber ? "fill-red-500 text-red-500" : "text-gray-500"}`}
              />
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-200 rounded-lg overflow-hidden">
            {Object.entries(details).map(([key, value], index) => {
              const totalColumns = window.innerWidth < 1024 ? 2 : 3;
              const isLastColumn = (index + 1) % totalColumns === 0;
              const isLastRow = index >= Object.entries(details).length - (Object.entries(details).length % totalColumns || totalColumns);
              return (
                <InfoItem
                  key={key}
                  value={value}
                  label={key}
                  addBorderRight={!isLastColumn}
                  addBorderBottom={!isLastRow}
                />
              );
            })}
          </div>

          {floatingHearts.map((heart) => (
            <Heart
              key={heart.id}
              className="absolute text-red-500 fill-red-500 animate-float-heart"
              style={{ left: `${heart.x}px`, top: `${heart.y}px` }}
              size={20}
            />
          ))}
        </div>
      </div>

      {/* Amenities Section */}
      <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isAmenitiesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className={`${tailwindStyles.heading_4} mb-3`}>Amenities</h3>
          <div className="grid grid-cols-6 gap-2">
            {amenities.map((amenity, index) => (
              <div key={index} className="flex items-center gap-2">
                <img src="ammenity/home_2.png" className="w-3 h-3" alt="amenity" />
                <span className="text-[9px]">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex lg:justify-self-end lg:w-[55%] mx-5 mb-5 mt-5 flex-col sm:flex-row gap-2 sm:gap-3">
        {showRmNumber && matchedProperty.current_status_id !== 28 ? (
          <div className="flex items-center gap-1 sm:gap-2 bg-blue-50 px-2 sm:px-4 py-1 sm:py-2 rounded-lg animate-rm-slide">
            <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
            <span className={`${tailwindStyles.paragraph} text-gray-700 text-[10px] sm:text-xs md:text-sm`}>
              {showRmNumber.rmName} (RM) will contact you soon
            </span>
          </div>
        ) : (
          <button
            onClick={() => connectToRM(property.id, matchedProperty)}
            className={`flex-1 order-2 md:order-1 ${tailwindStyles.secondaryButton}`}
          >
            Request A Callback
          </button>
        )}
        <button
          onClick={() => setIsAmenitiesOpen(!isAmenitiesOpen)}
          className={`flex items-center justify-center gap-3 flex-1 order-1 md:order-2 ${tailwindStyles.thirdButton}`}
        >
          View Amenities{" "}
          <div>{isAmenitiesOpen ? <ChevronUp className="h-5 w-5 text-[#ffc107]" /> : <ChevronDown className="h-5 w-5 text-[#ffc107]" />}</div>
        </button>
      </div>

      <AuthModal isOpen={isModalOpen} onClose={closeModal} />
      <BrokerageView isOpen={isBrokeragePopupOpen} onClose={() => setIsBrokeragePopupOpen(false)} />

      {isRmModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-full p-6 w-full max-w-sm transform animate-crack-and-flower relative overflow-hidden">
            <p className={`${tailwindStyles.paragraph} text-gray-800 text-center text-lg font-medium`}>
              Connecting to RM...
            </p>
            <div className="absolute inset-0 pointer-events-none">
              <div className="flower-burst"></div>
            </div>
          </div>
        </div>
      )}

      {isConfirmPopupOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md transform transition-all duration-300 scale-100">
            <p className={`${tailwindStyles.paragraph} text-gray-800 text-center mb-4 sm:mb-6 text-sm sm:text-base md:text-lg font-medium`}>
              Are you sure you want to remove this property from favorites?
            </p>
            <div className="flex justify-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsConfirmPopupOpen(false)}
                className="px-4 sm:px-6 py-1 sm:py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-xs sm:text-sm md:text-base"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmRemoveFavourite(matchedProperty)}
                className="px-4 sm:px-6 py-1 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm md:text-base"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyListingCard;
