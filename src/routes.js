import Index from "views/Index.js";
import Profile from "views/examples/Profile.js";
import UserManagment from "views/UserManagment";
import Template from "views/Template";
import FolderStructure from "views/FolderStructure";
import ImageUpload from "WebData/pages/ImageUploader/ImageUploader";
import ScanPage from "views/ScanPage";
import ImageScanner from "WebData/pages/ImageScanner/ImageScanner";
import CsvUploader from "WebData/pages/CsvUploader/CsvUploader";
import CsvHomepage from "WebData/pages/CSV Comparer/CsvHomepage";
import MergeDuplicateDetect from "WebData/pages/MergeDuplicateDetect/MergeDuplicateDetect";
import FieldDecision from "WebData/pages/FieldDecision/FieldDecision";
import TemplateMapping from "WebData/pages/TemplateMapping/TemplateMapping";
import UserCorrectionData from "WebData/pages/CSV Comparer/UserCorrectionData";
import Assignee from "WebData/pages/CSV Comparer/Assignee";
import ResultGeneration from "ResultGeneration/ResultGeneration";
import Mergecsv from "MergeCsv/mergecsv";

const role = JSON.parse(localStorage.getItem("userData"))?.role;
console.log(role);

var routes = [
  {
    path: "/index",
    name: "Dashboard",
    icon: "ni ni-tv-2 text-primary",
    component: <Index />,
    layout: "/admin",
  },
  {
    path: "/template",
    name: "Template Manager",
    icon: "ni ni-collection text-red",
    component: <Template />,
    layout: "/admin",
  },

  {
    path: "/user-managment",
    name: "User Managment",
    icon: "ni ni-circle-08 text-info",
    component: <UserManagment />,
    layout: "/admin",
  },

  {
    path: "/job-queue",
    name: "Scan OMR Sheets",
    icon: "ni ni-money-coins text-yellow",
    component: <ScanPage />,
    layout: "/admin",
  },
  {
    path: "/server-folder",
    name: "Folder Management",
    icon: "ni ni-settings-gear-65 text-primary",
    component: <FolderStructure />,
    layout: "/admin",
  },
  {
    path: "/result-generation",
    name: "Result Generation",
    icon: "ni ni-paper-diploma text-danger",
    component: <ResultGeneration />,
    layout: "/admin",
  },
  {
    path: "/mergecsv",
    name: "Merge CSV",
    icon: "ni ni-archive-2 text-primary",
    component: <Mergecsv />,
    layout: "/admin",
  },

  // Sub Sidebar
  {
    name: "Web Data",
    icon: "ni ni-folder-17 text-orange",
    showInSidebar: true,

    children: [
      {
        path: "/imageuploader",
        name: "Create Template",
        component: <ImageUpload />,
        // showInSidebar: true,
        showInSidebar: role !== "admin" ? false : true,
        layout: "/admin",
      },
      {
        path: "/imageuploader/scanner",
        name: "Scanner",
        layout: "/admin",
        component: <ImageScanner />,
        showInSidebar: false, // 👈 IMPORTANT (hide from sidebar)
      },
      {
        path: "/csvuploader",
        name: "CSV Uploader",
        layout: "/admin",
        component: <CsvUploader />,
        // showInSidebar: true,
        showInSidebar: role !== "admin" ? false : true,
      },
      {
        path: "/datamatching",
        name: "Data Entry",
        layout: "/admin",
        // component: role !== "admin" ? <UserTaskAssined /> : <DataMatching />,
        component: null,
        showInSidebar: true,
      },
      {
        path: "/comparecsv",
        name: "CSV Compare",
        layout: "/admin",
        component: <CsvHomepage />,
        // showInSidebar: true,
        showInSidebar: role !== "admin" ? false : true,
      },

      {
        path: "/csvuploader/duplicatedetector/:id",
        name: "Find Duplicate",
        icon: "ni ni-briefcase-24 text-primary",
        component: <MergeDuplicateDetect />,
        layout: "/admin",
        showInSidebar: false,
      },
      {
        path: "/csvuploader/templatemap/:id",
        name: "Mapping",
        icon: "ni ni-briefcase-24 text-primary",
        component: <TemplateMapping />,
        layout: "/admin",
        showInSidebar: false,
      },
      {
        path: "csvuploader/fieldDecision/:id",
        name: "Field Decision",
        icon: "ni ni-briefcase-24 text-primary",
        component: <FieldDecision />,
        layout: "/admin",
        showInSidebar: false,
      },
      {
        path: "datamatching/correct_compare_csv",
        name: "Field Decision",
        icon: "ni ni-briefcase-24 text-primary",
        component: <UserCorrectionData />,
        layout: "/admin",
        showInSidebar: false,
      },
      {
        path: "comparecsv/assign_operator/:id",
        component: <Assignee />,
        layout: "/admin",
        showInSidebar: false,
      },
    ],
  },

  {
    path: "/user-profile",
    name: "Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
    showInSidebar: false,
  },
];
export default routes;
