import React, { useState, useEffect } from 'react';

const DocumentsPopup = ({ project, isOpen, onClose }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [downloadingFiles, setDownloadingFiles] = useState(new Set());
  const [viewingFiles, setViewingFiles] = useState(new Set());

  // Fetch documents when popup opens
  useEffect(() => {
    if (isOpen && project) {
      fetchDocuments();
    }
  }, [isOpen, project]);

  const fetchDocuments = async () => {
    if (!project) return;

    setLoading(true);
    setError(null);

    try {
      const formattedId =
        project.project_formatted_id ||
        project.formatted_id ||
        project.project_id ||
        project.id;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/project/getProjectDocuments?project_formatted_id=${formattedId}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.status}`);
      }

      const data = await response.json();
      console.log("Documents API Response:", data);

      // ✅ Handle backend format: { success, data: [{ documents: [...] }] }
      const docs =
        data?.data?.[0]?.documents && Array.isArray(data.data[0].documents)
          ? data.data[0].documents
          : [];

      setDocuments(docs);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc, index) => {
    const fileId = doc.id || `${index}-${doc.name || "document"}`;

    try {
      setDownloadingFiles((prev) => new Set(prev).add(fileId));

      const fileUrl = doc.url;
      if (!fileUrl) {
        console.error("No valid URL found for document:", doc);
        alert("No download URL available for this document");
        return;
      }

      // Fetch and trigger download
      const response = await fetch(fileUrl);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = doc.name || "document";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Failed to download document. Please try again.");
    } finally {
      setDownloadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const handleView = (doc, index) => {
    const fileId = doc.id || `${index}-${doc.name || "document"}`;

    try {
      setViewingFiles((prev) => new Set(prev).add(fileId));

      const fileUrl = doc.url;
      if (!fileUrl) {
        console.error("No valid URL found for document:", doc);
        alert("No view URL available for this document");
        return;
      }

      // Open in new tab for viewing
      window.open(fileUrl, "_blank");
    } catch (error) {
      console.error("Error viewing document:", error);
      alert("Failed to open document. Please try again.");
    } finally {
      setViewingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const getFileIcon = (fileName) => {
    if (!fileName) return "ri-file-line";

    const extension = fileName.split(".").pop()?.toLowerCase();

    switch (extension) {
      case "pdf":
        return "ri-file-pdf-line";
      case "doc":
      case "docx":
        return "ri-file-word-line";
      case "xls":
      case "xlsx":
        return "ri-file-excel-line";
      case "ppt":
      case "pptx":
        return "ri-file-ppt-line";
      case "jpg":
      case "jpeg":
      case "png":
      case "gif":
      case "bmp":
      case "svg":
        return "ri-image-line";
      case "txt":
        return "ri-file-text-line";
      case "zip":
      case "rar":
      case "7z":
        return "ri-file-zip-line";
      case "mp4":
      case "avi":
      case "mov":
      case "wmv":
        return "ri-video-line";
      case "mp3":
      case "wav":
      case "flac":
        return "ri-music-line";
      default:
        return "ri-file-line";
    }
  };

  const canViewInBrowser = (fileName) => {
    if (!fileName) return false;

    const extension = fileName.split(".").pop()?.toLowerCase();
    const viewableTypes = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "svg",
      "txt",
      "mp4",
      "mp3",
    ];
    return viewableTypes.includes(extension);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              Project Documents
            </h2>
            <p className="text-gray-600 mt-1">
              {project?.project_name || `Project #${project?.id}`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <i className="ri-close-line text-2xl text-gray-500"></i>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading documents...</p>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 text-6xl mb-4">
                <i className="ri-error-warning-line"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                Error Loading Documents
              </h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchDocuments}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">
                <i className="ri-file-line"></i>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                No Documents Found
              </h3>
              <p className="text-gray-600">
                No documents are available for this project yet.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-600">
                  {documents.length} document
                  {documents.length !== 1 ? "s" : ""} found
                </p>
                <button
                  onClick={fetchDocuments}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <i className="ri-refresh-line mr-1"></i> Refresh
                </button>
              </div>

              <div className="grid gap-4">
                {documents.map((doc, index) => {
                  const fileId = doc.id || `${index}-${doc.name || "document"}`;
                  const isDownloading = downloadingFiles.has(fileId);
                  const isViewing = viewingFiles.has(fileId);

                  return (
                    <div
                      key={fileId}
                      className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl text-blue-500">
                            <i className={getFileIcon(doc.name)}></i>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-800 truncate">
                              {doc.name || `Document ${index + 1}`}
                            </h4>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleDownload(doc, index)}
                            disabled={isDownloading}
                            className={`px-3 py-1 rounded-lg transition-colors text-sm flex items-center ${
                              isDownloading
                                ? "bg-blue-300 text-white cursor-not-allowed"
                                : "bg-blue-500 text-white hover:bg-blue-600"
                            }`}
                          >
                            {isDownloading ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                Downloading...
                              </>
                            ) : (
                              <>
                                <i className="ri-download-line mr-1"></i> Download
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleView(doc, index)}
                            disabled={isViewing}
                            className={`px-3 py-1 rounded-lg transition-colors text-sm flex items-center ${
                              isViewing
                                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                            title={
                              canViewInBrowser(doc.name)
                                ? "View in browser"
                                : "Download to view"
                            }
                          >
                            {isViewing ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-500 mr-1"></div>
                                Opening...
                              </>
                            ) : (
                              <>
                                <i
                                  className={
                                    canViewInBrowser(doc.name)
                                      ? "ri-eye-line"
                                      : "ri-download-line"
                                  }
                                ></i>
                                <span className="ml-1">
                                  {canViewInBrowser(doc.name) ? "View" : "Open"}
                                </span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPopup;
