import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "./config/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";
import routes from "./config/routes";

const App = () => {
  return (
    <Routes>
      {/* Protected Application */}
      <Route
        path="/app/*"
        element={
          <ProtectedRoute
            allowedRoles={["admin", "moderator", "operator"]}
          >
            <AppLayout />
          </ProtectedRoute>
        }
      />

      {/* Authentication */}
      <Route path="/auth/*" element={<AuthLayout />} />

      {/* Standalone Pages */}
      {routes
        .filter((route) => route.layout === "standalone")
        .map((route, index) => (
          <Route
            key={index}
            path={route.path}
            element={
              <ProtectedRoute
                allowedRoles={["admin", "moderator", "operator"]}
              >
                <route.component />
              </ProtectedRoute>
            }
          />
        ))}

      {/* Default Redirect */}
      <Route
        path="*"
        element={<Navigate to="/auth/login" replace />}
      />
    </Routes>
  );
};

export default App;