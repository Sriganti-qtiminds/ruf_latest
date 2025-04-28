
import React from "react";
import PropertyListingCard from "./userLandingCardView";
import SimilarProperties from "./SimilarPropertyCard";

const SuccessView = ({ apiResponse, lastListingRef }) => {
  const listings = apiResponse.data || [];

  return (
    <div className="w-full">
      <div className="space-y-4">
        {listings.length > 0 ? (
          <>
            {/* <div>
              Filtered Properties: {apiResponse?.count?.resultsCount || 0}
            </div> */}
            {(apiResponse?.count?.resultsCount || 0) > 0 && (
              <div>
                <SimilarProperties
                  propertyType="Filtered Properties"
                  similarCount={apiResponse?.count?.resultsCount || 0}
                />
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
                    // <div>
                    //   Similar Properties:{" "}
                    //   {apiResponse?.count?.similarCount || "--"}
                    // </div>
                    <div>
                      <SimilarProperties
                        propertyType="Similar Properties"
                        similarCount={apiResponse?.count?.similarCount || 0}
                      />
                    </div>
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
