import React, { useMemo } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { MdKeyboardArrowDown, MdLogout } from "react-icons/md";
import { IoClose } from "react-icons/io5";
import { useScan } from "context/ScanningContext";
import { buildSidebarItems, getUserRole, getUserInfo, isGroupActive } from "config/sidebarItems";
import { useSidebarGroups } from "hooks/useSidebarGroups";
import { useLogout } from "hooks/useLogout";

const TabletSidebar = ({ routes = [], setIsTabCollapsed, isTabCollapsed }) => {
  const { isScanning } = useScan();
  const location = useLocation();
  const handleLogOut = useLogout();

  const userRole = getUserRole();
  const user = getUserInfo();
  const items = useMemo(() => buildSidebarItems(routes, userRole), [routes, userRole]);
  const { openGroups, toggleGroup } = useSidebarGroups(items, location.pathname);

  const linkBase = {
    textDecoration: "none",
    fontWeight: "500",
    whiteSpace: "nowrap",
    letterSpacing: "0.5px",
    opacity: isScanning ? 0.6 : 1,
    cursor: isScanning ? "not-allowed" : "pointer",
  };

  const renderLink = (route, key, isChild) => (
    <li key={key} className="nav-item" style={{ width: "100%" }}>
      <NavLink
        to={route.layout + route.path}
        className="nav-link d-flex align-items-center px-3 py-2 tablet-drawer-item"
        style={{
          ...linkBase,
          marginLeft: isChild ? 20 : 0,
          width: isChild ? "calc(100% - 20px)" : "100%",
        }}
        onClick={(e) => {
          if (isScanning) {
            e.preventDefault();
            return;
          }
          setIsTabCollapsed(true);
        }}
      >
        {({ isActive }) => (
          <>
            {isChild ? (
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#8b5cf6" : "#c4b5fd",
                  flexShrink: 0,
                  marginLeft: 6,
                }}
              />
            ) : (
              <span className="drawer-icon d-flex justify-content-center text-lg" style={{ fontSize: "1.25rem" }}>
                {route.icon || "▪️"}
              </span>
            )}
            <span style={{ paddingLeft: isChild ? "12px" : "14px", fontSize: "0.95rem" }}>{route.name}</span>
          </>
        )}
      </NavLink>
    </li>
  );

  const logoutKey = (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleLogOut();
    }
  };

  return (
    <div
      className="d-flex flex-column py-4 px-3 text-dark position-relative overflow-hidden"
      style={{ width: "280px", height: "100vh", background: "rgba(255, 255, 255, 1)", borderRight: "1px solid #eef2f5", zIndex: 10, fontFamily: "outfit" }}
    >
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

      <div style={{ position: "absolute", left: "50%", top: "20%", transform: "translate(-50%, -50%)", width: "290px", height: "280px", borderRadius: "50%", background: "rgba(182, 151, 255, 0.3)", filter: "blur(30px)", pointerEvents: "none", zIndex: 0 }} />

      {/* Header section */}
      <div className="d-flex justify-content-between align-items-center pr-1 mb-5 mt-2" style={{ zIndex: 2 }}>
        <h5 className="m-0 font-weight-bolder tracking-wide" style={{ fontSize: "1.35rem", whiteSpace: "nowrap" }}>
          Image-Based <span style={{ color: "#2f80ed" }}>OMR</span>
        </h5>

        <button
          className="btn p-1 border-0 outline-none shadow-none rounded-circle d-flex align-items-center justify-content-center drawer-close-btn"
          style={{ width: "36px", height: "36px" }}
          type="button"
          aria-label="Close menu"
          onClick={() => setIsTabCollapsed(!isTabCollapsed)}
        >
          <IoClose size={24} color="#333" />
        </button>
      </div>

      {/* Menu Container */}
      <ul
        className="nav flex-column align-items-start flex-grow-1"
        style={{ gap: "0.7rem", width: "100%", zIndex: 2, minHeight: 0, overflowY: "auto", flexWrap: "nowrap", scrollbarWidth: "none" }}
      >
        {items.map((item, index) => {
          if (item.type === "link") {
            return renderLink(item.route, `${item.route.layout}${item.route.path}` || index, false);
          }

          const isOpen = Boolean(openGroups[item.name]);
          const hasActive = isGroupActive(item, location.pathname);
          const headerActive = hasActive && !isOpen;

          return (
            <React.Fragment key={`group-${item.name}`}>
              <li className="nav-item" style={{ width: "100%" }}>
                <button
                  type="button"
                  className={`nav-link d-flex align-items-center px-3 py-2 tablet-drawer-item${headerActive ? " active" : ""}`}
                  aria-expanded={isOpen}
                  onClick={() => {
                    if (!isScanning) toggleGroup(item.name);
                  }}
                  style={{ ...linkBase, width: "100%", background: "transparent", border: "none", textAlign: "left", fontWeight: hasActive ? "600" : "500" }}
                >
                  <span className="drawer-icon d-flex justify-content-center text-lg" style={{ fontSize: "1.25rem" }}>
                    {item.icon || "▪️"}
                  </span>
                  <span style={{ paddingLeft: "14px", fontSize: "0.95rem" }}>{item.name}</span>
                  <MdKeyboardArrowDown
                    size={18}
                    style={{ marginLeft: "auto", transition: "0.25s", transform: isOpen ? "rotate(180deg)" : "none" }}
                  />
                </button>
              </li>
              {isOpen && item.children.map((c, i) => renderLink(c, `child-${item.name}-${i}`, true))}
            </React.Fragment>
          );
        })}
      </ul>

      {/* Logout Button */}
      <div
        className="py-2 px-3 d-flex align-items-center"
        onClick={handleLogOut}
        role="button"
        tabIndex={0}
        aria-label="Logout"
        onKeyDown={logoutKey}
        style={{ width: "220px", fontSize: "16px", borderRadius: "50px", transition: "background 0.3s ease", cursor: isScanning ? "not-allowed" : "pointer", opacity: isScanning ? 0.6 : 1, zIndex: 2 }}
        onMouseOver={(e) => {
          if (!isScanning) e.currentTarget.style.background = "#FAFAFA";
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.background = "transparent";
        }}
      >
        <span className="mr-2 pl-2">
          <MdLogout size={22} color="red" />
        </span>
        <span style={{ color: "red", fontWeight: "600" }}>Logout</span>
      </div>

      {/* User profile */}
      <div className="d-flex align-items-center px-3 pt-3" style={{ gap: 10, zIndex: 2 }}>
        <div
          className="d-flex align-items-center justify-content-center"
          style={{ width: 36, height: 36, borderRadius: "50%", backgroundColor: "#f1f5f9", border: "1px solid #e2e8f0", color: "#2f80ed", fontWeight: 700, flexShrink: 0 }}
        >
          {user.initial}
        </div>
        <div style={{ minWidth: 0, lineHeight: 1.2 }}>
          <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.name}</div>
          <div style={{ fontSize: 11, color: "#64748b" }}>{user.roleLabel}</div>
        </div>
      </div>
    </div>
  );
};

export default TabletSidebar;