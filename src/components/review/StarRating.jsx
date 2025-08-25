import React, { useState } from "react";

const StarRating = ({ value = 0, onChange, readOnly = false, size = "md" }) => {
  const [hover, setHover] = useState(0);
  const sizes = { sm: "text-base", md: "text-xl", lg: "text-2xl" };
  const cls = sizes[size] || sizes.md;
  const current = hover || value;

  const Star = ({ i }) => {
    const filled = i <= current;
    return (
      <button
        type="button"
        disabled={readOnly}
        onMouseEnter={() => !readOnly && setHover(i)}
        onMouseLeave={() => !readOnly && setHover(0)}
        onClick={() => !readOnly && onChange?.(i)}
        aria-label={`Rate ${i} star${i > 1 ? "s" : ""}`}
        className={readOnly ? "cursor-default" : "cursor-pointer"}
      >
        <span
          className={`${cls} ${filled ? "text-yellow-500" : "text-gray-300"}`}
        >
          ★
        </span>
      </button>
    );
  };

  return (
    <div
      role="img"
      aria-label={`${current} out of 5 stars`}
      className="inline-flex items-center gap-1"
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} i={i} />
      ))}
    </div>
  );
};

export default StarRating;
