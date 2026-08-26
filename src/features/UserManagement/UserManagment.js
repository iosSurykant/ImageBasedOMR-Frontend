import React, { useEffect, useState } from 'react';
import { AiOutlineDelete } from 'react-icons/ai';
import { FiEdit } from 'react-icons/fi';
import { IoIosArrowDown, IoIosSearch } from 'react-icons/io';
import { useDispatch, useSelector } from 'react-redux';
import { getAllUsers } from 'redux/reducers/UserManagementSlice';
import CreateUserForm from './CreateUserForm';
import { deleteUser } from 'redux/reducers/UserManagementSlice';
import Swal from 'sweetalert2';


// Common base styles for badges
const baseBadgeStyle = {
  padding: '6px 12px',
  borderRadius: '6px',
  fontWeight: '500',
  fontSize: '13px',
  display: 'inline-block',
  letterSpacing: '0.8px',
};

const getRoleBadgeStyle = (role) => {
  switch (role) {
    case 'admin': return { ...baseBadgeStyle, backgroundColor: '#ECF4FF', color: '#1B41FB', };
    case 'operator': return { ...baseBadgeStyle, backgroundColor: '#F2EDFE', color: '#4F25D6', };
    case 'moderator': return { ...baseBadgeStyle, backgroundColor: '#E9FBFC', color: '#1589AF', };
    default: return { ...baseBadgeStyle, backgroundColor: '#f8fafc', color: '#475569', };
  }
};

const getStatusBadgeStyle = (isLoggedIn) => {
  return isLoggedIn === true
    ? { ...baseBadgeStyle, backgroundColor: '#DCF4EC', color: '#09835B' }
    : { ...baseBadgeStyle, backgroundColor: '#fee2e2', color: '#dc2626' };
};

export default function UserManagment() {
  const [createModal, setCreateModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [userId, setUserId] = useState('')
  const [activeDropdown, setActiveDropdown] = useState(null);

  // SEARCHING
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')

  const userData = useSelector((state) => state.UserData?.allUsers)
  const refreshUsers = useSelector((state) => state.UserData?.refreshUsers);
  const dispatch = useDispatch()


  // --- Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = useSelector((state) => state.UserData?.totalPages)

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage((prev) => prev - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
  };

  const handlePageClick = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  // DEBOUNCING
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 500)
    return () => clearTimeout(timeout)
  }, [searchQuery])


  useEffect(() => {
    dispatch(getAllUsers({ currentPage, statusFilter, roleFilter, debouncedSearchQuery }))
  }, [currentPage, dispatch, statusFilter, roleFilter, debouncedSearchQuery, refreshUsers])


  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This user will be permanently deleted.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await dispatch(deleteUser(id)).unwrap();

      dispatch(getAllUsers({ currentPage, statusFilter, roleFilter, debouncedSearchQuery }))

      await Swal.fire({
        title: "Deleted!",
        text: "User has been deleted.",
        icon: "success",
      });
    } catch (error) {
      Swal.fire({
        title: "Delete failed",
        text: error?.message || "Something went wrong while deleting the user.",
        icon: "error",
      });
    }
  };


  // Shared Inline Styles
  const containerStyle = { backgroundColor: '#fff', fontFamily: "outfit", padding: '24px', height: '100%', overflowY: 'auto' };
  const cardStyle = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '24px' };
  const textDarkBlue = { color: '#5A5A5A', fontWeight: '600' };
  const textLightGrey = { color: '#64748b' };

  const btnCreateStyle = { backgroundColor: '#2563eb', border: 'none', color: '#ffffff', fontWeight: '500', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer' };

  const inputStyle = { border: '1px solid #e2e8f0', borderRadius: '8px', height: '42px', color: '#64748b', boxShadow: 'none', appearance: "none", };

  const tableWrapperStyle = { overflow: 'hidden' };
  const thStyle = { fontSize: "14px", backgroundColor: '#f4f6fa', color: '#252525', fontWeight: '600', borderTop: 'none', borderBottom: '1px solid #e2e8f0', textTransform: "capitalize" };
  const tdStyle = { verticalAlign: 'middle', color: '#475569', fontWeight: '500', borderTop: '1px solid #f1f5f9' };

  const paginationLinkStyle = { border: 'none', color: '#64748b', fontWeight: '500', margin: '0 4px', borderRadius: '6px', background: 'transparent' };
  const paginationActiveStyle = { ...paginationLinkStyle, backgroundColor: '#2563eb', color: '#ffffff' };

  return (
    <>
      <div className="container-fluid" style={containerStyle}>
        <div style={cardStyle}>

          {/* Header Actions */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
            <h4 className="mb-3 mb-md-0" style={{ ...textDarkBlue, margin: 0 }}>User List</h4>
            <button
              onClick={() => {
                setUserId(null);
                setCreateModal(true);
              }}
              style={btnCreateStyle}>
              Create User
            </button>
          </div>

          {/* Filters */}
          <div className="row mb-4">
            <div className="col-lg-6 col-xl-8 col-md-6 mb-3 mb-lg-0">
              <div className="input-group" style={{ height: '42px' }}>
                <div className="input-group-prepend">
                  <span className="input-group-text bg-white" style={{ border: '1px solid #e2e8f0', borderRight: 'none', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}>
                    <IoIosSearch size={22} />
                  </span>
                </div>
                <input onChange={(e) => setSearchQuery(e.target.value)} type="text" className="form-control" placeholder="Search users...." style={{ ...inputStyle, borderLeft: 'none', borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }} />
              </div>
            </div>
            <div className="col-lg-3 col-xl-2 col-md-3 col-6 mb-3 mb-lg-0 position-relative">
              <IoIosArrowDown
                size={22}
                className='position-absolute'
                style={{
                  right: '30px',
                  top: '10px',
                  pointerEvents: 'none',
                  transition: 'transform 0.3s ease',
                  transform: activeDropdown === 'All Roles' ? 'rotate(180deg)' : 'none'
                }}/>
              <select
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setActiveDropdown(null);
                  e.target.blur();
                }}
                onFocus={() => setActiveDropdown("All Roles")}
                onBlur={() => setActiveDropdown(null)}
                className="form-control apear"
                style={inputStyle}>
                <option value="">All Roles</option>
                <option value="moderator">Moderator</option>
                <option value="operator">Operator</option>
              </select>
            </div>

            <div className="col-lg-3 col-xl-2 col-md-3 col-6 mb-3 mb-lg-0 position-relative">
              <IoIosArrowDown
                size={22}
                className='position-absolute'
                style={{
                  right: '30px',
                  top: '10px',
                  pointerEvents: 'none',
                  transition: 'transform 0.3s ease',
                  transform: activeDropdown === 'Active' ? 'rotate(180deg)' : 'none'
                }}/>
              <select
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setActiveDropdown(null);
                  e.target.blur();
                }}
                onFocus={() => setActiveDropdown('Active')}
                onBlur={() => setActiveDropdown(null)}
                className="form-control apear"
                style={inputStyle}
              >
                <option value="">All Status</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>

          {/* DESKTOP VIEW        */}
          <div className="d-none d-lg-block">
            <div style={tableWrapperStyle}>
              <table className="table table-hover mb-0" style={{ backgroundColor: '#ffffff' }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, paddingLeft: '1.5rem' }}>Sr.</th>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Reference Id</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Created On</th>
                    <th style={thStyle}>Status</th>
                    <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {userData?.map((user, index) => (
                    <tr key={user.id} style={{ cursor: 'default' }}>
                      <td style={{ ...tdStyle, paddingLeft: '1.5rem' }}><span style={textLightGrey}>{index + 1}</span></td>
                      <td style={tdStyle}>
                        <div className="d-flex align-items-center">
                          <img src="https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png" alt="avatar" className="rounded-circle mr-3" width="40" height="40" style={{ objectFit: 'cover' }} />
                          <div>
                            <div style={{ ...textDarkBlue, fontSize: '15px', marginBottom: '2px' }}>{user.empName}</div>
                            <div style={{ ...textLightGrey, fontSize: '13px' }}>{user.empEmail}</div>
                          </div>
                        </div>
                      </td>
                      <td style={tdStyle}><span style={textLightGrey}>{user.refranceId}</span></td>
                      <td style={tdStyle}>
                        <span style={getRoleBadgeStyle(user.role)} className="text-capitalize">
                          {user.role}
                        </span>
                      </td>
                      <td style={tdStyle}><span style={textLightGrey}>{user.createdOn}</span></td>
                      <td style={tdStyle}>
                        <span style={getStatusBadgeStyle(user.isLoggedIn)}>
                          {user.isLoggedIn ? "Active" : "Incomplete"}
                        </span>
                      </td>
                      <td style={tdStyle}>
                        <div className="d-flex justify-content-around">
                          <span onClick={() => { setCreateModal(true); setUserId(user.empId) }} style={{ color: '#ef4444', cursor: 'pointer', }}><FiEdit size={20} color='#3b82f6' /></span>
                          <span onClick={() => handleDelete(user.empId)} style={{ color: '#ef4444', cursor: 'pointer' }}><AiOutlineDelete size={22} color='#ef4444' /></span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* TABLET / MOBILE VIEW (Cards)   */}
          <div className="d-block d-lg-none">
            <div className="row">
              {userData?.map((user) => (
                <div className="col-md-6 mb-4" key={user.empId}>
                  <div className="d-flex flex-column justify-content-between h-100"
                    style={{ border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px 12px', backgroundColor: '#ffffff' }}>

                    <div className="d-flex mb-4">

                      <img
                        src="https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png"
                        alt="avatar"
                        className="rounded-circle"
                        width="60"
                        height="60"
                        style={{ objectFit: 'cover' }} />

                      <div className="w-100" style={{ minWidth: 0 }}>
                        <div className="d-flex justify-content-between align-items-start mb-1 gap-2">
                          <div className="text-truncate" style={{ color: '#475569', fontSize: '16px', fontWeight: '500' }}>
                            {user.empName || "FirstOperator"}
                          </div>

                          <span className="flex-shrink-0 text-capitalize" style={getRoleBadgeStyle(user.role)}>
                            {user.role}
                          </span>
                        </div>

                        <div className="text-truncate" style={{ color: '#64748b', fontSize: '14px', marginBottom: '2px' }}>
                          {user.empEmail || "iyer.rubina@gmail.com"}
                        </div>
                      </div>
                    </div>

                    {/* Card Middle: Ref Code & Date */}
                    <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2" style={{ color: '#64748b', fontSize: '13px', fontWeight: '500' }}>
                      <div style={{ wordBreak: 'break-all' }}>Ref Id : {user.refranceId}</div>
                      {/* <div>{user.createdOnCard}</div> */}
                    </div>

                    {/* Card Bottom: Status & Actions */}
                    <div className="d-flex justify-content-between align-items-center pt-3" style={{ borderTop: '1px solid #e2e8f0' }}>

                      <div className="d-flex align-items-center">
                        <span style={{ color: '#64748b', fontSize: '16px', fontWeight: '500', marginRight: '12px' }}>
                          Status:
                        </span>
                        <span style={{ backgroundColor: user.isLoggedIn ? '#d1fae5' : '#fee2e2', color: user.isLoggedIn ? '#059669' : '#dc2626', padding: '4px 10px', fontWeight: '500', borderRadius: '6px', fontSize: '14px', }}>
                          {user.isLoggedIn ? "Active" : "Incomplete"}
                        </span>
                      </div>

                      <div className="d-flex align-items-center flex-shrink-0" style={{ gap: "20px" }}>
                        <span onClick={() => { setCreateModal(true); setUserId(user.empId) }} style={{ color: '#2563eb', cursor: 'pointer' }}><FiEdit size={20} style={{ strokeWidth: "2.5" }} /></span>
                        <span onClick={() => handleDelete(user.empId)} style={{ color: '#ef4444', cursor: 'pointer' }}><AiOutlineDelete size={22} style={{ strokeWidth: "1.5" }} /></span>
                      </div>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* PAGINATION */}
          <div className="d-flex justify-content-end mt-4 pt-2">
            <nav>
              <ul className="pagination mb-0 align-items-center">

                {/* Previous Button */}
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link d-flex align-items-center gap-2 shadow-none"
                    tabIndex={currentPage === 1 ? "-1" : "0"}
                    onClick={handlePrev}
                    style={{
                      ...paginationLinkStyle,
                      color: currentPage === 1 ? '#cbd5e1' : '#2563eb', // Gray if disabled, Blue if active
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                    }}>
                    Prev
                  </button>
                </li>

                {/* Dynamic Page Numbers */}
                {pageNumbers.map((page) => (
                  <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link shadow-none"
                      onClick={() => handlePageClick(page)}
                      style={currentPage === page ? paginationActiveStyle : paginationLinkStyle}>
                      {page}
                    </button>
                  </li>
                ))}

                {/* Next Button */}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link d-flex align-items-center gap-2 shadow-none"
                    tabIndex={currentPage === totalPages ? "-1" : "0"}
                    onClick={handleNext}
                    style={{
                      ...paginationLinkStyle,
                      color: currentPage === totalPages ? '#cbd5e1' : '#2563eb',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                    }}>
                    Next
                  </button>
                </li>

              </ul>
            </nav>
          </div>

        </div>
      </div>

      {/* Create Form Modal */}
      {createModal && <CreateUserForm setCreateModal={setCreateModal} createModal={createModal} userId={userId} />}
    </>
  );
}