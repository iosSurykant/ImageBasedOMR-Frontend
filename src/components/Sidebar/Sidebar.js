import { useRef, useState, useEffect, useCallback } from "react";
import { NavLink as NavLinkRRD, Link, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import logoImg from "../../assets/img/brand/ios.png";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Nav, NavItem, NavLink, NavbarBrand } from "reactstrap";
import "@fortawesome/fontawesome-free/css/all.min.css";

import { useScan } from "../../context/ScanningContext";
import { toast } from "react-toastify";

const SIDEBAR_FULL = 250;
const SIDEBAR_COLLAPSED = 80;
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 992;

const getBreakpoint = () => {
  const w = window.innerWidth;
  if (w < MOBILE_BREAKPOINT) return "mobile";
  if (w < TABLET_BREAKPOINT) return "tablet";
  return "desktop";
};

const Sidebar = (props) => {
  const { routes, logo } = props;
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [breakpoint, setBreakpoint] = useState(getBreakpoint);

  const sidebarRef = useRef(null);
  const mouseDownTarget = useRef(null);

  const { isScanning } = useScan();

  const applyShift = useCallback((bp, isCollapsed) => {
    const width =
      bp === "mobile" ? 0 : isCollapsed ? SIDEBAR_COLLAPSED : SIDEBAR_FULL;
    document.documentElement.style.setProperty("--sidebar-shift", `${width}px`);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const bp = getBreakpoint();
      setBreakpoint(bp);
      setCollapsed((prev) => {
        const next = bp === "tablet" ? true : bp === "desktop" ? false : prev;
        applyShift(bp, next);
        return next;
      });
      if (bp !== "mobile") setMobileOpen(false);
    };
    applyShift(getBreakpoint(), getBreakpoint() === "tablet");
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [applyShift]);

  useEffect(() => {
    applyShift(breakpoint, collapsed);
  }, [collapsed, breakpoint, applyShift]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onMouseDown = (e) => {
      mouseDownTarget.current = e.target;
    };
    const onMouseUp = (e) => {
      if (!mobileOpen || !sidebarRef.current) return;
      if (
        !sidebarRef.current.contains(mouseDownTarget.current) &&
        !sidebarRef.current.contains(e.target)
      ) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("mouseup", onMouseUp);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("mouseup", onMouseUp);
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (breakpoint === "mobile") {
      document.body.style.overflow = mobileOpen ? "hidden" : "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen, breakpoint]);

  const handleToggleCollapse = () => setCollapsed((c) => !c);

  const createLinks = (routes) => {
    const role = JSON.parse(localStorage.getItem("userData"))?.role;
    return routes
      ?.filter((r) => r.showInSidebar !== false)
      ?.filter((r) => !r.roleRequired || r.roleRequired === role)
      .map((route, index) => {
        const visibleChildren =
          route.children?.filter((c) => c.showInSidebar !== false) ?? [];
        const hasChildren = visibleChildren.length > 0;
        const isOpen = openMenu === index;
        const isCollapsedView = collapsed && breakpoint !== "mobile";

        return (
          <div key={index}>
            <NavItem>
              <NavLink
                to={hasChildren ? "#" : `${route.layout}${route.path}`}
                tag={NavLinkRRD}
                title={isCollapsedView ? route.name : undefined}
                className={`sidebar-nav-link${isCollapsedView ? " icon-only" : ""}`}
                onClick={(e) => {
                  if (isScanning) {
                    e.preventDefault();

                    toast.warn("Scanning in progress");

                    return;
                  }

                  if (hasChildren) {
                    e.preventDefault();
                    setOpenMenu(isOpen ? null : index);
                  }
                }}
              >
                <i className={`${route.icon} s-icon`} />
                {!isCollapsedView && (
                  <>
                    <span className="s-label">{route.name}</span>
                    {hasChildren && (
                      <i
                        className={`fa fa-chevron-${isOpen ? "up" : "down"} s-chevron`}
                      />
                    )}
                  </>
                )}
              </NavLink>
            </NavItem>

            {hasChildren && isOpen && !isCollapsedView && (
              <div className="s-submenu">
                {visibleChildren.map((child, i) => (
                  <NavItem key={i}>
                    <NavLink
                      to={`${child.layout}${child.path}`}
                      tag={NavLinkRRD}
                      className="s-submenu-link"
                    >
                      {child.icon && <i className={`${child.icon} s-icon`} />}
                      <span>{child.name}</span>
                    </NavLink>
                  </NavItem>
                ))}
              </div>
            )}
          </div>
        );
      });
  };

  let brandProps = {};
  if (logo?.innerLink) brandProps = { to: logo.innerLink, tag: Link };
  else if (logo?.outterLink)
    brandProps = {
      href: logo.outterLink,
      target: "_blank",
      rel: "noopener noreferrer",
    };

  const isCollapsedView = collapsed && breakpoint !== "mobile";

  return (
    <>
      <style>{`
        :root {
          --sidebar-shift: ${SIDEBAR_FULL}px;
          --sb-transition: 0.25s ease;
        }

        .main-content {
          margin-left: var(--sidebar-shift) !important;
          transition: margin-left var(--sb-transition);
        }
        .navbar-top {
          left: var(--sidebar-shift) !important;
          width: calc(100% - var(--sidebar-shift)) !important;
          transition: left var(--sb-transition), width var(--sb-transition);
        }

        /* ── Sidebar shell ── */
        #sidenav-main {
          position: fixed !important;
          top: 0; left: 0; bottom: 0;
          height: 100vh !important;
          width: ${SIDEBAR_FULL}px;
          background: #fff;
          border-right: 1px solid #e9ecef;
          box-shadow: 2px 0 10px rgba(0,0,0,0.07);
          display: flex !important;
          flex-direction: column !important;

          /* KEY FIX: sidebar itself must be overflow visible
             so the toggle button can poke out to the right */
          overflow: visible !important;

          transition: width var(--sb-transition);
          z-index: 1030;
        }
        #sidenav-main.is-collapsed {
          width: ${SIDEBAR_COLLAPSED}px;
        }

        /* ── Tablet ── */
        @media (min-width: ${MOBILE_BREAKPOINT}px) and (max-width: ${TABLET_BREAKPOINT - 1}px) {
          #sidenav-main { width: ${SIDEBAR_COLLAPSED}px; }
          #sidenav-main.is-expanded-tablet { width: ${SIDEBAR_FULL}px; }
        }

        /* ── Mobile ── */
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          #sidenav-main {
            width: 270px !important;
            transform: translateX(-110%);
            transition: transform var(--sb-transition) !important;
            z-index: 1051;
            box-shadow: 4px 0 20px rgba(0,0,0,0.18);
          }
          #sidenav-main.is-mobile-open {
            transform: translateX(0) !important;
          }
          .main-content { margin-left: 0 !important; }
          .navbar-top { left: 0 !important; width: 100% !important; }
        }

        /* ── Inner area: scrollable, clips its own content only ── */
        .s-inner {
          display: flex;
          flex-direction: column;
          height: 100%;
          /* overflow only on y, x must be visible so toggle button isn't clipped */
          overflow-x: visible;
          overflow-y: auto;
          position: relative;
          scrollbar-width: thin;
          scrollbar-color: #dee2e6 transparent;
        }

        /* ── Brand ── */
        .s-brand {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 70px;
          padding: 14px 16px;
          // border-bottom: 1px solid #f0f2f5;
          flex-shrink: 0;
        }
        .s-brand a { line-height: 0; }
        .s-brand img {
          object-fit: contain;
          max-height: 38px;
          transition: width var(--sb-transition);
        }

        /* ── Toggle button — sits on the sidebar element itself, not s-inner ── */
        .s-toggle {
          position: absolute;
          /* right edge of sidebar, centred on the brand bar */
          right: -13px;
          top: 43px;
          width: 32px;
          height: 32px;
          background: #fff;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          border: 1px solid #dee2e6;
          box-shadow: 0 2px 8px rgba(0,0,0,0.14);
          font-size: 13px;
          /* must be above everything so it's never hidden */
          z-index: 1041;
          transition: box-shadow 0.2s, transform 0.15s;
          user-select: none;
          /* ensure it's never clipped */
          overflow: visible;
        }
        .s-toggle:hover {
          box-shadow: 0 4px 14px rgba(0,0,0,0.2);
          transform: scale(1.13);
        }
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          .s-toggle { display: none !important; }
        }

        /* ── Nav ── */
        .s-nav { padding: 10px 8px; flex: 1; }

        .sidebar-nav-link {
          display: flex !important;
          align-items: center !important;
          gap: 10px;
          padding: 10px 14px !important;
          border-radius: 8px;
          margin-bottom: 2px;
          color: #525f7f !important;
          font-size: 0.875rem;
          font-weight: 500;
          white-space: nowrap;
          overflow: hidden;
          text-decoration: none !important;
          transition: background 0.15s, color 0.15s !important;
          cursor: pointer;
          user-select: none;
        }
        .sidebar-nav-link:hover,
        .sidebar-nav-link:focus {
          background: #f4f5f7;
          color: #32325d !important;
          text-decoration: none !important;
        }
        .sidebar-nav-link.active {
          background: #eef2ff;
          color: #5e72e4 !important;
        }
        .sidebar-nav-link.icon-only {
          justify-content: center;
          padding: 10px !important;
        }

        .s-icon { font-size: 15px; min-width: 20px; text-align: center; flex-shrink: 0; }
        .s-label { flex: 1; overflow: hidden; text-overflow: ellipsis; }
        .s-chevron { font-size: 10px; opacity: 0.4; flex-shrink: 0; }

        /* ── Submenu ── */
        .s-submenu {
          margin: 2px 8px 4px 20px;
          border-left: 2px solid #e9ecef;
          padding-left: 6px;
        }
        .s-submenu-link {
          display: flex !important;
          align-items: center !important;
          gap: 8px;
          padding: 8px 10px !important;
          font-size: 0.82rem;
          color: #6b7a99 !important;
          border-radius: 6px;
          text-decoration: none !important;
          transition: background 0.15s, color 0.15s !important;
        }
        .s-submenu-link:hover { background: #f4f5f7; color: #32325d !important; }

        /* ── Mobile topbar ── */
        .s-mobile-topbar {
          display: none;
          position: fixed;
          top: 0; left: 0; right: 0;
          height: 56px;
          background: #fff;
          border-bottom: 1px solid #e9ecef;
          align-items: center;
          padding: 0 16px;
          gap: 12px;
          z-index: 1030;
          box-shadow: 0 2px 6px rgba(0,0,0,0.06);
        }
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          .s-mobile-topbar { display: flex; }
          .main-content { padding-top: 56px !important; }
        }
        .s-hamburger {
          background: none;
          border: none;
          padding: 6px;
          cursor: pointer;
          display: flex;
          flex-direction: column;
          gap: 5px;
          border-radius: 6px;
          transition: background 0.15s;
          z-index: 1032;
          position: relative;
        }
        .s-hamburger:hover { background: #f4f5f7; }
        .s-hamburger span {
          display: block;
          width: 20px;
          height: 2px;
          background: #525f7f;
          border-radius: 2px;
          transition: 0.2s;
        }

        /* ── Overlay ── */
        .s-overlay {
          display: none;
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.45);
          z-index: 1050;
          cursor: pointer;
        }
        @media (max-width: ${MOBILE_BREAKPOINT - 1}px) {
          .s-overlay.visible { display: block; }
        }
      `}</style>

      {/* Mobile overlay */}
      <div
        className={`s-overlay${mobileOpen ? " visible" : ""}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="s-mobile-topbar">
        <button
          className="s-hamburger"
          onClick={(e) => {
            e.stopPropagation();
            setMobileOpen((o) => !o);
          }}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span
            style={
              mobileOpen
                ? { transform: "rotate(45deg) translate(5px, 5px)" }
                : {}
            }
          />
          <span style={mobileOpen ? { opacity: 0 } : {}} />
          <span
            style={
              mobileOpen
                ? { transform: "rotate(-45deg) translate(5px, -5px)" }
                : {}
            }
          />
        </button>
        {logo && (
          <img
            src={logoImg}
            alt="IOS"
            style={{ height: "26px", objectFit: "contain" }}
          />
        )}
      </div>

      {/* ── Sidebar ── */}
      <nav
        id="sidenav-main"
        ref={sidebarRef}
        className={[
          isCollapsedView ? "is-collapsed" : "is-expanded-tablet",
          mobileOpen ? "is-mobile-open" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* 
          Toggle button is a DIRECT child of <nav>, NOT inside .s-inner
          This means it is never clipped by .s-inner's overflow 
        */}
        <div
          className="s-toggle"
          onClick={handleToggleCollapse}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === "Enter" && handleToggleCollapse()}
          aria-label={isCollapsedView ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsedView ? (
            <IoIosArrowForward style={{ fontSize: "15px" }} />
          ) : (
            <IoIosArrowBack style={{ fontSize: "15px" }} />
          )}
        </div>

        {/* Scrollable inner content */}
        <div className="s-inner">
          {/* Brand */}
          <div className="s-brand">
            {logo && (
              <NavbarBrand
                {...brandProps}
                style={{
                  margin: 0,
                  padding: 0,
                  opacity: isScanning ? 0.5 : 1,
                  cursor: isScanning ? "not-allowed" : "pointer",
                }}
                onClick={(e) => {
                  if (isScanning) {
                    e.preventDefault();
                    toast.warn("Scanning in progress");
                  }
                }}
              >
                <img
                  src={logoImg}
                  alt="IOS"
                  style={{ width: isCollapsedView ? "34px" : "88px" }}
                />
              </NavbarBrand>
            )}
          </div>

          {/* Nav links */}
          <Nav navbar className="s-nav">
            {routes?.length > 0 && createLinks(routes)}
          </Nav>
        </div>
      </nav>
    </>
  );
};

Sidebar.defaultProps = { routes: [] };

Sidebar.propTypes = {
  routes: PropTypes.arrayOf(PropTypes.object),
  logo: PropTypes.shape({
    innerLink: PropTypes.string,
    outterLink: PropTypes.string,
    imgSrc: PropTypes.string,
    imgAlt: PropTypes.string,
  }),
};

export default Sidebar;
