// Create web server
const express = require('express');
const app = express();

// Create HTTP server
const http = require('http');
const server = http.createServer(app);

// Create WebSockets server
const WebSocket = require('ws');
const wss = new WebSocket.Server({ server });

// Create a new comment
const comment = (text, user) => ({
  id: Date.now(),
  text,
  user,
  timestamp: new Date(),
});

// Store comments
const comments = [];

// Handle new connections to the WebSocket server
wss.on('connection', (ws) => {
  // Send existing comments to the newly connected client
  ws.send(JSON.stringify(comments));

  // Handle incoming messages from the client
  ws.on('message', (message) => {
    const { type, data } = JSON.parse(message);

    // Handle new comments
    if (type === 'new') {
      const { text, user } = data;
      const newComment = comment(text, user);
      comments.push(newComment);

      // Broadcast the new comment to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify([newComment]));
        }
      });
    }
  });
});

// Serve static assets
app.use(express.static('public'));

// Start the server
server.listen(3000, () => {
  console.log('Listening on http://localhost:3000');
});