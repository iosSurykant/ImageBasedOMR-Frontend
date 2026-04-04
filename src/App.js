import React, { useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "layouts/Admin.js";
import Operator from "layouts/Operator";
import AuthLayout from "layouts/Auth.js";
import Moderator from "layouts/Moderator";
import axios from "axios";
import { getUrls } from "helper/url_helper";
import DataContext from "./store/DataContext";

import ImageScanner from "./WebData/pages/ImageScanner/ImageScanner";
import ImageUpload from "./WebData/pages/ImageUploader/ImageUploader";
import MergeDuplicateDetect from "./WebData/pages/MergeDuplicateDetect/MergeDuplicateDetect";
import CsvUploader from "./WebData/pages/CsvUploader/CsvUploader";
import TemplateMapping from "./WebData/pages/TemplateMapping/TemplateMapping";
import FieldDecision from "./WebData/pages/FieldDecision/FieldDecision";
import TaskManager from "./WebData/pages/TaskManager/TaskManager";
import UserTaskAssined from "WebData/pages/DataMatching/UserTaskAssined";
import DataMatching from "WebData/pages/DataMatching/DataMatching";
import DataMapping from "WebData/DataEntryMapping/DataMapping";
import UserCorrectionData from "WebData/pages/CSV Comparer/UserCorrectionData";
import CsvTaskStatus from "WebData/pages/CsvTaskStatus/CsvTaskStatus";
import CsvHomepage from "WebData/pages/CSV Comparer/CsvHomepage";
import DuplicityDetect from "WebData/pages/DuplicityDetect/DuplicityDetect";
import Assignee from "WebData/pages/CSV Comparer/Assignee";
import ResultTablePage from "ResultGeneration/ResultTablePage";
const useTokenRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const tokenExp = decoded.exp * 1000; // Convert exp from seconds to milliseconds

        // Get the current time in milliseconds
        const currentTime = Date.now();
        if (currentTime >= tokenExp) {
          console.log("Token has expired");
          alert("Session has expired, Please login again.");
          localStorage.clear();
          setTimeout(() => {
            navigate("/auth/login", { replace: true });
          }, 100);
        }
        if (decoded.Role === "Operator") {
          if (location.pathname.includes("operator")) {
            navigate(location.pathname);
          } else {
            navigate("/operator/index", { replace: true });
          }
        } else if (decoded.Role === "Admin") {
          if (location.pathname.includes("admin")) {
            navigate(location.pathname);
          } else {
            navigate("/admin/index", { replace: true });
          }
        } else if (decoded.Role === "Moderator") {
          if (location.pathname.includes("moderator")) {
            navigate(location.pathname);
          } else {
            navigate("/moderator/index", { replace: true });
          }
        }
      } catch (error) {
        console.error("Invalid token:", error);
        navigate("/auth/login", { replace: true });
      }
    } else {
      navigate("/auth/login", { replace: true });
    }
  }, [location.pathname]);
};

const App = () => {
  const [showIpModal, setShowIpModal] = useState(false);
  const [templateLoading, setTemplateLoading] = useState(true); // State to manage loading
  const dataCtx = useContext(DataContext); // Assuming you are using context
  const toggle = true;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response2 = await getUrls();
        const getUserUrl = response2?.GET_USERS;

        if (!getUserUrl) {
          throw new Error("GET_USERS URL is not defined in configuration");
        }

        // Perform the GET request to fetch user data
        const getUserResponse = await fetch(getUserUrl);

        if (!getUserResponse.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await getUserResponse.json();
        console.log(userData);

        // Handle successful fetch here
      } catch (error) {
        console.error("Error fetching data:", error);
        setShowIpModal(true); // Show the modal or handle the error as needed
      }
    };

    // fetchData();
  }, []);

  const handleSaveIp = (ip, protocol) => {
    const Obj = {
      backendUrl: ip,
    };
    const res2 = axios.post("http://localhost/api/config", Obj);

    setTimeout(() => {
      window.location.reload(); // Reload the page
    }, 400);
  };

  const role = JSON.parse(localStorage.getItem("userData"))?.role;
  console.log(role);

  return (
    <>
      <Routes>
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["Admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        />

        <Route
          path="/operator/*"
          element={
            <ProtectedRoute allowedRoles={["Operator"]}>
              <Operator />
            </ProtectedRoute>
          }
        />

        <Route
          path="/moderator/*"
          element={
            <ProtectedRoute allowedRoles={["Moderator"]}>
              <Moderator />
            </ProtectedRoute>
          }
        />

        <Route path="/auth/*" element={<AuthLayout />} />
        <Route path="*" element={<Navigate to="/auth/login" replace />} />

        {/* Result Generation */}
        <Route path="/admin/result-table" element={<ResultTablePage />} />

        {/* Upload Image */}
        <Route path="/admin/imageuploader" element={<ImageUpload />} />
        <Route path="/admin/imageuploader/scanner" element={<ImageScanner />} />

        {/* CSV Uploader */}
        <Route path="/admin/csvuploader" element={<CsvUploader />} />
        <Route
          path="/admin/csvuploader/duplicatedetector/:id"
          element={<DuplicityDetect />}
        />
        <Route
          path="/admin/csvuploader/templatemap/:id"
          element={<TemplateMapping />}
        />
        <Route
          path="/admin/csvuploader/fieldDecision/:id"
          element={<FieldDecision />}
        />
        <Route
          path="/admin/csvuploader/taskAssign/:id"
          element={<TaskManager />}
        />

        {/* Data Entry */}

        <Route
          path="admin/datamatching"
          element={role !== "admin" ? <UserTaskAssined /> : <DataMatching />}
        />

        <Route path="/admin/datamatching/:id" element={<DataMapping />} />
        <Route
          path="/admin/datamatching/csvtaskstatus"
          element={<CsvTaskStatus />}
        />

        <Route
          path="/admin/datamatching/correct_compare_csv"
          element={<UserCorrectionData />}
        />

        {/* CSV Compare */}

        <Route path="/admin/comparecsv" element={<CsvHomepage />} />
        <Route path="/admin/comparecsv/assign_operator/:id" element={<Assignee />} />

      </Routes>
    </>
  );
};

export default App;
