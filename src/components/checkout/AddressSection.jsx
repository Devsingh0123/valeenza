import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAddresses,
  addAddress,
  fetchPincodeDetails,
  setSelectedAddress,
  setSelectedAddressId,
} from "../../redux/slices/addressSlice";
import { toast } from "react-toastify";
import { MapPin } from "lucide-react";
import { useCountryCodes } from "@/hooks/useCountryCodes";
import Select from "react-select";

const EMPTY_FORM = {
  name: "",
  email: "",
  country_code: "+1",
  mobile: "",
  alternative_mobile: "",
  pincode: "",
  address: "",
  city: "",
  state: "",
  state_code: "",
  country: "",
  by_default: false,
};

const AddressSection = () => {
  const dispatch = useDispatch();

  const { countryCodes, loading: loadingCodes } = useCountryCodes();

  const { addresses, loading, selectedAddressId } = useSelector(
    (state) => state.address,
  );

  const { isLoggedIn } = useSelector((state) => state.userAuth);

  const [showNewForm, setShowNewForm] = useState(false);
  const [adding, setAdding] = useState(false);

  const [pincodeLoading, setPincodeLoading] = useState(false);

  const [pincodeError, setPincodeError] = useState("");

  const debounceTimer = useRef(null);
  const pincodeRequestId = useRef(0);

  const [formData, setFormData] = useState(EMPTY_FORM);

  // =========================================================
  // COUNTRY OPTIONS
  // =========================================================
  const countryOptions = countryCodes.map((code) => ({
    value: code.value,
    label: code.label,
  }));

  // =========================================================
  // FETCH SAVED ADDRESSES
  // =========================================================
  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }

    dispatch(fetchAddresses());
  }, [dispatch, isLoggedIn]);

  // =========================================================
  // SHOW NEW FORM WHEN NO ADDRESS EXISTS
  // =========================================================
  useEffect(() => {
    if (!loading) {
      setShowNewForm(addresses.length === 0);
    }
  }, [addresses.length, loading]);

  // =========================================================
  // CLEANUP DEBOUNCE
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
  // AUTO SELECT DEFAULT ADDRESS
  // =========================================================
  useEffect(() => {
    if (loading || addresses.length === 0 || selectedAddressId) {
      return;
    }

    const defaultAddress = addresses.find(
      (address) => Number(address.by_default) === 1,
    );

    const addressToSelect = defaultAddress || addresses[0];

    dispatch(setSelectedAddressId(addressToSelect.id));

    dispatch(setSelectedAddress(addressToSelect));
  }, [addresses, selectedAddressId, loading, dispatch]);

  // =========================================================
  // INPUT CHANGE
  // =========================================================
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =========================================================
  // PINCODE API
  // POST /user/get-pincode-data
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

      // Ignore old/stale API response
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
        typeof error === "string"
          ? error
          : "Unable to fetch pincode details. Please enter location manually.",
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

    // Invalidate previous request
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
  // SAVE ADDRESS
  // =========================================================
  const handleSaveAddress = async (e) => {
    e.preventDefault();

    if (pincodeLoading) {
      toast.info("Please wait while pincode details are being fetched.");
      return;
    }

    setAdding(true);

    const payload = {
      ...formData,
      name: formData.name.trim(),
      email: formData.email.trim(),
      mobile: formData.mobile.trim(),
      alternative_mobile: formData.alternative_mobile.trim(),
      address: formData.address.trim(),
      city: formData.city.trim(),
      state: formData.state.trim(),
      state_code: formData.state_code.trim(),
      country: formData.country.trim(),
      pincode: formData.pincode.trim(),
      by_default: formData.by_default ? 1 : 0,
    };

    try {
      const newAddress = await dispatch(addAddress(payload)).unwrap();

      toast.success("Address added successfully!");

      setFormData(EMPTY_FORM);
      setPincodeError("");
      setShowNewForm(false);

      if (newAddress?.id) {
        dispatch(setSelectedAddressId(newAddress.id));

        dispatch(setSelectedAddress(newAddress));
      }

      // Refresh addresses from backend
      await dispatch(fetchAddresses()).unwrap();
    } catch (error) {
      toast.error(
        typeof error === "string" ? error : "Failed to save address.",
      );
    } finally {
      setAdding(false);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading && addresses.length === 0) {
    return (
      <div className="text-center py-6 text-sm font-medium text-gray-500">
        Loading your addresses...
      </div>
    );
  }

  return (
    <div className="w-full bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-4 text-left">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-sky-400/10 text-sky-500 rounded-lg shrink-0">
            <MapPin size={20} />
          </div>

          <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
            Delivery Address
          </h3>
        </div>

        <button
          type="button"
          onClick={() => setShowNewForm((prev) => !prev)}
          className="self-start sm:self-center text-xs font-bold text-sky-500 hover:text-sky-600 bg-sky-50 hover:bg-sky-100 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          {showNewForm ? "Saved Addresses" : "+ Add New Address"}
        </button>
      </div>

      {/* =====================================================
          SAVED ADDRESSES
      ====================================================== */}
      {!showNewForm ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => {
            const isSelected = Number(selectedAddressId) === Number(addr.id);

            return (
              <label
                key={addr.id}
                className={`relative flex flex-col p-4 border rounded-xl cursor-pointer transition-all ${
                  isSelected
                    ? "border-sky-400 bg-sky-50 ring-1 ring-sky-400"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md uppercase tracking-wider">
                      {addr.name}
                    </span>

                    {Number(addr.by_default) === 1 && (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-sky-100 text-sky-700 rounded-md uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>

                  <input
                    type="radio"
                    name="checkout_address"
                    value={addr.id}
                    checked={isSelected}
                    onChange={() => {
                      dispatch(setSelectedAddressId(addr.id));

                      dispatch(setSelectedAddress(addr));
                    }}
                    className="h-4 w-4 accent-sky-600 cursor-pointer"
                  />
                </div>

                <p className="text-xs font-semibold text-gray-700 line-clamp-2 mb-2 leading-relaxed">
                  {addr.address}, {addr.city}, {addr.state}
                  {addr.state_code ? ` (${addr.state_code})` : ""} -{" "}
                  {addr.pincode}, {addr.country}
                </p>

                <p className="text-[11px] font-medium text-gray-400 mt-auto">
                  📞 {addr.country_code || "+1"} {addr.mobile}
                </p>
              </label>
            );
          })}
        </div>
      ) : (
        /* =====================================================
           NEW ADDRESS FORM
        ====================================================== */
        <form
          onSubmit={handleSaveAddress}
          className="grid grid-cols-12 gap-3 p-4 bg-gray-50/50 rounded-xl border border-gray-200/60"
        >
          {/* NAME */}
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter Your Name *"
            className="col-span-12 sm:col-span-6 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/10 focus:border-sky-400 bg-white"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter Your Email *"
            className="col-span-12 sm:col-span-6 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400/10 focus:border-sky-400 bg-white"
          />

          {/* COUNTRY CODE */}
          <div className="col-span-4 sm:col-span-3">
            {loadingCodes ? (
              <div className="w-full px-2 py-2 text-xs font-semibold text-center border border-gray-200 rounded-lg bg-gray-100 text-gray-500">
                Loading...
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
                formatOptionLabel={(option, { context }) =>
                  context === "value" ? option.value : option.label
                }
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    borderColor: "#d1d5db",
                    boxShadow: "none",
                    borderRadius: "0.5rem",
                    minHeight: "2.5rem",
                    fontSize: "0.65rem",
                    fontWeight: "bold",
                  }),
                  menu: (base) => ({
                    ...base,
                    zIndex: 9999,
                  }),
                }}
              />
            )}
          </div>

          {/* MOBILE */}
          <input
            type="tel"
            name="mobile"
            required
            maxLength={15}
            value={formData.mobile}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                mobile: e.target.value.replace(/\D/g, ""),
              }))
            }
            placeholder="Mobile Number *"
            className="col-span-8 sm:col-span-4 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
          />

          {/* ALTERNATIVE MOBILE */}
          <input
            type="tel"
            name="alternative_mobile"
            maxLength={15}
            value={formData.alternative_mobile}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                alternative_mobile: e.target.value.replace(/\D/g, ""),
              }))
            }
            placeholder="Alternate Mobile (Optional)"
            className="col-span-12 sm:col-span-5 px-4 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
          />

          {/* PINCODE */}
          <div className="col-span-5 sm:col-span-4 relative">
            <input
              type="text"
              name="pincode"
              required
              maxLength={5}
              inputMode="numeric"
              value={formData.pincode}
              onChange={handlePincodeChange}
              placeholder="Zip Code *"
              className="w-full px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
            />

            {pincodeLoading && (
              <span className="absolute right-2 top-2.5 text-[9px] font-bold text-sky-500 animate-pulse">
                Fetching...
              </span>
            )}

            {pincodeError && (
              <p className="text-[9px] text-red-500 font-semibold mt-1">
                {pincodeError}
              </p>
            )}
          </div>

          {/* CITY */}
          <input
            type="text"
            name="city"
            required
            value={formData.city}
            onChange={handleInputChange}
            placeholder="City Name *"
            className="col-span-7 sm:col-span-8 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
          />

          {/* ADDRESS */}
          <input
            type="text"
            name="address"
            required
            value={formData.address}
            onChange={handleInputChange}
            placeholder="Enter Your Full Address... *"
            className="col-span-12 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
          />

          {/* STATE */}
          <input
            type="text"
            name="state"
            required
            value={formData.state}
            onChange={handleInputChange}
            placeholder="State Name *"
            className="col-span-12 sm:col-span-5 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
          />

          {/* STATE CODE */}
          <input
            type="text"
            name="state_code"
            required
            value={formData.state_code}
            onChange={handleInputChange}
            placeholder="State Code *"
            className="col-span-4 sm:col-span-3 px-3 py-2 text-xs font-semibold text-center border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
          />

          {/* COUNTRY */}
          <input
            type="text"
            name="country"
            required
            value={formData.country}
            onChange={handleInputChange}
            placeholder="Country *"
            className="col-span-8 sm:col-span-4 px-3 py-2 text-xs font-semibold border border-gray-200 rounded-lg focus:outline-none focus:border-sky-400 bg-white"
          />

          {/* DEFAULT */}
          <label className="col-span-12 flex items-center gap-2 text-xs text-gray-600 font-semibold cursor-pointer">
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
              className="h-4 w-4 accent-sky-500"
            />
            Set as default delivery location
          </label>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={adding || pincodeLoading}
            className="col-span-12 w-full py-2.5 bg-sky-500 text-white font-extrabold text-xs rounded-lg hover:bg-sky-600 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {adding
              ? "Saving Destination..."
              : pincodeLoading
                ? "Fetching Pincode..."
                : "Save and Use This Address"}
          </button>
          <p className="col-span-12 w-full mt-2 text-center text-xs font-semibold text-red-600">
            Please save your address first before placing your order. Unsaved
            addresses cannot be used for checkout.
          </p>
        </form>
      )}
    </div>
  );
};

export default AddressSection;
