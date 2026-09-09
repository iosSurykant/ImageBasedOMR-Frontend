import React, { useState } from 'react';
import { BsChevronDown } from 'react-icons/bs';
import { RxCross2 } from 'react-icons/rx';
import { useDispatch } from 'react-redux';
import { fetchTemplates } from 'redux/reducers/templateSlice';
import { createTestAsync, fetchTestList } from 'redux/reducers/testSlice';

const CreateTestModal = ({ setCreateModal, setUploadModal, formData, setFormData, templates }) => {
    const [openArrow, setOpenArrow] = useState(false);
    const [isExiting, setIsExiting] = useState(false);
    const dispatch = useDispatch();

    const userData = JSON.parse(localStorage.getItem("userData"));
    const userId = userData?.empid;

    // --- Animation & Transition
    const handleClose = () => {
        setIsExiting(true);
        setFormData({ template: '', testName: '', notes: '', testId: '' })
        setTimeout(() => {
            setCreateModal(false);
        }, 400);
    };

    const handleCreateAndUpload = (e) => {
        e.preventDefault();
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

            if (name === 'testName') {
                const d = new Date();
                const day = String(d.getDate()).padStart(2, '0');
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const year = d.getFullYear();
                const formattedDate = `${day}${month}${year}`;
                const sanitizedName = value.replace(/\s+/g, '').toUpperCase();
                // Limit test name to max 7 characters for test ID
                const limitedSanitizedName = sanitizedName.substring(0, 7);

                const safeUserId = userId || 'USER';
                updatedData.testId = `${safeUserId}/${formattedDate}/${limitedSanitizedName}`;
            }
            return updatedData;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await dispatch(createTestAsync(formData)).unwrap();
            dispatch(fetchTemplates());
            dispatch(fetchTestList());
        } catch (error) {
            console.error("Error creating test:", error);
        }
        handleCreateAndUpload(e);
    };



    // Inline Style Definitions
    const overlayStyle = { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 9999, fontFamily: '"Outfit",' };
    const containerStyle = { backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #eff2f5', maxWidth: '400px', boxShadow: '0px 0px 20px 0px rgba(76, 87, 125, 0.08)', padding: '25px' };
    const headerTitleStyle = { fontSize: '1.25rem', fontWeight: '600', color: '#000000', margin: 0, letterSpacing:"0.5px" };
    const labelStyle = { fontSize: '14px', fontWeight: '600', color: '#3f4254', marginBottom: '8px', display: 'block' };
    const inputStyle = { borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px', color: '#3f4254', padding: '12px 16px', width: '100%', backgroundColor: '#ffffff', outline: 'none' };
    const autoGenInputStyle = { ...inputStyle, backgroundColor: '#f4f6f9', color: '#646c9a', border: '1px solid #eff2f5' };
    const textNoteStyle = { color: '#5e6278', fontSize: '14px' };
    const btnCancelStyle = { fontSize: '14px', backgroundColor: '#f3f6f9', border: 'none', color: '#737373', fontWeight: '500', borderRadius: '6px', padding: '10px 20px', cursor: 'pointer' };
    const btnCreateStyle = { fontSize: '14px', letterSpacing: '0.5px', border: 'none', color: '#ffffff', fontWeight: '500', borderRadius: '6px', padding: '10px 24px', cursor: 'pointer', background: 'linear-gradient(to left, #3969FE, #1047D5)' };

    return (
        <div
            className="d-flex align-items-center justify-content-center p-3"
            style={overlayStyle}>
            <style>
                {`
                    @keyframes modalEnterSlow {
                        0% {
                            opacity: 0;
                            transform: scale(0.92) translateY(20px);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }

                    @keyframes modalExitSlow {
                        0% {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                        100% {
                            opacity: 0;
                            transform: scale(0.92) translateY(-20px);
                        }
                    }

                    .modal-anim-enter {
                        animation: modalEnterSlow 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    }

                    .modal-anim-exit {
                        animation: modalExitSlow 0.25s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    }
                `}
            </style>

            <div
                className={`w-100 ${isExiting ? 'modal-anim-exit' : 'modal-anim-enter'}`}
                style={containerStyle}>
                {/* Header */}
                <div className="d-flex justify-content-between align-items-start mb-4">
                    <div>
                        <h4 style={headerTitleStyle}>Create New TEST</h4>
                        <p className="mb-0 mt-1" style={textNoteStyle}>Fill the details to create a new test.</p>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className='py-1 flex justify-center items-center'
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#FFE0E0")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                        style={{ border: "none", borderRadius: "5px", backgroundColor: "transparent", transition: "background-color 0.3s ease-in-out" }}>
                        <RxCross2 size={18} color='#FA1313' />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit}>
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
                            className='ouline-primary'
                        >
                            <option value="" disabled hidden>Select Template</option>
                            {templates?.map(t => <option key={t.id} value={t.id}>{t.fileName}</option>)}
                        </select>

                        <BsChevronDown size={16} color="#646c9a"
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

                    {/* Test ID (Auto Generated) */}
                    <div className="form-group mb-3">
                        <label style={labelStyle}>
                            Test Id (Auto Generated)
                        </label>
                        <div className="position-relative d-flex align-items-center">
                            <input
                                type="text"
                                name="testId"
                                value={formData.testId}
                                readOnly
                                style={autoGenInputStyle}
                            />
                        </div>
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
                            {formData.notes.length}/60
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="d-flex justify-content-end align-items-center pt-2">
                        <button
                            type="button"
                            className="mr-3"
                            style={btnCancelStyle}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D3D8DE")}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#DFE1E6")}
                            onClick={handleClose}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            style={btnCreateStyle}
                        >
                            Create TEST
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTestModal;