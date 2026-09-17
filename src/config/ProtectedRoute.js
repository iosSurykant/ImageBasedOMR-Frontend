import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {  
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/auth/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const now = Date.now();

    if (decoded.exp * 1000 <= now) {
      localStorage.clear();
      return <Navigate to="/auth/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(decoded.role)) {
      return <Navigate to="/auth/login" replace />;
    }

    return children;

  } catch (err) {
    console.error("Invalid token", err);
    localStorage.clear();
    return <Navigate to="/auth/login" replace />;
  }
};

export default ProtectedRoute;
