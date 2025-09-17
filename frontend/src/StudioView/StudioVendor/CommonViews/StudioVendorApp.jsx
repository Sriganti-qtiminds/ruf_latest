import React, { useState } from "react";
import VendorSidebar from "./StudioVendorSidebar"
import VendorHeader from "./StudioVendorHeader";
import VendorDashboard from "../StdVenDashboard/StudioVendorDashboard";
import VendorTasks from "../StudioVendorTasks/StudioVendorTasks";
import VendorPayments from "../StudioVendorPayments/StudioVendorPayments";
// import VendorModal from "./VendorModal";
// import VendorToast from "./VendorToast";
import { useLocalStorage } from "../CommonViews/useLocalStorage";
import { studioTailwindStyles } from '../../../utils/studioTailwindStyles';

const VendorApp = () => {
  const [data, saveData] = useLocalStorage();
  const [activeSection, setActiveSection] = useState("tasks");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success", visible: false });
  const [modalContent, setModalContent] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type, visible: true });
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openModal = (content) => setModalContent(content);
  const closeModal = () => setModalContent(null);

  return (
    <>
      <VendorSidebar
        isOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />
      <div className="md:ml-64 min-h-screen">
        <VendorHeader toggleSidebar={toggleSidebar} />
        <main>
          {activeSection === "dashboard" && <VendorDashboard data={data} />}
          {activeSection === "tasks" && (
            <VendorTasks
              data={data}
              saveData={saveData}
              showToast={showToast}
              openModal={openModal}
            />
          )}
          {activeSection === "payments" && (
            <VendorPayments
              data={data}
              saveData={saveData}
              showToast={showToast}
              openModal={openModal}
            />
          )}
        </main>
      </div>
      {/* <VendorModal isOpen={!!modalContent} onClose={closeModal}>
        {modalContent}
      </VendorModal>
      <VendorToast {...toast} setVisible={(visible) => setToast({ ...toast, visible })} /> */}
    </>
  );
};

export default VendorApp;