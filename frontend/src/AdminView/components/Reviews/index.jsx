import React, { useState, useEffect } from 'react';
import { fetchFiltersData } from '../../../services/newapiservices';
import { getAllTestimonials, updateTestimonial, deleteTestimonial, fetchStatusOptions } from '../../../services/adminapiservices';
import { FaCheck, FaTrash } from 'react-icons/fa';

const Reviews = () => {
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalImage, setModalImage] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStatuses, setSelectedStatuses] = useState({});

  // Filter states
  const [selectedStatus, setSelectedStatus] = useState('');
  const [cities, setCities] = useState([]);
  const [builders, setBuilders] = useState([]);
  const [communities, setCommunities] = useState([]);
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedBuilder, setSelectedBuilder] = useState('');
  const [selectedCommunity, setSelectedCommunity] = useState('');
  const [filteredBuilders, setFilteredBuilders] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);

  useEffect(() => {
    const fetchRecords = async () => {
      setRequestsLoading(true);
      try {
        const data = await getAllTestimonials();
        setRecords(data);
        setFilteredRecords(data);
        setError('');
      } catch (err) {
        setError('Failed to load testimonials');
        console.error('Error fetching testimonials:', err);
      } finally {
        setRequestsLoading(false);
      }
    };

    const fetchStatuses = async () => {
      try {
        const response = await fetchStatusOptions();
        const statuses = response.data.result;
        setStatusOptions(statuses);
      } catch (err) {
        setError('Failed to load status options');
        console.error('Error fetching status options:', err);
        setStatusOptions([
          { id: 1, status_code: 'Pending' },
          { id: 2, status_code: 'Invalid-Input' },
          { id: 3, status_code: 'Approve' },
        ]);
      }
    };

    const fetchDropdownData = async () => {
      try {
        const response = await fetchFiltersData();
        const { cities, builders, communities } = response.data.result;
        setCities(cities);
        setBuilders(builders);
        setCommunities(communities);
      } catch (err) {
        setError('Failed to load filter options');
        console.error('Error fetching filter data:', err);
      }
    };

    fetchRecords();
    fetchStatuses();
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (selectedCity) {
      const filtered = builders.filter(builder => builder.city_id === parseInt(selectedCity));
      setFilteredBuilders(filtered);
      setSelectedBuilder('');
      setFilteredCommunities([]);
      setSelectedCommunity('');
    } else {
      setFilteredBuilders([]);
      setSelectedBuilder('');
      setFilteredCommunities([]);
      setSelectedCommunity('');
    }
  }, [selectedCity, builders]);

  useEffect(() => {
    if (selectedBuilder) {
      const filtered = communities.filter(community => community.builder_id === parseInt(selectedBuilder));
      setFilteredCommunities(filtered);
      setSelectedCommunity('');
    } else {
      setFilteredCommunities([]);
      setSelectedCommunity('');
    }
  }, [selectedBuilder, communities]);

  useEffect(() => {
    let filtered = [...records];

    if (selectedStatus) {
      filtered = filtered.filter(record => record.current_status === parseInt(selectedStatus));
    }

    if (selectedCity) {
      filtered = filtered.filter(record => record.city_id === parseInt(selectedCity));
    }

    if (selectedBuilder) {
      filtered = filtered.filter(record => record.builder_id === parseInt(selectedBuilder));
    }

    if (selectedCommunity) {
      filtered = filtered.filter(record => record.community_id === parseInt(selectedCommunity));
    }

    setFilteredRecords(filtered);
  }, [records, selectedStatus, selectedCity, selectedBuilder, selectedCommunity]);

  const handleStatusChange = (id, newStatus) => {
    setSelectedStatuses((prev) => ({
      ...prev,
      [id]: newStatus,
    }));
  };

  const handleConfirmStatus = async (id) => {
    const newStatus = selectedStatuses[id];
    if (newStatus === undefined || newStatus === records.find(record => record.id === id).current_status) {
      return;
    }

    try {
      await updateTestimonial(id, { current_status: newStatus });
      setRecords(records.map(record =>
        record.id === id ? { ...record, current_status: newStatus } : record
      ));
      setSelectedStatuses((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
      setError('');
      window.location.reload();
    } catch (err) {
      setError('Failed to update status');
      console.error('Error updating status:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this testimonial?')) return;
    try {
      await deleteTestimonial(id);
      setRecords(records.filter(record => record.id !== id));
      setError('');
      window.location.reload();
    } catch (err) {
      setError('Failed to delete testimonial');
      console.error('Error deleting testimonial:', err);
    }
  };

  const openImageModal = (imageUrl) => {
    setModalImage(imageUrl);
  };

  const closeImageModal = () => {
    setModalImage(null);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="px-6 pb-6">
      <div className="shadow-sm w-full">
        <div className="flex items-center py-1 justify-between overflow-auto">
          <h3 className="text-lg font-medium text-gray-900">Reviews</h3>
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Status
              </label>
              <select
                id="status-filter"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Statuses</option>
                {statusOptions.map((status) => (
                  <option key={status.id} value={status.id}>
                    {status.status_code}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="city-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by City
              </label>
              <select
                id="city-filter"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Cities</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="builder-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Builder
              </label>
              <select
                id="builder-filter"
                value={selectedBuilder}
                onChange={(e) => setSelectedBuilder(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={!selectedCity}
              >
                <option value="">All Builders</option>
                {filteredBuilders.map((builder) => (
                  <option key={builder.id} value={builder.id}>
                    {builder.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 min-w-[200px]">
              <label htmlFor="community-filter" className="block text-sm font-medium text-gray-700 mb-1">
                Filter by Community
              </label>
              <select
                id="community-filter"
                value={selectedCommunity}
                onChange={(e) => setSelectedCommunity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                disabled={!selectedBuilder}
              >
                <option value="">All Communities</option>
                {filteredCommunities.map((community) => (
                  <option key={community.id} value={community.id}>
                    {community.name}
                  </option>
                ))}
              </select>
            </div>
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
          ) : filteredRecords.length === 0 ? (
            <div className="text-gray-500 text-center p-4">
              No reviews available
            </div>
          ) : (
            <table className="w-full table-auto">
              <thead className="sticky top-0 z-10">
                <tr className="border-b bg-gray-50">
                  <th className="w-auto whitespace-nowrap px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Review ID
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    UserName
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Display Name
                  </th>
                  <th className="w-auto whitespace-nowrap px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Review
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    City
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Builder
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Community
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Image
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-sm text-center font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id} className="border-b hover:bg-gray-100">
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {record.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {record.user_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {record.display_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {record.rating}/5
                    </td>
                    <td className="px-6 py-4 text-sm text-left text-gray-900 whitespace-normal">
                      {record.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {record.city_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {record.builder_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {record.community_name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {formatDate(record.testimonial_date)}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      {record.image_data ? (
                        <button
                          onClick={() => openImageModal(record.image_data)}
                          className="text-blue-600 hover:underline"
                        >
                          View
                        </button>
                      ) : (
                        'N/A'
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900">
                      <select
                        value={selectedStatuses[record.id] ?? record.current_status}
                        onChange={(e) => handleStatusChange(record.id, parseInt(e.target.value))}
                        className="border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500"
                      >                        
                      {statusOptions.map((status) =>
                        status.id !== 1 ? (
                          <option key={status.id} value={status.id}>
                            {status.status_code}
                          </option>
                        ) : null
                      )}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-gray-900 flex justify-center gap-2">
                      <button
                        onClick={() => handleConfirmStatus(record.id)}
                        className={`text-green-600 hover:text-green-800 ${
                          selectedStatuses[record.id] === undefined ||
                          selectedStatuses[record.id] === record.current_status
                            ? 'opacity-50 cursor-not-allowed'
                            : ''
                        }`}
                        disabled={
                          selectedStatuses[record.id] === undefined ||
                          selectedStatuses[record.id] === record.current_status
                        }
                        title="Confirm Status Update"
                      >
                        <FaCheck className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Testimonial"
                      >
                        <FaTrash className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {error && (
          <div className="text-red-500 text-center mt-4">{error}</div>
        )}
      </div>

      {modalImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-4 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">User Image</h3>
              <button onClick={closeImageModal} className="text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="flex justify-center">
              <img
                src={modalImage}
                alt="User uploaded"
                className="max-w-full max-h-[50vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reviews;