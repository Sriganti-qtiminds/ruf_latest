import React, { useState, useEffect } from "react";
import { studioTailwindStyles } from "../../utils/studioTailwindStyles";
import { fetchStudioMedia } from "../../services/studioapiservices";

const BASE_S3_URL = import.meta.env.VITE_STUDIO_ROOMS_BASE_S3_URL;

// Carousel component (unchanged)
const Carousel = ({ media, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  if (!media || media.length === 0) {
    return <p className="text-gray-500">No media available for {title}</p>;
  }

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <div className="relative">
        {media[currentIndex].type === "image" ? (
          <img
            src={media[currentIndex].url}
            alt={`${title} ${currentIndex + 1}`}
            className="w-full h-32 sm:h-48 object-cover rounded-lg"
            onError={(e) => console.error(`Failed to load image: ${media[currentIndex].url}`, e)}
          />
        ) : (
          <video
            src={media[currentIndex].url}
            controls
            className="w-full h-32 sm:h-48 object-cover rounded-lg"
            onError={(e) => console.error(`Failed to load video: ${media[currentIndex].url}`, e)}
          />
        )}
        {media.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              onClick={handlePrev}
            >
              ‹
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75"
              onClick={handleNext}
            >
              ›
            </button>
            <div className="flex justify-center mt-2 space-x-2">
              {media.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full cursor-pointer ${
                    index === currentIndex ? "bg-[#E07A5F]" : "bg-gray-300"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

// ProjectDetailsModal
const ProjectDetailsModal = ({ project, onClose }) => {
  console.log("Project:", project);
  const [beforeMedia, setBeforeMedia] = useState([]);
  const [afterMedia, setAfterMedia] = useState([]);

  // Fetch or process media when project changes
  useEffect(() => {
    if (!project?.id) {
      console.log("No project ID provided, skipping media fetch");
      setBeforeMedia([]);
      setAfterMedia([]);
      return;
    }

    const processMedia = async () => {
      try {
        let mediaData = [];

        // Check if media_path exists in project
        if (project.media_path && typeof project.media_path === "object") {
          console.log("Processing media_path from project:", project.media_path);
          const { images = {}, videos = {} } = project.media_path;

          // Process images and videos into { url, type, category } format
          const processMediaItems = (items, type) =>
            Object.entries(items)
              .filter(([category, urls]) => Array.isArray(urls) && urls.length > 0)
              .flatMap(([category, urls]) =>
                urls
                  .filter((url) => {
                    const isValidUrl =
                      typeof url === "string" &&
                      url.match(/\.(jpg|jpeg|png|gif|mp4|webm|ogg)$/i) &&
                      !url.endsWith("/");
                    if (!isValidUrl) {
                      console.warn(`Invalid or unsupported media URL in ${type} ${category}: ${url}`);
                    }
                    return isValidUrl;
                  })
                  .map((url) => {
                    const fullUrl = url.startsWith("http") ? url : `${BASE_S3_URL}/${url.replace(/^\//, "")}`;
                    return {
                      url: fullUrl,
                      type: type === "images" ? "image" : "video",
                      category,
                    };
                  })
              );

          mediaData = [
            ...processMediaItems(images, "images"),
            ...processMediaItems(videos, "videos"),
          ];
          console.log("Processed media from media_path:", mediaData);
        } else {
          // Fallback to API call if media_path is null or invalid
          console.log("Fetching media for sub_task_id:", project.id);
          const response = await fetchStudioMedia({ sub_task_id: project.id });
          mediaData = response;
          console.log(`Media from API for sub_task_id ${project.id}:`, mediaData);
        }

        // Categorize media into before and after
        const before = mediaData.filter((item) => item.category === "before");
        const after = mediaData.filter((item) => item.category === "after");

        console.log("Before Media:", before);
        console.log("After Media:", after);
        setBeforeMedia(before);
        setAfterMedia(after);
      } catch (error) {
        console.error("Failed to process media:", error);
        setBeforeMedia([]);
        setAfterMedia([]);
      }
    };

    processMedia();
  }, [project?.id]);

  if (!project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3
            className={`${studioTailwindStyles.heading_3} text-gray-900 text-base sm:text-lg`}
          >
            {project.sub_task_name}
          </h3>
          <button
            className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Media Carousels */}
        {beforeMedia.length > 0 && <Carousel media={beforeMedia} title="Before" />}
        {afterMedia.length > 0 && <Carousel media={afterMedia} title="After" />}

        {/* Task Description */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Task</h4>
          <p
            className={`${studioTailwindStyles.paragraph_2} text-gray-600 mt-1 text-sm sm:text-base`}
          >
            {project.sub_task_description}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 font-medium">
            Progress: {project.percent_complete}%
          </p>
          <div className="w-full bg-gray-200 h-2 rounded-full">
            <div
              className="h-2 rounded-full bg-[#E07A5F]"
              style={{ width: `${project.percent_complete}%` }}
            ></div>
          </div>
        </div>

        {/* Close button */}
        <button
          className="w-full bg-[#E07A5F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#d16a4f] transition-colors"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ProjectDetailsModal;