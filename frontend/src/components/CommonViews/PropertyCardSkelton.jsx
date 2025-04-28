import React from "react";

// Reusable Skeleton Box Component
const SkeletonBox = ({ className }) => (
  <div className={`bg-gray-200 animate-pulse rounded ${className}`}></div>
);

// Reusable InfoItem Skeleton
const InfoItemSkeleton = ({ addBorderRight, addBorderBottom }) => (
  <div
    className={`px-2 py-1 border-gray-300 text-center
      ${addBorderRight ? "border-r" : ""}
      ${addBorderBottom ? "border-b" : ""}`}
  >
    <SkeletonBox className="h-4 w-3/4 mx-auto mb-1" />
    <SkeletonBox className="h-3 w-1/2 mx-auto" />
  </div>
);

// Single Skeleton Card Component
const PropertyListingCardSkeleton = () => {
  const totalItems = 8; // Matches your detailEntries length (Rent/Month, Deposit, etc.)

  return (
    <div className="flex flex-col md:flex-row bg-white shadow-lg rounded-lg max-w-4xl p-4 md:p-3">
      <div className="flex flex-col md:w-[calc(50%-10px)] lg:w-[calc(50%-100px)] flex-shrink-0 md:flex-col mb-4 lg:mb-0 lg:mr-4">
        {/* Main Image Skeleton */}
        <SkeletonBox className="rounded-lg w-full h-36 lg:h-40 mb-2" />

        {/* Thumbnails Skeleton */}
        <div className="w-full md:h-14 overflow-x-auto whitespace-nowrap scroll-smooth [&::-webkit-scrollbar]:h-[3px] [&::-webkit-scrollbar-track]:white [&::-webkit-scrollbar-thumb]:bg-[#001433]">
          <div className="flex flex-row gap-2">
            {Array(4)
              .fill(0)
              .map((_, index) => (
                <SkeletonBox
                  key={index}
                  className="w-12 h-12 rounded border border-gray-300 flex-shrink-0"
                />
              ))}
          </div>
        </div>

        {/* Buttons Skeleton (Medium screens and up) */}
        <div className="hidden lg:hidden mt-2 justify-self-end md:flex items-center flex-col sm:flex-row sm:space-x-1">
          <SkeletonBox className="px-4 py-1 w-20 h-6 rounded-full" />
          <SkeletonBox className="px-4 py-1 w-6 h-6 rounded-full" />
          <SkeletonBox className="px-4 py-1 w-20 h-6 rounded-full" />
        </div>
      </div>

      {/* Property Details Section Skeleton */}
      <div className="flex flex-col md:ml-2 lg:ml-0 lg:min-w-[calc(50%+80px)] lg:max-w-[calc(50%+80px)]">
        <div className="px-1">
          <div className="flex items-center justify-between">
            <SkeletonBox className="h-6 w-3/4" />
            <SkeletonBox className="lg:hidden w-5 h-5 rounded-full" />{" "}
            {/* Replaces Heart */}
          </div>
          <SkeletonBox className="h-4 w-1/2 mt-1" />
        </div>

        <div className="mt-3 text-gray-800">
          <div className="grid grid-cols-2 lg:grid-cols-5 rounded-md border-4 border-gray-200">
            {Array(totalItems)
              .fill(0)
              .map((_, index) => {
                const isSmallScreen = window.innerWidth < 1023;
                const totalColumns = isSmallScreen ? 2 : 4;
                const isLastColumn = (index + 1) % totalColumns === 0;
                const isLastRow =
                  index >=
                  totalItems - (totalItems % totalColumns || totalColumns);

                return (
                  <InfoItemSkeleton
                    key={index}
                    addBorderRight={!isLastColumn}
                    addBorderBottom={!isLastRow}
                  />
                );
              })}
          </div>
        </div>

        {/* Action Buttons Skeleton (Large screens) */}
        <div className="mt-3 hidden lg:flex justify-self-end items-center flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <SkeletonBox className="px-4 py-1 w-48 h-6 rounded-md" />{" "}
          {/* Replaces RM button */}
          <SkeletonBox className="w-5 h-5 rounded-full" />{" "}
          {/* Replaces Heart */}
          <SkeletonBox className="w-5 h-5 rounded-full" />{" "}
          {/* Replaces MapPinHouse */}
          <SkeletonBox className="px-4 py-1 w-20 h-6 rounded-full" />{" "}
          {/* Replaces Amenities */}
        </div>

        {/* Action Buttons Skeleton (Mobile) */}
        <div className="mt-3 md:hidden flex items-center flex-row space-x-2">
          <SkeletonBox className="px-4 py-1 w-20 h-6 rounded-full" />{" "}
          {/* Replaces RM button */}
          <SkeletonBox className="w-5 h-5 rounded-full" />{" "}
          {/* Replaces MapPinHouse */}
          <SkeletonBox className="px-4 py-1 w-20 h-6 rounded-full" />{" "}
          {/* Replaces Amenities */}
        </div>
      </div>
    </div>
  );
};

// Wrapper Component to Render Two Skeleton Cards
const PropertyListingSkeletonLoader = () => {
  return (
    <div className="space-y-4">
      <PropertyListingCardSkeleton />
      <PropertyListingCardSkeleton />
    </div>
  );
};

export default PropertyListingSkeletonLoader;
