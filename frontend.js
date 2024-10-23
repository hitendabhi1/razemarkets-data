async function loadData() {
  try {
    const response = await fetch(
      "https://razemarkets-data.onrender.com/prices"
    );
    const data = await response.json();

    Object.keys(data).forEach((symbol) => {
      const item = data[symbol];

      // Select DOM elements for each symbol
      const nameElements = document.querySelectorAll(
        `.${symbol.toString().toLowerCase()}-name`
      );
      const buyElements = document.querySelectorAll(
        `.${symbol.toString().toLowerCase()}-buy`
      );
      const sellElements = document.querySelectorAll(
        `.${symbol.toString().toLowerCase()}-sell`
      );
      const spreadElements = document.querySelectorAll(
        `.${symbol.toString().toLowerCase()}-spread`
      );
      const dailyChanges = document.querySelectorAll(
        `.${symbol.toString().toLowerCase()}-dailychange`
      );

      // Update DOM elements if they exist
      if (nameElements) {
        nameElements.forEach((nameElement) => {
          nameElement.innerText = symbol;
        });
      }
      if (buyElements) {
        buyElements.forEach((buyElement) => {
          buyElement.innerText = item.bid ?? "N/A";

          // Remove old direction classes and add the new one
          buyElement.classList.remove("up", "down", "unchanged");
          if (item.biddirection) {
            buyElement.classList.add(item.biddirection);
          }
        });
      }

      if (dailyChanges) {
        dailyChanges.forEach((dailyChange) => {
          dailyChange.innerText = `${item.dailyChange}` ?? "N/A";

          // Remove old direction classes and add the new one
          dailyChange.classList.remove("up", "down", "unchanged");
          if (item.percentagedirection) {
            dailyChange.classList.add(item.percentagedirection);
          }
        });
      }

      if (spreadElements && typeof item.split === "number") {
        spreadElements.forEach((spreadElement) => {
          spreadElement.innerText = item.split.toFixed(2);
        });
      }
    });
  } catch (error) {
    console.error("Error:", error); // Handle fetch or JSON parsing errors
  }
}

// Optionally refresh every second
setInterval(loadData, 1000);
