require("dotenv").config();

const mongoose = require("mongoose");

mongoose
.connect(process.env.MONGO_URI)
.then(()=> console.log("DATABASE CONNECTED"))
.catch((err) => console.log("CONNECTION ERROR!!", err))