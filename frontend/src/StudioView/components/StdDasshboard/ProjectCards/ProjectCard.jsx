import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useState, useEffect } from "react";

const ProjectCards = ({ projects, selectedProject, setSelectedProject }) => {
  const [currentStartIndex, setCurrentStartIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  // Update cards per view based on window width
  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width < 640) setCardsPerView(1);       // Mobile
      else if (width < 1024) setCardsPerView(2); // Tablet
      else setCardsPerView(3);                    // Desktop
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  // Calculate max start index for navigation boundaries
  const maxStartIndex = Math.max(0, projects.length - cardsPerView);

  const handlePrev = () => {
    setCurrentStartIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleNext = () => {
    setCurrentStartIndex((prev) => Math.min(prev + 1, maxStartIndex));
  };

  if (projects.length === 0) {
    return (
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Projects</h2>
        <div className="bg-white p-4 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-center">
          <p className="text-sm text-gray-500">
            No projects available. Please check your project data or contact support.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 relative">
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Projects</h2>

      {/* Carousel container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500"
          style={{
            transform: `translateX(-${(100 / cardsPerView) * currentStartIndex}%)`,
            width: `${(projects.length * 100) / cardsPerView}%`,
          }}
        >
          {projects.map((project) => (
            <div
              key={project.id}
              className="flex-shrink-0 px-2"
              style={{ width: `${100 / cardsPerView}%` }}
            >
              <div
                className={`p-4 rounded-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] cursor-pointer transition-all duration-200 ${
                  selectedProject === project.id
                    ? "bg-blue-50 border-2 border-blue-500"
                    : "bg-white hover:bg-gray-50"
                }`}
                onClick={() => setSelectedProject(project.id)}
              >
                <h3 className="text-lg font-medium text-gray-900">{project.id}</h3>

                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Owner:</span> {project.ownerName || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Vendor:</span> {project.vendorName || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Community:</span> {project.communityName || "N/A"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Document:</span>{" "}
                  {project.document ? (
                    <a
                      href={project.document}
                      className="text-blue-500 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      View Document
                    </a>
                  ) : (
                    "N/A"
                  )}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Status:</span> {project.status || "In Progress"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Start Date:</span> {project.startDate || "N/A"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <button
        onClick={handlePrev}
        disabled={currentStartIndex === 0}
        className={`absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow mt-6 ${
          currentStartIndex === 0 ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
        }`}
        aria-label="Previous"
      >
        <ChevronLeft />
      </button>
      <button
        onClick={handleNext}
        disabled={currentStartIndex >= maxStartIndex}
        className={`absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow mt-6 ${
          currentStartIndex >= maxStartIndex ? "opacity-40 cursor-not-allowed" : "hover:bg-gray-100"
        }`}
        aria-label="Next"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default ProjectCards;
