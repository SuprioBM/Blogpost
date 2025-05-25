const Pagination = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange,
}) => {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const maxPageNumbersToShow = 5;

  if (totalPages <= 1) return null;

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
    <nav
      aria-label="Pagination Navigation"
      className="flex items-center justify-center mt-6 gap-3"
    >
      <button
        className="px-4 py-2 rounded border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Previous page"
      >
        Prev
      </button>

      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          aria-current={page === currentPage ? "page" : undefined}
          className={`px-4 py-2 rounded border transition ${
            page === currentPage
              ? "bg-red-600 text-white font-semibold shadow-lg border-red-500"
              : "bg-gray-900 text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white"
          } ${
            page === "..." ? "cursor-default text-gray-500" : "cursor-pointer"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        className="px-4 py-2 rounded border border-gray-700 bg-gray-900 text-gray-300 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Next page"
      >
        Next
      </button>
    </nav>
  );
};

export default Pagination;
