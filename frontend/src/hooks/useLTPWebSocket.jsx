import { useEffect, useRef, useState } from "react";
import angelOneApi from "../config/dev/angelOneApi";

export default function useLTPWebSocket() {
  const [payload, setPayload] = useState(null);
  const wsRef = useRef(null);

  useEffect(() => {
    const ws = new WebSocket(
      `wss://smartapisocket.angelone.in/smart-stream?clientCode=${angelOneApi.CLIENT_CODE}&feedToken=${angelOneApi.FEED_TYPE}&apiKey=${angelOneApi.API_KEY}`
    );

    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connection established");
    };

    ws.onmessage = (event) => {
      event.data.arrayBuffer().then((arrayBuffer) => {
        const dataView = new DataView(arrayBuffer);
        setPayload(dataView);
      });
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = (event) => {
      console.log(event.code, event.reason, event.wasClean);
    };

    return () => {
      console.log("Cleaning up WebSocket connection...");
      if (
        ws &&
        (ws.readyState === WebSocket.OPEN ||
          ws.readyState === WebSocket.CONNECTING)
      ) {
        ws.close();
      }
    };
  }, []); // Effect will only run once on mount

  return { payload, ws: wsRef };
}
