import { api, refreshTokens } from "../Api/api";
import { useEffect, useState } from "react";
import NoUserAbout from "./NoUserAbout";

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await api.get("/profile", { withCredentials: true });
        setUserData(res.data.userdata);
      } catch (error) {
        refreshTokens();
        console.error(error);
      }
    };
    checkAuthStatus();
  }, []);

  if (!userData) {
    return <NoUserAbout />;
  }

  return (
    <div className="min-h-screen max-w-5xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 border-b border-gray-700 pb-8">
        <img
          src={userData.img}
          alt={`${userData.username}'s profile`}
          className="w-40 h-40 rounded-full object-cover border-4 border-red-600 shadow-lg"
        />
        <h1 className="text-6xl md:text-7xl font-extrabold text-red-700 uppercase select-none">
          {userData.username}
        </h1>
      </div>

      <div className="mt-10 space-y-12">
        <section>
          <h2 className="text-3xl font-semibold text-gray-200 mb-4">
            About Me
          </h2>
          <p className="text-lg text-gray-300 leading-relaxed">
            {userData.about}
          </p>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-gray-200 mb-4">Skills</h2>
          <ul className="list-disc list-inside space-y-1 text-lg text-gray-300">
            {userData.skill.map((skill, i) => (
              <li key={i}>{skill}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-gray-200 mb-4">
            Experience
          </h2>
          <ul className="list-disc list-inside space-y-1 text-lg text-gray-300">
            {userData.exp.map((exp, i) => (
              <li key={i}>{exp}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-3xl font-semibold text-gray-200 mb-4">
            Education
          </h2>
          <ul className="list-disc list-inside space-y-1 text-lg text-gray-300">
            {userData.edu.map((edu, i) => (
              <li key={i}>{edu}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default Profile;
