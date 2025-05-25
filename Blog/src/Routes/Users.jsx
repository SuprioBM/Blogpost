import { useEffect, useState, useRef } from "react";
import { api } from "../Api/api";
import useAuth from "../context/useAuth";
import io from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
  withCredentials: true,
});

const Users = () => {
  const [users, setUsers] = useState([]);
  const { user } = useAuth(); // Get logged-in user info
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatWith, setChatWith] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({}); // Track unread messages by user
  const messagesEndRef = useRef(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [, setRender] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get("/users");
        const filteredUsers = response.data.filter(
          (people) => people.username !== user
        );

        setUsers(filteredUsers);

        // ✅ Fix: Load unread messages immediately on refresh
        const storedUnreadMessages =
          JSON.parse(localStorage.getItem("unreadMessages")) || {};

        console.log("Loaded unread messages:", storedUnreadMessages);

        setUnreadMessages(storedUnreadMessages);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    if (user) {
      fetchUsers();
    }
  }, [user]);




  useEffect(() => {
    if (!user) return;

    // Emit online status when user joins
    socket.emit("user_online", user);

    // Listen for user online events
    socket.on("user_online", (onlineUserList) => {
      setOnlineUsers(onlineUserList);
    });

    // Listen for user offline events
    socket.on("user_offline", (offlineUser) => {
      setOnlineUsers((prev) => prev.filter((u) => u !== offlineUser));
    });

    return () => {
      // Notify server that the user is offline before unmounting
      socket.emit("user_offline", user);
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [user]);


useEffect(() => {
  if (user && users.length > 0) {
    // Iterate over the users and create a room for each user with the logged-in user
    users.forEach((selectedUser) => {
      if (selectedUser.username !== user) {
        socket.emit("join_room", {
          sender: user,
          receiver: selectedUser.username,
        });
      }
    });
  }
}, [users, user]);


const handleChatClick = async (selectedUser) => {
  // Reset the unread message count for the selected user before opening the chat
  setUnreadMessages((prev) => {
    const updatedUnread = { ...prev };
    updatedUnread[selectedUser] = 0; // Reset unread count for the selected user

    // Store in localStorage immediately
    localStorage.setItem("unreadMessages", JSON.stringify(updatedUnread));

    return updatedUnread;
  });

  setChatWith(selectedUser);
  setIsChatOpen(true);
  await fetchMessages(selectedUser);n
};





  // Fetch messages between the logged-in user and the selected user
  const fetchMessages = async (selectedUser) => {
    try {
      const response = await api.get("/messages", {
        params: { user1: user, user2: selectedUser },
      });
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Send a message
  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!user || !chatWith) {
      console.error("Sender or receiver is not defined!");
      return;
    }

    try {
      const messageData = {
        sender: user,
        receiver: chatWith,
        message: newMessage,
        timestamp: new Date(),
      };

      // Emit message via socket only once
      socket.emit("send_message", messageData);

      // Clear the message input field
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

useEffect(() => {
  const handleReceiveMessage = (data) => {
    console.log(
      "📩 Message received from:",
      data.sender,
      "Message:",
      data.message
    );

    setMessages((prevMessages) => [...prevMessages, data]);

    // 🚀 Fix: Ensure unread messages count updates even if chatbox was never opened
    setUnreadMessages((prev) => {
      if (!isChatOpen || chatWith !== data.sender) {
        const updatedUnread = {
          ...prev,
          [data.sender]: (prev[data.sender] || 0) + 1,
        };

        // Store in localStorage immediately
        localStorage.setItem("unreadMessages", JSON.stringify(updatedUnread));

        return updatedUnread;
      }
      return prev;
    });
  };

  socket.on("receive_message", handleReceiveMessage);

  return () => {
    socket.off("receive_message", handleReceiveMessage);
  };
}, [chatWith, isChatOpen]);


useEffect(() => {
  setRender((prev) => !prev); // Toggle state to force a re-render
}, [unreadMessages]);


  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const closeChatBox = () => {
    setIsChatOpen(false);
  };

  return (
    <div className="p-10">
      <h2 className="text-3xl font-bold mb-6">Users List</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {users.map((people) => (
          <div
            key={people._id}
            className="bg-black p-4 rounded-lg shadow-md flex items-center gap-4 relative"
          >
            <img
              src={people.img || "/default-avatar.png"}
              alt={people.username}
              className="w-12 h-12 rounded-full object-cover"
            />
            <p className="text-lg font-semibold">{people.username}</p>
            {unreadMessages[people.username] > 0 && (
              <span className="absolute top-0 right-0 bg-red-500 text-black text-xs px-2 py-1 rounded-full">
                {unreadMessages[people.username] || 0}
              </span>
            )}
            {onlineUsers.includes(people.username) && (
              <div className="absolute top-0 right-0 bg-green-500 w-3 h-3 rounded-full"></div>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6 ml-auto"
              onClick={() => handleChatClick(people.username)}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
              />
            </svg>
          </div>
        ))}
      </div>

      {/* Chatbox */}
      {isChatOpen && (
        <div className="fixed bottom-10 right-10 bg-blur p-4 w-80 rounded-lg shadow-lg border">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Chat with {chatWith}</h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="size-6"
              onClick={() => closeChatBox()}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </div>
          <div className="h-60 overflow-y-auto mt-3 text-black">
            {messages.map((msg, idx) => (
              <div
                key={msg._id || idx}
                className={`p-2 mb-2`}
              >
                <p className="font-semibold">{msg.sender}</p>
                <p className="text-black">{msg.message}</p>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2 mt-2">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Type a message..."
            />
            <button
              onClick={handleSendMessage}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
