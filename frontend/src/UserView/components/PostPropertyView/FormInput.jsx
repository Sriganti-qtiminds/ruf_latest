


import React from "react";
import SearchableDropdown from "./SearchDropdownView";
import tailwindStyles from "../../../utils/tailwindStyles";

const FormInput = ({
  input,
  formData,
  handleInputChange,
  errors,
  loading,
  imagePreviews = [], // Added for image previews
  handleRemoveImage, // Added for removing images
  openImageModal, // Added for opening image modal
}) =>  {
  if (input.type === "dropdown") {
   
    return (
      <>
        <SearchableDropdown
          name={input.name}
          options={input.options}
          value={formData[input.name]}
          onChange={handleInputChange}
          placeholder={`Select ${input.label}`}
          isLoading={loading[input.name]}
          displayKey={input.displayKey || "name"}
          valueKey="id"
        />
        {errors[input.name] && (
          <p className="text-red-500 text-sm mt-1">{errors[input.name]}</p>
        )}
      </>
    );
  }

  if (input.type === "file") {
    return (
      <div className="mb-4">
       
        <input
          type="file"
          name="images" // Ensure name matches handleInputChange
          onChange={handleInputChange}
          multiple
          accept="image/jpeg,image/png,image/gif" // Restrict to common image types
          className={`${tailwindStyles.paragraph} w-full px-1 border-2 border-gray-400 rounded-md`}
        />
        <p className={`${tailwindStyles.paragraph} flex justify-end mt-1`}>
          Up to 10 Images {imagePreviews.length > 0 && `(${imagePreviews.length}/10)`}
        </p>
        {imagePreviews.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {imagePreviews.map((preview, index) => (
              <div key={index} className="relative">
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => openImageModal && openImageModal(preview)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage && handleRemoveImage(index)}
                  className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  title="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        {errors[input.name] && (
          <p className="text-red-500 text-sm mt-1">{errors[input.name]}</p>
        )}
      </div>
    );
  }

  return (
    <>
      <input
        type={input.type}
        name={input.name}
        value={formData[input.name] || ""}
        onChange={handleInputChange}
        className={`appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${tailwindStyles.paragraph} w-full p-1 border-2 border-gray-400 rounded-md ${
          (input.name === "floorNumber" || input.name === "flatNumber") &&
          formData.propertyType == "3"
            ? "opacity-50 bg-gray-200 cursor-not-allowed"
            : ""
        }`}
        placeholder={`Enter ${input.label}`}
        disabled={
          (input.name === "floorNumber" || input.name === "flatNumber") &&
          formData.propertyType == "3"
        }
        autoComplete="off"
      />
      {errors[input.name] && (
        <p className="text-red-500 text-sm mt-1">{errors[input.name]}</p>
      )}
    </>
  );
};

export default FormInput;
