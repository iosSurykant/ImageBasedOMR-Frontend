import { useEffect, useRef, useCallback } from "react";

export function useWebSocket({
  baseUrl,
  // writableRef,
  // headerWrittenRef,
  // fileClosingRef,
  onMessage,
  onAccuracyChange,
}) {
  const serialNumberRef = useRef(1);
  const totalCountRef = useRef(0);
  const trueCountRef = useRef(0);

  const mountedRef = useRef(true);

  // latest callbacks refs
  const onMessageRef = useRef(onMessage);
  const onAccuracyChangeRef = useRef(onAccuracyChange);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    onAccuracyChangeRef.current = onAccuracyChange;
  }, [onAccuracyChange]);

  // UI batching
  // ─────────────────────────────────────────────────────────────
  const messageQueueRef = useRef([]);

  const flushTimerRef = useRef(null);

  const BATCH_INTERVAL = 300;

  // CSV batching
  // ─────────────────────────────────────────────────────────────
  // const csvQueueRef = useRef([]);

  // const csvFlushTimerRef = useRef(null);

  // const CSV_FLUSH_INTERVAL = 1000;

  // Reset refs for new scan
  // ─────────────────────────────────────────────────────────────
  const resetRefs = useCallback(() => {
    serialNumberRef.current = 1;
    totalCountRef.current = 0;
    trueCountRef.current = 0;
  }, []);

  // Main WS effect
  // ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!baseUrl) return;

    mountedRef.current = true;

    const token = localStorage.getItem("token");

    const ws = new WebSocket(
      `ws://${baseUrl}/ws?token=${token}`
    );

    // Connected
    // ───────────────────────────────────────────────────────────
    ws.onopen = () => {
      console.log("[WS] connected");
    };

    // Incoming WS message
    // ───────────────────────────────────────────────────────────
    ws.onmessage = async (event) => {
      if (event.data === "success") return;

      // if (fileClosingRef.current) return;

      // parse
      let data;

      try {
        
        data = JSON.parse(event.data);
        console.log("[WS] message:", data);

      } catch {
        console.error("[WS] non-JSON message:", event.data);
        return;
      }

      if (!data) return;

      // Accuracy counters
      // ─────────────────────────────────────────────────────────
      totalCountRef.current++;

      if (
        data.Status === true ||
        data.Status === "True"
      ) {
        trueCountRef.current++;
      }


      // Row enrichment
      // ─────────────────────────────────────────────────────────
      const row = { ...data };

      if (!row["Serial No"]) {
        row["Serial No"] = serialNumberRef.current++;
      }

      
  
      messageQueueRef.current.push(row);

      if (!flushTimerRef.current) {

        flushTimerRef.current = setTimeout(() => {

          const batch = [...messageQueueRef.current];

          messageQueueRef.current.length = 0;

          flushTimerRef.current = null;

          if (!mountedRef.current) return;

          // accuracy update
          if (totalCountRef.current > 0) {

            const accuracy = Number(
              (
                (trueCountRef.current /
                  totalCountRef.current) *
                100
              ).toFixed(2)
            );

            onAccuracyChangeRef.current(
              accuracy
            );
          }

          // push batch to UI
          if (batch.length) {
            onMessageRef.current(batch);
          }

        }, BATCH_INTERVAL);
      }
    };

    // WS error
    // ───────────────────────────────────────────────────────────
    ws.onerror = (err) => {
      console.error("[WS] error:", err);
    };

    // WS close
    // ───────────────────────────────────────────────────────────
    ws.onclose = async () => {

      console.log("[WS] closed");

      // if (
      //   writableRef.current &&
      //   !fileClosingRef.current
      // ) {

      //   fileClosingRef.current = true;

      //   try {

      //     // final CSV flush
      //     if (csvQueueRef.current.length) {

      //       await writableRef.current.write(
      //         csvQueueRef.current.join("")
      //       );

      //       csvQueueRef.current.length = 0;
      //     }

      //     await writableRef.current.close();

      //     writableRef.current = null;

      //     toast.success(
      //       "CSV file saved successfully"
      //     );

      //   } catch (err) {

      //     console.error(
      //       "[WS] CSV close error:",
      //       err
      //     );
      //   }
      // }
    };

    // Cleanup
    // ───────────────────────────────────────────────────────────
    return () => {

      mountedRef.current = false;

      clearTimeout(flushTimerRef.current);

      // clearTimeout(csvFlushTimerRef.current);

      ws.close();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseUrl]);

  return { resetRefs };
}