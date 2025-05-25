import { useState } from "react";
import axios from "axios";
import Tiptap from "../Components/TipTap";
import { api } from "../Api/api";

const Projects = () => {
  const [imageUrls, setImageUrls] = useState([]);
  const [videoUrls, setVideoUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Convert a blob URL to a File object
  const blobToFile = async (blobUrl, fileName) => {
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      return new File([blob], fileName, { type: blob.type });
    } catch (err) {
      console.error("Error converting blob URL to file:", err);
      throw err;
    }
  };

  // Upload a file to Cloudinary and return the secure URL
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Blog_media");

    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dichjqacx/upload",
        formData
      );
      return response.data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload failed:", err);
      throw err;
    }
  };

  // Save handler triggered on Tiptap editor save
  const EditorSave = async (json) => {
    setLoading(true);
    setError(null);

    const images = [];
    const videos = [];

    try {
      // Process content nodes for images and videos
      for (const item of json.content) {
        if ((item.type === "image" || item.type === "video") && item.src) {
          const ext = item.type === "image" ? "jpg" : "mp4";
          const fileName = `${item.type}_${Date.now()}.${ext}`;

          try {
            const file = await blobToFile(item.src, fileName);
            const url = await uploadToCloudinary(file);

            if (item.type === "image") images.push(url);
            else videos.push(url);
          } catch (uploadError) {
            console.error(`Failed to upload ${item.type}:`, uploadError);
          }
        }
      }

      // Remove image/video nodes from content before saving
      const filteredContent = json.content.filter(
        (node) => node.type !== "image" && node.type !== "video"
      );

      // Prepare updated payload including uploaded media URLs
      const updatedJson = {
        ...json,
        content: filteredContent,
        images,
        videos,
      };

      // Post updated blog content to backend
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogcreate`,
        updatedJson,
        { withCredentials: true }
      );

      setImageUrls(images);
      setVideoUrls(videos);

      alert("Blog saved successfully!");
      return res.data;
    } catch (saveError) {
      setError(saveError?.response?.data?.message || saveError.message);
      alert(error);
      console.error("Error saving blog:", saveError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h2 className="text-3xl font-semibold mb-6 text-center text-white">
        Create / Edit Project Blog
      </h2>

      <Tiptap onSave={EditorSave} />

      {loading && (
        <p className="text-indigo-600 font-medium mt-4 text-center ">
          Uploading and saving...
        </p>
      )}

      {error && (
        <p className="text-red-600 font-semibold mt-4 text-center">{error}</p>
      )}

      {(imageUrls.length > 0 || videoUrls.length > 0) && (
        <section className="mt-10 max-w-xl mx-auto">
          <h3 className="text-xl font-semibold mb-4 text-center">
            Uploaded Media Preview
          </h3>

          <div className="flex space-x-4 overflow-x-auto py-2">
            {imageUrls.map((url, idx) => (
              <div
                key={`img-${idx}`}
                className="flex-shrink-0 w-22 h-10 rounded-md shadow-md overflow-hidden"
              >
                <img
                  src={url}
                  alt={`Uploaded Image ${idx + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}

            {videoUrls.map((url, idx) => (
              <div
                key={`vid-${idx}`}
                className="flex-shrink-0 w-32 h-20 rounded-md shadow-md overflow-hidden"
              >
                <video
                  controls
                  src={url}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Projects;
