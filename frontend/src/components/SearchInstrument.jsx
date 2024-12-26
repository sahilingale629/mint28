import { useState } from "react";
import SearchResult from "./SearchResult";

let debounceTimer = null;

export default function SearchInstrument({
  instrumentData,
  handleOnClickInstrumentSearchList,
}) {
  const [searchQuery, setSearchQuery] = useState(""); // State for search query
  const [searchResult, setSearchResult] = useState([]); // State for search results


  const handleSearch = (event) => {
    const query = event.target.value.trim();
    setSearchQuery(query);

    if (debounceTimer) clearTimeout(debounceTimer);

    debounceTimer = setTimeout(() => {
      if (query) {
        const filteredData = instrumentData.filter(
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

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Search by Instrument Name..."
        value={searchQuery} // The input value will be the selected symbol or search query
        onChange={handleSearch} // Trigger search on every input change
        className="search-input"
      />
      {/* Results will be displayed in this scrollable container */}
      <SearchResult
        searchResult={searchResult}
        setSearchQuery={setSearchQuery}
        setSearchResult={setSearchResult}
        handleOnClickInstrumentSearchList={handleOnClickInstrumentSearchList}
      />
    </div>
  );
}
