import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

const App = () => {
  return (
    <Routes>
      {/* Protected Application */}
      <Route path="/app/*" element={<AppLayout />} />

      {/* Authentication */}
      <Route path="/auth/*" element={<AuthLayout />} />

      {/* Default Redirect */}
      <Route path="*" element={<Navigate to="/auth/login" replace />}
      />
    </Routes>
  );
};

export default App;