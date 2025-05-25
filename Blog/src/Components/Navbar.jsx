import { NavLink } from "react-router-dom";
import useAuth  from "../context/useAuth";
import { useState, useEffect } from "react";
import { refreshTokens } from "../Api/api"; // import your custom hook

const Navbar = () => {


  const { user } = useAuth();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await api.get("/profile", { withCredentials: true }); // Sends cookies with request
        setIsAuthenticated(true); // If the request is successful, the user is authenticated
      } catch (error) {
          refreshTokens();
          setIsAuthenticated(false); // If there's an error, the user is not authenticated
        }
      };

      checkAuthStatus(); // Call the function to check authentication on mount
    }, [user]);

  return (
    <nav className=" border-b-1 text-black sticky top-0 z-50 w-dvw overflow-hidden">
      <ul className="flex gap-5 text-b  justify-between items-center p-5 text-2xl">
        {!user ? (
          <li>
            ProfileName
          </li>
        ) : (
          <li>
           {user.toUpperCase()}
          </li>
        )}

        <div className="flex space-x-5">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) =>
                `border-b-1 ${
                  isActive ? "border-white" : "border-transparent"
                } hover:border-white transition-all duration-300`
              }
            >
              Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/projects"
              className={({ isActive }) =>
                `border-b-1 ${
                  isActive ? "border-white" : "border-transparent"
                } hover:border-white transition-all duration-300`
              }
            >
              Projects
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `border-b-1 ${
                  isActive ? "border-white" : "border-transparent"
                } hover:border-white transition-all duration-300`
              }
            >
              About
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/user"
              className={({ isActive }) =>
                `border-b-1 ${
                  isActive ? "border-black" : "border-transparent"
                } hover:border-black transition-all duration-300`
              }
            >
              Users
            </NavLink>
          </li>
        </div>
      </ul>
    </nav>
  );
};

export default Navbar;
