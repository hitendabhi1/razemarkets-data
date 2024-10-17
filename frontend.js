async function loadData() {
  try {
    const response = await fetch("http://localhost:3001/prices");
    const data = await response.json();

    Object.keys(data).forEach((symbol) => {
      const item = data[symbol];

      // Select DOM elements for each symbol
      const nameElement = document.querySelector(
        `.${symbol.toString().toLowerCase()}-name`
      );
      const buyElement = document.querySelector(
        `.${symbol.toString().toLowerCase()}-buy`
      );
      const sellElement = document.querySelector(
        `.${symbol.toString().toLowerCase()}-sell`
      );
      const spreadElement = document.querySelector(
        `.${symbol.toString().toLowerCase()}-spread`
      );
      const dailyChange = document.querySelector(
        `.${symbol.toString().toLowerCase()}-dailychange`
      );

      // Update DOM elements if they exist
      if (nameElement) nameElement.innerText = symbol;
      if (buyElement) buyElement.innerText = item.bid ?? "N/A";
      // if (sellElement) sellElement.innerText = item.ask ?? "N/A";
      if (dailyChange)
        dailyChange.innerText = `% ${item.percentDifference}` ?? "N/A";
      if (spreadElement && typeof item.split === "number") {
        spreadElement.innerText = item.split.toFixed(5);
      }
    });
  } catch (error) {
    console.error("Error:", error); // Handle fetch or JSON parsing errors
  }
}

// Optionally refresh every 10 seconds
// loadData();
setInterval(loadData, 1000);
