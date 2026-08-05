import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, SlidersHorizontal, RotateCcw, X, ChevronDown } from "lucide-react";
import StarRating from "../common/StarRating";

const FilterSidebar = ({
  filters,
  setFilters,
  onClearFilters,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  const [expanded, setExpanded] = useState({
    sort: true,
    price: true,
    rating: true,
    discount: false,
  });

  // Background scroll disable jab drawer khula ho
  useEffect(() => {
    if (isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isSidebarOpen]);

  const toggleSection = (section) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <>
      {/* 1. BACKDROP OVERLAY (Fades in/out) */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => onToggleSidebar(false)}
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
          />
        )}
      </AnimatePresence>

      {/* 2. SLIDING DRAWER PANEL */}
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: isSidebarOpen ? 0 : "-100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 z-50 w-[280px] sm:w-[320px] bg-white shadow-2xl flex flex-col h-full border-r border-slate-200"
      >
        {/* ── FLOATING CHEVRON BUTTON (Right Border Par Chipka Hua) ── */}
        <button
          onClick={() => onToggleSidebar(!isSidebarOpen)}
          title={isSidebarOpen ? "Close filters" : "Open filters"}
          className="absolute top-30 left-full z-50 flex h-10 w-8 items-center justify-center rounded-r-xl bg-slate-900 text-white shadow-xl hover:bg-slate-800 transition-colors"
        >
          <ChevronRight
            size={20}
            className={`transition-transform duration-300 ${
              isSidebarOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>

        {/* Drawer Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-slate-700" />
            <h2 className="text-base font-bold text-slate-900">Filters</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearFilters}
              className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700 transition-colors px-2 py-1 rounded-md hover:bg-sky-50"
            >
              <RotateCcw size={12} />
              Reset
            </button>
            <button
              onClick={() => onToggleSidebar(false)}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-5">
          {/* Sort By Price */}
          <div>
            <SectionHeader
              title="Sort By Price"
              isOpen={expanded.sort}
              onToggle={() => toggleSection("sort")}
            />
            {expanded.sort && (
              <div className="mt-2.5 space-y-1.5">
                <RadioOption
                  label="Price: Low to High"
                  name="priceSort"
                  checked={filters.priceSort === "asc"}
                  onChange={() => updateFilter("priceSort", "asc")}
                />
                <RadioOption
                  label="Price: High to Low"
                  name="priceSort"
                  checked={filters.priceSort === "desc"}
                  onChange={() => updateFilter("priceSort", "desc")}
                />
              </div>
            )}
          </div>

          {/* Price Range */}
          <div>
            <SectionHeader
              title="Price Range"
              isOpen={expanded.price}
              onToggle={() => toggleSection("price")}
            />
            {expanded.price && (
              <div className="mt-2.5 space-y-3">
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={filters.minPrice || ""}
                    onChange={(e) => updateFilter("minPrice", e.target.value)}
                    placeholder="$ Min"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                  <span className="text-slate-400 text-xs font-medium">to</span>
                  <input
                    type="number"
                    value={filters.maxPrice || ""}
                    onChange={(e) => updateFilter("maxPrice", e.target.value)}
                    placeholder="$ Max"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: "< ₹1K", min: "", max: "1000" },
                    { label: "₹1K–₹3K", min: "1000", max: "3000" },
                    { label: "₹3K–₹5K", min: "3000", max: "5000" },
                    { label: "> ₹5K", min: "5000", max: "" },
                  ].map((range, index) => {
                    const isActive =
                      filters.minPrice === range.min && filters.maxPrice === range.max;
                    return (
                      <button
                        key={index}
                        onClick={() => {
                          updateFilter("minPrice", range.min);
                          updateFilter("maxPrice", range.max);
                        }}
                        className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                          isActive
                            ? "border-sky-500 bg-sky-50 text-sky-700"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Customer Rating */}
          <div>
            <SectionHeader
              title="Customer Rating"
              isOpen={expanded.rating}
              onToggle={() => toggleSection("rating")}
            />
            {expanded.rating && (
              <div className="mt-2.5 space-y-1">
                {[4, 3, 2, 1].map((rating) => (
                  <label
                    key={rating}
                    className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <input
                      type="radio"
                      name="rating"
                      checked={filters.minRating === String(rating)}
                      onChange={() => updateFilter("minRating", String(rating))}
                      className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
                    />
                    <StarRating value={rating} size={12} />
                    <span className="text-xs text-slate-600 font-medium">& Up</span>
                  </label>
                ))}
                <RadioOption
                  label="All Ratings"
                  name="rating"
                  checked={!filters.minRating}
                  onChange={() => updateFilter("minRating", "")}
                />
              </div>
            )}
          </div>

          {/* Discount */}
          <div>
            <SectionHeader
              title="Discount"
              isOpen={expanded.discount}
              onToggle={() => toggleSection("discount")}
            />
            {expanded.discount && (
              <div className="mt-2.5 space-y-1">
                {["50", "40", "30", "20", "10"].map((discount) => (
                  <RadioOption
                    key={discount}
                    label={`${discount}% or more`}
                    name="discount"
                    checked={filters.minDiscount === discount}
                    onChange={() => updateFilter("minDiscount", discount)}
                  />
                ))}
                <RadioOption
                  label="All Discounts"
                  name="discount"
                  checked={!filters.minDiscount}
                  onChange={() => updateFilter("minDiscount", "")}
                />
              </div>
            )}
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => onToggleSidebar(false)}
            className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </motion.div>
    </>
  );
};

const SectionHeader = ({ title, isOpen, onToggle }) => (
  <button
    type="button"
    onClick={onToggle}
    className="w-full flex items-center justify-between py-1.5 border-b border-slate-100 text-left select-none"
  >
    <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
      {title}
    </span>
    <ChevronDown
      size={14}
      className={`text-slate-400 transition-transform duration-200 ${
        isOpen ? "rotate-180" : "rotate-0"
      }`}
    />
  </button>
);

const RadioOption = ({ label, checked, onChange, name }) => (
  <label className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors text-xs font-medium text-slate-600">
    <input
      type="radio"
      name={name}
      checked={checked}
      onChange={onChange}
      className="w-3.5 h-3.5 accent-sky-600 cursor-pointer"
    />
    {label}
  </label>
);

export default FilterSidebar;