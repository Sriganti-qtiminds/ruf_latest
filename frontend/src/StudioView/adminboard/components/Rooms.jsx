import React, { useEffect, useState } from 'react';
import '../glassmorphic.css';
import Modal from './Modal';

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  // Filter states
  const [areaTypeFilter, setAreaTypeFilter] = useState('');
  const [budgetTypeFilter, setBudgetTypeFilter] = useState('');
  const [imageCountFilter, setImageCountFilter] = useState('');
  // Edit/Delete modal state
  const [modalType, setModalType] = useState(null); 
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    region_desc: '',
    image_count: '',
    region_cat: '',
    budget_cat: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regions/getregionInfo`);
      if (!response.ok) {
        throw new Error('Failed to fetch rooms');
      }
      const data = await response.json();
      
      if (data.success && data.result) {
        setRooms(Array.isArray(data.result) ? data.result : []);
      } else {
        setRooms([]);
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      setError('Failed to load rooms. Please try again.');
      setRooms([]);
    } finally {
      setLoading(false);
    }
  };

  
  const areaTypeOptions = Array.from(new Set(rooms.map(r => r.area_type).filter(Boolean)));
  const budgetTypeOptions = Array.from(new Set(rooms.map(r => r.budget_type).filter(Boolean)));
  const imageCountOptions = Array.from(new Set(rooms.map(r => r.images_count).filter(v => v !== undefined && v !== null)));

  
  const filteredRooms = rooms.filter(room => {
    return (
      (areaTypeFilter === '' || room.area_type === areaTypeFilter) &&
      (budgetTypeFilter === '' || room.budget_type === budgetTypeFilter) &&
      (imageCountFilter === '' || String(room.images_count) === imageCountFilter)
    );
  });

  // Handle add/edit form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

const handleFormSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);
  setError('');
  setSuccess('');

  if (!form.region_desc || !form.region_cat || !form.budget_cat) {
    setError('Region description, region category, and budget category are required fields');
    setSubmitting(false);
    return;
  }

  try {
    const regionData = [
      { key: "region_cat", value: parseInt(form.region_cat) || 1 },
      { key: "budget_cat", value: parseInt(form.budget_cat) || 1 },
      { key: "image_count", value: parseInt(form.image_count) || 0 },
      { key: "region_desc", value: { Description: form.region_desc } }
    ];

    //  Add ID if editing
    if (modalType === 'edit' && selectedRoom?.region_id) {
      regionData.unshift({ key: "id", value: selectedRoom.region_id });
    }

    const url = modalType === 'add' 
      ? `${import.meta.env.VITE_API_URL}/regions/addregionsInfo`
      : `${import.meta.env.VITE_API_URL}/regions/updateregionInfo`;

    const method = modalType === 'add' ? 'POST' : 'PUT';

    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ regionData })
    });

    if (!response.ok) {
      throw new Error(`Failed to ${modalType} room`);
    }

    const data = await response.json();

    if (data.success) {
      setSuccess(`Room ${modalType === 'add' ? 'added' : 'updated'} successfully!`);
      setShowModal(false);
      fetchRooms();
    } else {
      throw new Error(data.message || `Failed to ${modalType} room`);
    }
  } catch (err) {
    console.error(`Error ${modalType}ing room:`, err);
    setError(`Failed to ${modalType} room. Please try again.`);
  } finally {
    setSubmitting(false);
  }
};



  // Handle edit button
  const handleEdit = (room) => {
    setSelectedRoom(room);
    setForm({
      region_desc: room.region_description?.Description || '',
      image_count: room.images_count?.toString() || '',
      region_cat: room.region_cat?.toString() || '',
      budget_cat: room.budget_cat?.toString() || ''
    });
    setModalType('edit');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // Handle delete button
  const handleDelete = (room) => {
    setSelectedRoom(room);
    setModalType('delete');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  // Handle delete confirm
  const handleDeleteConfirm = async () => {
    if (!selectedRoom) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/regions/deleteregionInfo?id=${selectedRoom.region_id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete room');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess('Room deleted successfully!');
        setShowModal(false);
        fetchRooms(); // Refresh the list
      } else {
        throw new Error(data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      setError('Failed to delete room. Please try again.');
    }
  };

  // Handle add button
  const handleAdd = () => {
    setForm({ region_desc: '', image_count: '', region_cat: '', budget_cat: '' });
    setSelectedRoom(null);
    setModalType('add');
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  return (
    <div className="flex-1 w-full h-full">
      <div className="flex justify-between items-center mb-8 px-8 pt-8">
        <h2 className="text-3xl font-bold">Room Management</h2>
        <button
          className="flex items-center gap-2 bg-[#E07A5F] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform font-medium text-lg"
          onClick={handleAdd}
        >
          <span className="text-xl">+</span> Add Room
        </button>
      </div>

      {/* Success and Error Messages */}
      {success && (
        <div className="mb-4 mx-8 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 mx-8 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-4 mb-4 px-8">
        <div>
          <label className="block text-sm font-semibold mb-1">Room Type</label>
          <select
            className="border rounded-lg p-2 min-w-[120px]"
            value={areaTypeFilter}
            onChange={e => setAreaTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            {areaTypeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Budget Type</label>
          <select
            className="border rounded-lg p-2 min-w-[120px]"
            value={budgetTypeFilter}
            onChange={e => setBudgetTypeFilter(e.target.value)}
          >
            <option value="">All</option>
            {budgetTypeOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Image Count</label>
          <select
            className="border rounded-lg p-2 min-w-[120px]"
            value={imageCountFilter}
            onChange={e => setImageCountFilter(e.target.value)}
          >
            <option value="">All</option>
            {imageCountOptions.map(opt => (
              <option key={opt} value={String(opt)}>{opt}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E07A5F]"></div>
          <p className="mt-2 text-gray-600">Loading rooms...</p>
        </div>
      )}

      {/* Rooms Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow p-0 overflow-x-auto mx-8">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#181f3a] text-white rounded-t-xl">
                <th className="p-4 text-left font-semibold rounded-tl-xl text-lg">Room Type</th>
                <th className="p-4 text-left font-semibold text-lg">Budget Type</th>
                <th className="p-4 text-left font-semibold text-lg">Image Count</th>
                <th className="p-4 text-left font-semibold text-lg">Description</th>
                <th className="p-4 text-left font-semibold rounded-tr-xl text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRooms.map((room, idx) => (
                <tr
                  key={room.region_id}
                  className={
                    "border-b last:border-b-0" +
                    (idx % 2 === 0 ? " bg-white" : " bg-gray-50")
                  }
                >
                  <td className="p-4 text-base">{room.area_type}</td>
                  <td className="p-4 text-base">{room.budget_type}</td>
                  <td className="p-4 text-base">{room.images_count}</td>
                  <td className="p-4 text-base">
                    {typeof room.region_description === 'string'
                      ? room.region_description
                      : room.region_description?.Description || '-'}
                  </td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-md bg-blue-500 text-white hover:scale-110 transition-transform"
                        title="Edit"
                        onClick={() => handleEdit(room)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="p-2 rounded-md bg-red-500 text-white hover:scale-110 transition-transform"
                        title="Delete"
                        onClick={() => handleDelete(room)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                      <button
                        className="p-2 rounded-md"
                        style={{ background: '#7C9A92', color: 'white' }}
                        title="Toggle Images"
                      >
                        <i className="ri-arrow-down-s-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && filteredRooms.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-home-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">No rooms found</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(modalType === 'add' || modalType === 'edit') && (
        <Modal title={modalType === 'add' ? 'Add Room' : 'Edit Room'} onClose={() => { 
          setShowModal(false); 
          setModalType(null); 
          setError('');
          setSuccess('');
          setSubmitting(false);
        }}>
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label className="block mb-1 font-semibold">Region Description *</label>
              <textarea
                className="w-full border rounded-lg p-2"
                name="region_desc"
                value={form.region_desc}
                onChange={handleFormChange}
                rows={3}
                placeholder="Enter room description"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-semibold">Region Category *</label>
              <select
                className="w-full border rounded-lg p-2"
                name="region_cat"
                value={form.region_cat}
                onChange={handleFormChange}
                required
              >
                <option value="">Select region category</option>
                <option value="1">Master</option>
                <option value="2">Kids</option>
                <option value="3">Guests</option>
                <option value="4">Living</option>
                <option value="5">Pooja</option>
                <option value="6">Dining</option>
                <option value="7">Kitchen</option>
                <option value="8">Exteriors</option>
                <option value="9">False Ceiling</option>
                <option value="10">Utility</option>
              </select>
            </div>
              <div>
              <label className="block mb-1 font-semibold">Budget Category *</label>
              <select
                className="w-full border rounded-lg p-2"
                name="budget_cat"
                value={form.budget_cat}
                onChange={handleFormChange}
                required
              >
                <option value="">Select budget category</option>
                <option value="1">Elegant</option>
                <option value="2">Luxury</option>
                <option value="3">Premium</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">Image Count</label>
              <input
                className="w-full border rounded-lg p-2"
                type="number"
                name="image_count"
                value={form.image_count}
                onChange={handleFormChange}
                placeholder="Enter number of images"
                min="0"
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition mt-2 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : (modalType === 'add' ? 'Add Room' : 'Update Room')}
            </button>
          </form>
        </Modal>
      )}

      {/* Delete Modal */}
      {modalType === 'delete' && selectedRoom && (
        <Modal title="Delete Room" onClose={() => { 
          setShowModal(false); 
          setModalType(null); 
          setError('');
          setSuccess('');
        }} width="max-w-md">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}
          
          <div className="text-center mb-6">Are you sure you want to delete <span className="font-bold">{selectedRoom.area_type || selectedRoom.region_description}</span>?</div>
          <div className="flex justify-center gap-4">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              onClick={() => { setShowModal(false); setModalType(null); }}
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

export default Rooms; 