import { useState } from "react";
import axios from "axios";
import Tiptap from "../Components/TipTap";
import { api } from "../Api/api";

const Projects = () => {
  const [showEditor, setShowEditor] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [imageUrls, setImageUrls] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert blob URL to File object
  const blobToFile = async (blobUrl, fileName) => {
    const response = await fetch(blobUrl);
    const blob = await response.blob();
    return new File([blob], fileName, { type: blob.type });
  };

  // Upload file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Blog_media");

    const response = await axios.post(
      "https://api.cloudinary.com/v1_1/dichjqacx/upload",
      formData
    );
    return response.data.secure_url;
  };

  // Save editor content and media
  const EditorSave = async (json) => {
    setLoading(true);
    setError(null);

    const images = [];
    const videos = [];

    try {
      for (const item of json.content) {
        if ((item.type === "image" || item.type === "video") && item.src) {
          const ext = item.type === "image" ? "jpg" : "mp4";
          const fileName = `${item.type}_${Date.now()}.${ext}`;
          const file = await blobToFile(item.src, fileName);
          const url = await uploadToCloudinary(file);
          item.type === "image" ? images.push(url) : videos.push(url);
        }
      }

      // Filter out media from content before sending to backend
      const filteredContent = json.content.filter(
        (node) => node.type !== "image" && node.type !== "video"
      );

      const updatedJson = {
        ...json,
        title,
        category,
        content: filteredContent,
        images,
        videos,
      };

      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogcreate`,
        updatedJson,
        { withCredentials: true }
      );

      setImageUrls(images);
      setVideoUrls(videos);
      alert("Blog saved successfully!");
      return res.data;
    } catch (err) {
      setError(err?.response?.data?.message || err.message);
      alert(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 mt-10 space-y-8 text-white">
      <div className="text-center">
        <h2
          className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500
                    my-12 text-[3rem] sm:text-[4rem] md:text-[5rem] leading-tight animate-pulse"
          style={{ animationTimingFunction: "ease-in-out" }}
          tabIndex={0}
        >
          Ignite Your Creativity
          <br />
          Create Epic Blog Posts
        </h2>
        <p className="text-gray-300 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl font-light tracking-wide">
          Dive into a world where your words come alive. Add a compelling title,
          select your category, craft stunning content, and enrich it with
          vibrant images and videos. Your story deserves to be told like never
          before.
        </p>
      </div>

      {!showEditor ? (
        <div className="flex justify-center">
          <button
            onClick={() => setShowEditor(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-md font-semibold transition-shadow shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
            aria-label="Open blog editor"
          >
            Create Blog
          </button>
        </div>
      ) : (
        <>
          {/* Title Input */}
          <div className="rounded-md shadow p-4 text-white bg-black/40 backdrop-blur-sm">
            <label htmlFor="blog-title" className="block text-sm font-medium mb-1">
              Title
            </label>
            <input
              id="blog-title"
              type="text"
              className="w-full border border-gray-600 rounded px-3 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              placeholder="Enter blog title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          {/* Category Input */}
          <div className="rounded-md shadow p-4 text-white bg-black/40 backdrop-blur-sm">
            <label htmlFor="blog-category" className="block text-sm font-medium mb-1">
              Category
            </label>
            <input
              id="blog-category"
              type="text"
              className="w-full border border-gray-600 rounded px-3 py-2 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
              placeholder="e.g., Development, Travel, Tips"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              aria-required="true"
            />
          </div>

          {/* Editor Box */}
          <div className="rounded-md shadow p-4 text-white bg-black/40 backdrop-blur-sm">
            <h2 className="font-semibold mb-2 text-center text-3xl sm:text-4xl">
              Blog Content
            </h2>
            <Tiptap onSave={EditorSave} />
            {loading && (
              <p className="text-indigo-400 font-medium mt-4 text-center animate-pulse">
                Uploading and saving...
              </p>
            )}
            {error && (
              <p className="text-red-600 font-semibold mt-4 text-center" role="alert">
                {error}
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Projects;
