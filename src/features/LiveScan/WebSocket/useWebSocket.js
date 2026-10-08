import { useEffect, useRef, useCallback } from "react";

export function useWebSocket({
    baseUrl,
    onMessage,
    onError,
    onOpen,
    onClose,
}) {
    const wsRef = useRef(null);
    const mountedRef = useRef(true);

    // Keep latest callbacks in refs
    const onMessageRef = useRef(onMessage);
    const onErrorRef = useRef(onError);
    const onOpenRef = useRef(onOpen);
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onMessageRef.current = onMessage;
    }, [onMessage]);

    useEffect(() => {
        onErrorRef.current = onError;
    }, [onError]);

    useEffect(() => {
        onOpenRef.current = onOpen;
    }, [onOpen]);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    // --------------------------------------------------
    // CONNECT
    // --------------------------------------------------

    const connect = useCallback(() => {
        if (!baseUrl) {
            console.warn("[LiveScan WS] baseUrl is missing");
            return;
        }

        try {
            const token = localStorage.getItem("token");

            let wsUrl = baseUrl;

            if (baseUrl.startsWith("http://")) {
                wsUrl = baseUrl.replace("http://", "ws://");
            } else if (baseUrl.startsWith("https://")) {
                wsUrl = baseUrl.replace("https://", "wss://");
            }

            const ws = new WebSocket(
                `${wsUrl}ws?token=${token}`
            );

            wsRef.current = ws;

            // --------------------------------------------------
            // OPEN
            // --------------------------------------------------

            ws.onopen = () => {
                console.log("[LiveScan WS] Connected");

                onOpenRef.current?.();
            };

            // --------------------------------------------------
            // MESSAGE
            // --------------------------------------------------

            ws.onmessage = (event) => {
                let data;

                try {
                    data = JSON.parse(event.data);
                } catch {
                    console.warn(
                        "[LiveScan WS] Non-JSON message:",
                        event.data
                    );

                    return;
                }

                console.log(
                    "[LiveScan WS] Received:",
                    data
                );

                onMessageRef.current?.(data);
            };

            // --------------------------------------------------
            // ERROR
            // --------------------------------------------------

            ws.onerror = (error) => {
                console.error(
                    "[LiveScan WS] Error:",
                    error
                );

                onErrorRef.current?.(error);
            };

            // --------------------------------------------------
            // CLOSE
            // --------------------------------------------------

            ws.onclose = (event) => {
                console.log(
                    "[LiveScan WS] Closed:",
                    event
                );

                onCloseRef.current?.(event);
            };

        } catch (error) {
            console.error(
                "[LiveScan WS] Failed to create WebSocket:",
                error
            );

            onErrorRef.current?.(error);
        }
    }, [baseUrl]);

    // --------------------------------------------------
    // CONNECT ON MOUNT
    // --------------------------------------------------

    useEffect(() => {
        mountedRef.current = true;

        connect();

        return () => {
            mountedRef.current = false;

            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    // --------------------------------------------------
    // INTERNAL SEND FUNCTION
    // --------------------------------------------------

    const sendMessage = useCallback((data) => {
        const ws = wsRef.current;

        if (!ws) {
            console.warn(
                "[LiveScan WS] WebSocket instance not found"
            );

            return false;
        }

        if (ws.readyState !== WebSocket.OPEN) {
            console.warn(
                "[LiveScan WS] WebSocket is not open"
            );

            return false;
        }

        try {
            const message = JSON.stringify(data);

            console.log(
                "[LiveScan WS] Sending:",
                data
            );

            ws.send(message);

            return true;

        } catch (error) {
            console.error(
                "[LiveScan WS] Failed to send message:",
                error
            );

            return false;
        }
    }, []);

    // --------------------------------------------------
    // GO / START SCANNING
    // --------------------------------------------------
    // Backend expects:
    //
    // {
    //     action: "process",
    //     folderPath: "EmpId/TestCaseName",
    //     idTemp: 123
    // }

    const goScan = useCallback((data = {}) => {
        return sendMessage(data);
    }, [sendMessage]);

    // --------------------------------------------------
    // PAUSE
    // --------------------------------------------------

    const pauseScan = useCallback((data = {}) => {
        return sendMessage({
            ...data,
            action: "PAUSE",
        });
    }, [sendMessage]);

    // --------------------------------------------------
    // RESUME
    // --------------------------------------------------

    const resumeScan = useCallback((data = {}) => {
        return sendMessage({
            ...data,
            action: "RESUME",
        });
    }, [sendMessage]);

    // --------------------------------------------------
    // STOP
    // --------------------------------------------------

    const stopScan = useCallback((data = {}) => {
        return sendMessage({
            ...data,
            action: "STOP",
        });
    }, [sendMessage]);

    // --------------------------------------------------
    // RETURN
    // --------------------------------------------------

    return {
        goScan,
        pauseScan,
        resumeScan,
        stopScan,
    };
}