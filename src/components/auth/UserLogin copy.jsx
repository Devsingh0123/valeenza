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
import { api } from "../../redux/baseApi";
import { X } from "lucide-react";
import { fetchCart, mergeGuestCart } from "@/redux/slices/cartSlice";
import Select from "react-select";
import { useCountryCodes } from "@/hooks/useCountryCodes";

const UserLogin = () => {
  const dispatch = useDispatch();
  const { user, error, loading } = useSelector((state) => state.userAuth);
  const { isLoginModalOpen } = useSelector((state) => state.ui);
  const [mode, setMode] = useState("login");
  const [step, setStep] = useState("mobile");
  const [mobile, setMobile] = useState(""); // changed from email to mobile
  const [otp, setOtp] = useState("");
  const [userType, setUserType] = useState("user");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loadingBtn, setLoadingBtn] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const { countryCodes, loading: loadingCodes } = useCountryCodes();
  const countryOptions = countryCodes.map((code) => ({
    value: code.value,
    label: code.label,
  }));

  const [form, setForm] = useState({
    name: "",
    email: "",
    country_code: "+91",
    mobile: "",
  });
  const [errors, setErrors] = useState({ fields: {}, form: "" });

  // Reset OTP step when mode changes from login
  useEffect(() => {
    if (mode !== "login") {
      setStep("mobile");
      setOtp("");
    }
  }, [mode]);


 // Sync state data on visibility lifecycle triggers and handle underlying body scrolling limits
  useEffect(() => {
    if (isLoginModalOpen) {
    

      // Lock viewport scrolling positions to avoid secondary movement conflicts behind modal panels
      document.body.style.overflow = "hidden";
    }

    // Component unmount/dismiss cleanup function sequence
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isLoginModalOpen, dispatch]);

  // Close modal and reset fields when user logs in
  useEffect(() => {
    if (user) {
      dispatch(closeLoginModal());
      setMobile("");
      setOtp("");
      setStep("mobile");
      setForm({
        name: "",
        email: "",
        country_code: "+91",
        mobile: "",
      });
      setTermsAccepted(false);
    }
  }, [user, dispatch]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({
      ...prev,
      fields: { ...prev.fields, [name]: undefined },
      form: "",
    }));
  };

  // ========== MOBILE OTP LOGIN FLOW ==========
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile) {
      toast.error("Please enter your mobile number");
      return;
    }
    setLoadingBtn(true);
    try {
      await dispatch(userLogin({ mobile, country_code: countryCode })).unwrap();
      setStep("otp");
      toast.success("OTP sent to your mobile number");
    } catch (err) {
      toast.error(err || "Failed to send OTP");
    } finally {
      setLoadingBtn(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      toast.error("Please enter the OTP");
      return;
    }
    setLoadingBtn(true);
    try {
      // Pass mobile and otp to thunk (thunk must accept { mobile, otp })
      await dispatch(
        userVerifyLoginOtp({ mobile, otp, country_code: countryCode }),
      ).unwrap();
      await dispatch(userProfile()).unwrap();

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
      // console.log("error", err);
      toast.error(err || "Failed to merge cart");
    } finally {
      setLoadingBtn(false);
    }
  };

  // ========== SIGNUP (unchanged but uses mobile) ==========
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
      setStep("mobile");
      setOtp("");
      setForm({
        name: "",
        email: "",
        country_code: "+91",
        mobile: "",
      });
      setErrors({ fields: {}, form: "" });
      setTermsAccepted(false);
    } catch (err) {
      toast.error(err || "Registration failed");
    } finally {
      setLoadingBtn(false);
    }
  };

  if (!isLoginModalOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] ">
      
      <div className="absolute inset-0 flex items-center justify-center p-4 backdrop-blur-[2px] bg-black/20 ">
        <div
          className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] "
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">
                {mode === "login" && step === "mobile" && "Login"}
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

            {errors.form && (
              <p className="text-red-600 text-sm text-center mb-4">
                {errors.form}
              </p>
            )}

            {/* LOGIN – MOBILE NUMBER STEP */}
            {mode === "login" && step === "mobile" && (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="flex items-center gap-1">
                  {loadingCodes ? (
                    <div className="w-24 px-2 py-2 text-xs font-bold text-gray-400 border border-gray-200 rounded-xl bg-gray-50 text-center">
                      Loading...
                    </div>
                  ) : (
                    <Select
                    
                      options={countryOptions}
                      value={countryOptions.find(
                        (opt) => opt.value === countryCode,
                      )}
                      onChange={(selected) =>
                        setCountryCode(selected ? selected.value : "+91")
                      }
                      placeholder="Code"
                      classNamePrefix="react-select"
                      isClearable={false}
                      isSearchable={true}
                      formatOptionLabel={(option, { context }) => {
                  //  Show only value in the input (context === 'value')
                  if (context === "value") {
                    return option.value; // e.g., "+91"
                  }
                  //  Show full label in dropdown menu
                  return option.label; // e.g., "+91 (IN)"
                }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: "#d1d5db",
                          boxShadow: "none",
                          "&:hover": { borderColor: "#f59e0b" },
                          borderRadius: "0.5rem",
                         
                          width: "100px",
                          fontSize: "0.75rem",
                          fontWeight: '600',
                          textAlign: 'center'
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                          width: "200px",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#f59e0b"
                            : state.isFocused
                              ? "#fef3c7"
                              : "white",
                          color: state.isSelected ? "white" : "#374151",
                          "&:active": { backgroundColor: "#f59e0b" },
                          fontSize: "0.75rem",
                          
                        }),
                      }}
                    />
                  )}
                  <input
                    type="tel"
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "");
                      if (value.length <= 10) setMobile(value);
                    }}
                    placeholder="Enter 10-digit mobile"
                    className="flex-1 w-full px-3 py-1.5 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    required
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
                      setStep("mobile");
                      setErrors({ fields: {}, form: "" });
                    }}
                    className="text-amber-600 hover:underline cursor-pointer"
                  >
                    Sign Up
                  </button>
                </p>
              </form>
            )}

            {/* LOGIN – OTP STEP */}
            {mode === "login" && step === "otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    placeholder="6-digit OTP"
                    required
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
                    setStep("mobile");
                    setOtp("");
                  }}
                  className="text-sm text-amber-600 hover:underline block text-center w-full"
                >
                  ← Back to mobile number
                </button>
              </form>
            )}

            {/* SIGNUP – unchanged */}
            {mode === "signup" && (
              <form onSubmit={handleSignup} className="space-y-3 mt-4">
                <input
                  name="name"
                  placeholder="Full Name *"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                  required
                />
                <div className="flex gap-2">
                  {loadingCodes ? (
                    <div className="w-1/4 px-3 py-2 text-xs font-bold text-gray-400 border border-gray-300 rounded-md bg-gray-50 text-center">
                      Loading...
                    </div>
                  ) : (
                    <Select
                      options={countryOptions}
                      value={countryOptions.find(
                        (opt) => opt.value === form.country_code,
                      )}
                      onChange={(selected) =>
                        setForm((prev) => ({
                          ...prev,
                          country_code: selected ? selected.value : "+91",
                        }))
                      }
                      placeholder="Code"
                      classNamePrefix="react-select"
                      isClearable={false}
                      isSearchable={true}
                      formatOptionLabel={(option, { context }) => {
                  //  Show only value in the input (context === 'value')
                  if (context === "value") {
                    return option.value; // e.g., "+91"
                  }
                  //  Show full label in dropdown menu
                  return option.label; // e.g., "+91 (IN)"
                }}
                      styles={{
                        control: (base) => ({
                          ...base,
                          borderColor: "#d1d5db",
                          boxShadow: "none",
                          "&:hover": { borderColor: "#f59e0b" },
                          borderRadius: "0.375rem",
                          minHeight: "2.5rem",
                          width: "100px",
                          fontSize: "0.75rem",
                          fontWeight: '600',
                          textAlign: 'center'
                        }),
                        menu: (base) => ({
                          ...base,
                          zIndex: 9999,
                          width: "220px",
                        }),
                        option: (base, state) => ({
                          ...base,
                          backgroundColor: state.isSelected
                            ? "#f59e0b"
                            : state.isFocused
                              ? "#fef3c7"
                              : "white",
                          color: state.isSelected ? "white" : "#374151",
                          "&:active": { backgroundColor: "#f59e0b" },
                          fontSize: "0.75rem",
                          
                        }),
                      }}
                    />
                  )}
                  <input
                    name="mobile"
                    maxLength={10}
                    placeholder="Mobile *"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-3/4 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                </div>
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
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
                      className="text-amber-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      to="/privacy-policy"
                      target="_blank"
                      className="text-amber-600 hover:underline"
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
                      setStep("mobile");
                      setErrors({ fields: {}, form: "" });
                      setOtp("");
                    }}
                    className="text-amber-600 hover:underline cursor-pointer"
                  >
                    Login
                  </button>
                </p>
              </form>
            )}

            {/* Forgot password flow (unchanged) */}
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

// // components/auth/UserLogin.jsx
// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import ReactDOM from "react-dom";
// import {
//   userLogin,
//   userProfile,
//   userRegister,
// } from "../../redux/slices/userAuthSlice";
// import { closeLoginModal } from "../../redux/slices/uiSlice"; // 👈 import action
// import { toast } from "react-toastify";
// import ForgotPassword from "./ForgotPassword";
// import { fileToBase64 } from "../../hooks/fileToBase64";
// import { Camera, Upload, X } from "lucide-react";
// import { Link } from "react-router-dom";
// import { addToCart, fetchCart, mergeGuestCart } from "@/redux/slices/cartSlice";

// const UserLogin = () => {   // 👈 trigger prop hata diya
//   const dispatch = useDispatch();
//   const { user, error, loading } = useSelector((state) => state.userAuth);
//   const { isLoginModalOpen } = useSelector((state) => state.ui); //  state from Redux
//   const [mode, setMode] = useState("login");
//   const [userType, setUserType] = useState("user");
//   const [termsAccepted, setTermsAccepted] = useState(false);

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     country_code: "+91",
//     mobile: "",
//     username: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [profileImage, setProfileImage] = useState(null);
//   const [imagePreview, setImagePreview] = useState("");

//   const [errors, setErrors] = useState({ fields: {}, form: "" });

//   // Reset form when user logs in and close modal
// useEffect(() => {
//   if (user) {
//     // ✅ Agar is session me merge ho chuka hai to skip
//     if (localStorage.getItem('guestCartMerged')) return;

//     // Mark as merged immediately (before async call) to prevent double
//     localStorage.setItem('guestCartMerged', 'true');

//     dispatch(mergeGuestCart()).then((result) => {
//       if (result.payload?.merged) {
//         toast.success("Your cart items have been saved!");
//       }
//       // CartPage already has useEffect to fetch cart
//        dispatch(fetchCart())
//     });

//     setForm({
//       name: "",
//       email: "",
//       country_code: "",
//       mobile: "",
//       username: "",
//       password: "",
//       confirmPassword: "",
//     });
//     setProfileImage(null);
//     setImagePreview("");
//   }
// }, [user, dispatch]); // Ensure dispatch is in deps, user is the only trigger
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setForm((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({
//       ...prev,
//       fields: { ...prev.fields, [name]: undefined },
//       form: "",
//     }));
//   };

//   const handleImageChange = async (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       if (!file.type.startsWith("image/")) {
//         toast.error("Please select an image file");
//         return;
//       }
//       if (file.size > 2 * 1024 * 1024) {
//         toast.error("Image size must be less than 2MB");
//         return;
//       }
//       try {
//         const base64 = await fileToBase64(file);
//         setProfileImage(base64);
//         setImagePreview(URL.createObjectURL(file));
//       } catch (error) {
//         toast.error("Failed to process image");
//       }
//     }
//   };

//   const removeImage = () => {
//     setProfileImage(null);
//     setImagePreview("");
//     document.getElementById("user-profile-upload").value = "";
//   };

//  const handleLogin = async (e) => {
//   e.preventDefault();
//   if (!form.username || !form.password) {
//     setErrors({ fields: {}, form: "Username and password are required" });
//     return;
//   }
//   try {
//     await dispatch(userLogin({ username: form.username, password: form.password })).unwrap();
//     toast.success("You are logged in");

//     // ✅ Close modal immediately
//     dispatch(closeLoginModal());

//     // Fetch user profile in background (merge cart will happen in useEffect)
//     await dispatch(userProfile()).unwrap();
//   } catch (err) {
//     setErrors({ fields: {}, form: err || "Login failed" });
//   }
// };

//   const handleSignup = async (e) => {
//     e.preventDefault();
//     if (form.password !== form.confirmPassword) {
//       setErrors({ fields: {}, form: "Passwords do not match" });
//       return;
//     }
//     if (!termsAccepted) {
//       setErrors({ fields: {}, form: "You must accept the Terms & Conditions to sign up." });
//       return;
//     }
//     const { confirmPassword, ...submitData } = form;
//     submitData.profile_image = profileImage || null;
//     submitData.terms_accepted = termsAccepted ? 1 : 0;
//     try {
//       await dispatch(userRegister(submitData)).unwrap();
//       toast.success("Register successful, please login");
//       setMode("login");
//       setProfileImage(null);
//       setImagePreview("");
//     } catch (err) {
//       setErrors({ fields: {}, form: err || "Registration failed" });
//     }
//   };

//   if (!isLoginModalOpen) return null; // 👈 don't render anything if modal closed

//   return ReactDOM.createPortal(
//     <div className="fixed inset-0 z-[9999]">
//       {/* Backdrop */}
//       <div
//         className="absolute inset-0 backdrop-blur-[2px] bg-black/20"
//         onClick={() => dispatch(closeLoginModal())}
//       />
//       {/* Modal container */}
//       <div className="absolute inset-0 flex items-center justify-center p-4">
//         <div
//           className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto scrollbar-hide"
//           onClick={(e) => e.stopPropagation()}
//         >
//           <div className="p-6">
//             <div className="flex justify-between items-center mb-4">
//               <h2 className="text-2xl font-bold">
//                 {mode === "login"
//                   ? "Login"
//                   : mode === "signup"
//                     ? "Create Account"
//                     : "Forgot Password"}
//               </h2>
//               <button
//                 onClick={() => dispatch(closeLoginModal())}
//                 className="text-gray-500 hover:text-gray-700 bg-gray-100 rounded-full p-1.5 cursor-pointer"
//               >
//                 <X size={18} />
//               </button>
//             </div>

//             {(errors.form || error) && (
//               <p className="text-red-600 text-sm text-center mb-4">
//                 {errors.form || error}
//               </p>
//             )}

//             {mode === "login" && (
//               <form onSubmit={handleLogin} className="space-y-4">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Username/Email
//                   </label>
//                   <input
//                     name="username"
//                     value={form.username}
//                     onChange={handleChange}
//                     placeholder="Enter your username/email"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Password
//                   </label>
//                   <input
//                     type="password"
//                     name="password"
//                     value={form.password}
//                     onChange={handleChange}
//                     placeholder="Enter your password"
//                     className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                   />
//                 </div>
//                 <div className="text-right">
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setMode("forgot");
//                       setUserType("user");
//                     }}
//                     className="text-sm text-amber-600 hover:underline cursor-pointer"
//                   >
//                     Forgot Password?
//                   </button>
//                 </div>
//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer"
//                 >
//                   {loading ? "Logging in..." : "Login"}
//                 </button>
//                 <p className="text-center text-sm">
//                   Don't have an account?{" "}
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setMode("signup");
//                       setErrors({ fields: {}, form: "" });
//                     }}
//                     className="text-amber-600 hover:underline cursor-pointer"
//                   >
//                     Sign Up
//                   </button>
//                 </p>
//               </form>
//             )}

//             {mode === "signup" && (
//               <form onSubmit={handleSignup} className="space-y-3 mt-10">
//                 <input
//                   name="name"
//                   placeholder="Full Name"
//                   value={form.name}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                 />
//                 <input
//                   name="email"
//                   placeholder="Email"
//                   value={form.email}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                 />
//                 <div className="flex gap-2">
//                   <input
//                     name="country_code"
//                     placeholder="+91"
//                     value={form.country_code}
//                     onChange={handleChange}
//                     className="w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                   />
//                   <input
//                     name="mobile"
//                     placeholder="Mobile"
//                     value={form.mobile}
//                     onChange={handleChange}
//                     className="w-2/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                   />
//                 </div>
//                 <input
//                   name="username"
//                   placeholder="Username"
//                   value={form.username}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                 />

//                 <div className="space-y-1.5">
//                   <label className="text-sm flex items-center gap-1.5 text-gray-700">
//                     <Camera className="w-3.5 h-3.5" />
//                     Profile Photo (Optional)
//                   </label>
//                   <div
//                     onClick={() => document.getElementById("user-profile-upload")?.click()}
//                     onDragOver={(e) => {
//                       e.preventDefault();
//                       e.currentTarget.classList.add("border-yellow-500", "bg-yellow-50");
//                     }}
//                     onDragLeave={(e) => {
//                       e.preventDefault();
//                       e.currentTarget.classList.remove("border-yellow-500", "bg-yellow-50");
//                     }}
//                     onDrop={(e) => {
//                       e.preventDefault();
//                       e.currentTarget.classList.remove("border-yellow-500", "bg-yellow-50");
//                       const file = e.dataTransfer.files[0];
//                       if (file) handleImageChange({ target: { files: [file] } });
//                     }}
//                     className={`
//                       relative border border-dashed rounded-lg p-3
//                       transition-all duration-200 cursor-pointer
//                       ${imagePreview
//                         ? "border-green-300 bg-green-50/30"
//                         : "border-gray-300 bg-gray-50 hover:border-yellow-400 hover:bg-yellow-50/30"
//                       }
//                     `}
//                   >
//                     <input
//                       id="user-profile-upload"
//                       type="file"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       className="hidden"
//                     />
//                     {imagePreview ? (
//                       <div className="flex items-center justify-between gap-2">
//                         <div className="flex items-center gap-2 min-w-0">
//                           <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
//                             <img
//                               src={imagePreview}
//                               alt="Preview"
//                               className="w-full h-full object-cover"
//                             />
//                           </div>
//                           <span className="text-xs text-gray-600 truncate max-w-[100px]">
//                             Photo uploaded
//                           </span>
//                         </div>
//                         <button
//                           type="button"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             removeImage();
//                           }}
//                           className="text-red-500 hover:text-red-700 p-0.5 cursor-pointer"
//                         >
//                           <X className="w-3.5 h-3.5" />
//                         </button>
//                       </div>
//                     ) : (
//                       <div className="flex items-center gap-2 text-xs">
//                         <Upload className="w-4 h-4 text-gray-400" />
//                         <span className="text-gray-600 truncate">Click or drag photo</span>
//                         <span className="text-gray-400 whitespace-nowrap">(2MB)</span>
//                       </div>
//                     )}
//                   </div>
//                 </div>

//                 <input
//                   type="password"
//                   name="password"
//                   placeholder="Password"
//                   value={form.password}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                 />
//                 <input
//                   type="password"
//                   name="confirmPassword"
//                   placeholder="Confirm Password"
//                   value={form.confirmPassword}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
//                 />

//                 <div className="flex items-start gap-2">
//                   <input
//                     type="checkbox"
//                     id="terms"
//                     checked={termsAccepted}
//                     onChange={(e) => setTermsAccepted(e.target.checked)}
//                     className="mt-1 cursor-pointer"
//                   />
//                   <label htmlFor="terms" className="text-xs text-gray-600">
//                     I have read and agree to the{" "}
//                     <Link
//                       to="/terms-conditions"
//                       target="_blank"
//                       className="text-amber-600 hover:underline"
//                     >
//                       Terms & Conditions
//                     </Link>{" "}
//                     and{" "}
//                     <Link
//                       to="/privacy-policy"
//                       target="_blank"
//                       className="text-amber-600 hover:underline"
//                     >
//                       Privacy Policy
//                     </Link>
//                     .
//                   </label>
//                 </div>

//                 <button
//                   type="submit"
//                   disabled={loading}
//                   className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer"
//                 >
//                   {loading ? "Creating..." : "Sign Up"}
//                 </button>
//                 <p className="text-center text-sm">
//                   Already have an account?{" "}
//                   <button
//                     type="button"
//                     onClick={() => {
//                       setMode("login");
//                       setErrors({ fields: {}, form: "" });
//                     }}
//                     className="text-amber-600 hover:underline cursor-pointer"
//                   >
//                     Login
//                   </button>
//                 </p>
//               </form>
//             )}

//             {mode === "forgot" && (
//               <ForgotPassword
//                 onSuccess={() => setMode("login")}
//                 onCancel={() => setMode("login")}
//                 userType={userType}
//               />
//             )}
//           </div>
//         </div>
//       </div>
//     </div>,
//     document.body
//   );
// };

// export default UserLogin;
