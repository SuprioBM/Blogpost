import { NavLink } from "react-router-dom";
import { api } from "../Api/api";
import useAuth from "../context/useAuth";
import { useEffect, useState } from "react";
import { generateHTML } from "@tiptap/html";
import StarterKit from "@tiptap/starter-kit";
import TextStyle from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Link from "@tiptap/extension-link";
import ArrowIcon from "../assets/ArrowIcon";
import AllBlogPost from "./AllBlogPost";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { likeBlog } from "../redux/features/blogSlice";

const RecentPost = () => {
  const { user, signout } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [html, setHtml] = useState([]);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await api.post("/signout", {}, { withCredentials: true });
      signout();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  useEffect(() => {
    const fetchBlogData = async () => {
      try {
        const res = await api.get("/fetchblogs");
        setHtml(res.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchBlogData();
  }, []);

  useEffect(() => {
    if (!Array.isArray(html) || html.length === 0) return;
    const processedBlogs = html.map((data) => {
      const bodyData = data.body;
      const dataJson = { type: "doc", content: bodyData };
      const htmls = generateHTML(dataJson, [
        StarterKit,
        TextStyle,
        Color,
        Link,
      ]);
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmls, "text/html");
      const paragraphs = [...doc.querySelectorAll("p")].map(
        (el) => el.innerText
      );

      return {
        id: data._id,
        title: data.title || "No Title",
        description: paragraphs[0] || "No Description",
        image: data.images?.[0] || "default-image.jpg",
        like: data.like || 0,
        likedUsers: data.likedUsers || [],
        commentCount: Array.isArray(data.comment) ? data.comment.length : 0,
        time: data.createdAt,
      };
    });

    setBlogs(processedBlogs);
  }, [html]);

  const handleLike = async (blogId) => {
    if (!user) {
      alert("You need to be signed in to like this post!");
      return;
    }

    setBlogs((prevBlogs) =>
      prevBlogs.map((item) =>
        item.id === blogId
          ? {
              ...item,
              like: item.likedUsers.includes(user)
                ? item.like - 1
                : item.like + 1,
              likedUsers: item.likedUsers.includes(user)
                ? item.likedUsers.filter((u) => u !== user)
                : [...item.likedUsers, user],
            }
          : item
      )
    );

    try {
      await dispatch(likeBlog(blogId));
    } catch (error) {
      console.error("Error liking blog:", error);
      // revert UI state on error
      setBlogs((prevBlogs) =>
        prevBlogs.map((item) =>
          item.id === blogId
            ? {
                ...item,
                like: item.likedUsers.includes(user)
                  ? item.like + 1
                  : item.like - 1,
                likedUsers: item.likedUsers.includes(user)
                  ? [...item.likedUsers, user]
                  : item.likedUsers.filter((u) => u !== user),
              }
            : item
        )
      );
    }
  };

  const handleComment = (blogId) => {
    if (!user) {
      alert("You need to be signed in to comment on this post!");
      return;
    }
    navigate(`/blog/${blogId}`);
  };

  const sortedBlogs = blogs.sort((a, b) => new Date(b.time) - new Date(a.time));
  const recentPosts = sortedBlogs.slice(0, 4);
  const remainingBlogs = sortedBlogs.slice(4);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-black to-black text-white mt-15 font-sans">
      <header className="flex justify-center items-center px-6 py-6 border-b border-gray-800 bg-black shadow-lg">
        <h1 className="text-[5rem] lg:text-[7rem] sm:[text-7rem] mr-4 font-extrabold tracking-tight select-none pl-9 lg:pl-5 sm:pl-50 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-600 to-red-500 animate-pulse">
          BlogSite
        </h1>
       
</header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-10">
        <h2 className="text-4xl font-extrabold mb-8 border-l-8 border-indigo-600 pl-4 tracking-wide">
          Recent Blog Posts
        </h2>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg
              className="animate-spin h-10 w-10 text-indigo-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              ></path>
            </svg>
          </div>
        ) : (
          <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {recentPosts.map((item, index) => (
              <article
                key={item.id}
                className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col transform transition-transform duration-300 hover:scale-[1.05] hover:shadow-indigo-500/50 animate-fadeIn"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-56 w-full object-cover object-center"
                  />
                )}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-bold line-clamp-2 text-indigo-300 hover:text-indigo-500 transition">
                      {item.title}
                    </h3>
                    <NavLink
                      to={`/blog/${item.id}`}
                      className="ml-3 transition text-indigo-400 hover:text-indigo-600"
                      aria-label={`Read more about ${item.title}`}
                    >
                      <ArrowIcon className="w-6 h-6" />
                    </NavLink>
                  </div>
                  <p className="flex-grow line-clamp-3 mb-6 text-gray-300">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-4 mt-auto">
                    <button
                      onClick={() => handleLike(item.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-600 
                        transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400
                        ${
                          item.likedUsers.includes(user)
                            ? "bg-indigo-600 text-white hover:bg-indigo-700"
                            : "hover:bg-indigo-600 hover:text-white text-indigo-300"
                        }`}
                      aria-pressed={item.likedUsers.includes(user)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={item.likedUsers.includes(user) ? "red" : "none"}
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                      <span className="font-semibold text-lg">{item.like}</span>
                    </button>
                    <button
                      onClick={() => handleComment(item.id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-indigo-600 text-indigo-300 hover:bg-indigo-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-label={`View comments for ${item.title}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                        />
                      </svg>
                      <span className="font-semibold text-lg">
                        {item.commentCount}
                      </span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Remaining Blogs Section */}
        <section className="mt-20">
          <AllBlogPost items={remainingBlogs} />
        </section>
      </main>
    </div>
  );
};

export default RecentPost;
