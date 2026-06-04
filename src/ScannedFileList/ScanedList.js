import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  DropdownMenu,
  DropdownItem,
  UncontrolledDropdown,
  DropdownToggle,
  Table,
  Container,
} from "reactstrap";
import { Row } from "react-bootstrap";
import { toast } from "react-toastify";
import Swal from "sweetalert2";

import NormalHeader from "components/Headers/NormalHeader";

import { getDBRecords, deleteDBRecords } from "helper/ResultGenerationHelper";
import { fetchAllUsers } from "helper/userManagment_helper";

import { fetchAllTemplate } from "helper/TemplateHelper";

export default function ScannedList() {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedTableData, setSelectedTableData] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [allTemplates, setAllTemplates] = useState([]);
  const [scaned, setScaned] = useState([]);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData"));
  const role = userData.role;
  const empId = userData.empid;
  console.log(empId);

  // Fetch all templates
  const fetchAllTemplates = async () => {
    try {
      const result = await fetchAllTemplate();

      const templates = result?.body || [];

      console.log("Fetched Templates:", templates);

      setAllTemplates(templates);

      return templates;
    } catch (error) {
      console.error("Failed to fetch templates:", error);

      setAllTemplates([]);

      return [];
    }
  };

  //fetch all users
  const fetchUsers = async () => {
    try {
      const result = await fetchAllUsers();

      const usersData = result?.result || [];

      setUsers(usersData);

      return usersData;
    } catch (error) {
      console.log(error);

      setUsers([]);

      return [];
    }
  };

  // Fetch records
  const fetchRecords = async (
    fileName = "",
    templates = allTemplates,
    usersData = users,
    empID = empId,
  ) => {
    try {
      setLoading(true);

      const res = await getDBRecords(fileName);

      const result = res?.queryResult || [];

      if (!result.length) {
        setScaned([]);
        return [];
      }

      // Template lookup
      const templateMap = {};

      templates.forEach((temp) => {
        templateMap[temp.id] = temp.fileName;
      });

      // User lookup
      const userMap = {};

      usersData.forEach((user) => {
        userMap[user.empId] = user;
      });

      // Final data
      const finalData = result.map((item) => {
        const parts = item.TABLE_NAME.split("_");
        const cleanTableName = item.TABLE_NAME;
        const templateId = parts[1];
        const date = parts.slice(2).join("_");

        // templateBoss##1001
        const fullTemplateName = templateMap[templateId] || "";

        const [templateName = "-", userId = "-"] = fullTemplateName.split("##");

        // Find user
        const user = userMap[userId] || {};

        return {
          ...item,
          TABLE_NAME: cleanTableName,
          templateName,
          date,
          userId,
          username: user.empName || "-",
          useremail: user.empEmail || "-",
          userrole: user.role || "-",
        };
      });

      const roleBaseData =
        role === "admin"
          ? finalData
          : finalData
              .filter(({ userId }) => String(userId) === String(empId))
              .map(
                ({ username, useremail, userId, userrole, ...rest }) => rest,
              );

      setScaned(roleBaseData);

      return finalData;
    } catch (err) {
      console.error(err);

      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      const templates = await fetchAllTemplates();

      const users = await fetchUsers();

      await fetchRecords("", templates, users, empId);
    };

    loadData();
  }, []);

  // Open Modal
  const handleOpen = async (row) => {
    const tableName = row?.TABLE_NAME;

    const result = await getDBRecords(tableName, allTemplates);

    const subData = result?.queryResult;
    console.log(subData);

    setSelectedTableData(subData);

    setIsOpen(true);
  };

  // Delete
  const handleDelete = async (row) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "No, Keep it",
    });

    if (!result.isConfirmed) return;

    try {
      const folderPath = row?.TABLE_NAME;
      await deleteDBRecords(folderPath);
      await fetchRecords();
      Swal.fire("Deleted!", "Record deleted successfully.", "success");
    } catch (err) {
      console.error(err);

      Swal.fire("Error!", "Failed to delete record.", "error");
    }
  };
  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Filtered Data
  const filteredRecord = scaned.filter((row) =>
    Object.values(row).some((value) =>
      value?.toString().toLowerCase().includes(debouncedSearch.toLowerCase()),
    ),
  );

  // CSV Download
  const downloadCsv = () => {
    try {
      if (!selectedTableData?.length) {
        toast.error("No data available to download");
        return;
      }

      // Header
      const header = Object.keys(selectedTableData[0]);

      // Rows
      const rows = selectedTableData.map((row) =>
        header.map((field) => `"${row[field] ?? ""}"`).join(","),
      );

      // CSV Content
      const csvContent = [header.join(","), ...rows].join("\n");

      // Blob
      const blob = new Blob([csvContent], {
        type: "text/csv;charset=utf-8",
      });

      // Download
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", "Table_Data_Csv.csv");

      document.body.appendChild(link);

      link.click();

      document.body.removeChild(link);
    } catch (err) {
      console.log(err);

      toast.error("Something went wrong while downloading CSV");
    }
  };

  return (
    <div>
      <NormalHeader />

      <Container className="mt--7" fluid>
        <Row>
          <div className="col">
            <Card className="shadow">
              {/* Header */}
              <CardHeader className="border-0">
                <div className="d-flex justify-content-between align-items-center">
                  <h3 className="mb-0">All Records</h3>

                  {/* Search */}
                  <div style={{ width: "250px" }}>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>

              {/* Loading */}
              {loading ? (
                <div className="text-center py-5">Loading...</div>
              ) : filteredRecord.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  No Records Found
                </div>
              ) : (
                <div
                  style={{
                    height: "70vh",
                    overflow: "auto",
                  }}
                >
                  <Table className="align-items-center table-flush">
                    {/* Table Head */}
                    <thead
                      className="thead-light"
                      style={{
                        position: "sticky",
                        top: 0,
                        zIndex: 10,
                      }}
                    >
                      <tr>
                        <th>S.No</th>

                        {Object.keys(filteredRecord[0])
                          .filter((key) => key !== "TABLE_NAME")
                          .map((key) => (
                            <th key={key}>{key}</th>
                          ))}

                        <th className="text-end">Actions</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {filteredRecord.map((row, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>

                          {Object.entries(row)
                            .filter(([key]) => key !== "TABLE_NAME")
                            .map(([key, value]) => (
                              <td key={key}>{value}</td>
                            ))}

                          {/* Actions */}
                          <td className="text-end">
                            <UncontrolledDropdown>
                              <DropdownToggle
                                className="btn btn-sm btn-icon-only text-light"
                                role="button"
                                onClick={(e) => e.preventDefault()}
                              >
                                <i className="fas fa-ellipsis-v" />
                              </DropdownToggle>

                              <DropdownMenu right>
                                <DropdownItem onClick={() => handleOpen(row)}>
                                  Open
                                </DropdownItem>

                                <DropdownItem
                                  className="text-danger"
                                  onClick={() => handleDelete(row)}
                                >
                                  Delete
                                </DropdownItem>
                              </DropdownMenu>
                            </UncontrolledDropdown>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card>
          </div>
        </Row>
      </Container>

      {/* Modal */}
      {isOpen && (
        <>
          {/* Overlay */}
          <div className="modal-backdrop fade show"></div>

          <div className="modal fade show" style={{ display: "block" }}>
            <div className="modal-dialog modal-xl modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg">
                {/* Header */}
                <div className="modal-header border-0 pb-0">
                  <h4 className="mb-0">Data Table</h4>
                </div>

                {/* Body */}
                <div className="modal-body pt-3">
                  {selectedTableData?.length === 0 ? (
                    <div className="text-center py-5 text-muted">
                      No Data Found
                    </div>
                  ) : (
                    <div
                      style={{
                        maxHeight: "60vh",
                        overflow: "auto",
                      }}
                      className="border rounded"
                    >
                      <Table className="align-items-center table-flush mb-0">
                        <thead className="thead-light">
                          <tr>
                            {Object.keys(selectedTableData[0]).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>

                        <tbody>
                          {selectedTableData.map((row, index) => (
                            <tr key={index}>
                              {Object.values(row).map((value, i) => (
                                <td key={i}>{value}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="modal-footer border-0 pt-2">
                  <button className="btn btn-success" onClick={downloadCsv}>
                    Download CSV
                  </button>

                  <button
                    className="btn btn-secondary"
                    onClick={() => setIsOpen(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
