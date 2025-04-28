import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import axios from "axios";
//import bellImage from "../../assets/images/bell.png";
import tailwindStyles from "../../../utils/tailwindStyles"; // Import Tailwind styles

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const formatDateForUI = (date) => {
  if (!date) return "";
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
};

const formatDateForPayload = (date) => {
  if (!date) return "";
  const day = String(date.getDate()).padStart(2, "0");
  const shortMonth = date.toLocaleString("en-US", { month: "short" });
  const year = date.getFullYear();
  return `${day}-${shortMonth}-${year}`;
};

// Function to calculate the display date (next month's date minus 5 days)
const calculateDisplayDate = (startDate) => {
  if (!startDate) return "";

  // Parse the start date from the backend (assuming it's in the format 'dd-MMM-yyyy')
  const [day, month, year] = startDate.split("-");
  const dateObj = new Date(`${month} ${day}, ${year}`);

  // Calculate the date for the next month minus 5 days
  const nextMonth = new Date(
    dateObj.getFullYear(),
    dateObj.getMonth() + 1,
    dateObj.getDate()
  );
  const displayDate = new Date(nextMonth);
  displayDate.setDate(nextMonth.getDate() - 5);

  return formatDateForUI(displayDate);
};

const Rental = ({ receiptId, userId, serviceDetails }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Determine service status based on the serviceDetails prop
  const isServiceFound = serviceDetails.some((service) => service.svc_id === 5);
  const serviceStatus = isServiceFound ? "Requested" : "Available";
  const serviceDetail = serviceDetails.find((service) => service.svc_id === 5);

  // Calculate the display date for the UI
  const displayDate = serviceDetail?.svc_info
    ? calculateDisplayDate(serviceDetail.svc_info["Slot Date"])
    : "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate) return;

    const svcInfo = {
      "Slot Date": formatDateForPayload(selectedDate),
    };

    const serviceData = {
      receipt_id: receiptId,
      svc_id: 5,
      package_id: 1,
      svc_info: JSON.stringify(svcInfo),
      claimed_by: userId,
      claimer_cat: "tenant",
      serviced_date: null,
      serviced_slot: null,
    };

    try {
      const response = await axios.post(`${apiUrl}/claimservices`, serviceData);
      console.log("response", response);
      if (response.status === 201) {
        // Reload the page to reflect the updated status from the backend
        window.location.reload();
      } else {
        console.error("Failed to claim service:", response.data.message);
      }
    } catch (error) {
      console.error(
        "Error creating service:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div
      className={`max-w-md mx-auto  p-4 sm:p-2 ${tailwindStyles.whiteCard} min-h-[210px] max-h-[210px] rounded-lg shadow-lg relative`}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between px-1 py-2 rounded-t-lg flex-nowrap gap-1 sm:gap-3">
        <div className="flex items-center min-w-0 space-x-3">
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg shrink-0">
            <img
              src="/Package/Package_Image_6.png"
              alt="Rental Reminder"
              className="w-7 h-7"
            />
          </div>
          <h2
            className={`text-sm sm:text-lg font-semibold min-w-0 ${tailwindStyles.heading}`}
          >
            Rental Reminder
          </h2>
        </div>
        {/* Status Badge */}
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
            serviceStatus === "Requested"
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {serviceStatus}
        </span>
      </div>

      {/* Content Section */}
      {serviceStatus === "Requested" ? (
        <div className="p-3">
          <h2
            className={`text-md font-semibold mb-1 ${tailwindStyles.heading_3}`}
          >
            Rental Reminder is Active Now !
          </h2>
          <p className={`text-sm ${tailwindStyles.paragraph}`}>
            You will be reminded about your rent on {displayDate}.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker Input */}
          <div className="space-y-2">
            <label
              className={`pl-2 font-semibold text-left block ${tailwindStyles.heading}`}
            >
              Please Select Reminder Date
            </label>
            <div
              className="border border-gray-300 rounded-md p-1 flex items-center justify-between cursor-pointer"
              onClick={() => setCalendarOpen(true)}
            >
              <span className="text-sm ml-2 text-gray-500">
                {selectedDate
                  ? formatDateForUI(selectedDate)
                  : "No date selected"}
              </span>
              <span role="img" aria-label="calendar" className="text-xl">
                📅
              </span>
            </div>
          </div>

          {/* Claim Now Button */}
          <button
            type="submit"
            disabled={!selectedDate}
            className={`w-full py-2 sm:py-1 rounded-md font-semibold transition duration-300 focus:outline-none ${
              selectedDate
                ? `${tailwindStyles.secondaryButton}`
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Claim Now
          </button>
        </form>
      )}

      {/* Calendar Modal */}
      {calendarOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setCalendarOpen(false)}
          ></div>
          <div className="relative bg-white p-4 rounded shadow-lg z-10 w-full max-w-sm mx-4">
            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={(date) => {
                setSelectedDate(date);
                setCalendarOpen(false);
              }}
            />
            <button
              onClick={() => setCalendarOpen(false)}
              className={`mt-4 w-full py-2 font-semibold ${tailwindStyles.secondaryButton}`}
            >
              Close Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rental;
