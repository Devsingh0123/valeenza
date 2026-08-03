// components/features/FilterSidebar.jsx
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import StarRating from "../common/StarRating";
import { useNavigate } from "react-router-dom";

const FilterSidebar = ({
  selected,
  filters,
  setFilters,
  onClearFilters,
  className = "",
}) => {

  const {
    items: products,
    productCategories,
    loading,
  } = useSelector((state) => state.product);
  const navigate = useNavigate();



  const categoriesList = [
    { id: "all", slug: "all", label: "All" },
    ...productCategories
      .map((cat) => ({ id: String(cat.id), slug: cat.slug, label: cat.name }))
      .sort((a, b) => {
        const countA = products.filter(
          (p) => p.category?.slug === a.slug,
        ).length;
        const countB = products.filter(
          (p) => p.category?.slug === b.slug,
        ).length;
        return countB - countA;
      }),
  ];

  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    price: true,
    rating: true,
    discount: false,
  });

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const SectionHeader = ({ title, section }) => (
    <div
      onClick={() => toggleSection(section)}
      className={`flex items-center justify-between py-2 sm:py-2.5 cursor-pointer select-none border-b border-gray-100 ${
        expandedSections[section] ? "mb-2 sm:mb-3" : "mb-0"
      }`}
    >
      <span className="text-xs sm:text-sm font-semibold text-stone-800 tracking-wide uppercase">
        {title}
      </span>
      <svg
        width={14}
        height={14}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#78716c"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`transition-transform duration-200 w-3 h-3 sm:w-4 sm:h-4 ${
          expandedSections[section] ? "rotate-180" : "rotate-0"
        }`}
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );

  return (
    <div
      className={`bg-white rounded-xl sm:rounded-2xl border border-gray-100 shadow-md p-3 sm:p-4 md:p-5 overflow-y-auto scrollbar-hide ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 pb-2 sm:pb-3 border-b-2 border-gray-100">
        <div className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
          Filters
        </div>
        <button
          onClick={onClearFilters}
          className="bg-transparent border-none text-amber-600 text-xs sm:text-sm font-medium cursor-pointer underline hover:text-amber-700"
        >
          Clear All
        </button>
      </div>

      {/* Categories Section */}
      <div className="mb-4 sm:mb-5">
        <SectionHeader title="Categories" section="categories" />
        {expandedSections.categories && (
          <div className="space-y-1">
            {loading ? (
              <div className="text-xs text-stone-400">
                Loading categories...
              </div>
            ) : (
              categoriesList.map((cat) => {
                const active = selected === cat.slug;
                const count =
                  cat.id === "all"
                    ? products.length
                    : products.filter((p) => p.category?.slug === cat.slug)
                        .length;

                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      if (cat.id === "all") {
                        navigate("/");
                      } else {
                        navigate(`/category/${cat.slug}`);
                      }
                    }}
                    className={`w-full flex items-center gap-2 sm:gap-2.5 text-left px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-[9px] border-none cursor-pointer text-xs sm:text-sm transition-all ${
                      active
                        ? "bg-gradient-to-br from-amber-100 to-amber-200 text-amber-900 font-semibold shadow-[inset_0_0_0_1.5px_#fcd34d]"
                        : "bg-transparent text-stone-600 font-normal hover:bg-amber-200"
                    }`}
                  >
                    <span className="flex-1 truncate">{cat.label}</span>
                    <span className="text-[11px] sm:text-xs text-stone-400 font-normal">
                      {count}
                    </span>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="mb-4 sm:mb-5">
        <SectionHeader title="Price Range" section="price" />
        {expandedSections.price && (
          <div className="space-y-2 sm:space-y-3">
            {/* Min/Max Inputs */}
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="w-full sm:flex-1">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, minPrice: e.target.value }))
                  }
                  placeholder="Min"
                  className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg border border-gray-200 text-xs sm:text-sm outline-none focus:border-amber-600"
                />
              </div>
              <span className="text-stone-400 text-xs sm:text-sm">to</span>
              <div className="w-full sm:flex-1">
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, maxPrice: e.target.value }))
                  }
                  placeholder="Max"
                  className="w-full px-2 sm:px-2.5 py-1.5 sm:py-2 rounded-lg border border-gray-200 text-xs sm:text-sm outline-none focus:border-amber-600"
                />
              </div>
            </div>

            {/* Quick price filters */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {[
                { label: "Under ₹1K", min: "", max: "1000" },
                { label: "₹1K – ₹3K", min: "1000", max: "3000" },
                { label: "₹3K – ₹5K", min: "3000", max: "5000" },
                { label: "Above ₹5K", min: "5000", max: "" },
              ].map((range, i) => (
                <button
                  key={i}
                  onClick={() =>
                    setFilters((f) => ({
                      ...f,
                      minPrice: range.min,
                      maxPrice: range.max,
                    }))
                  }
                  className={`px-2.5 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-all ${
                    filters.minPrice === range.min &&
                    filters.maxPrice === range.max
                      ? "border-amber-300 bg-amber-100 text-amber-900"
                      : "border-gray-200 bg-white text-stone-600 hover:bg-gray-50"
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Rating Section */}
      <div className="mb-4 sm:mb-5">
        <SectionHeader title="Customer Rating" section="rating" />
        {expandedSections.rating && (
          <div className="space-y-1.5 sm:space-y-2">
            {[4, 3, 2, 1].map((rating) => (
              <label
                key={rating}
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg transition-colors hover:bg-stone-50"
              >
                <input
                  type="radio"
                  name="rating"
                  checked={filters.minRating === String(rating)}
                  onChange={() =>
                    setFilters((f) => ({ ...f, minRating: String(rating) }))
                  }
                  className="cursor-pointer w-3 h-3 sm:w-4 sm:h-4"
                />
                <StarRating value={rating} size={12} />
                <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
                  & Up
                </span>
              </label>
            ))}
            <label className="flex items-center gap-2 sm:gap-2.5 cursor-pointer px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg transition-colors hover:bg-stone-50">
              <input
                type="radio"
                name="rating"
                checked={filters.minRating === ""}
                onChange={() => setFilters((f) => ({ ...f, minRating: "" }))}
                className="cursor-pointer w-3 h-3 sm:w-4 sm:h-4"
              />
              <span className="text-[11px] sm:text-xs text-stone-500 font-medium">
                All Ratings
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Discount Section */}

      <div className="mb-2 sm:mb-5">
        <SectionHeader title="Discount" section="discount" />
        {expandedSections.discount && (
          <div className="space-y-1.5 sm:space-y-2">
            {["50", "40", "30", "20", "10"].map((discount) => (
              <label
                key={discount}
                className="flex items-center gap-2 sm:gap-2.5 cursor-pointer px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg transition-colors hover:bg-stone-50"
              >
                <input
                  type="radio" // 👈 radio button (single select)
                  name="discount"
                  value={discount}
                  checked={filters.minDiscount === discount}
                  onChange={() =>
                    setFilters((f) => ({ ...f, minDiscount: discount }))
                  }
                  className="cursor-pointer w-3 h-3 sm:w-4 sm:h-4"
                />
                <span className="text-[11px] sm:text-xs text-stone-600 font-medium">
                  {discount}% or more
                </span>
              </label>
            ))}
            {/* All Discounts option */}
            <label className="flex items-center gap-2 sm:gap-2.5 cursor-pointer px-1.5 sm:px-2 py-1 sm:py-1.5 rounded-lg transition-colors hover:bg-stone-50">
              <input
                type="radio"
                name="discount"
                checked={filters.minDiscount === ""}
                onChange={() => setFilters((f) => ({ ...f, minDiscount: "" }))}
                className="cursor-pointer w-3 h-3 sm:w-4 sm:h-4"
              />
              <span className="text-[11px] sm:text-xs text-stone-600 font-medium">
                All Discounts
              </span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
