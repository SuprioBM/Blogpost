import { NavLink } from "react-router-dom";

const NoUserAbout = () => {
  return (
    <main className="flex justify-center items-center min-h-[60vh] px-4">
      <div className="text-center max-w-xl">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-100 mb-6 leading-tight">
          You need to sign in to access this page.
        </h2>
        <p className="text-gray-400 mb-8 text-lg">
          Create an account or log in to unlock this content.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <NavLink
            to="/signin"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl transition duration-200"
          >
            Sign In
          </NavLink>
          <NavLink
            to="/signup"
            className="px-6 py-3 border border-indigo-500 text-indigo-400 hover:bg-indigo-500 hover:text-white font-medium rounded-xl transition duration-200"
          >
            Sign Up
          </NavLink>
        </div>
      </div>
    </main>
  );
};

export default NoUserAbout;
