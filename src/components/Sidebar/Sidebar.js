import { useRef, useState } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useScan } from "context/ScanningContext";
import logoImg from "../../assets/img/brand/ios.png";
import { IoIosArrowBack } from "react-icons/io";
import { IoIosArrowForward } from "react-icons/io";

import {
  Button,
  Form,
  Input,
  InputGroupAddon,
  InputGroupText,
  InputGroup,
  Collapse,
  NavbarBrand,
  Navbar,
  NavItem,
  NavLink,
  Nav,
  Container,
} from "reactstrap";

import "@fortawesome/fontawesome-free/css/all.min.css";

const Sidebar = (props) => {
  const { isScanning, isPausedContext } = useScan();
  const [collapseOpen, setCollapseOpen] = useState(false); // ✅ default false
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const sidebarRef = useRef(null);

  // Toggle collapse
  const toggleCollapse = () => {
    setCollapseOpen((prev) => !prev);
  };

  // Close collapse
  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  //Toggle Sidebar
  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  // Create sidebar links
  // const createLinks = (routes) => {
  //   return routes
  //     .filter((prop) => prop.showInSidebar !== false) // 👈 hide route
  //     .map((prop, key) => (
  //       <NavItem key={key}>
  //         <NavLink
  //           to={isScanning ? "#" : prop.layout + prop.path}
  //           tag={NavLinkRRD}
  //           onClick={(e) => {
  //             if (isScanning && !isPausedContext) {
  //               e.preventDefault();
  //               toast.info("Pause the scanning to navigate");
  //             }
  //             closeCollapse();
  //           }}
  //           style={{
  //             opacity: isScanning && !isPausedContext ? 0.5 : 1,
  //             cursor:
  //               isScanning && !isPausedContext ? "not-allowed" : "pointer",
  //           }}
  //         >
  //           <i className={prop.icon} style={{fontSize:15}}/>
  //           {!isSidebarCollapsed && <span className="ml-2">{prop.name}</span>}
  //         </NavLink>
  //       </NavItem>
  //     ));
  // };

  const createLinks = (routes) => {
    return routes
      ?.filter(({ showInSidebar }) => showInSidebar !== false)
      ?.map((route, index) => {
        const isDisabled = isScanning && !isPausedContext;

        return (
          <NavItem key={route.path || index}>
            <NavLink
              to={isDisabled ? "#" : `${route.layout}${route.path}`}
              tag={NavLinkRRD}
              onClick={(e) => {
                if (isDisabled) {
                  e.preventDefault();
                  toast.info("Pause the scanning to navigate");
                  return;
                }
                closeCollapse();
              }}
              className={isDisabled ? "disabled-link" : ""}
            >
              <i className={route.icon} style={{ fontSize: "18px", marginLeft:"8px" }} />

              {!isSidebarCollapsed && (
                <span className="ml-2">{route.name || "Unnamed"}</span>
              )}
            </NavLink>
          </NavItem>
          
        );
      });
  };

    <style jsx>
    {`
      .disabled-link {
        opacity: 0.5;
        cursor: not-allowed;
        pointer-events: auto; /* allow click to show toast */
      }
    `}
  </style>;


  const { routes, logo } = props;

  let navbarBrandProps = {};
  if (logo && logo.innerLink) {
    navbarBrandProps = {
      to: logo.innerLink,
      tag: Link,
    };
  } else if (logo && logo.outterLink) {
    navbarBrandProps = {
      href: logo.outterLink,
      target: "_blank",
      rel: "noopener noreferrer",
    };
  }

  return (
    <Navbar
      className={`navbar-vertical fixed-left navbar-light bg-white ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
      expand="md"
      id="sidenav-main"
      ref={sidebarRef}
      style={{ overflow: "visible" }}
    >
      <style jsx>
        {`
          .sidebar-collapsed {
            width: 80px !important;
          }

          .sidebar-collapsed .nav-link span {
            display: none;
          }

          .sidebar-collapsed .navbar-brand-img {
            width: 40px;
          }

          .navbar-vertical {
            transition: width 0.3s ease;
          }
        `}
      </style>

      <Container fluid>
        {/* Toggler */}
        <button
          className="navbar-toggler"
          type="button"
          onClick={toggleCollapse}
        >
          <span className="navbar-toggler-icon" />
        </button>

        {/* Brand (UNCHANGED as you requested) */}
        {logo ? (
          <NavbarBrand className="pt-0" {...navbarBrandProps}>
            <img alt={"IOS"} className="navbar-brand-img" src={logoImg} />
          </NavbarBrand>
        ) : null}

        {/* Sidebar Collaps */}
        <div
          onClick={toggleSidebar}
          style={{
            position: "absolute",
            right: "-15px",
            top: "55px",
            width: "40px",
            height: "40px",
            background: "#fff",
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            border: "1px solid #ddd",
            boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
            fontSize: "20px",
            fontWeight: 900,
          }}
        >
          {isSidebarCollapsed ? <IoIosArrowForward /> : <IoIosArrowBack />}
        </div>

        <Collapse navbar isOpen={collapseOpen}>
          <Button
            className="navbar-toggler"
            type="button"
            onClick={toggleCollapse}
          >
            <i className="fa-solid fa-xmark"></i>
          </Button>

          {/* Mobile Search */}
          <Form className="mt-4 mb-3 d-md-none">
            <InputGroup className="input-group-rounded input-group-merge">
              <Input
                aria-label="Search"
                className="form-control-rounded form-control-prepended"
                placeholder="Search"
                type="search"
              />
              <InputGroupAddon addonType="prepend">
                <InputGroupText>
                  <span className="fa fa-search" />
                </InputGroupText>
              </InputGroupAddon>
            </InputGroup>
          </Form>

          {/* Navigation */}
          <Nav navbar>{routes && routes.length > 0 && createLinks(routes)}</Nav>
        </Collapse>
      </Container>
    </Navbar>
  );
};

// ✅ safer default
Sidebar.defaultProps = {
  routes: [],
};

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
