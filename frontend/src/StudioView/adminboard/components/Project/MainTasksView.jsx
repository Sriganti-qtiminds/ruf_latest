import React from 'react';

const MainTasksView = ({
  mainTasks,
  searchQuery,
  setSearchQuery,
  selectedProject,
  handleBackToProjects,
  handleAdd,
  handleEdit,
  handleMainTaskSelect,
  getVendorNameById,
  setMainTasks,
  setSelectedItem
}) => {
  // Filter main tasks by search
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? mainTasks.filter((t) => {
        const values = [
          t.id,
          t.main_task_name,
          t.vendor_id,
          t.start_date,
          t.end_date,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        return values.some((v) => v.includes(q));
      })
    : mainTasks;

  return (
    <div className="flex-1 w-full h-full">
      <div className="flex items-center gap-4 mb-8 px-2 sm:px-8 pt-8">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow"
          onClick={handleBackToProjects}
        >
          <span className="inline text-xl ">←</span>
          <span className="hidden lg:inline "> Back to Projects</span>
        </button>
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-base sm:text-lg md:text-xl font-bold">Main Tasks for {selectedProject?.project_name || selectedProject?.id}</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search main tasks..."
            className="flex-1 max-w-md border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="bg-[#E07A5F] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform font-medium text-lg"
            onClick={() => handleAdd('mainTask')}
          >
            <span className="inline ">+</span>
            <span className="hidden lg:inline"> Add Main Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-2 sm:px-8 pb-8">
        {filtered.map((mainTask) => (
          <div
            key={mainTask.id}
            className="bg-white rounded-lg shadow p-3 border border-gray-200 flex flex-col gap-2 text-sm cursor-pointer hover:scale-105 transition-transform hover:border-blue-500 hover:bg-blue-50"
            onClick={() => handleMainTaskSelect(mainTask)}
          >
            <div className="flex-1">
              <div className="text-gray-700 text-sm mb-0.5">Main Task: <span className="font-medium">{mainTask.main_task_name || `Task #${mainTask.id}`}</span></div>
              <div className="text-gray-700 text-sm mb-0.5">Vendor: <span className="font-medium">{getVendorNameById(mainTask.vendor_id)}</span></div>
              <div className="text-gray-700 text-sm mb-0.5">Cost: <span className="font-medium">₹{mainTask.task_cost?.toLocaleString() || '-'}</span></div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 mt-2">
              <button
                className="py-1.5 px-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors text-xs font-medium"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(mainTask, 'mainTask');
                }}
                title="Edit Main Task"
              >
                <i className="ri-edit-line"></i>
              </button>
              <button
                className="py-1.5 px-2 rounded-md bg-red-500 text-white hover:bg-red-600 transition-colors text-xs font-medium"
                onClick={async (e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete "${mainTask.main_task_name || `Main Task #${mainTask.id}`}"? This action cannot be undone.`)) {
                    try {
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/maintask/deleteStudioMainTask?id=${mainTask.id}`, {
                        method: 'DELETE',
                      });
                      if (res.ok) {
                        setMainTasks(prev => prev.filter(t => t.id.toString() !== mainTask.id.toString()));
                        setSelectedItem(null);
                      } else {
                        alert('Failed to delete main task.');
                      }
                    } catch (err) {
                      alert('Error deleting main task.');
                    }
                  }
                }}
                title="Delete Main Task"
              >
                <i className="ri-delete-bin-line"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainTasksView;
