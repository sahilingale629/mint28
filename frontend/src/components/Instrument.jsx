import { useEffect, useState } from "react";
import {
  getExchangeType,
  getLastTradedPrice,
  getToken,
} from "../utils/payloadParser";

export default function Instrument({ instrument, payload }) {
  const [lastTradePrice, setLastTradePrice] = useState(0);

  const symbol = instrument?.symbol;

  useEffect(() => {
    if (
      payload &&
      getExchangeType(payload) === instrument.exchangeType &&
      getToken(payload) === instrument.token
    ) {
      setLastTradePrice(getLastTradedPrice(payload));
    }
  }, [payload]);

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
      <td>{symbol}</td>
      <td>{lastTradePrice}</td>
      <td>
        {/* Add Buy and Sell buttons for each row */}
        <button
          className="buy-button"
          onClick={() => handleBuy(symbol, lastTradePrice)}
        >
          Buy
        </button>
        <button
          className="sell-button"
          onClick={() => handleSell(symbol, lastTradePrice)}
        >
          Sell
        </button>
      </td>
    </tr>
  );
}
