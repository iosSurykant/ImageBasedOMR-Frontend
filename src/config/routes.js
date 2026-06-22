import Index               from        "../features/Dashboard/Index";
import Profile             from        "../auth/Profile";
import UserManagment       from        "../features/UserManagement/UserManagment";
import Template            from        "../features/TemplateManager/Template";
import FolderStructure     from        "../features//FolderManagement/FolderStructure";
import ScanPage            from        "../features/Scanner/ScanPage";

import ResultGeneration    from        "../features/ResultGeneration/ResultGeneration";
import Mergecsv            from        "../features/MergeCsv/mergecsv";
import ScanedList          from        "../features/ScannedData/ScanedData";
import AdminScanJob        from        "../features/Scanner/AdminScanJob";

import UserTaskAssined     from        "WebData/pages/DataMatching/UserTaskAssined";
import DataMatching        from        "WebData/pages/DataMatching/DataMatching";
import ImageScanner        from        "WebData/pages/ImageScanner/ImageScanner";
import CsvUploader         from        "WebData/pages/CsvUploader/CsvUploader";
import MergeDuplicateDetect from       "WebData/pages/MergeDuplicateDetect/MergeDuplicateDetect";
import FieldDecision       from        "WebData/pages/FieldDecision/FieldDecision";
import TemplateMapping     from        "WebData/pages/TemplateMapping/TemplateMapping";
import UserCorrectionData  from        "WebData/pages/CSV Comparer/UserCorrectionData";
import Assignee            from        "WebData/pages/CSV Comparer/Assignee";
import ImageUpload         from        "WebData/pages/ImageUploader/ImageUploader";
import Pricing from "features/Subscription/Pricing";
// import SubscriptionCreate from "features/Subscription/CreateSubscription";

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
    path: "/job-queue/adminscanjobnew",
    showInSidebar: false,
    component: <AdminScanJob />,
    layout: "/admin",
  },
  {
    path: "/scaned-list",
    name: "Scanned List",
    icon: "ni ni-app text-success",
    component: <ScanedList />,
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
    path: "/imageuploader",
    name: "Create Template",
    component: <ImageUpload />,
    icon: "ni ni-single-copy-04 text-wa",
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
    icon: "ni ni-bold-up text-success",
    component: <CsvUploader />,
    // showInSidebar: true,
    showInSidebar: role !== "admin" ? false : true,
  },
  {
    path: "/datamatching",
    name: "Data Entry",
    layout: "/admin",
    icon: "ni ni-bullet-list-67 text-info",
    component: role !== "admin" ? <UserTaskAssined /> : <DataMatching />,
    showInSidebar: true,
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

  {
    path: "/user-profile",
    name: "Profile",
    icon: "ni ni-single-02 text-yellow",
    component: <Profile />,
    layout: "/admin",
    showInSidebar: false,
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
  {
    path: "/pricing",
    name: "Subscription",
    icon:"ni ni-money-coins text-success",
    component: <Pricing />,
    layout: "/admin",
  },
];
export default routes;
