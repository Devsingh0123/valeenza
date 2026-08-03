import { fetchCart } from "@/redux/slices/cartSlice";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import CheckoutHeader from "./CheckoutHeader";
import CartSummary from "./CartSummary";
import CouponSection from "./CouponSection";
import AuthSection from "./AuthSection";
import AddressSection from "./AddressSection";
import PaymentSection from "./PaymentSection";
import { closeCheckout } from "@/redux/slices/uiSlice";
import { Link } from "react-router-dom";

/**
 * CheckoutPopup Component
 * Coordinates multi-step authentication, validation, summary modules, and payment forms.
 */
const CheckoutPopup = () => {
  const dispatch = useDispatch();
  const [showConfirm, setShowConfirm] = useState(false);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const isOpen = useSelector((state) => state.ui.isCheckoutOpen);

  // Sync state data on visibility lifecycle triggers and handle underlying body scrolling limits
  useEffect(() => {
    if (isOpen) {
      // Pull fresh data directly from server endpoints to sync active pricing matrices
      dispatch(fetchCart());

      // Lock viewport scrolling positions to avoid secondary movement conflicts behind modal panels
      document.body.style.overflow = "hidden";
    }

    // Component unmount/dismiss cleanup function sequence
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, dispatch]);

  //  Handler – when back button clicked
  const handleBackClick = () => {
    setShowConfirm(true);
  };

  //  Confirm – Checkout close
  const handleConfirmClose = () => {
    setShowConfirm(false);
    dispatch(closeCheckout());
  };

  // ✅Cancel – Modal close, Checkout open
  const handleCancelClose = () => {
    setShowConfirm(false);
  };

  // Shield rendering sequence checks if structural flag is inactive
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2  bg-black/60 backdrop-blur-sm transition-opacity duration-300">
      {/* Main Structural Layout Container Card Profile */}
      <div className="relative flex flex-col w-full max-w-xl h-[100vh]  bg-white shadow-2xl overflow-hidden border border-gray-100 transition-all transform scale-100">
        {/* Step-Sticky Anchor Block: Header Identity and Interactive Exit Nodes */}
        <CheckoutHeader onBackClick={handleBackClick} />

        {/* Scrollable Workflow Management Sub-Form Panels */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 custom-scrollbar bg-white">
          {/* Module 1: Order Summary Items Breakdown & Accumulation calculations */}
          <CartSummary />

          {/* Module 2: Applied Promotional Vouchers / Coupon Verification interface */}
          <CouponSection />

          {/* Module 3: Security & Verification State Context blocks */}
          {!isLoggedIn ? (
            <AuthSection />
          ) : (
            <div className="p-3 bg-amber-50 border border-amber-100 text-green-600 rounded-lg text-xs font-semibold flex items-center gap-2 shadow-sm">
              <span className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px]">
                ✓
              </span>
              <span>
                You are successfully logged in.
              </span>
            </div>
          )}

          {/* Module 4: Shipping Profiles / Destination Target forms */}
          <AddressSection />

          {/* Module 5: Payment Gateway triggers (Razorpay integrations / COD routes) */}
          <PaymentSection />

          <div className="text-center">
            <label htmlFor="terms" className="text-xs text-gray-400">
              I accept that I have read & understood {" "}

              <Link
                to="/privacy-policy"
                target="_blank"
                className="text-amber-500 hover:underline"
              >
                Privacy Policy
              </Link>
               {" "}and{" "}
              <Link
                to="/terms-conditions"
                target="_blank"
                className="text-amber-500 hover:underline"
              >
                T&Cs.
              </Link>
             
  
            </label>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl border border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Close Checkout?
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel the checkout proccess?
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelClose}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClose}
                className="flex-1 px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPopup;
