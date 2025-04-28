import React, { useEffect } from "react";

import { useRoleStore } from "../../../store/roleStore";
import useTransactionsStore from "../../../store/transactionsStore";
import useActionsListingsStore from "../../../store/userActionsListingsStore";

import AllTransactions from "./Transactions";

const UserTransactionsView = () => {
  const { invoices, receipts, fetchUserTransactions } = useTransactionsStore();
  const { userProperties, fetchActionsListings } = useActionsListingsStore();
  const { userData } = useRoleStore();

  useEffect(() => {
    const initial = () => {
      fetchUserTransactions(userData.id);
      fetchActionsListings(userData.id);
    };

    initial();
  }, [userData]);

  return (
    <div className="bg-gray-200 p-5 min-h-[calc(100vh-56px)]">
      <AllTransactions
        userId={userData.id}
        invoices={invoices}
        receipts={receipts}
        userProperties={userProperties}
        fetchActionsListings={fetchActionsListings}
        fetchUserTransactions={fetchUserTransactions}
      />
    </div>
  );
};

export default UserTransactionsView;
