import { createContext, useContext, useState } from "react";

const ScanContext = createContext();

export const ScanProvider = ({ children }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isLiveScanning, setIsLiveScanning] = useState(true);
  
  const [isPausedContext, setIsPausedContext] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

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
        setIsLiveScanning
      }}
    >
      {children}
    </ScanContext.Provider>
  );
};

export const useScan = () => useContext(ScanContext);
