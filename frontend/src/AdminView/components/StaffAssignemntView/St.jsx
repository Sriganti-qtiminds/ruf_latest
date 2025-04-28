import React, { useState, useEffect } from "react";
import axios from "axios";
const apiUrl = `${import.meta.env.VITE_API_URL}`;

import { fetchid, fetchRMs, fetchBuilders,fetchCities, fetchCommunities } from "./newApiServices";
import ConfirmationDialog from "./ConfirmationDialog";

const St = ({ rmfm, setRmfm }) => {
  const [editingIndex, setEditingIndex] = useState(null);
  const [cities, setCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [rms, setRms] = useState([]);
  const [ids, setIds] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [selectedBuilder, setSelectedBuilder] = useState("");
  const [communities, setCommunities] = useState([]);
  const [maxIdSoFar, setMaxIdSoFar] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogAction, setDialogAction] = useState(null);

  // Fetch IDs and data on mount
  useEffect(() => {
    const getIds = async () => {
      try {
        const iddata = await fetchid();
        setIds(iddata);
        const highestId = iddata.reduce((max, row) => (row.id > max ? row.id : max), 0);
        setMaxIdSoFar(highestId);
      } catch (error) {
        console.error("Error fetching IDs:", error);
      }
    };
    getIds();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const rmsData = await fetchRMs();
      
        setRms(rmsData);
         const communitiesData = await fetchCommunities();
        setCommunities(communitiesData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchCitie = async () => {
      try {
        const res = await fetchCities();
        setCities(res.data.result);
      } catch (error) {
        console.error("Error fetching cities", error);
      }
    };
    fetchCitie();
  }, []);

  useEffect(() => {
    const fetchBuilder = async () => {
      if (!selectedCity) {
        setBuilders([]);
        return;
      }
      try {
        const res = await fetchBuilders(selectedCity);
        setBuilders(res.data.result);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };
    fetchBuilder();
  }, [selectedCity]);



  const filteredIndices = rmfm
  .map((_, index) => index)
  .filter(index => {
    const record = rmfm[index];

    if (editingIndex === index) return true; // Ensure the edited row stays visible
    
    if (selectedBuilder) {
      return communities.some(c => c.id === record.community_id && c.builder_id === parseInt(selectedBuilder));
    }

    return true;
  });


  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredIndices
    .slice(indexOfFirstItem, indexOfLastItem)
    .map(index => ({ ...rmfm[index], originalIndex: index }));
  const totalPages = Math.ceil(filteredIndices.length / itemsPerPage);
  console.log("pagessssssss", totalPages)

  const handleRowEdit = (index) => {
    setEditingIndex(editingIndex === index ? null : index);
  };

  const handleAddRow = () => {
    const newId = maxIdSoFar + 1;
    setMaxIdSoFar(newId);
    const newRow = {
      id: newId,
      community_id: "",
      rm_id: "",
      fm_id: "",
      community_name: "",
      rm_name: "",
      fm_name: ""
    };

    setSelectedBuilder("");
    setIds([newRow, ...ids]);
    setRmfm([newRow, ...rmfm]);
  };

  const handleRowDelete = async (index) => {
    const rowId = ids[index]?.id;
    if (!rowId) {
      alert("Invalid row ID. Cannot delete.");
      return;
    }

    setDialogMessage("Are you sure you want to delete this row?");
    setDialogAction(() => async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/getRecords?tableName=dy_rm_fm_com_map&fieldNames=id`
        );
        const existingIds = response.data.result.map((user) => user.id);

        if (existingIds.includes(rowId)) {
          await axios.delete("http://localhost:5000/api/deleteRecord", {
            data: {
              tableName: "dy_rm_fm_com_map",
              whereCondition: `id=${rowId}`,
            },
          });
        }

        const updatedRmfm = rmfm.filter((_, i) => i !== index);
        setRmfm(updatedRmfm);
        const updatedIds = ids.filter((_, i) => i !== index);
        setIds(updatedIds);
        setEditingIndex(null);
        alert("Row deleted successfully.");
      } catch (error) {
        console.error("Error deleting row:", error);
        alert("Failed to delete the row. Please try again.");
      }
    });
    setIsDialogOpen(true);
  };

  const handleSave = async (index) => {
    const newRmfm = [...rmfm];
    const tableIndex = ids[index]?.id;

    setDialogMessage("Are you sure you want to save changes?");
    setDialogAction(() => async () => {
      try {
        const response = await axios.get(
          `${apiUrl}/getRecords?tableName=dy_rm_fm_com_map&fieldNames=id`
        );
        const existingIds = response.data.result.map((user) => user.id);

        const communityid = newRmfm[index].community_id;
        const fmid = newRmfm[index].fm_id;
        const rmid = newRmfm[index].rm_id;

        if (!tableIndex || !communityid || !fmid || !rmid) {
          alert("One or more values are missing or invalid:", { tableIndex, communityid, fmid, rmid });
          return;
        }

        if (existingIds.includes(tableIndex)) {
          await axios.put(`${apiUrl}/updateRecord`, {
            tableName: "dy_rm_fm_com_map",
            fieldValuePairs: {
              "community_id": communityid,
              "fm_id": fmid,
              "rm_id": rmid
            },
            whereCondition: `id=${tableIndex}`,
          });
           location.reload();
        } else {
          await axios.post(`${apiUrl}/addNewRecord`, {
            tableName: "dy_rm_fm_com_map",
            fieldNames: "id, community_id, fm_id, rm_id",
            fieldValues: `${tableIndex}, ${communityid}, '${fmid}', '${rmid}'`,
          });
           location.reload();
        }
        setEditingIndex(null);
        alert("Save data successfully!");
      } catch (error) {
        console.error("Error:", error.response?.data || error.message);
        alert("Failed to save the data. Please try again.");
      }
    });
    setIsDialogOpen(true);
  };


  const handleBuilderChange = (builderId) => {
    setSelectedBuilder(builderId);
  };

  
  const handleSelectCommunity = (e, index) => {
    const newRmfm = [...rmfm];
    newRmfm[index].community_id = e.target.value;
    // Update community name when community is selected
    const selectedCommunity = communities.find(c => c.id === parseInt(e.target.value));
    if (selectedCommunity) {
      newRmfm[index].community_name = selectedCommunity.name;
    }
    setRmfm(newRmfm);
  };


  const handleSelectRM = (e, index) => {
    const newRmfm = [...rmfm];
    newRmfm[index].rm_id = e.target.value;
    // Update RM name when RM is selected
    const selectedRM = rms?.RMs?.find(rm => rm.user_id === parseInt(e.target.value));
    if (selectedRM) {
      newRmfm[index].rm_name = selectedRM.user_name;
    }
    setRmfm(newRmfm);
  };

  const handleSelectFM = (e, index) => {
    const newRmfm = [...rmfm];
    newRmfm[index].fm_id = e.target.value;
    // Update FM name when FM is selected
    const selectedFM = rms?.FMs?.find(fm => fm.user_id === parseInt(e.target.value));
    if (selectedFM) {
      newRmfm[index].fm_name = selectedFM.user_name;
    }
    setRmfm(newRmfm);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="bg-white h-[calc(100vh-110px)] rounded-lg shadow m-5">
      <div className="px-6 pb-6">
        <div className="flex items-center gap-4 py-6 justify-between overflow-auto">
          <h2 className="text-xl font-semibold">Manager Allocation</h2>
          <div className="flex ml-auto items-center space-x-5"> 

          <select
              className="px-2 py-2 text-sm font-semibold rounded bg-gray-100 border border-gray-300"
              onChange={(e) => setSelectedCity(e.target.value)}
            >
              <option value="">Select City</option>
              {cities?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>          
            <select
              value={selectedBuilder || ""}
              className="px-2 py-2 text-sm font-semibold rounded bg-gray-100 border border-gray-300"
              onChange={(e) => handleBuilderChange(e.target.value)}
            >
              <option value="">Select Builder</option>
              {builders?.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleAddRow}
              className="bg-blue-500 text-white px-3 py-2 rounded"
            >
              Add
            </button>
            <button
              className="bg-green-500 text-white px-3 py-2 rounded"
              onClick={() => handleSave(editingIndex)}
            >
              Save
            </button>
            <button
              className="bg-red-500 text-white px-2 py-2 rounded"
              onClick={() => handleRowDelete(editingIndex)}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="overflow-auto max-h-[calc(100vh-230px)] rounded-lg border">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 py-2"></th>
                <th className="border border-gray-300 px-4 py-2">ID</th>
                <th className="border border-gray-300 px-4 py-2">Community</th>
                <th className="border border-gray-300 px-4 py-2">RM</th>
                <th className="border border-gray-300 px-4 py-2">FM</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((item, displayIndex) => {
                const originalIndex = item.originalIndex;
                return (
                  <tr key={originalIndex}>
                    <td className="border border-gray-300 px-1 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={editingIndex === originalIndex}
                        onChange={() => handleRowEdit(originalIndex)}
                      />
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      {ids[originalIndex]?.id || "ID"}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingIndex === originalIndex ? (
                        <select
                          className="border border-gray-300 px-4 py-2 rounded"
                          value={item.community_id}
                          onChange={(e) => handleSelectCommunity(e, originalIndex)}
                        >
                          <option value="">Select Community</option>
                          {communities?.map((community) => (
                            <option key={community.id} value={community.id}>
                              {community.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        item.community_name || "Community Name"
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingIndex === originalIndex ? (
                        <select
                          className="border border-gray-300 px-4 py-2 rounded"
                          value={item.rm_id?.toString() || ''}
                          onChange={(e) => handleSelectRM(e, originalIndex)}
                        >
                          <option value="">Select RM</option>
                          {rms?.RMs?.map((rm) => (
                            <option key={rm.user_id} value={rm.user_id}>
                              {rm.user_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        item.rm_name || "RM Name"
                      )}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">
                      {editingIndex === originalIndex ? (
                        <select
                          className="border border-gray-300 px-4 py-2 rounded"
                          value={item.fm_id?.toString() || ''}
                          onChange={(e) => handleSelectFM(e, originalIndex)}
                        >
                          <option value="">Select FM</option>
                          {rms?.FMs?.map((fm) => (
                            <option key={fm.user_id} value={fm.user_id}>
                              {fm.user_name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        item.fm_name || "FM Name"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`px-3 py-2 rounded-md ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "bg-gray-300 text-gray-700 hover:bg-gray-400"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
      <ConfirmationDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConfirm={() => {
          dialogAction();
          setIsDialogOpen(false);
        }}
        message={dialogMessage}
      />
    </div>
  );
};

export default St;





