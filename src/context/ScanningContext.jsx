import { createContext, useContext, useState } from "react";

const ScanContext = createContext();

export const ScanProvider = ({ children }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLiveScanning, setIsLiveScanning] = useState(false);
  
  const [isPausedContext, setIsPausedContext] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(window.innerWidth < 992);

  return (
    <ScanContext.Provider
      value={{
        isScanning,
        setIsScanning,
        isPausedContext,
        setIsPausedContext,
        isStarting,
        setIsStarting,

        isLiveScanning,
        setIsLiveScanning,
        isCollapsed,
        setIsCollapsed
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => useContext(ScanContext);
