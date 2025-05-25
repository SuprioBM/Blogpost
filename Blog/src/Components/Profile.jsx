import { api, refreshTokens } from "../Api/api"
import { useEffect, useState } from "react";
import NoUserAbout from "./NoUserAbout";

const Profile = () => {
  const [userData,setUserData]  = useState(null);
    

    useEffect(() => {
      const checkAuthStatus = async () => {
        try {
          const res = await api.get("/profile", { withCredentials: true });
          setUserData(res.data.userdata)
          
        } catch (error) {
          refreshTokens();
          console.log(error)
        }
      };
      
      checkAuthStatus();
    }, []);

    if (!userData) {
      return <NoUserAbout />;
    }

    return (
      <div className="w-dvw">
        <div className="flex justify-center items-center flex-row-reverse px-7 relative pb-6 pt-2 border-b-1">
          <img src={userData.img} alt="profile image" className="img" />
          <h1 className="text-9xl">{userData.username.toUpperCase()}</h1>
        </div>
          <div className="flex flex-col gap-10 pl-10 pt-10 pr-0">
            <div>
              <h2 className="text-4xl pb-4">About Me</h2>
              <p className="text-xl">{userData.about}</p>
            </div>
            <div>
              <h2 className="text-4xl pb-4">Skills</h2>
              {userData.skill.map((s, index) => (
                <li key={index} className="text-xl">
                  {s}
                </li>
              ))}
            </div>
            <div>
              <h2 className="text-4xl pb-4">Experince</h2>
              {userData.exp.map((s, index) => (
                <li key={index} className="text-xl">
                  {s}
                </li>
              ))}
            </div>
            <div>
              <h2 className="text-4xl pb-4">Education</h2>
              {userData.edu.map((s, index) => (
                <li key={index} className="text-xl">
                  {s}
                </li>
              ))}
            </div>
          </div>
          <hr className="mb-15 mt-8" />
      </div>
    );
}
export default Profile