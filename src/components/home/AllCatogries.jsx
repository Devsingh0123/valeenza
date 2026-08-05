import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AllCatogries = () => {
  const navigate = useNavigate();
  const { productCategories, loading, error } = useSelector((state) => state.product);

const product_Categories = [...productCategories,...productCategories,...productCategories,...productCategories]


  // No categories
  if (!productCategories || productCategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-gray-200 pb-3 px-4">
      <div className=" mx-auto">
        {/* FIX: 'scrollbar-hide' add kiya gaya hai taaki desktop par ugly scrollbar na dikhe */}
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide select-none">
          {product_Categories?.map((category, index) => (
            <div
              key={`${category.id}-${index}`} // FIX: Unique key to avoid React warning
              onClick={() => navigate(`/category/${category.slug}`)}
              className="flex flex-col items-center gap-1.5 cursor-pointer flex-shrink-0 transition-transform hover:scale-105"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-slate-100 overflow-hidden border border-slate-100 p-1 shadow-sm">
                <img
                  src={category?.cat_image}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="text-xs font-medium text-slate-700 max-w-[80px] text-center truncate">
                {category.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllCatogries;