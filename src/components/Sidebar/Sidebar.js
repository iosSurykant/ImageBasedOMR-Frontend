import { useScan } from "context/ScanningContext";
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { GoSidebarExpand } from "react-icons/go";
import { MdLogout } from "react-icons/md";
import { logout } from "helper/userManagment_helper";
import { toast } from "react-toastify";

const Sidebar = ({ routes }) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 992);
  const [glowStyle, setGlowStyle] = useState({
    top: 0,
    opacity: 0,
  });

  const { isScanning } = useScan();
  const navigate = useNavigate();

  const renderNavLinks = routes.filter(
    (route) => route.showInSidebar === true
  );

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

  // Keep glow on active item
  useEffect(() => {
    const activeItem = document.querySelector('.nav-link.active');
    if (activeItem && !isScanning) {
      setGlowStyle({
        top: activeItem.offsetTop + 50,
        opacity: 1,
      });
    }
  }, [isScanning]);

  const handleLogOut = async () => {
    if (!window.confirm("Are you sure you want to logout?")) return;

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
        error?.response?.data?.message ||
        error?.message ||
        "Something went wrong"
      );
    }
  };

  return (
    <div
      className="d-none d-lg-flex flex-column py-4 pl-3 text-dark"
      style={{
        width: isCollapsed ? "100px" : "260px",
        height: "100vh",
        background: "none",
        transition: "width 0.3s ease",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div className="d-flex justify-content-center mb-5 mt-2">
        {!isCollapsed ? (
          <h5
            className="m-0 font-weight-bolder tracking-wide"
            style={{ fontSize: "1.35rem", whiteSpace: "nowrap" }}
          >
            Image-Based <span style={{ color: "#2f80ed" }}>OMR</span>
          </h5>
        ) : (
          <h5
            className="font-weight-bolder tracking-wide pl-2"
            style={{ fontSize: "1.35rem", whiteSpace: "nowrap" }}
          >
            OMR
          </h5>
        )}

        <button
          className="btn p-0 border-0 outline-none shadow-none mx-auto"
          style={{
            zIndex: 1000,
            position: "relative",
            top: isCollapsed ? 0 : undefined,
            right: isCollapsed ? 50 : undefined,
            transform: isCollapsed
              ? "translateX(20%) translateY(100%)"
              : undefined,
          }}
          onClick={() => {
            if (window.innerWidth >= 778) {
              setIsCollapsed(!isCollapsed);
            }
          }}
        >
          <GoSidebarExpand
            style={{
              width: 25,
              height: 25,
              transform: isCollapsed ? "rotate(180deg)" : "none",
              transition: "0.3s",
            }}
          />
        </button>
      </div>

      {/* Moving Glow */}
      <div
        style={{
          position: "absolute",
          left: "15px",
          top: glowStyle.top,
          width: isCollapsed ? "70px" : "240px",
          height: "200px",
          borderRadius: "20px",
          background: "rgba(182, 151, 255, 0.35)",
          filter: "blur(30px)",
          transition: "all .3s ease",
          opacity: glowStyle.opacity,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* Active Item Glow */}
      <div
        style={{
          position: "absolute",
          left: "15px",
          top: glowStyle.top,
          width: isCollapsed ? "70px" : "240px",
          height: "200px",
          borderRadius: "20px",
          background: "rgba(182, 151, 255, 0.35)",
          filter: "blur(30px)",
          transition: "all .3s ease",
          opacity: glowStyle.opacity,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <ul
        className="nav flex-column align-items-start flex-grow-1"
        style={{
          gap: "0.7rem",
          position: "relative",
          zIndex: 2,
        }}
      >
        {renderNavLinks.map((item, index) => (
          <NavLink
            key={index}
            to={item.layout + item.path}
            className="nav-link d-flex align-items-center px-3 py-2 text-dark"
            style={({ isActive }) => ({
              width: "220px",
              borderRadius: "50px",
              backgroundColor: isActive ? "#fff" : "transparent",
              boxShadow: isActive
                ? "0 .125rem .25rem rgba(0,0,0,.075)"
                : "none",
              color: "black",
              textDecoration: "none",
              fontWeight: isActive ? "700" : "600",
              whiteSpace: "nowrap",
              opacity: isScanning ? 0.6 : 1,
              cursor: isScanning ? "not-allowed" : "pointer",
              transition: "all .2s ease",
            })}
            onMouseEnter={(e) => {
              if (!isScanning) {
                setGlowStyle({
                  top: e.currentTarget.offsetTop + 50,
                  opacity: 1,
                });

                if (!e.currentTarget.classList.contains("active")) {
                  e.currentTarget.style.backgroundColor = "#fff";
                }
              }
            }}
            onMouseLeave={(e) => {
              if (!isScanning) {
                // Only hide glow if not active
                if (!e.currentTarget.classList.contains("active")) {
                  setGlowStyle((prev) => ({
                    ...prev,
                    opacity: 0,
                  }));
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }
            }}
            onClick={(e) => {
              // Keep glow on clicked item
              setGlowStyle({
                top: e.currentTarget.offsetTop + 50,
                opacity: 1,
              });
            }}
          >
            <span className="d-flex justify-content-center">
              {item.icon || "▪️"}
            </span>

            {!isCollapsed && (
              <span style={{ paddingLeft: 12 }}>{item.name}</span>
            )}
          </NavLink>
        ))}
      </ul>

      <span
        className="py-2 px-3"
        onClick={handleLogOut}
        style={{
          width: "220px",
          fontSize: "16px",
          borderRadius: "50px",
          transition: 'background 0.3s ease',
          cursor: isScanning ? "not-allowed" : "pointer",
        }}
        onMouseOver={(e) => (e.currentTarget.style.background = "#fff")}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span className="mr-2 pl-2"><MdLogout size={22} color='red' /></span>
        {!isCollapsed && <span style={{ color: "red", fontWeight: "600" }}>Logout</span>}
      </span>
    </div>
  );
};

export default Sidebar;