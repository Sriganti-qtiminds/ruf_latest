
// export default ImageModal;

import React from "react";

const ImageModal = ({ isOpen, room, imageIndex, category, closeModal }) => {
  if (!isOpen || !room) return null;

  const [currentImageIndex, setCurrentImageIndex] = React.useState(imageIndex);

  const handleThumbnailClick = (index) => {
    setCurrentImageIndex(index);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/80 z-[1000] flex items-center justify-center transition-opacity duration-300 ${
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl w-full max-w-[95%] sm:max-w-4xl max-h-[90vh] flex flex-col sm:flex-row overflow-hidden relative m-4 sm:m-0 transition-transform duration-300">
        {/* Main Image */}
        <div className="flex-1 p-4 sm:p-6 relative">
          <img
            src={room.images[currentImageIndex].url}
            alt={`${room.title} ${room.images[currentImageIndex].category} Image ${room.images[currentImageIndex].index + 1}`}
            className="w-full h-[40vh] md:h-full object-contain rounded-lg"
          />
          {/* Category Label for Main Image */}
          <span className="absolute top-4 left-4 text-sm font-medium text-white bg-gradient-to-br from-[#E07A5F] to-[#7C9A92] px-3 py-1 rounded-full">
            {room.images[currentImageIndex].category.charAt(0).toUpperCase() +
              room.images[currentImageIndex].category.slice(1)}
          </span>
        </div>
        {/* Thumbnails */}
        <div className="flex-none w-full md:w-64 p-4 overflow-y-auto flex flex-row sm:flex-col gap-2 sm:gap-3">
          {room.images.map((img, index) => (
            <div
              key={`${img.category}-${img.index}`}
              className={`flex-none w-24 sm:w-full aspect-[3/2] rounded-lg overflow-hidden cursor-pointer transition-all duration-300 shadow-[2px_2px_5px_rgba(0,0,0,0.1),-2px_-2px_5px_rgba(255,255,255,0.1)] ${
                index === currentImageIndex
                  ? "border-2 border-amber-400 shadow-[0_0_0_3px_rgba(251,191,36,0.2)]"
                  : "hover:scale-105 hover:shadow-[0_0_10px_rgba(251,191,36,0.3)]"
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <div className="relative w-full h-full">
                <img
                  src={img.url}
                  alt={`${room.title} ${img.category} Thumbnail ${img.index + 1}`}
                  className="w-full h-full object-cover"
                />
                {/* Category Label for Thumbnail */}
                {/* <span className="absolute top-2 left-2 text-xs font-medium text-white bg-gradient-to-br from-[#E07A5F] to-[#7C9A92] px-2 py-0.5 rounded-full">
                  {img.category.charAt(0).toUpperCase() + img.category.slice(1)}
                </span> */}
                <span className="absolute top-2 left-2 text-xs font-medium text-white bg-gradient-to-br from-black to-black/30 px-2 py-0.5 rounded-full">
                  {img.category.charAt(0).toUpperCase() + img.category.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
        {/* Close Button */}
        <div
          className="absolute top-3 right-3 bg-black/50 text-white w-10 h-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 hover:bg-black/70 hover:scale-110"
          onClick={closeModal}
        >
          ✕
        </div>
      </div>
    </div>
  );
};

export default ImageModal;
