import { useEffect, useState, useRef } from "react";
import { api } from "../Api/api";
import useAuth from "../context/useAuth";
import io from "socket.io-client";
import { motion, AnimatePresence } from "framer-motion";
import NoUserAbout from "../Components/NoUserAbout";

const socket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:3000", {
  withCredentials: true,
});

const Users = () => {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatWith, setChatWith] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [unreadMessages, setUnreadMessages] = useState({});
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
        const storedUnreadMessages =
          JSON.parse(localStorage.getItem("unreadMessages")) || {};
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
    socket.emit("user_online", user);
    socket.on("user_online", (onlineUserList) => {
      setOnlineUsers(onlineUserList);
    });
    socket.on("user_offline", (offlineUser) => {
      setOnlineUsers((prev) => prev.filter((u) => u !== offlineUser));
    });
    return () => {
      socket.emit("user_offline", user);
      socket.off("user_online");
      socket.off("user_offline");
    };
  }, [user]);

  useEffect(() => {
    if (user && users.length > 0) {
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
    setUnreadMessages((prev) => {
      const updatedUnread = { ...prev };
      updatedUnread[selectedUser] = 0;
      localStorage.setItem("unreadMessages", JSON.stringify(updatedUnread));
      return updatedUnread;
    });
    setChatWith(selectedUser);
    setIsChatOpen(true);
    await fetchMessages(selectedUser);
  };

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

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    if (!user || !chatWith) return;

    try {
      const messageData = {
        sender: user,
        receiver: chatWith,
        message: newMessage,
        timestamp: new Date(),
      };
      socket.emit("send_message", messageData);
      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  useEffect(() => {
    const handleReceiveMessage = (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
      setUnreadMessages((prev) => {
        if (!isChatOpen || chatWith !== data.sender) {
          const updatedUnread = {
            ...prev,
            [data.sender]: (prev[data.sender] || 0) + 1,
          };
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
    setRender((prev) => !prev);
  }, [unreadMessages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isChatOpen]);

  const closeChatBox = () => {
    setIsChatOpen(false);
  };

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen text-pink-500 text-xl px-4">
        <NoUserAbout />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 md:p-12 text-white mt-16 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <h2 className="text-4xl font-extrabold mb-12 text-center tracking-widest text-indigo-400 drop-shadow-lg">
        🌐 Connect with Users
      </h2>

      <motion.div
        layout
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl mx-auto"
      >
        {users.map((people) => (
          <motion.div
            key={people._id}
            layout
            whileHover={{ scale: 1.05 }}
            className="relative bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 rounded-2xl shadow-lg p-6 flex items-center gap-5 cursor-pointer border-2 border-indigo-500 hover:border-indigo-400 transition-shadow duration-300"
            onClick={() => handleChatClick(people.username)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && handleChatClick(people.username)}
            aria-label={`Chat with ${people.username}`}
          >
            <img
              src={people.img || "/default-avatar.png"}
              alt={`${people.username}'s avatar`}
              className="w-16 h-16 rounded-full object-cover border-4 border-indigo-400 shadow-md"
            />
            <div className="flex flex-col">
              <p className="text-2xl font-semibold text-indigo-300 tracking-wide">
                {people.username}
              </p>
              <span
                className={`text-sm font-medium ${
                  onlineUsers.includes(people.username)
                    ? "text-green-400"
                    : "text-gray-400"
                }`}
              >
                {onlineUsers.includes(people.username) ? "Online" : "Offline"}
              </span>
            </div>

            {unreadMessages[people.username] > 0 && (
              <span className="absolute top-3 right-4 bg-red-600 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg animate-pulse">
                {unreadMessages[people.username]}
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>

      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ duration: 0.4 }}
            className="fixed bottom-6 right-6 max-w-[95vw] sm:max-w-[420px] w-full bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-900 backdrop-blur-md border border-indigo-600 rounded-3xl shadow-2xl flex flex-col max-h-[85vh]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="chat-title"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-indigo-700 rounded-t-3xl">
              <h3
                id="chat-title"
                className="text-2xl font-bold text-indigo-300 tracking-wide select-none"
              >
                💬 Chat with {chatWith}
              </h3>
              <button
                onClick={closeChatBox}
                className="text-indigo-400 hover:text-indigo-200 transition text-2xl focus:outline-none"
                aria-label="Close chat"
              >
                ✖
              </button>
            </div>

            <div className="flex-1 px-6 py-4 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-indigo-900">
              {messages.map((msg, idx) => {
                const isSender = msg.sender === user;
                return (
                  <motion.div
                    layout
                    key={msg._id || idx}
                    className={`flex flex-col max-w-[75%] ${
                      isSender ? "ml-auto items-end" : "mr-auto items-start"
                    }`}
                  >
                    <div
                      className={`px-5 py-3 rounded-3xl shadow-lg whitespace-pre-wrap break-words ${
                        isSender
                          ? "bg-indigo-600 text-white rounded-br-none"
                          : "bg-indigo-700 text-indigo-100 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm font-semibold mb-1 tracking-wide select-none">
                        {isSender ? "You" : msg.sender}
                      </p>
                      <p className="text-base leading-relaxed">{msg.message}</p>
                    </div>
                    <span className="text-xs text-indigo-400 mt-1 select-none">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="px-6 py-4 border-t border-indigo-700 flex gap-4 rounded-b-3xl bg-indigo-900">
              <textarea
                rows={1}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-1 resize-none rounded-2xl bg-indigo-800 text-indigo-200 placeholder-indigo-400 p-4 focus:outline-none focus:ring-2 focus:ring-indigo-400 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-indigo-900"
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                aria-label="Type your message"
              />
              <button
                onClick={handleSendMessage}
                className="bg-indigo-500 hover:bg-indigo-600 rounded-2xl px-6 py-3 font-semibold transition-shadow shadow-lg text-white flex items-center justify-center"
                aria-label="Send message"
              >
                ➤
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Users;
