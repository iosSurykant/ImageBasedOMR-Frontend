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


// Columns of the list, in order. `adminOnly` columns are hidden for other roles.
const COLUMNS = [
  { key: "folderName", label: "FolderName" },
  { key: "templateId", label: "TemplateId" },
  { key: "fileName", label: "FileName" },
  { key: "dateTime", label: "DateTime" },
  { key: "userId", label: "UserId" },
  { key: "username", label: "UserName", adminOnly: true },
  { key: "useremail", label: "UserEmail", adminOnly: true },
  { key: "userrole", label: "UserRole", adminOnly: true },
];

// fetchAllUsers asks the API for 7 users per page
const USERS_PAGE_SIZE = 7;

// "Tem_1052_$32484$_PrintedOMR_Sheet1_29-09-2026-15:19:07"
//   -> { userId: "1052", templateId: "32484", folderName: "PrintedOMR_Sheet1", dateTime: "29-09-2026-15:19:07" }
const parseTableName = (name = "") => {
  const m = String(name).match(
    /^Tem_(.+?)_\$(.+?)\$_(.*)_(\d{2}-\d{2}-\d{4}-\d{2}:\d{2}:\d{2})$/,
  );
  return m
    ? { userId: m[1], templateId: m[2], folderName: m[3], dateTime: m[4] }
    : {};
};

// The API can send the user id as "Tem_1040"; keep only "1040"
const cleanUserId = (v) => String(v ?? "").replace(/^Tem_/i, "").trim();

const userKey = (u) => String(u?.empId ?? u?.EmpId ?? u?.id ?? "");

const cellStyle = (key) => {
  if (key === "dateTime") return { whiteSpace: "nowrap" };
  if (key === "fileName")
    return {
      maxWidth: 260,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    };
  if (key === "useremail")
    return {
      maxWidth: 190,
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    };
  return undefined;
};

// Actions column stays visible while the table scrolls sideways
const stickyAction = {
  position: "sticky",
  right: 0,
  zIndex: 1,
  boxShadow: "-6px 0 6px -6px rgba(0,0,0,.18)",
};

export default function ScannedList() {
  const [isOpen, setIsOpen] = useState(false);

  const [selectedTableData, setSelectedTableData] = useState([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [scaned, setScaned] = useState([]);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(localStorage.getItem("userData") || "{}");
  const role = userData?.role;
  const empId = userData?.empid;
  const referenceId = userData?.referenceId ?? "";
  const isAdmin = role === "admin";

  const visibleColumns = COLUMNS.filter((c) => isAdmin || !c.adminOnly);

  // Fetch all users, page by page. A failure here must not hide the records:
  // the user columns just show "-".
  const fetchUsers = async () => {
    const all = [];
    const seen = new Set();

    try {
      for (let page = 1; page <= 30; page++) {
        // same arguments the User Management page sends ("" = no filter)
        const result = await fetchAllUsers(page, "", "", "", referenceId);
        const list =
          result?.result ||
          result?.data?.result ||
          (Array.isArray(result?.data) ? result.data : []);
        if (!Array.isArray(list) || !list.length) break;

        let added = 0;
        list.forEach((u) => {
          const k = userKey(u);
          if (k && !seen.has(k)) {
            seen.add(k);
            all.push(u);
            added++;
          }
        });

        // last page, or the API ignored the page number
        if (list.length < USERS_PAGE_SIZE || added === 0) break;
      }
    } catch (error) {
      console.error("Could not load users:", error);
    }

    setUsers(all);
    return all;
  };

  // Fetch records
  const fetchRecords = async (
    fileName = "",
    usersData = users,
  ) => {
    try {
      setLoading(true);

      const res = await getDBRecords(fileName);

      const result = res?.queryResult || [];

      if (!result.length) {
        setScaned([]);
        return [];
      }

      // User lookup
      const userMap = {};
      usersData.forEach((user) => {
        userMap[userKey(user)] = user;
      });
      if (empId && !userMap[String(empId)]) {
        userMap[String(empId)] = {
          empName: userData?.empName ?? userData?.name ?? userData?.userName,
          empEmail: userData?.empEmail ?? userData?.email,
          role: userData?.role,
        };
      }

      const finalData = result.map((item) => {
        // full table name, e.g. Tem_1052_$32484$_PrintedOMR_Sheet1_29-09-2026-15:19:07
        const tableName = item.fileName || item.TABLE_NAME || "";
        const parsed = parseTableName(tableName);

        const templateId = String(item.templateId ?? parsed.templateId ?? "");

        const userId = cleanUserId(item.userId || parsed.userId) || "-";
        const user = userMap[userId] || {};

        return {
          fileName: tableName || "-", // shown in the list, also used by Open / Delete
          folderName: item.folderName ?? parsed.folderName ?? "-",
          templateId: templateId || "-",
          dateTime: item.dateTime ?? item.date ?? parsed.dateTime ?? "-",
          userId,
          username: user.empName ?? user.name ?? "-",
          useremail: user.empEmail ?? user.email ?? "-",
          userrole: user.role ?? "-",
        };
      });

      // Admin sees everything, other roles only their own scans
      const roleBaseData = isAdmin
        ? finalData
        : finalData.filter(({ userId }) => String(userId) === String(empId));

      setScaned(roleBaseData);

      return finalData;
    } catch (err) {
      console.error(err);
      toast.error("Could not load the records");
      setScaned([]);

      return [];
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      // only admins see the user columns, so others skip the users call
      const usersData = isAdmin ? await fetchUsers() : [];

      await fetchRecords("", usersData);
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Open Modal
  const handleOpen = async (row) => {
    try {
      const result = await getDBRecords(row?.fileName);

      setSelectedTableData(result?.queryResult || []);

      setIsOpen(true);
    } catch (err) {
      console.error(err);
      toast.error("Could not open this record");
    }
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
      await deleteDBRecords(row?.fileName);
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

  // Filtered Data (searches the columns that are on screen)
  const filteredRecord = scaned.filter((row) =>
    visibleColumns.some(({ key }) =>
      row[key]?.toString().toLowerCase().includes(debouncedSearch.toLowerCase()),
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
                <div
                  className="d-flex flex-wrap justify-content-between align-items-center"
                  style={{ gap: 8 }}
                >
                  <h3 className="mb-0">All Records</h3>

                  {/* Search */}
                  <div style={{ width: "250px", maxWidth: "100%" }}>
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
                  <Table className="align-items-center table-flush" style={{ fontSize: 14 }}>
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

                        {visibleColumns.map(({ key, label }) => (
                          <th key={key} className="text-nowrap">{label}</th>
                        ))}

                        <th className="text-end" style={{ ...stickyAction, background: "#f6f9fc" }}>Actions</th>
                      </tr>
                    </thead>

                    {/* Table Body */}
                    <tbody>
                      {filteredRecord.map((row, index) => (
                        <tr key={row.fileName || index}>
                          <td>{index + 1}</td>

                          {visibleColumns.map(({ key }) => (
                            <td key={key} style={cellStyle(key)} title={row[key]}>{row[key]}</td>
                          ))}

                          {/* Actions */}
                          <td className="text-end" style={{ ...stickyAction, background: "#fff" }}>
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