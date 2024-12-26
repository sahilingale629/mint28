import { useEffect, useState } from "react";
import {
  getExchangeType,
  getLastTradedPrice,
  getToken,
} from "../utils/payloadParser";

export default function CurrentInstrument({
  selectedInstrument,
  handleAddToWatchList,
  payload
}) {
  // call web socket for selected instument
  const [lastTradePrice, setLastTradePrice] = useState(0);

  useEffect(() => {
    if (
      payload &&
      getExchangeType(payload) === selectedInstrument.exchangeType &&
      getToken(payload) === selectedInstrument.token
    ) {
      setLastTradePrice(getLastTradedPrice(payload));
    }
  }, [payload]);

  function handleBuy() {
    console.log("Buy button clicked at ", lastTradePrice);
  }

  function handleSell() {
    console.log("Sell button clicked at ", lastTradePrice);
  }

  return (
    <div className="current-instrument-container">
      <div className="ltp-container">{lastTradePrice}</div>

      {/* Container for Quantity, Buy and Sell buttons */}
      <input
        type="text"
        placeholder="Enter Quantity"
        className="quantity-input"
      />
      <button className="buy-button" onClick={handleBuy}>
        Buy
      </button>
      <button className="sell-button" onClick={handleSell}>
        Sell
      </button>
      <button
        className="addNew-button"
        onClick={() => handleAddToWatchList(selectedInstrument)}
      >
        Add to watch
      </button>
    </div>
  );
}
