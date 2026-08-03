// src/components/checkout/CheckoutPopup.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ArrowLeft, X, ChevronDown, ChevronUp } from 'lucide-react';
import logo from '@/assets/logo.png';
import LoginStep from './LoginStep';
import SignupStep from './SignupStep';
import AddressStep from './AddressStep';
import PaymentStep from './PaymentStep';
import { api } from '@/redux/baseApi';

const CheckoutPopup = ({ isOpen, onClose }) => {
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  const { items: cartItems, appliedCoupon, couponDiscount } = useSelector((state) => state.cart);
  const [step, setStep] = useState(() => (!isLoggedIn ? 'login' : 'address'));
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(true);
  const [showCancelPopup, setShowCancelPopup] = useState(false);
  const [codCharge, setCodCharge] = useState(0);
  const [isCodLoading, setIsCodLoading] = useState(false);

  const [apiDeliveryCharge, setApiDeliveryCharge] = useState(null);
  const paymentRef = useRef();

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('online'); // 'online' or 'cod'
  // const COD_SURCHARGE = +import.meta.env.VITE_COD_SURCHARGE;

  // cod charge fetch
  useEffect(() => {
    if (selectedPaymentMethod === 'cod' && selectedAddressId) {
      const fetchCodCharge = async () => {
        setIsCodLoading(true);
        try {
          const { data } = await api.get('/store/cod-charge', {
            address_id: selectedAddressId,
          });
          // console.log("codcharge", data)
          if (data.status) setCodCharge(data.cod_charge);
        } catch (err) {
          console.error('Failed to fetch COD charge', err);
        } finally {
          setIsCodLoading(false);
        }
      };
      fetchCodCharge();
    } else {
      setCodCharge(0);
    }
  }, [selectedPaymentMethod, selectedAddressId]);

  useEffect(() => {
    if (!selectedAddressId) return;

    const fetchDeliveryCharge = async () => {
      try {
        const { data } = await api.post('/store/calculate-summary', {
          address_id: selectedAddressId,
          coupon_code: appliedCoupon?.code || null,
        });
        if (data.status) setApiDeliveryCharge(data.breakdown.delivery_charge);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDeliveryCharge();
  }, [selectedAddressId, appliedCoupon]);

  // Add this after your existing useEffects
useEffect(() => {
  if (!isLoggedIn && step !== 'login' && step !== 'signup') {
    setStep('login');
  } else if (isLoggedIn && step === 'login') {
    setStep('address');
  }
}, [isLoggedIn, step]);

  // const SHIPPING_CHARGES = +import.meta.env.VITE_SHIPING_CHARGES; // "149"
  const MIN_FREE_SHIPPING = +import.meta.env.VITE_MINIMUM_ORDER_FOR_AVOID_SHIPING;

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, i) => sum + (i.price * i.quantity),
    0);

  // console.log(subtotal)
  const shipping = subtotal >= MIN_FREE_SHIPPING ? 0 : apiDeliveryCharge;
  // console.log(MIN_FREE_SHIPPING)
  // console.log(shipping)


  const grandTotal = subtotal + shipping - couponDiscount;
  // For display, add surcharge if COD
  const displayTotal = selectedPaymentMethod === 'cod' ? grandTotal + codCharge : grandTotal;

  const handleBack = () => {
    if (step === 'login') onClose();
    else if (step === 'signup') setStep('login');
    else if (step === 'address') setStep('login');
    else if (step === 'payment') setStep('address');
  };

  const handleLoginSuccess = () => setStep('address');
  const handleSignupSuccess = () => setStep('address');
  const handleAddressSuccess = (addressId) => {
    setSelectedAddressId(addressId);
    setStep('payment');
  };
  const handleOrderComplete = () => onClose();

  let bottomButton = null;
  if (step === 'address') {
    bottomButton = {
      label: 'Continue to Payment',
      disabled: !selectedAddressId,
      onClick: () => setStep('payment'),
    };
  } else if (step === 'payment') {
    bottomButton = {
      label: 'Pay Now',
      disabled: false,
      onClick: () => paymentRef.current?.placeOrder(),
    };
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[480px] h-[90vh] flex flex-col relative overflow-hidden animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white sticky top-0 z-10">
          {/* back button */}
          <button onClick={handleBack} className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer">
            <ArrowLeft size={20} className="text-gray-600 " />
          </button>
          <img src={logo} alt="Astrotring" className="h-8" />
          {/* cross button */}
          <button
            onClick={() => setShowCancelPopup(true)}
            className="p-1.5 hover:bg-gray-100 rounded-full transition-colors duration-200 cursor-pointer"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Collapsible Order Summary */}
        <div className="border-b border-gray-100 bg-white flex-shrink-0">
          <button
            onClick={() => setIsSummaryOpen(!isSummaryOpen)}
            className="w-full flex items-center justify-between px-5 py-3 hover:bg-gray-50 transition-colors duration-200"
          >
            <div className="flex items-center gap-2">
              <span className="font-light text-xs text-gray-800">Order Summary</span>
              {isSummaryOpen ? <ChevronUp size={12} className="text-gray-500" /> : <ChevronDown size={12} className="text-gray-500" />}

              {appliedCoupon && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Coupon</span>}
            </div>
            <span className="text-xs font-bold text-amber-600">₹{displayTotal.toLocaleString()}</span>

          </button>

          {isSummaryOpen && (
            <div className="px-5 pb-4 space-y-4 max-h-50 overflow-y-auto border-t border-gray-100 scrollbar-hide">
              {cartItems.map((item) => (
                <div key={item.item_id} className="flex gap-3 items-center">
                  <img src={item.image} alt={item.name} className="w-14 h-14 object-cover rounded-lg border border-gray-200" />
                  <div className="flex-1">
                    <p className="font-sm text-sm text-gray-800">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                    {item.ratti && <p className="text-xs text-gray-500">Ratti: {item.ratti}</p>}
                    <p className="text-xs text-gray-500 ">Price: ₹{item.price}</p>

                  </div>

                </div>
              ))}
              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toLocaleString()}</span>
                </div>
                {shipping !== null && (
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                )}
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>-₹{couponDiscount.toLocaleString()}</span>
                  </div>
                )}
                {selectedPaymentMethod === 'cod' && (
                  <div className="flex justify-between text-amber-600 text-sm">
                    <span>COD charge</span>
                    <span>{isCodLoading ? '...' : `₹${codCharge}`}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-800 pt-2 border-t">
                  <span>Total</span>
                  <span>₹{displayTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>


        {/* Step Content */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-hide">
          {step === 'login' && <LoginStep onLoginSuccess={handleLoginSuccess} onSignupClick={() => setStep('signup')} />}

          {step === 'signup' && <SignupStep onSignupSuccess={handleSignupSuccess} onBackToLogin={() => setStep('login')} />}

          {step === 'address' && <AddressStep selectedAddressId={selectedAddressId} onSelectAddress={setSelectedAddressId} />}

          {step === 'payment' &&
            <PaymentStep
              ref={paymentRef}
              selectedAddressId={selectedAddressId}
              onOrderComplete={handleOrderComplete}
              deliveryCharge={shipping}
              grandTotal={grandTotal}
              codCharge={codCharge}
              isCodLoading={isCodLoading}
              selectedPaymentMethod={selectedPaymentMethod}
              onPaymentMethodChange={setSelectedPaymentMethod}

            />}
        </div>

        {/* Fixed Bottom Button */}
        {bottomButton && (
          <div className="p-4 border-t border-gray-100 bg-white sticky bottom-0">
            <button
              onClick={bottomButton.onClick}
              disabled={bottomButton.disabled}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-semibold text-base transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bottomButton.label}
            </button>
          </div>
        )}

      </div>

      {/* Cancel Payment Popup */}
      {showCancelPopup && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-4 w-[90%] max-w-sm shadow-2xl animate-fadeIn">

            <p className="text-sm text-gray-900">
              Are you sure you want to cancel the payment process?
            </p>

            <div className="flex gap-10 justify-between">
              {/* YES BUTTON */}
              <div
                onClick={() => {
                  onClose();
                  setShowCancelPopup(false);
                }}
                className="flex-1 text-gray-400 font-semibold text-center cursor-pointer"
              >
                Yes
              </div>
              {/* NO BUTTON */}
              <div
                onClick={() => setShowCancelPopup(false)}
                className="flex-1 text-gray-400 font-semibold text-center cursor-pointer"
              >
                No
              </div>


            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default CheckoutPopup;