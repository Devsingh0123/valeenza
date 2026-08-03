import { useState } from "react";
import { useDispatch } from "react-redux";
import {
  userForgotPasswordRequest,
  userVerifyOtp,
  userResetPassword,
} from "../../redux/slices/userAuthSlice";
import { toast } from "react-toastify";

const ForgotPassword = ({ onSuccess, onCancel, userType }) => {
  const [step, setStep]= useState(1); // 1: email, 2: otp, 3: new password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrors({ email: "Email is required" });
      return;
    }
    setLoading(true);
    try {
      await dispatch(userForgotPasswordRequest({ email, type: userType })).unwrap();
      toast.success("OTP sent to your email");
      setStep(2);
      setErrors({});
    } catch (err) {
      toast.error(err || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) {
      setErrors({ otp: "OTP is required" });
      return;
    }
    setLoading(true);
    try {
      await dispatch(userVerifyOtp({ email, otp, type: userType })).unwrap();
      toast.success("OTP verified");
      setStep(3);
      setErrors({});
    } catch (err) {
      toast.error(err || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrors({ password: "Password must be at least 6 characters" });
      return;
    }
    if (password !== confirmPassword) {
      setErrors({ confirm: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      await dispatch(
        userResetPassword({
          email,
          password,
          password_confirmation: confirmPassword,
          type: userType,
        })
      ).unwrap();
      toast.success("Password reset successfully! Please login.");
      if (onSuccess) onSuccess();
    } catch (err) {
      toast.error(err || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Step Indicator */}
      <div className="flex justify-between mb-6">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                step >= s ? "bg-yellow-500 text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              {s}
            </div>
            <span className="text-xs mt-1">
              {s === 1 ? "Email" : s === 2 ? "OTP" : "Password"}
            </span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}

      {step === 2 && (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit OTP"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      )}

      {step === 3 && (
        <form onSubmit={handleResetPassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 focus:outline-none focus:ring-amber-500 focus:border-amber-500"
            />
            {errors.confirm && <p className="text-red-500 text-sm mt-1">{errors.confirm}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 text-white py-2 px-4 rounded-md hover:from-yellow-600 hover:to-yellow-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      )}

      {/* Back to Login Link */}
      <div className="text-center mt-4">
        <span
          onClick={onCancel}
          className="text-sm cursor-pointer hover:underline text-orange-600"
        >
          ← Back to Login
        </span>
      </div>
    </div>
  );
};

export default ForgotPassword;