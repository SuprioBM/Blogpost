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
      aria-label="Pagination"
      className="flex flex-wrap items-center justify-center mt-8 gap-2 sm:gap-3"
    >
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        ← Prev
      </button>

      {getPageNumbers().map((page, idx) => (
        <button
          key={idx}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
          aria-current={page === currentPage ? "page" : undefined}
          className={`px-4 py-2 rounded-full text-sm transition font-medium ${
            page === currentPage
              ? "bg-indigo-600 text-white shadow-md"
              : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
          } ${
            page === "..." ? "cursor-default text-gray-500" : "cursor-pointer"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-4 py-2 rounded-full border border-gray-700 bg-gray-800 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next →
      </button>
    </nav>
  );
};

export default Pagination;
