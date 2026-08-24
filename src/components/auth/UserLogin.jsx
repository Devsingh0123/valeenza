// components/auth/UserLogin.jsx

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactDOM from "react-dom";

import {
  userProfile,
  userVerifyLoginOtp,
  userRegister,
  userLogin,
} from "../../redux/slices/userAuthSlice";

import { closeLoginModal } from "../../redux/slices/uiSlice";
import { toast } from "react-toastify";
import ForgotPassword from "./ForgotPassword";
import { Link } from "react-router-dom";
import { fetchCart, mergeGuestCart } from "@/redux/slices/cartSlice";
import { X } from "lucide-react";

const UserLogin = () => {
  const dispatch = useDispatch();

  const { user, error, loading } = useSelector((state) => state.userAuth);

  const { isLoginModalOpen } = useSelector((state) => state.ui);

  const [mode, setMode] = useState("login");

  // login steps: email -> otp
  const [step, setStep] = useState("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [userType, setUserType] = useState("user");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    country_code: "+91",
    mobile: "",
  });

  const [errors, setErrors] = useState({
    fields: {},
    form: "",
  });

  // ========================================
  // RESET OTP STEP WHEN MODE CHANGES
  // ========================================

  useEffect(() => {
    if (mode !== "login") {
      setStep("email");
      setOtp("");
    }
  }, [mode]);

  // ========================================
  // BODY SCROLL CONTROL
  // ========================================

  useEffect(() => {
    if (isLoginModalOpen) {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoginModalOpen]);

  // ========================================
  // CLOSE MODAL AFTER LOGIN
  // ========================================

  useEffect(() => {
    if (user) {
      dispatch(closeLoginModal());

      setEmail("");
      setOtp("");
      setStep("email");

      setForm({
        name: "",
        email: "",
        country_code: "+91",
        mobile: "",
      });

      setTermsAccepted(false);
    }
  }, [user, dispatch]);

  // ========================================
  // FORM CHANGE
  // ========================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      fields: {
        ...prev.fields,
        [name]: undefined,
      },
      form: "",
    }));
  };

  // ========================================
  // SEND EMAIL OTP
  // ========================================

  const handleSendOtp = async (e) => {
    e.preventDefault();

    const cleanEmail = email.trim();

    if (!cleanEmail) {
      toast.error("Please enter your email");
      return;
    }

    setLoadingBtn(true);

    try {
      await dispatch(
        userLogin({
          email: cleanEmail,
        }),
      ).unwrap();

      setEmail(cleanEmail);
      setStep("otp");

      toast.success("OTP sent to your email");
    } catch (err) {
      toast.error(err || "Failed to send OTP");
    } finally {
      setLoadingBtn(false);
    }
  };

  // ========================================
  // VERIFY EMAIL OTP
  // ========================================

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const cleanOtp = otp.trim();

    if (!cleanOtp) {
      toast.error("Please enter the OTP");
      return;
    }

    setLoadingBtn(true);

    try {
      await dispatch(
        userVerifyLoginOtp({
          email: email.trim(),
          otp: cleanOtp,
        }),
      ).unwrap();

      // Get logged-in user profile
      await dispatch(userProfile()).unwrap();

      // Merge guest cart after login
      const mergeResult = await dispatch(mergeGuestCart()).unwrap();

      if (mergeResult.partial) {
        toast.warning(
          `Some items couldn't be added: ${mergeResult.errors.join(", ")}`,
        );
      } else if (mergeResult.merged) {
        toast.success("Cart merged successfully");
      }

      await dispatch(fetchCart());

      toast.success("Logged in successfully");
    } catch (err) {
      toast.error(err || "OTP verification failed");
    } finally {
      setLoadingBtn(false);
    }
  };

  // ========================================
  // SIGNUP
  // ========================================

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!termsAccepted) {
      setErrors({
        fields: {},
        form: "You must accept the Terms & Conditions to sign up.",
      });

      return;
    }

    const submitData = {
      name: form.name,
      email: form.email,
      country_code: form.country_code,
      mobile: form.mobile,
      terms_accepted: termsAccepted ? 1 : 0,
    };

    setLoadingBtn(true);

    try {
      await dispatch(userRegister(submitData)).unwrap();

      toast.success("Registration successful! Please login.");

      setMode("login");
      setStep("email");
      setOtp("");

      setForm({
        name: "",
        email: "",
        country_code: "+91",
        mobile: "",
      });

      setEmail("");
      setErrors({
        fields: {},
        form: "",
      });

      setTermsAccepted(false);
    } catch (err) {
      toast.error(err || "Registration failed");
    } finally {
      setLoadingBtn(false);
    }
  };

  // ========================================
  // MODAL CLOSED
  // ========================================

  if (!isLoginModalOpen) {
    return null;
  }

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999]">
      <div className="absolute inset-0 flex items-center justify-center p-4 backdrop-blur-[2px] bg-black/20">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* ========================================
                HEADER
            ======================================== */}

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {mode === "login" && step === "email" && "Login"}

                {mode === "login" && step === "otp" && "Enter OTP"}

                {mode === "signup" && "Create Account"}

                {mode === "forgot" && "Forgot Password"}
              </h2>

              <button
                onClick={() => dispatch(closeLoginModal())}
                className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* ========================================
                ERROR
            ======================================== */}

            {(errors.form || error) && (
              <p className="text-red-600 text-sm text-center mb-4">
                {errors.form || error}
              </p>
            )}

            {/* ========================================
                LOGIN - EMAIL STEP
            ======================================== */}

            {mode === "login" && step === "email" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>

                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);

                      setErrors((prev) => ({
                        ...prev,
                        form: "",
                      }));
                    }}
                    placeholder="Enter your email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    required
                    autoComplete="email"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingBtn}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer"
                >
                  {loadingBtn ? "Sending..." : "Send OTP"}
                </button>

                <p className="text-center text-sm">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setStep("email");

                      setErrors({
                        fields: {},
                        form: "",
                      });
                    }}
                    className="text-sky-600 hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            )}

            {/* ========================================
                LOGIN - OTP STEP
            ======================================== */}

            {mode === "login" && step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-3">
                    OTP has been sent to:
                  </p>

                  <p className="text-sm font-semibold text-gray-800 mb-4">
                    {email}
                  </p>

                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>

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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    placeholder="6-digit OTP"
                    required
                    autoComplete="one-time-code"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loadingBtn}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer"
                >
                  {loadingBtn ? "Verifying..." : "Login"}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                  }}
                  className="text-sm text-sky-600 hover:underline block text-center w-full"
                >
                  ← Back to email
                </button>
              </form>
            )}

            {/* ========================================
                SIGNUP
            ======================================== */}

            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-3 mt-4">
                <input
                  name="name"
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  required
                />

                <div className="flex gap-2">
                  <input
                    name="country_code"
                    placeholder="+91"
                    value={form.country_code}
                    onChange={handleChange}
                    className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  />

                  <input
                    name="mobile"
                    maxLength={10}
                    placeholder="Mobile *"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                    required
                  />
                </div>

                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-sky-500 focus:border-sky-500"
                  required
                />

                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="mt-1 cursor-pointer"
                  />

                  <label htmlFor="terms" className="text-xs text-gray-600">
                    I have read and agree to the{" "}
                    <Link
                      to="/terms-conditions"
                      target="_blank"
                      className="text-sky-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="text-sky-600 hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loadingBtn}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer"
                >
                  {loadingBtn ? "Creating..." : "Sign Up"}
                </button>

                <p className="text-center text-sm">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("login");
                      setStep("email");
                      setErrors({
                        fields: {},
                        form: "",
                      });
                      setOtp("");
                    }}
                    className="text-sky-600 hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}

            {/* ========================================
                FORGOT PASSWORD
            ======================================== */}

            {mode === "forgot" && (
              <ForgotPassword
                onSuccess={() => setMode("login")}
                onCancel={() => setMode("login")}
                userType={userType}
              />
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default UserLogin;
