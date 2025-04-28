import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import tailwindStyles from "../utils/tailwindStyles";
import { useRoleStore } from "../store/roleStore";
import { getTasks, getFmList, updateTask } from "../config/apiRoute";
import SearchableDropdown from "./SearchableDropdown";
import axios from "axios";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const timeSlots = [
  { id: "8:00AM", slot: "8:00 AM" },
  { id: "8:15AM", slot: "8:15 AM" },
  { id: "8:30AM", slot: "8:30 AM" },
  { id: "8:45AM", slot: "8:45 AM" },
  { id: "9:00AM", slot: "9:00 AM" },
  { id: "9:15AM", slot: "9:15 AM" },
  { id: "9:30AM", slot: "9:30 AM" },
  { id: "9:45AM", slot: "9:45 AM" },
  { id: "10:00AM", slot: "10:00 AM" },
  { id: "10:15AM", slot: "10:15 AM" },
  { id: "10:30AM", slot: "10:30 AM" },
  { id: "10:45AM", slot: "10:45 AM" },
  { id: "11:00AM", slot: "11:00 AM" },
  { id: "11:15AM", slot: "11:15 AM" },
  { id: "11:30AM", slot: "11:30 AM" },
  { id: "11:45AM", slot: "11:45 AM" },
  { id: "12:00PM", slot: "12:00 PM" },
  { id: "12:15PM", slot: "12:15 PM" },
  { id: "12:30PM", slot: "12:30 PM" },
  { id: "12:45PM", slot: "12:45 PM" },
  { id: "1:00PM", slot: "1:00 PM" },
  { id: "1:15PM", slot: "1:15 PM" },
  { id: "1:30PM", slot: "1:30 PM" },
  { id: "1:45PM", slot: "1:45 PM" },
  { id: "2:00PM", slot: "2:00 PM" },
  { id: "2:15PM", slot: "2:15 PM" },
  { id: "2:30PM", slot: "2:30 PM" },
  { id: "2:45PM", slot: "2:45 PM" },
  { id: "3:00PM", slot: "3:00 PM" },
  { id: "3:15PM", slot: "3:15 PM" },
  { id: "3:30PM", slot: "3:30 PM" },
  { id: "3:45PM", slot: "3:45 PM" },
  { id: "4:00PM", slot: "4:00 PM" },
  { id: "4:15PM", slot: "4:15 PM" },
  { id: "4:30PM", slot: "4:30 PM" },
  { id: "4:45PM", slot: "4:45 PM" },
  { id: "5:00PM", slot: "5:00 PM" },
  { id: "5:15PM", slot: "5:15 PM" },
  { id: "5:30PM", slot: "5:30 PM" },
  { id: "5:45PM", slot: "5:45 PM" },
  { id: "6:00PM", slot: "6:00 PM" },
  { id: "6:15PM", slot: "6:15 PM" },
  { id: "6:30PM", slot: "6:30 PM" },
  { id: "6:45PM", slot: "6:45 PM" },
  { id: "7:00PM", slot: "7:00 PM" },
  { id: "7:15PM", slot: "7:15 PM" },
  { id: "7:30PM", slot: "7:30 PM" },
  { id: "7:45PM", slot: "7:45 PM" },
  { id: "8:00PM", slot: "8:00 PM" },
];

const RMView = () => {
  const { userData } = useRoleStore();
  const { id } = userData;

  const [selectedCommunityId, setSelectedCommunityId] = useState("");
  const [requestRmDetails, setRequestRmDetails] = useState([]);
  const [rmCommunities, setRmCommunities] = useState([]);
  const [rmStatuses, setRmStatuses] = useState([]);
  const [fieldManagers, setFieldManagers] = useState([]);

  const [currentPropDetails, setCurrentPropDetails] = useState([]);

  const [expandedProperty, setExpandedProperty] = useState(null);
  const [propDetails, setPropertyDetails] = useState({});
  const [rentAmount, setRentAmount] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const onClickPropertyId = async (propId) => {
    if (expandedProperty === propId) {
      setExpandedProperty(null);
      return;
    }
    try {
      const response = await axios.get(
        `${apiUrl}/adminPropListings?property_id=${propId}`
      );
      const details = response.data.results[0];
      console.log("details...", details);
      setPropertyDetails(details);
      setExpandedProperty(propId);
    } catch (error) {
      console.error("Error fetching property details:", error);
    }
  };

  const closeModal = () => {
    setModalData(null);
  };

  useEffect(() => {
    const fetchRmDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const responseData = await getTasks({ rmId: id });
        const result = responseData?.result || [];
        setRequestRmDetails(result);
        setRmCommunities(
          result.map((item) => item.community_name).filter(Boolean)
        );
        setRmStatuses(responseData.status || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchRmDashboardData();
  }, [id]);

  useEffect(() => {
    if (!rmCommunities.length) return;
    const fetchFmData = async () => {
      const currentCommId =
        requestRmDetails[0]?.community_id || rmCommunities[0]?.community_id;
      setLoading(true);
      try {
        const fmData = await getFmList({ community_id: currentCommId });
        setFieldManagers(fmData?.result || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch FM data");
      } finally {
        setLoading(false);
      }
    };
    fetchFmData();
  }, [rmCommunities, requestRmDetails]);

  const handleInputChange = (transactionId, field, value) => {
    setRequestRmDetails((prev) =>
      prev.map((item) =>
        item.transaction_id === transactionId
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleSave = async (transactionId) => {
    const updatedRequest = requestRmDetails.find(
      (item) => item.transaction_id === transactionId
    );
    if (!updatedRequest) return;

    try {
      const payload = {
        id: transactionId,
        cur_stat_code: parseInt(updatedRequest.curr_stat_code),
        schedule_time: updatedRequest.schedule_time || null,
        schedule_date: updatedRequest.schedule_date || null,
        fm_id: parseInt(updatedRequest.fm_id) || null,
        Inv_Amount: parseInt(rentAmount),
      };
      const response = await updateTask(payload);
      if (response) {
        alert("Request updated successfully!");
        window.location.reload();
      } else {
        alert("Failed to update request.");
      }
    } catch (error) {
      alert("An error occurred while updating the request.");
    }
  };

  const filteredRequests = selectedCommunityId
    ? requestRmDetails.filter(
        (item) => item.community_id === parseInt(selectedCommunityId)
      )
    : requestRmDetails;

  const uniqueCommunities = Array.from(
    new Set(requestRmDetails.map((item) => item.community_id))
  ).map((id) => {
    const community = requestRmDetails.find((item) => item.community_id === id);
    return { community_id: id, community_name: community?.community_name };
  });

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  return (
    <div className="bg-gray-200 min-h-screen flex flex-col">
      <header
        className={`${tailwindStyles.header} sticky top-0 w-full p-3 px-5 md:px-10 flex items-center justify-between shadow-md z-30`}
      >
        <Link to="/">
          <img
            src="/RUFRENT6.png"
            alt="logo"
            className={`${tailwindStyles.logo}`}
          />
        </Link>
        <h1 className="text-lg hidden md:flex sm:text-md md:text-xl font-bold text-center my-2 sm:my-0">
          RM Dashboard
        </h1>
        <select
          className={`${tailwindStyles.paragraph} px-2 py-1 rounded-md w-36`}
          value={selectedCommunityId}
          onChange={(e) => setSelectedCommunityId(e.target.value)}
        >
          <option value="">Select Community</option>
          {uniqueCommunities.map((community, index) => (
            <option
              key={`${community.community_id}-${index}`}
              value={community.community_id}
            >
              {community.community_name || "Unnamed Community"}
            </option>
          ))}
        </select>
      </header>

      <main className="flex-1 px-2 md:px-5 lg:px-10 py-5">
        <section className="hidden lg:block bg-gray-700 p-2 shadow rounded-t-lg text-gray-300">
          <div className="grid grid-cols-8 gap-2 py-2 text-center font-bold">
            <div>Property</div>
            <div>Owner</div>
            <div>Tenant</div>
            <div>Status</div>
            <div>Schedule</div>
            <div>Time</div>
            <div>Field Manager</div>
            <div>Action</div>
          </div>
        </section>

        {!filteredRequests || filteredRequests.length === 0 ? (
          <p className={`${tailwindStyles.heading_3} text-center py-5`}>
            No request available
          </p>
        ) : (
          <ul>
            {filteredRequests.map((request, index) => {
              const isEditable =
                request.curr_stat_code == "7" || request.curr_stat_code == "9";
              return (
                <div key={`${request.transaction_id}-${index}`}>
                  <li
                    // key={`${request.transaction_id}-${index}`}
                    className="bg-white border-t-2 p-4 shadow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 items-center"
                  >
                    <p
                      onClick={() => onClickPropertyId(request.property_id)}
                      className={`${tailwindStyles.paragraph_b} text-left cursor-pointer`}
                    >
                      <strong className="lg:hidden">Property: </strong>

                      {request.community_name}
                    </p>
                    <p className={`${tailwindStyles.paragraph_b}`}>
                      <strong className="lg:hidden">Owner: </strong>
                      {request.owner_name} - {request.owner_mobile || "xxxxxx"}
                    </p>
                    <p className={`${tailwindStyles.paragraph_b}`}>
                      <strong className="lg:hidden">Tenant: </strong>
                      {request.tenant_name} -{" "}
                      {request.tenant_mobile || "xxxxxx"}
                    </p>
                    <div
                      className={`${tailwindStyles.paragraph_b} flex  items-center space-x-2 space-y-2`}
                    >
                      <strong className="lg:hidden">Status: </strong>
                      <SearchableDropdown
                        name="curr_stat_code"
                        options={rmStatuses}
                        value={request.curr_stat_code || ""}
                        onChange={handleInputChange}
                        placeholder="Search Status"
                        displayKey="status_code"
                        valueKey="id"
                        transactionId={request.transaction_id}
                        currentStatusId={request.curr_stat_code_id}
                        className={`${tailwindStyles.paragraph_b} w-full`}
                      />
                      {request.curr_stat_code == "18" && (
                        <div
                          className={`${tailwindStyles.paragraph_b} flex items-center`}
                        >
                          <strong className="lg:hidden">Rental Amount: </strong>
                          <input
                            type="number"
                            placeholder="Rental Amount"
                            className={`${tailwindStyles.paragraph_b} border border-gray-300 rounded-lg px-2 py-1 w-full `}
                            onChange={(e) => setRentAmount(e.target.value)}
                          />
                        </div>
                      )}
                    </div>
                    <div
                      className={`${tailwindStyles.paragraph_b} flex items-center space-x-2`}
                    >
                      <strong className="lg:hidden">Schedule: </strong>
                      <input
                        type="date"
                        className={`${tailwindStyles.paragraph_b} border border-gray-300 rounded-lg px-2 py-1 w-full ${!isEditable && "bg-gray-200 cursor-not-allowed"}`}
                        min={new Date().toISOString().split("T")[0]}
                        max={
                          new Date(
                            new Date().setMonth(new Date().getMonth() + 1)
                          )
                            .toISOString()
                            .split("T")[0]
                        }
                        value={request.schedule_date}
                        onChange={(e) =>
                          isEditable &&
                          handleInputChange(
                            request.transaction_id,
                            "schedule_date",
                            e.target.value
                          )
                        }
                        disabled={!isEditable}
                      />
                    </div>
                    <div
                      className={`${tailwindStyles.paragraph_b} flex items-center space-x-2`}
                    >
                      <strong className="lg:hidden">Time: </strong>
                      <SearchableDropdown
                        name="schedule_time"
                        options={timeSlots}
                        value={request.schedule_time}
                        onChange={handleInputChange}
                        placeholder="Set Time"
                        displayKey="slot"
                        valueKey="id"
                        transactionId={request.transaction_id}
                        disabled={!isEditable}
                        className={`${tailwindStyles.paragraph_b} w-full`}
                      />
                    </div>
                    <div
                      className={`${tailwindStyles.paragraph_b} flex items-center space-x-2`}
                    >
                      <strong className="lg:hidden">FM: </strong>
                      <select
                        className={`${tailwindStyles.paragraph_b} border border-gray-300 rounded-md p-1 w-full`}
                        value={request.fm_id || ""}
                        onChange={(e) =>
                          handleInputChange(
                            request.transaction_id,
                            "fm_id",
                            e.target.value
                          )
                        }
                        disabled={!isEditable}
                      >
                        <option value="">Select FM</option>
                        {fieldManagers.map((fm) => (
                          <option key={fm.fm_id} value={fm.fm_id}>
                            {fm.fm_name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      className={`${tailwindStyles.secondaryButton}`}
                      onClick={() => handleSave(request.transaction_id)}
                    >
                      Save
                    </button>
                  </li>
                  {expandedProperty === request.property_id && propDetails && (
                    <div className={`bg-white mb-4 p-4`}>
                      <h2
                        className={`${tailwindStyles.heading_3} mb-4 text-center`}
                      >
                        Property Details
                      </h2>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <p className={tailwindStyles.paragraph}>
                          <strong>ID:</strong> {propDetails.id}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Name:</strong> {propDetails.community_name}
                        </p>

                        <p className={tailwindStyles.paragraph}>
                          <strong>Rental Range:</strong>{" "}
                          {propDetails.rental_low
                            ? `${propDetails.rental_low}-${propDetails.rental_high}`
                            : propDetails.rental_high}{" "}
                          INR
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Property Type:</strong>{" "}
                          {propDetails.prop_type}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Flat No:</strong>{" "}
                          {propDetails.flat_no || "N/A"}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Floor No:</strong> {propDetails.floor_no}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Tower No:</strong>{" "}
                          {propDetails.tower_no || "N/A"}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Home Type:</strong> {propDetails.home_type}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Description:</strong> {propDetails.prop_desc}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Community:</strong>{" "}
                          {propDetails.community_name}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Status:</strong> {propDetails.current_status}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Total Area:</strong> {propDetails.total_area}{" "}
                          acres
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Open Area:</strong> {propDetails.open_area}%
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Blocks:</strong> {propDetails.nblocks}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Floors/Block:</strong>{" "}
                          {propDetails.nfloors_per_block}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Houses/Floor:</strong>{" "}
                          {propDetails.nhouses_per_floor}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Total Flats:</strong> {propDetails.totflats}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Bathrooms:</strong> {propDetails.nbaths}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Balconies:</strong>{" "}
                          {propDetails.nbalcony || "N/A"}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Eating Pref:</strong> {propDetails.eat_pref}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Parking:</strong> {propDetails.parking_count}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Deposit:</strong> {propDetails.deposit_amount}{" "}
                          INR
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Maintenance:</strong>{" "}
                          {propDetails.maintenance_type}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Available:</strong>{" "}
                          {propDetails.available_date}
                        </p>
                        <p className={tailwindStyles.paragraph}>
                          <strong>Address:</strong> {propDetails.address}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
};

export default RMView;
