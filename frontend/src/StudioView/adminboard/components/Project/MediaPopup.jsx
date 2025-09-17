import React, { useState, useEffect } from "react";
import { fetchSubtaskMediaFiles } from "../../../../services/studioapiservices";

export default function MediaPopup({ isOpen, onClose, subtaskId, subtaskName }) {
  const [mediaData, setMediaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && subtaskId) {
      fetchMediaData();
    }
  }, [isOpen, subtaskId]);

  const fetchMediaData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchSubtaskMediaFiles(subtaskId);
      if (response.data && response.data.success) {
        setMediaData(response.data.data[0]); // Get the first (and likely only) item
      } else {
        setError("No media data found");
      }
    } catch (err) {
      console.error("Error fetching media data:", err);
      setError("Failed to fetch media data");
    } finally {
      setLoading(false);
    }
  };

  const renderMediaSection = (title, mediaArray, type) => {
    if (!mediaArray || mediaArray.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          <i className="ri-image-line text-4xl mb-2"></i>
          <p>No {type} found</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {mediaArray.map((mediaPath, index) => (
          <div key={index} className="relative group">
            {type === 'images' ? (
              <img
                src={mediaPath}
                alt={`${title} ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => window.open(mediaPath, '_blank')}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : (
              <video
                src={mediaPath}
                className="w-full h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
                controls
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            )}
            <div 
              className="hidden absolute inset-0 bg-gray-100 rounded-lg items-center justify-center"
              style={{ display: 'none' }}
            >
              <div className="text-center text-gray-500">
                <i className="ri-error-warning-line text-2xl mb-2"></i>
                <p className="text-sm">Failed to load</p>
              </div>
            </div>
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              {type === 'images' ? 'IMG' : 'VID'}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Media Files</h2>
            <p className="text-sm text-gray-600 mt-1">
              {subtaskName || `Subtask #${subtaskId}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading media files...</span>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <i className="ri-error-warning-line text-red-500 mr-2"></i>
                <span className="text-red-700">{error}</span>
              </div>
            </div>
          )}

          {mediaData && !loading && (
            <div className="space-y-8">
              {/* Project Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Project Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Subtask ID:</span>
                    <span className="ml-2 text-gray-800">{mediaData.subTaskId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Project ID:</span>
                    <span className="ml-2 text-gray-800">{mediaData.projectId}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Main Task ID:</span>
                    <span className="ml-2 text-gray-800">{mediaData.mainTaskId}</span>
                  </div>
                </div>
              </div>

              {/* Before Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="ri-image-line mr-2 text-blue-600"></i>
                  Before Images
                  <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {mediaData.mediaPath?.images?.before?.length || 0}
                  </span>
                </h3>
                {renderMediaSection("Before", mediaData.mediaPath?.images?.before, 'images')}
              </div>

              {/* After Images */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="ri-image-line mr-2 text-green-600"></i>
                  After Images
                  <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {mediaData.mediaPath?.images?.after?.length || 0}
                  </span>
                </h3>
                {renderMediaSection("After", mediaData.mediaPath?.images?.after, 'images')}
              </div>

              {/* Before Videos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="ri-video-line mr-2 text-purple-600"></i>
                  Before Videos
                  <span className="ml-2 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                    {mediaData.mediaPath?.videos?.before?.length || 0}
                  </span>
                </h3>
                {renderMediaSection("Before", mediaData.mediaPath?.videos?.before, 'videos')}
              </div>

              {/* After Videos */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <i className="ri-video-line mr-2 text-orange-600"></i>
                  After Videos
                  <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                    {mediaData.mediaPath?.videos?.after?.length || 0}
                  </span>
                </h3>
                {renderMediaSection("After", mediaData.mediaPath?.videos?.after, 'videos')}
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {mediaData.mediaPath?.images?.before?.length || 0}
                    </div>
                    <div className="text-gray-600">Before Images</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {mediaData.mediaPath?.images?.after?.length || 0}
                    </div>
                    <div className="text-gray-600">After Images</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {mediaData.mediaPath?.videos?.before?.length || 0}
                    </div>
                    <div className="text-gray-600">Before Videos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {mediaData.mediaPath?.videos?.after?.length || 0}
                    </div>
                    <div className="text-gray-600">After Videos</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
