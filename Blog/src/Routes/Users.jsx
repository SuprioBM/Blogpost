import { useEffect, useState, useRef } from "react";
import { api } from "../Api/api";
import useAuth from "../context/useAuth";
import io from "socket.io-client";

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

  return (
    <div className="min-h-screen p-6 md:p-10 text-white">
      <h2 className="text-4xl font-bold mb-8 text-center tracking-wide">
        Users List
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {users.map((people) => (
          <div
            key={people._id}
            className="relative bg-gray-800 rounded-xl shadow-lg p-5 flex items-center gap-4 hover:bg-gray-700 transition cursor-pointer"
            onClick={() => handleChatClick(people.username)}
          >
            <img
              src={people.img || "/default-avatar.png"}
              alt={people.username}
              className="w-14 h-14 rounded-full object-cover border-2 border-red-500"
            />
            <div className="flex flex-col">
              <p className="text-xl font-semibold">{people.username}</p>
              {onlineUsers.includes(people.username) ? (
                <span className="text-green-400 text-sm font-medium">
                  Online
                </span>
              ) : (
                <span className="text-gray-400 text-sm font-medium">
                  Offline
                </span>
              )}
            </div>

            {/* Unread badge */}
            {unreadMessages[people.username] > 0 && (
              <span className="absolute top-2 right-3 bg-red-500 text-black text-xs px-2 py-1 rounded-full font-semibold select-none">
                {unreadMessages[people.username]}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Chatbox */}
      {isChatOpen && (
        <div className="fixed bottom-5 right-5 max-w-[50vh] w-full bg-gray-900/90 backdrop-blur-md border border-gray-700 rounded-2xl shadow-xl flex flex-col max-h-[80vh]">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-700 rounded-t-2xl">
            <h3 className="text-2xl font-semibold text-indigo-400">
              Chat with {chatWith}
            </h3>
            <button
              onClick={closeChatBox}
              aria-label="Close chat"
              className="text-gray-400 hover:text-indigo-400 transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-800">
            {messages.map((msg, idx) => {
              const isSender = msg.sender === user;
              return (
                <div
                  key={msg._id || idx}
                  className={`flex flex-col max-w-[75%] ${
                    isSender ? "ml-auto items-end" : "mr-auto items-start"
                  }`}
                >
                  <div
                    className={`px-4 py-2 rounded-2xl break-words whitespace-pre-wrap ${
                      isSender
                        ? "bg-indigo-600 text-white rounded-br-none"
                        : "bg-gray-700 text-gray-200 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm font-semibold mb-1">
                      {isSender ? "You" : msg.sender}
                    </p>
                    <p className="text-base">{msg.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-700 flex gap-3 rounded-b-2xl bg-gray-800">
            <textarea
              rows={1}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 resize-none rounded-xl bg-gray-700 text-white placeholder-gray-400 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-gray-800"
              placeholder="Type a message..."
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <button
              onClick={handleSendMessage}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-5 py-3 font-semibold transition"
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
