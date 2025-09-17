import React from 'react';

const MainTaskForm = ({ 
  mainTaskForm, 
  handleFormChange, 
  showEditModal, 
  mainTasks, 
  selectedItem, 
  setSelectedItem, 
  setMainTaskForm, 
  selectedProject, 
  vendors 
}) => {
  return (
    <>
      {showEditModal && (
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Select Main Task to Edit</label>
          <select 
            className="w-full border rounded-lg p-2"
            onChange={(e) => {
              const selectedId = e.target.value;
              const task = mainTasks.find(task => task.id.toString() === selectedId);
              if (task) {
                console.log('Selected main task for editing:', task);
                setSelectedItem(task);
                setMainTaskForm(task);
              }
            }}
            value={selectedItem?.id || ''}
          >
            <option value="">Select Main Task</option>
            {mainTasks.map(task => (
              <option key={task.id} value={task.id}>{task.main_task_name || `Main Task #${task.id}`}</option>
            ))}
          </select>
        </div>
      )}
      <div>
        <label className="block mb-1 font-semibold">Project ID</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={mainTaskForm.project_id}
          onChange={(e) => handleFormChange('mainTask', 'project_id', e.target.value)}
          required
          readOnly={!!selectedProject || showEditModal}
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Main Task Name</label>
        <input
          className="w-full border rounded-lg p-2"
          type="text"
          value={mainTaskForm.main_task_name}
          onChange={(e) => handleFormChange('mainTask', 'main_task_name', e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block mb-1 font-semibold">Vendor</label>
        <select
          className="w-full border rounded-lg p-2"
          value={mainTaskForm.vendor_id}
          onChange={(e) => handleFormChange('mainTask', 'vendor_id', e.target.value)}
          required
        >
          <option value="">Select Vendor</option>
          {vendors.map((vendor) => (
            <option key={vendor.ven_user_id} value={vendor.ven_user_id}>
              {vendor.vendor_user_name || vendor.vendor_name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="block mb-1 font-semibold">Task Cost</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          value={mainTaskForm.task_cost}
          onChange={(e) => handleFormChange('mainTask', 'task_cost', e.target.value)}
          required
          readOnly={showEditModal}
        />
      </div>
      {/* <div>
        <label className="block mb-1 font-semibold">Total Task Cost</label>
        <input
          className="w-full border rounded-lg p-2"
          type="integer"
          step="0.01"
          value={mainTaskForm.total_task_cost}
          onChange={(e) => handleFormChange('mainTask', 'total_task_cost', e.target.value)}
          required
          readOnly={showEditModal}
        />
      </div> */}
    </>
  );
};

export default MainTaskForm;
