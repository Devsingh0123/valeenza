// src/components/gemstones/GemstoneInfoCard.jsx
import React from "react";
import { Link } from "react-router-dom";

const GemstoneInfoCard = ({ gemstone }) => {
  const { name, id, slug, image } = gemstone;

  return (
    <Link
      to={`/gemstones/${slug}`}
       title={name} 
      className="group block bg-white transition-all duration-300 overflow-hidden"
    >
      {/* Top: Name */}
      <div className="text-center py-2 px-3 bg-amber-500">
        <h3
          className="text-sm truncate font-bold text-white/85 group-hover:text-orange-600 transition-colors"
          title={name} 
        >
          {name}
        </h3>
      </div>

      {/* Image */}
      <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <img
          src={image}
          alt={name}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300 drop-shadow-md"
        />
      </div>

      {/* Bottom: Description */}
      <div className="pl-2 py-2">
        <div className="text-gray-600 text-sm">
          <span
            className="text-orange-600 truncate group-hover:text-orange-700"
            title={name} 
          >
            {name}
          </span>
          {/* <span>{` - ${shortDesc}`}</span> */}
        </div>
      </div>
    </Link>
  );
};

export default GemstoneInfoCard;