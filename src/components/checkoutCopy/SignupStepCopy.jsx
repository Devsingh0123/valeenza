// src/components/checkout/SignupStep.jsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { userRegister } from '@/redux/slices/userAuthSlice';

const SignupStep = ({ onSignupSuccess, onBackToLogin }) => {
  const [form, setForm] = useState({ name: '', email: '', country_code: '+91', mobile: '', terms_accepted: 0 });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch()

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setForm(prev => ({ ...prev, [name]: checked ? 1 : 0 }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

 const handleSubmit = async (e) => {
  e.preventDefault();
  if (!form.terms_accepted) {
    toast.error('You must accept the Terms & Conditions');
    return;
  }
  setLoading(true);
  try {
    await dispatch(userRegister(form)).unwrap();
    toast.success('Registration successful! Please login.');
    onBackToLogin(); // go back to login step
  } catch (err) {
    toast.error(err || 'Registration failed');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">Create Account</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Full name *"
          value={form.name}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-amber-300 transition"
          required
        />
      
        <div className="flex gap-2">
          <select
            name="country_code"
            value={form.country_code}
            onChange={handleChange}
            className="px-3 py-3 border rounded-xl bg-white border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-amber-300 transition"
          >
            <option value="+91">+91</option>
            <option value="+1">+1</option>
            <option value="+44">+44</option>
          </select>
          <input
            name="mobile"
            placeholder="Mobile number *"
            value={form.mobile}
            onChange={handleChange}
            className="flex-1 px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-amber-300 transition"
            required
          />
        </div>
          <input
          name="email"
          type="email"
          placeholder="Enter your email"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-xl border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 focus:border-amber-300 transition"
        />

        {/* Terms and conditions checkbox */}
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            id="terms"
            name="terms_accepted"
            checked={form.terms_accepted === 1}
            onChange={handleChange}
            className="mt-1 cursor-pointer"
          />
          <label htmlFor="terms" className="text-xs text-gray-600">
            I have read and agree to the{" "}
            <Link to="/terms-conditions" target="_blank" className="text-amber-600 hover:underline">
              Terms & Conditions
            </Link>{" "}
            and{" "}
            <Link to="/privacy-policy" target="_blank" className="text-amber-600 hover:underline">
              Privacy Policy
            </Link>.
          </label>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-amber-600 text-white rounded-xl font-semibold hover:bg-amber-700 transition"
        >
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
      </form>
      <p className="text-center text-gray-500">
        Already have an account?{' '}
        <button onClick={onBackToLogin} className="text-amber-600 font-medium hover:underline">
          Login
        </button>
      </p>
    </div>
  );
};

export default SignupStep;