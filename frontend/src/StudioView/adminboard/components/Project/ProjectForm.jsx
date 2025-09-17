import React from 'react';

const ProjectForm = ({ 
  projectForm, 
  handleFormChange, 
  customerSearchQuery, 
  setCustomerSearchQuery, 
  showCustomerDropdown, 
  setShowCustomerDropdown, 
  filteredCustomers, 
  siteManagers, 
  projectDocuments, 
  setProjectDocuments 
}) => {
  return (
    <>
      <div>
        <label className="block mb-1 font-semibold">Project Name</label>
        <input
          className="w-full border rounded-lg p-2"
          type="text"
          value={projectForm.project_name}
          onChange={(e) => handleFormChange('project', 'project_name', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Site Manager</label>
        <select
          className="w-full border rounded-lg p-2"
          value={projectForm.site_mgr_id}
          onChange={(e) => handleFormChange('project', 'site_mgr_id', e.target.value)}
          required
        >
          <option value="">Select Site Manager</option>
          {siteManagers.map((manager) => (
            <option key={manager.id} value={manager.id}>
              {manager.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Budget Category</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={projectForm.budget_cat}
          onChange={(e) => handleFormChange('project', 'budget_cat', e.target.value)}
          required
        />
      </div>
      <div className="relative">
        <label className="block mb-1 font-semibold">Customer ID</label>
        <input
          className="w-full border rounded-lg p-2"
          type="text"
          value={customerSearchQuery}
          onChange={(e) => {
            setCustomerSearchQuery(e.target.value);
            // Only set cust_id if it's a valid ID (numeric)
            if (/^\d+$/.test(e.target.value)) {
              handleFormChange('project', 'cust_id', e.target.value);
            }
          }}
          onFocus={() => setShowCustomerDropdown(true)}
          onBlur={() => setTimeout(() => setShowCustomerDropdown(false), 200)}
          placeholder="Search by name or ID..."
          required
        />
        {showCustomerDropdown && filteredCustomers.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                onClick={() => {
                  setCustomerSearchQuery(customer.name);
                  handleFormChange('project', 'cust_id', customer.id);
                  setShowCustomerDropdown(false);
                }}
              >
                <div className="font-medium">{customer.name}</div>
                <div className="text-sm text-gray-500">ID: {customer.id}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <label className="block mb-1 font-semibold">Customer Flat</label>
        <input
          className="w-full border rounded-lg p-2"
          type="text"
          value={projectForm.cust_flat}
          onChange={(e) => handleFormChange('project', 'cust_flat', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Community</label>
        <input
          className="w-full border rounded-lg p-2"
          type="text"
          value={projectForm.cust_community}
          onChange={(e) => handleFormChange('project', 'cust_community', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Address</label>
        <input
          className="w-full border rounded-lg p-2"
          type="text"
          value={projectForm.cust_address}
          onChange={(e) => handleFormChange('project', 'cust_address', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Total Cost</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={projectForm.total_cost}
          onChange={(e) => handleFormChange('project', 'total_cost', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Total Paid</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          step="0.01"
          value={projectForm.total_paid}
          onChange={(e) => handleFormChange('project', 'total_paid', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Total Balance</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={projectForm.total_balance}
          onChange={(e) => handleFormChange('project', 'total_balance', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Signup Date</label>
        <input
          className="w-full border rounded-lg p-2"
          type="datetime-local"
          value={projectForm.signup_date ? projectForm.signup_date.replace(' ', 'T').substring(0, 16) : ''}
          onChange={(e) => handleFormChange('project', 'signup_date', e.target.value.replace('T', ' ') + ':00')}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Signup Percentage</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={projectForm.signup_percentage}
          onChange={(e) => handleFormChange('project', 'signup_percentage', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Weeks Planned</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={projectForm.weeks_planned}
          onChange={(e) => handleFormChange('project', 'weeks_planned', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Weeks Buffer</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={projectForm.weeks_buffer}
          onChange={(e) => handleFormChange('project', 'weeks_buffer', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Weeks Total</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer" 
          value={projectForm.weeks_total}
          onChange={(e) => handleFormChange('project', 'weeks_total', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">TNT Start Date</label>
        <input
          className="w-full border rounded-lg p-2"
          type="datetime-local"
          value={projectForm.tnt_start_date ? projectForm.tnt_start_date.replace(' ', 'T').substring(0, 16) : ''}
          onChange={(e) => handleFormChange('project', 'tnt_start_date', e.target.value.replace('T', ' ') + ':00')}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Estimated End Date</label>
        <input
          className="w-full border rounded-lg p-2"
          type="datetime-local"
          value={projectForm.est_end_date ? projectForm.est_end_date.replace(' ', 'T').substring(0, 16) : ''}
          onChange={(e) => handleFormChange('project', 'est_end_date', e.target.value.replace('T', ' ') + ':00')}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Actual End Date</label>
        <input
          className="w-full border rounded-lg p-2"
          type="datetime-local"
          value={projectForm.act_end_date ? projectForm.act_end_date.replace(' ', 'T').substring(0, 16) : ''}
          onChange={(e) => handleFormChange('project', 'act_end_date', e.target.value.replace('T', ' ') + ':00')}
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Current Status</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={projectForm.current_status}
          onChange={(e) => handleFormChange('project', 'current_status', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Project Documents</label>
        <input
          className="w-full border rounded-lg p-2"
          type="file"
          multiple
          accept=".pdf,image/*,video/*"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            setProjectDocuments(files);
          }}
        />
        {projectDocuments.length > 0 && (
          <div className="mt-2 text-xs text-gray-600">
            Selected: {projectDocuments.map(f => f.name).join(', ')}
          </div>
        )}
      </div>
    </>
  );
};

export default ProjectForm;
