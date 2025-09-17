
// export default routes;


import UserLayout from "../UserView/layout/UserLayout";
import RMView from "../RmView/RmView";
import FMView from "../FmView/FmView";
import AdminLayout from "../AdminView/layout/AdminLayout";
import ProfileView from "../components/ProfileView";
import StudioUserLayout from "../StudioView/layout/StudioUserLayout";
//import StudioLandingView from "../StudioView/components/InitialLandingView";
import StudioDashboard from "../StudioView/components/InitialLandingView/StudioDashboard";
import ProjectStatus from "../StudioView/components/ProjectStatus";
import PaymentsDocsPage from "../StudioView/components/StdDasshboard/ProjectCards/PaymentDocs";
import AdminBoard from "../StudioView/adminboard/AdminBoard";
import VendorApp from "../StudioView/StudioVendor/CommonViews/StudioVendorApp";

// Define routes for each role
const routes = [
  // User Routes
  {
    path: "/user",
    component: UserLayout,
    roles: ["User"],
  },
  {
    path: "/user/profile",
    component: ProfileView,
    roles: ["User"],
  },

  // RM Routes
  {
    path: "/rm",
    component: RMView,
    roles: ["RM"],
  },

  // FM Routes
  {
    path: "/fm",
    component: FMView,
    roles: ["FM"],
  },

  // Admin Routes
  {
    path: "/admin",
    component: AdminLayout,
    roles: ["Admin"],
  },
  {
    path: "/admin/reports",
    component: () => <div>Admin Reports View</div>,
    roles: ["Admin"],
  },

  // Studio Routes
  {
    path: "/base/studio",
    component: StudioUserLayout,
    roles: ["User", "Vendor", "Admin"], // Allowing broader access to studio base
  },
  {
    path: "/base/studio/studioDashboard",
    component: StudioDashboard,
    roles: ["User"],
  },
  {
    path: "/base/studio/taskStatus",
    component: ProjectStatus,
    roles: ["User"],
  },
  {
    path: "/base/studio/profile",
    component: ProfileView,
    roles: ["User"],
  },
  {
    path: "/base/studio/projectPaymentsDocs",
    component: PaymentsDocsPage,
    roles: ["User"],
  },
  {
    path: "/base/studio/vendor",
    component: VendorApp,
    roles: ["Vendor"],
  },
  {
    path: "/base/studio/AdminBoard",
    component: AdminBoard,
    roles: ["Admin"],
  },
];

export default routes;
