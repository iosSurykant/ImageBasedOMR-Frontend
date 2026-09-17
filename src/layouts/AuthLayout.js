import React, { useEffect, useRef } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Container, Row, Col } from "reactstrap";
import { MdCloudUpload } from "react-icons/md";
import { BiScan } from "react-icons/bi";
import { FaDatabase } from "react-icons/fa";
import { LuFileSpreadsheet } from "react-icons/lu";
import { HiTemplate } from "react-icons/hi";
import Omr from '../assets/Auth/Omr.png'

import routes from "../config/routes";
import "./auth.css";

const AuthLayout = () => {
  const mainContent = useRef(null);
  const location = useLocation();

  useEffect(() => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    if (mainContent.current) {
      mainContent.current.scrollTop = 0;
    }
  }, [location]);

  // Generate auth routes
  const getRoutes = () =>
    routes.filter((route) => route.layout === "/auth").map((route, index) => (
      <Route key={index} path={route.path} element={<route.component />} />
    ));

  return (
    <div className="omr-page-wrapper d-flex align-items-center min-vh-100" ref={mainContent}>
      <Container>
        <Row className="align-items-center justify-conten-center">
          <Col lg={7} className="mb-5 mb-lg-0 text-left">
            <div className="d-none d-lg-flex flex-column ">
              <span>
                <h1 className="text-dark text-nowrap mb-3" style={{ fontWeight: '700', fontSize: '2.8rem', letterSpacing: '-0.5px' }}>
                  Image-Based <span className="text-primary-blue ">OMR</span>
                </h1>
              </span>

              <span className="text-muted mb-5" style={{ maxWidth: '420px', fontSize: '1.05rem', lineHeight: '1.5', fontWeight: "500" }}>
                Upload OMR sheets, finalize data, and generate results with confidence.
              </span>

            </div>

            <Row className="no-gutters mb-5 justify-content-between d-none d-lg-flex" style={{ maxWidth: "500px" }}            >
              {[
                { icon: <MdCloudUpload />, label: "Image Upload" },
                { icon: <BiScan />, label: "OMR Scanning" },
                { icon: <FaDatabase />, label: "Data Finalization" },
                { icon: <LuFileSpreadsheet />, label: "Result Generation" },
                { icon: <HiTemplate />, label: "Template Design" }
              ].map((item, idx) => (
                <Col key={idx} xs={3} md={2} className="d-flex flex-column align-items-center">
                  <div className="icon-circle mb-2 d-flex align-items-center justify-content-center">
                    <span style={{ fontSize: "1.3rem", color: "#2563eb", display: "inline-flex" }}>
                      {item.icon}
                    </span>
                  </div>
                  <span className="text-dark text-center" style={{ fontWeight: "700", fontSize: ".75rem", letterSpacing: '0.4px' }}>
                    {item.label}
                  </span>
                </Col>
              ))}
            </Row>

            <div className="graphics-container mt-5 d-block d-md-none d-lg-block">
              <div style={{ maxWidth: "480px", width: "100%" }} className="text-center d-flex">
                <img src={Omr} alt="OMR Dashboard Presentation" className="img-fluid" />
              </div>
            </div>
          </Col>

          {/* Right Column */}
          <Col lg={5} md={8} sm={10} className="mx-auto">
            <Routes>
              {getRoutes()}
              <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
          </Col>

        </Row>
      </Container>
    </div>
  );
};

export default AuthLayout;