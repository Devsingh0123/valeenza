import React from "react";
import { Link, useNavigate } from "react-router-dom";
import StarRating from "../common/StarRating";
import { Gem } from "lucide-react";
import Slider from "../common/Slider";

const YouMayAlsoLikeCard = ({ product }) => {
  const navigate = useNavigate();
  const afterPrice = Number(product?.after_price) || 0;
  const beforePrice = Number(product?.before_price) || 0;
  const ratingValue = Number(product?.rating_avg) || 0;
  const imageUrl = product?.image || product?.images?.[0]?.image || "";

  const discountPercent =
    beforePrice > afterPrice && afterPrice > 0
      ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
      : 0;

  // const handleClick = () => {
  //   navigate(`/product/${product.id}`);
  // };

  return (
        <Link
      to={`/product/${product.slug}`}
      className="flex flex-col h-full bg-white rounded-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer group w-full"
    >
      <div className="relative aspect-square bg-gray-100 flex items-center justify-center flex-shrink-0 ">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product?.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <Gem className="w-12 h-12 text-gray-400 group-hover:text-amber-600 transition-colors group-hover:scale-105" />
        )}
        {discountPercent > 0 && (
          <div className="absolute top-2 right-2">
            <span className="bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-md shadow-md text-[10px] px-2 py-0.5">
              {discountPercent}% OFF
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-1 p-3">
        <h3 className="font-medium text-gray-800 text-sm truncate">
          {product?.name}
        </h3>
        <div className="mt-1 flex items-center gap-1 flex-wrap">
          <span className="text-amber-600 font-bold text-sm">
            ₹{afterPrice.toLocaleString()}
          </span>
          {beforePrice > afterPrice && (
            <span className="text-xs text-gray-400 line-through">
              ₹{beforePrice.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const ProductYouMayAlsoLike = ({ products = [] }) => {
  if (!products.length) return null;

  return (
    <section>
      <h2 className="text-xl font-bold text-gray-900 mb-4">You May Also Like</h2>
      <Slider slideCount={4}>
        {products.map((product) => (
          <div
              key={product.id}
              className="w-[160px] sm:w-[180px] md:w-[200px] flex-shrink-0"
            >
          <YouMayAlsoLikeCard key={product.id} product={product}  />
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default ProductYouMayAlsoLike;