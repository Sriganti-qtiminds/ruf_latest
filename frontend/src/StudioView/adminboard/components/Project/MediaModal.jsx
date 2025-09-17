import React from 'react';
import Modal from '../Modal';

const MediaModal = ({
  selectedSubTaskForMedia,
  setShowMediaModal,
  setSelectedSubTaskForMedia,
  setMediaUploadType,
  handleMediaUpload
}) => {
  if (!selectedSubTaskForMedia) return null;
  
  const hasMedia = selectedSubTaskForMedia.media_path && 
    (typeof selectedSubTaskForMedia.media_path === 'object' || 
     typeof selectedSubTaskForMedia.media_path === 'string');
  
  return (
    <Modal 
      title={`Media - ${selectedSubTaskForMedia.sub_task_name || `Sub Task #${selectedSubTaskForMedia.id}`}`}
      onClose={() => {
        setShowMediaModal(false);
        setSelectedSubTaskForMedia(null);
        setMediaUploadType('');
      }}
    >
      {hasMedia ? (
        <div className="space-y-4">
          {/* Display existing media */}
          {selectedSubTaskForMedia.media_path && typeof selectedSubTaskForMedia.media_path === 'object' && (
            <div className="space-y-4">
              {/* Images Section */}
              {selectedSubTaskForMedia.media_path.images && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-3 border-b pb-2">Images</h4>
                  
                  {/* Before Images */}
                  {selectedSubTaskForMedia.media_path.images.before && 
                   selectedSubTaskForMedia.media_path.images.before.files && 
                   selectedSubTaskForMedia.media_path.images.before.files.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Before Images:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedSubTaskForMedia.media_path.images.before.files.map((file, index) => (
                          <div key={`before-img-${index}`} className="relative group">
                            <img
                              src={file}
                              alt={`Before Image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-full h-32 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500 text-sm"
                              style={{ display: 'none' }}
                            >
                              <i className="ri-image-line text-2xl"></i>
                            </div>
                            <a
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <i className="ri-external-link-line text-white text-xl"></i>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* After Images */}
                  {selectedSubTaskForMedia.media_path.images.after && 
                   selectedSubTaskForMedia.media_path.images.after.files && 
                   selectedSubTaskForMedia.media_path.images.after.files.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">After Images:</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedSubTaskForMedia.media_path.images.after.files.map((file, index) => (
                          <div key={`after-img-${index}`} className="relative group">
                            <img
                              src={file}
                              alt={`After Image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div 
                              className="w-full h-32 bg-gray-200 rounded-lg border flex items-center justify-center text-gray-500 text-sm"
                              style={{ display: 'none' }}
                            >
                              <i className="ri-image-line text-2xl"></i>
                            </div>
                            <a
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100"
                            >
                              <i className="ri-external-link-line text-white text-xl"></i>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Videos Section */}
              {selectedSubTaskForMedia.media_path.videos && (
                <div>
                  <h4 className="font-semibold text-gray-800 text-lg mb-3 border-b pb-2">Videos</h4>
                  
                  {/* Before Videos */}
                  {selectedSubTaskForMedia.media_path.videos.before && 
                   selectedSubTaskForMedia.media_path.videos.before.files && 
                   selectedSubTaskForMedia.media_path.videos.before.files.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">Before Videos:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedSubTaskForMedia.media_path.videos.before.files.map((file, index) => (
                          <div key={`before-vid-${index}`} className="relative group">
                            <video
                              src={file}
                              className="w-full h-48 object-cover rounded-lg border"
                              controls
                            />
                            <a
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <i className="ri-external-link-line"></i>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* After Videos */}
                  {selectedSubTaskForMedia.media_path.videos.after && 
                   selectedSubTaskForMedia.media_path.videos.after.files && 
                   selectedSubTaskForMedia.media_path.videos.after.files.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-sm font-medium text-gray-600 mb-2">After Videos:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedSubTaskForMedia.media_path.videos.after.files.map((file, index) => (
                          <div key={`after-vid-${index}`} className="relative group">
                            <video
                              src={file}
                              className="w-full h-48 object-cover rounded-lg border"
                              controls
                            />
                            <a
                              href={file}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <i className="ri-external-link-line"></i>
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Add more media section */}
          <div className="border-t pt-4">
            <h4 className="font-semibold text-gray-800 text-lg mb-3">Add More Media</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Before Media</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleMediaUpload(e.target.files, 'before')}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">After Media</label>
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  onChange={(e) => handleMediaUpload(e.target.files, 'after')}
                  className="w-full border rounded-lg p-2 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* No media exists - show before/after options */
        <div className="space-y-6">
          <div className="text-center text-gray-600">
            <i className="ri-image-line text-4xl mb-2"></i>
            <p>No media uploaded yet</p>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="text-center">
              <label className="block text-lg font-semibold text-gray-800 mb-3">Before Media</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e.target.files, 'before')}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-2">Upload images and videos taken before work</p>
            </div>
            
            <div className="text-center">
              <label className="block text-lg font-semibold text-gray-800 mb-3">After Media</label>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={(e) => handleMediaUpload(e.target.files, 'after')}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
              />
              <p className="text-sm text-gray-500 mt-2">Upload images and videos taken after work</p>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default MediaModal;
