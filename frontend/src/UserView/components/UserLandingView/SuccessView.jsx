import React from "react";
import PropertyListingCard from "./userLandingCardView";
import SimilarProperties from "./SimilarPropertyCard";

const SuccessView = ({ apiResponse, lastListingRef }) => {
  const listings = apiResponse.data || [];
  const resultsCount = apiResponse?.count?.resultsCount || 0;
  const similarCount = apiResponse?.count?.similarCount || 0;

  return (
    <div className="w-full">
      <div className="space-y-4">
        {listings.length > 0 ? (
          <>
            {resultsCount > 0 ? (
              <SimilarProperties
                propertyType="Filtered Properties"
                similarCount={resultsCount}
              />
            ) : (
              <div className="text-center text-lg font-semibold text-gray-800">
                We couldn't find an exact match, but here are some great alternatives:
              </div>
            )}

            {listings.map((property, index) => {
              const isLastItem = index === listings.length - 1;
              return (
                <div
                  key={property.id || index}
                  ref={isLastItem ? lastListingRef : null}
                >
                  {property.similarProperties === undefined ? (
                    <PropertyListingCard property={property} />
                  ) : (
                    <SimilarProperties
                      propertyType="Similar Properties"
                      similarCount={similarCount}
                    />
                  )}
                </div>
              );
            })}
          </>
        ) : (
          <div className="flex items-center justify-center min-h-[70vh] font-bold text-2xl">
            No Properties Found
          </div>
        )}
      </div>
    </div>
  );
};

export default SuccessView;
