import React from 'react';
import Modal from '../Modal';

const DeleteModal = ({
  isDropdownDeleteMode,
  modalType,
  deleteSelection,
  setDeleteSelection,
  deleteList,
  selectedItem,
  handleConfirmDelete,
  closeAllModals
}) => {
  return (
    <Modal title="Delete Confirmation" onClose={() => { closeAllModals(); }}>
      {isDropdownDeleteMode ? (
        <>
          <div className="mb-4">
            <label className="block mb-2 font-semibold text-gray-700">
              Select {modalType === 'mainTask' ? 'Main Task' : 'Sub Task'} to Delete
            </label>
            <select
              className="w-full border rounded-lg p-2"
              value={deleteSelection || ''}
              onChange={e => setDeleteSelection(e.target.value)}
            >
              <option value="" disabled>Select one</option>
              {deleteList.map(item => (
                <option key={item.id} value={item.id}>{item.name}</option>
              ))}
            </select>
          </div>

          {deleteSelection && (
            <div className="mb-4 text-red-600 font-semibold">
              Warning: Are you sure you want to delete this {modalType === 'mainTask' ? 'Main Task' : 'Sub Task'}?
            </div>
          )}

          <div className="flex justify-center gap-4">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              onClick={() => {
                closeAllModals();
              }}
            >
              Cancel
            </button>
            <button
              className={`bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition ${!deleteSelection ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!deleteSelection}
              onClick={handleConfirmDelete}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center mb-6">
            Are you sure you want to delete this {modalType === 'project' ? 'project' : modalType === 'mainTask' ? 'main task' : 'sub task'}?
            {selectedItem && (
              <div className="font-semibold mt-2">
                {modalType === 'project' ? selectedItem.project_name : 
                 modalType === 'mainTask' ? selectedItem.main_task_name || `Main Task #${selectedItem.id}` : 
                 selectedItem.sub_task_name || `Sub Task #${selectedItem.id}`}
              </div>
            )}
          </div>
          <div className="flex justify-center gap-4">
            <button
              className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              onClick={() => closeAllModals()}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
              onClick={handleConfirmDelete}
            >
              Delete
            </button>
          </div>
        </>
      )}
    </Modal>
  );
};

export default DeleteModal;
