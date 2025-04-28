import Navbar from "../components/CommonViews/Navbar";
import EnquiryManagementDashboard from "./EnquiryManagement";

const EnquiriesView = () => {
  return (
    <>
      <Navbar />
      <div className="bg-gray-300 flex items-center justify-center min-h-screen">
        <EnquiryManagementDashboard />
      </div>
    </>
  );
};

export default EnquiriesView;
