import React, { useEffect, useRef, useState } from "react";

import { useDispatch, useSelector } from "react-redux";
import Select from "react-select";

import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  clearAddressError,
  fetchPincodeDetails,
} from "../../redux/slices/addressSlice";

import { toast } from "react-toastify";

import {
  MapPin,
  Home,
  Phone,
  Plus,
  Edit,
  Trash2,
  Star,
  X,
  Globe,
  ArrowLeft,
  Mail,
} from "lucide-react";

import { useCountryCodes } from "../../hooks/useCountryCodes";
import { useNavigate } from "react-router-dom";

const EMPTY_FORM = {
  name: "",
  email: "",
  country_code: "+1",
  mobile: "",
  alternative_mobile: "",
  city: "",
  state: "",
  country: "",
  address: "",
  pincode: "",
  state_code: "",
  by_default: false,
};

const AddressManager = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { addresses, loading, error } = useSelector((state) => state.address);

  const {
    countryCodes,
    loading: loadingCodes,
    error: codesError,
  } = useCountryCodes();

  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState(EMPTY_FORM);

  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [pincodeError, setPincodeError] = useState("");

  const debounceTimer = useRef(null);
  const pincodeRequestId = useRef(0);

  // =========================================================
  // COUNTRY OPTIONS
  // =========================================================
  const countryOptions = countryCodes.map((code) => ({
    value: code.value,
    label: code.label,
  }));

  // =========================================================
  // FETCH ADDRESSES
  // =========================================================
  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  // =========================================================
  // ERROR HANDLING
  // =========================================================
  useEffect(() => {
    if (!error) {
      return;
    }

    toast.error(error);
    dispatch(clearAddressError());
  }, [error, dispatch]);

  useEffect(() => {
    if (codesError) {
      toast.error("Could not load country codes. Using default.");
    }
  }, [codesError]);

  // =========================================================
  // CLEANUP
  // =========================================================
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      pincodeRequestId.current += 1;
    };
  }, []);

  // =========================================================
  // PINCODE API
  // =========================================================
  const fetchPincodeData = async (pincode) => {
    if (!/^\d{5}$/.test(pincode)) {
      return;
    }

    const requestId = ++pincodeRequestId.current;

    setPincodeLoading(true);
    setPincodeError("");

    try {
      const response = await dispatch(fetchPincodeDetails(pincode)).unwrap();

      // Ignore old response
      if (requestId !== pincodeRequestId.current) {
        return;
      }

      if (
        response?.status === true &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const first = response.data[0];

        setFormData((prev) => ({
          ...prev,
          city: first.city || "",
          state: first.state || "",
          state_code: first.state_code || "",
          country: response.country || first.country || "",
        }));

        setPincodeError("");
      } else {
        setPincodeError("Pincode not found. Please enter location manually.");
      }
    } catch (error) {
      if (requestId !== pincodeRequestId.current) {
        return;
      }

      setPincodeError(
        typeof error === "string" ? error : "Unable to fetch pincode details.",
      );
    } finally {
      if (requestId === pincodeRequestId.current) {
        setPincodeLoading(false);
      }
    }
  };

  // =========================================================
  // PINCODE INPUT
  // =========================================================
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 5);

    setFormData((prev) => ({
      ...prev,
      pincode: value,
    }));

    setPincodeError("");

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    pincodeRequestId.current += 1;

    if (value.length === 5) {
      debounceTimer.current = setTimeout(() => {
        fetchPincodeData(value);
      }, 500);
    } else {
      setPincodeLoading(false);

      setFormData((prev) => ({
        ...prev,
        city: "",
        state: "",
        state_code: "",
        country: "",
      }));
    }
  };

  // =========================================================
  // NORMAL INPUT
  // =========================================================
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // =========================================================
  // RESET FORM
  // =========================================================
  const resetForm = () => {
    setFormData(EMPTY_FORM);

    setEditingId(null);
    setPincodeError("");
    setPincodeLoading(false);

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    pincodeRequestId.current += 1;
  };

  // =========================================================
  // SUBMIT
  // =========================================================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pincodeLoading) {
      toast.info("Please wait while pincode details are being fetched.");
      return;
    }

    const requiredFields = [
      "name",
      "email",
      "mobile",
      "address",
      "pincode",
      "city",
      "state",
      "state_code",
      "country",
    ];

    const missingField = requiredFields.find(
      (field) => !String(formData[field] ?? "").trim(),
    );

    if (missingField) {
      toast.error("Please fill all required fields.");
      return;
    }

   

    const payload = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      country_code: formData.country_code,
      mobile: formData.mobile.trim(),
      alternative_mobile: formData.alternative_mobile.trim() || null,
      city: formData.city.trim(),
      state: formData.state.trim(),
      state_code: formData.state_code.trim(),
      country: formData.country.trim(),
      address: formData.address.trim(),
      pincode: formData.pincode.trim(),
      by_default: formData.by_default ? 1 : 0,
    };

    try {
      if (editingId) {
        await dispatch(
          updateAddress({
            id: editingId,
            addressData: payload,
          }),
        ).unwrap();

        toast.success("Address updated successfully.");
      } else {
        await dispatch(addAddress(payload)).unwrap();

        toast.success("Address added successfully.");
      }

      resetForm();

      // Sync with backend
      await dispatch(fetchAddresses()).unwrap();
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to save address.",
      );
    }
  };

  // =========================================================
  // EDIT
  // =========================================================
  const handleEdit = (address) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    pincodeRequestId.current += 1;

    setEditingId(address.id);

    setFormData({
      name: address.name || "",
      email: address.email || "",
      country_code: address.country_code || "+1",
      mobile: address.mobile || "",
      alternative_mobile: address.alternative_mobile || "",
      city: address.city || "",
      state: address.state || "",
      country: address.country || "",
      address: address.address || "",
      pincode: address.pincode || "",
      state_code: address.state_code || "",
      by_default:
        Number(address.by_default) === 1 || address.by_default === true,
    });

    setPincodeError("");
  };

  // =========================================================
  // DELETE
  // =========================================================
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await dispatch(deleteAddress(id)).unwrap();

      toast.success("Address deleted successfully.");
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to delete address.",
      );
    }
  };

  // =========================================================
  // UI
  // =========================================================
  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      {/* BACK */}
      <button
        type="button"
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-sky-600 hover:underline mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </button>

      {/* TITLE */}
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-sky-600" />

        <h2 className="text-2xl font-semibold text-gray-800">
          Manage Addresses
        </h2>
      </div>

      {/* =====================================================
          FORM
      ====================================================== */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
            {editingId ? (
              <Edit className="w-4 h-4 text-sky-600" />
            ) : (
              <Plus className="w-4 h-4 text-sky-600" />
            )}

            {editingId ? "Edit Address" : "Add New Address"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* NAME */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name <span className="text-sky-600">*</span>
              </label>

              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-sky-600">*</span>
              </label>

              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter Your Email"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* MOBILE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile <span className="text-sky-600">*</span>
              </label>

              <input
                type="tel"
                name="mobile"
                required
                maxLength={15}
                inputMode="numeric"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    mobile: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Mobile Number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* ALTERNATIVE MOBILE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternative Mobile
              </label>

              <input
                type="tel"
                name="alternative_mobile"
                maxLength={15}
                inputMode="numeric"
                value={formData.alternative_mobile}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    alternative_mobile: e.target.value.replace(/\D/g, ""),
                  }))
                }
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* COUNTRY CODE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Code <span className="text-sky-600">*</span>
              </label>

              {loadingCodes ? (
                <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
                  Loading codes...
                </div>
              ) : (
                <Select
                  name="country_code"
                  options={countryOptions}
                  value={countryOptions.find(
                    (option) => option.value === formData.country_code,
                  )}
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      country_code: selected?.value || "",
                    }))
                  }
                  isClearable={false}
                  isSearchable
                  placeholder="Select country code"
                  classNamePrefix="react-select"
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? "#f59e0b" : "#d1d5db",
                      boxShadow: state.isFocused ? "0 0 0 1px #f59e0b" : "none",
                      borderRadius: "0.375rem",
                      minHeight: "2.5rem",
                    }),
                    menu: (base) => ({
                      ...base,
                      zIndex: 9999,
                    }),
                  }}
                />
              )}
            </div>

            {/* PINCODE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Zip Code <span className="text-sky-600">*</span>
              </label>

              <input
                type="text"
                name="pincode"
                required
                maxLength={6}
                inputMode="numeric"
                value={formData.pincode}
                onChange={handlePincodeChange}
                placeholder="zip code"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />

              {pincodeLoading && (
                <p className="text-xs text-sky-600 mt-1">
                  Fetching location...
                </p>
              )}

              {pincodeError && (
                <p className="text-xs text-red-500 mt-1">{pincodeError}</p>
              )}
            </div>

            {/* COUNTRY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-sky-600">*</span>
              </label>

              <input
                type="text"
                name="country"
                required
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* CITY */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-sky-600">*</span>
              </label>

              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* STATE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State {formData.state_code && `(${formData.state_code})`}{" "}
                <span className="text-sky-600">*</span>
              </label>

              <input
                type="text"
                name="state"
                required
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* STATE CODE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State Code <span className="text-sky-600">*</span>
              </label>

              <input
                type="text"
                name="state_code"
                required
                value={formData.state_code}
                onChange={handleChange}
                placeholder="State Code"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>

            {/* ADDRESS */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address <span className="text-sky-600">*</span>
              </label>

              <input
                type="text"
                name="address"
                required
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Your Full address..."
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* DEFAULT */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="by_default"
              checked={formData.by_default}
              onChange={handleChange}
              id="default"
              className="accent-sky-500"
            />

            <label htmlFor="default" className="text-sm text-gray-700">
              Set as default address
            </label>
          </div>

          {/* BUTTONS */}
          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              disabled={loading || pincodeLoading}
              className="bg-sky-600 hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-md transition flex items-center gap-2"
            >
              {editingId ? (
                <Edit className="w-4 h-4" />
              ) : (
                <Plus className="w-4 h-4" />
              )}

              {editingId ? "Update Address" : "Add Address"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md transition flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* =====================================================
          SAVED ADDRESSES
      ====================================================== */}
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent" />

          <p className="mt-2 text-gray-500">Loading addresses...</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-sky-600" />

            <h3 className="text-xl font-semibold text-gray-800">
              Saved Addresses
            </h3>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center text-gray-500">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-2" />

              <p>No addresses saved yet. Add one above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                    Number(addr.by_default) === 1
                      ? "border-sky-300 bg-sky-50"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-sky-600" />

                      <span className="font-medium text-gray-800">
                        {addr.name}
                      </span>

                      {Number(addr.by_default) === 1 && (
                        <span className="inline-flex items-center gap-1 text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-sky-500" />
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(addr)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(addr.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-sm text-gray-600">
                    {addr.email && (
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {addr.email}
                      </p>
                    )}

                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {addr.country_code || "+1"} {addr.mobile}
                    </p>

                    {addr.alternative_mobile && (
                      <p className="flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {addr.alternative_mobile}
                      </p>
                    )}

                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />

                      <span>
                        {addr.address}, {addr.city}, {addr.state}
                        {addr.state_code ? ` (${addr.state_code})` : ""} -{" "}
                        {addr.pincode}
                      </span>
                    </p>

                    <p className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      {addr.country}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressManager;
