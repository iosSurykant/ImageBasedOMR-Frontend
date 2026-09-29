function AccurateOMRSheet({ row }) {
  return (
    <div className="omr-sheet-paper-accurate">
      {/* Timing Marks Bar */}
      <div className="timing-marks-left">
        {Array.from({ length: 38 }).map((_, i) => (
          <div key={i} className="timing-mark-block" />
        ))}
      </div>

      {/* Alignment Corners */}
      <div className="alignment-corner corner-top-left" />
      <div className="alignment-corner corner-top-right" />
      <div className="alignment-corner corner-bottom-left" />
      <div className="alignment-corner corner-bottom-right" />

      {/* OMR Content Container */}
      <div style={{ paddingLeft: '10px' }}>
        {/* Header Title Section */}
        <div className="d-flex justify-content-between align-items-start border-bottom pb-1 mb-2">
          <div className="text-center" style={{ flex: 1 }}>
            <div style={{ fontSize: '13px', fontWeight: '800', color: '#881337', letterSpacing: '0.4px', lineHeight: '1.2' }}>
              DR.C.V.RAMAN UNIVERSITY
            </div>
            <div style={{ fontSize: '9px', fontWeight: '800', color: '#000' }}>
              TERM END EXAMINATION
            </div>
            <div style={{ fontSize: '8px', color: '#333' }}>
              Dec./June
            </div>
          </div>

          <div style={{ width: '110px', fontSize: '6.5px', color: '#000' }} className="text-right">
            <div>OMR SHEET No.</div>
            <div style={{ fontSize: '10px', fontWeight: '800' }}>1639591</div>
            <div style={{ borderTop: '0.5px solid #000', marginTop: '2px', paddingTop: '1px' }}>
              Code No. __________
            </div>
            <div>Office Use Only</div>
          </div>
        </div>

        {/* Split Grid Body Layout */}
        <div className="row no-gutters">
          {/* Left Column Grids */}
          <div className="col-7 pr-1">
            <div className="d-flex omr-pink-border mb-1 p-1" style={{ fontSize: '5.5px' }}>
              <div style={{ flex: 1 }} className="border-right border-danger pr-1">
                <div className="font-weight-bold omr-pink-text">1. PROGRAM CODE</div>
                <div className="d-flex justify-content-around mt-1">
                  {[0, 1, 2, 3].map(c => (
                    <div key={c}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <div 
                          key={n} 
                          style={{ 
                            width: '6.5px', 
                            height: '6.5px', 
                            border: '0.5px solid #000', 
                            borderRadius: '50%', 
                            fontSize: '4.5px', 
                            textAlign: 'center', 
                            margin: '0.5px 0',
                            backgroundColor: (c === 0 && n === 0) || (c === 2 && n === 3) ? '#000' : '#fff',
                            color: (c === 0 && n === 0) || (c === 2 && n === 3) ? '#fff' : '#000'
                          }}
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ flex: 1 }} className="border-right border-danger px-1">
                <div className="font-weight-bold omr-pink-text">2. EXAM CENTRE</div>
                <div className="d-flex justify-content-around mt-1">
                  {[0, 1, 2].map(c => (
                    <div key={c}>
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                        <div 
                          key={n} 
                          style={{ 
                            width: '6.5px', 
                            height: '6.5px', 
                            border: '0.5px solid #000', 
                            borderRadius: '50%', 
                            fontSize: '4.5px', 
                            textAlign: 'center', 
                            margin: '0.5px 0',
                            backgroundColor: c === 1 && n === 4 ? '#000' : '#fff',
                            color: c === 1 && n === 4 ? '#fff' : '#000'
                          }}
                        >
                          {n}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ width: '22px' }} className="pl-1">
                <div className="font-weight-bold omr-pink-text">4. SET</div>
                <div className="mt-1">
                  {['A', 'B', 'C', 'D'].map((s, idx) => (
                    <div 
                      key={s} 
                      style={{ 
                        width: '7px', 
                        height: '7px', 
                        border: '0.5px solid #000', 
                        borderRadius: '50%', 
                        fontSize: '5px', 
                        textAlign: 'center', 
                        margin: '2px 0',
                        backgroundColor: idx === 0 ? '#000' : '#fff',
                        color: idx === 0 ? '#fff' : '#000'
                      }}
                    >
                      {s}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Roll Number Grid */}
            <div className="omr-pink-border mb-1 p-1" style={{ fontSize: '5.5px' }}>
              <div className="font-weight-bold omr-pink-text mb-1">5. ROLL NUMBER</div>
              <div className="d-flex justify-content-between">
                {['0','0','3','4','8','7','5','0','1','2'].map((digit, cIdx) => (
                  <div key={cIdx} className="text-center">
                    <div style={{ borderBottom: '0.5px solid #000', fontWeight: 'bold', fontSize: '6px', marginBottom: '1px' }}>{digit}</div>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <div 
                        key={n} 
                        style={{ 
                          width: '6.5px', 
                          height: '6.5px', 
                          border: '0.5px solid #000', 
                          borderRadius: '50%', 
                          fontSize: '4.5px', 
                          margin: '0.5px auto',
                          backgroundColor: n === parseInt(digit) ? '#000' : '#fff',
                          color: n === parseInt(digit) ? '#fff' : '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Registration Number */}
            <div className="omr-pink-border p-1" style={{ fontSize: '5.5px' }}>
              <div className="font-weight-bold omr-pink-text mb-1">7. REGISTRATION NUMBER</div>
              <div className="d-flex justify-content-between">
                {['1','0','2','9','4','8','7','3','2','0'].map((digit, cIdx) => (
                  <div key={cIdx} className="text-center">
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <div 
                        key={n} 
                        style={{ 
                          width: '6px', 
                          height: '6px', 
                          border: '0.5px solid #000', 
                          borderRadius: '50%', 
                          fontSize: '4px', 
                          margin: '0.5px auto',
                          backgroundColor: n === parseInt(digit) ? '#000' : '#fff',
                          color: n === parseInt(digit) ? '#fff' : '#000',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {n}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Barcode & Answer Grid */}
          <div className="col-5 pl-1">
            <div className="text-center mb-1 omr-pink-border p-1 bg-white">
              <svg width="100%" height="22" viewBox="0 0 150 22">
                <rect x="0" y="0" width="150" height="22" fill="#ffffff" />
                {[3,6,8,12,15,17,21,26,28,32,36,40,43,47,51,54,58,62,65,69,73,78,82,86,90,94,98,102,107,111,116,120,124,128,133,138,142].map((x, idx) => (
                  <rect key={idx} x={x} y="1" width={idx % 3 === 0 ? "2.5" : "1.2"} height="20" fill="#000000" />
                ))}
              </svg>
            </div>

            <div className="omr-pink-border p-1 bg-white">
              <div className="text-center font-weight-bold omr-pink-text border-bottom border-danger pb-1 mb-1" style={{ fontSize: '7.5px' }}>
                ANSWER
              </div>

              <div className="row no-gutters">
                <div className="col-6 pr-1 border-right border-danger">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const qNum = i + 1;
                    const filled = (qNum * 3) % 4;
                    return (
                      <div key={qNum} className="d-flex align-items-center justify-content-between my-0.5" style={{ fontSize: '5px' }}>
                        <span style={{ width: '10px', fontWeight: 'bold' }}>{qNum}.</span>
                        {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                          <span 
                            key={optIdx} 
                            style={{
                              width: '6.5px',
                              height: '6.5px',
                              borderRadius: '50%',
                              border: '0.5px solid #a21caf',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '4px',
                              fontWeight: 'bold',
                              backgroundColor: (qNum !== 8 && optIdx === filled) ? '#000000' : 'transparent',
                              color: (qNum !== 8 && optIdx === filled) ? '#ffffff' : '#a21caf'
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>

                <div className="col-6 pl-1">
                  {Array.from({ length: 25 }).map((_, i) => {
                    const qNum = i + 26;
                    const filled = (qNum * 5) % 4;
                    return (
                      <div key={qNum} className="d-flex align-items-center justify-content-between my-0.5" style={{ fontSize: '5px' }}>
                        <span style={{ width: '10px', fontWeight: 'bold' }}>{qNum}.</span>
                        {['A', 'B', 'C', 'D'].map((opt, optIdx) => (
                          <span 
                            key={optIdx} 
                            style={{
                              width: '6.5px',
                              height: '6.5px',
                              borderRadius: '50%',
                              border: '0.5px solid #a21caf',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '4px',
                              fontWeight: 'bold',
                              backgroundColor: optIdx === filled ? '#000000' : 'transparent',
                              color: optIdx === filled ? '#ffffff' : '#a21caf'
                            }}
                          >
                            {opt}
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="d-flex justify-content-between border-top border-danger mt-1 pt-1" style={{ fontSize: '5.5px', fontWeight: 'bold' }}>
                <span>Maximum Mark: 50</span>
                <span>Mark Obtained: ____</span>
              </div>
            </div>
          </div>
        </div>

        {/* Instruction Box & Signatures */}
        <div className="omr-pink-border p-1 mt-1" style={{ fontSize: '5px' }}>
          <div className="font-weight-bold text-danger text-center mb-0.5">INSTRUCTION FOR MARKING / उत्तर अंकित करने के अनुदेश</div>
          <div className="row text-center align-items-end pt-2">
            <div className="col-4 border-top border-dark pt-0.5">Signature of Student</div>
            <div className="col-4 border-top border-dark pt-0.5">Signature of Invigilator</div>
            <div className="col-4 border-top border-dark pt-0.5">Seal & Signature of Superintendent</div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default AccurateOMRSheet