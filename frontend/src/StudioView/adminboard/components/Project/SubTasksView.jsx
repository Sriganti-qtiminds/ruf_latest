import React, { useState } from 'react';
import MediaPopup from './MediaPopup';

const SubTasksView = ({
  subTasks,
  mainTasks,
  searchQuery,
  setSearchQuery,
  selectedMainTask,
  handleBackToMainTasks,
  handleAdd,
  handleEdit,
  getVendorNameById,
  getCustomerNameById,
  getStatusColor,
  approvalStatuses,
  setSubTasks,
  setSelectedItem,
  setSelectedSubTaskForMedia,
  setShowMediaModal
}) => {
  const [showMediaPopup, setShowMediaPopup] = useState(false);
  const [selectedSubtaskForMedia, setSelectedSubtaskForMedia] = useState(null);
  // Filter sub tasks by search
  const q = searchQuery.trim().toLowerCase();
  const filtered = q
    ? subTasks.filter((t) => {
        const values = [
          t.id,
          t.sub_task_name,
          t.sub_task_description,
          t.vendor_id,
          t.approver_id,
          t.approval_status,
          t.main_task,
        ]
          .filter(Boolean)
          .map((v) => String(v).toLowerCase());
        return values.some((v) => v.includes(q));
      })
    : subTasks;

  return (
    <div className="flex-1 w-full h-full">
      <div className="flex items-center gap-4 mb-8 px-2 sm:px-8 pt-8">
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold shadow"
          onClick={handleBackToMainTasks}
        >
          <span className="inline text-xl ">←</span> 
          <span className="hidden lg:inline "> Back to Main Tasks</span>
        </button>
        <div className="flex items-center gap-4 flex-1">
          <h2 className="text-base sm:text-lg md:text-xl  font-bold">Sub Tasks for {selectedMainTask?.main_task_name}</h2>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sub tasks..."
            className="flex-1 max-w-md border rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-2 ml-auto">
          <button
            className="bg-[#E07A5F] text-white px-5 py-2 rounded-lg shadow hover:scale-105 transition-transform font-medium text-lg"
            onClick={() => handleAdd('subTask')}
          >
            <span className="inline ">+</span>
            <span className="hidden lg:inline"> Add Sub Task</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 px-2 sm:px-8 pb-8">
        {filtered.map((subTask) => (
          <div
            key={subTask.id}
            className="bg-white rounded-lg shadow p-3 border border-gray-200 flex flex-col gap-1 text-sm"
          >
            <div className="font-bold text-base mb-1">{subTask.sub_task_name || `Sub Task #${subTask.id}`}</div>
            <div className="text-gray-700 text-sm mb-1">Main Task: <span className="font-medium">
              {subTask.main_task_name }
            </span></div>
            <div className="text-gray-700 text-sm mb-1">Description: <span className="font-medium">{subTask.sub_task_description || '-'}</span></div>
            <div className="text-gray-700 text-sm mb-1">Vendor: <span className="font-medium">{getVendorNameById(subTask.vendor_id)}</span></div>
            {/* <div className="text-gray-700 text-sm mb-1">Completed: <span className="font-medium">{subTask.percent_complete != null ? subTask.percent_complete + '%' : '-'}</span></div> */}
            <div className="text-gray-700 text-sm mb-1">Approver: <span className="font-medium">{getCustomerNameById(subTask.approver_id)}</span></div>
            <div className="text-gray-700 text-sm mb-1">
              Status: <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subTask.approval_status)}`}>
                {approvalStatuses[subTask.approval_status] || 'Unknown'}
              </span>
            </div>
            <div className="text-gray-700 text-base mb-1">
              Media: 
              <button
                onClick={() => {
                  setSelectedSubtaskForMedia(subTask);
                  setShowMediaPopup(true);
                }}
                className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium transition-colors ml-2"
              >
                <i className="ri-image-line"></i>
                View Media Files
              </button>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-2 pt-2 border-t border-gray-200 flex gap-2">
              <button
                onClick={() => {
                  setSelectedItem(subTask);
                  handleEdit(subTask, 'subTask');
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
              >
                <i className="ri-edit-line"></i>
                Edit
              </button>
              <button
                onClick={async () => {
                  if (window.confirm(`Are you sure you want to delete "${subTask.sub_task_name || `Sub Task #${subTask.id}`}"? This action cannot be undone.`)) {
                    try {
                      const res = await fetch(`${import.meta.env.VITE_API_URL}/subtask/deleteStudioSubTask?id=${subTask.id}`, {
                        method: 'DELETE',
                      });
                      if (res.ok) {
                        setSubTasks(prev => prev.filter(t => t.id.toString() !== subTask.id.toString()));
                        setSelectedItem(null);
                      } else {
                        alert('Failed to delete sub task.');
                      }
                    } catch (err) {
                      alert('Error deleting sub task.');
                    }
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded text-xs font-medium transition-colors"
              >
                <i className="ri-delete-bin-line"></i>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Media Popup */}
      <MediaPopup
        isOpen={showMediaPopup}
        onClose={() => {
          setShowMediaPopup(false);
          setSelectedSubtaskForMedia(null);
        }}
        subtaskId={selectedSubtaskForMedia?.id}
        subtaskName={selectedSubtaskForMedia?.sub_task_name}
      />
    </div>
  );
};

export default SubTasksView;
