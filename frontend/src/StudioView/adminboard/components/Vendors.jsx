import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import '../glassmorphic.css';

const Vendors = () => {
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [formData, setFormData] = useState({
    ven_cat_id: '',
    ven_user_id: '',
    ven_address: '',
    ven_firm_name: '',
    ven_poc: '',
    ven_pan_no: '',
    ven_aadhaar_no: '',
    ven_tin_no: '',
    ven_registration_no: '',
    ven_mobile: '',
    ven_approved_date: '',
    ven_approver_id: '',
    ven_approval_status: 0,
    ven_validity_months: '',
    ven_wht_rate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const vendorCategories = {
    1: 'Company', 2: 'Electrician', 3: 'Plumber', 4: 'False Ceiling', 5: 'Carpentry',
    6: 'Lighting', 7: 'Tiles', 8: 'Glassware', 9: 'Artwork', 10: 'Gardening',
    11: 'Polishing', 12: 'Cleaning', 13: 'Sanitary', 14: 'Masonry', 15: 'Iron Mesh',
    16: 'Painter', 17: 'Kitchen Work', 18: 'Designer'
  };

  const approvalStatuses = {
    0: 'Pending', 1: 'Approved', 2: 'Rejected', 3: 'Suspended'
  };

  const approvalStatusColors = {
    0: 'bg-yellow-100 text-yellow-800',
    1: 'bg-green-100 text-green-800',
    2: 'bg-red-100 text-red-800',
    3: 'bg-orange-100 text-orange-800'
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  useEffect(() => {
    console.log('showModal state changed to:', showModal);
  }, [showModal]);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/vendor/getvendorInfo`);
      if (!response.ok) {
        throw new Error('Failed to fetch vendors');
      }
      const data = await response.json();
      setVendors(Array.isArray(data.result) ? data.result : []);
    } catch (error) {
      console.error('Error fetching vendors:', error);
      setError('Failed to load vendors. Please try again.');
      setVendors([]);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (catId) => {
    return vendorCategories[catId] || 'Unknown';
  };

  const getApprovalStatusName = (status) => {
    return approvalStatuses[status] || 'Unknown';
  };

  const getApprovalStatusColor = (status) => {
    return approvalStatusColors[status] || 'bg-gray-100 text-gray-800';
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdd = () => {
    setModalType('add');
    setSelectedVendor(null);
    setFormData({
      ven_cat_id: '', ven_user_id: '', ven_address: '', ven_firm_name: '', ven_poc: '',
      ven_pan_no: '', ven_aadhaar_no: '', ven_tin_no: '', ven_registration_no: '',
      ven_mobile: '', ven_approved_date: '', ven_approver_id: '', ven_approval_status: 0,
      ven_validity_months: '', ven_wht_rate: ''
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleEdit = (vendor) => {
    setModalType('edit');
    setSelectedVendor(vendor);
    setFormData({
      ven_cat_id: vendor.ven_cat_id?.toString() || '',
      ven_user_id: vendor.ven_user_id || '',
      ven_address: vendor.ven_address || '',
      ven_firm_name: vendor.ven_firm_name || '',
      ven_poc: vendor.ven_poc || '',
      ven_pan_no: vendor.ven_pan_no || '',
      ven_aadhaar_no: vendor.ven_aadhaar_no || '',
      ven_tin_no: vendor.ven_tin_no || '',
      ven_registration_no: vendor.ven_registration_no || '',
      ven_mobile: vendor.ven_mobile || '',
      ven_approved_date: vendor.ven_approved_date ? vendor.ven_approved_date.split('T')[0] : '',
      ven_approver_id: vendor.ven_approver_id || '',
      ven_approval_status: vendor.ven_approval_status || 0,
      ven_validity_months: vendor.ven_validity_months?.toString() || '',
      ven_wht_rate: vendor.ven_wht_rate?.toString() || ''
    });
    setError('');
    setSuccess('');
    setShowModal(true);
  };

  const handleDelete = async (vendor) => {
    if (window.confirm(`Are you sure you want to delete vendor "${vendor.ven_firm_name}"?`)) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendor/deletevendorInfo?id=${vendor.id}`, {
          method: 'DELETE'
        });
        
        if (!response.ok) {
          throw new Error('Failed to delete vendor');
        }
        
        setSuccess('Vendor deleted successfully!');
        fetchVendors(); // Refresh the list
      } catch (error) {
        console.error('Error deleting vendor:', error);
        setError('Failed to delete vendor. Please try again.');
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    if (!formData.ven_firm_name || !formData.ven_poc || !formData.ven_mobile) {
      setError('Firm name, POC, and mobile are required fields');
      setSubmitting(false);
      return;
    }

    try {
      const vendorData = [
        { key: "ven_cat_id", value: parseInt(formData.ven_cat_id) || 1 },
        { key: "ven_user_id", value: formData.ven_user_id || "" },
        { key: "ven_address", value: formData.ven_address || "" },
        { key: "ven_firm_name", value: formData.ven_firm_name },
        { key: "ven_poc", value: formData.ven_poc },
        { key: "ven_pan_no", value: formData.ven_pan_no || "" },
        { key: "ven_aadhaar_no", value: formData.ven_aadhaar_no || "" },
        { key: "ven_tin_no", value: formData.ven_tin_no || "" },
        { key: "ven_registration_no", value: formData.ven_registration_no || "" },
        { key: "ven_mobile", value: formData.ven_mobile },
        { key: "ven_approved_date", value: formData.ven_approved_date ? `${formData.ven_approved_date} 00:00:00` : "" },
        { key: "ven_approver_id", value: formData.ven_approver_id || "" },
        { key: "ven_approval_status", value: parseInt(formData.ven_approval_status) || 0 },
        { key: "ven_validity_months", value: parseInt(formData.ven_validity_months) || 12 },
        { key: "ven_wht_rate", value: parseFloat(formData.ven_wht_rate) || 0 }
      ];

      const url = modalType === 'add' 
        ? 'http://localhost:5000/api/vendor/addvendorInfo'
        : 'http://localhost:5000/api/vendor/updatevendorInfo';

      const method = modalType === 'add' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vendorData })
      });

      if (!response.ok) {
        throw new Error(`Failed to ${modalType} vendor`);
      }

      setSuccess(`Vendor ${modalType === 'add' ? 'added' : 'updated'} successfully!`);
      setShowModal(false);
      fetchVendors(); // Refresh the list
    } catch (err) {
      console.error(`Error ${modalType}ing vendor:`, err);
      setError(`Failed to ${modalType} vendor. Please try again.`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Vendor Management</h1>
        <p className="text-gray-600">Manage vendor information and approvals</p>
      </div>

      {/* Success and Error Messages */}
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={handleAdd}
          className="bg-[#E07A5F] text-white px-6 py-2 rounded-lg hover:bg-[#d0694a] transition-colors flex items-center gap-2"
        >
          <i className="ri-add-line"></i>
          Add Vendor
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#E07A5F]"></div>
          <p className="mt-2 text-gray-600">Loading vendors...</p>
        </div>
      )}

      {/* Vendors Table */}
      {!loading && (
        <div className="bg-white rounded-xl shadow p-0 overflow-x-auto mx-8">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-[#181f3a] text-white rounded-t-xl">
                <th className="p-4 text-left font-semibold rounded-tl-xl text-lg">ID</th>
                <th className="p-4 text-left font-semibold text-lg">Vendor Name</th>
                <th className="p-4 text-left font-semibold text-lg">Category</th>
                <th className="p-4 text-left font-semibold text-lg">Firm Name</th>
                <th className="p-4 text-left font-semibold text-lg">POC</th>
                <th className="p-4 text-left font-semibold text-lg">Mobile</th>
                <th className="p-4 text-left font-semibold text-lg">PAN</th>
                <th className="p-4 text-left font-semibold text-lg">Approval Status</th>
                <th className="p-4 text-left font-semibold text-lg">Validity (Months)</th>
                <th className="p-4 text-left font-semibold text-lg">WHT Rate (%)</th>
                <th className="p-4 text-left font-semibold rounded-tr-xl text-lg">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor, idx) => (
                <tr
                  key={vendor.id}
                  className={
                    "border-b last:border-b-0" +
                    (idx % 2 === 0 ? " bg-white" : " bg-gray-50")
                  }
                >
                  <td className="p-4 text-base font-medium">{vendor.id}</td>
                  <td className="p-4 text-base font-medium">{vendor.vendor_user_name}</td>
                  <td className="p-4 text-base">{getCategoryName(vendor.ven_cat_id)}</td>
                  <td className="p-4 text-base font-medium">{vendor.ven_firm_name}</td>
                  <td className="p-4 text-base">{vendor.ven_poc}</td>
                  <td className="p-4 text-base">{vendor.ven_mobile}</td>
                  <td className="p-4 text-base">{vendor.ven_pan_no || '-'}</td>
                  <td className="p-4 text-base">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getApprovalStatusColor(vendor.ven_approval_status)}`}>
                      {getApprovalStatusName(vendor.ven_approval_status)}
                    </span>
                  </td>
                  <td className="p-4 text-base">{vendor.ven_validity_months || '-'}</td>
                  <td className="p-4 text-base">{vendor.ven_wht_rate || '-'}%</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        className="p-2 rounded-md bg-blue-500 text-white hover:scale-110 transition-transform"
                        title="Edit"
                        onClick={() => handleEdit(vendor)}
                      >
                        <i className="ri-edit-line"></i>
                      </button>
                      <button
                        className="p-2 rounded-md bg-red-500 text-white hover:scale-110 transition-transform"
                        title="Delete"
                        onClick={() => handleDelete(vendor)}
                      >
                        <i className="ri-delete-bin-line"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && vendors.length === 0 && (
        <div className="text-center py-12">
          <i className="ri-user-line text-4xl text-gray-400 mb-4"></i>
          <p className="text-gray-500">No vendors found</p>
        </div>
      )}

      {/* Add/Edit Vendor Modal */}
      {showModal && (
        <Modal title={modalType === 'add' ? 'Add New Vendor' : 'Edit Vendor'} onClose={() => {
          console.log('Closing modal, showModal was:', showModal);
          setShowModal(false);
          setError('');
          setSuccess('');
          setSubmitting(false);
        }}>
          <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {modalType === 'add' ? 'Add New Vendor' : 'Edit Vendor'}
            </h2>
          
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="ven_cat_id"
                    value={formData.ven_cat_id}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                  >
                    <option value="">Select Category</option>
                    {Object.entries(vendorCategories).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Firm Name *</label>
                  <input
                    type="text"
                    name="ven_firm_name"
                    value={formData.ven_firm_name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                    placeholder="Enter firm name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">POC (Point of Contact) *</label>
                  <input
                    type="text"
                    name="ven_poc"
                    value={formData.ven_poc}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                    placeholder="Enter POC name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile *</label>
                  <input
                    type="text"
                    name="ven_mobile"
                    value={formData.ven_mobile}
                    onChange={handleFormChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                    placeholder="Enter mobile number"
                    maxLength="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                  <input
                    type="text"
                    name="ven_pan_no"
                    value={formData.ven_pan_no}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                    placeholder="ABCDE1234F"
                    maxLength="10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Aadhaar Number</label>
                  <input
                    type="text"
                    name="ven_aadhaar_no"
                    value={formData.ven_aadhaar_no}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                    placeholder="Enter 12-digit Aadhaar"
                    maxLength="12"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Approval Status</label>
                  <select
                    name="ven_approval_status"
                    value={formData.ven_approval_status}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                  >
                    {Object.entries(approvalStatuses).map(([id, name]) => (
                      <option key={id} value={id}>{name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Validity (Months)</label>
                  <input
                    type="number"
                    name="ven_validity_months"
                    value={formData.ven_validity_months}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                    placeholder="Enter validity in months"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WHT Rate (%)</label>
                  <input
                    type="number"
                    name="ven_wht_rate"
                    value={formData.ven_wht_rate}
                    onChange={handleFormChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                    placeholder="Enter WHT rate"
                    step="0.1"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  name="ven_address"
                  value={formData.ven_address}
                  onChange={handleFormChange}
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#E07A5F] focus:border-transparent"
                  placeholder="Enter complete address"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    console.log('Cancel button clicked');
                    setShowModal(false);
                    setError('');
                    setSuccess('');
                    setSubmitting(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-[#E07A5F] text-white rounded-lg hover:bg-[#d0694a] disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : (modalType === 'add' ? 'Add Vendor' : 'Update Vendor')}
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Vendors; 