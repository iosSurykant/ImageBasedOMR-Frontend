import { useSelector } from "react-redux";

function TopMetaCard({tstName, tId, }) {
  
  const { list: templates } = useSelector((state) => state.templates);
  const templateName = templates?.find((template) => Number(template.id) === Number(tId));

  return (
    <div className="omr-card top-meta-card mb-3">
      <div className="d-flex flex-wrap align-items-center justify-content-between top-meta-text">
        <div className="d-flex align-items-center flex-wrap">
          <div>
            <span className="top-meta-label">TEST:</span>
            <span className="top-meta-value" style={{fontWeight:"700"}} >{tstName}</span>
          </div>
          {/* <span className="top-meta-divider">|</span> */}
          {/* <div>
            <span className="top-meta-label">TEST ID:</span>
            <span className="top-meta-value">{tstId}</span>
          </div> */}
          <span className="top-meta-divider">|</span>
          <div>
            <span className="top-meta-label">Template:</span>
            <span className="top-meta-value">{templateName?.fileName}</span>
          </div>
        </div>
        <div className="mt-2 mt-md-0">
          <span className="top-meta-label">Total Images:</span>
          <span className="total-images-highlight">1,010</span>
        </div>
      </div>
    </div>
  );
}

export default TopMetaCard