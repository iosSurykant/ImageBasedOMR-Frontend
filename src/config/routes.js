import React from "react";

// import { ROLES} from "./roles"

// Non-WebData Feature Components
import Index from "../features/Dashboard/Index";
import Profile from "../auth/Profile";
import UserManagment from "../features/UserManagement/UserManagment";
import Template from "../features/TemplateManager/Template";
import FolderStructure from "../features/FolderManagement/FolderStructure";
import ScanPage from "../features/Scanner/ScanPage";
import ResultGeneration from "../features/ResultGeneration/ResultGeneration";
import ScanedList from "../features/ScannedData/ScanedData";
import AdminScanJob from "../features/Scanner/AdminScanJob";
import Pricing from "features/Subscription/PricingHome";
import PaymentStatus from "features/Subscription/pages/PaymentStatus";
import SubscriptionCreate from "features/Subscription/pages/CreateSubscription";
import TemplateEditor from "../features/TemplateManager/TemplateEditor";
import ResultTablePage from "../common/ResultTablePage";

// Auth Components
import Login from "../auth/Login";
import Signup from "../auth/Signup";

// WebData Components (Imported but not modified)
// import UserTaskAssined from "WebData/pages/DataMatching/UserTaskAssined";
// import DataMatching from "WebData/pages/DataMatching/DataMatching";
// import ImageScanner from "WebData/pages/ImageScanner/ImageScanner";
// import CsvUploader from "WebData/pages/CsvUploader/CsvUploader";
// import FieldDecision from "WebData/pages/FieldDecision/FieldDecision";
// import TemplateMapping from "WebData/pages/TemplateMapping/TemplateMapping";
// import UserCorrectionData from "WebData/pages/CSV Comparer/UserCorrectionData";
// import Assignee from "WebData/pages/CSV Comparer/Assignee";
// import ImageUpload from "WebData/pages/ImageUploader/ImageUploader";
// import TaskManager from "WebData/pages/TaskManager/TaskManager";
// import DataMapping from "WebData/DataEntryMapping/DataMapping";
// import CsvTaskStatus from "WebData/pages/CsvTaskStatus/CsvTaskStatus";
// import CsvHomepage from "WebData/pages/CSV Comparer/CsvHomepage";
// import DuplicityDetect from "WebData/pages/DuplicityDetect/DuplicityDetect";

// Wrapper component to handle Data Entry routing based on role at render-time
// const DataMatchingRoute = () => {
//   const role = JSON.parse(localStorage.getItem("userData"))?.role;
//   return role !== "admin" ? <UserTaskAssined /> : <DataMatching />;
// };

// import Mergecsv from "../features/MergeCsv/mergecsv";

// Font Awesome Icons
import { BiHomeAlt2, BiScan } from "react-icons/bi";
import { HiOutlineUsers } from "react-icons/hi";
import { ImInsertTemplate } from "react-icons/im";
import { BsBarChart } from "react-icons/bs";
import { IoPricetagsOutline } from "react-icons/io5";
import { AiOutlineFolderOpen } from "react-icons/ai";
import { CiMenuFries } from "react-icons/ci";



// const {
//   ADMIN, OPERATOR, MODERATOR
// } = ROLES


const routes = [

  // ==========================================
  // AUTH LAYOUT ROUTES
  // ==========================================

  {
    path: "/login",
    component: Login,
    layout: "/auth",
    showInSidebar: false,
  },
  {
    path: "/signup",
    component: Signup,
    layout: "/auth",
    showInSidebar: false,
  },

  // ==========================================
  // APP NESTED LAYOUT ROUTES (With Sidebar/Navbar)
  // ==========================================

  {
    path: "/index",
    name: "Dashboard",
    icon: <BiHomeAlt2 />,
    component: Index,
    layout: "/app",
    showInSidebar: true,
    // roles: [ ADMIN, OPERATOR, MODERATOR ]
  },
  {
    path: "/template",
    name: "Template Manager",
    icon: <ImInsertTemplate />,
    component: Template,
    layout: "/app",
    showInSidebar: true,
    // roles: [ADMIN],
  },
  {
    path: "/user-managment",
    name: "User Managment",
    icon: <HiOutlineUsers />,
    component: UserManagment,
    layout: "/app",
    showInSidebar: true,
  },
  {
    path: "/job-queue",
    name: "Scan OMR Sheets",
    icon: <BiScan />,
    component: ScanPage,
    layout: "/app",
    showInSidebar: true,
  },
  {
    path: "/job-queue/adminscanjobnew",
    component: AdminScanJob,
    layout: "/app",
    showInSidebar: false,
  },
  {
    path: "/job-queue/adminscanjob",
    component: AdminScanJob,
    layout: "/app",
    showInSidebar: false,
  },
  {
    path: "/scaned-list",
    name: "Scanned List",
    icon:<CiMenuFries />,
    component: ScanedList,
    layout: "/app",
    showInSidebar: true,
  },
  {
    path: "/server-folder",
    name: "Folder Management",
    icon: <AiOutlineFolderOpen />,
    component: FolderStructure,
    layout: "/app",
    showInSidebar: true,
  },
  {
    path: "/user-profile",
    name: "Profile",
    component: Profile,
    layout: "/app",
    showInSidebar: false,
  },
  {
    path: "/result-generation",
    name: "Result Generation",
    icon:  <BsBarChart />,
    component: ResultGeneration,
    layout: "/app",
    showInSidebar: true,
  },

  // {
  //   path: "/mergecsv",
  //   name: "Merge CSV",
  //   component: Mergecsv,
  //   layout: "/app",
  //   showInSidebar: true,
  // },
  // {
  //   path: "/imageuploader",
  //   name: "Create Template",
  //   component: ImageUpload,
  //   layout: "/app",
  //   showInSidebar: true,
  //   roleRequired: "admin",
  // },
  // {
  //   path: "/imageuploader/scanner",
  //   name: "Scanner",
  //   component: ImageScanner,
  //   layout: "/app",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/csvuploader",
  //   name: "CSV Uploader",
  //   component: CsvUploader,
  //   layout: "/app",
  //   showInSidebar: true,
  //   roleRequired: "admin",
  // },
  // {
  //   path: "/datamatching",
  //   name: "Data Entry",
  //   component: DataMatchingRoute,
  //   layout: "/app",
  //   showInSidebar: true,
  // },
  
  {
    path: "/pricing",
    name: "Subscription",
    icon: <IoPricetagsOutline />,
    component: Pricing,
    layout: "/app",
    showInSidebar: true,
  },
  // {
  //   path: "/support",
  //   name: "Support",
  //   icon: <IoPricetagsOutline />,
  //   component: Support,
  //   layout: "/app",
  //   showInSidebar: true,
  // },
  {
    path: "/payment-status",
    component: PaymentStatus,
    layout: "/app",
    showInSidebar: false,
  },
  {
    path: "/template/create-template/:Id",
    component: TemplateEditor,
    layout: "/app",
    showInSidebar: false,
  },
  
  // ==========================================
  // STANDALONE / FULL PAGE ROUTES (No Sidebar Layout)
  // ==========================================

  {
    path: "/app/result-table",
    component: ResultTablePage,
    layout: "standalone",
    showInSidebar: false,
  },

  {
    path: "/app/Subscription/create",
    component: SubscriptionCreate,
    layout: "standalone",
    showInSidebar: false,
  },

  {
    path: "/payment-status",
    component: PaymentStatus,
    layout: "standalone",
    showInSidebar: false,
  },

  // {
  //   path: "/app/dmin/csvuploader/duplicatedetector/:id",
  //   component: DuplicityDetect,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/app/csvuploader/templatemap/:id",
  //   component: TemplateMapping,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/app/csvuploader/fieldDecision/:id",
  //   component: FieldDecision,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/app/csvuploader/taskAssign/:id",
  //   component: TaskManager,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/app/datamatching/:id",
  //   component: DataMapping,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/app/datamatching/csvtaskstatus",
  //   component: CsvTaskStatus,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/app/datamatching/correct_compare_csv",
  //   component: UserCorrectionData,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/app/comparecsv",
  //   component: CsvHomepage,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
  // {
  //   path: "/app/comparecsv/assign_operator/:id",
  //   component: Assignee,
  //   layout: "standalone",
  //   showInSidebar: false,
  // },
];

export default routes;
