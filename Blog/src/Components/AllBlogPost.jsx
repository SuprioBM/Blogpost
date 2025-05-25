import { useState } from "react";
import Pagination from "./Pagination";
import { NavLink } from "react-router";

const AllBlogPost = ({ items }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-white">
      <h1 className="text-3xl font-bold text-center mb-8">
        All Blog Posts
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {currentItems.map((item) => (
          <NavLink key={item.id} to={`/blog/${item.id}`}>
            <div className="bg-black shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              {item.image ? (
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center ">
                  No Image
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold  mb-2 line-clamp-2">
                  {item.title}
                </h2>
                <p className="text-sm line-clamp-3">
                  {item.description}
                </p>
              </div>
            </div>
          </NavLink>
        ))}
      </div>

      <div className="mt-10">
        <Pagination
          totalItems={items.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export default AllBlogPost;
