const { Message } = require("../Models/schema");

const setupSocket = (io) => {
  // Map to store the online users with their socket IDs
  const onlineUsers = {};

  io.on("connection", (socket) => {
    console.log("New client connected: " + socket.id);

    // Listen for the 'user_online' event when a user connects
    socket.on("user_online", (username) => {
      // Store the socket ID for the user
      onlineUsers[username] = socket.id;
      console.log(`${username} is online`);

      // Emit the 'user_online' event to notify other clients
      io.emit("user_online", Object.keys(onlineUsers)); // Notify everyone except the sender
    });

    // Listen for message sending
    socket.on("send_message", async (data) => {
      const { sender, receiver, message } = data;
      const roomId = [sender, receiver].sort().join("_");
      console.log(sender, receiver, message);

      if (!sender || !receiver || !message) {
        console.error("Missing required fields: sender, receiver, or message");
        return; // Prevent further execution if data is incomplete
      }

      // Save message to the database
      try {
        const newMessage = new Message({
          sender,
          receiver,
          message,
        });
        await newMessage.save();

        // Emit the message to the receiver
        io.to(roomId).emit("receive_message", {
          sender,
          message,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error("Error saving message:", error);
      }
    });

    // Join a room for the receiver to receive messages
  socket.on("join_room", ({ sender, receiver }) => {
    const roomId = [sender, receiver].sort().join("_"); // Unique room ID
    socket.join(roomId);
  });

    // Listen for user disconnections
  socket.on("disconnect", () => {
    let disconnectedUser = null;
    for (let username in onlineUsers) {
      if (onlineUsers[username] === socket.id) {
        disconnectedUser = username;
        delete onlineUsers[username]; // Remove user from online list
        break;
      }
    }

    if (disconnectedUser) {
      io.emit("user_offline", disconnectedUser); // Notify clients
    }
    console.log(`Client disconnected: ${socket.id}`);
  });
  });
};

module.exports = setupSocket;
