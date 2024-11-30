import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [symbol, setSymbol] = useState('');
  const [stockData, setStockData] = useState(null);
  const [allStocks, setAllStocks] = useState([]);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5000/api/stocks'; // Backend API URL

  // Fetch all stock data
  useEffect(() => {
    fetchAllStocks();
  }, []);

  const fetchAllStocks = async () => {
    try {
      const response = await axios.get(API_BASE_URL);
      setAllStocks(response.data);
    } catch (err) {
      console.error('Error fetching all stocks:', err.message);
      setError('Failed to fetch stock data from the database.');
    }
  };

  // Fetch stock data for a specific symbol
  const fetchStock = async () => {
    if (!symbol.trim()) {
      setError('Please enter a valid stock symbol.');
      return;
    }

    try {
      setError('');
      const response = await axios.get(`${API_BASE_URL}/${symbol}`);
      setStockData(response.data);
      fetchAllStocks(); // Refresh the list after adding the stock
    } catch (err) {
      console.error('Error fetching stock:', err.message);
      setError('Failed to fetch stock data. Ensure the stock symbol is valid.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Stock Price Tracker</h1>
        <div className="input-container">
          <input
            type="text"
            placeholder="Enter stock symbol (e.g., AAPL)"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
          />
          <button onClick={fetchStock}>Get Stock Price</button>
        </div>
        {error && <p className="error">{error}</p>}
        {stockData && (
          <div className="stock-data">
            <h2>Stock Data</h2>
            <p><strong>Symbol:</strong> {stockData.symbol}</p>
            <p><strong>Price:</strong> ${stockData.price}</p>
          </div>
        )}
        <div className="all-stocks">
          <h2>All Stored Stocks</h2>
          {allStocks.length > 0 ? (
            <table>
              <thead>
                <tr>
                  <th>Symbol</th>
                  <th>Company Name</th>
                  <th>Price</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {allStocks.map((stock) => (
                  <tr key={stock._id}>
                    <td>{stock.symbol}</td>
                    <td>{stock.companyName}</td>
                    <td>${stock.price}</td>
                    <td>{new Date(stock.date).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p>No stocks stored in the database.</p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
