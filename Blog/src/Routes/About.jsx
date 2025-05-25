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
           setExist(res.data.exists)
          } catch (error) {
           console.log(error);
           setExist(false);
         } finally{
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
      setUploadImage(file)
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        console.log(reader)
      };
      reader.readAsDataURL(file);
    }
  };


  const handleForm = async(e)=>{
     e.preventDefault();
     
     const formData = new FormData(e.currentTarget);
     formData.append("username", Cookies.get("user"));
     formData.append("file", uploadImage); 
     formData.append("skills", JSON.stringify(skills));
     formData.append("exps", JSON.stringify(experience));
     formData.append("edus", JSON.stringify(education));
     const info = Object.fromEntries(formData);
     console.log(info)
     
 
    


 
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
           alert(error.response.data.message);
         }
    
  }

  if(loading){
    return <div>Loading....</div>
  }

  return (
    <>
      {!exist && isEdited ? (
        <div className="flex items-center justify-center min-h-screen bg-blur-xs">
          <div className="flex flex-col items-center justify-center max-w-md w-full mx-auto p-8 bg-blur-md shadow-xl rounded-lg border border-gray-300">
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              Edit Your Profile
            </h2>
            <form
              className="w-full space-y-6"
              onSubmit={handleForm}
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  About Me:
                </label>
                <textarea
                  rows="4"
                  id="aboutme"
                  name="about"
                  className="mt-2 p-3 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Tell us about yourself"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                      className="p-3 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add a skill"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index, "skills")}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  + Add Another Skill
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                      className="p-3 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add experience"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index, "experience")}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddExperience}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  + Add Another Experience
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
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
                      className="p-3 w-full rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Add education"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemove(index, "education")}
                      className="text-red-500 hover:text-red-700"
                    >
                      ✖
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddEducation}
                  className="mt-2 text-blue-500 hover:text-blue-600"
                >
                  + Add Another Education
                </button>
              </div>

              <div>
                <label
                  className="block mb-2 text-sm font-medium text-gray-700"
                  htmlFor="file_input"
                >
                  Upload Profile Image
                </label>
                <input
                  className="block w-full text-sm text-gray-900 border border-blur rounded-lg cursor-pointer bg-blur hover:bg-amber-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  aria-describedby="file_input_help"
                  id="file_input"
                  type="file"
                  onChange={handleImageUpload}
                />
                {image && (
                  <div className="mt-4">
                    <img
                      src={image}
                      alt="Profile"
                      className="w-32 h-32 object-cover"
                    />
                  </div>
                )}
                <p className="mt-1 text-sm text-gray-500" id="file_input_help">
                  SVG, PNG, JPG or GIF (MAX. 800x400px).
                </p>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400"
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
