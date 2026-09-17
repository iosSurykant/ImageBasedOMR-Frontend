import React from "react";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";

const Pagination = ({
    currentPage = 1,
    totalPages = null,
    onPageChange = () => { },
    totalItems = null,
    pageSize = null,
    siblingCount = 1,
    className = "",
}) => {
    const total = totalPages ?? (totalItems && pageSize ? Math.ceil(totalItems / pageSize) : 1);

    if (total <= 0) return null;

    // Concise Page Range Generator
    const getPages = () => {
        if (total <= 5 + siblingCount) return Array.from({ length: total }, (_, i) => i + 1);

        const left = Math.max(currentPage - siblingCount, 1);
        const right = Math.min(currentPage + siblingCount, total);
        const showLeft = left > 2;
        const showRight = right < total - 1;

        if (!showLeft && showRight) return [...Array.from({ length: 3 + 2 * siblingCount }, (_, i) => i + 1), "...", total];
        if (showLeft && !showRight) return [1, "...", ...Array.from({ length: 3 + 2 * siblingCount }, (_, i) => total - (3 + 2 * siblingCount) + i + 1)];
        return [1, "...", ...Array.from({ length: right - left + 1 }, (_, i) => left + i), "...", total];
    };

    // Base Style Helpers
    const btnBase = { width: "40px", height: "40px", borderRadius: "12px", border: "none", background: "transparent", fontSize: "15px", fontWeight: "500", cursor: "pointer", display: "inline-flex", alignItems: "center", justifyContent: "center" };
    const actionBtn = { ...btnBase, width: "auto", padding: "6px 4px", gap: "8px", color: "#1e293b" };

    return (
        <div className={`d-flex align-items-center justify-content-end my-3 ${className}`} style={{ fontFamily: "system-ui, sans-serif" }}>
            <div className="d-flex align-items-center" style={{ gap: "12px", userSelect: "none" }}>
                {/* Prev Button */}
                <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => onPageChange(currentPage - 1)}
                    style={{ ...actionBtn, opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}>
                    <IoIosArrowBack /> Prev
                </button>

                {/* Number Buttons & Ellipses */}
                {getPages().map((page, idx) =>
                    page === "..." ? (
                        <span key={`dots-${idx}`} style={{ ...btnBase, color: "#64748b", cursor: "default" }}>…</span>
                    ) : (
                        <button
                            key={page}
                            type="button"
                            onClick={() => onPageChange(page)}
                            style={{ ...btnBase, color: page === currentPage ? "#ffffff" : "#1e2b4f", backgroundColor: page === currentPage ? "#2563eb" : "transparent", fontWeight: page === currentPage ? "600" : "500", boxShadow: page === currentPage ? "0 4px 12px rgba(37, 99, 235, 0.25)" : "none", }}            >
                            {page}
                        </button>
                    )
                )}

                {/* Next Button */}
                <button
                    type="button"
                    disabled={currentPage === total}
                    onClick={() => onPageChange(currentPage + 1)}
                    style={{ ...actionBtn, opacity: currentPage === total ? 0.4 : 1, cursor: currentPage === total ? "not-allowed" : "pointer" }}>
                    Next <IoIosArrowForward />
                </button>
            </div>
        </div>
    );
};

export default Pagination;