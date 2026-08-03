import React, { useEffect, useRef, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { CheckCircle, Download, ShoppingBag, Truck } from "lucide-react";
import {
  fetchOrderDetails,
  clearCurrentOrder,
  uploadInvoice,
} from "../redux/slices/orderSlice";
import Loader from "@/components/common/Loader";
import OrderInvoice from "./OrderInvoice";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import { toast } from "react-toastify";

const OrderSuccessPage = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const invoiceRef = useRef(null);
  const [downloadInvoiceLoading, setDownloadInvoiceLoading] = useState(false);
  const [uploadToBackendInvoiceLoading, setUploadToBackendInvoiceLoading] =
    useState(false);
  const [invoiceUploadAttempted, setInvoiceUploadAttempted] = useState(false);

  // Redux state se data lo
  const {
    currentOrder: order,
    loading,
    error,
  } = useSelector((state) => state.order);

  // Navigation state se orderId lo
  // const orderId = 406;
  const orderId = location.state?.orderData;

  // console.log(order);

  useEffect(() => {
    if (orderId) {
      // Redux thunk se order details fetch karo
      dispatch(fetchOrderDetails(orderId));
    }

    //  page leave karte time current order clear karo
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId]);

  // ---------- add dataLayer for gtm tracking ----------
  useEffect(() => {
    if (order && items.length > 0) {
      const transactionId = String(order?.payment?.transaction_id);
      const totalValue = parseFloat(order.pricing?.total_amount) || 0;
      const items = order.items || order.order_items || [];
      const discount = order.pricing?.discount || 0;

      // console.log(discount)

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "purchase",
        ecommerce: {
          transaction_id: transactionId,
          currency: "INR",
          order_value: totalValue,
          order_id: orderId,
          coupan_discount: discount,
          items: items.map((item) => ({
            item_id: String(item.product_id || item.product.id),
            name: String(item.name || item.product.name),
            price: parseFloat(item.price) || 0,
            quantity: parseInt(item.quantity),
          })),
        },
      });

      console.log("trackTransaction datalayer", window.dataLayer);
    }
  }, [order]);

const generateInvoiceBase64 = async (element) => {
  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  });
  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  const pageWidth = 210;
  const pageHeight = 297;

  let imgWidth = pageWidth;
  let imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight > pageHeight) {
    const scale = pageHeight / imgHeight;
    imgWidth = imgWidth * scale;
    imgHeight = pageHeight;
  }

  const xOffset = (pageWidth - imgWidth) / 2;

  pdf.addImage(imgData, "PNG", xOffset, 0, imgWidth, imgHeight, undefined, "FAST");
  const pdfDataUrl = pdf.output("dataurlstring");
  return pdfDataUrl;
};

  useEffect(() => {
    const autoUpload = async () => {
      //  conditions check
      if (!order || invoiceUploadAttempted) return;

      // Hidden div ke DOM mein aane ka wait kar
      await new Promise((resolve) => setTimeout(resolve, 300));
      if (!invoiceRef.current) return;

      //  Agar sirf online orders ke liye chahiye to
      // if (order.payment?.mode !== 'online' && order.status !== 'paid') return;
      setUploadToBackendInvoiceLoading(true);
      try {
        const pdfBase64 = await generateInvoiceBase64(invoiceRef.current);
        await dispatch(
          uploadInvoice({
            order_id: order.order_id, // order_id
            pdf: pdfBase64,
          }),
        ).unwrap();
        // console.log(" Invoice auto-uploaded");
        setInvoiceUploadAttempted(true);
        setUploadToBackendInvoiceLoading(false);
      } catch (err) {
        console.error(" Auto-upload failed:", err);
        toast.info("You can download invoice manually.");
      } finally {
        // Always reset loader, even on error or early return inside try
        setUploadToBackendInvoiceLoading(false);
      }
    };
    autoUpload();
  }, [order, invoiceUploadAttempted, dispatch]);

  const handleDownloadInvoice = async () => {
    if (!order || !invoiceRef.current) {
      toast.error("Invoice data not ready.");
      return;
    }
    setDownloadInvoiceLoading(true);
    try {
      const pdfBase64 = await generateInvoiceBase64(invoiceRef.current);
      const pdfDataUrl = `${pdfBase64}`;
      const link = document.createElement("a");
      link.href = pdfDataUrl;
      link.download = `Invoice_${order.order_number}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("Invoice downloaded!");
    } catch (err) {
      console.error("PDF Error:", err);
      toast.error(`Download failed: ${err.message}`);
    } finally {
      setDownloadInvoiceLoading(false);
    }
  };

  // Error state - No orderId
  if (!orderId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-semibold">Order information not found</p>
            <p className="text-sm mt-2">
              Please check your orders page for details.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/orders"
              className="inline-block bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 transition"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="inline-block bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Error state - API error
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-lg font-semibold">{error}</p>
          </div>
          <div className="flex flex-col gap-3">
            <Link
              to="/orders"
              className="inline-block bg-amber-600 text-white px-6 py-2 rounded hover:bg-amber-700 transition"
            >
              View My Orders
            </Link>
            <Link
              to="/"
              className="inline-block bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-700 transition"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No order data
  if (!order) {
    return null;
  }

  // Safely extract data
  const subtotal = order.pricing?.subtotal || order.subtotal || 0;
  const deliveryCharge =
    order.pricing?.delivery_charge || order.delivery_charge || 0;
  const discount = order.pricing?.discount || order.discount || 0;
  const walletUsed = order.pricing?.wallet_used || order.wallet_used || 0;
  const totalPaid =
    order.pricing?.paid_online ||
    order.pricing?.total_amount ||
    order.total_amount ||
    order.total ||
    0;

  const items = order.items || order.order_items || [];
  const address = order.address?.snapshot || order.address || {};
  const payment = order.payment || {};
  const COD_SURCHARGE = order?.pricing?.cod_charge;
  const advancePaid = order?.pricing?.advance_paid_amount;
  const remainingCod = order?.pricing?.remaining_cod_amount;
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      {/* ✅ Loader overlay – सिर्फ tab dikhe jab loading/upload चल रहा हो */}
      {(loading || uploadToBackendInvoiceLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/20 backdrop-blur-xs">
          <Loader data="Please do not refresh, Loading order details..." />
        </div>
      )}
      <div className="max-w-3xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-6">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-3" />
          <h1 className="text-2xl font-bold text-gray-800">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Thank you for your purchase
          </p>
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header - Order Number & Date */}
          <div className="border-b border-gray-200 px-5 py-4">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Order Number
                </p>
                <p className="text-xs  text-gray-800">#{order.order_number}</p>
              </div>
              {order?.payment?.mode !== "cod" && (
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-wide">
                    Transaction Id
                  </p>
                  <p className="text-xs  text-gray-800">
                    #{order?.payment?.transaction_id}
                  </p>
                </div>
              )}
              <div className="text-right">
                <p className="text-xs text-gray-400 uppercase tracking-wide">
                  Order Date
                </p>
                <p className="text-xs text-gray-800">
                  {new Date(
                    order.created_at ||
                      order.timestamps?.created_at ||
                      Date.now(),
                  ).toLocaleDateString("en-IN")}
                </p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="bg-green-50 px-5 py-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600 font-medium">
                ✓ Order Successful
              </span>
              <span className="text-gray-300">|</span>
              <span className="text-sm text-gray-600">
                Order Status:
                <span className="ml-1 font-semibold text-green-600">
                  {order.status?.toUpperCase() || "CONFIRMED"}
                </span>
              </span>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address?.snapshot && (
            <div className="border-b border-gray-200 px-5 py-4 flex flex-wrap gap-2 items-center">
              <h3 className="text-xs font-semibold text-gray-400 uppercase">
                Delivery Address :
              </h3>
              <p className="font-sm text-gray-800">
                {order.address.snapshot.name},
              </p>
              <p className="font-sm text-gray-800">
                {order.address.snapshot.email},
              </p>
              <p className="text-sm text-gray-600">
                {order.address.snapshot.address},
              </p>
              <p className="text-sm text-gray-600">
                {order.address.snapshot.city}
                {"  "}, {order.address.snapshot.state} -{" "}
                {order.address.snapshot.pincode},
              </p>
              <p className="text-sm text-gray-500">
                Mobile: {order.address.snapshot.mobile}
              </p>
            </div>
          )}

          {/* Order Items Table */}
          <div className="px-5 py-4">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
              Order Items
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-gray-200">
                  <tr className="text-left text-gray-500">
                    <th className="pb-2">Product</th>
                    <th className="pb-2 text-center w-16">Qty</th>
                    <th className="pb-2 text-right w-24">Price</th>
                    <th className="pb-2 text-right w-24">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-800">
                              {item.name}
                            </p>
                            {(item.ratti || item.ratti_weight) && (
                              <p className="text-xs text-gray-500 mt-0.5">
                                Ratti: {item.ratti || item.ratti_weight}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center text-gray-600">
                        {item.quantity}
                      </td>
                      <td className="text-right text-gray-600">
                        ₹{parseFloat(item.price).toLocaleString()}
                      </td>
                      <td className="text-right font-medium text-gray-800">
                        ₹
                        {(
                          parseFloat(item.total) || item.price * item.quantity
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-t border-gray-200">
                  {/* <tr className="text-gray-600">
                    <td colSpan="3" className="pt-3 text-right">subtotal:</td>
                    <td className="pt-3 text-right font-medium">₹{parseFloat(subtotal).toLocaleString()}</td>
                  </tr> */}
                  {/* cod payment charge */}
                  {order.payment.mode === "cod" && (
                    <tr className="text-gray-600">
                      <td colSpan="3" className="pt-1 text-right">
                        COD Charge:
                      </td>
                      <td className="pt-1 text-right">
                        ₹{COD_SURCHARGE.toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {deliveryCharge > 0 && (
                    <tr className="text-gray-600">
                      <td colSpan="3" className="pt-1 text-right">
                        Shipping Charge:
                      </td>
                      <td className="pt-1 text-right">
                        ₹{parseFloat(deliveryCharge).toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {discount > 0 && (
                    <tr className="text-green-600">
                      <td colSpan="3" className="pt-1 text-right">
                        Discount:
                      </td>
                      <td className="pt-1 text-right">
                        -₹{parseFloat(discount).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {advancePaid > 0 && (
                    <tr className="text-green-600">
                      <td colSpan="3" className="pt-1 text-right">
                        Convenience Charge:
                      </td>
                      <td className="pt-1 text-right">
                        -₹{parseFloat(advancePaid).toLocaleString()}
                      </td>
                    </tr>
                  )}

                  {walletUsed > 0 && (
                    <tr className="text-amber-600">
                      <td colSpan="3" className="pt-1 text-right">
                        Wallet Used:
                      </td>
                      <td className="pt-1 text-right">
                        -₹{parseFloat(walletUsed).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {remainingCod > 0 && (
                    <tr className="border-t-2 border-gray-300">
                      <td
                        colSpan="3"
                        className="pt-2 text-right font-bold text-gray-800"
                      >
                        Total:
                      </td>
                      <td className="pt-2 text-right font-bold text-gray-800 text-lg">
                        ₹{parseFloat(remainingCod).toLocaleString()}
                      </td>
                    </tr>
                  )}
                  {/* {order.payment.mode !== "cod" && (
                    <tr className="border-t-2 border-gray-300">
                      <td
                        colSpan="3"
                        className="pt-2 text-right font-bold text-gray-800"
                      >
                        Total:
                      </td>
                      <td className="pt-2 text-right font-bold text-gray-800 text-lg">
                        ₹{parseFloat(totalPaid).toLocaleString()}
                      </td>
                    </tr>
                  )} */}

                  <tr className="border-t-2 border-gray-300">
                    <td
                      colSpan="3"
                      className="pt-2 text-right font-bold text-gray-800"
                    >
                      Total:
                    </td>
                    <td className="pt-2 text-right font-bold text-gray-800 text-sm">
                      ₹{parseFloat(totalPaid).toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-gray-50 px-5 py-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Payment Mode:</span>
                <span className="ml-2 font-medium capitalize">
                  {payment.mode.toUpperCase() || "Online"}
                </span>
              </div>
              {payment.mode === "online" && (
                <div>
                  <span className="text-gray-500">Payment Status:</span>
                  <span className="ml-2 font-medium text-green-600">
                    {payment?.status}
                  </span>
                </div>
              )}
              {/* {payment.transaction_id && (
                <div className="md:col-span-2">
                  <span className="text-gray-500">Transaction ID:</span>
                  <span className="ml-2 font-semibold text-xs text-gray-600">{payment.transaction_id}</span>
                </div>
              )} */}
            </div>
          </div>

          {/* Footer Message */}
          <div className="px-5 py-4 text-center border-t border-gray-200 bg-white">
            <p className="text-xs text-gray-400">
              For any queries, contact us at{" "}
              <a
                href="mailto:care@astrotring.com"
                className="text-amber-600 hover:underline"
              >
                care@astrotring.com
              </a>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6">
          <button
            onClick={handleDownloadInvoice}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium cursor-pointer"
          >
            <Download className="w-4 h-4" />{" "}
            {downloadInvoiceLoading ? "Downloading..." : "Download Invoice"}
          </button>
          <div className="flex gap-3">
            <Link
              to="/orders"
              className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-sm font-medium"
            >
              <ShoppingBag className="w-4 h-4" /> My Orders
            </Link>
            <Link
              to="/"
              className="flex items-center justify-center px-5 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition text-sm font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

        {/* Delivery Note */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
            <Truck className="w-3 h-3" />
            Estimated delivery in 5-7 business days
          </p>
        </div>
      </div>

      {/* Hidden invoice template - same as MyOrderDetailsPage */}
      <div
        ref={invoiceRef}
        style={{
          position: "absolute",
          top: "-9999px",
          left: "-9999px",
          //  visibility: 'hidden',
          width: "794px",
          background: "white",
          zIndex: -1,
        }}
      >
        <OrderInvoice order={order} />
      </div>
    </div>
  );
};

export default OrderSuccessPage;
