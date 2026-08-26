import { useDispatch, useSelector } from "react-redux";
import { setSkewPanel, toggleCornerSelection, resetSkewSelections, } from "redux/reducers/skewSlice";

const { LuCheck } = require("react-icons/lu");
const { RxCross2 } = require("react-icons/rx");

const Skews = () => {

    const dispatch = useDispatch();
    const skewData = useSelector((state) => state.skew.skewData)
    const skewPanel = useSelector((state) => state.skew.isPanelOpen)

    const options = Object.keys(skewData)

    console.log(options)

    const handleSelect = (option) => {
        dispatch(toggleCornerSelection(option))
    };

    const handleSetSkewPanel = (value) => {
        dispatch(setSkewPanel(value))
    };


    const handleReset = () => {
        dispatch(resetSkewSelections())
    };

    return (
        <div className="d-flex justify-content-center align-items-center">
            <div
                className="card border-0 shadow-lg px-3 py-3"
                style={{ width: '240px', borderRadius: '12px' }}
            >
                {/* Header */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="m-0" style={{ color: '#4a5568' }}>
                        Selection
                    </h5>
                    <button
                        type="button"
                        onClick={() => handleSetSkewPanel(!skewPanel)}
                        className="btn outline-none shadow-none px-2 rounded-lg"
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#FFE5E5'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        <RxCross2 size={18} />
                    </button>
                </div>

                {/* List Options Box */}
                <div className="rounded p-3 mb-2" style={{ backgroundColor: '#f0f6ff' }}>
                    {options.map((option, index) => {
                        const isSelected = skewData[option]?.selected;
                        return (
                            <div
                                key={index}
                                onClick={() => handleSelect(option)}
                                className={`py-1 px-1 ${index !== options.length - 1 ? 'mb-2' : ''}`}
                                style={{
                                    color: '#0BAA33',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    backgroundColor: isSelected ? '#e0f0e3' : 'transparent',
                                    borderRadius: '22px',
                                    transition: 'background-color 0.2s ease-in-out',
                                }}
                            >
                                {isSelected && (
                                    <span className="mx-2 font-weight-500">
                                        <LuCheck size={18} />
                                    </span>
                                )}
                                {option}
                            </div>
                        );
                    })}
                </div>

                {/* Reset Button */}
                <div>
                    <button
                        type="button"
                        onClick={handleReset}
                        className="btn px-2 py-1 rounded outline-none shadow-none text-decoration-none"
                        style={{ color: '#2563eb', fontSize: '1rem' }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f0f6ff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                        Reset
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Skews