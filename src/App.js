import React, { useEffect, useState } from "react";
import {
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import AdminLayout from "layouts/Admin.js";
import Operator from "layouts/Operator";
import AuthLayout from "layouts/Auth.js";
import Moderator from "layouts/Moderator";
import { getUrls } from "helper/url_helper";

import TemplateMapping from "./WebData/pages/TemplateMapping/TemplateMapping";
import FieldDecision from "./WebData/pages/FieldDecision/FieldDecision";
import TaskManager from "./WebData/pages/TaskManager/TaskManager";

import DataMapping from "WebData/DataEntryMapping/DataMapping";
import UserCorrectionData from "WebData/pages/CSV Comparer/UserCorrectionData";
import CsvTaskStatus from "WebData/pages/CsvTaskStatus/CsvTaskStatus";
import CsvHomepage from "WebData/pages/CSV Comparer/CsvHomepage";
import DuplicityDetect from "WebData/pages/DuplicityDetect/DuplicityDetect";
import Assignee from "WebData/pages/CSV Comparer/Assignee";
import ResultTablePage from "ResultGeneration/ResultTablePage";

const App = () => {
  const [showIpModal, setShowIpModal] = useState(false);

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
        <Route
          path="/admin/comparecsv/assign_operator/:id"
          element={<Assignee />}
        />
      </Routes>
    </>
  );
};

export default App;
