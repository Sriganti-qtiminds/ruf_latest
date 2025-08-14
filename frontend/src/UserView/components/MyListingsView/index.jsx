import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

import apiStatusConstants from "../../../utils/apiStatusConstants";
import LoadingView from "../../../components/CommonViews/LoadingView";
import FailureView from "../../../components/CommonViews/FailureView";
import MyListingCardView from "./MyListingCardView";
import { useRoleStore } from "../../../store/roleStore";
import useUserListingsStore from "../../../store/userListingsStore";
import PaginationControls from "./PaginationControls"; // Import the new PaginationControls component
import Cookies from "js-cookie";
import tailwindStyles from "../../../utils/tailwindStyles";

const jwtSecretKey = `${import.meta.env.VITE_JWT_SECRET_KEY}`;


// Animated component with inline styles and left-to-right animation
const AnimatedMessage = () => {
  return (
    <>
      {/* Define keyframes inline */}
      <style>
        {`
          @keyframes slideText {
            0% {
              transform: translateX(-100vw); /* Start from far left (off-screen) */
              opacity: 0;
            }
            20% {
              transform: translateX(0); /* Move to center */
              opacity: 1;
            }
            60% {
              transform: translateX(0); /* Stay in center for 4 seconds */
              opacity: 1;
            }
            80% {
              transform: translateX(100vw); /* Move to far right (off-screen) */
              opacity: 0;
            }
            100% {
              transform: translateX(100vw); /* Ensure it stays off-screen until reset */
              opacity: 0;
            }
          }
        `}
      </style>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
         marginBottom: "1rem",
          overflow: "hidden", 
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
           
            animation: "slideText 10s 5", 
          }}
        >
          
          <p className={`${tailwindStyles.heading_2}`}
           
          >
            No Brokerage is Charged
          </p>
        </div>
      </div>
    </>
  );
};


const MyListingsView = () => {
  const navigate = useNavigate();
  const { userData } = useRoleStore();
  const { apiResponse, currentPage, fetchUserListings } =
    useUserListingsStore();
  const jwtToken = Cookies.get(jwtSecretKey);
  const userId = userData.id;
console.log("userlistdings", fetchUserListings)
  useEffect(() => {
    // Check if jwtToken is defined
    if (jwtToken === undefined) {
      navigate("/"); // Redirect to home if jwtToken is not defined
    } else {
      fetchUserListings(userId); // Fetch listings if jwtToken is defined
    }
  }, [jwtToken, userId, fetchUserListings, navigate, currentPage]); // Add dependencies
  // useEffect(() => {
  //   fetchUserListings(userId);
  // }, [currentPage]);

  const renderListingView = () => {
    switch (apiResponse.status) {
      case apiStatusConstants.inProgress:
        return <LoadingView />;
      case apiStatusConstants.success:
        return (
          <>
            <div className="flex flex-wrap gap-4 justify-center">
              {apiResponse.data.length > 0 ? (
                apiResponse.data.map((each) => (
                  <MyListingCardView
                    key={each.id}
                    property={each}
                    timeText={"Posted At"}
                  />
                ))
              ) : (
                <div className="flex items-center justify-center min-h-[70vh] font-bold text-2xl">
                  Your Listings Not Found
                </div>
              )}
            </div>
            {/* Use the PaginationControls component */}
            {apiResponse.data.length > 0 && <PaginationControls userId={userId} />}
          </>
        );

      case apiStatusConstants.failure:
        return <FailureView />;
      default:
        return <div>No Listings Available</div>;
    }
  };

  return (
    <div className={`bg-gray-200 min-h-screen p-5`}>
      {/* Add the animated message here */}
      {/* <AnimatedMessage /> */}
      {renderListingView()}</div>
  );
};

export default MyListingsView;
