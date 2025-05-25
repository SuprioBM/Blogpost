import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../Api/api";

// Like Blog
export const likeBlog = createAsyncThunk(
  "blog/likeBlog",
  async (blogId, { getState, rejectWithValue }) => {
    try {
      const response = await api.put(
        `/like/${blogId}`,
        {},
        { withCredentials: true }
      );
      return response.data; // API should return the updated blog with likeCount, likedUsers, and likedByUser
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Add Comment
export const addComment = createAsyncThunk(
  "blog/addComment",
  async ({ blogId, usercomment }, { rejectWithValue }) => {
    try {
      const response = await api.post(
        `/blog/comments/${blogId}`,
         {usercomment} ,
        { withCredentials: true }
      );
      return { blogId, comment: response.data }; // Assuming the response returns the added comment
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error adding comment"
      );
    }
  }
);

const blogSlice = createSlice({
  name: "blog",
  initialState: {
    blog: [], // Array of all blogs
    likedBlogs: {}, // Stores liked blogs and their like status
    status: "idle",
    error: null,
  },
  reducers: {
    setLikedBlogs: (state, action) => {
      state.likedBlogs = action.payload; // Populate likedBlogs with data fetched from the server
    },
    clearError: (state) => {
      state.error = null; // Optional: Clear the error message
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle like/unlike blog success
      .addCase(likeBlog.fulfilled, (state, action) => {
        const { _id, likeCount, likedUsers, likedByUser } = action.payload;

        // Update likedBlogs state with the new like status
        state.likedBlogs[_id] = {
          liked: likedByUser, // Use the likedByUser field from the API response
          likeCount,
          likedUsers,
        };
      })
      // Handle like blog failure
      .addCase(likeBlog.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Handle add comment success
      .addCase(addComment.fulfilled, (state, action) => {
        const { blogId, comment } = action.payload;
        const blog = state.blog.find((b) => b._id === blogId);
        if (blog) {
          blog.comments.push(comment); // Push the new comment into the blog's comment array
        }
      })
      // Handle add comment failure
      .addCase(addComment.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { setLikedBlogs, clearError } = blogSlice.actions;

export default blogSlice.reducer;
