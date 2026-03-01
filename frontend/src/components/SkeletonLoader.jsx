import React from 'react';

/**
 * SkeletonLoader Component
 * Displays skeleton rows while loading data
 */
const SkeletonLoader = ({ rows = 5 }) => {
  return (
    <>
      {Array.from({ length: rows }).map((_, index) => (
        <tr key={`skeleton-${index}`} className="skeleton-row">
          <td><div className="skeleton-text skeleton-short"></div></td>
          <td><div className="skeleton-text skeleton-medium"></div></td>
          <td><div className="skeleton-text skeleton-short"></div></td>
          <td><div className="skeleton-text skeleton-short"></div></td>
          <td><div className="skeleton-text skeleton-short"></div></td>
          <td><div className="skeleton-text skeleton-short"></div></td>
          <td><div className="skeleton-text skeleton-short"></div></td>
        </tr>
      ))}
    </>
  );
};

export default SkeletonLoader;
