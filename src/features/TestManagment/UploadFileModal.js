import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { RxCross2 } from 'react-icons/rx';
import { VscCloudUpload } from "react-icons/vsc";
import { GoCheck } from 'react-icons/go';
import { uploadImagesFiles } from 'helper/TemplateHelper';
import getBaseUrl from 'services/BackendApi';


export const buildWsUrl = (baseUrl, token) => {
    if (!baseUrl) return "";

    const isSecure = baseUrl.startsWith("https") || baseUrl.includes("devtunnels.ms") || window.location.protocol === "https:";

    const cleanHost = baseUrl
        .replace(/^(https?:\/\/|wss?:\/\/)/, "")
        .replace(/\/+$/, "");

    const protocol = isSecure ? "wss" : "ws";

    return `${protocol}://${cleanHost}/ws?token=${token}`;
};

const UploadFileModal = ({
    setUploadModal,
    testName,
    testId,
    onFinishScan,
    onSkip
}) => {
    // Flow step state: 'select' | 'uploading' | 'complete'
    const [step, setStep] = useState('select');
    const [displayedStep, setDisplayedStep] = useState('select');
    const [isExiting, setIsExiting] = useState(false);

    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef(null);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const baseUrl = getBaseUrl();
    
    // Upload Progress States
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [uploadedCount, setUploadedCount] = useState(0);
    
    // WebSocket References and Session State
    const socketRef = useRef(null);
    const [connectionId, setConnectionId] = useState(null);
    
    const transitionToStep = (nextStep, delay = 300) => {
        if (nextStep === displayedStep) return;
        setIsExiting(true);

        setTimeout(() => {
            setStep(nextStep);
            setDisplayedStep(nextStep);
            setIsExiting(false);
        }, delay);
    };

    // --- Step 1: Connect WebSocket once when modal mounts ---
    useEffect(() => {
        const token = localStorage.getItem('token')
        const wsUrl = buildWsUrl(baseUrl, token);

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket Connected');
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);

                console.log(message)

                // Receive initial connectionId from WS server
                if (message.type === 'INIT') {
                    setConnectionId(message.connectionId);
                }

                // Handle item-by-item response from server
                if (message.type && message.type.includes('Image file uploaded successfully')) {
                    setUploadedCount(message.uploadedCount);
                    setProgress(Math.round((message.uploadedCount / message.totalFiles) * 100));
                    // If all files processed, show completion modal
                    if (message.uploadedCount === message.totalFiles) {
                        setIsUploading(false);
                        transitionToStep("complete", 550);
                    }
                }

                if (message.type === 'ALL_COMPLETED') {
                    console.log('All images processed completely.');
                    setIsUploading(false);
                    setTimeout(() => {
                        transitionToStep("complete", 550);
                    }, 500);
                }
            } catch (err) {
                console.error("Error parsing WS message:", err);
            }
        };

        socket.onerror = (err) => console.error('WebSocket Error:', err);

        // Clean up socket when component unmounts
        return () => {
            if (socket) socket.close();
        };
    }, []);

    // --- Drag & Drop Handlers ---
    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const fileList = Array.from(e.target.files);
            const imageFiles = fileList.filter(file => file.type.startsWith('image/'));
            setSelectedFiles(imageFiles);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        setIsDragging(false);

        const items = e.dataTransfer.items;
        if (!items) return;

        const filesArray = [];

        const traverseFileTree = (item, path = "") => {
            return new Promise((resolve) => {
                if (item.isFile) {
                    item.file((file) => {
                        if (file.type.startsWith('image/')) {
                            filesArray.push(file);
                        }
                        resolve();
                    });
                } else if (item.isDirectory) {
                    const dirReader = item.createReader();
                    dirReader.readEntries(async (entries) => {
                        for (let entry of entries) {
                            await traverseFileTree(entry, path + item.name + "/");
                        }
                        resolve();
                    });
                } else {
                    resolve();
                }
            });
        };

        const promises = [];
        for (let i = 0; i < items.length; i++) {
            const item = items[i].webkitGetAsEntry();
            if (item) {
                promises.push(traverseFileTree(item));
            }
        }

        await Promise.all(promises);
        setSelectedFiles(filesArray);
    };

    // --- Step 2: Real Upload Execution ---
    const startUploadProcess = async () => {
        if (!selectedFiles.length) {
            alert('Please select files first.');
            return;
        }

        try {
            transitionToStep("uploading", 500);
            setIsUploading(true);
            setProgress(0);
            setUploadedCount(0);

            const formData = new FormData();
            selectedFiles.forEach((file) => {
                formData.append('files', file); 
            });

            // Trigger API request
            const response = await uploadImagesFiles({ testName, formData });
            console.log('API upload response:', response);

        } catch (error) {
            console.error("Upload process failed:", error);
            setIsUploading(false);
            setProgress(0);
            setUploadedCount(0);
            alert("Failed to initiate upload. Please check console.");
        }
    };

    const totalFilesCount = selectedFiles.length;

    const modalContent = (
        <div className="position-fixed fixed-top w-100 h-100 d-flex align-items-center justify-content-center p-3"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', zIndex: 9999, fontFamily: '"Outfit", sans-serif' }}>
            <style>
                {`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                    .custom-spinner {
                        animation: spin 1.2s linear infinite;
                    }

                    /* Slow Entrance Animation */
                    @keyframes modalStepEnter {
                        0% {
                            opacity: 0;
                            transform: scale(0.92) translateY(-18px);
                        }
                        100% {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                    }

                    /* Slow Exit Animation */
                    @keyframes modalStepExit {
                        0% {
                            opacity: 1;
                            transform: scale(1) translateY(0);
                        }
                        100% {
                            opacity: 0;
                            transform: scale(0.92) translateY(-18px);
                        }
                    }

                    .step-enter {
                        animation: modalStepEnter 0.6s ease-out forwards;
                    }

                    .step-exit {
                        animation: modalStepExit 0.5s ease-in forwards;
                    }
                `}
            </style>

            <div className={`card border-0 shadow-lg p-4 position-relative ${isExiting ? 'step-exit' : 'step-enter'}`}
                style={{ maxWidth: '450px', width: '100%', borderRadius: '20px' }} >

                {/* STEP 1: SELECT / DROP FILES */}
                {displayedStep === 'select' && (
                    <div className='py-5' >
                        <button
                            type="button"
                            onClick={() => setUploadModal(false)}
                            className="btn btn-sm btn-link text-danger p-0 position-absolute"
                            style={{ top: '18px', right: '20px', textDecoration: 'none' }}
                            aria-label="Close"
                        >
                            <RxCross2 size={22} color="#FA1313" />
                        </button>

                        <div className="text-center mb-3 pt-1">
                            <h5 className=" text-dark mb-1" style={{ fontSize: '1.25rem', fontWeight: "600" }}>
                                TEST Created Successfully
                            </h5>
                            <p className="text-muted small mb-0">
                                Your new test has been registered in the system.
                            </p>
                        </div>

                        <div className="bg-light rounded-lg border p-3 mb-3">
                            <div className="d-flex justify-content-between align-items-center mb-1 small text-muted">
                                <span>Test Name:</span>
                                <strong className="text-dark">{testName}</strong>
                            </div>
                            <div className="d-flex justify-content-between align-items-center small text-muted">
                                <span>Test Id:</span>
                                <strong className="text-dark">{testId}</strong>
                            </div>
                        </div>

                        <hr className="my-3" style={{ borderColor: '#f1f5f9' }} />

                        <div className="text-center mb-3">
                            <h6 className="font-weight-bold text-dark mb-1" style={{ fontSize: '1.15rem' }}>
                                Upload Files
                            </h6>
                            <p className="text-muted small mb-0">
                                Upload your images or zip archives to continue.
                            </p>
                        </div>

                        {/* Dropzone Area */}
                        <div
                            className={`rounded-lg p-4 text-center ${isDragging ? 'bg-light' : 'bg-white'}`}
                            style={{
                                border: `2px dashed ${isDragging ? '#3969FE' : '#cbd5e1'}`,
                                cursor: 'pointer',
                                transition: 'all 0.2s ease-in-out'
                            }}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current && fileInputRef.current.click()}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="d-none"
                                webkitdirectory="true"
                                directory="true"
                                multiple
                            />

                            <div className="mb-2">
                                <VscCloudUpload color="#3969FE" size={54} />
                            </div>

                            <p className="font-weight-bold text-dark small mb-0">
                                {selectedFiles.length > 0
                                    ? `${selectedFiles.length} Image(s) Selected`
                                    : 'Drag & drop folder here'}
                            </p>
                            <p className="text-muted small mb-0 mt-1" style={{ fontSize: '13px' }}>
                                {selectedFiles.length > 0
                                    ? 'Ready to upload folder contents'
                                    : 'or browse folder'}
                            </p>
                        </div>

                        <p className="text-center text-muted small mt-2 mb-4" style={{ fontSize: '12px' }}>
                            Supports: JPG, PNG
                        </p>

                        <div className="d-flex justify-content-end align-items-center">
                            <button
                                type="button"
                                onClick={() => setUploadModal(false)}
                                className="btn btn-light text-secondary font-weight-bold mr-2 px-4"
                                style={{ borderRadius: '10px', fontSize: '14px' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={startUploadProcess}
                                className="btn btn-primary font-weight-bold px-4"
                                style={{
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    background: 'linear-gradient(to left, #3969FE, #1047D5)',
                                    border: 'none'
                                }}
                            >
                                Continue To Upload
                            </button>
                        </div>
                    </div>
                )}

                {/* STEP 2: PROCESSING / UPLOADING */}
                {displayedStep === 'uploading' && (
                    <div className="py-2">
                        <div className="mb-4">
                            <span className="badge badge-pill badge-light text-primary border px-3 py-2 d-inline-flex align-items-center" style={{ fontSize: '14px' }}>
                                <span className="bg-primary rounded-circle mr-2" style={{ width: '8px', height: '8px' }}></span>
                                Uploading
                            </span>
                        </div>

                        <div className="d-flex justify-content-center align-items-center my-4 py-2">
                            <div className="position-relative d-flex justify-content-center align-items-center" style={{ width: '110px', height: '110px' }}>
                                <div className="position-absolute w-100 h-100 rounded-circle" style={{ backgroundColor: '#EEF2FF' }}></div>

                                <svg className="custom-spinner position-absolute w-100 h-100" viewBox="0 0 100 100">
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="42"
                                        fill="none"
                                        stroke="#3b82f6"
                                        strokeWidth="8"
                                        strokeDasharray="70 200"
                                        strokeLinecap="round"
                                    />
                                </svg>

                                <div className="bg-white rounded-circle shadow-sm" style={{ width: '82px', height: '82px' }}></div>
                            </div>
                        </div>

                        <div className="text-center my-4">
                            <h5 className="font-weight-bold text-dark mb-1" style={{ fontSize: '1.45rem' }}>
                                Processing your files...
                            </h5>
                            <p className="text-muted mb-0" style={{ fontSize: '15px' }}>
                                This may take a moment
                            </p>
                        </div>

                        <div className="mt-4 pt-2">
                            <div className="progress" style={{ height: '8px', backgroundColor: '#eef2ff', borderRadius: '10px' }}>
                                <div
                                    className="progress-bar bg-primary rounded-pill"
                                    role="progressbar"
                                    style={{
                                        width: `${progress}%`,
                                        transition: 'width 0.3s ease'
                                    }}
                                    aria-valuenow={progress}
                                    aria-valuemin="0"
                                    aria-valuemax="100"
                                ></div>
                            </div>

                            <div className="d-flex justify-content-between align-items-center mt-2 small">
                                <strong className="text-dark">{progress}%</strong>
                                <span className="text-muted">
                                    Uploading {uploadedCount} of {totalFilesCount} files
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: UPLOAD COMPLETE */}
                {displayedStep === 'complete' && (
                    <div className="py-2">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="badge badge-pill badge-light text-success border px-3 py-2 d-inline-flex align-items-center" style={{ fontSize: '14px' }}>
                                <span className="bg-success rounded-circle mr-2" style={{ width: '8px', height: '8px' }}></span>
                                Upload Complete
                            </span>

                            <button
                                type="button"
                                onClick={() => setUploadModal(false)}
                                className="btn btn-sm btn-light border rounded-circle d-flex align-items-center justify-content-center text-muted p-0"
                                style={{ width: '32px', height: '32px' }}
                                aria-label="Close"
                            >
                                <RxCross2 size={18} />
                            </button>
                        </div>

                        <div className="d-flex justify-content-center align-items-center my-4 position-relative">
                            <div className="position-absolute" style={{ left: '-10px', top: '100px', display: 'flex', gap: '6px' }}>
                                <span className="bg-success rounded-circle" style={{ width: '7px', height: '7px' }}></span>
                                <span className="bg-primary rounded-circle" style={{ width: '7px', height: '7px' }}></span>
                                <span className="bg-warning rounded-circle" style={{ width: '7px', height: '7px' }}></span>
                            </div>

                            <div
                                className="bg-success rounded-circle d-flex align-items-center justify-content-center shadow-lg"
                                style={{
                                    width: '105px',
                                    height: '105px',
                                    boxShadow: '0px 10px 25px rgba(34, 197, 94, 0.4)'
                                }}
                            >
                                <GoCheck size={58} color="#ffffff" />
                            </div>

                            <div className="position-absolute" style={{ right: '70px', top: '-15px', display: 'flex', gap: '6px' }}>
                                <span className="bg-success rounded-circle" style={{ width: '7px', height: '7px' }}></span>
                                <span className="bg-primary rounded-circle" style={{ width: '7px', height: '7px' }}></span>
                                <span className="bg-warning rounded-circle" style={{ width: '7px', height: '7px' }}></span>
                            </div>
                        </div>

                        <div className="text-center my-3">
                            <h5 className="font-weight-bold text-dark mb-1" style={{ fontSize: '1.45rem', letterSpacing: '0.5px' }}>
                                Files uploaded successfully
                            </h5>
                            <p className="text-muted mb-0" style={{ fontSize: '15px', letterSpacing: '0.5px' }}>
                                {totalFilesCount} files have been uploaded successfully
                            </p>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary flex-fill mr-2 py-2 font-weight-bold"
                                style={{ borderRadius: '12px', fontSize: '15px' }}
                                onClick={() => {
                                    if (onSkip) onSkip();
                                    else setUploadModal(false);
                                }}
                            >
                                Skip &gt;&gt;
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary flex-fill ml-2 py-2 font-weight-bold shadow-sm"
                                style={{
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    backgroundColor: '#3b82f6',
                                    borderColor: '#3b82f6',
                                    boxShadow: '0px 4px 14px rgba(59, 130, 246, 0.35)'
                                }}
                                onClick={() => {
                                    if (onFinishScan) onFinishScan();
                                    else setUploadModal(false);
                                }}
                            >
                                Start Scan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    return ReactDOM.createPortal(modalContent, document.body);
};

export default UploadFileModal;