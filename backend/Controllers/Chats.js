const { UserInfo, Message } = require("../Models/schema");


const getUsers = async (req, res) => {
  try {
    const users = await UserInfo.find().select("username img");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
};

const getMessages = async (req, res) => {
  const { user1, user2 } = req.query;
  try {
    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 }); // Sort messages in ascending order

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: "Error fetching messages" });
  }
};

const sendMessage = async (req, res) => {
  const { sender, receiver, message } = req.body; // Get message data from the request body
  try {
    const newMessage = new Message({ sender, receiver, message });
    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ error: "Error sending message" });
  }
};

module.exports = {getUsers,getMessages,sendMessage};
