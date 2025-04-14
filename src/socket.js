const socketIO = require('socket.io');
const Chat = require('./models/chat');
const { Op } = require('sequelize');

let io;
const connectedUsers = new Map();

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3001", // Specific origin instead of *
        methods: ["GET", "POST"],
        allowedHeaders: ["*"], // Allow all headers
        credentials: true
      },
      allowEIO3: true,
      pingTimeout: 120000,
      pingInterval: 30000,
      transports: ['polling'],
      path: '/socket.io/',
      connectTimeout: 60000,
      perMessageDeflate: false // Disable compression which can cause issues
    });

    // Add global socket.io error handler to debug issues
    io.engine.on("connection_error", (err) => {
      console.error("Connection error:", err.req, err.code, err.message, err.context);
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Send immediate response to client to confirm connection
      socket.emit('connectionConfirmed', { id: socket.id, status: 'connected' });

      socket.on('join', (userData) => {
        if (!userData || !userData.id) {
          console.error('Invalid user data in join event');
          return;
        }
        
        console.log('User joined:', userData.id, userData.name);
        
        // Assign user to socket
        socket.userData = userData;
        connectedUsers.set(socket.id, userData);
        
        // Each user joins their own room (using ID as room name)
        socket.join(userData.id.toString());
        
        // Broadcast updated online user list
        io.emit('userList', Array.from(connectedUsers.values()));
        
        // Send confirmation to client
        socket.emit('joinConfirmed', { status: 'joined', userId: userData.id });
      });

      socket.on('sendMessage', async (messageData) => {
        try {
          const { sender_id, receiver_id, message } = messageData;
          
          if (!sender_id || !receiver_id || !message) {
            console.error('Invalid message data:', messageData);
            return;
          }
          
          console.log('Message received:', { sender_id, receiver_id, message });
          
          // Save to database
          const newMessage = await Chat.create({
            sender_id,
            receiver_id,
            message,
            timestamp: new Date()
          });
          
          // Convert data to match client expectations
          const messageToSend = {
            id: newMessage.id,
            sender_id,
            receiver_id,
            message,
            timestamp: newMessage.timestamp,
            read: false
          };
          
          // Send message to recipient (if online)
          console.log('Emitting to room:', receiver_id.toString());
          socket.to(receiver_id.toString()).emit('receiveMessage', messageToSend);
          
          // Send confirmation to sender
          socket.emit('messageSent', messageToSend);
        } catch (error) {
          console.error('Error processing message:', error);
          socket.emit('messageError', { error: 'Failed to send message' });
        }
      });

      // Handle ping event for connection testing
      socket.on('ping', () => {
        socket.emit('pong', { timestamp: new Date().toISOString() });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        
        // Remove user from online list
        connectedUsers.delete(socket.id);
        
        // Broadcast updated online list
        io.emit('userList', Array.from(connectedUsers.values()));
      });
    });

    return io;
  },
  
  getIO: () => {
    if (!io) {
      throw new Error('Socket.io not initialized!');
    }
    return io;
  },
  
  getConnectedUsers: () => {
    return connectedUsers;
  }
};