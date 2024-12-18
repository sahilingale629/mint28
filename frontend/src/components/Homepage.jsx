import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // Import PapaParse to parse CSV
import "./Homepage.css"; // Import the CSS file for styling
import axios from "axios"; // Import Axios for API requests
//import { SmartAPI, WebSocket, WebSocketV2 } from "smartapi-javascript";
// import fs from "fs";
// import path from "path";
import Symbol from "../components/Symbol";

let debounceTimer;

const Homepage = () => {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [data, setData] = useState([]); // State to store the CSV data
  const [searchResult, setSearchResult] = useState([]); // State for search results
  const [selectedSymbols, setSelectedSymbols] = useState(null); // State to store selected symbols
  const [checkedSymbols, setCheckedSymbols] = useState([]); // State to store checked symbols for deletion
  const [selectedClient, setSelectedClient] = useState(""); // State for selected client
  const [clients, setClients] = useState([]); // State for client names
  const [ltp, setLtp] = useState(""); // State for LTP
  const [quantity, setQuantity] = useState(""); // State for quantity
  const [userId, setUserId] = useState(""); // State for user ID
  const [apiKey, setApiKey] = useState(""); // State for API key
  const [response, setResponse] = useState(null); // State for API response
  const [error, setError] = useState(null); // State for error messages
  const [tokenList, setTokenList] = useState([
    { exchangeType: 1, tokens: ["17818"] }, // Initial token with exchangeType and token
  ]);
  const [lastTradePrice, setLastTradePrice] = useState(0);

  const [rows, setRows] = useState([]); // State to store added rows

  // const [{tok,es}, {settok] = useState(0);
  // const [es , setes]

  //  let token ="";
  const apikey = "TJKT1ves";
  const clientcode = "S492372";
  const feedtype =
    "eyJhbGciOiJIUzUxMiJ9.eyJ1c2VybmFtZSI6IlM0OTIzNzIiLCJpYXQiOjE3MzQ1MDAzMTYsImV4cCI6MTczNDU4NjcxNn0.HnMnOBmrqjcwM8SHro5bFjtMfYc1I76vdRGyu4Z9Grg4sqMYIP2AAMmIs036NO5k_8HxkVDh4jHEEhH_AZopUA";

  console.log(rows);
  // Fetch and parse CSV data when the page loads
  useEffect(() => {
    const saveCSV = async () => {
      try {
        const response = await fetch("http://localhost:5007/save-csv");
        const result = await response.text();
        console.log(result);
      } catch (error) {
        console.error("Error saving CSV:", error.message);
      }
    };

    saveCSV(); // Trigger the save on page load
  }, []);

  const handleAddRow = () => {
    if (!searchQuery) {
      alert("Please select a symbol and ensure LTP is available.");
      return;
    }

    // Create a new row object
    setRows((prevRows) => [...prevRows, selectedSymbols]);
  };

  // Function to parse CSV text into an array of objects
  const parseCSV = (csvText) => {
    const rows = csvText.split("\n");
    const headers = rows[0].split(",");
    return rows.slice(1).map((row) => {
      const values = row.split(",");
      return headers.reduce((acc, header, index) => {
        acc[header.trim()] = values[index]?.trim();
        return acc;
      }, {});
    });
  };

  useEffect(() => {
    if (!selectedSymbols) {
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
              exchangeType: selectedSymbols.es,
              tokens: [`${selectedSymbols.token}`],
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
                exchangeType: selectedSymbols.es,
                tokens: [`${selectedSymbols.token}`],
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
  }, [selectedSymbols]); // Reconnect and send new data when tokenList changes

  // Fetch and parse the CSV file
  useEffect(() => {
    Papa.parse("/merged_file.csv", {
      download: true, // This makes sure to download the file from the public folder
      header: true, // If the CSV file has a header row
      dynamicTyping: true, // Automatically converts types like strings to numbers
      complete: (result) => {
        setData(result.data); // Store the parsed data into state
      },
      error: (error) => {
        console.error("Error parsing CSV file:", error);
      },
    });

    Papa.parse("/clients.csv", {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        setData(result.data);

        // Extract unique client names
        const clientNames = [
          ...new Set(result.data.map((row) => row["name"]).filter(Boolean)),
        ];
        setClients(clientNames);
      },
      error: (error) => {
        console.error("Error parsing CSV file:", error);
      },
    });
  }, []);

  const handleConnect = async () => {
    try {
      // Send a POST request to the backend
      const result = await axios.post(
        "http://localhost:5007/connect-aliceblue",
        {
          userId: "488059",
          apiKey:
            "FTlDyv5M6j931VGZ6elvlU7HgWYkWy5IWrFeyAAF15QULcYIgsPS8Cyli4lFW481DF6sfDy7zkfNXQ6XFclL0RkuTIJeFRK566xOZM3qcQRhvIyn3AFiTrhIhdy883by",
        }
      );

      if (result.data.success) {
        setResponse(result.data.data); // Set the successful response data
        setError(null);
      } else {
        setResponse(null);
        setError(result.data.error); // Set the error message
      }
    } catch (err) {
      setResponse(null);
      setError("An error occurred: " + err.message);
    }
  };

  const handleSearch = (event) => {
    const query = event.target.value.trim();
    setSearchQuery(query);

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      if (query) {
        const filteredData = data.filter(
          (row) =>
            row["Instrument Name"] &&
            row["Instrument Name"].toLowerCase().includes(query.toLowerCase())
        );
        setSearchResult(filteredData);
      } else {
        setSearchResult([]);
      }
    }, 500); // 300ms delay for debouncing
  };

  // Handle symbol selection

  // Handle checkbox change (for deletion)
  const handleCheckboxChange = (symbol) => {
    setCheckedSymbols((prevChecked) => {
      if (prevChecked.includes(symbol)) {
        return prevChecked.filter((checkedSymbol) => checkedSymbol !== symbol); // Remove symbol if already checked
      } else {
        return [...prevChecked, symbol]; // Add symbol if not checked
      }
    });
  };

  // Handle delete for checked symbols
  const handleDeleteSelected = () => {
    setSelectedSymbols((prevSymbols) =>
      prevSymbols.filter((symbol) => !checkedSymbols.includes(symbol))
    );
    setCheckedSymbols([]); // Clear checked symbols after deletion
  };

  // Function to save the selected symbols as a CSV file
  const saveToCSV = () => {
    const selectedData = selectedSymbols.map((symbol) => ({
      "Trading Symbol": symbol,
    }));

    // Use PapaParse to generate the CSV and trigger the download
    const csv = Papa.unparse(selectedData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });

    // Create a link element to trigger the download
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "selected_symbols.csv");
      link.click();
    }
  };

  // Function to handle the 'Login All Clients' button click
  const handleLoginAllClients = async () => {
    try {
      const response = await axios.post(
        "http://localhost:5007/login-all-clients"
      );

      if (response.data.success) {
        console.log("All clients logged in:", response.data.clients);
        alert("All clients logged in successfully!");
      } else {
        console.error("Error:", response.data.error);
        alert("Failed to log in all clients.");
      }
    } catch (error) {
      console.error("Error occurred:", error.message);
      alert("An error occurred while logging in all clients.");
    }
  };

  const handleLtpChange = (event) => {};

  const handleTokenChange = (newTokenList) => {
    setTokenList((prevList) => [...prevList, newTokenList]);
  };

  return (
    <div className="homepage-container">
      {/* Login All Clients Button */}
      <header className="website-header">MINT MASTER TRADING</header>

      <div className="login-all-clients-button-container">
        <button
          onClick={handleLoginAllClients}
          className="login-all-clients-button"
        >
          Login All Clients
        </button>
      </div>

      {/* Client Dropdown and Login Button */}
      <div className="client-login-container">
        {/* Dropdown for selecting a client */}
        <select
          value={selectedClient}
          onChange={(e) => setSelectedClient(e.target.value)}
          className="client-dropdown"
        >
          <option value="">Select a Client</option>
          {clients.map((client, index) => (
            <option key={index} value={client}>
              {client}
            </option>
          ))}
        </select>

        {/* Button to login the selected client */}
      </div>

      <h1>ORDER FIRING PAGE</h1>

      {/* Search Bar Section */}
      <div className="search-bar-container">
        <input
          type="text"
          placeholder="Search by Instrument Name..."
          value={searchQuery} // The input value will be the selected symbol or search query
          onChange={handleSearch} // Trigger search on every input change
          className="search-input"
        />
        {/* LTP Field */}
        <div className="lastTradePrice-container">{lastTradePrice}</div>

        {/* Container for Quantity, Buy and Sell buttons */}

        <input
          type="text"
          placeholder="Enter Quantity"
          className="quantity-input"
        />
        <button className="buy-button">Buy</button>
        <button className="sell-button">Sell</button>
        <button className="addNew-button" onClick={handleAddRow}>
          Add Row
        </button>

        {/* Display added rows */}
        {rows.length > 0 && (
          <table className="added-rows-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th>LTP</th>
                <th>Action</th> {/* Add a new header for the action buttons */}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <Symbol key={index} row={row} />
              ))}
            </tbody>
          </table>
        )}

        {/* Results will be displayed in this scrollable container */}
        <div className="search-results">
          {searchResult.length > 0 ? (
            <table className="result-table">
              <thead>
                <tr>
                  {/* Show only Instrument Name and Trading Symbol columns */}
                  <th>Instrument Name</th>
                  <th>Trading Symbol</th>
                </tr>
              </thead>
              <tbody>
                {searchResult.map((row, index) => (
                  <tr
                    key={index}
                    onClick={() => {
                      const selectedSymbol = row["Trading Symbol"];
                      const selectedInstrumentName = row["Instrument Name"];
                      const token = row["Token"];

                      const exch_seg = row["Exchange Segment"];
                      let es = "";
                      let tok = [];
                      // Log the selected Instrument Name and Trading Symbol
                      console.log(
                        "Selected Instrument:",
                        selectedInstrumentName
                      );
                      console.log("Selected Trading Symbol:", selectedSymbol);
                      console.log("Token:", token);
                      if (exch_seg === "nse_fo") {
                        es = 2;
                      }
                      if (exch_seg === "nse_cm") {
                        es = 1;
                      }
                      if (exch_seg === "bse_cm") {
                        es = 3;
                      }
                      if (exch_seg === "bse_fo") {
                        es = 4;
                      }
                      if (exch_seg === "mcx_fo") {
                        es = 5;
                      }
                      if (exch_seg === "ncx_fo") {
                        es = 7;
                      }
                      if (exch_seg === "cde_fo") {
                        es = 13;
                      }
                      console.log("Exchange Segement:", exch_seg);
                      console.log("Mode: ", es);

                      // Call the function to select the symbol
                      setSelectedSymbols({
                        symbol: selectedSymbol,
                        instrumentName: selectedInstrumentName,
                        es: es,
                        token: token,
                      });

                      // Set the search query to the selected symbol
                      setSearchQuery(selectedSymbol);

                      // Clear search results after selection
                      setSearchResult([]);

                      // Optionally, trigger other actions like connecting (already implemented)
                      handleConnect();

                      // handleTokenChange(
                      //   { symbol:selectedSymbol, exchangeType: es, tokens: [`${tok}`] }, // Updated exchangeType and tokens
                      // );
                    }}
                    style={{ cursor: "pointer" }}
                  >
                    <td>{row["Instrument Name"]}</td>
                    <td>{row["Trading Symbol"]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Homepage;
