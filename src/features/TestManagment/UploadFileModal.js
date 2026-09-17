import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { RxCross2 } from 'react-icons/rx';
import { VscCloudUpload } from "react-icons/vsc";
import { GoCheck } from 'react-icons/go';
import { uploadImagesFiles } from 'helper/TemplateHelper';
import getBaseUrl from 'services/BackendApi';
import { toast } from 'react-toastify';

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
    const [totalFiles, setTotalFiles] = useState(0);

    // Persist total files count across WS messages (since backend sends totalFiles only in message #1)
    const totalFilesRef = useRef(0);

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

    useEffect(() => {
        const token = localStorage.getItem('token');
        const wsUrl = buildWsUrl(baseUrl, token);

        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
            console.log('WebSocket Connected');
        };

        socket.onmessage = (event) => {
            try {
                const message = JSON.parse(event.data);
                console.log("WS Received Message:", message);

                // 1. Initial connection handshake
                if (message.type === 'INIT') {
                    setConnectionId(message.connectionId);
                    return;
                }

                // 2. Extract total count (handles capitalized 'Total' or string format)
                const rawTotal = message.Total || message.totalFiles;
                if (rawTotal) {
                    const parsedTotal = parseInt(rawTotal, 10);
                    if (!isNaN(parsedTotal) && parsedTotal > 0) {
                        totalFilesRef.current = parsedTotal;
                        setTotalFiles(parsedTotal);
                    }
                }

                // 3. Match progress message ("Image extracted successfully")
                const isImageExtracted = message.type && (
                    message.type.includes("Image extracted successfully") ||
                    message.type.includes("Image file uploaded successfully") ||
                    message.type === "FILE_UPLOADED"
                );

                if (isImageExtracted || message.uploadedCount !== undefined) {
                    const currentUploaded = Number(message.uploadedCount) || 0;
                    const total = totalFilesRef.current;

                    setUploadedCount(currentUploaded);

                    if (total > 0) {
                        const calculatedProgress = Math.min(
                            100,
                            Math.round((currentUploaded / total) * 100)
                        );
                        setProgress(calculatedProgress);

                        // Transition when final file is processed
                        if (currentUploaded >= total) {
                            setIsUploading(false);
                            setTimeout(() => {
                                transitionToStep("complete", 550);
                            }, 500);
                        }
                    }
                }

                // 4. Fallback explicit completion signal
                if (message.type === 'ALL_COMPLETED') {
                    setProgress(100);
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

        return () => {
            if (socket) socket.close();
        };
    }, [baseUrl]);

    const handleFileChange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setSelectedFiles([file]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        const file = e.dataTransfer.files?.[0];
        if (!file) return;

        const isValid =
            file.name.toLowerCase().endsWith(".zip") ||
            file.name.toLowerCase().endsWith(".rar");

        if (!isValid) {
            toast.warning("Please select a ZIP or RAR file.");
            e.target.value = "";
            return;
        }

        setSelectedFiles([file]);
    };

    const startUploadProcess = async () => {
        const file = selectedFiles[0];

        if (!file) {
            toast.error("Please select a ZIP/RAR file");
            return;
        }

        try {
            transitionToStep("uploading", 500);

            setIsUploading(true);
            setProgress(0);
            setUploadedCount(0);
            setTotalFiles(0);
            totalFilesRef.current = 0;

            const formData = new FormData();
            formData.append("files", file);

            if (connectionId) {
                formData.append("connectionId", connectionId);
            }

            const response = await uploadImagesFiles({ testName, formData, connectionId });
            console.log("Archive upload response:", response);

        } catch (error) {
            console.error("Upload process failed:", error);

            setIsUploading(false);
            setProgress(0);
            setUploadedCount(0);
            totalFilesRef.current = 0;

            toast.error("Failed to upload ZIP/RAR file.");
        }
    };

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

                    @keyframes modalStepEnter {
                        0% { opacity: 0; transform: scale(0.92) translateY(-18px); }
                        100% { opacity: 1; transform: scale(1) translateY(0); }
                    }

                    @keyframes modalStepExit {
                        0% { opacity: 1; transform: scale(1) translateY(0); }
                        100% { opacity: 0; transform: scale(0.92) translateY(-18px); }
                    }

                    .step-enter { animation: modalStepEnter 0.6s ease-out forwards; }
                    .step-exit { animation: modalStepExit 0.5s ease-in forwards; }
                `}
            </style>

            <div className={`card border-0 shadow-lg p-4 position-relative ${isExiting ? 'step-exit' : 'step-enter'}`}
                style={{ maxWidth: '450px', width: '100%', borderRadius: '20px' }} >

                {/* STEP 1: SELECT / DROP FILES */}
                {displayedStep === 'select' && (
                    <div className='py-5'>
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
                            <h5 className="text-dark mb-1" style={{ fontSize: '1.25rem', fontWeight: "600" }}>
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
                                accept=".zip,.rar"
                            />

                            <div className="mb-2">
                                <VscCloudUpload color="#3969FE" size={54} />
                            </div>

                            <p className="font-weight-bold text-dark small mb-0">
                                {selectedFiles.length > 0
                                    ? selectedFiles[0].name
                                    : 'Drag & drop ZIP or RAR file here'}
                            </p>
                            <p className="text-muted small mb-0 mt-1" style={{ fontSize: '13px' }}>
                                {selectedFiles.length > 0
                                    ? 'Ready to upload archive'
                                    : 'or browse ZIP / RAR file'}
                            </p>
                        </div>

                        <p className="text-center text-muted small mt-2 mb-4">
                            Supports: ZIP, RAR
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
                            <span className="badge badge-pill badge-light text-primary border px-3 py-2 d-inline-flex align-items-center" style={{ fontSize: '14px', fontWeight: "500", letterSpacing: "0.7px" }}>
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
                                    {totalFiles > 0
                                        ? `Uploading ${uploadedCount} of ${totalFiles} files`
                                        : <span className='text-danger'>Extracting & counting files...</span>}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: UPLOAD COMPLETE */}
                {displayedStep === 'complete' && (
                    <div className="py-2">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <span className="badge badge-pill badge-light text-success border px-3 py-2 d-inline-flex align-items-center" style={{ fontSize: '14px', fontWeight: "600", letterSpacing: "0.5px" }}>
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
                                {totalFiles || uploadedCount || 1} files have been processed successfully
                            </p>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mt-4 pt-3">
                            <button
                                type="button"
                                className="btn btn-outline-secondary flex-fill mr-2 py-2"
                                style={{ borderRadius: '12px', fontSize: '15px', fontWeight:"500",letterSpacing:"0.5px" }}
                                onClick={() => { if (onSkip) onSkip(); else setUploadModal(false); }}>
                                Skip &gt;&gt;
                            </button>

                            <button
                                type="button"
                                className="btn btn-primary flex-fill ml-2 py-2 shadow-sm"
                                style={{fontWeight:"500", letterSpacing:"0.5px", borderRadius: '12px', fontSize: '15px', backgroundColor: '#3b82f6', borderColor: '#3b82f6', boxShadow: '0px 4px 14px rgba(59, 130, 246, 0.35)' }}
                                onClick={() => { if (onFinishScan) onFinishScan(); else setUploadModal(false); }}>
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