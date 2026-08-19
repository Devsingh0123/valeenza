// src/components/checkout/AddressSection.jsx
import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddresses,
  addAddress,
  fetchPincodeDetails,
  setSelectedAddress,
  setSelectedAddressId,
} from "../../redux/slices/addressSlice";
import { toast } from "react-toastify";
import { Bold, MapPin } from "lucide-react";
import { useCountryCodes } from "@/hooks/useCountryCodes";
import Select from "react-select";

/**
 * AddressSection Component
 * Manages delivery address selection and a professional, compact 10-field grid form.
 * No labels used—clean, descriptive placeholders only with Amber design.
 */
const AddressSection = () => {
  const dispatch = useDispatch();
  const { countryCodes, loading: loadingCodes } = useCountryCodes();

  // Redux global state
  const { addresses, loading, selectedAddressId, selectedAddress } =
    useSelector((state) => state.address);
  const { isLoggedIn } = useSelector((state) => state.userAuth);

  // Local active states
  const [showNewForm, setShowNewForm] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState("");

  const hasFetched = useRef(false);
  const debounceTimer = useRef(null);

  // EXACTLY 10 FIELDS
  const [formData, setFormData] = useState({
    name: "", // 1. Name / Tag
    email: "", // 2. Email (mandatory)
    country_code: "+91", // 3. Country Code
    mobile: "", // 4. Mobile Number
    alternative_mobile: "", // 5. Mobile Number
    pincode: "", // 6. Pincode
    address: "", // 7. Full Address Line
    city: "", // 8. City
    state: "", // 9. State
    state_code: "", // 10. State Code
    country: "India", // 11. Country
    by_default: false, // 12. Default Checklist Flag
  });

  // country options for country codes
  const countryOptions = countryCodes.map((code) => ({
    value: code.value,
    label: code.label,
  }));
  // Fetch saved addresses on mount
  // useEffect(() => {
  //   if (!hasFetched.current && !loading) {
  //     hasFetched.current = true;
  //     dispatch(fetchAddresses());
  //   //    if (addresses.length === 0) {
  //   // setShowNewForm(true);
  // // }
  //   }
  // }, [dispatch, loading,isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchAddresses());
    }
  }, [isLoggedIn, dispatch]);

  useEffect(() => {
    setShowNewForm(addresses.length === 0);
  }, [addresses]);

  // Debouncer Cleanup Hook
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Auto-select default/first address locally
  useEffect(() => {
    if (!loading && addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = addresses.find(
        (addr) => Number(addr.by_default) === 1,
      );
      const addrToSelect = defaultAddr || addresses[0];
      dispatch(setSelectedAddressId(addrToSelect.id));
      dispatch(setSelectedAddress(addrToSelect));
    }
  }, [addresses, selectedAddressId, loading, dispatch]);

  // Standard input tracker
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Pincode Auto-Resolution Handler (Keeps inputs editable)
  const fetchPincodeData = async (pin) => {
    if (!pin || pin.length !== 6) return;
    setPincodeLoading(true);
    setPincodeError("");
    try {
      const response = await dispatch(fetchPincodeDetails(pin)).unwrap();
      if (response?.status === true && response.data?.length > 0) {
        const first = response.data[0];
        setFormData((prev) => ({
          ...prev,
          city: first.city || "",
          state: first.state || "",
          state_code: first.state_code || "",
          country: response.country || "India",
        }));
        setPincodeError("");
      } else {
        setPincodeError("Not found. Enter manually.");
      }
    } catch (err) {
      setPincodeError(err);
    } finally {
      setPincodeLoading(false);
    }
  };

  // Pincode Input Custom Watcher
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: value }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.length === 6) {
      debounceTimer.current = setTimeout(() => {
        fetchPincodeData(value);
      }, 500);
    }
  };

  // Submit handling & payload submission
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    setAdding(true);
    const payload = {
      ...formData,
      by_default: formData.by_default ? 1 : 0,
    };

    try {
      const newAddress = await dispatch(addAddress(payload)).unwrap();
      toast.success("Address added successfully!");
      setShowNewForm(false);

      // Reset Form State perfectly
      setFormData({
        name: "",
        email: "",
        country_code: "+91",
        mobile: "",
        alternative_mobile: "",
        pincode: "",
        address: "",
        city: "",
        state: "",
        state_code: "",
        country: "India",
        by_default: false,
      });
      setPincodeError("");

      if (newAddress?.id) {
        dispatch(setSelectedAddressId(newAddress.id));
        dispatch(setSelectedAddress(newAddress));
      }

      hasFetched.current = false;
      dispatch(fetchAddresses());
    } catch (err) {
      toast.error(err || "Failed to save address");
    } finally {
      setAdding(false);
    }
  };

  if (loading && addresses.length === 0) {
    return (
      <div className="text-center py-6 text-sm font-medium text-gray-500">
        Loading your addresses...
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 text-left">
      {/* Upper Action Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-400/10 text-amber-500 rounded-lg shrink-0">
            <MapPin size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
              Delivery Address
            </h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowNewForm(!showNewForm)}
          className="self-start sm:self-center text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {showNewForm ? "Saved Addresses" : "+ Add New Address"}
        </button>
      </div>

      {/* Screen Mode Render Engine */}
      {!showNewForm ? (
        /* --- MODE 1: SELECT EXISTING TILES --- */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const isTargeted = selectedAddressId === addr.id;
            return (
              <label
                key={addr.id}
                className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                  isTargeted
                    ? "border-amber-400 bg-amber-50 ring-1 ring-amber-400"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider">
                      {addr.name}
                    </span>
                    {Number(addr.by_default) === 1 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100 text-amber-700 rounded-md uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  <input
                    type="radio"
                    name="checkout_address"
                    value={addr.id}
                    checked={isTargeted}
                    onChange={() => {
                      dispatch(setSelectedAddressId(addr.id));
                      dispatch(setSelectedAddress(addr));
                    }}
                    className="h-4 w-4 text-amber-500 accent-amber-600 border-gray-300 focus:ring-amber-500 cursor-pointer"
                  />
                </div>

                <p className="text-xs font-semibold text-gray-700 line-clamp-2 mb-2 leading-relaxed">
                  {addr.address}, {addr.city}, {addr.state} ({addr.state_code})
                  - {addr.pincode}, {addr.country}
                </p>
                <p className="text-[11px] font-medium text-gray-400 mt-auto flex items-center gap-1.5">
                  <span className="text-xs">📞</span>{" "}
                  {addr.country_code || "+91"} {addr.mobile}
                </p>
              </label>
            );
          })}
        </div>
      ) : (
        /* --- MODE 2: HIGHLY OPTIMIZED 10-FIELD INTUITIVE GRID FORM --- */
        <form
          onSubmit={handleSaveAddress}
          className="grid grid-cols-12 gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-200/60 transition-all"
        >
          {/*  Name / Address Tag */}
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter Your Name *"
            className="col-span-12 sm:col-span-6 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
          />

          {/* Email */}
          <div className="col-span-12 sm:col-span-6">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter Your Email*"
              required
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
            />
          </div>

          {/*  Country Code */}
          <div className="col-span-4 sm:col-span-3 ">
            {loadingCodes ? (
              <div className="w-full px-2 py-2 text-xs font-semibold text-center border border-gray-200 rounded-lg bg-gray-100 text-gray-500">
                Loading...
              </div>
            ) : (
              <Select
                name="country_code"
                options={countryOptions}
                value={countryOptions.find(
                  (opt) => opt.value === formData.country_code,
                )}
                onChange={(selected) =>
                  setFormData((prev) => ({
                    ...prev,
                    country_code: selected ? selected.value : "",
                  }))
                }
                placeholder="Select country code"
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
                    minHeight: "2.5rem",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                    textAlign: "center",
                    width: "100px",
                  }),
                  menu: (base) => ({ ...base, zIndex: 9999, width: "200px" }),
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
                  }),
                }}
              />
            )}
          </div>

          {/*  Mobile Number */}
          <input
            type="tel"
            name="mobile"
            maxLength={10}
            value={formData.mobile}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                mobile: e.target.value.replace(/\D/g, ""),
              }))
            }
            placeholder="Mobile Number *"
            className="col-span-8 sm:col-span-4 px-4 ml-4 sm:ml-0 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
          />

          {/* ====== Alternative Mobile (optional) ====== */}
          <input
            type="tel"
            name="alternative_mobile"
            maxLength={10}
            value={formData.alternative_mobile}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                alternative_mobile: e.target.value.replace(/\D/g, ""),
              }))
            }
            placeholder="Alternate Mobile (Optional)"
            className="col-span-12 sm:col-span-5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
          />

          {/*  Pincode Input (Compact with absolute loading text) */}
          <div className="col-span-5 sm:col-span-4 relative">
            <input
              type="text"
              name="pincode"
              required
              maxLength={6}
              value={formData.pincode}
              onChange={handlePincodeChange}
              placeholder="Pincode *"
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
            />
            {pincodeLoading && (
              <span className="absolute right-2 top-2.5 text-[9px] font-bold text-amber-500 animate-pulse">
                Syncing...
              </span>
            )}
            {pincodeError && (
              <p className="text-[9px] text-amber-600 font-bold mt-0.5 pl-1 absolute bg-gray-50 px-1 rounded border border-gray-100 z-10">
                {pincodeError}
              </p>
            )}
          </div>

          {/*  City Input */}
          <input
            type="text"
            name="city"
            required
            value={formData.city}
            onChange={handleInputChange}
            placeholder="City Name *"
            className="col-span-7 sm:col-span-8 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
          />

          {/*  Full Address Line */}
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Flat, House No., Building, Apartment, Street Area *"
            className="col-span-12 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
          />

          {/*  State Input */}
          <input
            type="text"
            name="state"
            required
            value={formData.state}
            onChange={handleInputChange}
            placeholder="State Name *"
            className="col-span-12 sm:col-span-5 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
          />

          {/*  State Code Input (Compact width) */}
          <input
            type="text"
            name="state_code"
            required
            value={formData.state_code}
            onChange={handleInputChange}
            placeholder="State Code*"
            className="col-span-4 sm:col-span-3 px-3 py-2 text-xs font-semibold text-center border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
          />

          {/*  Country Input */}
          <input
            type="text"
            name="country"
            required
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Country *"
            className="col-span-8 sm:col-span-4 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400/10 focus:border-amber-400 bg-white text-gray-800 transition-all placeholder:font-medium placeholder:text-gray-400"
          />

          {/*  Default Checklist Option */}
          <label className="col-span-12 flex items-center gap-2 text-xs text-gray-600 font-semibold select-none py-1 pl-1 cursor-pointer">
            <input
              type="checkbox"
              name="by_default"
              checked={formData.by_default}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  by_default: e.target.checked,
                }))
              }
              className="h-4 w-4 text-amber-500 accent-amber-500 border-gray-300 rounded focus:ring-amber-500 cursor-pointer"
            />
            Set as default delivery location
          </label>

          {/* Form Action Submit Button */}
          <button
            type="submit"
            disabled={adding}
            className="col-span-12 w-full py-2.5 bg-amber-500 text-white font-extrabold text-xs rounded-lg hover:bg-amber-600 transition-all tracking-wide shadow-sm cursor-pointer mt-1 disabled:opacity-50"
          >
            {adding ? "Saving Destination..." : "Save and Use This Address"}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddressSection;
