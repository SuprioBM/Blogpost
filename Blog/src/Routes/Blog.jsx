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

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("You need to be signed in to comment!");
      return;
    }
    const usercomment = e.target.elements.comment.value.trim();
    if (!usercomment) return;

    const newComment = {
      user: user.username,
      comment: usercomment,
      userProfile: user.profilePic || "/default-avatar.png",
    };

    setComments((prev) => [newComment, ...prev]);

    try {
      await dispatch(addComment({ blogId: id, usercomment })).unwrap();
      const response = await api.get(`/blogs/${id}`);
      const updatedComments = await fetchCommentsWithUserData(
        response.data.comment
      );
      setComments(updatedComments.reverse());
    } catch (error) {
      console.error("Error adding comment:", error);
    }
    e.target.reset();
  };

  useEffect(() => {
    if (!blog.body) return;
    const dataJson = { type: "doc", content: blog.body };
    const htmlcontent = generateHTML(dataJson, [
      StarterKit,
      TextStyle,
      Color,
      Link,
    ]);
    setHtml(DOMPurify.sanitize(htmlcontent));
  }, [blog]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      {/* Blog Header */}
      <div className="mb-10 text-center">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-red-600 mb-4">
          {blog.title || "Loading..."}
        </h1>
        {blog.images && (
          <img
            src={blog.images}
            alt={blog.title}
            className="mx-auto rounded-lg max-h-[400px] object-cover w-full sm:w-auto sm:max-w-3xl shadow-md"
          />
        )}
      </div>

      {/* Blog Content */}
      <article
        className="prose prose-lg max-w-none "
        dangerouslySetInnerHTML={{ __html: html }}
      />

      {/* Comments Section */}
      <section className="mt-16">
        <h2 className="text-3xl font-semibold mb-6 border-b border-gray-300 pb-2">
          Comments
        </h2>

        {/* Comment Form */}
        <form
          onSubmit={handleComment}
          className="flex flex-col sm:flex-row gap-4 items-start sm:items-center"
        >
          <textarea
            name="comment"
            placeholder="Write your comment..."
            rows={3}
            className="flex-grow resize-none border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-200"
            required
          ></textarea>
          <button
            type="submit"
            className="mt-2 sm:mt-0 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-md shadow-md transition"
          >
            Post Comment
          </button>
        </form>

        {/* Comments List */}
        <div className="mt-10 space-y-6">
          {comments.length === 0 && (
            <p className="text-gray-500 italic">
              No comments yet. Be the first to comment!
            </p>
          )}

          {comments.map((cmt, index) => (
            <div
              key={cmt._id || `temp-${index}`}
              className="flex items-start gap-4 p-4 rounded-lg shadow-sm "
            >
              <img
                src={cmt.userProfile || "/default-avatar.png"}
                alt={`${cmt.user}'s avatar`}
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
              />
              <div>
                <h4 className="font-semibold">{cmt.user}</h4>
                <p className="mt-1 whitespace-pre-line">
                  {cmt.comment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Blog;
