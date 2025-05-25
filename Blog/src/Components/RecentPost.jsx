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
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="flex justify-between items-center px-6 py-4 border-b bg-black shadow-sm sticky top-0 z-50">
        <h1 className="text-7xl font-extrabold tracking-tight text-red-600 select-none">
          BlogSite
        </h1>
        <nav className="space-x-6 text-lg font-semibold text-red-500">
          {!user ? (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-900 underline"
                    : "hover:text-indigo-900 transition"
                }
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  isActive
                    ? "text-indigo-900 underline"
                    : "hover:text-indigo-900 transition"
                }
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <button
              onClick={handleSignOut}
              className="text-indigo-600 hover:text-indigo-900 transition font-semibold"
            >
              Sign Out
            </button>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8">
        <h2 className="text-3xl font-semibold mb-6 border-l-4 border-red-600 pl-3">
          Recent Blog Posts
        </h2>
        {loading ? (
          <div className="text-center py-20 text-xl font-medium ">
            Loading...
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {recentPosts.map((item, index) => (
              <article
                key={item.id}
                className="bg-black rounded-xl shadow-md overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300"
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="h-48 w-full object-cover object-center"
                  />
                )}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold line-clamp-2">
                      {item.title}
                    </h3>
                    <NavLink
                      to={`/blog/${item.id}`}
                      className="ml-3 text-red-600 hover:text-red-800 transition"
                      aria-label={`Read more about ${item.title}`}
                    >
                      <ArrowIcon />
                    </NavLink>
                  </div>
                  <p className="flex-grow line-clamp-3 mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center gap-3 mt-auto">
                    <button
                      onClick={() => handleLike(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-600 text-red-600 hover:bg-indigo-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-pressed={item.likedUsers.includes(user)}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill={item.likedUsers.includes(user) ? "red" : "none"}
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                        />
                      </svg>
                      <span>{item.like}</span>
                    </button>
                    <button
                      onClick={() => handleComment(item.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-600 text-red-600 hover:bg-indigo-600 hover:text-white transition focus:outline-none focus:ring-2 focus:ring-indigo-400"
                      aria-label={`View comments for ${item.title}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                        />
                      </svg>
                      <span>{item.commentCount}</span>
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Remaining Blogs Section */}
        <section className="mt-14">
          <AllBlogPost items={remainingBlogs} />
        </section>
      </main>
    </div>
  );
};

export default RecentPost;
