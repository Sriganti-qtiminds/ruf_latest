import { useState } from "react";
import { FaTrash } from "react-icons/fa";

const ImageModal = ({ modalData, handleDelete }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!modalData.images || modalData.images.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">No images available.</p>
    );
  }

  const totalImages = modalData.images.length;

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? totalImages - 1 : prevIndex - 1
    );
  };

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) =>
      prevIndex === totalImages - 1 ? 0 : prevIndex + 1
    );
  };

  return (
    <div className="relative w-1/2 justify-self-center">
      <img
        src={modalData.images[currentImageIndex] || "/placeholder.svg"}
        alt={`Image ${currentImageIndex + 1}`}
        className="w-full h-64 object-contain rounded-lg"
      />

      {/* Previous Button */}
      {totalImages > 1 && (
        <button
          onClick={prevImage}
          className="absolute top-1/2 left-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-200"
        >
          &lt;
        </button>
      )}

      {/* Next Button */}
      {totalImages > 1 && (
        <button
          onClick={nextImage}
          className="absolute top-1/2 right-0 transform -translate-y-1/2 bg-white p-2 rounded-full shadow hover:bg-gray-200"
        >
          &gt;
        </button>
      )}

      {/* Delete Image */}
      <FaTrash
        onClick={() => handleDelete(currentImageIndex)}
        className="absolute top-2 right-2 text-red-600 bg-white p-2 rounded-full cursor-pointer hover:text-red-800 hover:shadow-lg"
        size={34}
      />
    </div>
  );
};

export default ImageModal;
