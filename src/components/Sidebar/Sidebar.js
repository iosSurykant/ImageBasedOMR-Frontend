import { useScan } from "context/ScanningContext";
import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { GoSidebarExpand } from "react-icons/go";
import { MdLogout, MdKeyboardArrowDown } from "react-icons/md";
import { buildSidebarItems, getUserRole, getUserInfo, isGroupActive } from "config/sidebarItems";
import { useSidebarGroups } from "hooks/useSidebarGroups";
import { useLogout } from "hooks/useLogout";

const Sidebar = ({ routes }) => {
  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 992);
  const [glowStyle, setGlowStyle] = useState({ top: 20, opacity: 0 });
  const listRef = useRef(null);

  const { isScanning } = useScan();
  const location = useLocation();
  const handleLogOut = useLogout();

  const userRole = getUserRole();
  const user = getUserInfo();

  const items = useMemo(() => buildSidebarItems(routes, userRole), [routes, userRole]);
  const { openGroups, openGroup, toggleGroup } = useSidebarGroups(items, location.pathname);

  // glow position relative to the nav list (accounts for list scrolling)
  const glowTopFor = useCallback((el) => {
    const list = el.closest("ul");
    return el.offsetTop - (list?.scrollTop || 0) + 120;
  }, []);

  // snap the glow back to the active item
  const snapToActive = useCallback(() => {
    if (isScanning) return;
    const activeItem = listRef.current?.querySelector(".nav-link.active");
    if (activeItem) {
      setGlowStyle({ top: glowTopFor(activeItem), opacity: 1 });
    } else {
      setGlowStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [isScanning, glowTopFor]);

  useEffect(() => {
    const handleResize = () => setIsCollapsed(window.innerWidth < 992);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // wait one frame so a just-opened group is in the DOM
    const id = requestAnimationFrame(snapToActive);
    return () => cancelAnimationFrame(id);
  }, [location.pathname, openGroups, isCollapsed, snapToActive]);

  const handleGroupClick = (name) => {
    if (isScanning) return;
    if (isCollapsed) {
      setIsCollapsed(false);
      openGroup(name);
      return;
    }
    toggleGroup(name);
  };

  const glowOnHover = (e) => {
    if (!isScanning) setGlowStyle({ top: glowTopFor(e.currentTarget), opacity: 1 });
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
    navList: {
      gap: "0.7rem",
      position: "relative",
      zIndex: 2,
      minHeight: 0,
      overflowY: "auto",
      flexWrap: "nowrap",
      scrollbarWidth: "none",
    },
    getNavLinkStyle: (isActive, isChild) => ({
      width: isChild ? "200px" : "220px",
      marginLeft: isChild ? 20 : 0,
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
    // headerActive: the group is collapsed/closed while one of its pages is open,
    // so the header itself has to carry the "you are here" state.
    groupHeader: (hasActive, headerActive) => ({
      width: "220px",
      borderRadius: "50px",
      backgroundColor: headerActive ? "#fff" : "transparent",
      boxShadow: headerActive ? "0 .125rem .25rem rgba(0,0,0,0.075)" : "none",
      border: "none",
      color: "#000",
      textAlign: "left",
      fontWeight: hasActive ? "600" : "500",
      whiteSpace: "nowrap",
      opacity: isScanning ? 0.6 : 1,
      cursor: isScanning ? "not-allowed" : "pointer",
      transition: "all .2s ease",
    }),
    dot: (isActive) => ({
      width: 7,
      height: 7,
      borderRadius: "50%",
      backgroundColor: isActive ? "#8b5cf6" : "#c4b5fd",
      flexShrink: 0,
      marginLeft: 6,
      marginRight: 2,
    }),
    navLinkTextSpan: { paddingLeft: 12 },
    logoutButton: {
      width: "220px",
      fontSize: "16px",
      borderRadius: "50px",
      transition: "background 0.3s ease",
      cursor: isScanning ? "not-allowed" : "pointer",
      opacity: isScanning ? 0.6 : 1,
    },
    logoutText: { color: "red", fontWeight: "600" },
    profile: { width: "220px", gap: 10 },
    avatar: {
      width: 36,
      height: 36,
      borderRadius: "50%",
      backgroundColor: "#fff",
      border: "1px solid #e2e8f0",
      color: "#2f80ed",
      fontWeight: 700,
      flexShrink: 0,
    },
  };

  const renderLink = (route, key, isChild) => (
    <li key={key} className="nav-item">
      <NavLink
        to={route.layout + route.path}
        className="nav-link d-flex align-items-center px-3"
        style={({ isActive }) => styles.getNavLinkStyle(isActive, isChild)}
        onClick={(e) => {
          if (isScanning) e.preventDefault();
        }}
        onMouseEnter={glowOnHover}
      >
        {({ isActive }) => (
          <>
            {isChild ? (
              <span style={styles.dot(isActive)} />
            ) : (
              <span className="d-flex justify-content-center">{route.icon || "▪️"}</span>
            )}
            {!isCollapsed && <span style={styles.navLinkTextSpan}>{route.name}</span>}
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
          type="button"
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!isCollapsed}
          className="btn p-0 border-0 outline-none shadow-none mx-auto"
          style={styles.toggleButton}
          onClick={() => setIsCollapsed((c) => !c)}
        >
          <GoSidebarExpand style={styles.toggleIcon} />
        </button>
      </div>

      {/* Background Glow */}
      <div style={styles.glowEffect} />

      <ul
        ref={listRef}
        className="nav flex-column align-items-start flex-grow-1"
        style={styles.navList}
        onScroll={snapToActive}
      >
        {items.map((item, index) => {
          if (item.type === "link") return renderLink(item.route, `link-${index}`, false);

          const isOpen = Boolean(openGroups[item.name]) && !isCollapsed;
          const hasActive = isGroupActive(item, location.pathname);
          const headerActive = hasActive && !isOpen;

          return (
            <React.Fragment key={`group-${item.name}`}>
              <li className="nav-item">
                <button
                  type="button"
                  className={`nav-link d-flex align-items-center px-3${headerActive ? " active" : ""}`}
                  style={styles.groupHeader(hasActive, headerActive)}
                  aria-expanded={isOpen}
                  aria-label={item.name}
                  onClick={() => handleGroupClick(item.name)}
                  onMouseEnter={glowOnHover}
                >
                  <span className="d-flex justify-content-center">{item.icon || "▪️"}</span>
                  {!isCollapsed && (
                    <>
                      <span style={styles.navLinkTextSpan}>{item.name}</span>
                      <MdKeyboardArrowDown
                        size={18}
                        style={{ marginLeft: "auto", transition: "0.25s", transform: isOpen ? "rotate(180deg)" : "none" }}
                      />
                    </>
                  )}
                </button>
              </li>
              {isOpen && item.children.map((c, i) => renderLink(c, `child-${item.name}-${i}`, true))}
            </React.Fragment>
          );
        })}
      </ul>

      <span
        role="button"
        tabIndex={0}
        aria-label="Logout"
        className="py-2 px-3"
        onClick={handleLogOut}
        onKeyDown={logoutKey}
        style={styles.logoutButton}
        onMouseOver={(e) => {
          if (!isScanning) e.currentTarget.style.background = "#fff";
        }}
        onMouseOut={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span className="mr-2 pl-2">
          <MdLogout size={22} color="red" />
        </span>
        {!isCollapsed && <span style={styles.logoutText}>Logout</span>}
      </span>

      {/* User profile */}
      <div className="d-flex align-items-center px-3 pt-3" style={styles.profile}>
        <div className="d-flex align-items-center justify-content-center" style={styles.avatar}>
          {user.initial}
        </div>
        {!isCollapsed && (
          <div style={{ minWidth: 0, lineHeight: 1.2 }}>
            <div style={{ fontSize: 14, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {user.name}
            </div>
            <div style={{ fontSize: 11, color: "#64748b" }}>{user.roleLabel}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;