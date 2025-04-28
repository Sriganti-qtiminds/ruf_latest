import React, { useState, useEffect } from "react";

import useActionsListingsStore from "../../../store/userActionsListingsStore";
import useTransactionsStore from "../../../store/transactionsStore";
import { useRoleStore } from "../../../store/roleStore";

import RentalAgreement from "./RentalAgreement";
import DeepCleaningConfirmation from "./DeepCleaning";
import Photoshoot from "./Photoshoot";
import TShirtSelection from "./Tshirt";
import Rentalreminder from "./Rentalreminder";
import tailwindStyles from "../../../utils/tailwindStyles";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const ServicesView = () => {
  const { receipts } = useTransactionsStore();
  const { userData } = useRoleStore();
  const { userProperties } = useActionsListingsStore();

  const validProperties = receipts;
  const userId = userData.id;

  const [selectedProperty, setSelectedProperty] = useState(validProperties[0]); // Default to Property 1
  const [serviceDetails, setServiceDetails] = useState(null); // Store service details for the selected property
  const [isLoading, setIsLoading] = useState(true); // Loading state

  const propertyDetails = userProperties.find(
    (prop) => prop.prop_id == selectedProperty.property_id
  );

  // Fetch service details when the selected property changes
  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        const response = await fetch(
          `${apiUrl}/getServiceDetails?receipt_id=${selectedProperty.Receipt_Id}`
        );
        const data = await response.json();
        setServiceDetails(data.services); // Store the service details
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setIsLoading(false); // Stop loading
      }
    };

    fetchServiceDetails();
  }, [selectedProperty]); // Re-fetch when selectedProperty changes

  if (isLoading) {
    return <div>Loading...</div>; // Show loading state
  }

  return (
    <main className="flex flex-col items-center justify-center p-1 bg-gray-100 min-h-screen">
      <h2 className={`${tailwindStyles.heading_2} p-3`}>
        Welcome to RR Package Services
      </h2>
      {validProperties.length === 0 ? (
        <div className="text-center text-lg text-red-500 font-semibold mt-6">
          Buy RR Package to Claim Our Services
        </div>
      ) : (
        <>
          {/* Property Tabs */}
          <div className="flex gap-4 mb-6">
            {validProperties.map((property) => (
              <button
                key={property.property_id} // Ensure unique key
                onClick={() => setSelectedProperty(property)}
                className={`px-4 py-2 rounded-md transition-colors ${
                  selectedProperty?.property_id === property.property_id
                    ? "bg-white border border-[#ffc107]"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {propertyDetails.community_name}_{property.Receipt_Id}
              </button>
            ))}
          </div>

          {/* Services for Selected Property */}
          <div className="w-full max-w-6xl mx-auto">
            <div className="grid grid-cols-1  md:grid-cols-3 gap-6 md:gap-3 lg:gap-6">
              {/* Top Three Cards */}
              <div className="col-span-1">
                {selectedProperty?.Receipt_Id && (
                  <RentalAgreement
                    receiptId={selectedProperty.Receipt_Id}
                    userId={userId}
                    address={selectedProperty.address}
                    propertyId={selectedProperty.property_id}
                    serviceDetails={serviceDetails}
                  />
                )}
              </div>
              <div className="col-span-1">
                {selectedProperty?.Receipt_Id && (
                  <TShirtSelection
                    receiptId={selectedProperty.Receipt_Id}
                    userId={userId}
                    address={selectedProperty.address}
                    propertyId={selectedProperty.property_id}
                    serviceDetails={serviceDetails}
                  />
                )}
              </div>
              <div className="col-span-1">
                {selectedProperty?.Receipt_Id && (
                  <Rentalreminder
                    receiptId={selectedProperty.Receipt_Id}
                    userId={userId}
                    address={selectedProperty.address}
                    propertyId={selectedProperty.property_id}
                    serviceDetails={serviceDetails}
                  />
                )}
              </div>
            </div>

            {/* Bottom Two Cards Centered in a New Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 mt-6 place-items-center">
              <div className="w-full flex justify-center">
                {selectedProperty?.Receipt_Id && (
                  <Photoshoot
                    receiptId={selectedProperty.Receipt_Id}
                    userId={userId}
                    address={selectedProperty.address}
                    propertyId={selectedProperty.property_id}
                    serviceDetails={serviceDetails}
                  />
                )}
              </div>
              <div className="w-full flex justify-center">
                {selectedProperty?.Receipt_Id && (
                  <DeepCleaningConfirmation
                    receiptId={selectedProperty.Receipt_Id}
                    userId={userId}
                    address={selectedProperty.address}
                    propertyId={selectedProperty.property_id}
                    serviceDetails={serviceDetails}
                  />
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
};

export default ServicesView;
