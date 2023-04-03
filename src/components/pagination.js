import React from 'react';
import PropTypes from 'prop-types';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {

  return (
    <nav aria-label="Page navigation">
      <ul className="pagination">
        <li className={`page-item${currentPage === 1 ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage - 1)}>
            Previous
          </button>
        </li>
        <li className={`page-item${currentPage === totalPages ? ' disabled' : ''}`}>
          <button className="page-link" onClick={() => onPageChange(currentPage + 1)}>
            Next
          </button>
        </li>
      </ul>
    </nav>

)};

export default Pagination;