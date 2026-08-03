// components/home/HomeNav.jsx
import React from 'react';
import { Filter } from 'lucide-react';

const HomeNav = ({ 
  filters, 
  setFilters, 
  isSidebarOpen,
  onToggleSidebar
}) => {
  const buttonText = isSidebarOpen ? 'Hide' : 'Show';

  return (
    <div className="bg-white rounded-xl border border-stone-200 p-2 sm:p-3 md:p-4 flex items-center gap-2 sm:gap-3 shadow-md">
      {/* Filter Button */}
      <button
        onClick={onToggleSidebar}
        className="flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg text-gray-900 hover:text-amber-600 transition-all duration-200 cursor-pointer group border  border-gray-200"
        aria-label="Toggle filters"
      >
        <Filter className="w-5 h-5 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform" />
        <span className="text-xs sm:text-sm font-normal group-hover:text-amber-600">
          {buttonText}
        </span>
      </button>

      {/* Search Input */}
      <div className="relative flex-1">
        <svg
          width={16}
          height={16}
          viewBox="0 0 24 24"
          fill="none"
          stroke="#a8a29e"
          strokeWidth={2}
          strokeLinecap="round"
          className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400"
        >
          <circle cx={11} cy={11} r={8} />
          <line x1={21} y1={21} x2={16.65} y2={16.65} />
        </svg>
        <input
          type="text"
          value={filters.search}
          onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
          placeholder="Search products…"
          className="w-full py-1.5 sm:py-2 pl-8 sm:pl-10 pr-3 rounded-lg border border-stone-200 text-sm outline-none bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-200 transition"
        />
      </div>

      {/* Sort Dropdown */}
      <select
        value={filters.sort || "default"}
        onChange={(e) => setFilters(prev => ({ ...prev, sort: e.target.value }))}
        className="w-auto py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border border-stone-200 text-sm outline-none bg-white cursor-pointer focus:border-amber-500 focus:ring-1 focus:ring-amber-200 transition"
      >
        <option value="default">Sort</option>
        <option value="price-asc">Price ↑</option>
        <option value="price-desc">Price ↓</option>
        <option value="rating">Rating</option>
        <option value="name">Name</option>
      </select>
    </div>
  );
};

export default HomeNav;