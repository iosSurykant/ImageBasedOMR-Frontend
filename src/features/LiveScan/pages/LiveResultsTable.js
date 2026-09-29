import React from 'react';

function LiveResultsTable({
  currentDataset = [],
  selectedRow = null,
  handleRowViewClick,
  searchTerm = '',
  setSearchTerm,
  postCodeFilter = 'All',
  setPostCodeFilter,
  activePage = 1,
  setActivePage,
  itemsPerPage = 10,
  totalScannedCount = 324, // Total backend count (or defaults to currentDataset length)
  newStreamCount = 0,      // Unread WebSocket updates counter
  handleNewStreamClick     // Callback when user clicks the "new results" alert
}) {

  // Dynamic Status Badge Renderer
  const renderBadge = (status) => {
    const normalizedStatus = (status || '').toString().toLowerCase();

    if (normalizedStatus === 'successful' || normalizedStatus === 'success') {
      return <span className="badge-soft-success">Successful</span>;
    } else if (normalizedStatus === 'needs review' || normalizedStatus === 'review') {
      return <span className="badge-soft-warning">Review</span>;
    } else {
      return <span className="badge-soft-danger">Failed</span>;
    }
  };

  // Dynamic Pagination & Footer Calculations
  const totalItems = currentDataset.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = totalItems === 0 ? 0 : (activePage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(activePage * itemsPerPage, totalItems);

  // Paginated Subset
  const displayedRows = currentDataset.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  return (
    <div className="omr-card results-card">
      {/* CARD HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
        <div className="d-flex align-items-center mb-2 mb-md-0 gap-2">
          <h3 className="results-title mb-0">Live Results</h3>
          <span className="latest-results-pill">Showing latest {totalItems} results</span>
        </div>
        <div>
          <a href="#viewall" className="view-all-link" onClick={(e) => e.preventDefault()}>
            View All Results
          </a>
        </div>
      </div>

      {/* FLOATING WEBSOCKET LIVE ALERT */}
      {newStreamCount > 0 && (
        <div 
          className="websocket-new-results-alert mb-3 text-center py-2 px-3 rounded cursor-pointer"
          style={{ backgroundColor: '#0d6efd', color: '#fff', fontSize: '13px', fontWeight: '600' }}
          onClick={handleNewStreamClick}
        >
          <i className="fas fa-arrow-down mr-2"></i>
          ↓ {newStreamCount} new result{newStreamCount > 1 ? 's' : ''} received via WebSocket. Click to view.
        </div>
      )}

      {/* SEARCH & POSTCODE FILTER CONTROLS */}
      <div className="d-flex flex-wrap align-items-center mb-4 gap-3">
        {setSearchTerm && (
          <div className="search-input-box mr-3 mb-2 mb-sm-0">
            <i className="fas fa-search search-icon"></i>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Search Roll No / File..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                if (setActivePage) setActivePage(1);
              }}
            />
          </div>
        )}

        {setPostCodeFilter && (
          <div className="postcode-filter-box">
            <span className="postcode-label">Post Code:</span>
            <select 
              className="postcode-select"
              value={postCodeFilter}
              onChange={(e) => {
                setPostCodeFilter(e.target.value);
                if (setActivePage) setActivePage(1);
              }}
            >
              <option value="All">All</option>
              <option value="110001">110001</option>
              <option value="280001">280001</option>
            </select>
            <i className="fas fa-chevron-down text-muted" style={{ fontSize: '11px' }}></i>
          </div>
        )}
      </div>

      {/* DATA TABLE */}
      <div className="table-responsive">
        <table className="table table-omr">
          <thead>
            <tr>
              <th style={{ width: '60px' }}>Sr.</th>
              <th>File Name</th>
              <th>Status</th>
              <th>Live Time</th>
              <th className="text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {displayedRows.length > 0 ? (
              displayedRows.map((row, index) => {
                const isSelected = selectedRow && selectedRow.id === row.id;
                const displaySrNo = (activePage - 1) * itemsPerPage + index + 1;

                return (
                  <tr key={row.id || index} className={isSelected ? 'active-selected-row' : ''}>
                    <td className="sr-no-cell">#{displaySrNo}</td>
                    <td className="file-name-cell">{row.fileName}</td>
                    <td>{renderBadge(row.status)}</td>
                    <td className="live-time-cell">{row.liveTime || row.timestamp}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className={`btn-action-view ${isSelected ? 'active-view-btn' : ''}`}
                        onClick={() => handleRowViewClick(row)}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted py-4">
                  No sheets found matching search criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* DYNAMIC FOOTER & PAGINATION */}
      <div className="table-footer-container d-flex flex-wrap justify-content-between align-items-center mt-3">
        <div className="showing-text">
          Showing {startIndex}-{endIndex} of {totalScannedCount || totalItems} scanned sheets
        </div>

        <div className="pagination-custom d-flex align-items-center gap-2">
          {/* Previous Button */}
          <a 
            href="#prev"
            className={`page-link-text ${activePage === 1 ? 'disabled' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              if (activePage > 1 && setActivePage) setActivePage(activePage - 1);
            }}
          >
            ← Previous
          </a>

          {/* Dynamic Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <div 
              key={page}
              className={`page-number-box ${activePage === page ? 'active' : 'inactive'}`}
              onClick={() => setActivePage && setActivePage(page)}
              style={{ cursor: 'pointer' }}
            >
              {page}
            </div>
          ))}

          {/* Next Button */}
          <a 
            href="#next"
            className={`page-link-text ${activePage === totalPages || totalPages === 0 ? 'disabled' : 'active-next'}`}
            onClick={(e) => {
              e.preventDefault();
              if (activePage < totalPages && setActivePage) setActivePage(activePage + 1);
            }}
          >
            Next →
          </a>
        </div>
      </div>
    </div>
  );
}

export default LiveResultsTable;