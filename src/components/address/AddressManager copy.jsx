// src/components/AddressManager.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import {
  fetchAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  clearAddressError,
  fetchPincodeDetails,
} from '../../redux/slices/addressSlice';
import { toast } from 'react-toastify';
import { MapPin, Home, Phone, Plus, Edit, Trash2, Star, X, Globe, ArrowLeft, Mail } from 'lucide-react';
import { useCountryCodes } from '../../hooks/useCountryCodes';
import { useNavigate } from 'react-router-dom';

const AddressManager = () => {
  const dispatch = useDispatch();
  const { addresses, loading, error } = useSelector((state) => state.address);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country_code: '+91',
    mobile: '',
    alternative_mobile: '',
    city: '',
    state: '',
    country: 'India',
    address: '',
    pincode: '',
    by_default: false,
    state_code: '',   //  changed from stateCode
  });
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeError, setPincodeError] = useState('');
  const navigate = useNavigate();

  const debounceTimer = useRef(null);

  const { countryCodes, loading: loadingCodes, error: codesError } = useCountryCodes();

  const countryOptions = countryCodes.map((code) => ({
    value: code.value,
    label: code.label,
  }));

  useEffect(() => {
    dispatch(fetchAddresses());
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearAddressError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (codesError) {
      toast.error('Could not load country codes. Using default.');
    }
  }, [codesError]);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const fetchPincodeData = async (pincode) => {
    if (!pincode || pincode.length !== 6) return;
    setPincodeLoading(true);
    setPincodeError('');
    try {
      const response = await dispatch(fetchPincodeDetails(pincode)).unwrap();
      // console.log('Pincode response:', response);
      if (response?.status === true && response.data?.length > 0) {
        const first = response.data[0];
        setFormData((prev) => ({
          ...prev,
          city: first.city || '',
          state: first.state || '',
          country: response.country || 'India',
          state_code: first.state_code || '',
        }));
        setPincodeError('');
      } else {
        setFormData((prev) => ({ ...prev, city: '', state: '', country: '', state_code: '' }));
        setPincodeError('Pincode not found. Please enter manually.');
      }
    } catch (error) {
      console.error('Pincode API error:', error);
      setFormData((prev) => ({ ...prev, city: '', state: '', country: '', state_code: '' }));
      setPincodeError(error || 'Failed to fetch. Please fill manually.');
    } finally {
      setPincodeLoading(false);
    }
  };

  const handlePincodeChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 6) value = value.slice(0, 6);
    setFormData((prev) => ({ ...prev, pincode: value }));

    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (value.length === 6) {
      debounceTimer.current = setTimeout(() => {
        fetchPincodeData(value);
      }, 500);
    } else {
      setFormData((prev) => ({ ...prev, city: '', state: '', country: '', state_code: '' }));
      setPincodeError('');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      country_code: '+91',
      mobile: '',
      alternative_mobile: '',
      city: '',
      state: '',
      country: 'India',
      address: '',
      pincode: '',
      state_code: '',
      by_default: false,
    });
    setEditingId(null);
    setPincodeError('');
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.mobile ||
      !formData.address ||
      !formData.pincode ||
      !formData.city ||
      !formData.state ||
      !formData.country
    ) {
      toast.error('Please fill all required fields');
      return;
    }

    const payload = {
      name: formData.name,
      email: formData.email || null,
      country_code: formData.country_code,
      mobile: formData.mobile,
      alternative_mobile: formData.alternative_mobile || null,
      city: formData.city,
      state: formData.state,
      state_code: formData.state_code,
      country: formData.country,
      address: formData.address,
      pincode: formData.pincode,
      by_default: formData.by_default ? 1 : 0,
    };

    try {
      if (editingId) {
        await dispatch(updateAddress({ id: editingId, addressData: payload })).unwrap();
        toast.success('Address updated');
      } else {
        await dispatch(addAddress(payload)).unwrap();
        toast.success('Address added');
      }
      resetForm();
    } catch (err) {
      toast.error(err || 'Failed to save address');
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.id);
    setFormData({
      name: address.name || '',
      email: address.email || '',
      country_code: address.country_code || '+91',
      mobile: address.mobile || '',
      alternative_mobile: address.alternative_mobile || '',
      city: address.city || '',
      state: address.state || '',
      country: address.country || 'India',
      address: address.address || '',
      pincode: address.pincode || '',
      state_code: address.state_code || '',
      by_default: address.by_default === 1 || address.by_default === true,
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await dispatch(deleteAddress(id)).unwrap();
        toast.success('Address deleted');
      } catch (err) {
        toast.error(err || 'Failed to delete address');
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-amber-600 hover:underline mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </button>
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-amber-600" />
        <h2 className="text-2xl font-semibold text-gray-800">Manage Addresses</h2>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
          <h3 className="text-md font-semibold text-gray-700 flex items-center gap-2">
            {editingId ? <Edit className="w-4 h-4 text-amber-600" /> : <Plus className="w-4 h-4 text-amber-600" />}
            {editingId ? 'Edit Address' : 'Add New Address'}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Label */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name <span className="text-amber-600">*</span></label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter Your Name*"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-amber-600">*</span></label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="care@astrotring.com*"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile <span className="text-amber-600">*</span></label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="9876543210"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Alternative Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alternative Mobile (optional)</label>
              <input
                type="tel"
                name="alternative_mobile"
                value={formData.alternative_mobile}
                onChange={handleChange}
                placeholder="Optional"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Country Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country Code <span className="text-amber-600">*</span></label>
              {loadingCodes ? (
                <div className="border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">Loading codes...</div>
              ) : (
                <Select
                  name="country_code"
                  options={countryOptions}
                  value={countryOptions.find((opt) => opt.value === formData.country_code)}
                  onChange={(selected) =>
                    setFormData({ ...formData, country_code: selected ? selected.value : '' })
                  }
                  placeholder="Select country code"
                  className="react-select-container"
                  classNamePrefix="react-select"
                  isClearable={false}
                  isSearchable={true}
                  styles={{
                    control: (base, state) => ({
                      ...base,
                      borderColor: state.isFocused ? '#f59e0b' : '#d1d5db',
                      boxShadow: state.isFocused ? '0 0 0 1px #f59e0b' : 'none',
                      '&:hover': { borderColor: '#f59e0b' },
                      borderRadius: '0.375rem',
                      minHeight: '2.5rem',
                    }),
                    menu: (base) => ({ ...base, zIndex: 9999 }),
                    option: (base, state) => ({
                      ...base,
                      backgroundColor: state.isSelected ? '#f59e0b' : state.isFocused ? '#fef3c7' : 'white',
                      color: state.isSelected ? 'white' : '#374151',
                      '&:active': { backgroundColor: '#f59e0b' },
                    }),
                  }}
                />
              )}
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pincode <span className="text-amber-600">*</span></label>
              <input
                type="text"
                name="pincode"
                value={formData.pincode}
                onChange={handlePincodeChange}
                placeholder="6-digit pincode"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              {pincodeLoading && <p className="text-xs text-gray-500 mt-1">Fetching location...</p>}
              {pincodeError && <p className="text-xs text-red-500 mt-1">{pincodeError}</p>}
            </div>

            {/* Country */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country <span className="text-amber-600">*</span></label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="India"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City <span className="text-amber-600">*</span></label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Mumbai"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* State */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State {formData.state_code ? `(${formData.state_code})` : ''} <span className="text-amber-600">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="Maharashtra"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Full Address */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Address <span className="text-amber-600">*</span></label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House No., Street, Area"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="by_default"
              checked={formData.by_default}
              onChange={handleChange}
              id="default"
              className="border border-gray-300 rounded-md focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            />
            <label htmlFor="default" className="text-sm text-gray-700">Set as default address</label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium px-4 py-2 rounded-md transition flex items-center gap-2"
            >
              {editingId ? <Edit className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
              {editingId ? 'Update Address' : 'Add Address'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium px-4 py-2 rounded-md transition flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-600 border-t-transparent"></div>
          <p className="mt-2 text-gray-500">Loading addresses...</p>
        </div>
      ) : (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="text-xl font-semibold text-gray-800">Saved Addresses</h3>
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
                  className={`border rounded-lg p-4 transition-all hover:shadow-md ${addr.by_default ? 'border-amber-300 bg-amber-50' : 'border-gray-200 bg-white'
                    }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <Home className="w-4 h-4 text-amber-600" />
                      <span className="font-medium text-gray-800">{addr.name}</span>
                      

                      {Number(addr.by_default) === 1 && (
                        <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          <Star className="w-3 h-3 fill-amber-500" /> Default
                        </span>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <button onClick={() => handleEdit(addr)} className="text-blue-600 hover:text-blue-800 p-1" title="Edit">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(addr.id)} className="text-red-600 hover:text-red-800 p-1" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm text-gray-600">
                      {addr.email && (
                      <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {addr.email}</p>
                    )}
                    
                    <p className="flex items-center gap-2">
                      <Phone className="w-4 h-4" /> {addr.country_code} {addr.mobile}</p>
                    {addr.alternative_mobile && (
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {addr.alternative_mobile}</p>
                    )}
                    <p className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</span>
                    </p>
                    <p className="flex items-center gap-2"><Globe className="w-4 h-4" /> {addr.country}</p>
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