const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const route = require("./Routes/routes");
const db = require("./DB/dbConnection");

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL, // Ensure this matches the frontend URL
    credentials: true,
  },
});

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Routes
app.use("/", route);

// Setup socket after all middleware and routes are set
require("./socket/socket")(io); // This uses the io instance from the server

server.listen(3000, () => {
  console.log("Server is listening at 3000");
});
