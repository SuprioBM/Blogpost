const mongoose = require("mongoose");

// Users Schema
const users = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  tokens: {
    type: String,
  },
});

// Middleware for cascading delete (when a User is deleted, their associated UserInfo and Blogs are also deleted)
users.pre("deleteOne", { document: true, query: false }, async function (next) {
  const user = this;
  try {
    // Delete the associated UserInfo using the username
    await mongoose.model("UserInfo").deleteOne({ username: user.username });

    // Delete the associated Blog posts using the username (optional, depending on use case)
    await mongoose.model("Blog").deleteMany({ user: user._id });

    next();
  } catch (error) {
    next(error);
  }
});

// UserInfo Schema
const userInfoSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      ref: "Users",
    },
    about: {
      type: String,
      required: true,
    },
    img: {
      type: String,
    },
    skill: {
      type: [String],
      default: [],
    },
    edu: {
      type: [String],
      default: [],
    },
    exp: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Blog Schema
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    body: { type: [mongoose.Schema.Types.Mixed], required: true },
    images: [{ type: String }], // Array of image URLs
    videos: [{ type: String }], // Array of video URLs
    user: {
      type: String,
      ref: "Users",
      required: true,
    }, // Foreign key reference to User
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    like: { type: Number, default: 0 },
    likedUsers: [{ type: String, ref: "Users" }],
    comment: [
      {
        user: { type: String, required: true },
        comment: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to automatically update the `updatedAt` field
blogSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});


const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String, // Refers to the User model
      required: true,
      ref: "User", // Reference to the User model
    },
    receiver: {
      type: String, // Refers to the User model
      required: true,
      ref: "User", // Reference to the User model
    },
    message: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    read: {
      type: Boolean,
      default: false, // Set to true when the receiver has read the message
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt
  }
);



const UserInfo = mongoose.model("UserInfo", userInfoSchema);
const User = mongoose.model("Users", users);
const Blog = mongoose.model("Blog", blogSchema);
const Message = mongoose.model("Message", messageSchema);

module.exports = { User, UserInfo, Blog, Message };
