import React from "react";

import { ROLES } from "./roles"

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

// Test Managment
import TestManagment from "features/TestManagment/TestManagment";

// Font Awesome Icons
import { BiHomeAlt2, BiScan } from "react-icons/bi";
import { HiOutlineUsers } from "react-icons/hi";
import { ImInsertTemplate } from "react-icons/im";
import { BsBarChart } from "react-icons/bs";
import { IoPricetagsOutline } from "react-icons/io5";
import { AiOutlineFolderOpen } from "react-icons/ai";
import { CiMenuFries } from "react-icons/ci";
import { MdOutlineTaskAlt } from "react-icons/md";



const { ADMIN, OPERATOR, MODERATOR } = ROLES


const routes = [

  // AUTH LAYOUT ROUTES

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

  // APP NESTED LAYOUT ROUTES (With Sidebar/Navbar)

  {
    path: "/index",
    name: "Dashboard",
    icon: <BiHomeAlt2 />,
    component: Index,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN, OPERATOR, MODERATOR]
  },
  {
    path: "/user-managment",
    name: "User Managment",
    icon: <HiOutlineUsers />,
    component: UserManagment,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN]
  },
  {
    path: "/template",
    name: "Template Manager",
    icon: <ImInsertTemplate />,
    component: Template,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN, MODERATOR],
  },

  {
    path: "/test-mgt",
    name: "Test Managment",
    icon: <MdOutlineTaskAlt />,
    component: TestManagment,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },

  // OLD SCANNING

  {
    path: "/job-queue",
    name: "Scan OMR Sheets",
    icon: <BiScan />,
    component: ScanPage,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },
  {
    path: "/job-queue/adminscanjobnew",
    component: AdminScanJob,
    layout: "/app",
    showInSidebar: false,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },

  // {
  //   path: "/job-queue/adminscanjob",
  //   component: AdminScanJob,
  //   layout: "/app",
  //   showInSidebar: false,
  //   roles: [ADMIN],
  // },


  {
    path: "/scaned-list",
    name: "Scanned List",
    icon: <CiMenuFries />,
    component: ScanedList,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },
  {
    path: "/server-folder",
    name: "Folder Management",
    icon: <AiOutlineFolderOpen />,
    component: FolderStructure,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },
  {
    path: "/result-generation",
    name: "Result Generation",
    icon: <BsBarChart />,
    component: ResultGeneration,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },

  {
    path: "/pricing",
    name: "Subscription",
    icon: <IoPricetagsOutline />,
    component: Pricing,
    layout: "/app",
    showInSidebar: true,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },

  {
    path: "/payment-status",
    component: PaymentStatus,
    layout: "/app",
    showInSidebar: false,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },
  {
    path: "/template/create-template/:Id",
    component: TemplateEditor,
    layout: "/app",
    showInSidebar: false,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },

  {
    path: "/user-profile",
    name: "Profile",
    component: Profile,
    layout: "/app",
    showInSidebar: false,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },

  {
    path: "/app/result-table",
    component: ResultTablePage,
    layout: "/app",
    showInSidebar: false,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },

  {
    path: "/app/Subscription/create",
    component: SubscriptionCreate,
    layout: "/app",
    showInSidebar: false,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },

  {
    path: "/payment-status",
    component: PaymentStatus,
    layout: "/app",
    showInSidebar: false,
    roles: [ADMIN, OPERATOR, MODERATOR],
  },
];

export default routes;
