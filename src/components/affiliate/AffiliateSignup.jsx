// src/pages/AffiliateSignup.jsx
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { affiliateRegister } from "@/redux/slices/affiliateSlice";

// Static country codes (only common ones)
const countryCodes = [
  { code: "+91", name: "India (+91)" },
  { code: "+1", name: "USA (+1)" },
  { code: "+44", name: "UK (+44)" },
  { code: "+61", name: "Australia (+61)" },
  { code: "+971", name: "UAE (+971)" },
];

const affiliateTypes = [
  { value: "blogger", label: "Blogger" },
  { value: "influencer", label: "Influencer" },
  { value: "agency", label: "Agency" },
  { value: "publisher", label: "Publisher" },
  { value: "other", label: "Other" },
];

const trafficSourceOptions = [
  "SEO",
  "Google Ads",
  "Facebook Ads",
  "Instagram",
  "YouTube",
  "WhatsApp",
  "Telegram",
  "LinkedIn",
  "Email Marketing",
  "Other",
];

const expectedLeadsOptions = [
  { value: "less_than_50", label: "less than 50 / month" },
  { value: "50_100", label: "50 - 100 / month" },
  { value: "100_500", label: "100 - 500 / month" },
  { value: "500_plus", label: "500+ / month" },
];

const AffiliateSignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector(
    (state) => state.affiliate || { loading: false },
  );
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registrationCode, setRegistrationCode] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    country_code: "+91",
    mobile: "",
    username: "",
    company_name: "",
    affiliate_type: "",
    traffic_sources: [],
    promotion_plan: "",
    expected_leads: "",
    password: "",
    confirmPassword: "",
    terms_accepted: false,
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSelect = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleMultiSelect = (value) => {
    if (form.traffic_sources.includes(value)) return;
    setForm((prev) => ({
      ...prev,
      traffic_sources: [...prev.traffic_sources, value],
    }));
    if (errors.traffic_sources)
      setErrors((prev) => ({ ...prev, traffic_sources: "" }));
  };

  const removeTrafficSource = (value) => {
    setForm((prev) => ({
      ...prev,
      traffic_sources: prev.traffic_sources.filter((v) => v !== value),
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!form.name.trim()) newErrors.name = "Full name is required";

    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email))
      newErrors.email = "Enter a valid email";

    if (!form.mobile.trim()) newErrors.mobile = "Mobile number is required";
    else if (!/^\d{10}$/.test(form.mobile))
      newErrors.mobile = "Mobile must be 10 digits";

    if (!form.username.trim()) newErrors.username = "Username is required";
    else if (!/^[a-zA-Z0-9_]+$/.test(form.username))
      newErrors.username = "Only letters, numbers, underscore";

    if (!form.company_name.trim())
      newErrors.company_name = "Company / Brand name is required";

    if (!form.affiliate_type)
      newErrors.affiliate_type = "Please select affiliate type";

    if (form.traffic_sources.length === 0)
      newErrors.traffic_sources = "Select at least one traffic source";

    if (!form.promotion_plan.trim())
      newErrors.promotion_plan = "Please describe your promotion plan";
    else if (form.promotion_plan.trim().length < 20)
      newErrors.promotion_plan = "Provide at least 20 characters";

    if (!form.expected_leads)
      newErrors.expected_leads = "Please select expected leads";

    if (!form.password) newErrors.password = "Password required";
    else if (form.password.length < 6)
      newErrors.password = "Password min 6 characters";

    if (!form.confirmPassword) newErrors.confirmPassword = "Confirm password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!form.terms_accepted)
      newErrors.terms_accepted = "You must accept Terms & Conditions";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    const submitData = {
      name: form.name.trim(),
      email: form.email.trim(),
      country_code: form.country_code,
      mobile: form.mobile.trim(),
      username: form.username.trim(),
      company_name: form.company_name.trim(),
      affiliate_type: form.affiliate_type,
      traffic_sources: form.traffic_sources,
      promotion_plan: form.promotion_plan.trim(),
      expected_leads: form.expected_leads,
      password: form.password,
      password_confirmation: form.confirmPassword,
      terms_accepted: form.terms_accepted ? 1 : 0,
    };

    try {
      const result = await dispatch(affiliateRegister(submitData)).unwrap();
      // console.log(result);
      setShowSuccessModal(true);
      setRegistrationCode(result.employee.code || result.employee.id || "N/A");
    } catch (err) {
      toast.error(err || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 py-10">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 px-8 py-6">
            <h2 className="text-3xl font-bold text-white">
              Affiliate Registration
            </h2>
            <p className="text-orange-100 mt-1">
              Join our affiliate program and start earning
            </p>
          </div>

          <div className="p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.name ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="text-xs text-red-500">{errors.name}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Username *
                    </label>
                    <input
                      type="text"
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border focus:outline-none rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.username ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Choose a unique username"
                    />
                    {errors.username && (
                      <p className="text-xs text-red-500">{errors.username}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border focus:outline-none rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.email ? "border-red-500" : "border-gray-300"}`}
                      placeholder="your@email.com"
                    />
                    {errors.email && (
                      <p className="text-xs text-red-500">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Mobile Number *
                    </label>
                    <div className="flex gap-2">
                      <select
                        name="country_code"
                        value={form.country_code}
                        onChange={(e) =>
                          handleSelect("country_code", e.target.value)
                        }
                        className="w-28 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                      >
                        {countryCodes.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.code}
                          </option>
                        ))}
                      </select>
                      <input
                        type="tel"
                        name="mobile"
                        value={form.mobile}
                        onChange={handleChange}
                        maxLength={10}
                        className={`flex-1 px-3 py-2 border focus:outline-none rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.mobile ? "border-red-500" : "border-gray-300"}`}
                        placeholder="1234567890"
                      />
                    </div>
                    {errors.mobile && (
                      <p className="text-xs text-red-500">{errors.mobile}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Password *
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border focus:outline-none rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.password ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Min 6 characters"
                    />
                    {errors.password && (
                      <p className="text-xs text-red-500">{errors.password}</p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border focus:outline-none rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.confirmPassword ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Re-enter password"
                    />
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-500">
                        {errors.confirmPassword}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Affiliate Information */}
              <div>
                <h3 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-4">
                  Affiliate Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Company / Brand Name *
                    </label>
                    <input
                      type="text"
                      name="company_name"
                      value={form.company_name}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border focus:outline-none rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.company_name ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Your business name"
                    />
                    {errors.company_name && (
                      <p className="text-xs text-red-500">
                        {errors.company_name}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Affiliate Type *
                    </label>
                    <select
                      value={form.affiliate_type}
                      onChange={(e) =>
                        handleSelect("affiliate_type", e.target.value)
                      }
                      className={`w-full px-3 py-2 border focus:outline-none  rounded-lg focus:ring-2 focus:ring-yellow-500 ${errors.affiliate_type ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select type</option>
                      {affiliateTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.affiliate_type && (
                      <p className="text-xs text-red-500">
                        {errors.affiliate_type}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Traffic Sources *
                    </label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {trafficSourceOptions.map((src) => (
                        <button
                          type="button"
                          key={src}
                          onClick={() => handleMultiSelect(src)}
                          className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full transition"
                        >
                          + {src}
                        </button>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {form.traffic_sources.map((src) => (
                        <span
                          key={src}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {src}
                          <button
                            type="button"
                            onClick={() => removeTrafficSource(src)}
                            className="ml-1 hover:text-red-600"
                          >
                            ✕
                          </button>
                        </span>
                      ))}
                    </div>
                    {errors.traffic_sources && (
                      <p className="text-xs text-red-500">
                        {errors.traffic_sources}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">
                      Expected Leads per Month *
                    </label>
                    <select
                      value={form.expected_leads}
                      onChange={(e) =>
                        handleSelect("expected_leads", e.target.value)
                      }
                      className={`w-full px-3 py-2 border focus:outline-none rounded-lg focus:ring-2 focus:ring-yellow-500 ${errors.expected_leads ? "border-red-500" : "border-gray-300"}`}
                    >
                      <option value="">Select range</option>
                      {expectedLeadsOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    {errors.expected_leads && (
                      <p className="text-xs text-red-500">
                        {errors.expected_leads}
                      </p>
                    )}
                  </div>
                  <div className="space-y-1 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700">
                      Promotion Plan / Strategy *
                    </label>
                    <textarea
                      name="promotion_plan"
                      value={form.promotion_plan}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-3 py-2 border focus:outline-none rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent ${errors.promotion_plan ? "border-red-500" : "border-gray-300"}`}
                      placeholder="Describe how you plan to promote our products (at least 20 characters)"
                    ></textarea>
                    {errors.promotion_plan && (
                      <p className="text-xs text-red-500">
                        {errors.promotion_plan}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 text-right">
                      {form.promotion_plan.length} characters
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="terms"
                    name="terms_accepted"
                    checked={form.terms_accepted}
                    onChange={handleChange}
                    className="mt-1 cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-sm text-gray-600">
                    I have read and agree to the{" "}
                    <Link
                      to="/terms-conditions"
                      target="_blank"
                      className="text-amber-600 hover:underline"
                    >
                      Terms & Conditions
                    </Link>
                    .
                  </label>
                </div>
                {errors.terms_accepted && (
                  <p className="text-xs text-red-500">
                    {errors.terms_accepted}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="pt-4 border-t border-gray-300">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-8 py-3 text-lg font-semibold bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-70 cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Submitting...
                    </span>
                  ) : (
                    "Complete Registration"
                  )}
                </button>
              </div>
            </form>

            {/* Success Modal */}
            {showSuccessModal  && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 transition-all duration-300">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 transition-all duration-300 scale-100">
                  <div className="text-center">
                   

                    <h3 className="text-2xl font-bold text-green-500 mb-2">
                      Application Submitted!
                    </h3>

                    <div className="space-y-3 text-sm text-gray-600">
                      <p>
                        Thank you for applying to the{" "}
                        <span className="font-semibold">
                          Astrotring Affiliate Program
                        </span>
                        .
                      </p>

                      <div className="bg-amber-50 p-4 rounded-lg text-left">
                        <p className="text-amber-800 font-medium mb-2">
                           What happens next?
                        </p>
                        <ul className="text-xs text-amber-700 space-y-1 list-disc list-inside">
                          <li>
                            Our team will review your application.
                          </li>
                          <li>
                            You will receive an email confirmation once your
                            account is approved
                          </li>
                          <li>
                            After approval, you can access your affiliate
                            dashboard.
                          </li>
                        </ul>
                      </div>

                      <p className="text-xs text-gray-500">
                      Please check your inbox for updates
                        from us.
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-400">
                        Reference ID:{" "}
                        <span className="font-mono font-semibold text-amber-600">
                          {registrationCode}
                        </span>
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setShowSuccessModal(false);
                        navigate("/become-an-affiliate");
                      }}
                      className="mt-5 w-full px-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white  rounded-xl hover:from-amber-500 hover:to-amber-600 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer"
                    >
                      Back to Affiliate Page
                    </button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-center text-sm text-gray-600 mt-6 pt-6 border-t border-gray-300">
              Already have an account?{" "}
              <a
                href="https://backend.astrotring.shop/"
                className="text-orange-600 hover:underline"
              >
                Login here
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateSignup;
