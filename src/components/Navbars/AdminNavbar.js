import React, { useState } from "react";
import { GoSidebarExpand } from "react-icons/go";
import { IoNotificationsOutline, IoWalletOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";

const AdminNavbar = ({ brandText, isTabCollapsed, setIsTabCollapsed }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const role = userData?.role;
  const userName = userData?.userName;

  const Role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white mt-4 pt-4 mr-4"
      style={{
        fontFamily: "Inter, sans-serif",
        borderTopRightRadius: "20px",
        borderTopLeftRadius: "20px",
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
          <button
            className="btn p-0 border-0 outline-none shadow-none d-lg-none"
            type="button"
            onClick={() => {
              setIsTabCollapsed(!isTabCollapsed);
            }}
            aria-label="Toggle Sidebar"
          >
            <GoSidebarExpand
              style={{
                width: "24px",
                height: "24px",
                transform: isTabCollapsed ? "rotate(180deg)" : "none",
                transition: "transform 0.3s ease",
              }}
            />
          </button>

          <div>
            <p
              className="mb-0 text-dark"
              style={{ fontSize: "0.9rem", letterSpacing: "0.03em" }}
            >
              {Role} / <span style={{ color: "blue" }}>{brandText}</span>
            </p>
            <p className="text-muted small mb-0 d-none d-sm-block">
              Welcome Back, {userName}
            </p>
          </div>
        </div>

        <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
          <div
            className="bg-white px-2 py-1 px-md-3 py-md-2 d-none d-sm-flex align-items-center"
            style={{
              gap: "8px",
              border: "1px solid #C7E0FF",
              borderRadius: "15px",
            }}
          >
            <span className="p-1 p-md-2 rounded d-flex align-items-center">
              <IoWalletOutline size={18} color="blue" />
            </span>
            <div>
              <div
                className="font-weight-bold text-dark"
                style={{ fontSize: "0.85rem", lineHeight: "1.2" }}
              >
                ₹ 2,450.00
              </div>
              <div className="text-muted" style={{ fontSize: "0.68rem" }}>
                Wallet Balance
              </div>
            </div>
          </div>

          {/* Notification Bell */}
          <span
            className="d-flex align-items-center justify-content-center position-relative"
            style={{ width: "38px", height: "38px", cursor: "pointer" }}
          >
            <IoNotificationsOutline size={24} color="black" />
            <span
              className="position-absolute badge badge-danger rounded-circle p-0"
              style={{
                top: "4px",
                right: "4px",
                width: "8px",
                height: "8px",
                backgroundColor: "#dc3545",
              }}
            >
              &nbsp;
            </span>
          </span>

          {/* User Profile Area */}
          <div
            className="d-flex"
            style={{ gap: "8px", cursor: "pointer", position: "relative" }}
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
              alt="Avatar"
              className="rounded-circle"
              style={{ width: "36px", height: "36px", objectFit: "cover", border: "1px solid #e2e8f0", }} />
            <div className="d-none d-md-block text-left">
              <div className="font-weight-bold text-dark m-0" style={{ fontSize: "0.85rem", lineHeight: "1.2" }}>{Role}</div>
              <small className="text-muted d-block" style={{ fontSize: "0.70rem" }}>{userName}</small>
            </div>
            <MdKeyboardArrowDown size={22} className="d-none d-md-block" style={{ marginTop: "-3px" }} />

            {isDropdownOpen && (
              <div
                className="bg-white rounded shadow-sm py-2"
                style={{
                  position: "absolute",
                  top: "110%",
                  right: "0",
                  minWidth: "150px",
                  zIndex: 1000,
                  border: "1px solid #e2e8f0"
                }}
              >
                <div className="px-3 py-1 text-dark" style={{ cursor: "pointer" }}>Profile</div>
                <div className="px-3 py-1 text-dark" style={{ cursor: "pointer" }}>Settings</div>
                <hr className="my-1" />
                <div className="px-3 py-1 text-danger" style={{ cursor: "pointer" }}>Logout</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
