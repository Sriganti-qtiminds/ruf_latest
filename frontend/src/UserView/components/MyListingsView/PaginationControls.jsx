

import React from "react";
import tailwindStyles from "../../../utils/tailwindStyles";
import useUserListingsStore from "../../../store/userListingsStore";

const PaginationControls = ({ userId }) => {
  const { currentPage, totalPages, setCurrentPage, fetchUserListings } = useUserListingsStore();

  const handlePageChange = async (newPage) => {
    if (newPage !== currentPage && newPage > 0 && newPage <= totalPages) {
      await setCurrentPage(newPage); // Update the page in the store
      await fetchUserListings(userId, true); // Force refresh listings (assuming userId is available elsewhere or passed as prop)
      window.scrollTo(0, 0); // Smooth scrolling to the top
    }
  };

  if (totalPages <= 1) return null; // Simplified: only one check needed

  // Create an array of page numbers to display
  const pageNumbers = Array.from(
    { length: Math.min(5, totalPages) },
    (_, index) => {
      const page = Math.max(1, currentPage - 2) + index; // Center around currentPage
      return page <= totalPages ? page : null;
    }
  ).filter(Boolean);

  return (
    <div className="flex justify-center items-center space-x-2 mt-6">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${
          currentPage === 1
            ? `${tailwindStyles.thirdButton} cursor-not-allowed`
            : tailwindStyles.secondaryButton
        }`}
      >
        Previous
      </button>

      {pageNumbers.map((page) => (
        <button
          key={page}
          onClick={() => handlePageChange(page)}
          className={`w-6 h-6 border text-xs font-semibold rounded-md ${
            page === currentPage
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-100 hover:bg-gray-300"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${
          currentPage === totalPages
            ? `${tailwindStyles.thirdButton} cursor-not-allowed`
            : tailwindStyles.secondaryButton
        }`}
      >
        Next
      </button>
    </div>
  );
};

export default PaginationControls;
