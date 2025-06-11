import { NavLink } from "react-router-dom";
import useAuth from "../context/useAuth";
import { useState, useEffect } from "react";
import { api, refreshTokens } from "../Api/api";
import { FiUser, FiMenu, FiX } from "react-icons/fi";

const Navbar = () => {
  const { user, signout } = useAuth();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);

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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const windowHeight = window.innerHeight;
      const docHeight = document.documentElement.scrollHeight;

      const isScrollingUp = prevScrollPos > currentScrollPos;
      const isAtTop = currentScrollPos <= 10;
      const isAtBottom = currentScrollPos + windowHeight >= docHeight - 10;

      // Show navbar if scrolling up and not at bottom OR if at top
      if ((isScrollingUp && !isAtBottom) || isAtTop) {
        setVisible(true);
      } else {
        setVisible(false);
      }

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const handleSignOut = async () => {
    try {
      await api.post("/signout", {}, { withCredentials: true });
      signout();
      setIsMenuOpen(false);
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
    <nav
      className={`fixed top-0 left-0 right-0 transition-transform duration-500 ease-in-out bg-gray-900 shadow-lg z-50 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo / User */}
        <div className="flex items-center gap-3 select-none">
          <div className="p-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full text-white text-xl">
            <FiUser />
          </div>
          <span className="text-white font-semibold tracking-wide text-lg">
            {user ? user.toUpperCase() : "GUEST"}
          </span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-12 text-white font-medium text-lg tracking-wide">
          {links.map(({ path, label }) => (
            <li key={path} className="relative group">
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `transition-colors duration-300 ${
                    isActive
                      ? "text-indigo-400 font-semibold"
                      : "hover:text-indigo-500"
                  }`
                }
              >
                {label}
                <span className="absolute left-0 -bottom-1 h-0.5 bg-indigo-400 w-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
              </NavLink>
            </li>
          ))}
        </ul>

        {/* Sign In / Out desktop */}
        <div className="hidden md:flex items-center gap-6">
          {!user ? (
            <>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  `text-indigo-400 font-semibold hover:text-indigo-600 transition ${
                    isActive ? "underline" : ""
                  }`
                }
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  `text-indigo-400 font-semibold hover:text-indigo-600 transition ${
                    isActive ? "underline" : ""
                  }`
                }
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <button
              onClick={handleSignOut}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition"
            >
              Sign Out
            </button>
          )}
        </div>

        {/* Hamburger Icon */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white text-3xl focus:outline-none hover:text-indigo-400 transition"
            aria-label="Toggle Menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`bg-gray-800 border-t border-gray-700 shadow-inner transition-all duration-300 overflow-hidden ${
          isMenuOpen ? "max-h-screen py-6" : "max-h-0 py-0"
        }`}
      >
        <ul className="flex flex-col gap-6 px-6 text-white text-lg font-semibold tracking-wide">
          {links.map(({ path, label }) => (
            <li key={path}>
              <NavLink
                to={path}
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-1 transition-colors duration-300 ${
                    isActive
                      ? "text-indigo-400 underline"
                      : "hover:text-indigo-500"
                  }`
                }
              >
                {label}
              </NavLink>
            </li>
          ))}

          {/* Auth buttons mobile */}
          {!user ? (
            <>
              <NavLink
                to="/signin"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-1 text-indigo-400 font-semibold hover:text-indigo-600 transition ${
                    isActive ? "underline" : ""
                  }`
                }
              >
                Sign In
              </NavLink>
              <NavLink
                to="/signup"
                onClick={() => setIsMenuOpen(false)}
                className={({ isActive }) =>
                  `block py-1 text-indigo-400 font-semibold hover:text-indigo-600 transition ${
                    isActive ? "underline" : ""
                  }`
                }
              >
                Sign Up
              </NavLink>
            </>
          ) : (
            <button
              onClick={handleSignOut}
              className="w-full text-left text-indigo-400 font-semibold hover:text-indigo-600 transition py-1"
            >
              Sign Out
            </button>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
