import React, { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/dist/style.css";
import axios from "axios";

import tailwindStyles from "../../../utils/tailwindStyles";

const apiUrl = `${import.meta.env.VITE_API_URL}`;

const Photoshoot = ({ receiptId, userId, serviceDetails, address }) => {
  // State declarations
  const [appointmentBlocks, setAppointmentBlocks] = useState([
    { selectedDate: null, selectedTimeSlot: null },
    { selectedDate: null, selectedTimeSlot: null },
    { selectedDate: null, selectedTimeSlot: null },
  ]);
  const [isConfirmed, setIsConfirmed] = useState(false);
  // const [address, setAddress] = useState(""); // Initialize address as an empty string
  const [editableAddress, setEditableAddress] = useState(address || "");
  const [calendarBlockIndex, setCalendarBlockIndex] = useState(null);

  // Check if service with svc_id 2 exists in the passed serviceDetails.
  const isServiceFound = serviceDetails?.some(
    (service) => service.svc_id === 2
  );

  // If service is found, set isConfirmed to true and load the details from the database
  if (isServiceFound && !isConfirmed) {
    setIsConfirmed(true);
  }

  // Utility to format a date for display in the UI
  const formatDateForUI = (date) => {
    if (!date) return "";
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  // Utility to format a date in "DD-MMM-YYYY" (e.g., "09-Mar-2025")
  const formatDateForPayload = (date) => {
    if (!date) return "";
    const day = String(date.getDate()).padStart(2, "0");
    const shortMonth = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    return `${day}-${shortMonth}-${year}`;
  };

  // Set the selected time slot for a block.
  const handleTimeSlotSelectForBlock = (blockIndex, slot) => {
    setAppointmentBlocks((prevBlocks) => {
      const updated = [...prevBlocks];
      updated[blockIndex].selectedTimeSlot = slot;
      return updated;
    });
  };

  // Remove the selected date from a block.
  const handleRemoveDate = (blockIndex) => {
    setAppointmentBlocks((prevBlocks) => {
      const updated = [...prevBlocks];
      updated[blockIndex].selectedDate = null;
      return updated;
    });
  };

  // Remove the selected time slot from a block.
  const handleRemoveTimeSlot = (blockIndex) => {
    setAppointmentBlocks((prevBlocks) => {
      const updated = [...prevBlocks];
      updated[blockIndex].selectedTimeSlot = null;
      return updated;
    });
  };

  // Form is valid if every block has a selected date, time slot, and address is not empty.
  const isFormValid =
    appointmentBlocks.every(
      (block) => block.selectedDate && block.selectedTimeSlot
    ) && editableAddress; // Ensure address is not empty

  // Handle form submission: one appointment per block.
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;

    const formatTimeSlot = (slot) => {
      if (slot === "slot1") return "Morning";
      if (slot === "slot2") return "Afternoon";
      if (slot === "slot3") return "Anytime";
      return "";
    };

    // Build svc_info object using formatDateForPayload.
    const svcInfo = {
      "First Slot Date": formatDateForPayload(
        appointmentBlocks[0]?.selectedDate
      ),
      "First Slot Time": formatTimeSlot(appointmentBlocks[0]?.selectedTimeSlot),
      "Second Slot Date": formatDateForPayload(
        appointmentBlocks[1]?.selectedDate
      ),
      "Second Slot Time": formatTimeSlot(
        appointmentBlocks[1]?.selectedTimeSlot
      ),
      "Third Slot Date": formatDateForPayload(
        appointmentBlocks[2]?.selectedDate
      ),
      "Third Slot Time": formatTimeSlot(appointmentBlocks[2]?.selectedTimeSlot),
      Address: editableAddress, // Include address in the payload
    };

    // Build final payload.
    const serviceData = {
      receipt_id: receiptId,
      svc_id: 2,
      package_id: 1,
      svc_info: JSON.stringify(svcInfo),
      claimed_by: userId,
      claimer_cat: "tenant",
      serviced_date: null,
      serviced_slot: null,
    };

    try {
      // POST the data to the API endpoint.
      const response = await axios.post(`${apiUrl}/claimservices`, serviceData);
      console.log("Service Created:", response.data);

      // Reload the page to reflect the changes
      window.location.reload();
    } catch (error) {
      console.error(
        "Error creating service:",
        error.response?.data || error.message
      );
    }
  };

  const svcInfo = serviceDetails?.find(
    (service) => service.svc_id === 2
  )?.svc_info;
  const parsedSvcInfo =
    typeof svcInfo === "string" ? JSON.parse(svcInfo) : svcInfo;

  return (
    <div
      className={`max-w-md mx-auto  p-4 sm:p-2 ${tailwindStyles.whiteCard} md:min-h[500px] md:max-h-[500px] rounded-lg shadow-lg relative`}
    >
      {/* Header with white background, black text, and a right-aligned status badge */}
      <div className="flex items-center justify-between px-1 py-2 rounded-t-lg flex-nowrap gap-1 sm:gap-3">
        {/* Icon + Title */}
        <div className="flex items-center min-w-0 space-x-3">
          <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded-lg shrink-0 ">
            <img
              src="/Package/Package_Image_2.png"
              alt="photoshoot"
              className="w-7 h-7"
            />
          </div>
          <h2
            className={`text-sm sm:text-lg font-semibold min-w-0 ${tailwindStyles.heading}`}
          >
            Photoshoot
          </h2>
        </div>

        {/* Status Badge - Responsive Sizing */}
        <span
          className={`inline-flex items-center justify-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium whitespace-nowrap shrink-0 ${
            isServiceFound
              ? "bg-yellow-100 text-yellow-800"
              : "bg-green-100 text-green-800"
          }`}
        >
          {isServiceFound ? "Requested" : "Available"}
        </span>
      </div>

      {/* If the appointment is not confirmed (!isConfirmed), the form appears.
Otherwise, a confirmation message is shown. */}
      {!isServiceFound ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Address Section */}
          <div className="flex flex-col sm:flex-row items-center bg-gray-50 p-3 sm:p-4 rounded-md">
            <label
              className={`text-md font-semibold mb-2 sm:mb-0 sm:mr-4 ${tailwindStyles.heading_3}`}
            >
              Address:
            </label>
            <input
              type="text"
              value={editableAddress}
              onChange={(e) => setEditableAddress(e.target.value)}
              placeholder="Enter your address"
              className="text-sm text-center sm:text-left text-gray-900 bg-transparent border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-[70%]"
              disabled={address !== undefined && address !== null}
            />
          </div>

          {/* Table for Date and Time Slots */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-2 py-2 text-center font-semibold">
                    Select Date
                  </th>
                  <th className="px-2 py-2 text-center font-semibold">
                    Book a Slot
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {appointmentBlocks.map((block, index) => (
                  <tr key={index}>
                    {/* Date Selection */}
                    <td className="px-2 py-2">
                      <div
                        className="border border-gray-300 rounded-md p-2 flex items-center justify-between cursor-pointer"
                        onClick={() => setCalendarBlockIndex(index)}
                      >
                        <span className="text-sm">
                          {block.selectedDate
                            ? formatDateForUI(block.selectedDate)
                            : "No date selected"}
                        </span>
                        <span
                          role="img"
                          aria-label="calendar"
                          className="text-xl"
                        >
                          📅
                        </span>
                      </div>
                      {block.selectedDate && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveDate(index);
                          }}
                          className="text-blue-400 hover:text-blue-600 text-xs mt-1"
                        >
                          Remove Date
                        </button>
                      )}
                    </td>

                    {/* Dropdown for selecting time slot */}
                    <td className="px-2 py-2 text-center">
                      <select
                        value={block.selectedTimeSlot || ""}
                        onChange={(e) =>
                          handleTimeSlotSelectForBlock(index, e.target.value)
                        }
                        className="border border-gray-300 rounded-md p-2 w-full text-sm"
                      >
                        <option value="">Select a slot</option>
                        <option value="slot1">Morning</option>
                        <option value="slot2">Afternoon</option>
                        <option value="slot3">Anytime</option>
                      </select>
                      {block.selectedTimeSlot && (
                        <button
                          type="button"
                          onClick={() => handleRemoveTimeSlot(index)}
                          className="text-blue-400 hover:text-blue-600 text-xs mt-1"
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Claim Now Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className={`w-full py-2 rounded-md font-semibold transition duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isFormValid
                ? "bg-blue-500 text-white hover:bg-blue-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Claim Now
          </button>
        </form>
      ) : (
        <div className="text-center">
          <div className="mb-6 bg-gray-50 p-4 rounded-md text-left max-h-64 overflow-y-auto">
            <p className="font-medium mb-2 text-md">
              You've scheduled{" "}
              {parsedSvcInfo ? (Object.keys(parsedSvcInfo).length - 1) / 2 : 0}{" "}
              appointment(s):
            </p>

            <ul className="space-y-2 text-sm">
              <li className="font-medium text-sm">
                Address: {parsedSvcInfo?.Address || ""}
              </li>
              {parsedSvcInfo &&
                Object.entries(parsedSvcInfo).map(
                  ([key, value], index) =>
                    key.includes("Date") && (
                      <li
                        key={index}
                        className="border-b border-gray-100 pb-2 last:border-0"
                      >
                        <span className="inline-block w-6 h-6 text-xs bg-blue-600 text-white rounded-full text-center leading-6 mr-2">
                          {(index + 1) / 2}
                        </span>
                        <span className="font-medium">
                          {parsedSvcInfo[key]}
                        </span>{" "}
                        at{" "}
                        <span>
                          {parsedSvcInfo[key.replace("Date", "Time")]}
                        </span>
                      </li>
                    )
                )}
            </ul>
          </div>
        </div>
      )}

      {/* Calendar Modal */}
      {calendarBlockIndex !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black opacity-50"
            onClick={() => setCalendarBlockIndex(null)}
          ></div>
          <div className="relative bg-white p-4 rounded shadow-lg z-10 w-full max-w-sm mx-4">
            <DayPicker
              mode="single"
              selected={appointmentBlocks[calendarBlockIndex].selectedDate}
              onSelect={(date) => {
                setAppointmentBlocks((prevBlocks) => {
                  const updated = [...prevBlocks];
                  updated[calendarBlockIndex].selectedDate = date;
                  return updated;
                });
              }}
            />
            <button
              onClick={() => setCalendarBlockIndex(null)}
              className="mt-4 w-full py-2 font-semibold bg-blue-500 text-white rounded hover:bg-blue-600 transition"
            >
              Close Calendar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photoshoot;
