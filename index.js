import express, { json } from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors());
app.use(express.json());

const port = 3001;

const splitPrices = {
  AMZN: 10,
  TSLA: 10,
  AAPL: 10,
  GOOGL: 10,
  NVDA: 10,
  USDJPY: 100,
  EURUSD: 10000,
  GBPUSD: 10000,
  USDCAD: 10000,
  EURGBP: 10000,
  XAUUSD: 10,
  XAGUSD: 100,
  WTIUSD: 100,
  BRNUSD: 100,
  NGCUSD: 4,
  SPXUSD: 10,
  DJIUSD: 10,
  NDXUSD: 10,
  FTSGBP: 10,
  DAXEUR: 10,
  BTCUSD: 100,
  ETHUSD: 100,
  XRPUSD: 10000,
  LTCUSD: 10000,
  ADAUSD: 10000,
};
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
    const splitDifference = (ask - bid) * splitPrices[item.symbol];
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

// Helper function to calculate percentage change
function calculatePercentageChange(openPrice, closePrice) {
  return 100 * ((closePrice - openPrice) / openPrice);
}

let previousPrices = {};

// app.get("/spreads", async (req, res) => {
//   await fetch(
//     "http://212.117.171.68:5000/SymbolParamsMany?id=12a9d189-4513-4438-999f-86429849fe5b&symbols=AMZN&symbols=TSLA&symbols=AAPL&symbols=GOOGL&symbols=NVDA&symbols=USDJPY&symbols=EURUSD&symbols=GBPUSD&symbols=USDCAD&symbols=EURGBP&symbols=XAUUSD&symbols=XAGUSD&symbols=WTIUSD&symbols=SPXUSD&symbols=DJIUSD&symbols=NDXUSD&symbols=FTSGBP&symbols=DAXEUR&symbols=BTCUSD&symbols=ETHUSD&symbols=XRPUSD&symbols=LTCUSD&symbols=ADAUSD&symbols=BRNUSD&symbols=NGCUSDlimit=10000"
//   )
//     .then((response) => response.text())
//     .then((result) => {
//       // console.log(result);
//       result = JSON.parse(result);

//       const symbols = [];
//       const resultMap = result.map((item) => {
//         return {
//           [item.symbol]: item.symbolInfo.digits,
//         };
//       });
//       res.json(resultMap);
//       // result.forEach((item) => {
//       //   console.log(item);
//       // });
//     })
//     .catch((error) => console.error(error));
//   // try {
//   // } catch (error) {
//   //   // res.send('error')
//   // }
// });

app.get("/prices", async (req, res) => {
  const url =
    "http://212.117.171.68:5000/Connect?user=100476&password=T%2BDmV0Kk&host=57.128.140.226&port=443";

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: { "Content-Type": "text/plain" },
    });
    if (!response.ok) {
      throw new Error("Network response was not ok " + response.statusText);
    }

    const textData = await response.text();

    const pricesData = await fetchData(
      `http://212.117.171.68:5000/GetQuoteMany?id=${textData}&symbols=AMZN&symbols=TSLA&symbols=AAPL&symbols=GOOGL&symbols=NVDA&symbols=USDJPY&symbols=EURUSD&symbols=GBPUSD&symbols=USDCAD&symbols=EURGBP&symbols=XAUUSD&symbols=XAGUSD&symbols=WTIUSD&symbols=SPXUSD&symbols=DJIUSD&symbols=NDXUSD&symbols=FTSGBP&symbols=DAXEUR&symbols=BTCUSD&symbols=ETHUSD&symbols=XRPUSD&symbols=LTCUSD&symbols=ADAUSD&symbols=BRNUSD&symbols=NGCUSD`
    );

    const openCloseData = await fetchData(
      `http://212.117.171.68:5000/PriceHistoryTodayMany?id=${textData}&symbols=AMZN&symbols=TSLA&symbols=AAPL&symbols=GOOGL&symbols=NVDA&symbols=USDJPY&symbols=EURUSD&symbols=GBPUSD&symbols=USDCAD&symbols=EURGBP&symbols=XAUUSD&symbols=XAGUSD&symbols=WTIUSD&symbols=SPXUSD&symbols=DJIUSD&symbols=NDXUSD&symbols=FTSGBP&symbols=DAXEUR&symbols=BTCUSD&symbols=ETHUSD&symbols=XRPUSD&symbols=LTCUSD&symbols=ADAUSD&symbols=BRNUSD&symbols=NGCUSD&timeFrame=1440`
    );

    let dataObject = formatData(pricesData);

    // Add dailyChange to the dataObject
    openCloseData.forEach(({ symbol, bars }) => {
      const lastBar = bars[bars.length - 1];
      const dailyChange = calculatePercentageChange(
        lastBar.openPrice,
        lastBar.closePrice
      );
      if (dataObject[symbol]) {
        dataObject[symbol].dailyChange = dailyChange.toFixed(2) + "%";
      }
    });

    // Add price direction indicator
    for (const symbol in dataObject) {
      const currentPrice = dataObject[symbol].bid;
      const dailyChange = dataObject[symbol].dailyChange;

      // Determine price direction (up, down, unchanged)
      if (previousPrices[symbol] !== undefined) {
        if (currentPrice > previousPrices[symbol].bid) {
          dataObject[symbol].biddirection = "up";
        } else if (currentPrice < previousPrices[symbol].bid) {
          dataObject[symbol].biddirection = "down";
        } else {
          dataObject[symbol].biddirection = "unchanged";
        }
      } else {
        dataObject[symbol].biddirection = "new"; // First-time fetch, no previous data
      }
      // Determine price direction (up, down, unchanged)
      if (previousPrices[symbol] !== undefined) {
        if (dailyChange > previousPrices[symbol].dailyChange) {
          dataObject[symbol].percentagedirection = "up";
        } else if (dailyChange < previousPrices[symbol].dailyChange) {
          dataObject[symbol].percentagedirection = "down";
        } else {
          dataObject[symbol].percentagedirection = "unchanged";
        }
      } else {
        dataObject[symbol].percentagedirection = "new"; // First-time fetch, no previous data
      }

      // Store the current price for the next comparison
      previousPrices[symbol] = currentPrice;
    }

    res.json(dataObject);
  } catch (error) {
    console.error("There was a problem with the fetch operation:", error);
    res.status(500).json({ error: "Failed to fetch prices data" });
  }
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
