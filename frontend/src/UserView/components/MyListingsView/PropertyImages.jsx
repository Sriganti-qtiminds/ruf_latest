import { useState } from "react";

const PropertyImages = ({ property }) => {
  const [mainImage, setMainImage] = useState(property.images[0] || ""); // Default to the first image if available

  const handleThumbnailClick = (imageUrl) => {
    setMainImage(imageUrl); // Change the main image when a thumbnail is clicked
  };

  return (
    <div className="flex flex-col gap-2 items-center lg:flex-row-reverse w-full space-y-0 lg:space-y-4">
      {/* Main Image */}
      {mainImage ? (
        <img
          src={mainImage} // Display the selected main image
          alt="Property"
          className="w-[80%] h-32 object-cover md:h-54 lg:h-60 rounded-lg" // Changed object-fit to object-cover for better responsiveness
        />
      ) : (
        <div className="w-full h-32 md:h-54 lg:h-60 bg-gray-200 rounded-lg animate-pulse"></div>
      )}

      {/* Thumbnails */}
      <div className="flex w-full lg:w-[24%] md:gap-2 lg:flex-col space-x-2 md:space-x-0 overflow-x-auto max-h-52 lg:overflow-y-auto lg:overflow-x-hidden scroll-smooth [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar]:h-[4px] [&::-webkit-scrollbar-track]:white  [&::-webkit-scrollbar-thumb]:bg-blue-500">
        {property.images
          ? property.images.slice(0, 5).map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Thumbnail ${index + 1}`}
                className={`min-w-12 min-h-12 max-w-12 max-h-12 lg:min-w-14 lg:min-h-14 lg:max-w-14 lg:max-h-14 object-fit rounded-lg cursor-pointer hover:border-2 hover:border-blue-500 ${mainImage == img && "border-2 border-blue-500"}`}
                onClick={() => handleThumbnailClick(img)} // Change the main image on thumbnail click
              />
            ))
          : Array.from({ length: 5 }).map((_, index) => (
              <div
                key={index}
                className="min-w-12 min-h-12 max-w-12 max-h-12 bg-gray-400 rounded-lg animate-pulse"
              ></div>
            ))}
      </div>
    </div>
  );
};

export default PropertyImages;
