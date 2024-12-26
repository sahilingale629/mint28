export function subscribe(ws, exchangeType, token) {
  return new Promise((resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendSubscriptionMessage(ws, exchangeType, token);
      resolve("Subscribed successfully");
    }
    else if (ws && ws.readyState === WebSocket.CONNECTING) {
      ws.onopen = () => {
        sendSubscriptionMessage(ws, exchangeType, token);
        resolve("Subscribed successfully");
      };
    }
    else {
      reject("WebSocket is not open. Cannot subscribe.");
    }
  });
}

export function unsubscribe(ws, exchangeType, token) {
  return new Promise((resolve, reject) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendUnsubscriptionMessage(ws, exchangeType, token);
      resolve("Unsubscribed successfully");
    }
    else if (ws && ws.readyState === WebSocket.CONNECTING) {
      ws.onopen = () => {
        sendUnsubscriptionMessage(ws, exchangeType, token);
        resolve("Unsubscribed successfully");
      };
    }
    else {
      reject("WebSocket is not open. Cannot unsubscribe.");
    }
  });
}

// Helper function to send the subscription message
function sendSubscriptionMessage(ws, exchangeType, token) {
  const subscriptionMessage = {
    correlationID: "correlationId",
    action: 1,
    params: {
      mode: 1,
      tokenList: [
        {
          exchangeType: exchangeType,
          tokens: [token],
        },
      ],
    },
  };

  ws.send(JSON.stringify(subscriptionMessage));
}

// Helper function to send the subscription message
function sendUnsubscriptionMessage(ws, exchangeType, token) {
  const unsubscriptionMessage = {
    correlationID: "correlationId",
    action: 0,
    params: {
      mode: 1,
      tokenList: [
        {
          exchangeType: exchangeType,
          tokens: [token],
        },
      ],
    },
  };

  // Send the subscription message as JSON
  ws.send(JSON.stringify(unsubscriptionMessage));
}