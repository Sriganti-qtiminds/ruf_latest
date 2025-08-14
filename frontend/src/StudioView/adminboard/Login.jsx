import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Dashboard from "./components/Dashboard";
import Requests from "./components/Requests";
import Projects from "./components/Projects";
import Vendors from "./components/Vendors";
import Users from "./components/Users";
import Rooms from "./components/Rooms";
import Testimonials from "./components/Testimonials";
import Login from "./Login";
import AddProject from "./components/Project/AddProject";
import Payment from "./components/Project/Payment";
import WeeklyPaymentDetails from "./components/Project/WeeklyPaymentDetails";
import VendorInvoices from "./components/Finance/VendorInvoices";
import CheckPayment from "./components/Finance/CheckPayment";
// Authentication will be handled by real API
import './index.css';
import { useRoleStore } from "../../store/roleStore";

const SIDEBAR_WIDTH = 320;

function AdminBoard() {
  const [selected, setSelected] = useState('Dashboard');
  const [auth, setAuth] = useState({ isLoggedIn: false, role: null, username: null });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchData, setSearchData] = useState([]);
  const [searchFields, setSearchFields] = useState([]);
  const { userData } = useRoleStore(); // Get role from store
  const userRole = userData?.role;

  const handleLogin = async (username, password) => {
    try {
      // TODO: Replace with real authentication API
      // For now, keeping the mock authentication for development
      const mockUsers = [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "site-manager", password: "manager123", role: "site-manager" },
        { username: "user", password: "user123", role: "user" }
      ];
      
      const user = mockUsers.find(u => u.username === username && u.password === password);
      if (user) {
        setAuth({ isLoggedIn: true, role: user.role, username: user.username });
        setSelected(user.role === 'admin' ? 'Dashboard' : user.role === 'site-manager' ? 'Requests' : null);
      } else {
        alert('Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  if (!auth.isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  let ContentComponent = null;
  if (auth.role === 'admin') {
    switch (selected) {
      case 'Dashboard':
        ContentComponent = <Dashboard />;
        break;
      case 'Requests':
        ContentComponent = <Requests />;
        break;
      case 'Projects':
        ContentComponent = <Projects setSearchData={setSearchData} setSearchFields={setSearchFields} />;
        break;
      case 'Projects:Add Project':
        ContentComponent = <AddProject />;
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
  } else if (auth.role === 'site-manager') {
    switch (selected) {
      case 'Requests':
        ContentComponent = <Requests />;
        break;
      case 'Projects':
        ContentComponent = <Projects />;
        break;
      case 'Projects:Add Project':
        ContentComponent = <AddProject />;
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
        ContentComponent = <CheckInvoices />;
        break;
      case 'Finance:Check Invoices':
        ContentComponent = <CheckInvoices />;
        break;
      case 'Finance:Vendor Invoices':
        ContentComponent = <VendorInvoices />;
        break;
      case 'Finance:Check Payment':
        ContentComponent = <CheckPayment />;
        break;
      case 'Finance:Waive Payment':
        ContentComponent = <WaivePayment />;
        break;
      case 'Finance:Consolidated Report':
        ContentComponent = <ConsolidatedReport />;
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
          role={auth.role} 
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
              {/* Mobile Hamburger Menu */}
              <button
                onClick={toggleSidebar}
                className="mr-2 text-gray-600 hover:text-gray-800 text-2xl md:text-3xl p-2 rounded-lg hover:bg-gray-100 transition-colors"
                style={{ minWidth: '36px', minHeight: '36px' }}
              >
                <i className="ri-menu-line"></i>
              </button>
            </div>
            {/* SearchBar on the right, shrinks on small screens */}
            <i className="ri-user-3-fill" style={{color:'#E07A5F', marginRight:'6px', fontSize:'1.2em'}}></i>
            <span className="truncate max-w-[100px] md:max-w-xs text-sm md:text-lg">{auth.role.charAt(0).toUpperCase() + auth.role.slice(1)} - Studio</span>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {ContentComponent}
          </div>
        </div>
      </div>
  );
}

export default AdminBoard;