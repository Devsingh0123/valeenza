import React from "react";

const StarRating = ({ value = 0, size = 14 }) => (
  <div className="flex gap-0.5 items-center">
    {[1, 2, 3, 4, 5].map((s) => (
      <svg
        key={s}
        width={size}
        height={size}
        viewBox="0 0 20 20"
        fill={s <= Math.round(value) ? "#d97706" : "#e5e7eb"}
      >
        <path d="M10 1l2.39 4.85L18 6.62l-4 3.9.94 5.52L10 13.4l-4.94 2.64.94-5.52-4-3.9 5.61-.77z" />
      </svg>
    ))}
  </div>
);

export default StarRating;