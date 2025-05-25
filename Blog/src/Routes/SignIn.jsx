import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom";
import { api } from "../Api/api";
import useAuth from "../context/useAuth";

const SignIn = () => {
  const { signin } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData);

    try {
      const res = await api.post(
        "/signin",
        {
          username: user.name,
          password: user.password,
        },
        {
          withCredentials: true,
        }
      );

      signin(user.name);
      setError(res.data.message);
      setTimeout(() => setError(""), 3000);

      if (res.status === 200) {
        e.target.reset();
        return navigate("/");
      }
    } catch (error) {
      setError(error.response?.data?.message || "Something went wrong.");
      setTimeout(() => setError(""), 3000);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex flex-col items-center justify-center max-w-sm w-full mx-auto p-6 bg-white bg-opacity-90 shadow-lg rounded-lg border border-gray-200">
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-center font-medium">
            {error}
          </div>
        )}
        <h1 className="border-b-2 border-blue-600 pb-2 mb-5 text-2xl font-semibold text-gray-800">
          Sign In
        </h1>

        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Username
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
              placeholder="username"
              required
              autoComplete="username"
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 pr-10"
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={passwordVisible ? "Hide password" : "Show password"}
                className="absolute right-3 top-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <EyeSlashIcon className="w-5 h-5" />
                ) : (
                  <EyeIcon className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
