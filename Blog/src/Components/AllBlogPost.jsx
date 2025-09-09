import { useState } from "react";
import Pagination from "./Pagination";
import { NavLink } from "react-router-dom";

const AllBlogPost = ({ items }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  const totalPages = Math.ceil(items.length / itemsPerPage);

  // Handle Prev/Next page buttons
  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-12 text-gray-100 bg-gray-900 min-h-screen">
      <h1 className="text-4xl font-extrabold text-center mb-12 tracking-wide border-b-4 border-indigo-600 pb-3">
        All Blog Posts
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {currentItems.map((item, index) => (
          <NavLink
            key={item.id}
            to={`/blog/${item.id}`}
            className="transform transition duration-300 hover:scale-105 hover:shadow-xl shadow-lg rounded-2xl bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 overflow-hidden flex flex-col animate-fadeIn will-change-transform will-change-opacity"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            {item.image ? (
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="w-full h-52 object-cover rounded-t-2xl"
              />
            ) : (
              <div className="w-full h-52 bg-gradient-to-r from-indigo-900 via-gray-800 to-indigo-900 flex items-center justify-center rounded-t-2xl">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-indigo-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="ml-3 text-indigo-400 font-semibold">
                  No Image
                </span>
              </div>
            )}
            <div className="p-6 flex flex-col flex-grow">
              <h2 className="text-2xl font-semibold text-gray-100 hover:text-indigo-400 transition line-clamp-2 mb-3 tracking-wide">
                {item.title}
              </h2>
              <p className="text-gray-300 text-sm line-clamp-3 flex-grow">
                {item.description}
              </p>
            </div>
          </NavLink>
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-12 flex justify-center items-center space-x-3 select-none">
        <button
          onClick={goToPrev}
          disabled={currentPage === 1}
          aria-disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg transition ${
            currentPage === 1
              ? "bg-gray-700 cursor-not-allowed text-gray-400"
              : "bg-indigo-700 text-white hover:bg-indigo-600"
          }`}
        >
          Previous
        </button>

        <Pagination
          totalItems={items.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          className="space-x-2"
          buttonClassName="px-4 py-2 rounded-lg bg-indigo-700 text-white hover:bg-indigo-600 transition"
          activeButtonClassName="bg-indigo-500 shadow-lg"
          aria-current="page"
        />

        <button
          onClick={goToNext}
          disabled={currentPage === totalPages}
          aria-disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg transition ${
            currentPage === totalPages
              ? "bg-gray-700 cursor-not-allowed text-gray-400"
              : "bg-indigo-700 text-white hover:bg-indigo-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AllBlogPost;
