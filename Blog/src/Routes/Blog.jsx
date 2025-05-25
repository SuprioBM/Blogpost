import { useEffect, useState } from "react";
import { api } from "../Api/api";
import { useParams } from "react-router-dom";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import DOMPurify from "dompurify";
import Link from "@tiptap/extension-link";
import { useDispatch } from "react-redux";
import useAuth from "../context/useAuth";
import { addComment } from "../redux/features/blogSlice";

const Blog = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState({});
  const [html, setHtml] = useState("");
  const dispatch = useDispatch();
  const { user } = useAuth();
  const [comments, setComments] = useState([]);


  // Fetch blog data
  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const response = await api.get(`/blogs/${id}`);
        setBlog(response.data);
        const updatedComments = await fetchCommentsWithUserData(
          response.data.comment
        );
        setComments(updatedComments.reverse());
      } catch (error) {
        console.error("Error fetching blog:", error);
      }
    };

    fetchBlog();
  }, [id]);

  // Fetch comments with user profile images
  const fetchCommentsWithUserData = async (comments) => {
    return await Promise.all(
      comments.map(async (comment) => {
        try {
          const userResponse = await api.get(`/users/${comment.user}`);
          return {
            ...comment,
            userProfile: userResponse.data.img || "/default-avatar.png",
          };
        } catch (error) {
          console.error("Error fetching user profile:", error);
          return { ...comment, userProfile: "/default-avatar.png" };
        }
      })
    );
  };

  // Handle comment submission
  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You need to be signed in to comment!");
      return;
    }

    const usercomment = e.target.elements.comment.value;

    // Create a new comment object to show immediately in the UI
    const newComment = {
      user: user.username,
      comment: usercomment,
      userProfile: user.profilePic || "/default-avatar.png", // Add the user profile picture
    };

    // Optimistically update the state with the new comment at the top
    setComments((prev) => [newComment, ...prev]); // Adds new comment at the start

    try {
      // Post the comment to the backend
      await dispatch(addComment({ blogId: id, usercomment })).unwrap();

      // Re-fetch the updated comments from the backend
      const response = await api.get(`/blogs/${id}`);
      const updatedComments = await fetchCommentsWithUserData(
        response.data.comment
      );

      // Reverse the comments array so the newest comment comes first
      setComments(updatedComments.reverse()); // Set the latest comments
    } catch (error) {
      console.error("Error adding comment:", error);
      // Optionally, show an error message if the comment fails to post
    }

    // Clear the textarea after submitting
    e.target.reset();
  };

  // Generate blog body HTML
  useEffect(() => {
    const bodyData = blog.body;
    const dataJson = { type: "doc", content: bodyData };
    const htmlcontent = generateHTML(dataJson, [
      StarterKit,
      TextStyle,
      Color,
      Link,
    ]);



    const sanitizedHTML = DOMPurify.sanitize(htmlcontent);
    setHtml(sanitizedHTML);
  }, [blog]);

  return (
    <>
      <div className="flex flex-col justify-center items-center pt-10">
        <h1 className="text-4xl pb-7">BLOG DETAILS</h1>
        <img src={blog.images} alt="Image" className="w-130" />
        <h1 className="text-4xl font-bold py-5" >{blog.title}</h1>
        <hr className=""/>
        <div className="tiptap pl-5" dangerouslySetInnerHTML={{ __html: html }} />
      </div>

      {/* Comment Section */}
      <div className="py-20">
        <h2 className="text-4xl">Comments</h2>
        <hr />
        <form onSubmit={handleComment} className="mt-4 flex pl-5 gap-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
            />
          </svg>

          <textarea
            name="comment"
            className="outline-none border-b-2 p-2 w-4xl leading-2 "
            placeholder="Write a comment..."
          ></textarea>
          <button
            className="bg-black hover:bg-white text-white hover:text-black font-bold px-3 py-1 rounded-full"
            type="submit"
          >
            Post
          </button>
        </form>

        {/* Display Comments */}
        <div className="mt-8">
          {comments.map((cmt,index) => (
            <div
              key={cmt._id || `temp-${index}`}
              className="flex items-center gap-4 py-3 pl-7"
            >
              <img
                src={cmt.userProfile || "/default-avatar.png"} // Profile picture
                alt="User Avatar"
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <h4 className="font-semibold">{cmt.user}</h4>
                <p className="text-gray-700">{cmt.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Blog;

