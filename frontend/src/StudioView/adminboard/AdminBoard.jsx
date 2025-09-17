import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./components/Dashboard";
import Projects from "./components/Projects";
import Vendors from "./components/Vendors";
import Users from "./components/Users";
import Rooms from "./components/Rooms";
import Testimonials from "./components/Testimonials";
import AddProject from "./components/Project/AddProject";
import AddMainTask from "./components/Project/AddMainTask";
import AddSubtask from "./components/Project/AddSubtask";
import WeeklyPaymentDetails from "./components/Project/WeeklyPaymentDetails";
import VendorInvoices from "./components/Finance/VendorInvoices";
import CheckPayment from "./components/Finance/CheckPayment";
import './index.css';
import { useRoleStore } from "../../store/roleStore";
import { useNavigate } from "react-router-dom";

const SIDEBAR_WIDTH = 320;

function AdminBoard() {
  const [selected, setSelected] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [searchFields, setSearchFields] = useState([]);
  const navigate = useNavigate();
  
  // Get user data from Zustand store
  const { userData } = useRoleStore();
  const userRole = userData?.role;
  const username = userData?.username;

  // Redirect if not logged in or not authorized
  useEffect(() => {
    if (!userRole || !['admin', 'site-manager'].includes(userRole)) {
      navigate('/unauthorized'); // Or your login route
    }
  }, [userRole, navigate]);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Don't render anything if role hasn't been loaded yet
  if (!userRole) {
    return null; // Or a loading spinner
  }

  let ContentComponent = null;
  if (userRole === 'admin') {
    switch (selected) {
      case 'Dashboard':
        ContentComponent = <Dashboard />;
        break;
      case 'Projects':
        ContentComponent = <Projects setSearchData={setSearchData} setSearchFields={setSearchFields} />;
        break;
      case 'Projects:Add Project':
        ContentComponent = <AddProject />;
        break;
      case 'Projects:Add Main Task':
        ContentComponent = <AddMainTask />;
        break;
      case 'Projects:Add Subtask':
        ContentComponent = <AddSubtask />;
        break;
      case 'Projects:Payment':
        ContentComponent = <Payment />;
        break;
      case 'Projects:Weekly Payment Details':
        ContentComponent = <WeeklyPaymentDetails />;
        break;
      case 'Projects:Project Details':
        ContentComponent = <Projects />;
        break;
      case 'Finance':
        ContentComponent = <CheckPayment />;
        break;
      case 'Finance:Vendor Invoices':
        ContentComponent = <VendorInvoices />;
        break;
      case 'Finance:Check Payment':
        ContentComponent = <CheckPayment />;
        break;
      case 'Vendors':
        ContentComponent = <Vendors />;
        break;
      case 'Vendors:List Vendors':
        ContentComponent = <Vendors />;
        break;
      case 'Vendors:Add Vendor':
        ContentComponent = <Vendors />;
        break;
      case 'Users':
        ContentComponent = <Users />;
        break;
      case 'Rooms':
        ContentComponent = <Rooms />;
        break;
      case 'Testimonials':
        ContentComponent = <Testimonials />;
        break;
      default:
        ContentComponent = null;
    }
  } else if (userRole === 'site-manager') {
    switch (selected) {

      case 'Projects':
        ContentComponent = <Projects />;
        break;
      case 'Projects:Add Project':
        ContentComponent = <AddProject />;
        break;
      case 'Projects:Add Main Task':
        ContentComponent = <AddMainTask />;
        break;
      case 'Projects:Add Subtask':
        ContentComponent = <AddSubtask />;
        break;
      case 'Projects:Payment':
        ContentComponent = <Payment />;
        break;
      case 'Projects:Weekly Payment Details':
        ContentComponent = <WeeklyPaymentDetails />;
        break;
      case 'Projects:Project Details':
        ContentComponent = <Projects />;
        break;
      case 'Finance':
        ContentComponent = <CheckPayment />;
        break;
      case 'Finance:Vendor Invoices':
        ContentComponent = <VendorInvoices />;
        break;
      case 'Finance:Check Payment':
        ContentComponent = <CheckPayment />;
        break;
      case 'Vendors':
        ContentComponent = <Vendors />;
        break;
      case 'Vendors:List Vendors':
        ContentComponent = <Vendors />;
        break;
      case 'Vendors:Add Vendor':
        ContentComponent = <Vendors />;
        break;
      default:
        ContentComponent = null;
    }
  }

  return (
    <div>
      <Sidebar 
        selected={selected} 
        setSelected={setSelected} 
        role={userRole} 
        isOpen={sidebarOpen}
        onToggle={toggleSidebar}
      />
      
      <div
        className="flex flex-col bg-[#f6f7fa] min-w-0 transition-all duration-300"
        style={{ 
          marginLeft: window.innerWidth <= 768 ? '0' : SIDEBAR_WIDTH + 'px',
          width: window.innerWidth <= 768 ? '100%' : `calc(100% - ${SIDEBAR_WIDTH}px)`
        }}
      >
        {/* Header */}
        <div className="h-16 bg-white shadow flex items-center px-2 md:px-6 text-base md:text-lg font-semibold justify-between gap-2 flex-wrap">
          <div className="lg:hidden flex items-center gap-2 flex-shrink-0 min-w-0">
            <button
              onClick={toggleSidebar}
              className="mr-2 text-gray-600 hover:text-gray-800 text-2xl md:text-3xl p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ minWidth: '36px', minHeight: '36px' }}
            >
              <i className="ri-menu-line"></i>
            </button>
          </div>
          <i className="ri-user-3-fill" style={{color:'#E07A5F', marginRight:'6px', fontSize:'1.2em'}}></i>
          <span className="truncate max-w-[100px] md:max-w-xs text-sm md:text-lg">
            {userRole.charAt(0).toUpperCase() + userRole.slice(1)} - Studio
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {ContentComponent}
        </div>
      </div>
    </div>
  );
}

export default AdminBoard;