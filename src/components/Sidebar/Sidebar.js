import { useRef, useState } from "react";
import { NavLink as NavLinkRRD, Link } from "react-router-dom";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import { useScan } from "context/ScanningContext";

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
  const sidebarRef = useRef(null);

  // Toggle collapse
  const toggleCollapse = () => {
    setCollapseOpen((prev) => !prev);
  };

  // Close collapse
  const closeCollapse = () => {
    setCollapseOpen(false);
  };

  // Create sidebar links
const createLinks = (routes) => {
  return routes
    .filter((prop) => prop.showInSidebar !== false) // 👈 hide route
    .map((prop, key) => (
      <NavItem key={key}>
        <NavLink
          to={isScanning ? "#" : prop.layout + prop.path}
          tag={NavLinkRRD}
          onClick={(e) => {
            if (isScanning && !isPausedContext) {
              e.preventDefault();
              toast.info("Pause the scanning to navigate");
            }
            closeCollapse();
          }}
          style={{
            opacity: isScanning && !isPausedContext ? 0.5 : 1,
            cursor:
              isScanning && !isPausedContext
                ? "not-allowed"
                : "pointer",
          }}
        >
          <i className={prop.icon} />
          {prop.name}
        </NavLink>
      </NavItem>
    ));
};

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
      className="navbar-vertical fixed-left navbar-light bg-white"
      expand="md"
      id="sidenav-main"
      ref={sidebarRef}
    >
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
            <img
              alt={"IOS"}
              className="navbar-brand-img"
              src={require("../../assets/img/brand/ios.png")}
            />
          </NavbarBrand>
        ) : null}

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
          <Nav navbar>
            {routes && routes.length > 0 && createLinks(routes)}
          </Nav>
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