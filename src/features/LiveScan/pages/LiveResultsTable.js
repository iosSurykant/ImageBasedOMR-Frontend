  // import { head } from 'lodash';
  import React from 'react';

  function LiveResultsTable({
    selectedRow = null,
    handleRowViewClick,
    liveData
  }) {

    // Dynamic Status Badge Renderer
    const renderBadge = (Status) => {
      const normalizedStatus = (Status)

      if (normalizedStatus === 'True' || normalizedStatus === 'success') {
        return <span className="badge-soft-success">Successful</span>;
      } else if (normalizedStatus === 'needs review' || normalizedStatus === 'review') {
        return <span className="badge-soft-warning">Review</span>;
      } else {
        return <span className="badge-soft-danger">Failed</span>;
      }
    };

    const filterFileName = (fileName) => {
      if (!fileName) return "";

      return fileName.split("/").pop();
    };

    return (
      <div className="omr-card results-card">
        {/* CARD HEADER */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-4">
          <div className="d-flex align-items-center mb-2 mb-md-0 gap-2">
            <h3 className="results-title mb-0">Live Results</h3>
            <span className="latest-results-pill">Showing latest results</span>
          </div>
          <div>
            <a href="#viewall" className="view-all-link" onClick={(e) => e.preventDefault()}>
              View All Results
            </a>
          </div>
        </div>

        {/* FLOATING WEBSOCKET LIVE ALERT
        {newStreamCount > 0 && (
          <div
            className="websocket-new-results-alert mb-3 text-center py-2 px-3 rounded cursor-pointer"
            style={{ backgroundColor: '#0d6efd', color: '#fff', fontSize: '13px', fontWeight: '600' }}
            onClick={handleNewStreamClick}
          >
            <i className="fas fa-arrow-down mr-2"></i>
            ↓ {newStreamCount} new result{newStreamCount > 1 ? 's' : ''} received via WebSocket. Click to view.
          </div>
        )} */}

        {/* DATA TABLE */}
        <div className="table-responsive" style={{ maxHeight: '450px', overflowY: 'auto', scrollbarWidth:"none" }}>
          <table className="table table-omr">
            <thead className='sticky-table-header'>
              <tr>
                <th style={{ width: '60px' }}>Sr.</th>
                <th>File Name</th>
                <th>Status</th>
                <th>Live Time</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {liveData.length > 0 ? (
                liveData.map((row, index) => {
                  const isSelected = selectedRow && selectedRow.id === row.id;
                  // const displaySrNo = (activePage - 1) * itemsPerPage + index + 1;

                  return (
                    <tr key={row.id || index} className={isSelected ? 'active-selected-row' : ''}>
                      <td className="sr-no-cell">#{row.Sr}</td>
                      <td className="file-name-cell">{filterFileName(row.FileName)}</td>
                      <td>{renderBadge(row.Status)}</td>
                      <td className="live-time-cell">{row.LiveTime || row.timestamp}</td>
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
      </div>
    );
  }

  export default LiveResultsTable;