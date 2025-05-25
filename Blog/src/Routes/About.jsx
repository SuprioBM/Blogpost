import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { api } from "../Api/api";
import Profile from "../Components/Profile";

const About = () => {
  const [skills, setSkills] = useState([""]);
  const [experience, setExperience] = useState([""]);
  const [education, setEducation] = useState([""]);
  const [image, setImage] = useState(null);
  const [uploadImage, setUploadImage] = useState(null);
  const [exist, setExist] = useState(null);
  const [loading, setLoading] = useState(true);
  const isEdited = Cookies.get("user");

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get("/profile", { withCredentials: true });
        setExist(res.data.exists);
      } catch (error) {
        console.log(error);
        setExist(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleAddSkill = () => setSkills([...skills, ""]);
  const handleAddExperience = () => setExperience([...experience, ""]);
  const handleAddEducation = () => setEducation([...education, ""]);

  const handleChange = (index, value, type) => {
    const updatedArray = [
      ...(type === "skills"
        ? skills
        : type === "experience"
        ? experience
        : education),
    ];
    updatedArray[index] = value;
    if (type === "skills") setSkills(updatedArray);
    if (type === "experience") setExperience(updatedArray);
    if (type === "education") setEducation(updatedArray);
  };

  const handleRemove = (index, type) => {
    if (type === "skills") {
      setSkills(skills.filter((_, i) => i !== index));
    }
    if (type === "experience") {
      setExperience(experience.filter((_, i) => i !== index));
    }
    if (type === "education") {
      setEducation(education.filter((_, i) => i !== index));
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleForm = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.append("username", Cookies.get("user"));
    formData.append("file", uploadImage);
    formData.append("skills", JSON.stringify(skills));
    formData.append("exps", JSON.stringify(experience));
    formData.append("edus", JSON.stringify(education));

    try {
      const res = await api.post(
        `${import.meta.env.VITE_BACKEND_URL}/user_details`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert(res.data.message);
      window.location.reload();
    } catch (error) {
      alert(error.response?.data?.message || "Error submitting form.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500 text-xl">
        Loading...
      </div>
    );
  }

  return (
    <>
      {!exist && isEdited ? (
        <div className="flex items-center justify-center min-h-screen bg-black text-white px-4">
          <div className="w-full max-w-2xl bg-[#1a1a1a] p-8 rounded-xl shadow-lg border border-red-600">
            <h2 className="text-3xl font-bold text-center text-red-500 mb-6">
              Edit Your Profile
            </h2>
            <form className="space-y-6" onSubmit={handleForm}>
              {/* About Me */}
              <div>
                <label className="block mb-1 text-sm text-red-400">
                  About Me:
                </label>
                <textarea
                  rows="4"
                  id="aboutme"
                  name="about"
                  className="w-full p-3 bg-black border border-red-500 rounded-md focus:outline-none focus:ring-2 focus:ring-red-600"
                  placeholder="Tell us about yourself"
                />
              </div>

              {/* Skills */}
              <div>
                <label className="block mb-1 text-sm text-red-400">
                  Skills:
                </label>
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) =>
                        handleChange(index, e.target.value, "skills")
                      }
                      className="w-full p-2 bg-black border border-red-500 rounded-md focus:outline-none"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index, "skills")}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="mt-2 text-sm text-red-400 hover:underline"
                >
                  + Add Another Skill
                </button>
              </div>

              {/* Experience */}
              <div>
                <label className="block mb-1 text-sm text-red-400">
                  Experience:
                </label>
                {experience.map((exp, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <input
                      type="text"
                      value={exp}
                      onChange={(e) =>
                        handleChange(index, e.target.value, "experience")
                      }
                      className="w-full p-2 bg-black border border-red-500 rounded-md focus:outline-none"
                      placeholder="Add experience"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index, "experience")}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="mt-2 text-sm text-red-400 hover:underline"
                >
                  + Add Another Experience
                </button>
              </div>

              {/* Education */}
              <div>
                <label className="block mb-1 text-sm text-red-400">
                  Education:
                </label>
                {education.map((edu, index) => (
                  <div key={index} className="flex items-center space-x-2 mt-2">
                    <input
                      type="text"
                      value={edu}
                      onChange={(e) =>
                        handleChange(index, e.target.value, "education")
                      }
                      className="w-full p-2 bg-black border border-red-500 rounded-md focus:outline-none"
                      placeholder="Add education"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index, "education")}
                      className="text-red-400 hover:text-red-600"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="mt-2 text-sm text-red-400 hover:underline"
                >
                  + Add Another Education
                </button>
              </div>

              {/* Image Upload */}
              <div>
                <label
                  htmlFor="file_input"
                  className="block mb-2 text-sm text-red-400"
                >
                  Upload Profile Image
                </label>
                <input
                  id="file_input"
                  type="file"
                  onChange={handleImageUpload}
                  className="block w-full p-2 bg-black text-white border border-red-500 rounded-md cursor-pointer"
                />
                {image && (
                  <div className="mt-4">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-24 h-24 object-cover rounded-full border-2 border-red-600"
                    />
                  </div>
                )}
                <p className="mt-1 text-xs text-gray-400">
                  Supported formats: JPG, PNG, GIF. Max size: 800x400px.
                </p>
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-lg transition-all duration-300"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <Profile />
      )}
    </>
  );
};

export default About;
