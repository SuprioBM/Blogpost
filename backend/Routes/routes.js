const express = require("express");
const router = express.Router();
const { SignUp, SignIn, SignOut,RefreshToken,authenticateToken } = require("../Controllers/controllers");
const { UpdateDetails, getUserDetails, getProfileImage} = require("../Controllers/UserDetails");
const multer = require("multer");
const { getUsers, getMessages, sendMessage} = require("../Controllers/Chats");
const {BlogCreate, fetchBlogs, fetchBlog, likeBlog, addComment} = require('../Controllers/Blog')

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


//SignUp
router.post('/signup',SignUp)

//SignIn
router.post('/signin',SignIn)

//SignOut
router.post('/signout',SignOut)

//RefreshTokens
router.post('/refresh',RefreshToken)

//profile
router.get('/profile',authenticateToken, getUserDetails)

//ProfileUpdate
router.post('/user_details',upload.single("file"),UpdateDetails)

//Blog Create
router.post('/blogcreate',BlogCreate)


//Blogs Data
router.get('/fetchblogs',fetchBlogs)

//Blog Data
router.get('/blogs/:id',fetchBlog)

//Like Blog
router.put('/like/:id',likeBlog)

//Comment Blog
router.post('/blog/comments/:id',addComment)

//get profile image
router.get('/users/:username',getProfileImage)

//get All Users
router.get('/users',getUsers)


// Get messages between two users
router.get("/messages", getMessages);

// Send a new message
router.post("/messages", sendMessage);

module.exports = router;