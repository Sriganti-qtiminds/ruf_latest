



import React, { useEffect, useState } from "react";
import { fetchTables, fetchTableData, saveRecords, deleteTableRecords } from "../../../services/adminapiservices";


const DBTables = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Fetch tables on mount
  useEffect(() => {
    const getTables = async () => {
      setLoading(true);
      try {
        const data = await fetchTables();
        console.log("fetchTables data:", data);
        setTables(data);
      } catch (err) {
        console.error("Error fetching tables:", err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    getTables();
  }, []);

  // Fetch table data when a table is selected
  const handleTableChange = async (event) => {
    const selected = event.target.value;
    setSelectedTable(selected);
    setLoading(true);
    try {
      const { result, headers } = await fetchTableData(selected);
      console.log("fetchTableData data:", { result, headers });
      setTableHeaders(headers);
      setTableData(result);
    } catch (err) {
      console.error("Error fetching table data:", err.message);
      setError(err.message);
      setTableHeaders([]);
      setTableData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (rowIndex) => {
    const updatedSelectedRows = new Set(selectedRows);
    if (updatedSelectedRows.has(rowIndex)) {
      updatedSelectedRows.delete(rowIndex);
    } else {
      updatedSelectedRows.add(rowIndex);
    }
    setSelectedRows(updatedSelectedRows);
  };

  // Handle cell changes
  const handleCellChange = (event, rowIndex, header) => {
    const value = event.target.value;
    setTableData((prevData) => {
      const newData = [...prevData];
      newData[rowIndex] = { ...newData[rowIndex], [header]: value };
      return newData;
    });
  };

  // Save changes
  const handleSave = async () => {
    if (selectedRows.size === 0) {
      alert("Please select at least one row to save.");
      return;
    }
    try {
      const result = await saveRecords(selectedTable, selectedRows, tableData);
      if (result.success) {
        alert("Save operation successful!");
        setSelectedRows(new Set());
        // Refresh table data
        const { result: newData, headers } = await fetchTableData(selectedTable);
        setTableHeaders(headers);
        setTableData(newData);
      } else {
        throw new Error(result.error || "Failed to save records");
      }
    } catch (err) {
      console.error("Save operation failed:", err.message);
      alert("Failed to save changes. Please try again.");
    }
  };

  // Delete selected rows
  const handleDeleteRows = async () => {
    if (selectedRows.size === 0) {
      alert("Please select at least one row to delete.");
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to delete the selected rows?"
    );
    if (!confirmed) return;

    try {
      const result = await deleteTableRecords(selectedTable, selectedRows, tableData);
      if (result.success) {
        alert("Selected rows deleted successfully.");
        setTableData(tableData.filter((_, index) => !selectedRows.has(index)));
        setSelectedRows(new Set());
      } else {
        alert(`Failed to delete ${result.failed.length} row(s).`);
      }
    } catch (err) {
      console.error("Delete operation failed:", err.message);
      alert("Failed to delete rows. Please try again.");
    }
  };

  // Add a new row
  const handleAddRow = () => {
    const newRow = {};
    tableHeaders.forEach((header) => {
      newRow[header] = header.toLowerCase() === "id" ? null : "";
    });
    setTableData((prevData) => [newRow, ...prevData]);
  };

  if (loading) return <p className="text-center text-gray-600">Loading...</p>;
  if (error) return <p className="text-center text-red-600">Error: {error}</p>;

  return (
    <div className="bg-white h-[calc(100vh-110px)] rounded-lg shadow m-5">
      <div className="px-6 pb-6">
        <div className="flex items-center gap-4 py-6 justify-between overflow-auto">
          <div className="flex items-center space-x-3">
            <h1 className="text-base font-semibold text-gray-700">
              Select a Table
            </h1>
            <select
              id="tableDropdown"
              onChange={handleTableChange}
              value={selectedTable}
              className="w-60 text-sm p-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option value="">-- Choose a Table --</option>
              {Array.isArray(tables) ? (
                tables.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))
              ) : (
                <option disabled>No tables available</option>
              )}
            </select>
          </div>
          {selectedTable && (
            <div className="flex gap-4">
              <button
                className="bg-green-500 text-white px-4 py-2 rounded text-sm hover:bg-green-600"
                onClick={handleAddRow}
              >
                Add
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600"
                onClick={handleSave}
              >
                Save
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded text-sm hover:bg-red-600"
                onClick={handleDeleteRows}
              >
                Delete
              </button>
            </div>
          )}
        </div>

        {selectedTable && (
          <div className="overflow-auto max-h-[calc(100vh-230px)] rounded-lg border">
            {tableHeaders.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b bg-gray-200">
                    <th className="px-1 py-3 text-center text-sm font-semibold w-auto whitespace-nowrap">
                      Select
                    </th>
                    {Array.isArray(tableHeaders) ? (
                      tableHeaders.map((header) => (
                        <th
                          key={header}
                          className="px-1 py-3 text-center text-sm font-semibold w-auto whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))
                    ) : (
                      <th>No headers available</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {Array.isArray(tableData) ? (
                    tableData.map((row, rowIndex) => (
                      <tr key={rowIndex} className="hover:bg-gray-50">
                        <td className="px-1 py-4 text-sm text-gray-900 text-center">
                          <input
                            type="checkbox"
                            checked={selectedRows.has(rowIndex)}
                            onChange={() => handleCheckboxChange(rowIndex)}
                          />
                        </td>
                        {Array.isArray(tableHeaders) ? (
                          tableHeaders.map((header) => (
                            <td
                              key={header}
                              className="px-1 py-4 text-sm text-gray-900 text-center"
                            >
                              {selectedRows.has(rowIndex) ? (
                                header.toLowerCase() === "id" ? (
                                  row[header]
                                ) : (
                                  <input
                                    type="text"
                                    value={row[header] || ""}
                                    onChange={(e) =>
                                      handleCellChange(e, rowIndex, header)
                                    }
                                    className="px-2 py-3 border border-gray-300 rounded w-full whitespace-nowrap"
                                  />
                                )
                              ) : (
                                row[header] || ""
                              )}
                            </td>
                          ))
                        ) : (
                          <td>No data available</td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={tableHeaders.length + 1} className="text-center text-gray-600">
                        No data available for the selected table.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            ) : (
              <p className="text-center text-gray-600">
                No data available for the selected table.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DBTables;
