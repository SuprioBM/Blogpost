import { NavLink } from "react-router-dom";

const NoUserAbout = () => {
  return (
    <>
      <header className="flex justify-between items-center px-6 py-4 border-b border-gray-700 relative">
        <h1 className="text-6xl sm:text-7xl md:text-8xl font-extrabold text-red-600 select-none">
          BlogSite
        </h1>
        <nav>
          <ul className="flex gap-6 text-lg md:text-xl font-semibold text-red-500">
            <li>
              <NavLink
                to="/signin"
                className={({ isActive }) =>
                  isActive
                    ? "text-red-700 underline underline-offset-4"
                    : "hover:text-red-700 transition"
                }
              >
                Sign In
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  isActive
                    ? "text-red-700 underline underline-offset-4"
                    : "hover:text-red-700 transition"
                }
              >
                Sign Up
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main className="flex justify-center items-center min-h-[60vh] px-4">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-200 max-w-lg">
          Please <span className="text-red-500">Sign In</span> or{" "}
          <span className="text-red-500">Sign Up</span> to view this page.
        </h2>
      </main>
    </>
  );
};

export default NoUserAbout;
