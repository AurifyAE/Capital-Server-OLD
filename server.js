const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const axios = require('axios');

const PORT = process.env.PORT || 4000;

const API_ENDPOINT = 'https://api-capital.backend-capital.com/api/v1/markets?searchTerm=GOLD';
const HEADERS = {
    'X-SECURITY-TOKEN': 'FDrHsEu8nGzH8XyYkRiPZmQsVjI1Xb3',
    'CST': 'z9FXyhK7MU9EYekWOZZmKJP9'
};

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: '*', // Allow requests from any origin
    methods: ['GET', 'POST'] // Allow only GET and POST requests
  }
});

// Function to fetch market data from the API and emit it to clients
async function fetchMarketDataAndEmit() {
    try {
        const response = await axios.get(API_ENDPOINT, { headers: HEADERS });
        const marketData = response.data;
        // console.log(marketData);
        
        io.emit('goldValue', marketData.markets[0]); // Emitting market data to all connected clients
    } catch (error) {
        console.error('Error fetching market data:', error.message);
    }
}

// Function to fetch data at regular intervals and emit it to clients
function fetchContinuously(interval) {
    fetchMarketDataAndEmit(); // Initial call
    setInterval(fetchMarketDataAndEmit, interval);
}

io.on('connection', (socket) => {
  console.log('A client connected');
  // You can perform additional actions upon client connection if needed
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  // Start fetching data continuously and emit to clients every 500 milliseconds
  fetchContinuously(200);
});
