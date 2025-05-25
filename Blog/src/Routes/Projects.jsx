import AllBlogPost from "../Components/AllBlogPost";
import Tiptap from "../Components/TipTap";
import { useState } from "react";
import axios from "axios"; // Ensure axios is imported
import { api } from "../Api/api";

const Projects = () => {
  const [htmlContent, setHtmlContent] = useState("");
  const [imageUrls, setImageUrls] = useState(null);
  const [videoUrls, setVideoUrls] = useState(null);

  // Convert blob URL to a File object
  const blobToFile = (blobUrl, fileName) => {
    return new Promise((resolve, reject) => {
      fetch(blobUrl)
        .then((response) => response.blob()) // Fetch the Blob from the URL
        .then((blob) => {
          const file = new File([blob], fileName, { type: blob.type });
          resolve(file); // Resolve with the File object
        })
        .catch((error) => {
          console.error("Error converting blob URL to file:", error);
          reject(error);
        });
    });
  };

  // Upload the file to Cloudinary
  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Blog_media"); // Your Cloudinary upload preset
    console.log(formData)
    try {
      const response = await axios.post(
        "https://api.cloudinary.com/v1_1/dichjqacx/upload",
        formData
      );
      return response.data.secure_url; // Cloudinary returns the URL of the uploaded file
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      throw error;
    }
  };

  const EditorSave = async (json) => {
    const images = [];
    const videos = [];
    // Loop over the editor content
    for (const item of json.content) {
      if (item.type === "image" && item.src) {
        try {
          // Convert the blob URL to a file and upload to Cloudinary
          const file = await blobToFile(
            item.src,
            `image_${Date.now()}.jpg`
          );
          const imageUrl = await uploadToCloudinary(file);
          console.log(imageUrl);
          
          images.push(imageUrl); // Store the image URL
        } catch (error) {
          console.error("Error processing image:", error);
        }
      } else if (item.type === "video" && item.src) {
        try {
          // Convert the blob URL to a file and upload to Cloudinary
          const file = await blobToFile(
            item.src,
            `video_${Date.now()}.mp4`
          );
          const videoUrl = await uploadToCloudinary(file);
          console.log(videoUrl)
          videos.push(videoUrl); // Store the video URL
        } catch (error) {
          console.error("Error processing video:", error);
        }
      }
    }
    
    
    setImageUrls(images);
    setVideoUrls(videos);
    json.content = json.content.filter(
      (node) => node.type !== "image" && node.type !== "video"
    );
   
  
    
    const updatedJson = { ...json, images, videos };
   
   

    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/blogcreate`,
        updatedJson,
        {
          withCredentials: true,
        }
      );
      return res.data;
     
    } catch (error) {
      alert(error.response.data.message);
    }

    setHtmlContent(json);
  };

  return (
    <>
      <Tiptap onSave={EditorSave} />
      <hr />
      {/* <AllBlogPost content={htmlContent} /> */}
    </>
  );
};

export default Projects;
