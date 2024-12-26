export default function SearchResult({
  searchResult,
  setSearchQuery,
  setSearchResult,
  handleOnClickInstrumentSearchList,
}) {
  function getExchangeSegmentCode(exchangeSegment) {
    let exchangeType;
    switch (exchangeSegment) {
      case "nse_cm":
        exchangeType = 1;
        break;
      case "nse_fo":
        exchangeType = 2;
        break;
      case "bse_cm":
        exchangeType = 3;
        break;
      case "bse_fo":
        exchangeType = 4;
        break;
      case "mcx_fo":
        exchangeType = 5;
        break;
      case "ncx_fo":
        exchangeType = 7;
        break;
      case "cds_fo":
        exchangeType = 13;
        break;
      default:
        exchangeType = "";
    }
    return exchangeType;
  }

  function handleOnClick(instrument) {
    const symbol = instrument["Trading Symbol"];
    const instrumentName = instrument["Instrument Name"];
    const token = instrument["Token"].toString();
    const exchangeSegment = instrument["Exchange Segment"];

    console.log("Selected instrument: ", instrument);

    const exchangeType = getExchangeSegmentCode(exchangeSegment);

    // Call the function to select the instrument
    handleOnClickInstrumentSearchList({
      symbol,
      instrumentName,
      exchangeType,
      token,
    });
    

    // Set the search query to the selected symbol
    setSearchQuery(symbol);

    // Clear search results after selection
    setSearchResult([]);

    // Optionally, trigger other actions like connecting (already implemented)
    // handleConnect();
  }

  return (
    <div
      className={`search-results ${
        searchResult.length === 0 ? "hidden" : ""
      }`}
    >
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
            {searchResult.map((instrument, index) => (
              <tr
                key={index}
                onClick={() => {
                  handleOnClick(instrument);
                }}
                style={{ cursor: "pointer" }}
              >
                <td>{instrument["Instrument Name"]}</td>
                <td>{instrument["Trading Symbol"]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p></p>
      )}
    </div>
  );
}
