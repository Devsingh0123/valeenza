import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCoupons,
  validateCoupon,
  clearAppliedCoupon,
  setAppliedCoupon,
} from "@/redux/slices/couponSlice";
import { BadgePercent, Ticket, AlertCircle, Loader2, Calendar } from "lucide-react";

/**
 * CouponSection Component
 * Handles percentage and flat coupons cleanly with dynamic saved state badges.
 */
const CouponSection = () => {
  const dispatch = useDispatch();

  // Interactive UI layout view states
  const [couponInput, setCouponInput] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Pull global slice targets from Redux store layer
  const {
    list: coupons,
    loading,
    appliedCoupon,
    couponDiscount,
  } = useSelector((state) => state.coupon);

  // Fetch coupons on mount
  useEffect(() => {
    dispatch(fetchCoupons());
  }, [dispatch]);

  // Helper to format expiry date into clean readable text
  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch (e) {
      return dateString;
    }
  };

  /**
   * Dispatches validation queries to evaluate voucher tokens
   */
  const handleApplyCoupon = async (code) => {
    if (!code.trim()) return;
    setLocalError(null);

    try {
      const result = await dispatch(validateCoupon(code.trim())).unwrap();

      // console.log(result)
      dispatch(
        setAppliedCoupon({
          coupon: result,
          discount: result?.discount_value,
        }),
      );
      setCouponInput("");
      setIsModalOpen(false);
    } catch (err) {
      setLocalError(err || "Invalid Coupon Code");
    }
  };

  /**
   * Resets active coupon assignments
   */
  const handleRemoveCoupon = () => {
    dispatch(clearAppliedCoupon());
    setLocalError(null);
    setCouponInput("");
  };

  // Find the recommended coupon and active applied coupon details
  const defaultRecommendedCoupon = coupons?.[0];

  const appliedCouponDetails = coupons?.find(cp => cp.code === appliedCoupon?.code);

  return (
    <div className="w-full">
      {/* ========================================================================= */}
      {/* INITIAL VIEW OR APPLIED VIEW                                              */}
      {/* ========================================================================= */}
      {!appliedCoupon ? (
        defaultRecommendedCoupon ? (
          /* --- STATE 1: INITIAL VOUCHER RECOMMENDATION BOX --- */
          <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm text-left transition-all duration-200">
            <div className="flex items-start justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className="text-green-600 bg-green-50 rounded-full flex items-center justify-center animate-spin"
                    style={{ animationDuration: "3.5s" }}
                  >
                    <BadgePercent size={18} />
                  </span>
                  <span className="text-sm font-bold text-gray-900 tracking-wide uppercase">
                    {defaultRecommendedCoupon?.code}
                  </span>
                  
                  {/* Recommended Type Badge */}
                  {defaultRecommendedCoupon?.discount_type === "percentage" ? (
                    <span className="bg-blue-50 text-green-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      % OFF
                    </span>
                  ) : (
                    <span className="bg-purple-50 text-purple-600 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                      FLAT
                    </span>
                  )}
                </div>

                <p className="text-xs text-green-600 font-bold tracking-tight">
                  {defaultRecommendedCoupon?.label}
                </p>

                {defaultRecommendedCoupon?.min_amount && (
                  <p className="text-[11px] text-gray-400 font-medium">
                    Valid on orders above ₹{parseInt(defaultRecommendedCoupon.min_amount)}
                  </p>
                )}
              </div>

              <button
                onClick={() => handleApplyCoupon(defaultRecommendedCoupon?.code)}
                className="text-sm font-bold text-amber-500 hover:text-amber-600 px-1 py-0.5 cursor-pointer transition-colors shrink-0"
              >
                Apply
              </button>
            </div>

            <hr className="border-t border-dashed border-gray-200 my-3.5" />

            <button
              onClick={() => {
                setLocalError(null);
                setIsModalOpen(true);
              }}
              className="w-full text-center text-xs font-semibold text-gray-700 hover:text-gray-800 py-0.5 block transition-colors cursor-pointer"
            >
              View all coupons &gt;
            </button>
          </div>
        ) : (
          /* --- STATE 1B: SAFE EMPTY UI FALLBACK --- */
          <div className="w-full bg-white border border-gray-200/80 rounded-2xl p-4 shadow-sm text-left flex items-center justify-between transition-all duration-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-50 text-gray-400 rounded-xl shrink-0">
                <Ticket size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-800">Have a Coupon Code?</p>
                <p className="text-[10px] text-gray-400 font-medium">Check available active store promotions</p>
              </div>
            </div>
            <button
              onClick={() => {
                setLocalError(null);
                setIsModalOpen(true);
              }}
              className="text-xs font-bold text-amber-500 hover:text-amber-600 cursor-pointer transition-colors"
            >
              Enter Code
            </button>
          </div>
        )
      ) : (
        /* --- STATE 3: FULLY APPLIED PROMO CODE LEDGER --- */
        <div className="w-full bg-white border border-gray-100 rounded-2xl p-4 shadow-sm text-left transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="text-green-600 bg-green-50 rounded-full flex items-center justify-center animate-spin"
                style={{ animationDuration: "2.5s" }}
              >
                <BadgePercent size={20} />
              </span>
              <h4 className="text-sm font-bold text-gray-900 tracking-wide truncate uppercase">
                {appliedCoupon?.code}
              </h4>
              
              {/* Dynamic Saved Badge checking for Type percentage vs flat */}
              <span className="bg-green-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-md tracking-tight shadow-sm shrink-0">
                {appliedCouponDetails?.discount_type === "percentage"
                  ? `${parseFloat(couponDiscount)}% OFF`
                  : `Saved ₹${Number(couponDiscount).toLocaleString("en-IN")}`
                }
              </span>
            </div>

            <button
              onClick={handleRemoveCoupon}
              className="text-sm font-bold text-amber-500 hover:text-amber-600 cursor-pointer transition-colors"
            >
              Remove
            </button>
          </div>

          <button
            onClick={() => {
              setLocalError(null);
              setIsModalOpen(true);
            }}
            className="text-xs font-semibold text-amber-500 hover:text-amber-600 mt-3 block transition-colors cursor-pointer"
          >
            Enter another coupon &gt;
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: MODAL POPUP DRAWER                                               */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-300"
          />

          <div className="relative bg-white w-full max-w-md rounded-3xl p-5 shadow-2xl flex flex-col z-10 text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white rounded-full h-8 w-8 flex items-center justify-center shadow-lg hover:bg-gray-800 transition-colors focus:outline-none cursor-pointer border border-gray-700/50"
            >
              <span className="text-sm font-bold leading-none">✕</span>
            </button>

            <h2 className="text-sm font-bold text-gray-900 tracking-wider mb-4 uppercase">
              Apply Coupon
            </h2>

            <div className="space-y-1.5 mb-5">
              <div className="relative flex items-center border border-amber-400 rounded-xl bg-white px-3 py-2.5 shadow-xs focus-within:ring-1 focus-within:ring-amber-200">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => {
                    setLocalError(null);
                    setCouponInput(e.target.value.toUpperCase());
                  }}
                  placeholder="Enter coupon code"
                  className="flex-1 text-xs font-semibold tracking-wide text-gray-800 focus:outline-none placeholder:normal-case placeholder:font-medium placeholder:text-gray-400 bg-transparent pr-12"
                />
                <button
                  onClick={() => handleApplyCoupon(couponInput)}
                  disabled={!couponInput.trim()}
                  className="absolute right-3 text-xs font-extrabold text-amber-500 disabled:text-gray-300 hover:text-amber-600 cursor-pointer transition-colors"
                >
                  Apply
                </button>
              </div>

              {localError && (
                <p className="text-xs text-red-500 font-semibold flex items-center gap-1 pl-1">
                  <AlertCircle size={12} className="text-red-500 shrink-0" /> {localError}
                </p>
              )}
            </div>

            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-3">
              Applicable coupons
            </h3>

            <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 custom-scrollbar">
              {loading ? (
                <div className="flex items-center gap-2 py-6 text-xs text-gray-400 italic font-medium justify-center">
                  <Loader2 size={14} className="animate-spin text-amber-500" />
                  <span>Scanning active promotions...</span>
                </div>
              ) : coupons && coupons.length > 0 ? (
                coupons.map((cp) => {
                  return (
                    <div
                      key={cp?.id || cp?.code}
                      className="border border-gray-200/90 rounded-2xl p-4 flex flex-col space-y-2 bg-white relative hover:border-gray-300 transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="text-green-600 bg-green-50 rounded-full flex items-center justify-center p-1 shrink-0">
                            <BadgePercent size={18} />
                          </span>
                          <span className="text-xs font-bold text-gray-900 tracking-wider uppercase">
                            {cp.code}
                          </span>

                          {/* List Type Badges */}
                          {/* {cp.discount_type === "percentage" ? (
                            <span className="bg-blue-50 text-blue-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                              Percentage
                            </span>
                          ) : (
                            <span className="bg-purple-50 text-purple-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0">
                              Flat Discount
                            </span>
                          )} */}
                        </div>

                        <button
                          onClick={() => handleApplyCoupon(cp.code)}
                          disabled={appliedCoupon === cp.code || !cp.is_valid}
                          className="border border-amber-500 text-amber-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:border-gray-200 px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0"
                        >
                          {appliedCoupon === cp.code ? "Applied" : "Apply"}
                        </button>
                      </div>

                      <p className="text-xs text-green-600 font-bold tracking-tight">
                        {cp.label}
                      </p>

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[10px] text-gray-400 font-medium pt-0.5 border-t border-gray-100/70">
                        {cp.min_amount && (
                          <span>Min. Spend: ₹{parseInt(cp.min_amount)}</span>
                        )}
                        {cp.expiry_date && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span className="flex items-center gap-0.5">
                              <Calendar size={10} className="inline shrink-0" />
                              Expires: {formatDate(cp.expiry_date)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center bg-gray-50/50 flex flex-col items-center justify-center space-y-2">
                  <div className="p-3 bg-gray-100 text-gray-400 rounded-full">
                    <Ticket size={24} className="text-gray-400" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-gray-800">No Coupons Available</p>
                    <p className="text-[11px] text-gray-400 font-medium max-w-[240px] mx-auto leading-normal">
                      We couldn't find any active public coupons for your cart right now.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponSection;