// components/features/FilterSidebar.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlidersHorizontal, ChevronLeft } from "lucide-react";
import StarRating from "../common/StarRating";

const FilterSidebar = ({
  filters,
  setFilters,
  onClearFilters,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    rating: true,
    discount: false,
  });

  const toggleSection = (section) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  const SectionHeader = ({ title, section }) => (
    <div
      onClick={() => toggleSection(section)}
      className={`flex items-center justify-between py-2.5 cursor-pointer select-none border-b border-slate-100 ${
        expandedSections[section] ? "mb-3" : "mb-0"
      }`}
    >
      <span className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
        {title}
      </span>
      <ChevronLeft
        size={14}
        className={`text-slate-400 transition-transform duration-200 ${
          expandedSections[section] ? "-rotate-90" : "rotate-0"
        }`}
      />
    </div>
  );

  return (
    <div className="relative flex items-start">
      {/* Animated filter panel */}
      <AnimatePresence initial={false}>
        {isSidebarOpen && (
          <motion.div
            key="sidebar"
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 220, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden shrink-0"
          >
            <div className="w-[220px] bg-white rounded-2xl border border-slate-100 shadow-sm p-4 mr-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <span className="text-sm font-bold text-slate-900">Filters</span>
                <button
                  onClick={onClearFilters}
                  className="text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors"
                >
                  Clear All
                </button>
              </div>

              {/* Price Range */}
              <div className="mb-5">
                <SectionHeader title="Price Range" section="price" />
                {expandedSections.price && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={filters.minPrice}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, minPrice: e.target.value }))
                        }
                        placeholder="Min"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-400"
                      />
                      <span className="text-slate-400 text-xs shrink-0">to</span>
                      <input
                        type="number"
                        value={filters.maxPrice}
                        onChange={(e) =>
                          setFilters((f) => ({ ...f, maxPrice: e.target.value }))
                        }
                        placeholder="Max"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-400"
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { label: "Under ₹1K", min: "", max: "1000" },
                        { label: "₹1K–₹3K", min: "1000", max: "3000" },
                        { label: "₹3K–₹5K", min: "3000", max: "5000" },
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
                          className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all ${
                            filters.minPrice === range.min &&
                            filters.maxPrice === range.max
                              ? "border-sky-300 bg-sky-50 text-sky-800"
                              : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                          }`}
                        >
                          {range.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Rating */}
              <div className="mb-5">
                <SectionHeader title="Customer Rating" section="rating" />
                {expandedSections.rating && (
                  <div className="space-y-1.5">
                    {[4, 3, 2, 1].map((rating) => (
                      <label
                        key={rating}
                        className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="radio"
                          name="rating"
                          checked={filters.minRating === String(rating)}
                          onChange={() =>
                            setFilters((f) => ({ ...f, minRating: String(rating) }))
                          }
                          className="cursor-pointer w-3.5 h-3.5"
                        />
                        <StarRating value={rating} size={12} />
                        <span className="text-xs text-slate-500 font-medium">& Up</span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors hover:bg-slate-50">
                      <input
                        type="radio"
                        name="rating"
                        checked={filters.minRating === ""}
                        onChange={() => setFilters((f) => ({ ...f, minRating: "" }))}
                        className="cursor-pointer w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-500 font-medium">All Ratings</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Discount */}
              <div>
                <SectionHeader title="Discount" section="discount" />
                {expandedSections.discount && (
                  <div className="space-y-1.5">
                    {["50", "40", "30", "20", "10"].map((discount) => (
                      <label
                        key={discount}
                        className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors hover:bg-slate-50"
                      >
                        <input
                          type="radio"
                          name="discount"
                          value={discount}
                          checked={filters.minDiscount === discount}
                          onChange={() =>
                            setFilters((f) => ({ ...f, minDiscount: discount }))
                          }
                          className="cursor-pointer w-3.5 h-3.5"
                        />
                        <span className="text-xs text-slate-600 font-medium">
                          {discount}% or more
                        </span>
                      </label>
                    ))}
                    <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg transition-colors hover:bg-slate-50">
                      <input
                        type="radio"
                        name="discount"
                        checked={filters.minDiscount === ""}
                        onChange={() => setFilters((f) => ({ ...f, minDiscount: "" }))}
                        className="cursor-pointer w-3.5 h-3.5"
                      />
                      <span className="text-xs text-slate-600 font-medium">All Discounts</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle tab — always visible on the left edge */}
      <button
        onClick={onToggleSidebar}
        title={isSidebarOpen ? "Hide filters" : "Show filters"}
        className="flex flex-col items-center justify-center gap-1.5 py-3 px-1.5 rounded-xl bg-white border border-slate-100 shadow-sm text-slate-500 hover:text-sky-600 hover:border-sky-200 transition-all duration-200 self-start mt-0 shrink-0"
      >
        <SlidersHorizontal size={15} />
        <span
          className="text-[10px] font-semibold tracking-wide uppercase"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
        >
          {isSidebarOpen ? "Hide" : "Filter"}
        </span>
      </button>
    </div>
  );
};

export default FilterSidebar;
