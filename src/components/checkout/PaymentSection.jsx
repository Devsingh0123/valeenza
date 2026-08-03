// src/components/checkout/PaymentSection.jsx
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ArrowRight, CreditCard, Info, Loader2 } from "lucide-react";

// Importing the verified production thunks and sync actions
import {
  setPaymentMethod,
  createStandardCodOrder,
  createOnlineOrder,
  verifyOnlinePayment,
  resetPaymentState,
  verifyAdvanceCodPayment,
  createAdvanceCodOrder,
} from "@/redux/slices/paymentSlice";

// Explicit fallback to make sure clearCart action works from your cart architecture
import { clearCart } from "@/redux/slices/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { closeCartDrawer, closeCheckout } from "@/redux/slices/uiSlice";
import {
  calculateDeliveryCharge,
  calculateCodCharge,
  clearDeliveryCharge,
} from "@/redux/slices/extraCheckoutChargeSlice";

const RAZORPAY_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID;

/**
 * PaymentSection Component
 * Manages order processing paths for both Cash on Delivery (COD)
 * and online payments using the integrated payment slice engine.
 */
const PaymentSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [codAvailable, setCodAvailable] = useState(true);

  // Mapped global states from user auth, cart, and payment slice
  const { isLoggedIn, user } = useSelector((state) => state.userAuth);
  const { items } = useSelector((state) => state.cart);
  let { appliedCoupon, couponDiscount } = useSelector((state) => state.coupon);
  const { selectedAddressId, selectedAddress } = useSelector(
    (state) => state.address,
  );
  const { deliveryCharge, codCharge, isDeliveryLoading, isCodLoading } =
    useSelector((state) => state.extraCheckoutCharge);
  const { selectedPaymentMethod, loading: globalPaymentLoading } = useSelector(
    (state) => state.payment,
  );

  // console.log(appliedCoupon)

  // Helper: Check if pincode falls in blocked ranges
  const isPincodeBlocked = (pincode) => {
    const pin = parseInt(pincode, 10);
    if (isNaN(pin)) return false;
    return (pin >= 800001 && pin <= 855117) || (pin >= 180001 && pin <= 194402);
  };

  // console.log("selectedAddress", selectedAddress)

  useEffect(() => {
    if (selectedAddress?.pincode) {
      const isBlocked = isPincodeBlocked(selectedAddress.pincode);
      setCodAvailable(!isBlocked);
    } else {
      setCodAvailable(true);
    }
  }, [selectedAddress]);

  const cartTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  if (appliedCoupon?.discount_type == "percentage") {
    couponDiscount = (cartTotal * couponDiscount) / 100;
  } else if (appliedCoupon?.discount_type === "flat") {
    couponDiscount = couponDiscount;
  }
  const finalPayableAmount =
    selectedPaymentMethod === "cod"
      ? cartTotal + deliveryCharge + codCharge - couponDiscount
      : cartTotal + deliveryCharge - couponDiscount; // no cod charge in prepaid order

  // console.log(selectedAddressId);
  // PaymentSection.jsx

  useEffect(() => {
    if (!selectedAddressId || !isLoggedIn) {
      dispatch(clearDeliveryCharge());
    }
  }, [selectedAddressId, dispatch]);

  //  Delivery Charge – when Address and Cart both avilable
  useEffect(() => {
    if (isLoggedIn && selectedAddressId && items.length > 0) {
      dispatch(
        calculateDeliveryCharge({
          address_id: selectedAddressId,
          coupon_code: appliedCoupon?.code,
        }),
      );
    }
  }, [
    isLoggedIn,
    selectedAddressId,
    items.length,
    dispatch,
    appliedCoupon?.code,
  ]);

  // NEW: Auto-reset payment method
useEffect(() => {
  const isCodAvailable = codAvailable && appliedCoupon?.payment_type !== "prepaid";
  
  if (selectedPaymentMethod === "cod" && !isCodAvailable) {
    dispatch(setPaymentMethod("online"));
    toast.info("COD is not available with this coupon");
  }
}, [codAvailable, appliedCoupon, selectedPaymentMethod, dispatch]);

  //  COD Charge – when COD Selected , Address , Cart avilable
  useEffect(() => {
    if (items.length > 0 && selectedPaymentMethod === "cod") {
      dispatch(calculateCodCharge({ address_id: selectedAddressId }));
    }
  }, [isLoggedIn, items.length, dispatch, selectedPaymentMethod]);

  // Fallback to safety if address selection hasn't pre-populated grandTotal yet
  // const rawTotal = grandTotal || 0;
  // const finalPayableAmount =
  //   selectedPaymentMethod === "cod" ? rawTotal + codCharge : rawTotal;

  /**
   * Evaluates operational checks and routes order processing to matching transactional handlers
   */
  const handleCheckoutProcess = async () => {
    // 1. Edge-case form protection rules
    if (!isLoggedIn) {
      toast.error("Please log in!");
      return;
    }
    if (!items || items.length === 0) {
      toast.error("Your shopping cart is empty.");
      return;
    }
    if (!selectedAddressId) {
      toast.error("Please select or add a delivery address.");
      return;
    }

    /* --- PATHWAY A: CASH ON DELIVERY ORDER GENERATION --- */
    if (selectedPaymentMethod === "cod") {
      try {
        const data = await dispatch(
          createStandardCodOrder({
            amount: finalPayableAmount,
            coupon_code: appliedCoupon?.code || appliedCoupon || null,
            delivery_charge: deliveryCharge || 0,
            wallet_amount: 0, // Defaulted to zero for standard forms
            address_id: selectedAddressId,
          }),
        ).unwrap();

        // console.log(data);

        if (data.status || data.success) {
          toast.success(data?.message || "Order placed successfully!");
          dispatch(closeCartDrawer());
          dispatch(clearCart());
          dispatch(closeCheckout());

          navigate("/order-success", {
            state: { orderData: data.data.order_id },
          });
        } else {
          // console.log("erreodata", data);
          toast.error(data.message || "COD order failed");
        }
      } catch (err) {
        toast.error(
          err ||
            "An error occurred while placing your COD order. Please try again.",
        );
      }
      return;
    }
  /* --- PATHWAY B: CASH ON DELIVERY ORDER GENERATION WITH SOME ADVANCE--- (not in use right now)*/
    if (selectedPaymentMethod === "codddd") {
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway not loaded. Refresh and try again.");
        return;
      }

      try {
        // Step 1: Create advance COD order
        const advanceData = await dispatch(
          createAdvanceCodOrder({
            address_id: selectedAddressId,
            coupon_code: appliedCoupon?.code || null,
            // delivery_charge, amount etc. are not sent; backend calculates advance
          }),
        ).unwrap();
console.log("advance cod",advanceData)
        if (!advanceData.razorpay_order_id) {
          toast.error(advanceData.message || "Failed to create advance order.");
          return;
        }

        const { razorpay_order_id, pricing } = advanceData;
        const advanceAmount = parseFloat(pricing?.advance_amount || 0);

        if (advanceAmount <= 0) {
          toast.error("Advance amount is invalid.");
          return;
        }

        // Step 2: Open Razorpay for advance payment
        const options = {
          key: RAZORPAY_KEY,
          amount: Math.round(advanceAmount * 100),
          currency: "INR",
          name: "Astrotring Store",
          description: "Advance payment for COD order",
          order_id: razorpay_order_id,
          prefill: {
            name: user?.name || "Customer",
            contact: user?.mobile || "",
            email: user?.email || "",
          },
          theme: { color: "#f59e0b" },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled.");
            },
          },
          handler: async (response) => {
            try {
              // Step 3: Verify advance payment
             const verifyAdvCod= await dispatch(
                verifyAdvanceCodPayment({
                  address_id: selectedAddressId,
                  coupon_code: appliedCoupon?.code || null,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              ).unwrap();
console.log('verifyAdvCod',verifyAdvCod)
              toast.success("Advance payment successful!");
              dispatch(clearCart());
              dispatch(resetPaymentState());
              dispatch(closeCartDrawer());
              dispatch(closeCheckout());

              navigate("/order-success", {
                state: {
                  orderData: verifyAdvCod.order_id || verifyAdvCod.data?.order_id || verifyAdvCod.data?.items?.order_id
                },
              });
            } catch (err) {
              toast.error(err?.message || "Payment verification failed.");
            }
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", (response) => {
          console.error("Advance payment failed:", response.error);
          toast.error(response.error?.description || "Advance payment failed.");
        });
        razorpay.open();
      } catch (err) {
        toast.error(err?.message || "Failed to initiate advance payment.");
      }
      return;
    }

    /* --- PATHWAY C: online or prepaid ORDER GENERATION --- */
    if (selectedPaymentMethod === "online") {
      if (typeof window.Razorpay === "undefined") {
        toast.error("Payment gateway not loaded. Refresh and try again.");
        return;
      }

      try {
        const orderData = await dispatch(
          createOnlineOrder({
            amount: finalPayableAmount,
            coupon_code: appliedCoupon?.code || appliedCoupon || null,
            delivery_charge: deliveryCharge || 0,
            wallet_amount: 0,
            address_id: selectedAddressId,
          }),
        ).unwrap();

        if (!orderData.order_id) {
          toast.error(orderData.message || "Failed to create order.");
          return;
        }

        const options = {
          key: RAZORPAY_KEY,
          amount: orderData.amount || Math.round(finalPayableAmount * 100),
          currency: orderData.currency || "INR",
          name: "Astrotring Store",
          description: appliedCoupon ? "Coupon Applied" : "Order Payment",
          order_id: orderData.order_id,
          prefill: {
            name: user?.name || "Customer",
            contact: user?.mobile, // 👈 यहाँ mobile prefill
            email: user?.email || "customer@example.com",
          },
          theme: { color: "#f59e0b" },
          modal: {
            ondismiss: () => {
              toast.info("Payment cancelled.");
            },
          },
          handler: async (response) => {
            // console.log("Payment success. Response:", response);
            try {
              const payload = {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                coupon_code: appliedCoupon?.code || appliedCoupon || null,
                delivery_charge: deliveryCharge || 0,
                address_id: selectedAddressId,
                wallet_amount: 0,
                amount: finalPayableAmount,
              };
              // console.log(" Verifying payment...", payload);
              const verifyRes = await dispatch(
                verifyOnlinePayment(payload),
              ).unwrap();
              // console.log(" Verification response:", verifyRes);

              if (verifyRes.status || verifyRes.data.status) {
                toast.success(" Payment successful!");
                dispatch(clearCart());
                dispatch(resetPaymentState());
                dispatch(closeCartDrawer());
                dispatch(closeCheckout());
                navigate("/order-success", {
                  state: {
                    orderData:
                      verifyRes?.order?.order_id ||
                      verifyRes.data?.order?.order_id,
                  },
                });
              } else {
                toast.error(verifyRes.message || "Verification failed.");
              }
            } catch (err) {
              // console.error(" Verification error:", err);
              toast.error(err?.message || "Verification error.");
            }
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.on("payment.failed", (response) => {
          console.error(" Payment failed:", response.error);
          toast.error(response.error?.description || "Payment failed.");
        });
        razorpay.open();
      } catch (err) {
        console.error(" Online payment error:", err);
        toast.error(err || "Could not initiate payment.");
      }
      return;
    }
  };

  return (
    <>
      {/* Global loader overlay */}
      {globalPaymentLoading && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex flex-col items-center justify-center z-50  h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
          <p className="mt-4 text-sm font-medium text-gray-700">
            Please do not refresh the page
          </p>
          <p className="text-xs text-gray-500">
            We are processing your order...
          </p>
        </div>
      )}
      <div className="w-full bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-5 text-left">
        {/* Module Navigation Branding Headers */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 text-amber-500 rounded-lg shrink-0">
            <CreditCard size={20} />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-gray-900 tracking-tight">
              Payment Method
            </h3>
            <p className="text-xs text-gray-500 font-medium">
              Select a secure payment option to finalize your purchase
            </p>
          </div>
        </div>

        {/* Online Options vs COD Form Grid Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Pathway 1: Online Channels */}
          <label
            className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${selectedPaymentMethod === "online" ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500" : "border-gray-200 bg-white hover:border-gray-300"}`}
          >
            <input
              type="radio"
              name="payment_type"
              checked={selectedPaymentMethod === "online"}
              onChange={() => dispatch(setPaymentMethod("online"))}
              className="h-4 w-4 text-amber-500 accent-amber-600 focus:ring-amber-500 border-gray-300 cursor-pointer"
            />
            <div className="text-left">
              <p className="text-xs font-extrabold text-gray-800">
                Online Payment
              </p>
              <p className="text-[10px] text-gray-400 font-medium">
                Cards, UPI, NetBanking, Wallets
              </p>
            </div>
          </label>

          {/* Pathway 2: Cash on Delivery Channel */}
          {appliedCoupon?.payment_type !== "prepaid" && (
            <label
              className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all 
      ${!codAvailable ? "opacity-50 cursor-not-allowed" : ""}
      ${selectedPaymentMethod === "cod" && codAvailable ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500" : "border-gray-200 bg-white hover:border-gray-300"}`}
            >
              <input
                type="radio"
                name="payment_type"
                checked={selectedPaymentMethod === "cod"}
                onChange={() =>
                  codAvailable && dispatch(setPaymentMethod("cod"))
                }
                disabled={!codAvailable}
                className="h-4 w-4 flex-shrink-0 text-amber-500 accent-amber-600 focus:ring-amber-500 border-gray-300 cursor-pointer"
              />
              <div className="text-left">
                <p className="text-xs font-extrabold text-gray-800">
                  Cash on Delivery
                </p>
                <p
                className={`text-[10px] font-medium ${!codAvailable ? "text-red-700" : "text-gray-400"}`}
              >
                {!codAvailable
                  ? " COD not available for this pincode"
                  : "A non‑refundable COD charge of Rs.75 is required."}
              </p>
              </div>
            </label>
          )}
        </div>

        {/* Structured Billing Calculation Display Box */}
        <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/60 text-xs space-y-1.5">
          {/* {selectedPaymentMethod === "cod" && (
          <div className="flex justify-between items-center text-gray-500 text-[11px] font-medium transition-all">
            <span className="flex items-center gap-1">
              COD Handling Surcharge
              <Info
                size={12}
                className="text-gray-400"
                title="Processing fee added for manual cash courier collections."
              />
            </span>
            <span>+ ₹{codCharge}</span>
          </div>
        )} */}
          <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-0.5 px-4 ">
            <span>Payable Amount:</span>
            <span className="text-amber-500 text-base tracking-wide">
              ₹
              {finalPayableAmount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Primary Conversion Submission CTA Anchor */}
          <button
            onClick={handleCheckoutProcess}
            disabled={globalPaymentLoading || isDeliveryLoading || isCodLoading}
            className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-md transition-all shadow-sm flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
          >
            {globalPaymentLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                <span className="animate-pulse normal-case tracking-normal font-bold text-gray-400">
                  Processing Transaction...
                </span>
              </>
            ) : (
              <>
                <span>
                  {selectedPaymentMethod === "online"
                    ? "Proceed to Payment"
                    : "Confirm Order Placement"}
                </span>
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default PaymentSection;
