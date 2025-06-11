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
import { motion } from "framer-motion";

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
        } catch {
          return { ...comment, userProfile: "/default-avatar.png" };
        }
      })
    );
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!user) return alert("You need to be signed in to comment!");
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
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="max-w-6xl mx-auto px-6 py-16 text-white rounded-lg shadow-2xl mt-12"
    >
      <motion.div
        className="mb-12 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-600">
          {blog.title || "Loading..."}
        </h1>
        {blog.images && (
          <motion.img
            src={blog.images}
            alt={blog.title}
            className="mt-8 rounded-xl max-h-[500px] w-full object-cover shadow-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          />
        )}
      </motion.div>

      <article
        className="prose prose-invert prose-xl max-w-none text-gray-200 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <section className="mt-20">
        <h2 className="text-4xl font-bold text-cyan-400 mb-6">Discussion</h2>

        <form onSubmit={handleComment} className="space-y-4 mb-12">
          <textarea
            name="comment"
            placeholder="Leave your feedback..."
            rows={4}
            className="w-full p-4 rounded-xl bg-black/30 text-white border border-gray-600 focus:ring-2 focus:ring-cyan-500 backdrop-blur-sm"
            required
          />
          <button
            type="submit"
            className="px-6 py-3 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold shadow-md transition"
          >
            Submit
          </button>
        </form>

        <div className="space-y-6">
          {comments.length === 0 ? (
            <p className="text-gray-400 italic">
              Be the first to leave a comment!
            </p>
          ) : (
            comments.map((cmt, index) => (
              <motion.div
                key={cmt._id || `temp-${index}`}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex items-start gap-4 bg-white/5 backdrop-blur-lg p-5 rounded-lg shadow-md border border-white/10"
              >
                <img
                  src={cmt.userProfile}
                  alt={`${cmt.user}'s avatar`}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-white">{cmt.user}</h4>
                  <p className="mt-1 text-gray-300 whitespace-pre-line">
                    {cmt.comment}
                  </p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};

export default Blog;
