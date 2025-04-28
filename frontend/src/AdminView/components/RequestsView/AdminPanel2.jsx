import React, { useState, useEffect } from "react";

import { updateRequest } from "../../../services/adminapiservices";

const AdminPanel = ({
  cities,
  communities,
  onCityChange,
  records,
  status,
  rmfm,
  requestsLoading,
}) => {
  const [updateRecords, setUpdateRecords] = useState({});
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedCommunity, setSelectedCommunity] = useState("");
  const [selectedRm, setSelectedRm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  const applyFilters = (records, communityId, rmId) => {
    let updatedRecords = records;

    if (communityId) {
      updatedRecords = updatedRecords.filter(
        (record) => record.community_id === parseInt(communityId)
      );
    }

    if (rmId) {
      updatedRecords = updatedRecords.filter((record) => record.rm_id == rmId);
    }
    return updatedRecords;
  };

  // Apply filters whenever records, selectedCommunity, or selectedRm change
  useEffect(() => {
    const filtered = applyFilters(records, selectedCommunity, selectedRm);
    setFilteredRecords(filtered);
  }, [records, selectedCommunity, selectedRm]);

  const handleCommunityChange = (communityId) => {
    setSelectedCommunity(communityId);
  };

  const handleRmChange = (transactionId, rmId) => {
    setUpdateRecords((prev) => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        updatedRm: rmId,
      },
    }));
  };

  const handleTopRmChange = (rmId) => {
    setSelectedRm(rmId);
  };

  const handleFmChange = (transactionId, fmId) => {
    console.log("fmid", fmId);
    setUpdateRecords((prev) => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        updatedFm: fmId,
      },
    }));
  };

  const handleStatusChange = (transactionId, statusId) => {
    setUpdateRecords((prev) => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        currentStatus: statusId,
      },
    }));
  };

  const handleScheduleChange = (transactionId, key, value) => {
    setUpdateRecords((prev) => ({
      ...prev,
      [transactionId]: {
        ...prev[transactionId],
        [key]: value,
      },
    }));
  };

  const handleUpdateClick = (transactionId) => {
    const updatedRecord = updateRecords[transactionId];
    updateRequest(transactionId, updatedRecord || {});
  };

  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
  const startIndex = (currentPage - 1) * recordsPerPage;
  const currentRecords = filteredRecords.slice(
    startIndex,
    startIndex + recordsPerPage
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const uniqueRms = [...new Set(rmfm.map((item) => item.rm_id))].map((rm_id) =>
    rmfm.find((item) => item.rm_id === rm_id)
  );
  return (
    <div className="px-6 pb-6">
      <div className="shadow-sm  w-full">
        <div className="flex items-center gap-4 py-6 justify-between overflow-auto">
          <h3 className="text-lg  font-medium text-gray-900">Requests</h3>
          <div className="flex ml-auto items-center space-x-5">
            <select
              value={selectedRm || ""}
              className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 border border-gray-300"
              onChange={(e) => handleTopRmChange(e.target.value)}
            >
              <option value="">Select RM</option>
              {uniqueRms?.map((item) => (
                <option key={item.rm_id} value={item.rm_id}>
                  {item.rm_name}
                </option>
              ))}
            </select>
            <select
              className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 border border-gray-300"
              onChange={(e) => onCityChange(e.target.value)}
            >
              <option value="">Select City</option>
              {cities?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            <select
              value={selectedCommunity || ""}
              className="px-2 py-1 text-xs font-semibold rounded bg-gray-100 border border-gray-300"
              onChange={(e) => handleCommunityChange(e.target.value)}
            >
              <option value="">Select Community</option>
              {communities?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="w-full overflow-auto max-h-[calc(100vh-210px)] rounded-lg border">
          {requestsLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-14 w-full bg-gray-300 animate-pulse rounded"
                ></div>
              ))}
            </div>
          ) : (
            <table>
              <thead className="sticky top-0 z-10">
                <tr className="border-b bg-gray-50">
                  <th className="w-auto whitespace-nowrap px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Request ID
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Community
                  </th>
                  <th className="w-auto whitespace-nowrap px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Tenant Details
                  </th>
                  <th className="w-auto whitespace-nowrap px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Owner Details
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Status
                  </th>

                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    RM
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    FM
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentRecords.map((record) => (
                  <tr key={record.transaction_id} className="hover:bg-gray-100">
                    <td className="px-6 py-2 text-sm text-gray-900 text-center">
                      {record.transaction_id}
                    </td>
                    <td className="px-6 py-2 text-sm text-gray-900">
                      {record.community_name || "N/A"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.tenant_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.tenant_mobile}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {record.owner_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {record.owner_mobile}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={
                          updateRecords[record.transaction_id]?.currentStatus ||
                          record.curr_stat_code_id
                        }
                        onChange={(e) =>
                          handleStatusChange(
                            record.transaction_id,
                            e.target.value
                          )
                        }
                        className="px-2 py-1 text-xs rounded border border-gray-300"
                      >
                        {status?.map((statusItem, index) => (
                          <option
                            key={`${statusItem.id}-${index}`}
                            value={statusItem.id}
                          >
                            {statusItem.status_code}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={
                          updateRecords[record.transaction_id]?.updatedRm ||
                          record.rm_id
                        }
                        className="px-2 py-1 text-xs rounded border border-gray-300"
                        onChange={(e) =>
                          handleRmChange(record.transaction_id, e.target.value)
                        }
                      >
                        {rmfm?.map((rmItem, index) => (
                          <option
                            key={`${rmItem.rm_id}-${index}`}
                            value={rmItem.rm_id}
                          >
                            {rmItem.rm_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={
                          updateRecords[record.transaction_id]?.updatedFm ||
                          record.fm_id
                        }
                        className="px-2 py-1 text-xs rounded border border-gray-300"
                        onChange={(e) =>
                          handleFmChange(record.transaction_id, e.target.value)
                        }
                      >
                        {rmfm?.map((fmItem, index) => (
                          <option
                            key={`${fmItem.fm_id}-${index}`}
                            value={fmItem.fm_id}
                          >
                            {fmItem.fm_name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-5 flex gap-1">
                      <input
                        type="date"
                        defaultValue={record.schedule_date}
                        onChange={(e) =>
                          handleScheduleChange(
                            record.transaction_id,
                            "updatedScheduleDate",
                            e.target.value
                          )
                        }
                        className="border text-sm rounded px-2 py-1  w-full"
                      />
                      <input
                        type="time"
                        defaultValue={record.schedule_time}
                        onChange={(e) =>
                          handleScheduleChange(
                            record.transaction_id,
                            "updatedScheduleTime",
                            e.target.value
                          )
                        }
                        className="border text-sm rounded px-2 py-1 w-full"
                      />
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleUpdateClick(record.transaction_id)}
                        className="text-green-600 hover:underline"
                      >
                        &#10004;
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination Section */}
          <div className="flex justify-between p-5">
            <button
              onClick={handlePreviousPage}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="flex space-x-2">
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageClick(index + 1)}
                  className={`px-3 py-2 rounded ${
                    index + 1 === currentPage
                      ? "bg-blue-500 text-white font-bold"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            <button
              onClick={handleNextPage}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
