import React, { useState, useEffect } from 'react';

const AddSubtask = () => {
  const [formData, setFormData] = useState({
    main_task: '',
    vendor_id: '',
    approver_id: '',
    approval_status: 1,
    sub_task_name: '',
    sub_task_description: '',
    week_no: ''
  });

  const [vendors, setVendors] = useState([]);
  const [mainTasks, setMainTasks] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch vendors
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/vendor/getAllVendors`);
        const data = await response.json();
        if (data.success) {
          setVendors(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    fetchVendors();
  }, []);

  // Fetch main tasks
  useEffect(() => {
    const fetchMainTasks = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/maintask/getAllStudioMainTasks`);
        const data = await response.json();
        if (data.success) {
          setMainTasks(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching main tasks:', error);
      }
    };
    fetchMainTasks();
  }, []);

  // Fetch approvers (users with appropriate roles)
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/user/getAllUsers`);
        const data = await response.json();
        if (data.success) {
          // Filter users who can approve tasks (admin, site-manager, etc.)
          const approverUsers = data.data?.filter(user => 
            ['admin', 'site-manager'].includes(user.role)
          ) || [];
          setApprovers(approverUsers);
        }
      } catch (error) {
        console.error('Error fetching approvers:', error);
      }
    };
    fetchApprovers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Create FormData for file uploads
      const formDataToSend = new FormData();
      
      // Create sub task payload as raw array format
      const subTaskData = {
        main_task: formData.main_task,
        vendor_id: formData.vendor_id,
        approver_id: formData.approver_id,
        approval_status: parseInt(formData.approval_status),
        sub_task_name: formData.sub_task_name,
        sub_task_description: formData.sub_task_description,
        week_no: parseInt(formData.week_no)
      };

      // Convert to key-value pair array format
      const subTaskPayload = Object.entries(subTaskData)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => ({ key: k, value: v }));

      formDataToSend.append('subTaskData', JSON.stringify(subTaskPayload));

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/subtask/addNewStudioSubTask`,
        {
          method: 'POST',
          body: formDataToSend
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setMessage('Subtask added successfully!');
        setFormData({
          main_task: '',
          vendor_id: '',
          approver_id: '',
          approval_status: 1,
          sub_task_name: '',
          sub_task_description: '',
          week_no: ''
        });
      } else {
        setMessage(`Error: ${result.message || 'Failed to add subtask'}`);
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
      setMessage('Error adding subtask. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Subtask</h1>
        
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            message.includes('successfully') 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Main Task Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Task *
              </label>
              <select
                name="main_task"
                value={formData.main_task}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Main Task</option>
                {mainTasks.map(task => (
                  <option key={task.id} value={task.id}>
                    {task.main_task_name} (Project: {task.project_id})
                  </option>
                ))}
              </select>
            </div>

            {/* Vendor Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor *
              </label>
              <select
                name="vendor_id"
                value={formData.vendor_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Vendor</option>
                {vendors.map(vendor => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.ven_firm_name} - {vendor.ven_poc}
                  </option>
                ))}
              </select>
            </div>

            {/* Approver Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approver *
              </label>
              <select
                name="approver_id"
                value={formData.approver_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Approver</option>
                {approvers.map(approver => (
                  <option key={approver.id} value={approver.id}>
                    {approver.username} ({approver.role})
                  </option>
                ))}
              </select>
            </div>

            {/* Approval Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Approval Status *
              </label>
              <select
                name="approval_status"
                value={formData.approval_status}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>Approved</option>
                <option value={0}>Pending</option>
                <option value={2}>Rejected</option>
              </select>
            </div>

            {/* Week Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Week Number *
              </label>
              <input
                type="number"
                name="week_no"
                value={formData.week_no}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter week number"
              />
            </div>
          </div>

          {/* Subtask Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtask Name *
            </label>
            <input
              type="text"
              name="sub_task_name"
              value={formData.sub_task_name}
              onChange={handleInputChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subtask name"
            />
          </div>

          {/* Subtask Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subtask Description *
            </label>
            <textarea
              name="sub_task_description"
              value={formData.sub_task_description}
              onChange={handleInputChange}
              required
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter subtask description"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-3 rounded-lg font-medium ${
                loading
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
              }`}
            >
              {loading ? 'Adding Subtask...' : 'Add Subtask'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubtask;

