const app = require('./app');
const http = require('http');
const socketIO = require('socket.io');
const socketModule = require('./socket');
require('dotenv').config();

// Create the HTTP server
const server = http.createServer(app);

// Initialize socket.io using the socket module
const io = socketModule.init(server);

// Make io available to our routes
app.set('io', io);

const PORT = process.env.PORT || 3000;

// Start the server
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO listening on port ${PORT}`);
});