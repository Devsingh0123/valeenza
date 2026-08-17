import { fetchCart, mergeGuestCart } from "@/redux/slices/cartSlice";

import {
  userLogin,
  userProfile,
  userVerifyLoginOtp,
} from "@/redux/slices/userAuthSlice";

import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";

const AuthSection = () => {
  const dispatch = useDispatch();

  // Email + OTP states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { selectedAddressId } = useSelector((state) => state.address);

  // ========================================
  // SEND EMAIL OTP
  // ========================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      return toast.error("Please enter your email");
    }

    setLoading(true);

    try {
      await dispatch(
        userLogin({
          email: cleanEmail,
        }),
      ).unwrap();

      setEmail(cleanEmail);
      setIsOtpSent(true);

      toast.success("OTP sent successfully to your email!");
    } catch (err) {
      console.error("Failed to generate and send OTP:", err);

      toast.error(err || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ========================================
  // VERIFY EMAIL OTP
  // ========================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    setLoading(true);

    try {
      // 1. Verify OTP
      await dispatch(
        userVerifyLoginOtp({
          email: email.trim(),
          otp,
        }),
      ).unwrap();

      // 2. Load user profile
      await dispatch(userProfile()).unwrap();

      toast.success("Logged in successfully!");

      // 3. Merge guest cart
      const mergeResult = await dispatch(mergeGuestCart()).unwrap();

      if (mergeResult?.partial) {
        toast.warning(
          `Some items couldn't be added: ${mergeResult.errors.join(", ")}`,
        );
      } else if (mergeResult?.merged) {
        toast.success("Cart synced successfully");
      }

      // 4. Refresh cart
      await dispatch(fetchCart());

      // 5. Keep existing delivery-charge logic
      if (selectedAddressId) {
        await dispatch(
          calculateDeliveryCharge({
            address_id: selectedAddressId,
          }),
        );
      }
    } catch (err) {
      console.error("OTP verification failed:", err);

      toast.error(err || "OTP verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-2 text-left">
      {/* Module Title */}
      <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
        Account Login
      </h3>

      {/* ========================================
          STAGE 1: EMAIL
      ======================================== */}

      {!isOtpSent ? (
        <form
          onSubmit={handleSendOtp}
          className="flex flex-col sm:flex-row gap-1"
        >
          <div className="w-full">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-2.5 text-xs font-semibold border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-50 focus:border-amber-500 transition-all placeholder:font-medium placeholder:text-gray-400"
              required
              autoComplete="email"
            />
          </div>

          <button
            type="submit"
            disabled={!email.trim() || loading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-500 text-white font-bold text-xs rounded-xl tracking-wide shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        /* ========================================
           STAGE 2: EMAIL OTP
        ======================================== */

        <form onSubmit={handleVerifyOtp} className="space-y-3 animate-fade-in">
          <p className="text-xs text-green-600 font-semibold flex items-center gap-1 pl-0.5">
            <span className="text-sm">✓</span>
            OTP sent to <b>{email}</b>
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");

                if (value.length <= 6) {
                  setOtp(value);
                }
              }}
              placeholder="Enter 6-digit verification code"
              className="flex-1 px-4 py-2.5 text-xs font-bold tracking-[0.25em] border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-all placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-400"
              required
              autoComplete="one-time-code"
            />

            <div className="flex gap-2 shrink-0">
              {/* Verify */}
              <button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-xs rounded-xl tracking-wide shadow-sm transition-all duration-200 cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Change Email */}
              <button
                type="button"
                onClick={() => {
                  setIsOtpSent(false);
                  setOtp("");
                }}
                className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200/80 rounded-xl transition-colors focus:outline-none cursor-pointer"
              >
                Change
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default AuthSection;
