import React, { useState } from "react";
import { studioTailwindStyles } from "../../utils/studioTailwindStyles";

const Carousel = ({ media, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  if (!media || media.length === 0) return null;

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-gray-700 mb-2">{title}</h4>
      <div className="relative">
        {media[currentIndex].type === "image" ? (
          <img
            src={media[currentIndex].url}
            alt={`${title} ${currentIndex + 1}`}
            className="w-full h-32 sm:h-48 object-cover rounded-lg"
          />
        ) : (
          <video
            src={media[currentIndex].url}
            controls
            className="w-full h-32 sm:h-48 object-cover rounded-lg"
          />
        )}
        {media.length > 1 && (
          <>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 touch-pinch-zoom"
              onClick={handlePrev}
            >
              <i className="ri-arrow-left-s-line text-lg"></i>
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 touch-pinch-zoom"
              onClick={handleNext}
            >
              <i className="ri-arrow-right-s-line text-lg"></i>
            </button>
            <div className="flex justify-center mt-2 space-x-2">
              {media.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full cursor-pointer ${index === currentIndex ? "bg-[#E07A5F]" : "bg-gray-300"}`}
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

const ProjectDetailsModal = ({ project, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-opacity duration-300 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md sm:max-w-lg p-4 sm:p-6 transform transition-transform duration-300 scale-100 sm:scale-105 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-4">
          <h3 className={`${studioTailwindStyles.heading_3} text-gray-900 text-base sm:text-lg`}>{project.name}</h3>
          <button
            className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl font-bold"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <Carousel media={project.beforeMedia} title="Before" />
        <Carousel media={project.afterMedia} title="After" />
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700">Task</h4>
          <p className={`${studioTailwindStyles.paragraph_2} text-gray-600 mt-1 text-sm sm:text-base`}>
            {project.taskDescription}
          </p>
        </div>
        
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