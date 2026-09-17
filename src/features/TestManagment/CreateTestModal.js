import React, { useState } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import { RxCross2 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { updateTest } from 'helper/TemplateHelper';
import { fetchTemplates } from 'redux/reducers/templateSlice';
import { createTestAsync, fetchTestList } from 'redux/reducers/testSlice';

const CreateTestModal = ({ setCreateModal, setUploadModal, formData, setFormData, templates, edit, setEdit, searchTerm, range, setPage, setIgnorePageChange }) => {
    const [openArrow, setOpenArrow] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const dispatch = useDispatch();

    const isEditMode = Boolean(edit);

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.empid;

    // --- Animation & Transition Handlers ---
    const handleClose = () => {
        setIsExiting(true);
        setFormData({ template: '', testName: '', notes: '', testId: '' });
        if (setEdit) setEdit(false);
        setTimeout(() => {
            setCreateModal(false);
        }, 400);
    };

    const handleCreateAndUpload = (e) => {
        if (e) e.preventDefault();
        setIsExiting(true);

        setTimeout(() => {
            setUploadModal(true);
        }, 80);

        setTimeout(() => {
            setCreateModal(false);
        }, 580);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => {
            const updatedData = { ...prev, [name]: value };

            // Auto-generate testId ONLY during creation mode
            if (name === 'testName' && !isEditMode) {
                const d = new Date();

                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');

                const hour = String(d.getHours()).padStart(2, '0');
                const minute = String(d.getMinutes()).padStart(2, '0');
                const second = String(d.getSeconds()).padStart(2, '0');
                const millisecond = String(d.getMilliseconds()).padStart(3, '0');

                const formattedDate = `${day}${month}`;
                const formattedTime = `${hour}${minute}${second}${millisecond}`;

                const safeUserId = userId || 'USER';

                updatedData.testId = `${safeUserId}/${formattedDate}${formattedTime}`;
            }
            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isEditMode) {
            // --- EDIT / UPDATE FLOW ---
            try {
                const res = await updateTest(formData);
                if (res?.status === 200 || res?.status === 201) {
                    toast.success(res?.data?.message || "Updated Successfully");
                    dispatch(fetchTestList({ search: searchTerm, page: 1, range: range }));
                    setIgnorePageChange();
                    setPage(1);
                    handleClose();
                } else {
                    toast.error(res?.message || "Failed to update test");
                }
            } catch (error) {
                console.error("Error updating test:", error);
                toast.error(error?.message || "Error updating test");
            }
        } else {
            // --- CREATE FLOW ---
            try {
                await dispatch(createTestAsync(formData)).unwrap();
                toast.success("Test Created Successfully");
                dispatch(fetchTemplates());
                dispatch(fetchTestList({ search: searchTerm, page: 1, range: range }));
                setIgnorePageChange();
                setPage(1);
                handleCreateAndUpload(e);
            } catch (error) {
                console.error("Error creating test:", error);
                toast.error(error?.message || "Error creating test");
            }
        }
    };

    // --- Inline Style Definitions ---
    const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 9999, fontFamily: '"Outfit", sans-serif' };
    const containerStyle = { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #eff2f5', maxWidth: '400px', boxShadow: '0px 0px 20px 0px rgba(76, 87, 125, 0.08)', padding: '25px' };
    const headerTitleStyle = { fontSize: '1.25rem', fontWeight: '600', color: '#000000', margin: 0, letterSpacing: "0.5px" };
    const labelStyle = { fontSize: '14px', fontWeight: '600', color: '#3f4254', marginBottom: '8px', display: 'block' };
    const inputStyle = { borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#3f4254', padding: '12px 16px', width: '100%', backgroundColor: '#ffffff', outline: 'none' };
    const autoGenInputStyle = { ...inputStyle, backgroundColor: '#f4f6f9', color: '#646c9a', border: '1px solid #eff2f5' };
    const textNoteStyle = { color: '#5e6278', fontSize: '14px' };
    const btnCancelStyle = { fontSize: '14px', backgroundColor: '#f3f6f9', border: 'none', color: '#737373', fontWeight: '500', borderRadius: '6px', padding: '10px 20px', cursor: 'pointer' };
    const btnCreateStyle = { fontSize: '14px', letterSpacing: '0.5px', border: 'none', color: '#ffffff', fontWeight: '500', borderRadius: '6px', padding: '10px 24px', cursor: 'pointer', background: 'linear-gradient(to left, #3969FE, #1047D5)' };

    return (
        <div className="d-flex align-items-center justify-content-center p-3" style={overlayStyle}>
            <style>
                {`
                    @keyframes modalEnterSlow {
                        0% { opacity: 0; transform: scale(0.92) translateY(20px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }
                    @keyframes modalExitSlow {
                        0% { opacity: 1; transform: scale(1) translateY(0); }
                        100% { opacity: 0; transform: scale(0.92) translateY(-20px); }
                    }
                    .modal-anim-enter { animation: modalEnterSlow 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
                    .modal-anim-exit { animation: modalExitSlow 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
                `}
            </style>

            <div className={`w-100 ${isExiting ? 'modal-anim-exit' : 'modal-anim-enter'}`} style={containerStyle}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h4 style={headerTitleStyle}>{isEditMode ? "Update Test" : "Create New TEST"}</h4>
                        <p className="mb-0 mt-1" style={textNoteStyle}>
                            Change the details to {isEditMode ? "Update Test" : "Create a New TEST"}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="py-1 flex justify-center items-center"
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFE0E0")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        style={{ border: "none", borderRadius: "5px", backgroundColor: "transparent", transition: "background-color 0.3s ease-in-out" }}
                    >
                        <RxCross2 size={18} color="#FA1313" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
                    {/* Template Select */}
                    <div className="form-group mb-3 position-relative">
                        <label style={labelStyle}>
                            Template <span style={{ color: '#f64e60' }}>*</span>
                        </label>
                        <select
                            name="template"
                            value={formData.template}
                            onChange={(e) => { handleChange(e); setOpenArrow(false); }}
                            onClick={() => setOpenArrow(!openArrow)}
                            onBlur={() => setOpenArrow(false)}
                            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                            required
                        >
                            <option value="" disabled hidden>Select Template</option>
                            {templates?.map((t) => (
                                <option key={t.id} value={t.id}>{t.fileName}</option>
                            ))}
                        </select>
                        <BsChevronDown
                            size={16}
                            color="#646c9a"
                            style={{ position: 'absolute', right: '16px', bottom: '14px', transform: `rotate(${openArrow ? '180deg' : '0deg'})`, transition: '0.3s ease', pointerEvents: 'none' }}
                        />
                    </div>

                    {/* Test Name Input */}
                    <div className="form-group mb-3">
                        <label style={labelStyle}>
                            Test Name <span style={{ color: '#f64e60' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="testName"
                            value={formData.testName}
                            placeholder="Enter test name"
                            onChange={handleChange}
                            style={inputStyle}
                            required
                        />
                    </div>

                    {/* Test ID (Read Only / Auto-generated) */}
                    <div className="form-group mb-3">
                        <label style={labelStyle}>
                            Test Id {isEditMode ? '' : '(Auto Generated)'}
                        </label>
                        <input
                            type="text"
                            name="testId"
                            value={formData.testId}
                            readOnly
                            style={autoGenInputStyle}
                        />
                    </div>

                    {/* Notes Input */}
                    <div className="form-group mb-4">
                        <label style={labelStyle}>
                            Notes (Optional)
                        </label>
                        <textarea
                            name="notes"
                            rows="4"
                            value={formData.notes}
                            maxLength={60}
                            placeholder="Enter notes about this test..."
                            onChange={handleChange}
                            style={{ ...inputStyle, resize: 'none' }}
                        ></textarea>
                        <div style={{ textAlign: 'right', fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                            {(formData.notes || '').length}/60
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end align-items-center pt-2">
                        <button
                            type="button"
                            className="mr-3"
                            style={btnCancelStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D3D8DE")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#F3F6F9")}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={btnCreateStyle}
                        >
                            {isEditMode ? "Update TEST" : "Create TEST"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTestModal;