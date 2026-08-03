import { fetchCart, mergeGuestCart } from "@/redux/slices/cartSlice";
import {
  userLogin,
  userProfile,
  userVerifyLoginOtp,
} from "@/redux/slices/userAuthSlice";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import Select from "react-select";
import { useCountryCodes } from "@/hooks/useCountryCodes";

/**
 * AuthSection Component
 * Manages secure user authentication via 10-digit mobile number input
 * and 6-digit OTP verification logic.
 */
const AuthSection = () => {
  const dispatch = useDispatch();

  // Input fields and flow transition states
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  // const { isLoggedIn, user } = useSelector((state) => state.userAuth);
  const { selectedAddressId } = useSelector((state) => state.address);
  const { countryCodes, loading: loadingCodes } = useCountryCodes();
  const [countryCode, setCountryCode] = useState("+91");

  // console.log(selectedAddressId);

  const countryOptions = countryCodes.map((code) => ({
    value: code.value,
    label: code.label,
  }));

  /**
   * Submits mobile verification request to server endpoints to dispatch OTP token
   */
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      return toast.error("Please enter a valid 10-digit mobile number");
    }

    setLoading(true);
    try {
      // Direct integration with your real slice action
      await dispatch(userLogin({ mobile, country_code: countryCode })).unwrap();
      setIsOtpSent(true);
      toast.success("OTP sent successfully!");
    } catch (err) {
      console.error("Failed to generate and send OTP:", err);
      toast.error(err || "Mobile number not registered");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Dispatches verification credentials to check session tokens
   */
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) {
      return toast.error("Please enter a valid 6-digit OTP");
    }

    setLoading(true);
    try {
      // 1. Verify OTP with backend to set tokens in localStorage
      await dispatch(userVerifyLoginOtp({ mobile, otp, country_code: countryCode })).unwrap();

      // 2. Load authentic profile data directly into Redux state
      await dispatch(userProfile()).unwrap();
      toast.success("Logged in successfully!");

      // 4. Clean up and merge guest cart values seamlessly

      const mergeResult = await dispatch(mergeGuestCart()).unwrap();
      if (mergeResult?.partial) {
        toast.warning(
          `Some items couldn't be added: ${mergeResult.errors.join(", ")}`,
        );
      } else if (mergeResult?.merged) {
        toast.success("Cart synced successfully");
      }
      await dispatch(fetchCart());

      if (selectedAddressId) {
        await dispatch(
          calculateDeliveryCharge({
            address_id: selectedAddressId,
          }),
        );
      }
    } catch (err) {
      // console.log('error', err);
      toast.error(err || "Failed to merge cart");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-2 text-left">
      {/* Module Title Section */}

      <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
        Account Login
      </h3>

      {/* Conditional Stage Form Management */}
      {!isOtpSent ? (
        /* --- STAGE 1: INITIAL PHONE NUMBER COLLECTION FORM --- */
        <form
          onSubmit={handleSendOtp}
          className="flex flex-col sm:flex-row gap-1"
        >
          <div className="flex items-center w-full gap-1 ">
            {loadingCodes ? (
              <div className="w-24 px-2 py-2 text-xs font-bold text-gray-400 border border-gray-200 rounded-xl bg-gray-50 text-center">
                Loading...
              </div>
            ) : (
              <Select
                options={countryOptions}
                value={countryOptions.find((opt) => opt.value === countryCode)}
                onChange={(selected) =>
                  setCountryCode(selected ? selected.value : "+91")
                }
                placeholder="Code"
                classNamePrefix="react-select"
                isClearable={false}
                isSearchable={true}
                formatOptionLabel={(option, { context }) => {
                  if (context === "value") return option.value;
                  return option.label;
                }}
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#d1d5db",
                    boxShadow: "none",
                    "&:hover": { borderColor: "#f59e0b" },
                    borderRadius: "0.5rem",
                    minHeight: "2.5rem",
                    textAlign: 'center',
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    width: "100px",
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999,  width: "200px", }),
                  option: (base, state) => ({
                    ...base,
                    backgroundColor: state.isSelected
                      ? "#f59e0b"
                      : state.isFocused
                        ? "#fef3c7"
                        : "white",
                    color: state.isSelected ? "white" : "#374151",
                    "&:active": { backgroundColor: "#f59e0b" },
                    fontSize: "0.65rem",
                    whiteSpace: "nowrap"
                  }),
                }}
              />
            )}
            <input
              type="tel"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 10-digit mobile number"
              className="flex-1 w-full px-4 py-2.5 text-xs font-semibold tracking-wider border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-50 focus:border-amber-500 transition-all placeholder:normal-case placeholder:font-medium placeholder:text-gray-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={mobile.length !== 10 || loading}
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-500 text-white font-bold text-xs rounded-xl tracking-wide shadow-sm transition-all duration-200 shrink-0 cursor-pointer"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>
        </form>
      ) : (
        /* --- STAGE 2: 6-DIGIT OTP VALIDATION CHALLENGE FORM --- */
        <form onSubmit={handleVerifyOtp} className="space-y-3 animate-fade-in">
          {/* Dispatch Status Response Sub-alert */}
          <p className="text-xs text-green-600 font-semibold flex items-center gap-1 pl-0.5">
            <span className="text-sm">✓</span> OTP send to <b>{countryCode} {mobile}</b>.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5">
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit verification code"
              className="flex-1 px-4 py-2.5 text-xs  font-bold tracking-[0.25em] border border-gray-200 bg-gray-50/50 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-400 focus:border-amber-400 transition-all placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-400"
              required
            />
            <div className="flex gap-2 shrink-0">
              {/* Validation Core Triggers */}
              <button
                type="submit"
                disabled={otp.length !== 6 || loading}
                className="flex-1 sm:flex-none px-6 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold text-xs rounded-xl tracking-wide shadow-sm transition-all duration-200 cursor-pointer"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              {/* Reset Session Number Modifications Anchor */}
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
