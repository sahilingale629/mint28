const axios = require("axios");

// Replace these placeholders with actual values
const data = JSON.stringify({
  clientcode: "S492372",
  password: "1228",
  totp: "545305",
  // Add your TOTP code here
});

const config = {
  method: "post",
  url: "https://apiconnect.angelone.in/rest/auth/angelbroking/user/v1/loginByPassword",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-UserType": "USER",
    "X-SourceID": "WEB",
    "X-ClientLocalIP": "YOUR_CLIENT_LOCAL_IP",
    "X-ClientPublicIP": "YOUR_CLIENT_PUBLIC_IP",
    "X-MACAddress": "YOUR_MAC_ADDRESS",
    "X-PrivateKey": "TJKT1ves ",
  },
  data: data,
};

axios(config)
  .then(function (response) {
    console.log("Success:", JSON.stringify(response.data, null, 2));
  })
  .catch(function (error) {
    console.error(
      "Error:",
      error.response ? error.response.data : error.message
    );
  });
