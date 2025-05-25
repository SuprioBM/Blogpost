import { NavLink } from "react-router-dom";

const NoUserAbout = () => {
  return (
    <>

      <main className="flex justify-center items-center min-h-[60vh] px-4">
        <h2 className="text-center text-3xl sm:text-4xl md:text-5xl font-semibold text-gray-200 max-w-lg">
          Please <a href="/signin"><span className="text-red-500">Sign In</span></a> or{" "}
          <a href="signup"><span className="text-red-500">Sign Up</span></a> to view this page.
        </h2>
      </main>
    </>
  );
};

export default NoUserAbout;
