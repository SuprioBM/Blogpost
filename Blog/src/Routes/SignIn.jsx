import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/20/solid";
import { useNavigate } from "react-router-dom"; 
import {api} from '../Api/api';
import useAuth from '../context/useAuth'

const SignIn = () => {

  const {signin} = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);



  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const user = Object.fromEntries(formData);

      try {
      
        const res = await api.post('/signin',
          {
            username: user.name,
            password: user.password,
          },
          {
            withCredentials: true,
          }
        );
        signin(user.name)
        setError(res.data.message);
           setTimeout(() => {
             setError("");
           }, 3000);
        if(res.status === 200) return navigate('/')
      } catch (error) {
        setError(error.response.data.message);
           setTimeout(() => {
             setError("");
           }, 3000);
      }
 
    e.target.reset();
    console.log(user);
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center justify-center max-w-sm w-full mx-auto p-6 bg-blur-xl shadow-md rounded-lg border-1">
        {error && <div>{error}</div>}
        <h1 className="border-b-2 pb-2 mb-5">Sign In </h1>

        <form className="w-full" onSubmit={handleSubmit}>
          <div className="mb-5">
            <label
              htmlFor="name"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
            >
              Username
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="username"
              required
            />
          </div>

          <div className="mb-5">
            <label
              htmlFor="password"
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-black"
            >
              Password
            </label>
            <div className="relative">
              <input
                type={passwordVisible ? "text" : "password"}
                id="password"
                name="password"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                required
              />
              <button
                type="button"
                className="absolute right-3 top-3"
                onClick={() => setPasswordVisible(!passwordVisible)}
              >
                {passwordVisible ? (
                  <EyeSlashIcon className="w-5 h-5 text-gray-500" />
                ) : (
                  <EyeIcon className="w-5 h-5 text-gray-500" />
                )}
              </button>
            </div>
          </div>

      

          <button
            type="submit"
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignIn;
