
// export default UserLandingView;

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import apiStatusConstants from "../../../utils/apiStatusConstants";
import useListingStore from "../../../store/listingsStore";
import Cookies from "js-cookie";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;

import FilterSection from "./FilterView";
import SuccessView from "./SuccessView";
import PropertyListingCardSkeletonLoader from "../../../components/CommonViews/PropertyCardSkelton";
import FailureView from "../../../components/CommonViews/FailureView";

const InfiniteScrollLoader = ({ isVisible }) => (
  <div
    className={`flex justify-center items-center py-4 transition-opacity duration-500 ${
      isVisible ? "opacity-100" : "opacity-0"
    }`}
  >
    <div className="w-8 h-8 border-4 border-[#001433] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const UserLandingView = () => {
  const {
    apiResponse,
    pagination,
    currentPage,
    fetchListings,
    setCurrentPage,
  } = useListingStore();

  const [searchParams, setSearchParams] = useSearchParams();

  const jwtToken = Cookies.get(jwtSecretKey);

  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef(null);
  const lastListingRef = useRef(null);

  // Extract filters from query params
  const getFilterDataFromParams = () => {
    return {
      city: searchParams.get("city") || "",
      builders: searchParams.get("builders") || "",
      community: searchParams.get("community") || "",
      hometype: searchParams.get("hometype")?.split(",") || [],
      propertydescription:
        searchParams.get("propertydescription")?.split(",") || [],
      availability: searchParams.get("availability")?.split(",") || [],
      tenanttype: searchParams.get("tenanttype")?.split(",") || [],
    };
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const filterData = getFilterDataFromParams();
        await fetchListings(filterData, 1, 15);
        if (jwtToken === undefined) {
          localStorage.clear();
        }
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, [fetchListings, searchParams]);

  const handleObserver = useCallback(
    (entries) => {
      const target = entries[0];
      if (
        target.isIntersecting &&
        apiResponse.status === apiStatusConstants.success &&
        currentPage < pagination.totalPages &&
        !isLoadingMore
      ) {
        setIsLoadingMore(true);
        setTimeout(() => {
          setCurrentPage(currentPage + 1);
          const filterData = getFilterDataFromParams();
          fetchListings(filterData, currentPage + 1, 15);
        }, 500);
      }
    },
    [
      apiResponse.status,
      currentPage,
      pagination.totalPages,
      isLoadingMore,
      fetchListings,
    ]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: "100px",
      threshold: 0.2,
    });

    if (lastListingRef.current) {
      observer.observe(lastListingRef.current);
    }

    observerRef.current = observer;
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [handleObserver]);

  useEffect(() => {
    if (apiResponse.status === apiStatusConstants.success && isLoadingMore) {
      setTimeout(() => setIsLoadingMore(false), 400);
    }
  }, [apiResponse.status, isLoadingMore]);

  const handleFilterChange = (filters) => {
    fetchListings(filters, 1, 15);
  };

  const renderListings = () => {
    if (apiResponse.status === apiStatusConstants.initial) {
      return <PropertyListingCardSkeletonLoader />;
    }

    if (apiResponse.status === apiStatusConstants.inProgress) {
      return apiResponse.data.length === 0 ? (
        <PropertyListingCardSkeletonLoader />
      ) : (
        <>
          <SuccessView
            apiResponse={apiResponse}
            lastListingRef={lastListingRef}
          />
          <InfiniteScrollLoader isVisible={isLoadingMore} />
        </>
      );
    }

    if (apiResponse.status === apiStatusConstants.success) {
      return (
        <>
          <SuccessView
            apiResponse={apiResponse}
            lastListingRef={lastListingRef}
          />
          <InfiniteScrollLoader isVisible={isLoadingMore} />
        </>
      );
    }

    if (apiResponse.status === apiStatusConstants.failure) {
      return <FailureView />;
    }

    return null;
  };

  const [maxHeight, setMaxHeight] = useState("calc(100vh - 6.5rem)");

  useEffect(() => {
    const handleResize = () => {
      setMaxHeight(
        window.innerWidth < 450 ? "calc(100vh - 4rem)" : "calc(100vh - 6rem)"
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col bg-gray-200 items-center">
      <div className="w-full md:p-5">
        <div style={{ height: maxHeight }} className="grid md:grid-cols-10">
          <div className="hidden 2xl:block 2xl:col-span-1"></div>
          <div
            style={{ maxHeight: maxHeight }}
            className="md:col-span-4 lg:col-span-3 2xl:col-span-2 rounded-sm md:shadow-md"
          >
            <FilterSection
              setSearchParams={setSearchParams}
              currentPageChange={handleFilterChange} // Pass the callback
              searchParams={searchParams}
            />
          </div>
          <div
            style={{ maxHeight: maxHeight }}
            className="md:col-span-6 lg:col-span-7 2xl:col-span-6 rounded-l p-3 md:p-0 md:px-5 overflow-y-auto scroll-smooth [&::-webkit-scrollbar]:w-[3px] [&::-webkit-scrollbar-track]:white [&::-webkit-scrollbar-thumb]:bg-blue-300"
          >
            {renderListings()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLandingView;
