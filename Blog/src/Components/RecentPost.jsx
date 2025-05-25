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
import { useDispatch} from "react-redux";
import { useNavigate } from 'react-router-dom';
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
        time: data.createdAt
      };
    });

    setBlogs(processedBlogs);
  }, [html]);

  const handleLike = async (blogId) => {
    if (!user) {
      alert("You need to be signed in to like this post!");
      return;
    }

    // Optimistically update the like count and liked status
    setBlogs((prevBlogs) =>
      prevBlogs.map((item) =>
        item.id === blogId
          ? {
              ...item,
              like: item.likedUsers.includes(user)
                ? item.like - 1
                : item.like + 1, // Increment or decrement like count
              likedUsers: item.likedUsers.includes(user)
                ? item.likedUsers.filter((u) => u !== user) // Remove user from likedUsers
                : [...item.likedUsers, user], // Add user to likedUsers
            }
          : item
      )
    );

    try {
      // Dispatch the likeBlog action to update Redux and the backend
      await dispatch(likeBlog(blogId));
    } catch (error) {
      console.error("Error liking blog:", error);
      // Revert optimistic update on error
      setBlogs((prevBlogs) =>
        prevBlogs.map((item) =>
          item.id === blogId
            ? {
                ...item,
                like: item.likedUsers.includes(user)
                  ? item.like + 1
                  : item.like - 1, // Revert like count change
                likedUsers: item.likedUsers.includes(user)
                  ? [...item.likedUsers, user] // Re-add the user to likedUsers
                  : item.likedUsers.filter((u) => u !== user), // Remove user from likedUsers
              }
            : item
        )
      );
    }
  };

  const handleComment = async (blogId) => {
    if (!user) {
      alert("You need to be signed in to comment on this post!");
      return;
    }
    navigate(`/blog/${blogId}`);
  };
  const sortedBlogs = blogs.sort(
    (a, b) => new Date(b.time) - new Date(a.time)
  );
  const recentPosts = sortedBlogs.slice(0, 4); 
  const remainingBlogs = sortedBlogs.slice(4); 

  return (
    <div className="w-screen">
      <div className="flex justify-center items-center flex-row-reverse px-7 relative pb-6 pt-2 border-b-1">
        <ul className="flex flex-row gap-4 text-2xl absolute right-5 top-2">
          {!user ? (
            <>
              <li>
                <NavLink to="/signin">Sign In</NavLink>
              </li>
              <li>
                <NavLink to="/signup">Sign Up</NavLink>
              </li>
            </>
          ) : (
            <li>
              <button onClick={handleSignOut}>Sign Out</button>
            </li>
          )}
        </ul>
        <h1 className="text-9xl">BlogSite</h1>
      </div>
      <h2 className="text-2xl p-6">Recent Blog Posts</h2>
      <hr className="relative -top-4 left-5 w-50" />
      <hr className="relative -top-3 left-5 w-50" />
      <div className="p-5 grid grid-cols-2 gap-3 text-black">
        {loading ? (
          <div>Loading...</div>
        ) : (
          recentPosts.map((item, index) => (
            <div
              key={item.id}
              className={`p-4 flex ${
                index === 0 ? "flex-col" : "flex-row"
              } justify-between gap-5 ${getGridClasses(index)}`}
            >
              {item.image && (
                <img
                  className="w-auto h-auto max-h-[250px] p-4"
                  src={item.image}
                  alt="Item"
                />
              )}
              <div className="flex flex-col justify-center">
                <div className="flex items-center gap-5">
                  <h1 className="text-3xl font-bold mb-7">{item.title}</h1>
                  <NavLink to={`/blog/${item.id}`} className={`mb-5`}>
                    <ArrowIcon />
                  </NavLink>
                </div>
                <p className="truncate-text">{item.description}</p>
                <div className="flex gap-3 pt-5">
                  <button className="bg-black hover:bg-white text-white hover:text-black font-bold py-2 px-4 rounded-full">
                    Button
                  </button>
                  <button
                    className="bg-black hover:bg-white text-white hover:text-black font-bold py-2 px-4 rounded-full flex gap-1"
                    onClick={() => handleLike(item.id)} // Toggle like on click
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={item.likedUsers.includes(user) ? "red" : "none"} // Change color to red if liked
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                    {item.like} {/* Display the like count */}
                  </button>
                  <button
                    className="bg-black hover:bg-white text-white hover:text-black font-bold py-2 px-4 rounded-full flex gap-1"
                    onClick={() => handleComment(item.id)} // Navigate to the blog post page
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 0 1 .778-.332 48.294 48.294 0 0 0 5.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                      />
                    </svg>
                    {item.commentCount}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <div className="py-10 px-5">
        <AllBlogPost items={remainingBlogs} />
      </div>
    </div>
  );
};

const getGridClasses = (index) => {
  const positions = [
    "flex-col col-start-1 row-start-1 row-end-5",
    "flex-row col-start-1 col-end-3 row-start-5 row-end-7",
    "flex-row col-start-2 row-start-1 row-end-3",
    "flex-row col-start-2 row-start-3 row-end-5",
  ];
  return positions[index % positions.length];
};

export default RecentPost;
