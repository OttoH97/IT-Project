import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

    const handleClick = () => {
        window.scrollTo(0, 0);
      };

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination">
        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => {onPageChange(currentPage - 1);handleClick()}}>
            Previous
          </button>
        </li>
        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => {onPageChange(currentPage + 1); handleClick()}}>
            Next
          </button>
        </li>
      </ul>
    </nav>

)};

export default Pagination;