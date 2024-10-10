function loadData() {
  fetch("http://localhost:3001/prices")
    .then((response) => response.json()) // Return the parsed JSON
    .then((data) => {
      console.log(data);
    }) // Use the parsed data
    .catch((error) => console.error("Error:", error)); // Optional: Handle errors
}
