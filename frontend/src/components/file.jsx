import { useState } from "react";

export function File() {

  const [selectedFile, setSelectedFile] = useState("dbc");

  function handleOnSelect(file) {
    console.log(selectedFile)
    console.log(file)
    setSelectedFile(file);
  }

  return (
    <div>
      <button onClick={() => handleOnSelect("abc")}>click</button>
      <h1>{selectedFile}</h1>
    </div>
  );
}