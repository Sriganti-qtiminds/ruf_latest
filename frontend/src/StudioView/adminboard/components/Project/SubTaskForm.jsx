import React from 'react';

const SubTaskForm = ({ 
  subTaskForm, 
  handleFormChange, 
  showEditModal, 
  selectedItem, 
  selectedMainTask, 
  getVendorNameById, 
  getCustomerNameById, 
  users, 
  siteManagers, 
  vendors, 
  approvalStatuses, 
  generateWeekOptions, 
  getTotalWeeksFromProject, 
  subTaskFiles, 
  setSubTaskFiles 
}) => {
  return (
    <>
      {showEditModal && (
        <div className="mb-4">
          {/* Edit selection removed as per original code */}
        </div>
      )}
      
      {!showEditModal && (
        <>
          <div>
            <label className="block mb-1 font-semibold">Main Task ID</label>
            <input
              className="w-full border rounded-lg p-2"
              type="integer"
              value={subTaskForm.main_task}
              onChange={(e) => handleFormChange('subTask', 'main_task', e.target.value)}
              required
              readOnly={!!selectedMainTask}
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Vendor</label>
            {selectedMainTask ? (
              <div className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700">
                {getVendorNameById(selectedMainTask.vendor_id)}
              </div>
            ) : (
              <select
                className="w-full border rounded-lg p-2"
                value={subTaskForm.vendor_id}
                onChange={(e) => handleFormChange('subTask', 'vendor_id', e.target.value)}
                required
              >
                <option value="">Select Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.ven_user_id}>
                    {vendor.vendor_user_name || vendor.vendor_name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold">Approver</label>
            <select
              className="w-full border rounded-lg p-2"
              value={subTaskForm.approver_id}
              onChange={(e) => handleFormChange('subTask', 'approver_id', e.target.value)}
              required
            >
              <option value="">Select Approver</option>
              {/* Regular Users */}
              {users.length > 0 && (
                <optgroup label="Users">
                  {users.map((user) => (
                    <option key={user.id} value={user.user_id || user.id}>
                      {user.user_name || user.name} {user.email ? `(${user.email})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {/* Site Managers */}
              {siteManagers.length > 0 && (
                <optgroup label="Site Managers">
                  {siteManagers.map((manager) => (
                    <option key={manager.id} value={manager.user_id || manager.id}>
                      {manager.user_name || manager.name} {manager.email ? `(${manager.email})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Approval Status</label>
            <select
              className="w-full border rounded-lg p-2"
              value={subTaskForm.approval_status}
              onChange={(e) => handleFormChange('subTask', 'approval_status', e.target.value)}
              required
            >
              <option value="">Select Status</option>
              {Object.entries(approvalStatuses).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Sub Task Name</label>
            <input
              className="w-full border rounded-lg p-2"
              type="text"
              value={subTaskForm.sub_task_name}
              onChange={(e) => handleFormChange('subTask', 'sub_task_name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Week Number</label>
            <select
              className="w-full border rounded-lg p-2"
              value={subTaskForm.week_no}
              onChange={(e) => handleFormChange('subTask', 'week_no', e.target.value)}
              required
            >
              <option value="">Select Week</option>
              {generateWeekOptions().map(option => (
                <option key={option.key} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {getTotalWeeksFromProject() === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No project selected or project has no weeks defined
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold">Sub Task Description</label>
            <textarea
              className="w-full border rounded-lg p-2"
              value={subTaskForm.sub_task_description}
              onChange={(e) => handleFormChange('subTask', 'sub_task_description', e.target.value)}
              required
            />
          </div>
          
          {/* File Upload Section */}
          <div className="space-y-3">
            <h4 className="font-semibold text-gray-700 border-b pb-1">Media Uploads</h4>
            
            {/* Before Images */}
            <div>
              <label className="block mb-1 font-semibold text-sm">Before Images</label>
              <input
                className="w-full border rounded-lg p-2"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setSubTaskFiles(prev => ({ ...prev, beforeImages: files }));
                }}
              />
              {subTaskFiles.beforeImages.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {subTaskFiles.beforeImages.map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            {/* After Images */}
            <div>
              <label className="block mb-1 font-semibold text-sm">After Images</label>
              <input
                className="w-full border rounded-lg p-2"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setSubTaskFiles(prev => ({ ...prev, afterImages: files }));
                }}
              />
              {subTaskFiles.afterImages.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {subTaskFiles.afterImages.map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            {/* Before Videos */}
            <div>
              <label className="block mb-1 font-semibold text-sm">Before Videos</label>
              <input
                className="w-full border rounded-lg p-2"
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setSubTaskFiles(prev => ({ ...prev, beforeVideos: files }));
                }}
              />
              {subTaskFiles.beforeVideos.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {subTaskFiles.beforeVideos.map(f => f.name).join(', ')}
                </div>
              )}
            </div>

            {/* After Videos */}
            <div>
              <label className="block mb-1 font-semibold text-sm">After Videos</label>
              <input
                className="w-full border rounded-lg p-2"
                type="file"
                multiple
                accept="video/*"
                onChange={(e) => {
                  const files = Array.from(e.target.files);
                  setSubTaskFiles(prev => ({ ...prev, afterVideos: files }));
                }}
              />
              {subTaskFiles.afterVideos.length > 0 && (
                <div className="mt-2 text-xs text-gray-600">
                  Selected: {subTaskFiles.afterVideos.map(f => f.name).join(', ')}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Current Values Display */}
      {showEditModal && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
          <h4 className="font-semibold text-gray-800 mb-2">Current Values</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div><span className="font-medium">Sub Task:</span> {selectedItem?.sub_task_name || `Sub Task #${selectedItem?.id}`}</div>
            <div><span className="font-medium">Main Task:</span> {selectedItem?.main_task}</div>
            <div><span className="font-medium">Vendor:</span> {getVendorNameById(selectedItem?.vendor_id)}</div>
            <div><span className="font-medium">Completed:</span> {selectedItem?.percent_complete}%</div>
            <div><span className="font-medium">Approver:</span> {getCustomerNameById(selectedItem?.approver_id)}</div>
            <div><span className="font-medium">Approval ID:</span> {selectedItem?.approval_id || 'Not set'}</div>
            <div><span className="font-medium">Current Status:</span> {approvalStatuses[selectedItem?.approval_status] || 'Unknown'}</div>
          </div>
        </div>
      )}

      {/* Editable Fields for Edit Modal */}
      {showEditModal && (
        <>
          <div>
            <label className="block mb-1 font-semibold">Main Task ID</label>
            <input
              className="w-full border rounded-lg p-2"
              type="integer"
              value={subTaskForm.main_task}
              onChange={(e) => handleFormChange('subTask', 'main_task', e.target.value)}
              required
              readOnly
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Vendor</label>
            <div className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700">
              {getVendorNameById(subTaskForm.vendor_id)}
            </div>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Approver</label>
            <select
              className="w-full border rounded-lg p-2"
              value={subTaskForm.approver_id}
              onChange={(e) => handleFormChange('subTask', 'approver_id', e.target.value)}
              required
            >
              <option value="">Select Approver</option>
              {/* Regular Users */}
              {users.length > 0 && (
                <optgroup label="Users">
                  {users.map((user) => (
                    <option key={user.id} value={user.user_id || user.id}>
                      {user.user_name || user.name} {user.email ? `(${user.email})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
              {/* Site Managers */}
              {siteManagers.length > 0 && (
                <optgroup label="Site Managers">
                  {siteManagers.map((manager) => (
                    <option key={manager.id} value={manager.user_id || manager.id}>
                      {manager.user_name || manager.name} {manager.email ? `(${manager.email})` : ''}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Approval Status</label>
            <select
              className="w-full border rounded-lg p-2"
              value={subTaskForm.approval_status}
              onChange={(e) => handleFormChange('subTask', 'approval_status', e.target.value)}
              required
            >
              <option value="">Select Status</option>
              {Object.entries(approvalStatuses).map(([key, value]) => (
                <option key={key} value={key}>{value}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-semibold">Week Number</label>
                    <select
                      className="w-full border rounded-lg p-2"
                      value={subTaskForm.week_no}
                      onChange={(e) => handleFormChange('subTask', 'week_no', e.target.value)}
                      required
                    >
                      <option value="">Select Week</option>
                      {generateWeekOptions().map(option => (
                        <option key={option.key} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
            {getTotalWeeksFromProject() === 0 && (
              <p className="text-xs text-gray-500 mt-1">
                No project selected or project has no weeks defined
              </p>
            )}
          </div>
          <div>
            <label className="block mb-1 font-semibold">Sub Task Name</label>
            <input
              className="w-full border rounded-lg p-2"
              type="text"
              value={subTaskForm.sub_task_name}
              onChange={(e) => handleFormChange('subTask', 'sub_task_name', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Sub Task Description</label>
            <textarea
              className="w-full border rounded-lg p-2"
              value={subTaskForm.sub_task_description}
              onChange={(e) => handleFormChange('subTask', 'sub_task_description', e.target.value)}
              required
            />
          </div>
        </>
      )}
    </>
  );
};

export default SubTaskForm;
