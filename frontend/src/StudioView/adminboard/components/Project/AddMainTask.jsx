import React, { useState, useEffect } from 'react';

const AddMainTask = () => {
  const [formData, setFormData] = useState({
    project_id: '',
    main_task_name: '',
    vendor_id: '',
    task_cost: '',
    total_task_cost: ''
  });

  const [projects, setProjects] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/project/getAllProjects`);
        const data = await response.json();
        if (data.success) {
          setProjects(data.data || []);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    fetchProjects();
  }, []);

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
      const mainTaskData = {
        project_id: parseInt(formData.project_id),
        main_task_name: formData.main_task_name,
        vendor_id: formData.vendor_id,
        task_cost: parseFloat(formData.task_cost),
        total_task_cost: parseFloat(formData.total_task_cost)
      };

      // Convert to key-value pair array format
      const mainTaskPayload = Object.entries(mainTaskData)
        .filter(([_, v]) => v !== undefined && v !== '')
        .map(([k, v]) => ({ key: k, value: v }));

      const payload = {
        mainTaskData: mainTaskPayload
      };

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/maintask/addNewStudioMainTask`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();
      
      if (result.success) {
        setMessage('Main task added successfully!');
        setFormData({
          project_id: '',
          main_task_name: '',
          vendor_id: '',
          task_cost: '',
          total_task_cost: ''
        });
      } else {
        setMessage(`Error: ${result.message || 'Failed to add main task'}`);
      }
    } catch (error) {
      console.error('Error adding main task:', error);
      setMessage('Error adding main task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Main Task</h1>
        
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
            {/* Project Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project *
              </label>
              <select
                name="project_id"
                value={formData.project_id}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Project</option>
                {projects.map(project => (
                  <option key={project.id} value={project.id}>
                    {project.project_name} - {project.customer_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Main Task Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Main Task Name *
              </label>
              <input
                type="text"
                name="main_task_name"
                value={formData.main_task_name}
                onChange={handleInputChange}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter main task name"
              />
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

            {/* Task Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Task Cost (₹) *
              </label>
              <input
                type="number"
                name="task_cost"
                value={formData.task_cost}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter task cost"
              />
            </div>

            {/* Total Task Cost */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Task Cost (₹) *
              </label>
              <input
                type="number"
                name="total_task_cost"
                value={formData.total_task_cost}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter total task cost"
              />
            </div>
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
              {loading ? 'Adding Main Task...' : 'Add Main Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMainTask;

