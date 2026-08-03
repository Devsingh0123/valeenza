import React, { useState } from "react";
import { useSelector } from "react-redux";

/**
 * CartSummary Component
 * Manages the collapsible order details, item arrays, and pricing matrices
 * following the look and feel from image_7a71e5.png.
 */
const CartSummary = () => {
  // Collapsible accordion configuration - set to false to be initially closed
  const [isOpen, setIsOpen] = useState(false);

  // Extract state properties from the Redux cart slice
  const { items, totalAmount } = useSelector((state) => state.cart);
  let { couponDiscount, appliedCoupon } = useSelector((state) => state.coupon);
  const { deliveryCharge, codCharge } = useSelector(
    (state) => state.extraCheckoutCharge,
  );
  const { selectedPaymentMethod } = useSelector((state) => state.payment);

  // console.log(items);
  // console.log("deliveryCharge", deliveryCharge);
  // console.log("codCharge",codCharge);

  // Compute total dynamic item count inside active state array
  const totalItemsCount =
    items?.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0) || 0;

  // Calculate dynamic sub-total based on original/old price if available, otherwise fallback to standard price
  const subTotalAmount =
    items?.reduce((sum, item) => {
      const basePrice = Number( item?.price || 0);
      return sum + basePrice * (Number(item.quantity) || 1);
    }, 0) || 0;

  // Calculate standard price totals to figure out base discount metrics
  const standardPriceTotal =
    items?.reduce((sum, item) => {
      return sum + Number(item.price || 0) * (Number(item.quantity) || 1);
    }, 0) || 0;

  // Calculate structural MRP markdown gaps
  const mrpDiscountAmount =
    subTotalAmount > standardPriceTotal
      ? subTotalAmount - standardPriceTotal
      : 0;

  if (appliedCoupon?.discount_type == "percentage") {
    couponDiscount = (standardPriceTotal * couponDiscount) / 100;
  } else if (appliedCoupon?.discount_type === "flat") {
    couponDiscount = couponDiscount;
  }

  // Final absolute calculation fallback checks for total display logic
  const codApplicable = selectedPaymentMethod === "cod";
  const grandTotal =
    standardPriceTotal +
    deliveryCharge +
    (codApplicable ? codCharge : 0) -
    (couponDiscount || 0);
  const finalDisplayAmount = totalAmount || grandTotal;

  // Empty placeholder guard layout context
  if (!items || items.length === 0) {
    return (
      <div className="p-4 bg-amber-50 border border-amber-100 text-amber-800 rounded-xl text-xs font-semibold">
        Your shopping cart is currently empty. Please add items to proceed with
        the checkout process.
      </div>
    );
  }

  return (
    <div className="w-full transition-all duration-300">
      {/* Accordion Action Header Row Block */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-3 focus:outline-none cursor-pointer group"
      >
        {/* Left Side: Dynamic Item Counters */}
        <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
          Order summary{" "}
          <span className="font-normal text-gray-600">
            ({totalItemsCount} {totalItemsCount === 1 ? "Item" : "Items"})
          </span>
        </h3>

        {/* Right Side: Price Status Summary and Toggle Chevrons */}
        <div className="flex items-center gap-2 font-sans">
          {/* Display crossed out subtotal price if an active discount markdown pattern exists */}
          {subTotalAmount > finalDisplayAmount && (
            <span className="text-xs text-gray-400 line-through font-normal">
              ₹
              {subTotalAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          )}

          {/* Active net checkout calculation node */}
          <span className="text-sm font-extrabold text-gray-900">
            ₹
            {finalDisplayAmount.toLocaleString("en-IN", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </span>

          {/* Up/Down Arrow Toggle Chevron matching image_7a71e5.png styling */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className={`h-4 w-4 text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Accordion Expansion Drawer Body Container */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen
            ? "max-h-[500px] opacity-100 mt-1"
            : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        {/* Light gray inset content panel wrapper matching screenshot parameters */}
        <div className="bg-[#f9f9f9] rounded-xl p-4 space-y-4 border border-gray-100">
          {/* Section A: Price & Ledger Invoice Breakdowns */}
          <div className="text-xs text-gray-600 space-y-2.5 pb-3 border-b border-gray-200/60 font-medium">
            {/* Sub total metric row */}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Sub total</span>
              <span className="text-gray-800">
                ₹
                {subTotalAmount.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            {/* MRP Markdown gaps row - Only rendered if discount values exist */}
            {mrpDiscountAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Discount on MRP</span>
                <span className="text-emerald-600 font-semibold">
                  - ₹
                  {mrpDiscountAmount.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {/* Promo Voucher Deductions row - Rendered if coupon deductions are active */}
            {Number(couponDiscount) > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">
                  Coupon discount{" "}
                  {appliedCoupon ? `(${appliedCoupon?.code})` : ""}
                </span>
                <span className="text-emerald-600 font-semibold">
                  - ₹
                  {Number(couponDiscount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}

            {deliveryCharge > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Delivery Charge</span>
                <span className="text-gray-800">
                  + ₹
                  {deliveryCharge.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
            {codApplicable && codCharge > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">COD Handling Surcharge</span>
                <span className="text-gray-800">
                  + ₹
                  {codCharge.toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>

          {/* Section B: Scroolable Active Item Array Manifest */}
          <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
            {items.map((item, index) => {
              const baseUniqueKey =
                item.item_id || `summary_node_${item.product_id}_${index}`;
              const activePrice = Number(item.price || 0);
              const originalMrp = Number(item.old_price || item.mrp || 0);

              return (
                <div key={baseUniqueKey} className="space-y-4">
                  {/* Item Grid Row Structure */}
                  <div className="flex items-start gap-3 text-xs">
                    {/* Left: Standard Card Product Image Frame */}
                    <div className="h-16 w-16 shrink-0 bg-[#dfdfdf] rounded-lg overflow-hidden flex items-center justify-center p-1 border border-gray-200/40">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-contain rounded-md mix-blend-multiply"
                        />
                      ) : (
                        <span className="text-[10px] text-gray-400 font-bold uppercase">
                          Item
                        </span>
                      )}
                    </div>

                    {/* Center: Metadata Labels & Quantities */}
                    <div className="flex-1 min-w-0 space-y-0.5 pt-0.5">
                      <h4 className="text-xs font-semibold text-gray-800 leading-tight line-clamp-2 pr-2">
                        {item.name}
                      </h4>
                      <p className="text-gray-500 font-medium">
                        Qty: {item.quantity}
                      </p>

                      {/* Contextual attribute validation block (e.g. Gemstone Ratti values) */}
                      {item.ratti && (
                        <p className="text-[11px] text-indigo-600 font-semibold bg-indigo-50/60 inline-block px-1.5 py-0.5 rounded">
                          Ratti: {item.ratti}
                        </p>
                      )}
                    </div>

                    {/* Right: Dynamic Pricing Arrays */}
                    <div className="text-right shrink-0 pt-0.5 space-y-0.5 font-sans">
                      <p className="font-bold text-gray-800">
                        ₹
                        {(
                          activePrice * Number(item.quantity || 1)
                        ).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                      </p>
                      {originalMrp > activePrice && (
                        <p className="text-[11px] text-gray-400 line-through">
                          ₹
                          {(
                            originalMrp * Number(item.quantity || 1)
                          ).toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Add item-separating line breaks except after final listed object element */}
                  {index < items.length - 1 && (
                    <hr className="border-gray-200/60 my-1" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
