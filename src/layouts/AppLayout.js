import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import AdminNavbar from "components/Navbars/AdminNavbar";
import Sidebar from "components/Sidebar/Sidebar";
import TabletSidebar from "components/Sidebar/TabletSidebar";

import routes from "../config/routes";
import backgroundImage from '../assets/Auth/AuthBack.png';
import { TroubleshootRounded } from "@mui/icons-material";

const AppLayout = (props) => {
  const [isTabCollapsed, setIsTabCollapsed] = useState(TroubleshootRounded);

  const mainContent = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (mainContent.current) {
      mainContent.current.scrollTop = 0;
    }
    setIsTabCollapsed(true);
  }, [location]);

  const getRoutes = () =>
    routes
      ?.filter((route) => route.layout === "/app")
      .map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={<route.component />}
        />
      ));

  const getBrandText = () => {
    const currentRoute = routes.find(
      (route) =>
        route.layout === "/app" &&
        location.pathname.startsWith(route.layout + route.path)
    );
    return currentRoute?.name || "Dashboard";
  };

  return (
    <>
      <div
        className="d-flex h-100 position-relative" 
        style={{
          backgroundImage: `url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          width: '100vw',
          overflowX: 'hidden' // prevents accidental scrolling when sidebar is hidden
        }}
      >
        {/* Ye desktop par hamesha normal layout me rahega */}
        <div className="d-none d-lg-block">
          <Sidebar {...props} routes={routes} />
        </div>

        {/* Ye component screen ke upar float karega, layout ko disturb nahi karega */}
        <div 
          className="d-block d-lg-none"
          style={{
            position: "fixed",
            top: 0,
            left: isTabCollapsed ? "-320px" : "0px", 
            zIndex: 1050, 
            backgroundColor: "rgba(255, 255, 255, 0.95)", 
            boxShadow: "4px 0 25px rgba(0,0,0,0.15)",
            transition: "left 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            height: "100vh"
          }}
        >
          <TabletSidebar routes={routes} isTabCollapsed={isTabCollapsed} setIsTabCollapsed={setIsTabCollapsed} />
        </div>

        {/* Backdrop overlay: Jab sidebar open ho toh background me shadow dikhegi */}
        {!isTabCollapsed && (
          <div 
            className="d-block d-lg-none"
            onClick={() => setIsTabCollapsed(true)} 
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.4)",
              zIndex: 1040,
              backdropFilter: "blur(2px)"
            }}
          />
        )}

        {/* Iska layout hamesha stable rahega */}
        <div
          className="main-content flex-grow-1 d-flex flex-column"
          ref={mainContent}
          style={{
            minHeight: '100vh',
            overflowY: 'auto',
          }}
        >
          <AdminNavbar
            {...props}
            brandText={getBrandText()}
            isTabCollapsed={isTabCollapsed}
            setIsTabCollapsed={setIsTabCollapsed}
          />

          <div className="mr-4 pb-4 h-100" style={{ overflowY: "auto", height: "calc(100vh - 64px)", scrollbarWidth: "none" }}>
            <Routes>
              {getRoutes()}
              <Route
                path="*"
                element={<Navigate to="/app/index" replace />}
              />
            </Routes>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppLayout;