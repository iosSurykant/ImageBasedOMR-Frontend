import React, { useEffect, useState } from "react";
import {
  FaSearch,
  FaRegEdit,
  FaRegTrashAlt,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { fetchTemplates, deleteTemplate, getLayoutData, } from "../../redux/reducers/templateSlice";
import CreateTemplateModal from "./CreateTemplateModel";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Template = () => {
  const [showModal, setShowModal] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: templates, loading, error, } = useSelector((state) => state.templates);

  const handleEdit = async (id) => {
    try {
      const { payload } = await dispatch(getLayoutData(id));
      toast.success(payload.message);
      const Id = payload.data.id
      navigate(`/app/template/create-template/${Id}`);
    } catch (error) {
      console.log(error);
      toast.error("Error fetching template data");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this template?",
    );

    if (!confirmDelete) return;

    try {
      await dispatch(deleteTemplate(id)).unwrap();
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    dispatch(fetchTemplates());
  }, [dispatch]);

  const styles = {
    container: {
      backgroundColor: "#ffffff",
      border: "2px solid rgba(217, 217, 217, 0.4)",
      borderRadius: "8px",
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    title: {
      fontWeight: "700",
      color: "#1a1a1a",
      fontSize: "20px",
    },
    searchWrapper: {
      position: "relative",
      width: "240px",
    },
    searchInput: {
      borderRadius: "6px",
      borderColor: "#e2e8f0",
      paddingLeft: "35px",
      fontSize: "14px",
      height: "38px",
      color: "#4a5568",
    },
    searchIcon: {
      position: "absolute",
      left: "12px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#a0aec0",
      fontSize: "14px",
    },
    btnCreate: {
      background: "linear-gradient(to left, #3969FE, #1047D5)",
      borderColor: "#1d52e5",
      fontWeight: 600,
      borderRadius: "6px",
      fontSize: "14px",
      padding: "8px 16px",
      boxShadow: "0 2px 4px rgba(29, 82, 229, 0.2)",
      color: "#fff",
    },
    th: {
      backgroundColor: "#F1F4FC",
      color: "#4a5568",
      fontWeight: "600",
      fontSize: "14px",
      borderBottom: "none",
      padding: "14px 16px",
      textTransform: "capitalize" 
    },
    td: {
      verticalAlign: "middle",
      fontSize: "14px",
      color: "#4a5568",
      borderBottom: "1px solid #f0f2f5",
      padding: "16px",
    },
    templateCode: {
      color: "#718096",
      fontSize: "12px",
      fontWeight: "500",
    },
    badgeIncomplete: {
      backgroundColor: "#fff6e6",
      color: "#d97706",
      letterSpacing: "0.05em",
      fontWeight: "600",
      fontSize: "12px",
      padding: "6px 12px",
      borderRadius: "6px",
    },
    badgeActive: {
      backgroundColor: "#e6f6ee",
      color: "#178752",
      letterSpacing: "0.05em",
      fontWeight: "600",
      fontSize: "12px",
      padding: "6px 12px",
      borderRadius: "6px",
    },
    actionBtn: {
      background: "none",
      border: "none",
      padding: "4px 8px",
      cursor: "pointer",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "16px",
    },

    paginationText: {
      color: "#a0aec0",
      fontSize: "14px",
      fontWeight: "500",
      cursor: "not-allowed",
    },
    paginationNum: {
      color: "#4a5568",
      fontSize: "14px",
      fontWeight: "500",
      padding: "6px 12px",
      cursor: "pointer",
    },
    paginationActive: {
      backgroundColor: "#1d52e5",
      color: "#ffffff",
      fontSize: "14px",
      fontWeight: "600",
      borderRadius: "6px",
      padding: "6px 12px",
    },
  };

  return (
    <div
      className="container-fluid pb-4 pt-2 bg-white h-100"
      style={{ overflowY: "scroll" }}
    >
      <div className="p-4 mx-auto" style={{ ...styles.container }}>
        {/* Top Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="m-0" style={styles.title}>
            All Templates
          </h2>

          <div className="d-flex align-items-center">
            <div className="mr-3" style={styles.searchWrapper}>
              <FaSearch style={styles.searchIcon} />
              <input
                type="text"
                className="form-control"
                placeholder="Search Template"
                style={styles.searchInput}
              />
            </div>

            <button
              onClick={() => setShowModal(true)}
              className="btn btn-primary"
              style={styles.btnCreate}
            >
              Create Template
            </button>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="text-center py-4">
            <div className="spinner-border text-primary" role="status">
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!loading && !error && (
          <div className="table-responsive">
            <table className="table table-borderless m-0">
              <thead>
                <tr>
                  <th style={{ ...styles.th, width: "60px" }}>Sr</th>
                  <th style={{ ...styles.th, minWidth: "240px", }}>
                    Template Name
                  </th>
                  <th style={{ ...styles.th, minWidth: "280px" }}>
                    Description
                  </th>
                  <th style={{ ...styles.th, minWidth: "180px" }}>
                    Updated On
                  </th>
                  <th style={{ ...styles.th, minWidth: "110px" }}>Status</th>
                  <th style={{ ...styles.th, width: "140px", textAlign: "center" }}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {templates?.map((row) => (
                  <tr key={row.id}>
                    <td style={styles.td} className="text-muted">
                      {
                        templates?.indexOf(row) + 1
                      }
                    </td>
                    <td style={styles.td}>
                      <div className="d-flex align-items-center">
                        <img
                          src={process.env.REACT_APP_BACKEND_URL + row.imgPath}
                          alt="thumbnail"
                          className="rounded mr-3 border"
                          style={{ width: "40px", height: "40px", objectFit: "cover" }} />
                        <div>
                          <div style={{ fontWeight: "600", color: "#2d3748" }}>
                            {row.fileName}
                          </div>
                          <div style={styles.templateCode}>
                            ID - {row.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.td} className="text-muted">
                      {row.discription}
                    </td>
                    <td style={styles.td}>{row.createAt}</td>
                    <td style={styles.td}>
                      <span
                        style={
                          row.jsonPath !== ""
                            ? styles.badgeActive
                            : styles.badgeIncomplete
                        }
                      >
                        {row.jsonPath === "" ? "Incomplete" : "Active"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <div className="d-flex justify-content-center align-items-center">
                        <button
                          onClick={() => handleEdit(row.id)}
                          style={{
                            ...styles.actionBtn,
                          }}
                          title="Edit"
                          className="mx-2 p-2 rounded"
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#E3E8FF")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <FaRegEdit color="#1d52e5" />
                        </button>

                        <button
                          onClick={() => handleDelete(row.id)}
                          style={{
                            ...styles.actionBtn,
                          }}
                          title="Delete"
                          className="p-2 rounded"
                          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FAD7D7")}
                          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        >
                          <FaRegTrashAlt color="#e53e3e" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Section */}
        <div className="d-flex justify-content-end align-items-center mt-4 pt-2">
          <div className="d-flex align-items-center">
            <span
              className="d-flex align-items-center mr-3"
              style={styles.paginationText}
            >
              <FaChevronLeft size={12} className="mr-2" /> Previous
            </span>
            <span className="mx-1" style={styles.paginationActive}>
              1
            </span>
            <span className="mx-1" style={styles.paginationNum}>
              2
            </span>
            <span className="mx-1" style={styles.paginationNum}>
              3
            </span>
            <span
              className="d-flex align-items-center ml-3"
              style={{
                ...styles.paginationNum,
                color: "#1d52e5",
                fontWeight: "600",
              }}
            >
              Next <FaChevronRight size={12} className="ml-2" />
            </span>
          </div>
        </div>
      </div>

      <CreateTemplateModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </div>
  );
};

export default Template;
