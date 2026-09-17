import React, { useState } from "react";
import { GoSidebarExpand } from "react-icons/go";
import { IoNotificationsOutline, IoWalletOutline } from "react-icons/io5";
import { MdKeyboardArrowDown } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { FiUser, FiSettings, FiHelpCircle, FiLogOut } from 'react-icons/fi';
import { toast } from "react-toastify";
import { logout } from "helper/userManagment_helper";

const AdminNavbar = ({ brandText, isTabCollapsed, setIsTabCollapsed }) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const userData = JSON.parse(localStorage.getItem("userData"));
  const role = userData?.role;
  const userName = userData?.userName;
  const Role = role.charAt(0).toUpperCase() + role.slice(1).toLowerCase();

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

  const menuItemStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 16px', fontSize: '14px', fontWeight: 500, color: '#1e293b', cursor: 'pointer', transition: 'background-color 0.15s ease' };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white mt-4 pt-4 mr-4"
      style={{
        fontFamily: "outfit",
        borderTopRightRadius: "20px",
        borderTopLeftRadius: "20px",
        userSelect:"none"
      }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <div className="d-flex align-items-center" style={{ gap: "1rem" }}>
          <button
            className="btn p-0 border-0 outline-none shadow-none d-lg-none"
            type="button"
            onClick={() => { setIsTabCollapsed(!isTabCollapsed) }}
            aria-label="Toggle Sidebar">
            <GoSidebarExpand style={{ width: "24px", height: "24px", transform: isTabCollapsed ? "rotate(180deg)" : "none", transition: "transform 0.3s ease", }} />
          </button>

          <div style={{ fontSize: "1rem", letterSpacing: "0.03em" }}>
            <p className="mb-0 text-dark"         >
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
            style={{ gap: "8px", border: "1px solid #C7E0FF", borderRadius: "15px", }}          >
            <span className="p-1 p-md-2 rounded d-flex align-items-center">
              <IoWalletOutline size={18} color="blue" />
            </span>
            <div>
              <div className=" text-dark" style={{ fontSize: "0.85rem", lineHeight: "1.2" }}              >
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
            <MdKeyboardArrowDown
              size={22}
              className="d-none d-md-block"
              style={{ marginTop: "-3px", transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease-in-out" }}
            />

            {isDropdownOpen && (
              <div className=""
                style={{ position: 'absolute', top: '110%', right: '0', width: '195px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.01)', zIndex: 1000, overflow: 'hidden', }}>
                <div onClick={() => navigate('/app/user-profile')} style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EDEDED')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FiUser size={18} style={{ color: '#64748b' }} />
                  <span>My Profile</span>
                </div>

                {/* Setting */}
                <div style={menuItemStyle}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EDEDED')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FiSettings size={18} style={{ color: '#64748b' }} />
                  <span>Setting</span>
                </div>

                {/* Help & Support */}
                <div style={{ ...menuItemStyle }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#EDEDED')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <FiHelpCircle size={18} style={{ color: '#64748b' }} />
                  <span>Help & Support</span>
                </div>

                {/* Log Out  */}
                <div style={{ ...menuItemStyle, backgroundColor: '#fef2f2', color: '#ef4444', paddingTop: '11px', paddingBottom: '11px' }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#fee2e2')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fef2f2')}
                  onClick={handleLogOut}
                >
                  <FiLogOut size={18} style={{ color: '#ef4444' }} />
                  <span style={{ fontWeight: 600 }}>Log Out</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
