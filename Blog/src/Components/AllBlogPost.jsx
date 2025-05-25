import { useState } from "react";
import Pagination from "./Pagination";
import { Link, NavLink } from "react-router";

const AllBlogPost = ({ items }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3; // Customize per page count

   const startIndex = (currentPage - 1) * itemsPerPage;
   const currentItems = items.slice(startIndex, startIndex + itemsPerPage);

  return (
    <>
      <h1>All Blog Posts</h1>
      <div className="grid grid-cols-3 gap-8 pt-7 px-15 w-7xl">
        {currentItems.map((item, index) => (
          <NavLink to={`/blog/${item.id}`}>
          <div key={item.id} className="bg-black p-4 rounded-md">
            {item.image && (
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-auto object-cover rounded-md object-center"
              />
            )}
            <h2 className="text-lg font-bold">{item.title}</h2>
            <p className="truncate-text">{item.description}</p>
          </div>
          </NavLink>
        ))}
      </div>
      {/* Pagination Component */}
      <Pagination
        totalItems={items.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </>
  );
};

export default AllBlogPost;
