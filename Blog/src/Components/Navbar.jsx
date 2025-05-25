import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";
import { useState, useEffect } from "react";
import { api,refreshTokens } from "../Api/api";
import { FiUser, FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const { user,signout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        await api.get("/profile", { withCredentials: true });
        setIsAuthenticated(true);
      } catch (error) {
        refreshTokens();
        setIsAuthenticated(false);
      }
    };
    checkAuthStatus();
  }, [user]);

    const handleSignOut = async () => {
      try {
        await api.post("/signout", {}, { withCredentials: true });
        signout();
      } catch (error) {
        console.error("Sign out error:", error);
      }
    };

  const links = [
    { path: "/", label: "Home" },
    { path: "/projects", label: "Projects" },
    { path: "/about", label: "About" },
    { path: "/user", label: "Users" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-md">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / User */}
        <div className="text-xl font-semibold text-red-800 flex items-center gap-2 select-none">
          <FiUser className="text-red-500" />
          {user ? user.toUpperCase() : "Guest"}
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-10 text-lg font-medium text-red-700">
          {links.map(({ path, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `relative pb-1 transition-colors duration-300 hover:text-red-500 ${
                    isActive ? "text-red-600 font-semibold" : ""
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {label}
                    <span
                      className={`absolute left-0 -bottom-0.5 h-[2px] w-full bg-red-500 transition-transform duration-300 ${
                        isActive ? "scale-x-100" : "scale-x-0"
                      }`}
                      style={{ transformOrigin: "left" }}
                    />
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-red-500 text-2xl focus:outline-none hover:text-red-600 transition-colors duration-200"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg- px-6 py-6 border-t border-gray-200 shadow-lg">
          <ul className="flex flex-col gap-6 text-lg text-red-700">
            {links.map(({ path, label }) => (
              <li key={path}>
                <NavLink
                  to={path}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    `block py-1 transition-colors duration-300 hover:text-red-500 ${
                      isActive ? "text-red-600 font-semibold" : ""
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {label}
                      <span
                        className={`block h-[2px] bg-red-500 mt-1 transition-transform duration-300 ${
                          isActive ? "scale-x-100" : "scale-x-0"
                        }`}
                        style={{ transformOrigin: "left" }}
                      />
                    </>
                  )}
                </NavLink>
              </li>
            ))}
            <div className="lg:hidden flex flex-col space-y-5 text-lg font-semibold text-red-500 ">
              {!user ? (
                <>
                  <NavLink
                    to="/signin"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "text-indigo-900 underline"
                        : "hover:text-indigo-900 transition"
                    }
                  >
                    Sign In
                  </NavLink>
                  <NavLink
                    to="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className={({ isActive }) =>
                      isActive
                        ? "text-indigo-900 underline"
                        : "hover:text-indigo-900 transition"
                    }
                  >
                    Sign Up
                  </NavLink>
                </>
              ) : (
                <button
                  onClick={() => {handleSignOut(),setIsMenuOpen(false)}}
                  className="text-red-600 hover:text-indigo-900 transition font-semibold"
                >
                  Sign Out
                </button>
              )}
            </div>
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
