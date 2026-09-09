import React, { useState, useRef } from 'react';
import { IoMdClose } from 'react-icons/io';
import { FiUploadCloud } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { addTemplate } from 'redux/reducers/templateSlice';
import { toast } from 'react-toastify';
import { fetchTemplates } from 'redux/reducers/templateSlice';
import { useNavigate } from 'react-router-dom';

const CreateTemplateModal = ({ isOpen, onClose }) => {
    const dispatch = useDispatch();
    const fileInputRef = useRef(null);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        file: null
    });

    if (!isOpen) return null;
    const userData = JSON.parse(localStorage.getItem("userData"));
    const empId = userData?.empid;

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData(prev => ({ ...prev, file: e.target.files[0] }));
            toast.success("File Uploaded successfully")
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();

        if (!empId || !formData.name || !formData.file) {
            toast.warning("Please fill all the fields")
            return;
        }
        const res = await dispatch(addTemplate({
            templateName: formData.name,
            description: formData.description,
            image: formData.file,
            empId: empId
        }));
        if (addTemplate.fulfilled.match(res)) {
            const id = res.payload.data[0].id;
            dispatch(fetchTemplates()); 
            toast.success("Template added successfully");
            onClose();
            setFormData({
                name: "",
                description: "",
                file: null
            });
         navigate(`/app/template/create-template/${id}`);
    } else {
        toast.error("Failed to add template");
}
    };

// Custom CSS
const styles = {
    backdrop: {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    modalCard: {
        backgroundColor: '#ffffff',
        width: '80%',
        maxWidth: '450px',
        borderRadius: '16px',
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
        padding: '32px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        position: 'relative'
    },
    title: {
        fontSize: '22px',
        fontWeight: '700',
        color: '#0a1d4a',
        marginBottom: '4px'
    },
    subtitle: {
        fontSize: '15px',
        color: '#5b6b85',
        marginBottom: '28px'
    },
    closeBtn: {
        position: 'absolute',
        top: '32px',
        right: '32px',
        background: 'none',
        border: 'none',
        color: '#dc3545',
        fontSize: '20px',
        cursor: 'pointer',
        padding: 0
    },
    label: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#2d3d5d',
        marginBottom: '10px',
        display: 'block'
    },
    input: {
        borderRadius: '8px',
        border: '1px solid #e2eaf2',
        padding: '12px 16px',
        fontSize: '14px',
        color: '#2d3d5d',
        height: 'auto'
    },
    textarea: {
        borderRadius: '8px',
        border: '1px solid #e2eaf2',
        padding: '14px 16px',
        fontSize: '14px',
        color: '#2d3d5d',
        minHeight: '120px',
        resize: 'none'
    },
    dropzone: {
        border: '1px dashed #d1db67', // Subtle dynamic dash border
        borderRadius: '8px',
        padding: '32px 20px',
        backgroundColor: '#ffffff',
        textAlign: 'center',
        marginBottom: '32px'
    },
    cloudIconContainer: {
        width: '48px',
        height: '48px',
        backgroundColor: '#eef2ff',
        borderRadius: '10px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '14px',
        color: '#1d52e5'
    },
    uploadTitle: {
        fontSize: '15px',
        fontWeight: '600',
        color: '#2d3d5d',
        marginBottom: '4px'
    },
    uploadSubtitle: {
        fontSize: '13px',
        color: '#8a99ad',
        marginBottom: '16px'
    },
    btnChooseFile: {
        backgroundColor: '#ffffff',
        border: '1px solid #e2eaf2',
        color: '#2d3d5d',
        fontWeight: '600',
        fontSize: '14px',
        borderRadius: '8px',
        padding: '8px 20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
    },
    btnCreate: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
        fontWeight: '600',
        borderRadius: '8px',
        fontSize: '15px',
        padding: '12px 24px',
        boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)'
    }
};

return (
    <div style={styles.backdrop} onClick={onClose}>
        <div style={styles.modalCard} onClick={(e) => e.stopPropagation()}>

            {/* Close Button */}
            <button style={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                <IoMdClose />
            </button>

            {/* Modal Header */}
            <h3 style={styles.title}>Create New Template</h3>
            <p style={styles.subtitle}>Add a new OMR template to get started.</p>

            <form onSubmit={handleFormSubmit}>

                {/* Template Name Input */}
                <div className="form-group mb-4">
                    <label style={styles.label}>Template Name</label>
                    <input
                        type="text"
                        name="name"
                        className="form-control"
                        placeholder="Enter template name"
                        value={formData.name}
                        onChange={handleInputChange}
                        style={styles.input}
                        required
                    />
                </div>

                {/* Description Input */}
                <div className="form-group mb-4">
                    <label style={styles.label}>Description (Optional)</label>
                    <textarea
                        name="description"
                        className="form-control"
                        placeholder="Enter brief description..."
                        value={formData.description}
                        onChange={handleInputChange}
                        style={styles.textarea}
                    />
                </div>

                {/* Upload Dropzone Container */}
                <div className="form-group mb-0">
                    <label style={styles.label}>Upload Template File</label>
                    <div style={styles.dropzone}>
                        <div style={styles.cloudIconContainer}>
                            <FiUploadCloud size={22} />
                        </div>
                        <div style={styles.uploadTitle}>Upload OMR Template</div>
                        <div style={styles.uploadSubtitle}>
                            {formData.file ? `Selected: ${formData.file.name}} ` : 'PNG, JPG (Max, 10 MB)'}
                        </div>

                        {/* Native Hidden File Input */}
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".png, .jpg, .jpeg"
                            style={{ display: 'none' }}
                        />

                        <button
                            type="button"
                            style={styles.btnChooseFile}
                            onClick={triggerFileInput}  >
                            Choose File
                        </button>
                    </div>
                </div>

                {/* Submit Action Button */}
                <div className="d-flex justify-content-end">
                    <button type="submit" className="btn btn-primary" style={styles.btnCreate}>
                        Create Template
                    </button>
                </div>

            </form>
        </div>
    </div>
);
};

export default CreateTemplateModal;