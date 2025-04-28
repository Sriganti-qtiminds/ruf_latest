// PaginationControls.js
import React from "react";
import tailwindStyles from "../../../utils/tailwindStyles";
import useListingStore from "../../../store/listingsStore";
import { ChevronRight, ChevronLeft } from "lucide-react";

const PaginationControls = () => {
  const { currentPage, pagination, setCurrentPage } = useListingStore();
  const { totalPages } = pagination;

  const handlePageChange = async (newPage) => {
    if (newPage !== currentPage && newPage > 0 && newPage <= totalPages) {
      await setCurrentPage(newPage);
    }
  };

  if (totalPages <= 1) return null;

  return (
    <div className={` flex justify-center items-center space-x-2 mt-6`}>
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${currentPage === 1 ? "hidden" : "block"} ${
          currentPage === 1
            ? `${tailwindStyles.thirdButton} cursor-not-allowed`
            : tailwindStyles.secondaryButton
        }`}
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
        const page = Math.max(1, currentPage - 2) + index;
        if (page > totalPages) return null;

        return (
          <button
            key={page}
            onClick={() => handlePageChange(page)}
            className={`w-6 h-6 border text-xs font-semibold  rounded-md ${
              page === currentPage
                ? "bg-blue-500 text-white hover:bg-blue-600 "
                : "bg-gray-100 hover:bg-gray-300"
            }`}
          >
            {page}
          </button>
        );
      })}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${currentPage === totalPages ? "hidden" : "block"} ${
          currentPage === totalPages
            ? `${tailwindStyles.thirdButton} cursor-not-allowed`
            : tailwindStyles.secondaryButton
        }`}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default PaginationControls;
