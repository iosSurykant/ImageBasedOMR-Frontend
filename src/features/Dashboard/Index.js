
import React from 'react';

import DashboardImage from "../../assets/App/DashboardImage.png"
import { PiScanFill } from "react-icons/pi";
import { FaRegCheckCircle, FaRegIdBadge } from "react-icons/fa";
import { CgTemplate } from "react-icons/cg";
import { IoWalletOutline } from 'react-icons/io5';
import { MdAddModerator, MdOutlineDocumentScanner } from 'react-icons/md';
import { RxCrossCircled } from 'react-icons/rx';
import { TfiPencilAlt } from 'react-icons/tfi';
import { BsBuildingExclamation } from 'react-icons/bs';


const Dashboard = () => {
  // Mock Data arrays for 100% visual parity
  const metrics = [
    { title: "Total Template", value: "126", trend: "12.5%", isUp: true, color: "#6f42c1", bg: "#f3f0fc", icon: <CgTemplate /> },
    { title: "Total Wallet Credits", value: "₹ 2,450.00", trend: "5%", isUp: true, color: "#28a745", bg: "#e9f7ef", icon: <IoWalletOutline /> },
    { title: "Total Scanned Records", value: "12,456", trend: "7%", isUp: true, color: "#007bff", bg: "#e6f2ff", icon: <MdOutlineDocumentScanner /> },
    { title: "Total Failed Records", value: "34", trend: "2%", isUp: true, color: "#dc3545", bg: "#fdf2f3", icon: <RxCrossCircled /> },
    { title: "Total Operators", value: "5", trend: "1%", isUp: true, color: "#ffc107", bg: "#fff9e6", icon: <FaRegIdBadge /> },
    { title: "Total Moderator", value: "2", trend: "1%", isUp: true, color: "#6f42c1", bg: "#f3f0fc", icon: <MdAddModerator /> },
    { title: "Pending Finalization", value: "34", trend: "2%", isUp: true, color: "#17a2b8", bg: "#e8f6f8", icon: <BsBuildingExclamation /> },
    { title: "Total Result Generate", value: "64", trend: "10%", isUp: true, color: "#28a745", bg: "#e9f7ef", icon: <TfiPencilAlt /> }
  ];

  const results = [
    { name: "Mathematics - Class 10", sheets: 150, date: "21 May 2024, 10:30 AM", status: "Completed" },
    { name: "Science - Class 12", sheets: 200, date: "21 May 2024, 09:15 AM", status: "Completed" },
    { name: "English - Class 10", sheets: 120, date: "20 May 2024, 02:20 PM", status: "Completed" },
    { name: "Physics - Class 9", sheets: 90, date: "19 May 2024, 11:10 AM", status: "Processing" }
  ];

  const activities = [
    { name: "Admin User", role: "Admin", action: 'Generated results for "Mathematics - Class 10"', time: "2 min ago", roleBg: "#e6f0ff", roleColor: "#007bff" },
    { name: "John Operator", role: "Operator", action: 'Scanned 150 sheets for "Science - Class 12"', time: "15 min ago", roleBg: "#e6f9f0", roleColor: "#28a745" },
    { name: "Priya Moderator", role: "Moderator", action: 'Finalized results for "English - Class 10"', time: "1 hr ago", roleBg: "#f3f0fc", roleColor: "#6f42c1" },
    { name: "Priya Moderator", role: "Moderator", action: 'Finalized results for "English - Class 10"', time: "1 hr ago", roleBg: "#f3f0fc", roleColor: "#6f42c1" }
  ];

  return (
    <div className="container-fluid" style={{ backgroundColor: 'white', fontFamily: 'Inter, sans-serif', borderBottomRightRadius: "20px", borderBottomLeftRadius: "20px" }}>


      {/* HERO  BANNER */}
      <div className="card border-0 mb-4 position-relative" style={{ height: "220px", background: 'linear-gradient(90deg, #EDF1FC 0%, #EDF1FC 100%)', borderRadius: '16px' }}>

        <div className="d-flex flex-column flex-md-row align-items-center justify-content-between " style={{ height: "100%" }}>

          <div
            className="p-3 p-md-4 mb-4 mb-md-0"
            style={{
              width: '100%',
              height: "100%",
              maxWidth: 'var(--text-width, 100%)',
            }}
          >
            <style>{`@media (min-width: 1024px) {:root { --text-width: 45%; --title-size: 0.9rem; --desc-size: 0.75rem; --card-scale-1: -40px; --card-scale-2: -80px; }}
                     @media (min-width: 1440px) {:root { --text-width: 35%; --title-size: 1.3rem; --desc-size: 0.8rem; --card-scale-1: -60px; --card-scale-2: -130px;}`}
            </style>

            <h2 className="font-weight-bold mb-1" style={{ color: 'black', fontSize: 'var(--title-size, 1.3rem)' }}>
              Simplify OMR Processing.
            </h2>
            <h2 className="font-weight-bold mb-3" style={{ color: '#2f80ed', fontSize: 'var(--title-size, 1.3rem)' }}>
              Save Time. Get Accurate Results.
            </h2>
            <p className="d-none d-md-block text-dark" style={{ fontSize: 'var(--desc-size, 0.75rem)', lineHeight: '1.7', textAlign: "left" }}>
              Upload, scan, finalize data, and generate results seamlessly - all in one place.
            </p>
          </div>

          {/* Image & Floating Cards Section */}
          <div className="d-flex align-items-center position-relative justify-content-center" style={{ height: "100%" }}>

            {/* Top Floating Card: Scanning Progress */}
            <div className="bg-white p-2 rounded shadow-sm position-absolute d-flex align-items-center"
              style={{
                top: '28px',
                left: 'var(--card-scale-1, -20px)',
                width: '180px',
                mdWidth: '210px',
                zIndex: 2,
                borderRadius: '14px'
              }}
            >
              <span className="d-flex mr-2 align-items-center justify-content-center me-2 me-md-3"
                style={{ backgroundColor: '#F2F6FE', borderRadius: '50%', width: '38px', height: '38px', color: '#2f80ed', flexShrink: 0 }}>
                <PiScanFill size={18} />
              </span>

              <div>
                <span className="text-muted d-block font-weight-medium mb-0" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>
                  Scanning Progress
                </span>
                <div className="font-weight-bold text-dark mt-1" style={{ fontSize: '0.85rem', lineHeight: '1.2' }}>
                  12,455 / 15,000
                </div>
              </div>
            </div>

            {/* Bottom Floating Card: Accuracy Rate */}
            <div
              className="bg-white p-2 rounded shadow-sm position-absolute d-flex align-items-center"
              style={{
                bottom: '40px',
                left: 'var(--card-scale-2, -80px)',
                width: '150px',
                mdWidth: '180px',
                zIndex: 2,
                borderRadius: '14px'
              }}
            >
              <span
                className="d-flex mr-2 align-items-center justify-content-center me-2 me-md-3"
                style={{ backgroundColor: '#E9F7EF', borderRadius: '50%', width: '38px', height: '38px', color: '#28a745', flexShrink: 0 }}
              >
                <FaRegCheckCircle size={16} />
              </span>

              <div>
                <span className="text-muted d-block font-weight-medium mb-0" style={{ fontSize: '0.7rem', lineHeight: '1.2' }}>
                  Accuracy Rate
                </span>
                <div className="font-weight-bold text-success mt-1" style={{ fontSize: '1rem', lineHeight: '1.2' }}>
                  98.8%
                </div>
              </div>
            </div>

            {/* Core Mockup Graphic */}
            <img src={DashboardImage} alt="Admin Mockup" className="img-fluid"
              style={{
                height: "100%",
                borderRadius: "16px",
                objectFit: "cover"
              }}
            />
          </div>
        </div>

      </div>

      {/* METRIC CARD GRID */}
      <div className="row no-gutters mb-4" style={{ margin: '0 -8px' }}>
        {metrics.map((m, i) => (
          <div key={i} className="col-12 col-sm-6 col-lg-4 col-xl-3 p-2">
            <div className="card h-100 border bg-white p-3 shadow-none" style={{ borderRadius: '12px', border: '1px solid #eef2f5' }}>
              <div className="d-flex align-items-start justify-content-start">
                <div
                  className="d-flex align-items-center justify-content-center mr-3"
                  style={{
                    backgroundColor: m.bg,
                    color: m.color,
                    borderRadius: '8px',
                    flexShrink: 0,
                    padding: "6px 10px"
                  }}
                >
                  <span style={{ fontSize: "25px" }}>{m.icon}</span>
                </div>

                <div>
                  <span className="text-muted d-block mb-1" style={{ fontSize: '0.85rem', fontWeight: "600" }}>{m.title}</span>
                  <h3 className="text-dark mb-2" style={{ fontSize: '1.25rem', fontWeight: "700" }}>{m.value}</h3>
                  <span className="text-success" style={{ fontSize: '0.75rem' }}>
                    ↑ {m.trend} <span className="text-muted font-weight-normal">Last Month</span>
                  </span>
                </div>

              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS CONTAINER SECTION */}
      <div className="row mb-4">
        {/* Line Chart */}
        <div className="col-12 mb-4 col-xl-7">
          <div className="card bg-white p-4 h-100" style={{ borderRadius: '14px', border: '1px solid #eef2f5' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="font-weight-bold text-dark m-0" style={{ fontSize: "1.5rem" }}>Scan Overview</h2>
              <a href="#details" className="text-primary font-weight-bold small text-decoration-none">View Details</a>
            </div>

            <div className="position-relative w-100" style={{ height: '250px' }}>
              <svg viewBox="0 0 820 220" className="w-100 h-100">
                {/* Horizontal Helper Lines - Stretched to x=780 */}
                <line x1="40" y1="20" x2="780" y2="20" stroke="#f1f3f5" strokeWidth="1" />
                <line x1="40" y1="70" x2="780" y2="70" stroke="#f1f3f5" strokeWidth="1" />
                <line x1="40" y1="120" x2="780" y2="120" stroke="#f1f3f5" strokeWidth="1" />
                <line x1="40" y1="170" x2="780" y2="170" stroke="#f1f3f5" strokeWidth="1" />
                <line x1="40" y1="200" x2="780" y2="200" stroke="#cbd5e1" strokeWidth="1.5" />

                {/* Y Axis Grid Values */}
                <text x="12" y="25" fill="#94a3b8" fontSize="11" textAnchor="end">400</text>
                <text x="12" y="75" fill="#94a3b8" fontSize="11" textAnchor="end">300</text>
                <text x="12" y="125" fill="#94a3b8" fontSize="11" textAnchor="end">200</text>
                <text x="12" y="175" fill="#94a3b8" fontSize="11" textAnchor="end">100</text>
                <text x="12" y="204" fill="#94a3b8" fontSize="11" textAnchor="end">0</text>

                {/* Shaded Area Layer Underneath Area Spline (Jan to Oct) */}
                <path
                  d="M 50 70 
             C 90 80, 90 100, 130 110 
             C 170 120, 170 170, 210 170 
             C 250 170, 250 115, 290 115 
             C 330 115, 330 110, 370 110 
             C 410 110, 410 125, 450 125 
             C 490 125, 490 125, 530 125 
             C 570 125, 570 155, 610 155 
             C 650 155, 650 145, 690 145 
             C 730 145, 730 190, 770 190 
             L 770 200 L 50 200 Z"
                  fill="#7442ca"
                  fillOpacity="0.08"
                />

                {/* Visual Spline Curve Line (Jan to Oct) */}
                <path
                  d="M 50 70 
             C 90 80, 90 100, 130 110 
             C 170 120, 170 170, 210 170 
             C 250 170, 250 115, 290 115 
             C 330 115, 330 110, 370 110 
             C 410 110, 410 125, 450 125 
             C 490 125, 490 125, 530 125 
             C 570 125, 570 155, 610 155 
             C 650 155, 650 145, 690 145 
             C 730 145, 730 190, 770 190"
                  fill="none"
                  stroke="#7442ca"
                  strokeWidth="2.5"
                />

                {/* Precision Coordinates Anchors Data Dots - Balanced & Spaced */}
                <circle cx="50" cy="70" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="130" cy="110" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="210" cy="170" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="290" cy="115" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="370" cy="110" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="450" cy="125" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="530" cy="125" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="610" cy="155" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="690" cy="145" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />
                <circle cx="770" cy="190" r="4" fill="#fff" stroke="#7442ca" strokeWidth="2" />

                {/* X Axis Grid Data Markers Labels - Centered perfectly under each dot */}
                <text x="50" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Jan</text>
                <text x="130" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Feb</text>
                <text x="210" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Mar</text>
                <text x="290" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Apr</text>
                <text x="370" y="218" fill="#64748b" fontSize="12" textAnchor="middle">May</text>
                <text x="450" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Jun</text>
                <text x="530" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Jul</text>
                <text x="610" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Aug</text>
                <text x="690" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Sep</text>
                <text x="770" y="218" fill="#64748b" fontSize="12" textAnchor="middle">Oct</text>
              </svg>
            </div>
          </div>
        </div>

        {/* Donut Chart Component */}
        <div className="col-12 col-xl-5">
          <div className="card bg-white p-4 h-100" style={{ borderRadius: '14px', border: '1px solid #eef2f5' }}>
            <h2 className="font-weight-bold text-dark mb-4">Scan By Status</h2>
            {/* Added responsive flex-direction classes here */}
            <div className="d-flex flex-column flex-sm-row align-items-center justify-content-between h-100">

              {/* Donut Layout Block */}
              {/* Added flex-shrink-0 to prevent the donut from warping when squeezed */}
              <div className="position-relative d-flex align-items-center justify-content-center flex-shrink-0" style={{ width: '190px', height: '190px' }}>
                <svg width="100%" height="100%" viewBox="0 0 42 42" className="donut">
                  <circle className="donut-hole" cx="21" cy="21" r="15.915" fill="#fff"></circle>
                  <circle className="donut-ring" cx="21" cy="21" r="15.915" fill="transparent" stroke="#f1f3f5" strokeWidth="4"></circle>

                  {/* Segment calculation mappings */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#3D51F4" strokeWidth="4" strokeDasharray="82 18" strokeDashoffset="0"></circle>
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#34C759" strokeWidth="4" strokeDasharray="12 88" strokeDashoffset="-82"></circle>
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#dc3545" strokeWidth="4" strokeDasharray="2 98" strokeDashoffset="-94"></circle>
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#ffc107" strokeWidth="4" strokeDasharray="4 96" strokeDashoffset="-96"></circle>
                </svg>
                <div className="position-absolute text-center">
                  <h4 className="font-weight-bold m-0 text-dark" style={{ fontSize: '1.4rem' }}>12,458</h4>
                  <small className="text-muted font-weight-bold tracking-wider uppercase">Total</small>
                </div>
              </div>

              {/* Precise Aligned Legend Details Grid */}
              {/* Replaced fixed pl-6 with responsive pl-sm-4 and top spacing for mobile */}
              <div className="flex-grow-1 pl-sm-4 pt-4 pt-sm-0 text-muted w-100" style={{ fontSize: '0.88rem', fontWeight: "700" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span><span className="rounded-circle mr-2" style={{ width: '12px', height: '12px', display: 'inline-block', p: 0, backgroundColor: "#3D51F4" }}> </span>Completed</span>
                  <span>10,525 (82%)</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span><span className="rounded-circle mr-2" style={{ width: '12px', height: '12px', display: 'inline-block', p: 0, backgroundColor: "#34C759" }}> </span>Processing</span>
                  <span>13,560 (12%)</span>
                </div>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span><span className="rounded-circle mr-2" style={{ width: '12px', height: '12px', display: 'inline-block', p: 0, backgroundColor: "#FF2D55" }}> </span>Failed</span>
                  <span>245 (2%)</span>
                </div>
                <div className="d-flex justify-content-between align-items-center">
                  <span><span className="rounded-circle mr-2" style={{ width: '12px', height: '12px', display: 'inline-block', p: 0, backgroundColor: "#ffc107" }}> </span>Pending</span>
                  <span>1254 (8%)</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* LOWER DATA MATRIX LABELS ROW */}
      <div className="row pb-5">
        {/* Left Side Table Lists */}
        <div className="col-12 col-xl-7 mb-4 mb-lg-0">
          <div className="card bg-white p-4 h-100" style={{ borderRadius: '14px', border: '1px solid #eef2f5' }}>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="font-weight-bold text-dark m-0">Generated Result List</h2>
              <a href="#all" className="text-primary font-weight-bold small text-decoration-none">View All</a>
            </div>
            <div className="table-responsive">
              <table className="table table-borderless align-middle m-0" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr className="font-weight-normal" style={{ borderRadius: '6px', backgroundColor: "rgba(241, 244, 251, 1)" }}>
                    <th className="py-2.5 border-0">Test/Template Name</th>
                    <th className="py-2.5 border-0 text-center">Total Sheets</th>
                    <th className="py-2.5 border-0">Generated On</th>
                    <th className="py-2.5 border-0">Status</th>
                    <th className="py-2.5 border-0 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((row, idx) => (
                    <tr key={idx} className="border-bottom" style={{ borderColor: '#f8f9fa !important' }}>
                      <td className="py-3 font-weight-medium text-dark">{row.name}</td>
                      <td className="py-3 text-center text-muted">{row.sheets}</td>
                      <td className="py-3 text-muted">{row.date}</td>
                      <td className="py-3">
                        <span className={`badge px-2 py-1.5 font-weight-bold rounded`} style={{
                          backgroundColor: row.status === 'Completed' ? '#e6f9f0' : '#fff3cd',
                          color: row.status === 'Completed' ? '#28a745' : '#ffc107',
                          fontSize: '0.75rem'
                        }}>
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <button className="btn btn-link p-0 text-primary">
                          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Side Logs Section Activity Timeline */}
        <div className="col-12 col-xl-5">
          <div className="card bg-white p-4 h-100" style={{ borderRadius: '14px', border: '1px solid #eef2f5' }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="font-weight-bold text-dark m-0">Recent User Activity</h2>
              <a href="#all" className="text-primary font-weight-bold small text-decoration-none">View All</a>
            </div>
            <div className="d-flex flex-column" style={{ gap: '1.25rem' }}>
              {activities.map((act, idx) => (
                <div key={idx} className="d-flex align-items-start justify-content-between">
                  <div className="d-flex align-items-start">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80" alt="User Profile" className="rounded-circle mr-3" style={{ width: '38px', height: '38px', objectFit: 'cover' }} />
                    <div>
                      <div className="d-flex align-items-center mb-1" style={{ gap: '8px' }}>
                        <span className="font-weight-bold text-dark" style={{ fontSize: '0.9rem' }}>{act.name}</span>
                        <span className="badge px-2 py-0.5 font-weight-bold" style={{ backgroundColor: act.roleBg, color: act.roleColor, fontSize: '0.7rem', borderRadius: '4px' }}>{act.role}</span>
                      </div>
                      <p className="text-muted m-0" style={{ fontSize: '0.82rem', lineHeight: '1.4' }}>{act.action}</p>
                    </div>
                  </div>
                  <small className="text-muted text-nowrap pl-2" style={{ fontSize: '0.78rem' }}>{act.time}</small>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
