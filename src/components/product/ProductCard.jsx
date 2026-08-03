import { useState } from "react";
import { Link } from "react-router-dom";
import StarRating from "../common/StarRating";
import { ShoppingBag } from "lucide-react";

const ProductCard = ({ product, addToCart, compact = false }) => {
  const [hovered, setHovered] = useState(false);

  // console.log(product);

  // Price extraction logic - handles both gemstones and regular products
  let afterPrice = 0;
  let beforePrice = 0;

  // Check if product has ratti_options (gemstone) and has at least one option
  if (product?.ratti_options && product.ratti_options.length > 0) {
    // For gemstones: take the first ratti option's price
    const defaultRattiOption = product.ratti_options[0];
    afterPrice = parseFloat(defaultRattiOption?.ratti_afterPrice) || 0;
    beforePrice = parseFloat(defaultRattiOption?.ratti_beforePrice) || 0;
  } else {
    // For regular products: use direct after_price/before_price
    afterPrice = parseFloat(product?.after_price) || 0;
    beforePrice = parseFloat(product?.before_price) || 0;
  }
  const ratingValue = parseFloat(product?.rating_avg) || 0;

  // default ratti
  const defaultRatti = product?.ratti_options?.length
    ? product.ratti_options[0].ratti
    : null;
  // Discount percentage
  const savings =
    beforePrice > afterPrice && afterPrice > 0
      ? Math.round(((beforePrice - afterPrice) / beforePrice) * 100)
      : 0;

  // Image fallback: product.image or first from images array
  const imageUrl = product?.image || "";

  // Conditional classes (unchanged)
  const cardClass = compact
    ? "bg-white rounded-sm overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all duration-250 flex flex-col  w-full"
    : "bg-white rounded-sm md:rounded-xl overflow-hidden border border-gray-100 transition-all duration-250 flex flex-col  hover:shadow-xl hover:-translate-y-0.5 shadow-md w-full cursor-pointer";

  const badgeSize = compact
    ? "text-[8px] px-1.5 py-0.5"
    : "text-[10px] px-2 py-0.5";
  const overlayButtonClass = compact
    ? "flex-1 py-1 bg-white text-amber-900 border border-amber-300 rounded-lg text-[9px] font-bold hover:bg-amber-50 transition-colors cursor-pointer"
    : "flex-1 py-1.5 bg-white text-amber-900 border border-amber-300 rounded-lg text-xs font-bold hover:bg-amber-50 transition-colors cursor-pointer";

  const overlayCartClass = compact
    ? "flex-1 py-1 bg-amber-600 text-white border-none rounded-lg text-[9px] font-bold flex items-center justify-center gap-0.5 hover:bg-amber-700 transition-colors cursor-pointer"
    : "flex-1 py-1.5 bg-amber-600 text-white border-none rounded-lg text-xs font-bold flex items-center justify-center gap-1 hover:bg-amber-700 transition-colors cursor-pointer";

  const nameClass = compact
    ? "text-[11px] font-bold text-stone-800 truncate"
    : "text-xs sm:text-sm font-bold text-stone-800 leading-snug line-clamp-2 mb-1.5";

  const priceClass = compact
    ? "text-xs font-extrabold text-stone-900"
    : "text-base sm:text-lg font-extrabold text-stone-900";

  const oldPriceClass = compact
    ? "text-[10px] text-stone-400 line-through"
    : "text-[10px] sm:text-xs text-stone-400 line-through";

  const ratingSize = compact ? 10 : 12;
  const ratingTextClass = compact ? "text-[8px]" : "text-[10px] sm:text-xs";
  const quickAddSize = compact ? "w-20 h-8" : "w-20 h-8";
  const quickAddIconSize = compact ? 10 : 14;
  

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cardClass}
    >
      {/* Image container */}
      <Link
        className="relative bg-stone-50 overflow-hidden aspect-square cursor-pointer"
        to={`/product/${product?.slug}`}
      >
        <img
          src={imageUrl}
          alt={product?.name}
          className={`w-full h-full object-cover transition-transform duration-350 ${
            hovered ? "scale-105" : "scale-100"
          }`}
          loading="lazy"
          onError={(e) => {
            e.target.src =
              "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' viewBox='0 0 200 200'%3E%3Crect width='200' height='200' fill='%23f0f0f0'/%3E%3Ctext x='50' y='115' font-family='Arial' font-size='16' fill='%23999'%3ENo image%3C/text%3E%3C/svg%3E";
          }}
        />

        {/* Badges */}
        {/* <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product?.isBestseller && (
            <span
              className={`bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-md tracking-wider uppercase shadow-md ${badgeSize}`}
            >
              ⚡ Best Seller
            </span>
          )}
        </div> */}

        {savings > 0 && (
          <div className="absolute top-2 right-2">
            <span
              className={`bg-gradient-to-br from-amber-600 to-amber-700 text-white font-bold rounded-md shadow-md ${badgeSize}`}
            >
              {savings}% OFF
            </span>
          </div>
        )}
      </Link>

      {/* Product info */}
      <div
        className={`${compact ? "p-1.5" : "p-2.5 sm:p-3.5"} flex-1 flex flex-col`}
      >
        <h3 className={nameClass}>{product?.name}</h3>

        {/* <div className="flex items-center gap-1 mb-1">
          <StarRating value={ratingValue} size={ratingSize} />
          <span className={`text-stone-500 font-semibold ${ratingTextClass}`}>
            {ratingValue.toFixed(1)}
          </span>
        </div> */}

        <div className="flex items-center gap-1 mb-1 text-green-600">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#18AC57"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-badge-percent-icon lucide-badge-percent"
          >
            <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
            <path d="m15 9-6 6" />
            <path d="M9 9h.01" />
            <path d="M15 15h.01" />
          </svg>
          <span className="text-sm font-semibold">Best price</span>
          <span className="font-semibold text-md">
            ₹{afterPrice.toLocaleString()}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between">
          <div className="flex gap-1 items-center">
            <div className={priceClass}>₹{afterPrice.toLocaleString()}</div>
            {beforePrice > afterPrice && (
              <div className={oldPriceClass}>
                ₹{beforePrice.toLocaleString()}
              </div>
            )}
          </div>

          {/* Quick add button */}

          <button
            onClick={(e) => {
              e.stopPropagation();
              addToCart({
                product_id: product?.id,
                quantity: 1,
                name: product?.name,
                ratti: defaultRatti,
                price: product.after_price || afterPrice,
                image: product?.image,
                stockQty:product?.stock_qty
              });
            }}
            className={`bg-black/85 border border-black-300 text-white rounded-md cursor-pointer gap-2 flex items-center justify-center  ${quickAddSize}`}
            aria-label="Add to cart"
          >
            <ShoppingBag className="text-white w-3 h-3 font-semibold" />
            <h3 className="text-white text-xs font-semibold"> Add</h3>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
