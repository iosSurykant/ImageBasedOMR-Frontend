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

    const connect = useCallback(() => {
        if (!baseUrl) return;
        console.log(baseUrl)

        try {
            const token = localStorage.getItem("token");
            // Determine WebSocket protocol based on baseUrl
            let wsUrl = baseUrl;
            if (baseUrl.startsWith('http://')) {
                wsUrl = baseUrl.replace('http://', 'ws://');
            } else if (baseUrl.startsWith('https://')) {
                wsUrl = baseUrl.replace('https://', 'wss://');
            }

            const ws = new WebSocket(`${wsUrl}ws?token=${token}`);
            wsRef.current = ws;

            ws.onopen = () => {
                console.log("[LiveScan WS] connected");
                onOpenRef.current?.();
            };

            ws.onmessage = (event) => {
                let data;
                try {
                    data = JSON.parse(event.data);
                } catch {
                    console.warn("[LiveScan WS] non-JSON message:", event.data);
                    return;
                }
                onMessageRef.current?.(data);
            };

            ws.onerror = (error) => {
                console.error("[LiveScan WS] error:", error);
                onErrorRef.current?.(error);
            };

            ws.onclose = (event) => {
                console.log("[LiveScan WS] closed", event);
                onCloseRef.current?.(event);
            };
        } catch (err) {
            console.error("[LiveScan WS] failed to create WebSocket:", err);
            onErrorRef.current?.(err);
        }
    }, [baseUrl]);

    useEffect(() => {
        mountedRef.current = true;
        connect();

        return () => {
            mountedRef.current = false;
            if (wsRef.current) {
                wsRef.current.close();
            }
        };
    }, [connect]);

    const sendMessage = useCallback((data) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify(data));
        } else {
            console.warn("[LiveScan WS] WebSocket is not open. Cannot send message.");
        }
    }, []);

    return { sendMessage };
}