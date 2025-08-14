import React, { useEffect, useState } from 'react';
import Modal from './Modal';

function Requests() {
  const [requests, setRequests] = useState([]);
  const [modalType, setModalType] = useState(null); // 'edit' or 'delete'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // TODO: Replace with real API endpoint
      // For now, using mock data structure
      const mockRequests = [
        {
          id: 1,
          Name: "John Doe",
          Mobile_No: "123-456-7890",
          Req_Doc_Path: "",
          Status: "Pending"
        },
        {
          id: 2,
          Name: "Jane Smith",
          Mobile_No: "987-654-3210",
          Req_Doc_Path: "/documents/jane_smith_request.pdf",
          Status: "Approved"
        },
        {
          id: 3,
          Name: "Alice Johnson",
          Mobile_No: "555-123-4567",
          Req_Doc_Path: "/documents/alice_johnson_request.pdf",
          Status: "Rejected"
        },
        {
          id: 4,
          Name: "Bob Brown",
          Mobile_No: "444-987-6543",
          Req_Doc_Path: "/documents/bob_brown_request.pdf",
          Status: "In Review"
        },
        {
          id: 5,
          Name: "Charlie Davis",
          Mobile_No: "222-333-4444",
          Req_Doc_Path: "/documents/charlie_davis_request.pdf",
          Status: "Completed"
        }
      ];
      
      setRequests(mockRequests);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setRequests([]);
    }
  };

  // Handle edit button
  const handleEdit = (req) => {
    setSelectedRequest(req);
    setEditForm(req);
    setModalType('edit');
  };

  // Handle delete button
  const handleDelete = (req) => {
    setSelectedRequest(req);
    setModalType('delete');
  };

  // Handle edit form change
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // Handle edit submit (placeholder)
  const handleEditSubmit = (e) => {
    e.preventDefault();
    // TODO: Call API to update request
    setModalType(null);
    setSelectedRequest(null);
  };

  // Handle delete confirm (placeholder)
  const handleDeleteConfirm = () => {
    // TODO: Call API to delete request
    setModalType(null);
    setSelectedRequest(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6">Requests</h2>
      <div className="overflow-x-auto">
        <table className="w-full rounded-lg overflow-hidden shadow glassmorphic bg-white">
          <thead>
            <tr className="bg-[#1A1F3D] text-white text-lg">
              <th className="p-3 text-left">ID</th>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Mobile No</th>
              <th className="p-3 text-left">Req Doc Path</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                className="border-b hover:bg-gray-100 transition-colors"
              >
                <td className="p-3 text-base">{req.id}</td>
                <td className="p-3 text-base">{req.Name}</td>
                <td className="p-3 text-base">{req.Mobile_No}</td>
                <td className="p-3 text-base">
                  {req.Req_Doc_Path ? (
                    <a
                      className="text-blue-600 underline text-base"
                      href={req.Req_Doc_Path}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Document
                    </a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="p-3 text-base">{req.Status}</td>
                <td className="p-3 flex space-x-2 text-base">
                  <button
                    className="p-2 rounded-lg bg-blue-500 text-white hover:scale-110 transition-transform"
                    title="Edit"
                    onClick={() => handleEdit(req)}
                  >
                    <i className="ri-edit-line"></i>
                  </button>
                  <button
                    className="p-2 rounded-lg bg-red-500 text-white hover:scale-110 transition-transform"
                    title="Delete"
                    onClick={() => handleDelete(req)}
                  >
                    <i className="ri-delete-bin-line"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Edit Modal */}
      {modalType === 'edit' && selectedRequest && (
        <Modal title="Edit Request" onClose={() => setModalType(null)}>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {Object.keys(editForm).map((key) => (
              key !== 'id' && (
                <div key={key}>
                  <label className="block mb-1 font-semibold capitalize">{key.replace('_', ' ')}</label>
                  <input
                    className="w-full border rounded-lg p-2"
                    type="text"
                    name={key}
                    value={editForm[key]}
                    onChange={handleEditFormChange}
                  />
                </div>
              )
            ))}
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-2"
            >
              Save Changes
            </button>
          </form>
        </Modal>
      )}
      {/* Delete Modal */}
      {modalType === 'delete' && selectedRequest && (
        <Modal title="Delete Request" onClose={() => setModalType(null)} width="max-w-md">
          <div className="text-center mb-6">Are you sure you want to delete request <span className="font-bold">{selectedRequest.Name}</span>?</div>
          <div className="flex justify-center gap-4">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              onClick={() => setModalType(null)}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              onClick={handleDeleteConfirm}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Requests; 