import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { isMergePanelOpen } from 'redux/reducers/tempControlSlice';
import { IoClose } from 'react-icons/io5';
import { saveMergeData } from 'redux/reducers/boxSlice';
import { MdMergeType } from 'react-icons/md';


const MergeModal = ({ isOpen = true, onClose }) => {
    const dispatch = useDispatch();
    const [step, setStep] = useState(1);
    const [selectedBoxIds, setSelectedBoxIds] = useState(['BX-7829', 'BX-3345']);
    const [masterName, setMasterName] = useState('');

    const boxes = useSelector((state) => state.BoxData.boxes)

    if (!isOpen) return null;

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedBoxIds(boxes.map((b) => b.id));
        } else {
            setSelectedBoxIds([]);
        }
    };

    const handleToggleBox = (id) => {
        setSelectedBoxIds((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        );
    };

    const handleProceedToStep2 = () => {
        if (selectedBoxIds.length === 1) {
            toast.warning('Please select at least two box to merge.');
            return;
        }
        setStep(2);
    };

    const handleFinalSubmit = () => {
        const trimmedMasterName = masterName.trim();

        if (!trimmedMasterName) {
            toast.warning('Please enter a Master Name');
            return;
        }

        const selectedBoxes = boxes.filter((b) => selectedBoxIds.includes(b.id));

        const mergedFields = selectedBoxes.map((box) => ({
            ...box,
            subName: box.subName || box.fieldName,
            masterName: trimmedMasterName,
        }));

        const payload = {
            masterName: trimmedMasterName,
            mergedBoxes: mergedFields,
        };

        dispatch(saveMergeData(payload));
        toast.success('Master record created successfully!');

        setStep(1);
        setMasterName('');
        setSelectedBoxIds([]);
        dispatch(isMergePanelOpen());
        if (onClose) onClose();
    };

    const handleCloseModal = () => {
        dispatch(isMergePanelOpen());
        if (onClose) onClose();
    };

    return (
        <div className="modal fade show d-flex align-items-center justify-content-center" tabIndex="-1" style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', fontFamily: "outfit", backdropFilter: 'blur(1px)', transition: 'all 0.2s ease-in-out', position: 'fixed', inset: 0, zIndex: 1050 }}>

            <div style={{ width: '100%', margin: '0 20px', maxWidth: step === 1 ? '880px' : '480px', transition: 'max-width 0.3s cubic-bezier(0.16, 1, 0.3, 1)', }}>
                <div className="modal-content border-0 position-relative"
                    style={{ borderRadius: '24px', backgroundColor: '#FFFFFF', boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)', }}>

                    <button
                        type="button"
                        onClick={handleCloseModal}
                        className="d-flex justify-content-center align-items-center border-0 position-absolute"
                        style={{ right: '20px', top: '20px', width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#F3F4F6', color: '#9CA3AF', zIndex: 10, transition: 'all 0.15s ease', }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.backgroundColor = '#E5E7EB';
                            e.currentTarget.style.color = '#4B5563';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.backgroundColor = '#F3F4F6';
                            e.currentTarget.style.color = '#9CA3AF';
                        }}>
                        <IoClose size={20} />
                    </button>

                    {/* STEP 1: SELECT BOXES */}
                    {step === 1 && (
                        <>
                            {/* Header */}
                            <div className="px-4 pt-4 pb-4 bg-white" style={{ fontFamily: "outfit", borderRadius: "24px 24px 0 0" }}>
                                <h5 className="modal-title mb-1" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', }}>
                                    Select Boxes to Merge
                                </h5>
                                <p className="mb-0" style={{ fontSize: '0.9rem', color: '#6B7280', lineHeight: '1.5' }}>
                                    Choose the data containers you want to combine into a single unified record.
                                </p>
                            </div>

                            {/* Table Container */}
                            <div className="px-4 pb-2">
                                <div className="table-responsive" style={{ borderRadius: '12px', border: '1px solid #F3F4F6', maxHeight: "400px", overflowY: "auto" }}>
                                    <table className="table align-middle mb-0 text-nowrap">
                                        <thead className="position-sticky top-0" style={{ zIndex: 10 }}>
                                            <tr style={{ backgroundColor: "#F9FAFB", color: "#6B7280", textTransform: "uppercase", letterSpacing: "0.05em", }}>
                                                {/* Checkbox Column */}
                                                <th style={{ width: "48px", borderBottom: "1px solid #E5E7EB", padding: "16px 16px" }}>
                                                    <div className="d-flex align-items-center justify-content-center">
                                                        <input
                                                            type="checkbox"
                                                            className="form-check-input shadow-none m-0"
                                                            style={{ position: "relative", cursor: "pointer", borderRadius: "4px", width: "16px", height: "16px", borderColor: "#D1D5DB", accentColor: "#111827" }}
                                                            checked={selectedBoxIds.length === boxes.length && boxes.length > 0}
                                                            ref={(el) => {
                                                                if (el) { el.indeterminate = selectedBoxIds.length > 0 && selectedBoxIds.length < boxes.length; }
                                                            }}
                                                            onChange={handleSelectAll} />
                                                    </div>
                                                </th>
                                                {/* Headers */}
                                                <th className="py-3 ps-2" style={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px", fontWeight: 600 }}>BOX ID</th>
                                                <th className="py-3" style={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px", fontWeight: 600 }}>CURRENT NAME</th>
                                                <th className="py-3" style={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px", fontWeight: 600 }}>SUB NAME</th>
                                                <th className="py-3" style={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px", fontWeight: 600 }}>FIELD TYPE</th>
                                                <th className="pe-4 py-3" style={{ borderBottom: "1px solid #E5E7EB", fontSize: "12px", fontWeight: 600 }}>GROUP</th>
                                            </tr>
                                        </thead>

                                        <tbody style={{ fontSize: '0.875rem' }}>
                                            {boxes.map((box) => {
                                                const isSelected = selectedBoxIds.includes(box.id);
                                                return (
                                                    <tr
                                                        key={box.id}
                                                        onMouseEnter={(e) => { if (!isSelected) { e.currentTarget.style.backgroundColor = '#F4F6FF'; } }}
                                                        onMouseLeave={(e) => { if (!isSelected) { e.currentTarget.style.backgroundColor = '#FFFFFF'; } }}
                                                        onClick={() => handleToggleBox(box.id)}
                                                        style={{ cursor: 'pointer', backgroundColor: isSelected ? '#F4F6FF' : '#FFFFFF', transition: 'all 0.15s ease-in-out', }}                                                    >
                                                        {/* Checkbox Cell */}
                                                        <td className="py-3 border-bottom" style={{ borderColor: '#F3F4F6' }} onClick={(e) => e.stopPropagation()}>
                                                            <div className="d-flex align-items-center justify-content-center">
                                                                <input
                                                                    type="checkbox"
                                                                    className="form-check-input shadow-none m-0"
                                                                    style={{ position: "relative", cursor: 'pointer', borderRadius: '4px', width: '16px', height: '16px', borderColor: isSelected ? '#111827' : '#D1D5DB', accentColor: '#111827' }}
                                                                    checked={isSelected}
                                                                    onChange={() => handleToggleBox(box.id)}
                                                                />
                                                            </div>
                                                        </td>

                                                        {/* Box ID  */}
                                                        <td className="py-3 ps-2 border-bottom" style={{ borderColor: '#F3F4F6', color: '#4B5563', fontWeight: 500 }}>
                                                            {box.id.length > 10 ? box.id.substring(0, 10) + "..." : box.id}
                                                        </td>

                                                        {/* Current Name  */}
                                                        <td className="py-3 border-bottom" style={{ fontWeight: 500, color: '#111827', borderColor: '#F3F4F6' }}>
                                                            {box.fieldName}
                                                        </td>

                                                        {/* Sub Name */}
                                                        <td className="py-3 border-bottom" style={{ fontWeight: 500, color: '#6B7280', borderColor: '#F3F4F6' }}>
                                                            {box.subName || '—'}
                                                        </td>

                                                        {/* Field Type Badge */}
                                                        <td className="py-3 border-bottom" style={{ borderColor: '#F3F4F6', letterSpacing:"0.03em" }}>
                                                            <span style={{
                                                                fontSize: '0.75rem', fontWeight: 600,
                                                                color: box.fieldType?.includes('Form') ? '#CA8A04' : '#9333EA',
                                                                backgroundColor: box.fieldType?.includes('Form') ? '#FEF9C3' : '#F3E8FF',
                                                                padding: '4px 12px', borderRadius: '6px', display: 'inline-block',
                                                            }}>
                                                                {box.fieldType}
                                                            </span>
                                                        </td>

                                                        {/* Group / Is Merged */}
                                                        <td className="pe-4 py-3 border-bottom" style={{ color: '#9CA3AF', fontSize: '0.85rem', fontWeight: 500, borderColor: '#F3F4F6', letterSpacing:"1px" }}>
                                                            {box?.isMerged ? <span className='px-2 py-1 rounded-lg bg-success text-white'>Yes</span> : <span className='px-2 py-1 rounded-lg bg-dark text-white'>No</span>}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-4 bg-white d-flex justify-content-between align-items-center" style={{ borderRadius: "0 0 24px 24px" }}>
                                <div style={{ backgroundColor: '#EEF2FF', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.875rem', color: '#6B7280', fontWeight: 500 }}>
                                    <strong style={{ color: '#3B82F6', fontWeight: 700 }}>{selectedBoxIds.length}</strong> of {boxes.length} selected
                                </div>

                                <button type="button" onClick={handleProceedToStep2} className="btn px-4 py-2 border-0"
                                    style={{ fontSize: '0.9rem', fontWeight: 500, borderRadius: '8px', backgroundColor: '#3B82F6', color: '#FFFFFF', transition: 'all 0.15s ease', }}>
                                    Merge Selected
                                </button>
                            </div>
                        </>
                    )}

                    {/* STEP 2: CREATE MASTER RECORD */}
                    {step === 2 && (
                        <div className="px-4 py-4 bg-white position-relative" style={{ borderRadius: '24px' }}>
                            <div className="d-flex align-items-center justify-content-center mb-4"
                                style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: '#EEF2FF', color: '#4F46E5', }} >
                                <MdMergeType size={30} />
                            </div>

                            <h4 className="mb-2" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#111827', letterSpacing: '-0.01em', }}>
                                Create Group Record
                            </h4>
                            <p className="mb-4" style={{ fontSize: '0.95rem', color: '#6B7280', lineHeight: '1.2' }}>
                                Provide a canonical name for the new entity to establish a single source of truth across all related workflows.
                            </p>

                            {/* Master Name Input */}
                            <div className="mb-4">
                                <label className="form-label mb-2" style={{ fontSize: '0.875rem', fontWeight: 600, color: '#111827' }}>
                                    Master/Group Name <span style={{ color: '#EF4444' }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    className="form-control px-3 py-2 shadow-none"
                                    style={{ borderRadius: '8px', borderColor: '#D1D5DB', fontSize: '0.95rem', color: '#111827', transition: 'border-color 0.15s ease', padding: '12px' }}
                                    placeholder="e.g., Global Data Systems Inc."
                                    value={masterName}
                                    onChange={(e) => setMasterName(e.target.value)}
                                    onFocus={(e) => e.target.style.borderColor = '#3B82F6'}
                                    onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                                    autoFocus
                                />
                            </div>

                            {/* Action Footer */}
                            <div className="d-flex justify-content-end gap-3 mt-4 pt-2">
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="btn border-0 px-4 py-2"
                                    style={{ fontSize: '0.9rem', fontWeight: 500, borderRadius: '8px', color: '#374151', backgroundColor: '#F3F4F6', transition: 'all 0.15s ease' }}>
                                    Back
                                </button>
                                <button
                                    type="button"
                                    onClick={handleFinalSubmit}
                                    className="btn px-4 py-2 border-0"
                                    style={{ fontSize: '0.9rem', fontWeight: 500, borderRadius: '8px', backgroundColor: '#3B82F6', color: '#FFFFFF', transition: 'all 0.15s ease', }}>
                                    Save Group Record
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MergeModal;