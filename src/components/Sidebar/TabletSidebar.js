import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { MdKeyboardArrowDown, MdLogout } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { toast } from "react-toastify";
import { useScan } from "context/ScanningContext";
import { logout } from "helper/userManagment_helper";

const TabletSidebar = ({ routes = [], setIsTabCollapsed, isTabCollapsed }) => {
  const { isScanning } = useScan();
  const navigate = useNavigate();

  const getUserRole = () => {
    try {
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsed = JSON.parse(userData);
        return parsed.role || "";
      }
    } catch (error) {
      console.error("Error parsing userData from localStorage:", error);
    }
    return "";
  }

  const userRole = getUserRole();

  const renderNavLinks = routes.filter(
    (route) =>
      route.showInSidebar === true &&
      (!route.roles || route.roles.length === 0 || route.roles.includes(userRole))
  );

  const handleLogOut = async () => {
    if (isScanning) {
      toast.warning("Cannot logout while scanning is in progress.");
      return;
    }

    if (!window.confirm("Are you sure you want to logout?")) {
      return;
    }

    try {
      const res = await logout();
      if (res?.state) {
        localStorage.clear();
        toast.success("Logged out successfully");
        navigate("/authlogin");
      } else {
        toast.error(res?.message || "Logout failed");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message || error?.message || "Something went wrong"
      );
    }
  };

  return (
    <div
      className="d-flex flex-column py-4 px-3 text-dark position-relative overflow-hidden"
      style={{ width: "280px", height: "100vh", background: "rgba(255, 255, 255, 1)", borderRight: "1px solid #eef2f5", zIndex: 10, fontFamily: "outfit" }}    >
      <style>{`
        .tablet-drawer-item {
          width: 100%;
          border-radius: 50px !important;
          color: #333333 !important;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
          position: relative;
          z-index: 2;
        }
        .tablet-drawer-item:hover:not(.active) {
          background-color: #FAF7F7 !important;
          color: #000000 !important;
          transform: translateX(6px);
          font-weight: 600 !important;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2) !important;
        }
        .tablet-drawer-item:hover:not(.active) .drawer-icon {
          transform: scale(1.1);
        }
    
        .tablet-drawer-item.active {
          background-color: #FFFFFF !important;
          color: #000000 !important;
          font-weight: 600 !important;
          letter-spacing: 0.5px;
          box-shadow: 0 4px 12px rgba(255, 255, 255, 0.2) !important;
        }
 
        /* Close button hover interaction */
        .drawer-close-btn {
          transition: transform 0.2s ease, background-color 0.2s ease !important;
        }
        .drawer-close-btn:hover {
          background-color: #f8f9fa !important;
          transform: rotate(90deg);
        }
      `}</style>

      <div style={{ position: "absolute", left: "50%", top: "20%", transform: "translate(-50%, -50%)", width: "290px", height: "280px", borderRadius: "50%", background: "rgba(182, 151, 255, 0.3)", filter: "blur(30px)", pointerEvents: "none", zIndex: 0, }} />

      {/* Header section */}
      <div className="d-flex justify-content-between align-items-center pr-1 mb-5 mt-2" style={{ zIndex: 2 }}>
        <h5 className="m-0 font-weight-bolder tracking-wide" style={{ fontSize: "1.35rem", whiteSpace: "nowrap" }}>
          Image-Based <span style={{ color: "#2f80ed" }}>OMR</span>
        </h5>

        <button
          className="btn p-1 border-0 outline-none shadow-none rounded-circle d-flex align-items-center justify-content-center drawer-close-btn"
          style={{ width: "36px", height: "36px" }}
          type="button"
          onClick={() => setIsTabCollapsed(!isTabCollapsed)}>
          <IoClose size={24} color="#333" />
        </button>
      </div>

      {/* Menu Container */}
      <ul
        className="nav flex-column align-items-start flex-grow-1"
        style={{ gap: "0.7rem", width: "100%", zIndex: 2, }}>
        {renderNavLinks.map((item, index) => {
          const path = item.layout + item.path;
          return (
            <NavLink
              key={item.id || path || index}
              to={path}
              className="nav-link d-flex align-items-center px-3 py-2 tablet-drawer-item"
              style={() => ({ textDecoration: "none", fontWeight: "500", whiteSpace: "nowrap", letterSpacing:"0.5px", opacity: isScanning ? 0.6 : 1, cursor: isScanning ? "not-allowed" : "pointer", })}
              onClick={(e) => {
                if (isScanning) {
                  e.preventDefault();
                  return;
                }
                setIsTabCollapsed(true);
              }}
              onMouseEnter={(e) => {
                if (!isScanning && !e.currentTarget.classList.contains("active")) { e.currentTarget.style.backgroundColor = "#fff"; }
              }}
              onMouseLeave={(e) => {
                if (!isScanning && !e.currentTarget.classList.contains("")) { e.currentTarget.style.backgroundColor = "transparent"; }
              }}>
              <span className="drawer-icon d-flex justify-content-center text-lg" style={{ fontSize: "1.25rem" }}>
                {item.icon || "▪️"}
              </span>
              <span style={{ paddingLeft: "14px", fontSize: "0.95rem" }}>
                {item.name}
              </span>
            </NavLink>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div
        className="py-2 px-3 d-flex align-items-center"
        onClick={handleLogOut}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            handleLogOut();
          }
        }}
        style={{ width: "220px", fontSize: "16px", borderRadius: "50px", transition: "background 0.3s ease", cursor: isScanning ? "not-allowed" : "pointer", opacity: isScanning ? 0.6 : 1, zIndex: 2, }}
        onMouseOver={(e) => { if (!isScanning) { e.currentTarget.style.background = "#FAFAFA"; } }}
        onMouseOut={(e) => { e.currentTarget.style.background = "transparent"; }}>
        <span className="mr-2 pl-2">
          <MdLogout size={22} color="red" />
        </span>
        <span style={{ color: "red", fontWeight: "600" }}>Logout</span>
      </div>

    </div>
  );
};


export default TabletSidebar;