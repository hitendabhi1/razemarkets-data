import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;

// Middleware to parse incoming JSON requests
app.use(express.json());

const fetchData = async (url) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    return { error: error.message };
  }
};

// Function to format the data
const formatData = (data) => {
  let dataObject = {};

  data.forEach((item) => {
    const bid = item.bid;
    const ask = item.ask;
    const splitDifference = ask - bid;
    const percentDifference = (splitDifference / bid) * 100;
    dataObject = {
      ...dataObject,
      [item.symbol]: {
        bid: bid,
        ask: ask,
        split: splitDifference,
        percentDifference: percentDifference.toFixed(2), // rounding to 2 decimal places
      },
    };
  });

  return dataObject;
};

// Route: GET /prices
app.get("/prices", async (req, res) => {
  // Tec Data

  const url =
    "http://212.117.171.68:5000/Connect?user=100476&password=T%2BDmV0Kk&host=57.128.140.226&port=443";

  fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "text/plain",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok " + response.statusText);
      }

      const textData = await response.text(); // Await the promise
      console.log("Response as Text:", textData); // Log the resolved text data

      try {
        const pricesData = await fetchData(
          `http://212.117.171.68:5000/GetQuoteMany?id=${textData}&symbols=AMZN&symbols=TSLA&symbols=AAPL&symbols=GOOGL&symbols=NVDA&symbols=USDJPY&symbols=EURUSD&symbols=GBPUSD&symbols=USDCAD&symbols=EURGBP&symbols=XAUUSD&symbols=XAGUSD&symbols=WTIUSD&symbols=SPXUSD&symbols=DJIUSD&symbols=NDXUSD&symbols=FTSGBP&symbols=DAXEUR&symbols=BTCUSD&symbols=ETHUSD&symbols=XRPUSD&symbols=LTCUSD&symbols=ADAUSD&symbols=BRNUSD&symbols=NGCUSD`
        );
        res.json(formatData(pricesData));
      } catch (error) {
        res.status(500).json({ error: "Failed to fetch prices data" });
      }
    })

    .catch((error) => {
      console.error("There was a problem with the fetch operation:", error);
    });

  // try {
  //   const dataKey = await fetchData(
  //     "http://212.117.171.68:5000/Connect?user=100476&password=T%2BDmV0Kk&host=57.128.140.226&port=443"
  //   );

  //   console.log(dataKey);

  //   try {
  //     const pricesData = await fetchData(
  //       `http://212.117.171.68:5000/GetQuoteMany?id=9b2ab868-1edf-4edc-b083-99edd08e0ad7&symbols=AMZN&symbols=TSLA&symbols=AAPL&symbols=GOOGL&symbols=NVDA&symbols=USDJPY&symbols=EURUSD&symbols=GBPUSD&symbols=USDCAD&symbols=EURGBP&symbols=XAUUSD&symbols=XAGUSD&symbols=WTIUSD&symbols=SPXUSD&symbols=DJIUSD&symbols=NDXUSD&symbols=FTSGBP&symbols=DAXEUR&symbols=BTCUSD&symbols=ETHUSD&symbols=XRPUSD&symbols=LTCUSD&symbols=ADAUSD&symbols=BRNUSD&symbols=NGCUSD`
  //     );
  //     res.json(formatData(pricesData));
  //   } catch (error) {
  //     res.status(500).json({ error: "Failed to fetch prices data" });
  //   }
  // } catch (error) {
  //   res.status(500).json({ error: "Failed to fetch prices data" });
  // }
});

app.listen(process.env.PORT || 3001, function () {
  console.log(
    "Express server listening on port %d in %s mode",
    this.address().port,
    app.settings.env
  );

  const port = this.address().port;
  const mode = app.settings.env;
  const host = `http://localhost:${port}`; // Replace with your host if not localhost

  // Logging the full URL
  console.log(`Express server listening on: ${host}`);
});
