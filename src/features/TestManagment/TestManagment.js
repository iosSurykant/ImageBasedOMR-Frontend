import React, { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { FaSearch } from 'react-icons/fa';
import CreateTestModal from './CreateTestModal';
import UploadFileModal from './UploadFileModal';
import { fetchTemplates } from 'redux/reducers/templateSlice';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTestList } from 'redux/reducers/testSlice';
import { HiOutlineDotsVertical } from 'react-icons/hi';
import { RiDeleteBin6Line } from "react-icons/ri";
import { deleteTest } from 'helper/TemplateHelper';
import { toast } from 'react-toastify';
import { FiEdit2 } from 'react-icons/fi';
import Pagination from 'common/Pagination';
import { useNavigate } from 'react-router-dom';

const TestManagementList = () => {
    const [formData, setFormData] = useState({
        template: '',
        testName: '',
        notes: '',
        testId: ''
    });

    const dispatch = useDispatch();
    const navigate = useNavigate()

    const { list: templates } = useSelector((state) => state.templates);
    const { list: testList, loading } = useSelector((state) => state.tests);

    const [createModal, setCreateModal] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [uploadRowData, setUploadRowData] = useState(null);
    const [threeDotModal, setThreeDotModal] = useState(null);
    const [menuCoords, setMenuCoords] = useState(null);

    // Separate active search input from debounced query
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    const [edit, setEdit] = useState(false);
    const [page, setPage] = useState(1);

    const ignorePageChangeRef = useRef(false);
    const setIgnorePageChange = useCallback(() => {
        ignorePageChangeRef.current = true;
        setTimeout(() => {
            ignorePageChangeRef.current = false;
        }, 100);
    }, []);

    const range = 7;
    const totalCount = testList?.count || 0;
    const totalPages = Math.ceil(totalCount / range) || 1;

    const records = Array.isArray(testList?.record) ? testList.record : [];

    const getMatchingTemplate = (row) => {
        const targetId = row?.templateId || row?.TemplateId;
        if (!targetId) return null;
        return templates?.find((template) => Number(template.id) === Number(targetId));
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    // --- Smart Auto-Flip Positioning
    const handleDotClick = (e, rowData) => {
        e.stopPropagation();

        const testId = rowData.testId || rowData.TestId || '';
        const currentId = testId;

        if (threeDotModal?.testId === currentId) {
            setThreeDotModal(null);
            setMenuCoords(null);
        } else {
            const rect = e.currentTarget.getBoundingClientRect();
            const menuWidth = 170;
            const menuHeight = 55;
            const spaceBelow = window.innerHeight - rect.bottom;

            const opensAbove = spaceBelow < menuHeight;

            setMenuCoords({
                top: opensAbove
                    ? rect.top + window.scrollY - menuHeight - 4
                    : rect.bottom + window.scrollY + 4,
                left: rect.right + window.scrollX - menuWidth
            });

            setThreeDotModal({
                ...rowData,
                testId: testId
            });
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 400);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    useEffect(() => {
        if (ignorePageChangeRef.current) {
            ignorePageChangeRef.current = false;
            return;
        }

        dispatch(fetchTestList({ search: debouncedSearch, page: page, range: range }));
    }, [debouncedSearch, page, dispatch]);

    useEffect(() => {
        dispatch(fetchTemplates());
    }, [dispatch]);

    useEffect(() => {
        const handleCloseMenu = () => { setThreeDotModal(null); setMenuCoords(null); };
        window.addEventListener('click', handleCloseMenu);
        window.addEventListener('scroll', handleCloseMenu, true);
        return () => {
            window.removeEventListener('click', handleCloseMenu);
            window.removeEventListener('scroll', handleCloseMenu, true);
        };
    }, []);

    const deleteTestHandler = async (testId) => {
        const isConfirmed = window.confirm(`Are you sure you want to delete test ID: ${testId}?`);

        if (isConfirmed) {
            try {
                const res = await deleteTest(testId);

                if (res.status === 200) {
                    toast.success(res.message);

                    if (page === 1) {
                        dispatch(fetchTestList({ search: debouncedSearch, page: 1, range }));
                    } else {
                        setPage(1);
                    }
                }
            } catch (error) {
                toast.error(error);
            }

            setThreeDotModal(null);
            setMenuCoords(null);
        }
    };

    const editTestHandler = (rowData) => {
        setFormData({
            template: rowData.templateId || rowData.TemplateId || rowData.template || '',
            testName: rowData.testName || '',
            notes: rowData.notes || '',
            testId: rowData.testId || rowData.TestId || ''
        });

        setEdit(true);
        setCreateModal(true);
        setThreeDotModal(null);
        setMenuCoords(null);
    };


    const handleNaviage = (rowData) => {
        navigate(`/app/omr-dashboard?tstId=${rowData?.testId}&tstName=${rowData?.testName}&tId=${rowData?.templateId}&timgs=${rowData.totalImages}`);
    };


    // --- Style Objects ---
    const containerStyle = { backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #eff2f5', fontFamily: 'Inter, "Outfit", sans-serif', padding: '24px', boxShadow: '0px 0px 20px 0px rgba(76, 87, 125, 0.02)' };
    const headerTitleStyle = { fontSize: '1.25rem', fontWeight: '700', color: '#000000', margin: 0 };
    const btnCreateStyle = { fontSize: "14px", background: "linear-gradient(to left, #3969FE, #1047D5)", letterSpacing: "0.5px", border: 'none', color: '#ffffff', fontWeight: '500', borderRadius: '6px', padding: '8px 18px', cursor: 'pointer', whiteSpace: 'nowrap' };
    const tableWrapperStyle = { overflowX: 'auto', marginTop: '16px' };
    const tableStyle = { tableLayout: 'fixed', width: '100%', minWidth: '850px' };

    const thStyle = { backgroundColor: '#f4f6f9', color: '#464e5f', fontWeight: '600', textTransform: 'capitalize', borderTop: 'none', borderBottom: 'none', padding: '12px 12px', fontSize: '13px' };
    const tdStyle = { verticalAlign: 'middle', borderTop: '1px dashed #f0f2f8', padding: '14px 12px', fontSize: "14px" };

    const textIdStyle = { color: '#646c9a', fontSize: "13px" };
    const textDarkStyle = { color: '#3f4254', fontWeight: '500' };
    const textCodeStyle = { color: '#70779b', fontSize: '12px', marginTop: '2px' };
    const textNoteStyle = { color: '#5e6278' };

    // Status badges
    const badgeBaseStyle = { padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: '500', display: 'inline-block', minWidth: '70px', textAlign: 'center', letterSpacing: "0.5px" };
    const badgeActiveStyle = { ...badgeBaseStyle, backgroundColor: '#d5f5e3', color: '#11a355' };
    const badgeInactiveStyle = { ...badgeBaseStyle, backgroundColor: '#f3f6f9', color: '#7e8299' };

    // Action buttons
    const btnScanStyle = { border: '1px solid #2d62ed', color: '#2d62ed', backgroundColor: 'transparent', fontWeight: '500', borderRadius: '4px', padding: '5px 14px', fontSize: '13px', cursor: 'pointer', minWidth: '72px' };
    const btnUploadStyle = { border: '1px solid #00c58e', color: '#00c58e', backgroundColor: 'transparent', fontWeight: '500', borderRadius: '4px', padding: '5px 14px', fontSize: '13px', cursor: 'pointer', minWidth: '72px' };

    // Tablet view STYLE
    const cardStyle = { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', marginBottom: '16px' };
    const cardHeaderStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' };
    const cardTitleStyle = { fontSize: '1.1rem', fontWeight: '700', color: '#1e293b', margin: 0 };
    const cardLabelStyle = { color: '#64748b', fontSize: '14px', marginBottom: '4px', fontWeight: '500' };
    const cardValueStyle = { color: '#475569', fontSize: '15px', marginLeft: "5px" };
    const cardValueDarkStyle = { color: '#334155', fontSize: '16px', fontWeight: '500', marginLeft: "5px" };
    const cardFooterStyle = { display: 'flex', alignItems: 'center', marginTop: '20px', justifyContent: "space-between", marginRight: "10px" };
    const btnScanCardStyle = { border: '2px solid #2563eb', color: '#2563eb', backgroundColor: '#ffffff', fontWeight: '500', borderRadius: '4px', padding: '6px 20px', fontSize: '14px', cursor: 'pointer' };
    const buttonBaseStyle = { width: '100%', padding: '10px 16px', backgroundColor: 'transparent', border: 'none', fontSize: '15px', fontWeight: 500, textAlign: 'left', cursor: 'pointer', transition: 'background-color 0.15s ease-in-out', display: 'flex', alignItems: 'center', outline: 'none', gap: "14px" };

    const isStatusActive = (status) => {
        return status === true || status === 'true' || status === 'Active' || status === 'A' || status === 'a' || status === 'Y' || status === 'y';
    };

    const activeDataPage = testList?.page ?? page;

    return (
        <>
            <style>
                {`
                    @keyframes modalEnter {
                        from { opacity: 0; transform: scale(0.92) translateY(20px); }
                        to   { opacity: 1; transform: scale(1) translateY(0); }
                    }

                    @keyframes modalExit {
                        from { opacity: 1; transform: scale(1) translateY(0); }
                        to   { opacity: 0; transform: scale(0.92) translateY(-20px); }
                    }

                    .modal-enter { animation: modalEnter 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    .modal-exit  { animation: modalExit 0.5s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                `}
            </style>

            <div className="container-fluid" style={containerStyle}>
                {/* Header Section */}
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                    <h3 style={headerTitleStyle}>All Test</h3>
                    <div className="d-flex align-items-center">
                        <div className="mr-3" style={{ position: "relative", width: "230px" }}>
                            <FaSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#a0aec0", fontSize: "14px" }} />
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search Test Name / Test id"
                                value={searchTerm}
                                onChange={handleSearchChange}
                                style={{ borderRadius: "6px", borderColor: "#e2e8f0", paddingLeft: "35px", fontSize: "14px", height: "38px", color: "#4a5568" }}
                            />
                        </div>
                        <button onClick={() => { setEdit(false); setFormData({ template: '', testName: '', notes: '', testId: '' }); setCreateModal(true); }}
                            style={btnCreateStyle}>
                            Create TEST
                        </button>
                    </div>
                </div>

                {/* Desktop Table Section */}
                <div className="d-none d-lg-block" style={tableWrapperStyle}>
                    <table className="table mb-0" style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={{ ...thStyle, width: '4%', paddingLeft: '16px' }}>Sr</th>
                                <th style={{ ...thStyle, width: '14%' }}>TEST Id</th>
                                <th style={{ ...thStyle, width: '22%' }}>TEST Name</th>
                                <th style={{ ...thStyle, width: '20%' }}>Template</th>
                                <th style={{ ...thStyle, width: '16%' }}>Note</th>
                                <th className="text-center" style={{ ...thStyle, width: '12%' }}>Status</th>
                                <th className="text-center" style={{ ...thStyle, width: '16%' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-4">
                                        Loading...
                                    </td>
                                </tr>
                            ) : records.length > 0 ? (
                                records.map((row, index) => {
                                    const rowKey = row.testId || index;
                                    const matchingTemplate = getMatchingTemplate(row);
                                    const isActive = isStatusActive(row.status);
                                    const srNumber = (activeDataPage - 1) * range + index + 1;

                                    return (
                                        <tr key={rowKey}>
                                            <td style={{ ...tdStyle, ...textIdStyle, paddingLeft: '16px' }}>
                                                {srNumber}
                                            </td>
                                            <td style={{ ...tdStyle, ...textIdStyle, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.testId || row.TestId || ''}>
                                                {row.testId || row.TestId || ''}
                                            </td>
                                            <td style={{ ...tdStyle, ...textDarkStyle, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={row.testName}>
                                                {row.testName}
                                            </td>
                                            <td style={tdStyle}>
                                                <div style={{ ...textDarkStyle, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={matchingTemplate?.fileName}>
                                                    {matchingTemplate?.fileName || 'NA'}
                                                </div>
                                                <div style={textCodeStyle}>
                                                    Code: {matchingTemplate?.id || 'NA'}
                                                </div>
                                            </td>
                                            <td
                                                style={{ ...tdStyle, ...textNoteStyle, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
                                                title={row.notes}>
                                                {row.notes}
                                            </td>
                                            <td className="text-center" style={tdStyle}>
                                                <span style={isActive ? badgeActiveStyle : badgeInactiveStyle}>
                                                    {isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="text-center" style={{ ...tdStyle, paddingRight: '16px' }}>
                                                <div className="d-flex justify-content-center align-items-center" style={{ whiteSpace: 'nowrap' }}>
                                                    {isActive ? (
                                                        <button style={btnScanStyle} onClick={() => handleNaviage(row)}>Scan</button>
                                                    ) : (
                                                        <button
                                                            style={btnUploadStyle}
                                                            onClick={() => {
                                                                setFormData(prev => ({ ...prev, testName: row.testName, testId: row.testId || row.TestId || '' }));
                                                                setUploadRowData(row);
                                                                setUploadModal(true);
                                                            }}
                                                        >
                                                            Upload
                                                        </button>
                                                    )}

                                                    <HiOutlineDotsVertical
                                                        size={22}
                                                        style={{ cursor: "pointer", marginLeft: '12px' }}
                                                        onClick={(e) => handleDotClick(e, row)}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center py-4" style={{ color: '#a0aec0', fontSize: '14px' }}>
                                        No matching test or template found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Tablet Card View */}
                <div className="d-block d-lg-none mt-3">
                    {loading ? (
                        <div className="text-center py-4">
                            Loading...
                        </div>
                    ) : records.length > 0 ? (
                        records.map((row, index) => {
                            const rowKey = row.testId || index;
                            const matchingTemplate = getMatchingTemplate(row);
                            const isActive = isStatusActive(row.status);
                            const srNumber = (activeDataPage - 1) * range + index + 1;

                            return (
                                <div key={rowKey} style={cardStyle}>
                                    <div style={cardHeaderStyle}>
                                        <h4 style={cardTitleStyle}>
                                            <span style={{ fontSize: '13px', color: '#94a3b8', marginRight: '8px' }}>#{srNumber}</span>
                                            {row.testName}
                                        </h4>
                                        <span style={isActive ? badgeActiveStyle : badgeInactiveStyle}>
                                            {isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'baseline' }}>
                                        <span style={{ color: '#64748b', fontSize: '14px', marginRight: '6px' }}>TEST Id:</span>
                                        <span style={{ color: '#64748b', fontSize: '14px' }}>{row.testId || row.TestId || ''}</span>
                                    </div>

                                    <div style={cardLabelStyle}>
                                        Template:
                                        <span style={cardValueDarkStyle}>
                                            {matchingTemplate?.fileName || '__'}
                                        </span>
                                    </div>
                                    <div style={{ color: '#64748b', fontSize: '14px' }}>
                                        Code:
                                        <span className='pl-1'>
                                            {matchingTemplate?.id || '__'}
                                        </span>
                                    </div>

                                    <div style={cardLabelStyle}>Note:<span style={cardValueStyle}>{row.notes || '__'}</span></div>

                                    <div style={cardFooterStyle}>
                                        {isActive ? (
                                            <button style={btnScanCardStyle} onClick={() => handleNaviage(row)} >Scan</button>
                                        ) : (
                                            <button
                                                style={btnScanCardStyle}
                                                onClick={() => {
                                                    setFormData(prev => ({ ...prev, testName: row.testName, testId: row.testId || row.TestId || '' }));
                                                    setUploadRowData(row);
                                                    setUploadModal(true);
                                                }}
                                            >
                                                Upload
                                            </button>
                                        )}

                                        <span>
                                            <HiOutlineDotsVertical
                                                style={{ cursor: "pointer", fontSize: "18px" }}
                                                onClick={(e) => handleDotClick(e, row)}
                                            />
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="text-center py-4" style={{ color: '#a0aec0', fontSize: '14px' }}>
                            No matching test or template found.
                        </div>
                    )}
                </div>

                {/* Pagination Section */}
                <Pagination
                    totalPages={totalPages}
                    totalItems={range}
                    currentPage={page}
                    onPageChange={(page) => setPage(page)}
                />

            </div>


            {/* Create test Modal */}
            {createModal && (
                <CreateTestModal
                    setCreateModal={setCreateModal}
                    setUploadModal={setUploadModal}
                    formData={formData}
                    setFormData={setFormData}
                    templates={templates}
                    edit={edit}
                    setEdit={setEdit}
                    searchTerm={debouncedSearch}
                    range={range}
                    setPage={setPage}
                    setIgnorePageChange={setIgnorePageChange}
                />
            )}

            {/* UPLOAD FILE modal */}
            {uploadModal && <UploadFileModal setUploadModal={setUploadModal} rowData={uploadRowData} testName={formData.testName} testId={formData.testId} />}

            {/* Global Portal Dropdown Menu */}
            {threeDotModal && menuCoords && createPortal(
                <div
                    className="card shadow-sm"
                    style={{ width: '170px', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '4px 0', backgroundColor: '#ffffff', position: 'absolute', top: `${menuCoords.top}px`, left: `${menuCoords.left}px`, zIndex: 9999 }}
                    onClick={(e) => e.stopPropagation()}>
                    <button
                        type="button"
                        style={{ ...buttonBaseStyle, color: 'black' }}
                        onClick={() => editTestHandler(threeDotModal)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <FiEdit2 />
                        <span>Edit</span>
                    </button>
                    <button
                        type="button"
                        style={{ ...buttonBaseStyle, color: '#dc3545' }}
                        onClick={() => deleteTestHandler(threeDotModal.testId)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                        <RiDeleteBin6Line />
                        <span>Delete</span>
                    </button>
                </div>,
                document.body
            )}
        </>
    );
};

export default TestManagementList;