const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPageNumbersToShow = 5; // Limit the number of visible page numbers

  if (totalPages <= 1) return null; // No pagination needed if only one page

  const getPageNumbers = () => {
    const pages = [];
    const halfRange = Math.floor(maxPageNumbersToShow / 2);

    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, start + maxPageNumbersToShow - 1);

    if (end - start + 1 < maxPageNumbersToShow) {
      start = Math.max(1, end - maxPageNumbersToShow + 1);
    }

    if (start > 1) pages.push("...");
    for (let i = start; i <= end; i++) pages.push(i);
    if (end < totalPages) pages.push("...");

    return pages;
  };

  return (
    <div className="flex items-center justify-center mt-6 gap-2">
      <button
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Prev
      </button>

      {getPageNumbers().map((page, index) => (
        <button
          key={index}
          className={`px-4 py-2 rounded ${
            page === currentPage
              ? "bg-black text-white"
              : "bg-gray-200 hover:bg-gray-300"
          }`}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}

      <button
        className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
