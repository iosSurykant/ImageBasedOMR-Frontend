import { useScan } from "context/ScanningContext";
import React, { useState, useEffect, useCallback } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { GoSidebarExpand } from "react-icons/go";
import { MdLogout } from "react-icons/md";
import { logout } from "helper/userManagment_helper";
import { toast } from "react-toastify";

const Sidebar = ({ routes }) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 992);
  const [glowStyle, setGlowStyle] = useState({ top: 20, opacity: 0 });

  const { isScanning } = useScan();
  const navigate = useNavigate();
  const location = useLocation();

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
  };

  const userRole = getUserRole();

  const renderNavLinks = routes.filter(
    (route) =>
      route.showInSidebar === true &&
      (!route.roles || route.roles.length === 0 || route.roles.includes(userRole))
  );

  // Helper function to snap the glow back to the active item
  const snapToActive = useCallback(() => {
    if (isScanning) return;
    const activeItem = document.querySelector(".nav-link.active");
    if (activeItem) {
      setGlowStyle({
        top: activeItem.offsetTop + 120,
        opacity: 1,
      });
    } else {
      setGlowStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [isScanning]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 992) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    snapToActive();
  }, [location.pathname, snapToActive]);

  const handleLogOut = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

    try {
      const res = await logout();

      if (res?.state) {
        localStorage.clear();
        toast.success("Logged out successfully");
        navigate("/auth/login");
      } else {
        toast.error(res?.message || "Logout failed");
      }
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
      );
    }
  };

  const styles = {
    sidebarContainer: {
      width: isCollapsed ? "100px" : "260px",
      height: "100vh",
      background: "none",
      fontFamily: "outfit",
      letterSpacing: "0.5px",
      transition: "width 0.3s ease",
      position: "relative",
      overflow: "hidden",
    },
    headingText: { fontSize: "1.35rem", whiteSpace: "nowrap" },
    omrHighlight: { color: "#2f80ed" },
    toggleButton: {
      zIndex: 1000,
      position: "relative",
      top: isCollapsed ? 0 : undefined,
      right: isCollapsed ? 50 : undefined,
      transform: isCollapsed ? "translateX(20%) translateY(100%)" : undefined,
    },
    toggleIcon: {
      width: 25,
      height: 25,
      transform: isCollapsed ? "rotate(180deg)" : "none",
      transition: "0.3s",
    },
    glowEffect: {
      position: "absolute",
      left: "15px",
      top: glowStyle.top,
      width: isCollapsed ? "70px" : "240px",
      height: "90px",
      borderRadius: "0px",
      background: "#B697FF",
      filter: "blur(70px)",
      transition: "all .3s ease",
      opacity: glowStyle.opacity,
      pointerEvents: "none",
      zIndex: 0,
    },
    navList: { gap: "0.7rem", position: "relative", zIndex: 2 },
    getNavLinkStyle: (isActive) => ({
      width: "220px",
      borderRadius: "50px",
      backgroundColor: isActive ? "#fff" : "transparent",
      boxShadow: isActive ? "0 .125rem .25rem rgba(0,0,0,0.075)" : "none",
      color: "#000",
      textDecoration: "none",
      fontWeight: isActive ? "600" : "500",
      whiteSpace: "nowrap",
      opacity: isScanning ? 0.6 : 1,
      cursor: isScanning ? "not-allowed" : "pointer",
      transition: "all .2s ease",
    }),
    navLinkTextSpan: { paddingLeft: 12 },
    logoutButton: {
      width: "220px",
      fontSize: "16px",
      borderRadius: "50px",
      transition: "background 0.3s ease",
      cursor: isScanning ? "not-allowed" : "pointer",
    },
    logoutText: { color: "red", fontWeight: "600" },
  };

  return (
    <div
      className="d-none d-lg-flex flex-column py-4 pl-3 text-dark"
      style={styles.sidebarContainer}
      onMouseLeave={snapToActive}
    >
      <div className="d-flex justify-content-center mb-5 mt-2">
        {!isCollapsed ? (
          <h5 className="m-0 font-weight-bolder tracking-wide" style={styles.headingText}>
            Image-Based <span style={styles.omrHighlight}>OMR</span>
          </h5>
        ) : (
          <h5 className="font-weight-bolder tracking-wide pl-2" style={styles.headingText}>
            OMR
          </h5>
        )}

        <button
          className="btn p-0 border-0 outline-none shadow-none mx-auto"
          style={styles.toggleButton}
          onClick={() => {
            if (window.innerWidth >= 778) {
              setIsCollapsed(!isCollapsed);
            }
          }}
        >
          <GoSidebarExpand style={styles.toggleIcon} />
        </button>
      </div>

      {/* Background Glow */}
      <div style={styles.glowEffect} />

      <ul className="nav flex-column align-items-start flex-grow-1" style={styles.navList}>
        {renderNavLinks.map((item, index) => (
          <NavLink
            key={index}
            to={item.layout + item.path}
            className="nav-link d-flex align-items-center px-3"
            style={({ isActive }) => styles.getNavLinkStyle(isActive)}
            onMouseEnter={(e) => {
              if (!isScanning) { setGlowStyle({ top: e.currentTarget.offsetTop + 120, opacity: 1, }); }
            }}
          >
            <span className="d-flex justify-content-center">
              {item.icon || "▪️"}
            </span>

            {!isCollapsed && (
              <span style={styles.navLinkTextSpan}>{item.name}</span>
            )}
          </NavLink>
        ))}
      </ul>

      <span
        className="py-2 px-3"
        onClick={handleLogOut}
        style={styles.logoutButton}
        onMouseOver={(e) => (e.currentTarget.style.background = "#fff")}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span className="mr-2 pl-2">
          <MdLogout size={22} color="red" />
        </span>
        {!isCollapsed && <span style={styles.logoutText}>Logout</span>}
      </span>
    </div>
  );
};

export default Sidebar;