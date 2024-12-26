import { useState, useEffect, useRef } from "react";
import "./homepage.css";
import axios from "axios";
import SearchInstrument from "../SearchInstrument";
import Papa from "papaparse";
import CurrentInstrument from "../CurrentInstrument";
import InstrumentWatchList from "../IntrumentWatchList";
import useLTPWebSocket from "../../hooks/useLTPWebSocket";
import { subscribe, unsubscribe } from "../../utils/websocketUtils";
import { File } from "../file";

export default function Homepage() {
  const [selectedSymbols, setSelectedSymbols] = useState(null); // State to store selected symbols
  const [checkedSymbols, setCheckedSymbols] = useState([]); // State to store checked symbols for deletion
  const [error, setError] = useState(null); // State for error messages
  const [response, setResponse] = useState(null); // State for successful response messages

  const [selectedClient, setSelectedClient] = useState(""); // State for selected client
  const [instrumentWatchList, setInstrumentWatchList] = useState([]); // State to store the instrument list
  const [csvData, setCsvData] = useState([]); // State to store the CSV data
  const [clients, setClients] = useState([]); // State for client names
  const [selectedInstrument, setSelectedInstrument] = useState(null); // State for selected instrument

  const { payload, ws } = useLTPWebSocket(selectedInstrument); // websocket connection hook
  const cacheInstrumentWatchList = useRef(new Map());

  // cache watchlist
  useEffect(() => {
    cacheInstrumentWatchList.current.set(1, new Set());
    cacheInstrumentWatchList.current.set(2, new Set());
    cacheInstrumentWatchList.current.set(3, new Set());
    cacheInstrumentWatchList.current.set(4, new Set());
    cacheInstrumentWatchList.current.set(5, new Set());
    cacheInstrumentWatchList.current.set(7, new Set());
    cacheInstrumentWatchList.current.set(13, new Set());
  }, []);

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

  // Fetch and parse the CSV file when the component mounts
  useEffect(() => {
    Papa.parse("/merged_file.csv", {
      download: true, // This makes sure to download the file from the public folder
      header: true, // If the CSV file has a header row
      dynamicTyping: true, // Automatically converts types like strings to numbers
      complete: (result) => {
        setCsvData(result.data); // Store the parsed data into state
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
        setCsvData(result.data);

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

  // Function to handle adding an instrument to the watchlist
  const handleAddToWatch = (instrument) => {
    if (!instrument) {
      alert("Please select a symbol and ensure LTP is available.");
      return;
    }

    // add to watch list cache
    cacheInstrumentWatchList.current
    .get(instrument.exchangeType)
    .add(instrument.token);

    // add to watchlist
    setInstrumentWatchList((prev) => [...prev, instrument]);
  };

  const handleOnClickInstrumentSearchList = async (instrument) => {
    if (!instrument) return;
    console.log(instrument);
    console.log(selectedInstrument);

    // unsubscribe instrument if not in watch list
    if (
      selectedInstrument &&
      !cacheInstrumentWatchList.current
        .get(selectedInstrument?.exchangeType)
        .has(selectedInstrument?.token)
    ) {
      await unsubscribe(ws.current, selectedInstrument?.exchangeType, selectedInstrument?.token);
    }

    // subscribe to new instrument on search selection
    await subscribe(ws.current, instrument.exchangeType, instrument.token);

    // then set an instrument
    setSelectedInstrument(instrument);
  };

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

  return (
    <main className="homepage-container">
      <header className="website-header">MINT MASTER TRADING</header>

      <div className="homepage-content">
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

        <div className="order-firing-container">
          {/* Search Bar Section */}
          <SearchInstrument
            instrumentData={csvData}
            handleOnClickInstrumentSearchList={
              handleOnClickInstrumentSearchList
            }
          />
          <CurrentInstrument
            selectedInstrument={selectedInstrument}
            handleAddToWatchList={handleAddToWatch}
            payload={payload}
          />
        </div>
        <InstrumentWatchList
          instrumentWatchList={instrumentWatchList}
          payload={payload}
        />
      </div>
      <File />
    </main>
  );
}
