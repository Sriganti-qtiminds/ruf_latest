import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import tailwindStyles from "../../../utils/tailwindStyles";

import useTransactionsStore from "../../../store/transactionsStore";
import useActionsListingsStore from "../../../store/userActionsListingsStore";
import { useRoleStore } from "../../../store/roleStore";

import FavouritesCard from "./FavouritesCardView";
import PropertyListingSkeletonLoader from "../../../components/CommonViews/PropertyCardSkelton";
import { RENTALS_BASE } from "../../../routes/routesPath";
const FavoritesView = () => {
  const navigate = useNavigate();

  const { userData } = useRoleStore();
  const id = userData.id;

  const {
    transactionsLoading,
    transactionsError,
    invoices,
    receipts,
    fetchUserTransactions,
  } = useTransactionsStore();

  const { userProperties, fetchActionsListings } = useActionsListingsStore();

  const [userConnectedProperties, setUserConnectedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConnected = () => {
      setLoading(true); // Start loading
      try {
        setUserConnectedProperties(userProperties);
      } catch (err) {
        console.error("Error processing recently viewed properties:", err);
        setError(err.message); // Set error message
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchConnected();
  }, [userProperties]);

  useEffect(() => {
    const fetchInitial = async () => {
      await fetchActionsListings(id);
      await fetchUserTransactions(id);
    };

    fetchInitial();
  }, []);

  if (loading) {
    return (
      <div className={`${tailwindStyles.mainBackground} min-h-screen`}>
        <main className="container mx-auto p-4 mt-20 text-center">
          {/* <p>Loading recently viewed properties...</p> */}
          <PropertyListingSkeletonLoader />
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${tailwindStyles.mainBackground} min-h-screen`}>
        <main className="p-10 pt-24">
          <p className="text-red-500">{error}</p>
        </main>
      </div>
    );
  }

  return (
    <div
      className={`bg-gray-200 flex md:min-h-[calc(100vh-60px)] justify-center p-5`}
    >
      <main>
        <div className="space-y-5">
          {userConnectedProperties.length > 0
            ? userConnectedProperties.map((property) => {
                const matchingInvoice = invoices.find(
                  (invoice) => invoice.property_id === property.prop_id
                );
                const matchingReceipt = receipts.find(
                  (receipt) => receipt.property_id === property.prop_id
                );

                return (
                  <FavouritesCard
                    key={property.prop_id}
                    property={property}
                    initialInvoice={
                      matchingInvoice !== undefined ? matchingInvoice : null
                    }
                    receipt={
                      matchingReceipt !== undefined ? matchingReceipt : null
                    }
                  />
                );
              })
            : navigate(`${RENTALS_BASE}/myfavorites`)}
        </div>
      </main>
    </div>
  );
};

export default FavoritesView;
