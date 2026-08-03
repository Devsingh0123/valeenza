// src/components/checkout/LoginStep.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { userLogin, userProfile, userVerifyLoginOtp } from '../../redux/slices/userAuthSlice';
import { toast } from 'react-toastify';
import { mergeGuestCart, fetchCart } from '../../redux/slices/cartSlice';

const LoginStep = ({ onLoginSuccess, onSignupClick }) => {
  const dispatch = useDispatch();
  const [step, setStep] = useState('mobile');
  const [mobile, setMobile] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!mobile) return toast.error('Enter your mobile number');
    setLoading(true);
    try {
      await dispatch(userLogin(mobile)).unwrap(); // using thunk
      setStep('otp');
      toast.success('OTP sent to your mobile number');
    } catch (err) {
      toast.error(err || 'Mobile number not registered');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return toast.error('Please enter the OTP');
    setLoading(true);
    try {
      await dispatch(userVerifyLoginOtp({ mobile, otp })).unwrap();
      await dispatch(userProfile()).unwrap();

      onLoginSuccess(); // close popup or go to next step

      const mergeResult = await dispatch(mergeGuestCart()).unwrap();

      if (mergeResult.partial) {
        toast.warning(`Some items couldn't be added: ${mergeResult.errors.join(', ')}`);
      } else if (mergeResult.merged) {
        toast.success('Cart merged successfully');
      }

      await dispatch(fetchCart());
    } catch (err) {
      // console.log('error', err);
      toast.error(err || 'Failed to merge cart');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">Login to Checkout</h2>
      {step === 'mobile' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <input
            name="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // sirf digits allow 
              if (value.length <= 10) {   // max 10 digits
                setMobile(value);
              }
            }}
            placeholder="Mobile number"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-transparent transition"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            placeholder="6-digit OTP"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-amber-300"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
          <button
            type="button"
            onClick={() => {
              setStep('mobile');
              setOtp('');
            }}
            className="w-full text-amber-600 text-sm hover:underline"
          >
            ← Back to mobile number
          </button>
        </form>
      )}
      <p className="text-center text-gray-500">
        New user?{' '}
        <button onClick={onSignupClick} className="text-amber-600 font-medium hover:underline">
          Create account
        </button>
      </p>
    </div>
  );
};

export default LoginStep;