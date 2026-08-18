import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ArrowRight, CreditCard, Info, Loader2 } from "lucide-react";

import {
  setPaymentMethod,
  createStandardCodOrder,
  createOnlineOrder,
  verifyOnlinePayment,
  resetPaymentState,
  verifyAdvanceCodPayment,
  createAdvanceCodOrder,
} from "@/redux/slices/paymentSlice";

import { clearCart } from "@/redux/slices/cartSlice";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

import { closeCartDrawer, closeCheckout } from "@/redux/slices/uiSlice";

import {
  calculateDeliveryCharge,
  calculateCodCharge,
  clearDeliveryCharge,
} from "@/redux/slices/extraCheckoutChargeSlice";

// ========================================
// STRIPE
// ========================================

import { loadStripe } from "@stripe/stripe-js";

import {
  Elements,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

const stripePromise = STRIPE_PUBLISHABLE_KEY
  ? loadStripe(STRIPE_PUBLISHABLE_KEY)
  : null;

// ========================================
// STRIPE PAYMENT FORM
// ========================================

const StripePaymentForm = ({ onSuccess, onCancel, onReady }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      setErrorMessage("Payment system is still loading. Please wait.");
      return;
    }

    if (processing) {
      return;
    }

    setProcessing(true);
    setErrorMessage("");

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: "if_required",
      });

      if (error) {
        console.error("Stripe payment error:", error);

        setErrorMessage(error.message || "Payment failed. Please try again.");

        return;
      }

      if (!paymentIntent) {
        setErrorMessage("Payment response was not received.");

        return;
      }

      // Payment completed successfully
      if (paymentIntent.status === "succeeded") {
        await onSuccess(paymentIntent);
        return;
      }

      // Payment is still processing
      if (paymentIntent.status === "processing") {
        setErrorMessage("Your payment is still processing. Please wait.");
        return;
      }

      // Other Stripe status
      setErrorMessage(
        `Payment was not completed. Current status: ${paymentIntent.status}`,
      );
    } catch (error) {
      console.error("Stripe confirmation error:", error);

      setErrorMessage(error?.message || "Unable to process payment.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Stripe Payment Element */}
      <div className="bg-white rounded-xl">
        <PaymentElement
          onReady={() => {
            onReady?.();
          }}
          onLoadError={(event) => {
            console.error("Stripe PaymentElement load error:", event);
            setErrorMessage(
              event?.error?.message ||
                "Unable to load the payment form. Please try again."
            );
          }}
        />
      </div>

      {/* Stripe Error */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100">
          <p className="text-xs font-semibold text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          disabled={processing}
          className="flex-1 px-4 py-3 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-all cursor-pointer"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={!stripe || !elements || processing}
          className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg disabled:bg-gray-200 disabled:text-gray-500 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          {processing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Processing...
            </>
          ) : (
            "Pay Now"
          )}
        </button>
      </div>
    </form>
  );
};

// ========================================
// PAYMENT SECTION
// ========================================

const PaymentSection = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [codAvailable, setCodAvailable] = useState(true);

  // Stripe states
  const [stripeClientSecret, setStripeClientSecret] = useState("");

  const [stripePaymentIntentId, setStripePaymentIntentId] = useState("");

  const [stripeLoading, setStripeLoading] = useState(false);

  const [stripeElementReady, setStripeElementReady] = useState(false);

  // ========================================
  // REDUX STATES
  // ========================================

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

  // ========================================
  // PINCODE CHECK
  // ========================================

  const isPincodeBlocked = (pincode) => {
    const pin = parseInt(pincode, 10);

    if (isNaN(pin)) {
      return false;
    }

    return (pin >= 800001 && pin <= 855117) || (pin >= 180001 && pin <= 194402);
  };

  // ========================================
  // COD AVAILABILITY
  // ========================================

  useEffect(() => {
    if (selectedAddress?.pincode) {
      const blocked = isPincodeBlocked(selectedAddress.pincode);

      setCodAvailable(!blocked);
    } else {
      setCodAvailable(true);
    }
  }, [selectedAddress]);

  // ========================================
  // CART / COUPON / CHARGE BREAKDOWN
  // ========================================

  const cartTotal = items.reduce(
    (sum, item) => sum + Number(item?.price || 0) * Number(item?.quantity || 0),
    0,
  );

  // Keep the value coming from Redux untouched.
  // For percentage coupons, convert the percentage into an amount.
  // For flat coupons, the Redux value is already the discount amount.
  const rawCouponDiscount = Number(couponDiscount || 0);

  const couponDiscountAmount =
    appliedCoupon?.discount_type === "percentage"
      ? (cartTotal * rawCouponDiscount) / 100
      : rawCouponDiscount;

  const safeDeliveryCharge = Number(deliveryCharge || 0);
  const safeCodCharge =
    selectedPaymentMethod === "cod" ? Number(codCharge || 0) : 0;

  // Product/cart subtotal
  // - coupon discount
  // + delivery charge
  // + COD handling charge (COD only)
  const subtotalAfterCoupon = Math.max(cartTotal - couponDiscountAmount, 0);

  const finalPayableAmount =
    subtotalAfterCoupon + safeDeliveryCharge + safeCodCharge;

  // ========================================
  // CLEAR DELIVERY CHARGE
  // ========================================

  useEffect(() => {
    if (!selectedAddressId || !isLoggedIn) {
      dispatch(clearDeliveryCharge());
    }
  }, [selectedAddressId, isLoggedIn, dispatch]);

  // ========================================
  // DELIVERY CHARGE
  // ========================================

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

  // ========================================
  // AUTO RESET COD
  // ========================================

  useEffect(() => {
    const isCodAllowed =
      codAvailable && appliedCoupon?.payment_type !== "prepaid";

    if (selectedPaymentMethod === "cod" && !isCodAllowed) {
      dispatch(setPaymentMethod("online"));

      toast.info("COD is not available with this coupon");
    }
  }, [codAvailable, appliedCoupon, selectedPaymentMethod, dispatch]);

  // ========================================
  // COD CHARGE
  // ========================================

  useEffect(() => {
    if (items.length > 0 && selectedPaymentMethod === "cod") {
      dispatch(
        calculateCodCharge({
          address_id: selectedAddressId,
        }),
      );
    }
  }, [
    isLoggedIn,
    items.length,
    dispatch,
    selectedPaymentMethod,
    selectedAddressId,
  ]);

  // ========================================
  // RESET STRIPE WHEN PAYMENT METHOD CHANGES
  // ========================================

  useEffect(() => {
    if (selectedPaymentMethod !== "online") {
      setStripeElementReady(false);
      setStripeClientSecret("");
      setStripePaymentIntentId("");
      setStripeLoading(false);
    }
  }, [selectedPaymentMethod]);

  // ========================================
  // CHECKOUT PROCESS
  // ========================================

  const handleCheckoutProcess = async () => {
    // ----------------------------------------
    // LOGIN CHECK
    // ----------------------------------------

    if (!isLoggedIn) {
      toast.error("Please log in!");
      return;
    }

    // ----------------------------------------
    // CART CHECK
    // ----------------------------------------

    if (!items || items.length === 0) {
      toast.error("Your shopping cart is empty.");
      return;
    }

    // ----------------------------------------
    // ADDRESS CHECK
    // ----------------------------------------

    if (!selectedAddressId) {
      toast.error("Please select or add a delivery address.");
      return;
    }

    // ========================================
    // COD
    // ========================================

    if (selectedPaymentMethod === "cod") {
      try {
        const data = await dispatch(
          createStandardCodOrder({
            amount: finalPayableAmount,

            coupon_code: appliedCoupon?.code || appliedCoupon || null,

            wallet_amount: 0,

            address_id: selectedAddressId,
          }),
        ).unwrap();

        if (data.status || data.success) {
          toast.success(data?.message || "Order placed successfully!");

          dispatch(closeCartDrawer());
          dispatch(clearCart());
          dispatch(closeCheckout());

          navigate("/order-success", {
            state: {
              orderData: data.data.order_id,
            },
          });
        } else {
          toast.error(data.message || "COD order failed");
        }
      } catch (err) {
        console.error("COD order error:", err);

        toast.error(
          err?.message ||
            err ||
            "An error occurred while placing your COD order. Please try again.",
        );
      }

      return;
    }

    // ========================================
    // ADVANCE COD
    // ========================================
    // Existing pathway retained.
    // It is not available in the current
    // payment-method UI.

    if (selectedPaymentMethod === "codddd") {
      toast.error("Advance COD payment is currently unavailable.");

      return;
    }

    // ========================================
    // STRIPE ONLINE PAYMENT
    // ========================================

    if (selectedPaymentMethod === "online") {
      if (!stripePromise) {
        toast.error("Stripe payment gateway is not configured.");

        return;
      }

      if (!STRIPE_PUBLISHABLE_KEY) {
        toast.error("Stripe publishable key is missing.");

        return;
      }

      try {
        setStripeLoading(true);
        setStripeElementReady(false);
        setStripeClientSecret("");
        setStripePaymentIntentId("");

        // ------------------------------------
        // CREATE STRIPE PAYMENT INTENT
        // ------------------------------------

        const orderData = await dispatch(
          createOnlineOrder({
            coupon_code: appliedCoupon?.code || appliedCoupon || null,

            address_id: selectedAddressId,

            wallet_amount: 0,
          }),
        ).unwrap();

        console.log("Stripe create order response:", orderData);

        // ------------------------------------
        // BACKEND ERROR
        // ------------------------------------

        if (!orderData?.status) {
          toast.error(orderData?.message || "Failed to create payment.");

          return;
        }

        // ------------------------------------
        // WALLET ONLY
        // ------------------------------------

        if (orderData.payment_mode === "wallet_only") {
          toast.error("Wallet-only payment should be processed separately.");

          return;
        }

        // ------------------------------------
        // CLIENT SECRET CHECK
        // ------------------------------------

        if (!orderData.client_secret) {
          console.error("Stripe client_secret missing:", orderData);

          toast.error(
            "Stripe payment information was not received from server.",
          );

          return;
        }

        // ------------------------------------
        // PAYMENT INTENT ID
        // ------------------------------------

        const paymentIntentId =
          orderData.payment_intent_id || orderData.order_id;

        if (!paymentIntentId) {
          toast.error("Stripe payment ID was not received.");

          return;
        }

        // ------------------------------------
        // SAVE STRIPE DATA
        // ------------------------------------

        setStripeElementReady(false);
        setStripeClientSecret(orderData.client_secret);
        setStripePaymentIntentId(paymentIntentId);

        toast.success("Secure payment form is ready.");
      } catch (err) {
        console.error("Stripe initialization error:", err);

        toast.error(err?.message || err || "Could not initiate payment.");
      } finally {
        setStripeLoading(false);
      }

      return;
    }
  };

  // ========================================
  // STRIPE PAYMENT SUCCESS
  // ========================================

  const handleStripePaymentSuccess = async (paymentIntent) => {
    try {
      setStripeLoading(true);

      const paymentIntentId = paymentIntent?.id || stripePaymentIntentId;

      if (!paymentIntentId) {
        toast.error("Stripe payment ID not found.");

        return;
      }

      console.log("Stripe PaymentIntent:", paymentIntent);

      // ------------------------------------
      // VERIFY PAYMENT WITH BACKEND
      // ------------------------------------

      const verifyPayload = {
        payment_intent_id: paymentIntentId,

        coupon_code: appliedCoupon?.code || appliedCoupon || null,

        coupon_discount: couponDiscountAmount,

        delivery_charge: safeDeliveryCharge,

        address_id: selectedAddressId,

        wallet_amount: 0,
      };

      console.log("Stripe verify payload:", verifyPayload);

      const verifyRes = await dispatch(
        verifyOnlinePayment(verifyPayload),
      ).unwrap();

      console.log("Stripe verification response:", verifyRes);

      // ------------------------------------
      // CHECK RESPONSE
      // ------------------------------------

      if (!verifyRes?.status) {
        toast.error(verifyRes?.message || "Payment verification failed.");

        return;
      }

      // ------------------------------------
      // SUCCESS
      // ------------------------------------

      toast.success(verifyRes?.message || "Payment successful!");

      // ------------------------------------
      // CLEAR CART
      // ------------------------------------

      dispatch(clearCart());

      // ------------------------------------
      // RESET PAYMENT STATE
      // ------------------------------------

      dispatch(resetPaymentState());

      // ------------------------------------
      // CLOSE CHECKOUT
      // ------------------------------------

      dispatch(closeCartDrawer());
      dispatch(closeCheckout());

      // ------------------------------------
      // CLEAR STRIPE STATE
      // ------------------------------------

      setStripeElementReady(false);
      setStripeClientSecret("");
      setStripePaymentIntentId("");

      // ------------------------------------
      // ORDER ID
      // ------------------------------------

      const orderId =
        verifyRes?.order?.order_id ||
        verifyRes?.data?.order?.order_id ||
        verifyRes?.order_id ||
        verifyRes?.data?.order_id;

      // ------------------------------------
      // GO TO SUCCESS PAGE
      // ------------------------------------

      navigate("/order-success", {
        state: {
          orderData: orderId,
        },
      });
    } catch (err) {
      console.error("Stripe verification error:", err);

      toast.error(err?.message || err || "Payment verification failed.");
    } finally {
      setStripeLoading(false);
    }
  };

  // ========================================
  // CANCEL STRIPE PAYMENT
  // ========================================

  const handleStripeCancel = () => {
    setStripeElementReady(false);
    setStripeClientSecret("");
    setStripePaymentIntentId("");
    setStripeLoading(false);

    toast.info("Payment cancelled.");
  };

  // ========================================
  // STRIPE ELEMENT OPTIONS
  // ========================================

  const stripeOptions = useMemo(() => {
    if (!stripeClientSecret) {
      return undefined;
    }

    return {
      clientSecret: stripeClientSecret,
      appearance: {
        theme: "stripe",
        variables: {
          colorPrimary: "#f59e0b",
          colorBackground: "#ffffff",
          colorText: "#111827",
          colorDanger: "#dc2626",
          borderRadius: "10px",
          fontFamily: "Inter, system-ui, sans-serif",
        },
      },
    };
  }, [stripeClientSecret]);

  // ========================================
  // RENDER
  // ========================================

  return (
    <>
      {/* ========================================
          GLOBAL LOADER
      ======================================== */}

      {(globalPaymentLoading || stripeLoading) && (
        <div className="fixed inset-0 bg-white/20 backdrop-blur-sm flex flex-col items-center justify-center z-[9999] h-screen">
          <Loader2 className="w-12 h-12 animate-spin text-amber-500" />

          <p className="mt-4 text-sm font-medium text-gray-700">
            Please do not refresh the page
          </p>

          <p className="text-xs text-gray-500">
            {stripeLoading
              ? "Preparing secure payment..."
              : "We are processing your order..."}
          </p>
        </div>
      )}

      <div className="w-full bg-white border border-gray-100 rounded-xl p-4 sm:p-5 shadow-sm space-y-5 text-left">
        {/* ========================================
            HEADER
        ======================================== */}

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

        {/* ========================================
            PAYMENT OPTIONS
        ======================================== */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* ======================================
              STRIPE ONLINE
          ====================================== */}

          <label
            className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all ${
              selectedPaymentMethod === "online"
                ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <input
              type="radio"
              name="payment_type"
              checked={selectedPaymentMethod === "online"}
              onChange={() => {
                dispatch(setPaymentMethod("online"));

                setStripeElementReady(false);
                setStripeClientSecret("");
                setStripePaymentIntentId("");
              }}
              className="h-4 w-4 text-amber-500 accent-amber-600 focus:ring-amber-500 border-gray-300 cursor-pointer"
            />

            <div className="text-left">
              <p className="text-xs font-extrabold text-gray-800">
                Online Payment
              </p>

              <p className="text-[10px] text-gray-400 font-medium">
                Secure payment with Stripe
              </p>
            </div>
          </label>

          {/* ======================================
              COD
          ====================================== */}

          {appliedCoupon?.payment_type !== "prepaid" && (
            <label
              className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition-all
                ${!codAvailable ? "opacity-50 cursor-not-allowed" : ""}
                ${
                  selectedPaymentMethod === "cod" && codAvailable
                    ? "border-amber-500 bg-amber-500/5 ring-1 ring-amber-500"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}
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
                  className={`text-[10px] font-medium ${
                    !codAvailable ? "text-red-700" : "text-gray-400"
                  }`}
                >
                  {!codAvailable
                    ? "COD not available for this pincode"
                    : "A non-refundable COD charge is required."}
                </p>
              </div>
            </label>
          )}
        </div>

        {/* ========================================
            BILLING BOX
        ======================================== */}

        <div className="p-4 bg-gray-50/50 rounded-xl border border-gray-200/60 text-xs space-y-2.5">
          {/* SUBTOTAL */}

          <div className="flex justify-between items-center text-gray-600 px-1 sm:px-4">
            <span>Subtotal</span>
            <span className="font-semibold text-gray-800">
              $
              {cartTotal.toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* COUPON */}

          {appliedCoupon && couponDiscountAmount > 0 && (
            <div className="flex justify-between items-center text-green-600 px-1 sm:px-4">
              <span className="flex items-center gap-1">
                Coupon Discount
                {appliedCoupon?.code && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-green-100">
                    {appliedCoupon.code}
                  </span>
                )}
              </span>

              <span className="font-semibold">
                - $
                {couponDiscountAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          )}

          {/* DELIVERY CHARGE */}

          <div className="flex justify-between items-center text-gray-600 px-1 sm:px-4">
            <span>Delivery Charge</span>

            <span
              className={
                safeDeliveryCharge > 0
                  ? "font-semibold text-gray-800"
                  : "font-semibold text-green-600"
              }
            >
              {safeDeliveryCharge > 0
                ? `+ $${safeDeliveryCharge.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "FREE"}
            </span>
          </div>

          {/* COD CHARGE */}

          {selectedPaymentMethod === "cod" && (
            <div className="flex justify-between items-center text-gray-600 px-1 sm:px-4">
              <span className="flex items-center gap-1">
                COD Handling Surcharge
                <Info
                  size={12}
                  className="text-gray-400"
                  title="Processing fee added for manual cash courier collections."
                />
              </span>

              <span className="font-semibold text-gray-800">
                {safeCodCharge > 0
                  ? `+ $${safeCodCharge.toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}`
                  : "FREE"}
              </span>
            </div>
          )}

          {/* SEPARATOR */}

          <div className="border-t border-gray-200 my-2" />

          {/* PAYABLE */}

          <div className="flex justify-between items-center text-sm font-bold text-gray-900 px-1 sm:px-4">
            <span>Payable Amount:</span>

            <span className="text-amber-500 text-base tracking-wide">
              $
              {Number(finalPayableAmount || 0).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* ========================================
              STRIPE PAYMENT ELEMENT
          ======================================== */}

          {selectedPaymentMethod === "online" &&
            stripeClientSecret &&
            stripePromise && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-xl">
                <div className="mb-4">
                  <h4 className="text-sm font-bold text-gray-900">
                    Secure Payment
                  </h4>

                  <p className="text-[11px] text-gray-500 mt-1">
                    Enter your payment details securely using Stripe.
                  </p>
                </div>

                <Elements
                  key={stripeClientSecret}
                  stripe={stripePromise}
                  options={stripeOptions}
                >
                  <StripePaymentForm
                    onSuccess={handleStripePaymentSuccess}
                    onCancel={handleStripeCancel}
                    onReady={() => setStripeElementReady(true)}
                  />
                </Elements>
              </div>
            )}

          {/* ========================================
              MAIN CHECKOUT BUTTON
          ======================================== */}

          {!(selectedPaymentMethod === "online" && stripeClientSecret) && (
            <button
              onClick={handleCheckoutProcess}
              disabled={
                globalPaymentLoading ||
                stripeLoading ||
                isDeliveryLoading ||
                isCodLoading
              }
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-100 disabled:text-gray-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-md transition-all shadow-sm flex items-center justify-center gap-2 transform active:scale-[0.99] cursor-pointer"
            >
              {globalPaymentLoading || stripeLoading ? (
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
          )}
        </div>
      </div>
    </>
  );
};

export default PaymentSection;
