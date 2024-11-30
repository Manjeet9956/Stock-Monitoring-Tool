const express = require('express');
const axios = require('axios');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const STOCK_API_KEY = process.env.STOCK_API_KEY; // Obtain an API key from Alpha Vantage or another provider

// MongoDB connection
const MONGO_URI = 'mongodb+srv://av2533095:kishan%40123@cluster0.628zs.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose
  .connect(MONGO_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Stock Schema and Model
const stockSchema = new mongoose.Schema({
  symbol: String,
  companyName: String,
  price: Number,
  date: { type: Date, default: Date.now },
});

const Stock = mongoose.model('Stock', stockSchema);

// Route to fetch stock data from an API
app.get('/api/stocks/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;

    const response = await axios.get(`https://www.alphavantage.co/query`, {
      params: {
        function: 'TIME_SERIES_INTRADAY',
        symbol: symbol,
        interval: '5min',
        apikey: STOCK_API_KEY,
      },
    });

    const stockData = response.data['Time Series (5min)'];
    if (!stockData) {
      return res.status(404).json({ error: 'Stock data not found or API limit reached' });
    }

    const latestTimestamp = Object.keys(stockData)[0];
    const stockPrice = stockData[latestTimestamp]['1. open'];

    // Save stock data to the database
    const stock = new Stock({
      symbol,
      companyName: symbol, // Placeholder for company name
      price: stockPrice,
    });

    await stock.save();

    res.json({ symbol, price: stockPrice });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Route to fetch all stock data from DB
app.get('/api/stocks', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
