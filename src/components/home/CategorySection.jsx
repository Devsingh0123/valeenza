// components/home/CategorySection.jsx
import React, { forwardRef, useRef } from 'react';
import ProductCard from '../product/ProductCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CategorySection = ({ category, products, onAddToCart }) => {
  const scrollContainerRef = useRef(null);


  // console.log("catProduct", products)

  if (!products.length) return null;

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div  id={`category-${category.slug}`} className="scroll-mt-[110px]">
      {/* Header with category icon, name, count, and navigation arrows */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {/* <span className="text-xl sm:text-2xl">{category.icon}</span> */}
          <h3 className="text-base sm:text-lg font-bold whitespace-nowrap text-stone-900">
            {category.label}
          </h3>
          <span className="text-xs text-stone-400 font-semibold">({products.length})</span>
        </div>
        <hr className='w-full  text-gray-200 ml-2 mr-2' />
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-1.5 rounded-full border border-gray-300 hover:bg-amber-600 hover:text-white transition"
            aria-label="Scroll left"
          >
            <ChevronLeft size={18} className='hidden sm:block' />
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-1.5 rounded-full border border-gray-300 hover:bg-amber-600 hover:text-white transition"
            aria-label="Scroll right"
          >
            <ChevronRight size={18} className='hidden sm:block' />
          </button>
        </div>
      </div>

      {/* Horizontal scrollable product row */}
      <div
        ref={scrollContainerRef}
        className="overflow-x-auto scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <div className="flex gap-2">
          {products.map(product => (
            <div key={product.id} className="w-[160px] sm:w-[180px] md:w-[200px] flex-shrink-0">
              <ProductCard product={product} addToCart={onAddToCart} compact />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

CategorySection.displayName = 'CategorySection';

export default CategorySection;