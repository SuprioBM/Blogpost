import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { api } from "../Api/api";
import Profile from "../Components/Profile";
import NoUserAbout from "../Components/NoUserAbout";
import { motion } from "framer-motion";

const DynamicInputList = ({ label, items, setItems, placeholder }) => {
  const handleChange = (idx, value) => {
    const newItems = [...items];
    newItems[idx] = value;
    setItems(newItems);
  };

  const handleAdd = () => setItems([...items, ""]);
  const handleRemove = (idx) => setItems(items.filter((_, i) => i !== idx));

  return (
    <div>
      <label
        className="block mb-3 text-sm font-semibold text-gradient bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500"
        aria-label={label}
      >
        {label}
      </label>
      {items.map((item, idx) => (
        <motion.div
          key={idx}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className="flex items-center space-x-3 mb-3"
        >
          <input
            type="text"
            value={item}
            onChange={(e) => handleChange(idx, e.target.value)}
            placeholder={placeholder}
            className="flex-grow px-4 py-2 bg-black/40 backdrop-blur-sm border border-transparent rounded-lg text-white placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow"
            aria-label={`${label} input ${idx + 1}`}
          />
          <button
            type="button"
            onClick={() => handleRemove(idx)}
            className="text-pink-400 hover:text-pink-600 font-extrabold text-xl select-none transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
            aria-label={`Remove ${label.toLowerCase()} ${idx + 1}`}
          >
            &times;
          </button>
        </motion.div>
      ))}
      <button
        type="button"
        onClick={handleAdd}
        className="mt-1 text-sm font-semibold text-pink-400 hover:text-pink-600 underline underline-offset-2 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 rounded"
        aria-label={`Add another ${label.slice(0, -1)}`}
      >
        + Add Another {label.slice(0, -1)}
      </button>
    </div>
  );
};

const About = () => {
  const [skills, setSkills] = useState([""]);
  const [experience, setExperience] = useState([""]);
  const [education, setEducation] = useState([""]);
  const [imagePreview, setImagePreview] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);

  const [profileExists, setProfileExists] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    const user = Cookies.get("user") || null;
    setUsername(user);
    if (!user) setLoading(false);
  }, []);

  useEffect(() => {
    if (!username) return;

    const checkProfile = async () => {
      try {
        const res = await api.get("/profile", { withCredentials: true });
        setProfileExists(res.data.exists);
      } catch {
        setProfileExists(false);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [username]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadImage(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("username", username);
    if (uploadImage) formData.append("file", uploadImage);
    formData.append("skills", JSON.stringify(skills));
    formData.append("exps", JSON.stringify(experience));
    formData.append("edus", JSON.stringify(education));

    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/user_details`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      alert(res.data.message);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting form.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-pink-500 text-xl font-semibold tracking-wide">
        Loading...
      </div>
    );
  }

  if (!username) {
    return (
      <div className="flex justify-center items-center min-h-screen text-pink-500 text-xl px-4">
        <NoUserAbout />
      </div>
    );
  }

  if (!profileExists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-tr from-black via-gray-900 to-black px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-2xl bg-black/70 backdrop-blur-lg p-10 rounded-3xl shadow-2xl border border-pink-600"
        >
          <h2 className="text-4xl font-extrabold text-pink-500 mb-10 tracking-widest text-center drop-shadow-lg">
            Edit Your Profile
          </h2>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label
                htmlFor="about"
                className="block mb-3 text-sm font-semibold text-pink-400 tracking-wide"
              >
                About Me:
              </label>
              <textarea
                id="about"
                name="about"
                rows={4}
                placeholder="Tell us about yourself"
                className="w-full p-4 bg-black/40 backdrop-blur-sm border border-transparent rounded-xl text-white placeholder-pink-300
                  focus:outline-none focus:ring-2 focus:ring-pink-500 transition-shadow resize-none"
                aria-label="About Me"
              />
            </div>

            <DynamicInputList
              label="Skills"
              items={skills}
              setItems={setSkills}
              placeholder="Add a skill"
            />

            <DynamicInputList
              label="Experience"
              items={experience}
              setItems={setExperience}
              placeholder="Add experience"
            />

            <DynamicInputList
              label="Education"
              items={education}
              setItems={setEducation}
              placeholder="Add education"
            />

            <div>
              <label
                htmlFor="file_input"
                className="block mb-3 text-sm font-semibold text-pink-400 tracking-wide"
              >
                Upload Profile Image
              </label>
              <input
                id="file_input"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="block w-full p-3 bg-black/40 text-pink-300 border border-pink-500 rounded-xl cursor-pointer
                  transition hover:border-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-500"
                aria-describedby="image-upload-desc"
              />
              {imagePreview && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="mt-6 flex justify-center"
                >
                  <img
                    src={imagePreview}
                    alt="Profile Preview"
                    className="w-28 h-28 object-cover rounded-full border-4 border-pink-600 shadow-lg"
                  />
                </motion.div>
              )}
              <p
                id="image-upload-desc"
                className="mt-2 text-xs text-pink-300 italic select-none"
              >
                Supported formats: JPG, PNG, GIF. Max size: 800x400px.
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-pink-600 to-red-600 text-white font-bold rounded-3xl shadow-lg drop-shadow-pink transition-shadow focus:outline-none focus:ring-4 focus:ring-pink-500"
              aria-label="Submit Profile"
            >
              Submit Profile
            </motion.button>
          </form>
        </motion.div>
      </div>
    );
  }

  return <Profile />;
};

export default About;
