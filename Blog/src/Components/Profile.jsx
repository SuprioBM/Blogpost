import { api, refreshTokens } from "../Api/api";
import { useEffect, useState } from "react";
import NoUserAbout from "./NoUserAbout";
import { motion } from "framer-motion";

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="min-h-screen max-w-6xl mx-auto px-8 py-20 bg-black/70 backdrop-blur-lg rounded-3xl shadow-2xl text-gray-200"
      role="main"
      aria-label="User profile"
    >
      <div className="flex flex-col md:flex-row gap-12">
        {/* Sidebar */}
        <aside className="flex flex-col items-center md:items-start md:w-1/3 sticky top-24 self-start space-y-6">
          <motion.img
            src={userData.img}
            alt={`${userData.username}'s profile picture`}
            className="w-44 h-44 rounded-full object-cover border-4 border-gradient-to-tr from-red-500 via-pink-600 to-purple-700 shadow-xl"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          />
          <motion.h1
            className="text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-red-600 to-yellow-400 uppercase tracking-wide select-none"
            initial={{ x: -30, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {userData.username}
          </motion.h1>
        </aside>

        {/* Main Content */}
        <main className="md:w-2/3 space-y-14">
          {[
            { title: "About Me", content: userData.about, isList: false },
            { title: "Skills", content: userData.skill, isList: true },
            { title: "Experience", content: userData.exp, isList: true },
            { title: "Education", content: userData.edu, isList: true },
          ].map(({ title, content, isList }) => (
            <section key={title} aria-labelledby={`${title.toLowerCase().replace(/\s+/g, "-")}-heading`}>
              <motion.h2
                id={`${title.toLowerCase().replace(/\s+/g, "-")}-heading`}
                className="text-3xl font-semibold mb-6 bg-gradient-to-r from-pink-500 via-red-600 to-yellow-400 bg-clip-text text-transparent tracking-wider"
                initial={{ y: 15, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                {title}
              </motion.h2>

              {isList ? (
                <motion.ul
                  className="list-disc list-inside space-y-2 text-lg text-gray-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  {content.map((item, i) => (
                    <li
                      key={i}
                      className="hover:text-pink-400 transition-colors cursor-default"
                      title={item}
                    >
                      {item}
                    </li>
                  ))}
                </motion.ul>
              ) : (
                <motion.p
                  className="text-lg leading-relaxed max-w-prose"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                >
                  {content}
                </motion.p>
              )}
            </section>
          ))}
        </main>
      </div>
    </motion.div>
  );
};

export default Profile;
