import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const AllCatogries = () => {
  const navigate = useNavigate();
  const { productCategories, loading, error } = useSelector((state) => state.product);




  // No categories
  if (!productCategories || productCategories.length === 0) {
    return null;
  }

  return (
    <div className="w-full border-b border-gray-200 pb-3 px-4 sm:hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {productCategories?.map((category) => (
            <div
              key={category.id }
              onClick={() => navigate(`/category/${category.slug}`)}
              className="flex flex-col items-center gap-1 cursor-pointer flex-shrink-0 transition-transform hover:scale-105"
            >
              <div className="w-20 h-20  rounded overflow-hidden ">
              
                  <img
                    src={category?.cat_image}
                    alt={category.name}
                    className="w-full h-full object-cover"
                  />
              
              </div>
              <span className="text-xs font-normal text-gray-900  max-w-[80px] text-center">
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