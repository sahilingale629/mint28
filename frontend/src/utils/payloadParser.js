// Function to read Subscription Mode (1 byte)
export function getSubscriptionMode(dataView) {
  return dataView.getInt8(0);
}

// Function to read Exchange Type (1 byte)
export function getExchangeType(dataView) {
  return dataView.getInt8(1);
}

// Function to read Token (25 bytes, UTF-8 encoded string)
export function getToken(dataView) {
  const offset = 2;
  const length = 25;
  const bytes = [];
  for (let i = 0; i < length; i++) {
    const char = dataView.getUint8(offset + i);
    if (char === 0) break; // Stop at null terminator
    bytes.push(char);
  }
  return String.fromCharCode(...bytes);
}

// Function to read Sequence Number (8 bytes, int64)
export function getSequenceNumber(dataView, offset) {
  const low = dataView.getUint32(offset, true);
  const high = dataView.getInt32(offset + 4, true);
  return high * 0x100000000 + low;
}

// Function to read Exchange Timestamp
export function getExchangeTimestamp(dataView) {
  return getSequenceNumber(dataView, 35);
}

// Function to read Last Traded Price
export function getLastTradedPrice(dataView) {
  const priceRaw = dataView.getInt32(43, true);
  return priceRaw / 100.0; // Convert from paise to actual value
}

// Function to read Last Traded Quantity
export function getLastTradedQuantity(dataView) {
  return getSequenceNumber(dataView, 51);
}

// Function to read Average Traded Price
export function getAverageTradedPrice(dataView) {
  return getSequenceNumber(dataView, 59);
}

// Function to read Volume Traded
export function getVolumeTraded(dataView) {
  return getSequenceNumber(dataView, 67);
}

// Function to read Total Buy Quantity (8 bytes, double)
export function getTotalBuyQuantity(dataView) {
  return dataView.getFloat64(75, true);
}

// Function to read Total Sell Quantity
export function getTotalSellQuantity(dataView) {
  return dataView.getFloat64(83, true);
}

// Function to read Open Price
export function getOpenPrice(dataView) {
  return getSequenceNumber(dataView, 91);
}

// Function to read High Price
export function getHighPrice(dataView) {
  return getSequenceNumber(dataView, 99);
}

// Function to read Low Price
export function getLowPrice(dataView) {
  return getSequenceNumber(dataView, 107);
}

// Function to read Close Price
export function getClosePrice(dataView) {
  return getSequenceNumber(dataView, 115);
}

// Function to read Last Traded Timestamp
export function getLastTradedTimestamp(dataView) {
  return getSequenceNumber(dataView, 123);
}

// Function to read Open Interest
export function getOpenInterest(dataView) {
  return getSequenceNumber(dataView, 131);
}

// Function to read Open Interest Change
export function getOpenInterestChange(dataView) {
  return dataView.getFloat64(139, true);
}

// Function to read Best Five Data
export function getBestFiveData(dataView) {
  const offset = 147;
  const bestFive = [];
  for (let i = 0; i < 10; i++) {
    const baseOffset = offset + i * 20;
    const price = getSequenceNumber(dataView, baseOffset) / 100.0;
    const quantity = getSequenceNumber(dataView, baseOffset + 8);
    const orders = dataView.getInt32(baseOffset + 16, true);

    bestFive.push({
      price,
      quantity,
      orders,
    });
  }
  return bestFive;
}

// Function to read Upper Circuit Limit
export function getUpperCircuitLimit(dataView) {
  return getSequenceNumber(dataView, 347);
}

// Function to read Lower Circuit Limit
export function getLowerCircuitLimit(dataView) {
  return getSequenceNumber(dataView, 355);
}

// Function to read 52-Week High Price
export function getWeek52High(dataView) {
  return getSequenceNumber(dataView, 363);
}

// Function to read 52-Week Low Price
export function getWeek52Low(dataView) {
  return getSequenceNumber(dataView, 371);
}

export function parsePacket(dataView) {

  return {
    subscriptionMode: getSubscriptionMode(dataView),
    exchangeType: getExchangeType(dataView),
    token: getToken(dataView),
    sequenceNumber: getSequenceNumber(dataView),
    exchangeTimestamp: getExchangeTimestamp(dataView),
    lastTradedPrice: getLastTradedPrice(dataView),
    lastTradedQuantity: getLastTradedQuantity(dataView),
    averageTradedPrice: getAverageTradedPrice(dataView),
    volumeTraded: getVolumeTraded(dataView),
    totalBuyQuantity: getTotalBuyQuantity(dataView),
    totalSellQuantity: getTotalSellQuantity(dataView),
    openPrice: getOpenPrice(dataView),
    highPrice: getHighPrice(dataView),
    lowPrice: getLowPrice(dataView),
    closePrice: getClosePrice(dataView),
    lastTradedTimestamp: getLastTradedTimestamp(dataView),
    openInterest: getOpenInterest(dataView),
    openInterestChange: getOpenInterestChange(dataView),
    bestFiveData: getBestFiveData(dataView),
    upperCircuitLimit: getUpperCircuitLimit(dataView),
    lowerCircuitLimit: getLowerCircuitLimit(dataView),
    week52High: getWeek52High(dataView),
    week52Low: getWeek52Low(dataView),
  };
}