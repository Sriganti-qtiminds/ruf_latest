import React, { useEffect, useState } from "react";
import axios from "axios";

const apiUrl = `${import.meta.env.VITE_API_URL}`;
const DBTables = () => {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [tableHeaders, setTableHeaders] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRows, setSelectedRows] = useState(new Set());

  // Fetch available tables on mount
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const response = await axios.get(`${apiUrl}/admin-st-tables`);
        setTables(response.data.tables || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTables();
  }, []);

  // Fetch table data when a table is selected
  const handleTableChange = async (event) => {
    const selected = event.target.value;
    setSelectedTable(selected);
    if (selected) {
      setLoading(true);
      try {
        const response = await axios.get(
          `${apiUrl}/getRecords?tableName=${selected}&fieldNames=*`
        );
        if (response.data.result.length > 0) {
          setTableHeaders(Object.keys(response.data.result[0]));
          setTableData(response.data.result);
        } else {
          setTableHeaders([]);
          setTableData([]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    } else {
      setTableHeaders([]);
      setTableData([]);
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

  // Save changes (handles both POST and PUT)
  const handleSave = async () => {
    try {
      for (const rowIndex of selectedRows) {
        const row = tableData[rowIndex];
        if (row.id && Number.isInteger(row.id)) {
          // PUT request for rows with valid IDs
          await axios.put(`${apiUrl}/updateRecord`, {
            tableName: selectedTable,
            fieldValuePairs: row,
            whereCondition: `id=${row.id}`,
          });
        } else {
          // POST request for rows with missing or invalid IDs
          const maxId = Math.max(...tableData.map((r) => (r.id ? r.id : 0)));
          row.id = maxId + 1;
          await axios.post(`${apiUrl}/addNewRecord`, {
            tableName: selectedTable,
            fieldNames: Object.keys(row).join(","),
            //fieldValues: Object.values(row).join(","),
            fieldValues: Object.values(row)
              .map((value) => `'${value}'`)
              .join(","),
          });
        }
      }

      alert("Save operation successful!");
      setSelectedRows(new Set());
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

    const updatedTableData = [...tableData];
    const failedDeletes = [];

    for (const rowIndex of selectedRows) {
      const rowId = tableData[rowIndex]?.id;
      if (!rowId) {
        failedDeletes.push(rowIndex);
        continue;
      }

      try {
        await axios.delete(`${apiUrl}/deleteRecord`, {
          data: {
            tableName: selectedTable,
            whereCondition: `id=${rowId}`,
          },
        });
        updatedTableData[rowIndex] = null; // Mark row as deleted
      } catch (err) {
        console.error(`Failed to delete row with ID ${rowId}:`, err.message);
        failedDeletes.push(rowIndex);
      }
    }

    setTableData(updatedTableData.filter((row) => row !== null));
    setSelectedRows(new Set());

    if (failedDeletes.length > 0) {
      alert(`Failed to delete ${failedDeletes.length} row(s).`);
    } else {
      alert("Selected rows deleted successfully.");
    }
  };

  // Add a new row
  const handleAddRow = () => {
    const newRow = {};
    tableHeaders.forEach((header) => {
      newRow[header] = header.toLowerCase() === "id" ? null : ""; // Set ID to null, others to empty
    });
    // setTableData((prevData) => [...prevData, newRow]);
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
              {tables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
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
          <div className="overflow-auto max-h-[calc(100vh-230px)] rounded-lg border ">
            {tableHeaders.length > 0 ? (
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b bg-gray-200">
                    <th className="px-1 py-3 text-center text-sm font-semibold w-auto whitespace-nowrap">
                      Select
                    </th>
                    {tableHeaders.map((header) => (
                      <th
                        key={header}
                        className="px-1 py-3 text-center text-sm font-semibold w-auto whitespace-nowrap"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {tableData.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      <td className="px-1 py-4 text-sm text-gray-900 text-center">
                        <input
                          type="checkbox"
                          checked={selectedRows.has(rowIndex)}
                          onChange={() => handleCheckboxChange(rowIndex)}
                        />
                      </td>
                      {tableHeaders.map((header) => (
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
                                value={row[header]}
                                onChange={(e) =>
                                  handleCellChange(e, rowIndex, header)
                                }
                                className="px-2 py-3 border border-gray-300 rounded w-full whitespace-nowrap"
                              />
                            )
                          ) : (
                            row[header]
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
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
