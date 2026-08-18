import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import {
  fetchOrderDetails,
  clearOrderError,
  clearCurrentOrder,
  cancelOrder,
  cancelCodOrder,
} from "../redux/slices/orderSlice";

import { api } from "@/redux/baseApi";

import { toast } from "react-toastify";
import Loader from "@/components/common/Loader";

import {
  ArrowLeft,
  Calendar,
  Package,
  MapPin,
  CreditCard,
  XCircle,
  CheckCircle,
  Download,
} from "lucide-react";

const MyOrderDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentOrder, loading, error } = useSelector((state) => state.order);

  const { isLoggedIn } = useSelector((state) => state.userAuth);

  const [cancelling, setCancelling] = useState(false);

  const [downloadInvoiceLoading, setDownloadInvoiceLoading] = useState(false);

  const [showCancelReason, setShowCancelReason] = useState(false);

  const [selectedCancelReasons, setSelectedCancelReasons] = useState([]);

  const [otherReason, setOtherReason] = useState("");

  // ==========================================
  // DOWNLOAD INVOICE
  // Backend API:
  // GET /api/user/orders/{order_id}/invoice
  // ==========================================

  const handleDownloadInvoice = async () => {
    if (!id) {
      toast.error("Order ID not found.");
      return;
    }

    setDownloadInvoiceLoading(true);

    try {
      // Backend generates/returns the invoice URL.
      // Response example:
      // {
      //   status: true,
      //   pdf_url: "https://backend.valeenza.co/storage/invoices/invoice_414.pdf"
      // }
      const response = await api.get(`/user/orders/${id}/invoice`);

      const { status, pdf_url, message } = response?.data || {};

      if (!status || !pdf_url) {
        throw new Error(
          message || "Invoice PDF URL was not returned by the server.",
        );
      }

      // Open the actual backend-generated PDF.
      window.open(pdf_url, "_blank", "noopener,noreferrer");

      toast.success("Invoice opened successfully.");
    } catch (error) {
      console.error("Invoice API error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to open invoice.",
      );
    } finally {
      setDownloadInvoiceLoading(false);
    }
  };

  // ==========================================
  // FETCH ORDER DETAILS
  // ==========================================

  useEffect(() => {
    if (isLoggedIn && id) {
      dispatch(fetchOrderDetails(id));
    }

    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, id, isLoggedIn]);

  // ==========================================
  // ERROR HANDLING
  // ==========================================

  useEffect(() => {
    if (error && !cancelling) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch, cancelling]);

  // ==========================================
  // LOGIN CHECK
  // ==========================================

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view order details.</p>
      </div>
    );
  }

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return <Loader data="Loading order details..." />;
  }

  // ==========================================
  // ORDER NOT FOUND
  // ==========================================

  if (!currentOrder) {
    return <p className="text-center py-10">Order not found.</p>;
  }

  const order = currentOrder;

  // ==========================================
  // ORDER CALCULATIONS
  // ==========================================

  const subtotal =
    order.subtotal ||
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) ||
    0;

  const shipping = order?.pricing?.delivery_charge || 0;

  const discount = order?.pricing?.discount || 0;

  const total = order?.pricing?.total_amount || subtotal + shipping - discount;

  const isCancelled = order.status === "cancelled";

  const canCancel = !isCancelled && order.status !== "delivered";

  const isCod = order?.payment?.mode === "cod";

  const COD_SURCHARGE = Number(order?.pricing?.cod_charge || 0);

  const advancePaid = Number(order?.pricing?.advance_paid_amount || 0);

  const remainingCod = Number(order?.pricing?.remaining_cod_amount || 0);

  const grandTotal = Number(order?.pricing?.total_amount || 0);

  // ==========================================
  // CANCEL ORDER
  // ==========================================

  const handleCancelOrder = async (reasons = null) => {
    const cancelReasons = reasons || selectedCancelReasons;

    setCancelling(true);

    try {
      if (isCod) {
        await dispatch(
          cancelCodOrder({
            orderId: id,
            cancel_reason: cancelReasons,
          }),
        ).unwrap();
      } else {
        await dispatch(
          cancelOrder({
            orderId: id,
            cancel_reason: cancelReasons,
          }),
        ).unwrap();
      }

      await dispatch(fetchOrderDetails(id)).unwrap();

      setSelectedCancelReasons([]);
      setOtherReason("");
      setShowCancelReason(false);
    } catch (err) {
      console.error("Cancellation error:", err);
    } finally {
      setCancelling(false);
    }
  };

  // ==========================================
  // RENDER
  // ==========================================

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ======================================
            TOP ACTIONS
        ====================================== */}

        <div className="flex justify-between items-center mb-6">
          {/* BACK */}
          <button
            onClick={() => navigate("/orders")}
            className="flex items-center gap-2 text-amber-600 hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Orders
          </button>

          {/* DOWNLOAD INVOICE */}
          {!isCancelled && (
            <button
              onClick={handleDownloadInvoice}
              disabled={downloadInvoiceLoading}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition font-medium cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />

              {downloadInvoiceLoading ? "Downloading..." : "Download Invoice"}
            </button>
          )}
        </div>

        {/* ======================================
            ORDER CARD
        ====================================== */}

        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          {/* ====================================
              HEADER
          ==================================== */}

          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
            <div>
              <p className="text-sm text-gray-500">
                Order Number : #{order.order_number}
              </p>

              {!isCod && (
                <p className="text-sm text-gray-500">
                  Transaction ID : #{order?.payment?.transaction_id || "N/A"}
                </p>
              )}

              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Order On :{" "}
                {order?.timestamps?.created_at
                  ? new Date(order.timestamps.created_at).toLocaleString(
                      "en-IN",
                    )
                  : "N/A"}
              </p>

              {order.timestamps?.delivered_at && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  Delivered On :{" "}
                  {new Date(order.timestamps.delivered_at).toLocaleString(
                    "en-IN",
                  )}
                </p>
              )}

              {order.timestamps?.cancelled_at && (
                <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                  <XCircle className="w-3 h-3 text-red-500" />
                  Cancelled On :{" "}
                  {new Date(order.timestamps.cancelled_at).toLocaleString(
                    "en-IN",
                  )}
                </p>
              )}
            </div>

            {/* STATUS */}

            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                order.status === "delivered"
                  ? "bg-green-100 text-green-800"
                  : order.status === "paid"
                    ? "bg-green-100 text-green-800"
                    : order.status === "cancelled"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {order.status?.toUpperCase() || "PENDING"}
            </span>
          </div>

          {/* ====================================
              ITEMS
          ==================================== */}

          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Items
            </h2>

            <div className="space-y-4">
              {order.items && order.items.length > 0 ? (
                order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                  >
                    {/* IMAGE */}

                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-sm md:rounded-lg"
                      />
                    )}

                    {/* INFO */}

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-800">{item.name}</h3>

                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>

                      {item.ratti && (
                        <p className="text-sm text-gray-500">
                          Ratti: {item.ratti}
                        </p>
                      )}

                      <p className="text-sm text-gray-600">
                        ${Number(item.price || 0).toFixed(2)} each
                      </p>
                    </div>

                    {/* ITEM TOTAL */}

                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        $
                        {(
                          Number(item.price || 0) * Number(item.quantity || 0)
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">No items found</p>
              )}
            </div>

            {/* ==================================
                SUMMARY + CANCEL
            ================================== */}

            <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              {/* CANCEL */}

              <div>
                {canCancel ? (
                  <button
                    onClick={() => setShowCancelReason(true)}
                    disabled={cancelling}
                    className="group flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cancelling ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600"></div>

                        <span>Cancelling...</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />

                        <span className="text-sm font-medium">
                          Cancel Order
                        </span>
                      </>
                    )}
                  </button>
                ) : isCancelled ? (
                  <div className="flex items-center gap-2 text-red-600 px-4 py-2 rounded-lg">
                    <XCircle className="w-4 h-4" />

                    <span className="text-sm font-medium">
                      This order has been cancelled
                    </span>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Order cannot be cancelled at this stage
                  </div>
                )}
              </div>

              {/* ==================================
                  CANCEL MODAL
              ================================== */}

              {showCancelReason && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-md z-50">
                  <div className="bg-white p-8 rounded-lg shadow-2xl max-w-md w-full">
                    <h3 className="text-xl font-semibold mb-6 text-center">
                      Select Cancel Reason
                    </h3>

                    <div className="space-y-3">
                      {[
                        "I ordered the wrong product",
                        "I want to change the size/weight/quality.",
                        "I found a better price elsewhere.",
                        "I ordered by mistake.",
                        "Delivery is taking longer than expected.",
                        "I want to change my delivery address.",
                        "I placed another order instead.",
                        "Other (Please specify).",
                      ].map((reason) => (
                        <label
                          key={reason}
                          className="flex items-center space-x-2"
                        >
                          <input
                            type="checkbox"
                            value={reason}
                            checked={selectedCancelReasons.includes(reason)}
                            onChange={(e) => {
                              const checked = e.target.checked;

                              setSelectedCancelReasons((prev) =>
                                checked
                                  ? [...prev, reason]
                                  : prev.filter((r) => r !== reason),
                              );

                              if (
                                !checked &&
                                reason === "Other (Please specify)."
                              ) {
                                setOtherReason("");
                              }
                            }}
                            className="h-4 w-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
                          />

                          <span className="text-gray-800 text-xs">
                            {reason}
                          </span>
                        </label>
                      ))}
                    </div>

                    {/* OTHER */}

                    {selectedCancelReasons.includes(
                      "Other (Please specify).",
                    ) && (
                      <div className="mt-4">
                        <label className="text-xs text-gray-600 block mb-1">
                          Please specify your reason:
                        </label>

                        <textarea
                          value={otherReason}
                          onChange={(e) => setOtherReason(e.target.value)}
                          placeholder="Type your reason here..."
                          className="w-full border rounded-md p-2 text-xs focus:ring-1 focus:ring-amber-500 resize-none"
                          rows="2"
                        />
                      </div>
                    )}

                    {/* BUTTONS */}

                    <div className="flex justify-between mt-6 space-x-2">
                      <button
                        onClick={() => {
                          setShowCancelReason(false);

                          setSelectedCancelReasons([]);

                          setOtherReason("");
                        }}
                        className="flex-1 py-2 bg-gray-200 text-sm text-gray-800 rounded hover:bg-gray-300 transition"
                      >
                        Back
                      </button>

                      <button
                        disabled={
                          selectedCancelReasons.length === 0 ||
                          (selectedCancelReasons.includes(
                            "Other (Please specify).",
                          ) &&
                            !otherReason.trim())
                        }
                        onClick={async () => {
                          let reasons = selectedCancelReasons.filter(
                            (r) => r !== "Other (Please specify).",
                          );

                          if (
                            selectedCancelReasons.includes(
                              "Other (Please specify).",
                            ) &&
                            otherReason.trim()
                          ) {
                            reasons.push(otherReason.trim());
                          }

                          await handleCancelOrder(reasons);
                        }}
                        className="flex-1 py-2 bg-amber-600 text-sm text-white rounded disabled:opacity-50 hover:bg-amber-700 transition"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ==================================
                  PRICE SUMMARY
              ================================== */}

              <div className="text-right">
                {shipping > 0 && (
                  <p className="text-sm text-gray-500">
                    Shipping Charge: ${Number(shipping).toLocaleString()}
                  </p>
                )}

                {isCod && (
                  <p className="text-sm text-gray-500">
                    COD Charge: ${COD_SURCHARGE.toLocaleString()}
                  </p>
                )}

                {discount > 0 && (
                  <p className="text-sm text-green-600">
                    Discount: -$
                    {Number(discount).toLocaleString()}
                  </p>
                )}

                {advancePaid > 0 && (
                  <p className="text-sm text-green-600">
                    Advance Paid: -$
                    {advancePaid.toLocaleString()}
                  </p>
                )}

                {remainingCod > 0 && (
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    Remaining COD: ${remainingCod.toLocaleString()}
                  </p>
                )}

                <p className="text-lg font-bold text-gray-900 mt-1">
                  Total: ${grandTotal.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* ======================================
              DELIVERY ADDRESS
          ====================================== */}

          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Delivery Address
            </h2>

            {order?.address?.snapshot ? (
              <div className="flex flex-col gap-2">
                <div className="flex flex-col sm:flex-row items-start gap-2 sm:items-center">
                  <p className="text-gray-800 font-medium text-sm">
                    {order.address.snapshot.name},
                  </p>

                  <p className="text-gray-500 text-sm">
                    Email: {order.address.snapshot.email},
                  </p>

                  <p className="text-gray-500 text-sm">
                    Mobile: {order.address.snapshot.mobile}
                    {order.address.snapshot.alternative_mobile
                      ? `, ${order.address.snapshot.alternative_mobile}`
                      : ""}
                  </p>
                </div>

                <p className="text-gray-500 text-sm">
                  Address: {order.address.snapshot.address}
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-2 sm:items-center">
                  <p className="text-gray-500 text-sm">
                    City: {order.address.snapshot.city},
                  </p>

                  <p className="text-gray-500 text-sm">
                    State: {order.address.snapshot.state},
                  </p>

                  <p className="text-gray-500 text-sm">
                    Country: {order.address.snapshot.country},
                  </p>

                  <p className="text-gray-500 text-sm">
                    Pin Code: {order.address.snapshot.pincode}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">Address not available</p>
            )}
          </div>

          {/* ======================================
              PAYMENT
          ====================================== */}

          <div className="border-t border-gray-200 p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment
            </h2>

            <p className="text-gray-600">
              Mode:{" "}
              {order?.payment?.mode
                ? order.payment.mode.toUpperCase()
                : "ONLINE"}
            </p>

            {!isCod && (
              <p className="text-gray-600">
                Payment Status: {order?.payment?.status || "N/A"}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyOrderDetailsPage;
