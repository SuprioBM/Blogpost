const { Blog } = require("../Models/schema");
const Cloudinary = require("../cloudinary/Cloudinary");

// Blog creation function
const BlogCreate = async (req, res) => {
  const username = req.cookies.user;
  try {
    const newBlogPost = new Blog({
      title: req.body.title,
      body: req.body.content,
      images: req.body.images,
      videos: req.body.videos,
      user: username,
    });

    await newBlogPost.save();

    res
      .status(200)
      .json({ message: "Blog post created successfully", blog: newBlogPost });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating blog post", error });
  }
};

// Fetch all blogs
const fetchBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .select(
        "title body images videos user createdAt updatedAt _id __v id like comment likedUsers"
      )
      .lean(); // Optimize for read performance

    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error);
    res.status(500).json({ message: "Error fetching blogs" });
  }
};

// Fetch a single blog by ID
const fetchBlog = async (req, res) => {
  const { id } = req.params;

  try {
    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }
    res.status(200).json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error);
    res.status(500).json({ message: "Error fetching blog" });
  }
};

// Like or unlike a blog post
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const username = req.cookies.user; // Assuming you have the username from authentication

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Check if the user has already liked the post
    const hasLiked = blog.likedUsers.includes(username);

    if (hasLiked) {
      // Unlike the post: Decrease like count and remove the user from likedUsers
      blog.like -= 1;
      blog.likedUsers = blog.likedUsers.filter(
        (user) => user.toString() !== username
      );
    } else {
      // Like the post: Increase like count and add the user to likedUsers
      blog.like += 1;
      blog.likedUsers.push(username);
    }

    await blog.save(); // Save the updated blog

    // Return the updated blog state
    const updatedBlog = {
      _id: blog._id,
      likeCount: blog.like,
      likedUsers: blog.likedUsers,
      likedByUser: blog.likedUsers.includes(username), // Return if the user liked it
    };

    res.status(200).json(updatedBlog); // Return the updated blog state
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { usercomment } = req.body;
    const username = req.cookies.user;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    } else {
      blog.comment.push({ user: username, comment: usercomment });
      await blog.save();
      res.status(200).json(blog.comment);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}


// Export the functions
module.exports = { BlogCreate, fetchBlogs, fetchBlog, likeBlog, addComment };
