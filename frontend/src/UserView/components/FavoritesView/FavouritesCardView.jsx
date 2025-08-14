


import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  MapPin,
  Phone,
  IndianRupee,
  NotebookPen,
  Square,
  Home,
  Armchair,
  Layers,
  Car,
  Calendar,
  CheckCircle,
} from "lucide-react";
import { useRoleStore } from "../../../store/roleStore";
import useActionsListingsStore from "../../../store/userActionsListingsStore";
import { updateRMTask, deleteRMTask } from "../../../services/newapiservices";
import tailwindStyles from "../../../utils/tailwindStyles";
import PaymentModal from "../../../components/CommonViews/PaymentModel";
import BrokerageView from "../InitialLandingView/BrokerageView";
import { handlePayment } from "../../../utils/paymentUtils";

// InfoItem component remains unchanged
const InfoItem = ({ value, label, addBorderRight, addBorderBottom }) => {
  const icons = {
    "Rent/Month": (
      <IndianRupee className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />
    ),
    Deposit: <NotebookPen className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Area: <Square className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Type: <Home className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Furnishing: <Armchair className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Floor: <Layers className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Parking: <Car className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
    Availability: <Calendar className="w-4 h-4 text-blue-500 sm:w-5 sm:h-5" />,
  };

  return (
    <div
      className={`flex items-center gap-2 px-2 py-2 sm:px-3 sm:py-3 bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50 transition-all duration-200
        ${addBorderRight ? "border-r border-gray-300" : ""}
        ${addBorderBottom ? "border-b border-gray-300" : ""}
      `}
    >
      <div>{icons[label]}</div>
      <div className="flex-1">
        <p className={`${tailwindStyles.paragraph_b}`}>{value}</p>
        <p className={`${tailwindStyles.paragraph}`}>{label}</p>
      </div>
    </div>
  );
};

const FavouritesCard = ({ property, initialInvoice, receipt }) => {
  const navigate = useNavigate();
  const { userData } = useRoleStore();
  const { userProperties, fetchActionsListings } = useActionsListingsStore();

  const mapBackendDataToComponent = (property) => {
    const allImages = [property.default_img, ...(property.images || [])].filter(
      Boolean
    );
    return {
      images: allImages.length > 0 ? allImages : ["default-image.jpg"],
      name: `${property.community_name}`,
      amenities: property.amenities || [],
      communitydetails: `${property.total_area} Campus with ${property.totflats} Units ${property.majorArea ? ", " + property.majorArea : ""}`,
      location: property.address,
      details: {
        "Rent/Month": `₹ ${property.rental_high.toLocaleString()} ${property.maintenance_type === "Included" ? " + Maintenance" : ""}`,
        Deposit: property.deposit_amount
          ? `₹ ${property.deposit_amount.toLocaleString()}`
          : "N/A",
        Area: `${property.super_area ? property.super_area + " sqft" : "- -"}`,
        Type: property.home_type || "N/A",
        Furnishing: property.prop_desc || "N/A",
        Floor: property.floor_no || "N/A",
        Parking: property.parking_count || "N/A",
        Availability: property.available_date || "N/A",
      },
    };
  };

  const { images, name, location, details, communitydetails } =
    mapBackendDataToComponent(property);

  const [mainImage, setMainImage] = useState(images[0]);
  const [isAmenitiesOpen, setIsAmenitiesOpen] = useState(false);
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);
  const [isBrokerageOpen, setIsBrokerageOpen] = useState(false); // New state for Brokerage modal
  const [amount, setAmount] = useState("Here");
  const [isFavorite, setIsFavorite] = useState(true);
  const [isFavoriteAnimating, setIsFavoriteAnimating] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState([]);

  // Payment
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [showPaymentModal, setPaymentShowModal] = useState(false);
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);

  const matchedProperty = userProperties.find(
    (userProp) => userProp.prop_id === property.prop_id
  );
  const detailEntries = Object.entries(details);
  const totalItems = detailEntries.length;

  useEffect(() => {
    if (initialInvoice?.Inv_Total) {
      setAmount(`₹ ${initialInvoice.Inv_Total}`);
    }
  }, [initialInvoice]);

  const connectToRM = async (propertyId) => {
    try {
      const result = await updateRMTask(userData.id, propertyId, 4);
      if (result.status === 200) {
        fetchActionsListings(userData.id);
      } else {
        throw new Error("Failed to connect to RM");
      }
    } catch (error) {
      console.error("Error at Connect To RM:", error);
      alert("Failed to connect to Relationship Manager. Please try again.");
    }
  };

  const onClickRemoveFavourite = (event) => {
    setIsFavoriteAnimating(true);
    const rect = event.currentTarget.getBoundingClientRect();
    const newHeart = {
      id: Date.now(),
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setFloatingHearts((prev) => [...prev, newHeart]);
    setTimeout(
      () =>
        setFloatingHearts((prev) => prev.filter((h) => h.id !== newHeart.id)),
      1000
    );
    setIsConfirmPopupOpen(true);
    setTimeout(() => setIsFavoriteAnimating(false), 400);
  };

  const confirmRemoveFavourite = async (trId) => {
    try {
      const result = await deleteRMTask(trId);
      if (result.status) {
        setIsFavorite(false);
        fetchActionsListings(userData.id);
      } else {
        throw new Error("Failed to remove favorite");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Failed to remove favorite. Please try again.");
    } finally {
      setIsConfirmPopupOpen(false);
    }
  };

  const handleClose = () => {
    setPaymentShowModal(false);
    window.location.reload();
  };

  const showRmNumber = matchedProperty
    ? {
        rmNumber: matchedProperty.RM_mobile_no,
        rmName: matchedProperty.rm_name,
      }
    : null;

  const isRemoveDisabled =
    matchedProperty?.current_status_id >= 18 &&
    matchedProperty?.current_status_id !== 28;

  const isPaymentReady = property.current_status_id === 18;

  return (
    <div
      className={`relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 mx-auto w-full max-w-[95%] sm:max-w-3xl lg:max-w-6xl overflow-hidden`}
    >
      {/* Badge for Payment Ready */}
      {isPaymentReady && (
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-green-700 to-blue-700 text-white text-xs font-bold px-2 py-1 shadow-md">
          Invoice Generated
        </div>
      )}
      {receipt !== null && (
        <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-yellow-700 to-blue-700 text-white text-xs font-bold px-2 py-1 shadow-md">
          RR Package Enabled
        </div>
      )}
      <div className="flex flex-col lg:flex-row gap-3 p-3 sm:p-4 lg:p-4">
        {/* Image Section */}
        <div className="flex flex-col md:flex-row md:gap-4 lg:flex-row lg:gap-2">
          {/* Thumbnails */}
          <div className="order-2 md:order-1 md:items-center flex md:flex-col gap-1 sm:gap-2 overflow-x-auto md:overflow-y-auto md:h-52 pb-2 md:pb-0 scrollbar-thin scrollbar-thumb-gray-300 mt-2 sm:mt-3 md:mt-0 md:w-1/4">
            {images.map((image, index) => (
              <img
                key={index}
                className={`w-12 h-12 m-0.5 ml-0.5 sm:w-14 sm:h-14 md:w-3/4 md:h-14 lg:w-14 lg:h-14 object-cover rounded-md cursor-pointer flex-shrink-0 transition-all duration-200
                  ${mainImage === image ? "ring-2 ring-blue-500" : "opacity-75 hover:opacity-100"}`}
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                onClick={() => setMainImage(image)}
              />
            ))}
          </div>

          {/* Main Image */}
          <div className="order-1 md:order-2 lg:order-1 relative group w-full md:w-3/4 lg:w-full">
            <img
              className="w-full lg:min-w-80 lg:max-w-80 h-40 sm:h-48 md:h-52 lg:h-full object-cover rounded-lg transition-transform duration-300"
              src={mainImage}
              alt={name}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-2 relative flex-1">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2 sm:gap-3">
                <h2 className={`${tailwindStyles.heading_3}`}>{name}</h2>
                <a
                  href={property.map_url}
                  target="_blank"
                  className="hover:scale-110 transition-transform"
                >
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />
                </a>
              </div>
              <p className={`${tailwindStyles.paragraph_b}`}>
                {communitydetails}
              </p>
              <p className={`${tailwindStyles.paragraph}`}>{location}</p>
            </div>
            {isFavorite && (
              <button
                onClick={onClickRemoveFavourite}
                className={`p-1 sm:p-2 rounded-full hover:bg-gray-100 transition-colors ${isRemoveDisabled ? "opacity-50 cursor-not-allowed" : ""} ${isFavoriteAnimating ? "animate-favorite" : ""}`}
                disabled={isRemoveDisabled}
              >
                <Heart
                  className={`w-4 h-4 sm:w-5 sm:h-5 fill-red-500 text-red-500`}
                />
              </button>
            )}
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 bg-gray-200 rounded-lg overflow-hidden">
            {detailEntries.map(([key, value], index) => {
              const totalColumns = window.innerWidth < 1024 ? 2 : 4;
              const isLastColumn = (index + 1) % totalColumns === 0;
              const isLastRow =
                index >=
                totalItems - (totalItems % totalColumns || totalColumns);

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

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            {showRmNumber && matchedProperty?.current_status_id !== 28 ? (
              <div className="flex items-center gap-1 sm:gap-2 bg-blue-50 px-2 sm:px-2 py-1 sm:py-2 rounded-lg animate-rm-slide">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500" />
                <span className={`${tailwindStyles.paragraph}`}>
                  {showRmNumber.rmName} (RM) will contact you soon
                </span>
              </div>
            ) : (
              <button
                onClick={() => connectToRM(property.prop_id)}
                className={`flex-1 ${tailwindStyles.secondaryButton}`}
              >
                Request A Callback
              </button>
            )}
            <div className="flex gap-2 sm:gap-3">
              <button
                onClick={() => setIsAmenitiesOpen(true)}
                className={`flex-1 ${tailwindStyles.thirdButton}`}
              >
                View Amenities
              </button>
              </div>
              {!isPaymentReady && !receipt && (
                 <div className="ml-auto">
                <button
                  onClick={() => setIsBrokerageOpen(true)}
                  className={` ${tailwindStyles.thirdButton} bg-gradient-to-r from-orange-200 to-yellow-400 rounded-lg text-[#001433]  max-w-40`}
                >
                  Service Charge
                </button>
                </div>
              )}
           
            {isPaymentReady && (
              <>
                <button
                  onClick={() => navigate("/user/transactions")}
                  className={`flex-1 ${tailwindStyles.secondaryButton} bg-gradient-to-r from-green-700 to-blue-700 text-white hover:from-green-800 hover:to-blue-800`}
                >
                  View Invoice
                </button>
                <button
                  onClick={() =>
                    handlePayment(
                      property.prop_id,
                      initialInvoice,
                      setIsPaymentLoading,
                      setPaymentShowModal,
                      setIsPaymentSuccess
                    )
                  }
                  disabled={isPaymentLoading}
                  className={`flex-1 ${tailwindStyles.secondaryButton} bg-gradient-to-r from-green-700 to-blue-700 text-white hover:from-green-800 hover:to-blue-800`}
                >
                  {isPaymentLoading ? "Processing..." : `Pay ${amount}`}
                </button>
              </>
            )}
            {receipt !== null && (
              <button
                onClick={() => navigate("/user/myservices")}
                className="flex-1 bg-gradient-to-r from-yellow-700 to-blue-700 text-white font-bold rounded-lg px-4 py-1 hover:from-yellow-800 hover:to-blue-800 transition-all duration-300 shadow-md hover:shadow-lg transform flex items-center justify-center gap-2 animate-success"
              >
                <CheckCircle className="w-5 h-5" />
                RR Package Enabled
              </button>
            )}
          </div>

          {/* Floating Hearts */}
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

      {/* Confirmation Popup */}
      {isConfirmPopupOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-4 sm:p-6 w-full max-w-xs sm:max-w-sm md:max-w-md transform transition-all duration-300 scale-100">
            <p
              className={`${tailwindStyles.paragraph} text-gray-800 text-center mb-4 sm:mb-6 text-sm sm:text-base md:text-lg font-medium`}
            >
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
                onClick={() => confirmRemoveFavourite(property.transaction_id)}
                className="px-4 sm:px-6 py-1 sm:py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xs sm:text-sm md:text-base"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={handleClose}
        isPaymentSuccess={isPaymentSuccess}
      />

      {/* Brokerage Modal */}
      <BrokerageView
        isOpen={isBrokerageOpen}
        onClose={() => setIsBrokerageOpen(false)}
      />
    </div>
  );
};

// Custom CSS animations
const styles = `
  @keyframes pulseAndFill {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }

  .animate-favorite {
    animation: pulseAndFill 0.4s ease-in-out;
  }

  @keyframes floatHeart {
    0% { transform: translateY(0) translateX(0); opacity: 1; }
    50% { transform: translateY(-50px) translateX(${Math.random() * 20 - 10}px); opacity: 0.8; }
    100% { transform: translateY(-100px) translateX(${Math.random() * 40 - 20}px); opacity: 0; }
  }

  .animate-float-heart {
    animation: floatHeart 1s ease-out forwards;
    position: fixed;
    z-index: 10;
  }

  @keyframes slideIn {
    0% { transform: translateX(-100%); opacity: 0; }
    100% { transform: translateX(0); opacity: 1; }
  }

  .animate-rm-slide {
    animation: slideIn 0.5s ease-out forwards;
  }
`;

if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style");
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}

export default FavouritesCard;



