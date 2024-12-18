import React, { useState, useEffect } from "react";

const apikey = "TJKT1ves";
const clientcode = "S492372";
const feedtype =
  "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IlM0OTIzNzIiLCJpYXQiOjE3MzQ1MDAzMTYsImV4cCI6MTczNDU4NjcxNn0.HnMnOBmrqjcwM8SHro5bFjtMfYc1I76vdRGyu4Z9Grg4sqMYIP2AAMmIs036NO5k_8HxkVDh4jHEEhH_AZopUA";

const fetch_url =
  "https://margincalculator.angelone.in/OpenAPI_File/files/OpenAPIScripMaster.json";

export default Symbol = ({ row }) => {
  const [lastTradePrice, setLastTradePrice] = useState(0);

  useEffect(() => {
    if (!row) {
      return;
    }
    const ws = new WebSocket(
      `wss://smartapisocket.angelone.in/smart-stream?clientCode=${clientcode}&feedToken=${feedtype}&apiKey=${apikey}`
    );

    ws.onopen = () => {
      console.log("WebSocket connection opened");

      // Create the initial payload with tokenList
      const jsondata = {
        correlationID: "correlationId",
        action: 1,
        params: {
          mode: 1,
          tokenList: [
            {
              exchangeType: row.es,
              tokens: [`${row.token}`],
            },
          ],
        },
      };

      // Send the initial message with tokenList
      ws.send(JSON.stringify(jsondata));
    };

    ws.onmessage = async (event) => {
      const arrayBuffer = await event.data.arrayBuffer();
      const dataView = new DataView(arrayBuffer);
      const priceRaw = dataView.getInt32(43, true); // Assuming price at byte offset 43
      const price = priceRaw / 100.0; // Adjust according to your currency mode
      console.log("Decoded price:", price);
      setLastTradePrice(price);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
    ws.onclose = (code, reason) => {
      ws.send(
        JSON.stringify({
          correlationID: "correlationId",
          action: 0,
          params: {
            mode: 1,
            tokenList: [
              {
                exchangeType: row.es,
                tokens: [`${row.token}`],
              },
            ],
          },
        })
      );
      console.log(code, reason);
    };

    return () => {
      console.log("Cleaning up WebSocket connection...");
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    };
  }, [row]); // Reconnect and send new data when tokenList changes

  const handleBuy = (symbol, ltp) => {
    console.log(`Buying ${symbol} at price ${ltp}`);
    // Implement your buy logic here (e.g., make an API call or update state)
  };

  const handleSell = (symbol, ltp) => {
    console.log(`Selling ${symbol} at price ${ltp}`);
    // Implement your sell logic here (e.g., make an API call or update state)
  };

  return (
    <tr>
      <td>{row.symbol}</td>
      <td>{lastTradePrice}</td>
      <td>
        {/* Add Buy and Sell buttons for each row */}
        <button
          className="buy-button"
          onClick={() => handleBuy(row.symbol, lastTradePrice)}
        >
          Buy
        </button>
        <button
          className="sell-button"
          onClick={() => handleSell(row.symbol, lastTradePrice)}
        >
          Sell
        </button>
      </td>
    </tr>
  );
};
