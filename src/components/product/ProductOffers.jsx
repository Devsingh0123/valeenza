import React from "react";
import { Tag } from "lucide-react";
import { toast } from 'react-toastify';

const ProductOffers = ({ offers }) => {
  if (!offers?.length) return null;

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon ${code} copied!`);
  };

  return (
    <div>
      <h3 className="flex items-center gap-2 font-bold text-stone-900 text-lg mb-2">
        <Tag className="w-5 h-5 text-amber-500" />
        Best Offers
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-5">
        {offers.map((offer, idx) => {
          if (offer.type === "discount" || (offer.price && offer.code)) {
            return (
              <div
                key={idx}
                className="group border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="p-5">
                  <h4 className="font-bold text-green-700 text-base mb-1">
                    {offer.title}
                  </h4>
                  <p className="text-xs text-stone-500">{offer.description}</p>
                </div>
                <div className="border-t border-dashed bg-amber-50 px-5 py-3 flex justify-between items-center">
                  <span className="font-semibold text-stone-800 text-sm">

                    <span className="text-amber-600 font-bold text-base">{offer.price}</span>
                  </span>
                  <button
                    onClick={() => handleCopyCoupon(offer.code)}
                    className="text-amber-600 font-semibold text-sm flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    {offer.code} ⧉
                  </button>
                </div>
              </div>
            );
          } else {
            return (
              <div
                key={idx}
                className="group border border-stone-200 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition"
              >
                <div className="p-5">
                  <h4 className="font-bold text-teal-700 text-base mb-1">
                    {offer.title}
                  </h4>
                  <p className="text-xs text-stone-500">{offer.description}</p>
                </div>
                <div className="border-t border-dashed bg-amber-50 px-5 py-3 flex items-center justify-between">
                  <span className="text-amber-600 font-semibold text-sm flex items-center gap-1">
                    AUTO-APPLIED ✔
                  </span>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

export default ProductOffers;