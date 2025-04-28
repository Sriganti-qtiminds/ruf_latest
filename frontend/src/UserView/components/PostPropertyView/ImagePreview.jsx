import React from "react";

const ImagePreview = ({ imagePreviews, handleRemoveImage, openImageModal }) => {
  return (
    <div className="col-span-full mx-auto px-4">
      <p>{imagePreviews.length} Files Chosen</p>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {imagePreviews.map((preview, index) => (
          <div
            key={index}
            className="relative group cursor-pointer"
            onClick={() => openImageModal(preview)}
          >
            <img
              src={preview}
              alt={`Preview ${index + 1}`}
              className="w-full h-32 object-cover rounded-md border"
            />
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRemoveImage(index);
              }}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImagePreview;
