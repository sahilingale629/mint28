import Instrument from "./Instrument";

export default function InstrumentWatchList({ instrumentWatchList, payload }) {
  return (
    instrumentWatchList.length > 0 && (
      <table className="added-rows-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>LTP</th>
            <th>Action</th> {/* Add a new header for the action buttons */}
          </tr>
        </thead>
        <tbody>
          {instrumentWatchList.map((row, index) => (
            <Instrument key={index} instrument={row} payload={payload}/>
          ))}
        </tbody>
      </table>
    )
  );
}
