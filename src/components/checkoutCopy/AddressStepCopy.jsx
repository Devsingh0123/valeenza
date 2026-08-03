// src/components/checkout/AddressStep.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAddresses, addAddress, fetchPincodeDetails } from '../../redux/slices/addressSlice';
import { toast } from 'react-toastify';
import { Home, Plus, X } from 'lucide-react';

const AddressStep = ({ selectedAddressId, onSelectAddress }) => {
  const dispatch = useDispatch();
  const { addresses, loading } = useSelector((state) => state.address);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    mobile: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country_code: '+91',
    country: 'India',
    state_code: '',      //  added
    by_default: false,
  });
  const [adding, setAdding] = useState(false);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const hasFetched = useRef(false);
  const debounceTimer = useRef(null);

  useEffect(() => {
    if (!hasFetched.current && !loading) {
      hasFetched.current = true;
      dispatch(fetchAddresses());
    }
  }, [dispatch, loading]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);
  // Auto‑select default or first address when addresses load
useEffect(() => {
  if (addresses.length > 0 && !selectedAddressId) {
    const defaultAddr = addresses.find(addr => Number(addr.by_default) === 1);
    const addrToSelect = defaultAddr ? defaultAddr.id : addresses[0].id;
    onSelectAddress(addrToSelect);
  }
}, [addresses, selectedAddressId, onSelectAddress]);

  const fetchPincodeData = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    setPincodeLoading(true);
    setPincodeError('');
    try {
      const response = await dispatch(fetchPincodeDetails(pincode)).unwrap();
      if (response?.status === true && response.data?.length > 0) {
        const first = response.data[0];
        setNewAddress(prev => ({
          ...prev,
          city: first.city || '',
          state: first.state || '',
          country: response.country || 'India',
          state_code: first.state_code || '',   // ✅ fill state_code
        }));
        setPincodeError('');
      } else {
        setNewAddress(prev => ({ ...prev, city: '', state: '', state_code: '' }));
        setPincodeError('Pincode not found. Please enter manually.');
      }
    } catch (err) {
      setNewAddress(prev => ({ ...prev, city: '', state: '', state_code: '' }));
      setPincodeError('Unable to fetch. Please fill manually.');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePincodeChange = (e) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setNewAddress(prev => ({ ...prev, pincode: value }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.length === 6) {
      debounceTimer.current = setTimeout(() => {
        fetchPincodeData(value);
      }, 500);
    } else {
      setNewAddress(prev => ({ ...prev, city: '', state: '', state_code: '' }));
      setPincodeError('');
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setAdding(true);
    // Prepare payload with state_code
    const payload = {
      name: newAddress.name,
      mobile: newAddress.mobile,
      address: newAddress.address,
      city: newAddress.city,
      state: newAddress.state,
      pincode: newAddress.pincode,
      country_code: newAddress.country_code,
      country: newAddress.country,
      state_code: newAddress.state_code,   // ✅ send state_code
      by_default: newAddress.by_default ? 1 : 0,
    };
    try {
      await dispatch(addAddress(payload)).unwrap();
      toast.success('Address added');
      setShowAddForm(false);
      setNewAddress({
        name: '',
        mobile: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        country_code: '+91',
        country: 'India',
        state_code: '',
        by_default: false,
      });
      setPincodeError('');
      hasFetched.current = false;
      dispatch(fetchAddresses());
    } catch (err) {
      toast.error(err || 'Failed to add address');
    } finally {
      setAdding(false);
    }
  };

  if (loading && addresses.length === 0) return <div className="text-center py-8">Loading addresses...</div>;

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold text-gray-800">Delivery Address</h2>
      {/* Address List */}
      {addresses.length > 0 && (
        <div className="space-y-3 pr-1">
          {addresses.map((addr) => (
            <label
              key={addr.id}
              className={`flex gap-3 p-4 border rounded-xl cursor-pointer transition-all ${
                selectedAddressId === addr.id ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
              }`}
            >
              <input
                type="radio"
                name="address"
                value={addr.id}
                checked={selectedAddressId === addr.id}
                onChange={() => onSelectAddress(addr.id)}
                className="mt-1 text-amber-600"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Home className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">{addr.name}</span>
                  {Number(addr.by_default) === 1 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Default</span>}
                </div>
                <p className="text-gray-600 text-sm mt-1">{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                <p className="text-gray-500 text-xs mt-1">Mobile: {addr.country_code} {addr.mobile}</p>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Add Address Form */}
      {!showAddForm ? (
        <button onClick={() => setShowAddForm(true)} className="flex items-center gap-1 text-amber-600 text-sm font-medium hover:underline">
          <Plus size={16} /> Add new address
        </button>
      ) : (
        <form onSubmit={handleAddSubmit} className="bg-gray-50 p-4 rounded-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-700">New Address</h3>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          {/* 1. Label */}
          <input
            name="name"
            placeholder="Label (e.g., Home, Office)"
            value={newAddress.name}
            onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
            required
          />

          {/* 2. Mobile */}
          <input
            name="mobile"
            placeholder="Mobile number"
            value={newAddress.mobile}
            onChange={(e) => setNewAddress({ ...newAddress, mobile: e.target.value })}
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
            required
          />

          {/* 3. Country Code + Country */}
          <div className="flex gap-2">
            <select
              name="country_code"
              value={newAddress.country_code}
              onChange={(e) => setNewAddress({ ...newAddress, country_code: e.target.value })}
              className="w-1/3 p-3 border rounded-lg bg-white border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
            >
              <option value="+91">+91 (India)</option>
              <option value="+1">+1 (US)</option>
              <option value="+44">+44 (UK)</option>
            </select>
            <input
              name="country"
              placeholder="Country"
              value={newAddress.country}
              onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value })}
              className="flex-1 p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
              required
            />
          </div>

          {/* 4. Pincode (auto-fill) */}
          <div>
            <input
              name="pincode"
              placeholder="Pincode (6 digits)"
              value={newAddress.pincode}
              onChange={handlePincodeChange}
              className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
              required
            />
            {pincodeLoading && <p className="text-xs text-gray-500 mt-1">Fetching location...</p>}
            {pincodeError && <p className="text-xs text-red-500 mt-1">{pincodeError}</p>}
          </div>

          {/* 5. Address line */}
          <input
            name="address"
            placeholder="Street, House No., Area"
            value={newAddress.address}
            onChange={(e) => setNewAddress({ ...newAddress, address: e.target.value })}
            className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
            required
          />

          {/* 6. City & State (auto-filled) */}
          <div className="flex gap-2">
            <input
              name="city"
              placeholder="City"
              value={newAddress.city}
              onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
              className="flex-1 p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
              required
            />
            <div className="flex-1">
              <input
                name="state"
                placeholder="State"
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full p-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
                required
              />
              {newAddress.state_code && (
                <p className="text-xs text-gray-500 mt-1">Code: {newAddress.state_code}</p>
              )}
            </div>
          </div>

          {/* 7. Default checkbox */}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={newAddress.by_default}
              onChange={(e) => setNewAddress({ ...newAddress, by_default: e.target.checked })}
            />
            Set as default address
          </label>

          {/* 8. Submit button */}
          <button
            type="submit"
            disabled={adding}
            className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 transition"
          >
            {adding ? 'Saving...' : 'Save Address'}
          </button>
        </form>
      )}
    </div>
  );
};

export default AddressStep;