import React, { useState } from "react";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import { faTshirt, faChevronDown } from "@fortawesome/free-solid-svg-icons";
import tailwindStyles from "../../../utils/tailwindStyles";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const TShirtSelection = ({ receiptId, userId, serviceDetails }) => {
  const [selectedSize, setSelectedSize] = useState("");

  // Determine if the T-Shirt service has been requested
  const isTShirtRequested = serviceDetails?.some(
    (service) => service.svc_id === 4
  );

  // Extract T-Shirt service details if requested
  const tShirtDetails = isTShirtRequested
    ? serviceDetails.find((service) => service.svc_id === 4)
    : null;

  const handleSizeChange = (e) => {
    setSelectedSize(e.target.value);
  };

  const handleClaimTShirt = async () => {
    try {
      // Calculate dates
      const orderPlacementDate = new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      const deliveryDate = new Date();
      deliveryDate.setDate(deliveryDate.getDate() + 21); // 3 weeks after order placement
      const formattedDeliveryDate = deliveryDate.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      // Prepare the request body
      const requestBody = {
        receipt_id: receiptId, // This should ideally be dynamic based on the selected property
        svc_id: 4,
        package_id: 1,
        svc_info: {
          "Order Placement Date": orderPlacementDate,
          "Delivery Date": formattedDeliveryDate,
          "Selected Size": selectedSize, // Include selected T-shirt size
        },
        claimed_by: userId,
        claimer_cat: "tenant",
      };

      // Send POST request
      const response = await fetch(`${apiUrl}/claimservices`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error("Failed to claim service");
      }

      window.location.reload();
    } catch (error) {
      console.error("Error claiming T-Shirt:", error);
      alert("Failed to claim T-Shirt. Please try again.");
    }
  };
  console.log("from serv t-shirt");

  return (
    <div
      className={`md:max-w-md max-w-sm mx-auto  p-4 sm:p-2 ${tailwindStyles.whiteCard} min-h-[210px] max-h-[210px] rounded-lg shadow-lg relative `}
    >
      <div
        className={`${tailwindStyles.whiteCard} rounded-lg shadow-sm  space-y-3 `}
      >
        {/* Header Section */}
        <div className="flex items-center justify-between px-1 py-2 rounded-t-lg flex-nowrap gap-1 sm:gap-3 ">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg">
              {/* <FontAwesomeIcon icon={faTshirt} className="text-gray-600" /> */}
              <img
                src="/Package/Package_Image_3.png"
                alt="T-shirt"
                className="w-6 h-6"
              />
            </div>
            <h2
              className={`text-sm sm:text-lg font-semibold min-w-0 ${tailwindStyles.heading}`}
            >
              Premium TShirt
            </h2>
          </div>
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              isTShirtRequested
                ? "bg-yellow-100 text-yellow-800" // Yellow for Requested
                : "bg-green-100 text-green-800" // Green for Available
            }`}
          >
            {isTShirtRequested ? "Requested" : "Available"}
          </span>
        </div>

        {/* Content Section */}
        {isTShirtRequested ? (
          // Show service details if T-Shirt is requested
          <div className="space-y-4">
            <div className={tailwindStyles.paragraph}>
              <h1 className={`${tailwindStyles.heading_4} pl-2`}>
                Congratulations your Order is placed
              </h1>
              <p className="p-2">
                <span className="font-medium">Order Placement Date:</span>{" "}
                {tShirtDetails?.svc_info?.["Order Placement Date"]}
              </p>
              <p className="p-2">
                <span className="font-medium">Expected Delivery Before:</span>{" "}
                {tShirtDetails?.svc_info?.["Delivery Date"]}
              </p>
              <p className="p-2">
                <span className="font-medium">Selected Size:</span>{" "}
                {tShirtDetails?.svc_info?.["Selected Size"]}
              </p>
            </div>
          </div>
        ) : (
          // Show dropdown and claim button if T-Shirt is available
          <>
            <div className="relative ">
              <label
                className={`pl-2 font-semibold text-left block ${tailwindStyles.heading_4}`}
              >
                Select T Shirt Size
              </label>
              <select
                value={selectedSize}
                onChange={handleSizeChange}
                className={`w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 px-4 pr-10 ${tailwindStyles.paragraph} leading-tight focus:outline-none focus:border-custom`}
              >
                <option value="" disabled>
                  Select Size
                </option>
                <option value="S">S</option>
                <option value="M">M</option>
                <option value="L">L</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
                <option value="XXXL">XXXL</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center  px-3 text-gray-400">
                {/* <FontAwesomeIcon icon={faChevronDown} className="text-sm" /> */}
              </div>
            </div>
            <div className="pt-5">
              <button
                onClick={handleClaimTShirt}
                disabled={!selectedSize} // Button is disabled until size is selected
                className={`w-full py-2 sm:py-1 rounded-md  font-semibold transition duration-300 focus:outline-none ${
                  selectedSize
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Claim T-Shirt
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TShirtSelection;
