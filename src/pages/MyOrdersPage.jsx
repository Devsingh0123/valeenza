import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchMyOrders, clearOrderError } from "../redux/slices/orderSlice";
import Loader from "@/components/common/Loader";
import { toast } from "react-toastify";
import { Package, ArrowRight, ArrowLeft, Truck } from "lucide-react";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  paid: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const MyOrdersPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orders, loading, error } = useSelector((state) => state.order);
  const { isLoggedIn } = useSelector((state) => state.userAuth);

  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchMyOrders());
    }
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Please log in to view your orders.</p>
      </div>
    );
  }

  if (loading) return <Loader data="Loading orders..." />;

  if (!orders.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">No orders yet</h2>
          <p className="text-gray-500 mt-2">
            Your order history will appear here.
          </p>
        </div>
      </div>
    );
  }

  // Helper to get values from the order response structure
  const getSubtotal = (order) => {
    if (order.pricing?.subtotal) return Number(order.pricing.subtotal);
    if (order.subtotal) return Number(order.subtotal);
    if (order.items && order.items.length) {
      return order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
    }
    return 0;
  };

  const getShipping = (order) => {
    if (order.pricing?.delivery_charge)
      return Number(order.pricing.delivery_charge);
    return order.shipping_cost || 0;
  };

  const getDiscount = (order) => {
    if (order.pricing?.discount) return Number(order.pricing.discount);
    return order.discount || 0;
  };


  const getTotal = (order) => {
    if (order.pricing?.total_amount) return Number(order.pricing.total_amount);
    return order.total || 0;
  };

  const handleTrackOrder = (e, orderId) => {
    e.stopPropagation();
    navigate(`/track-order/${orderId}`);
  };

  const getCodCharge = (order) => {
    return order?.pricing?.cod_charge ? Number(order.pricing.cod_charge) : 0;
  };
  const getAdvancepaid = (order) => {
    return order?.pricing?.advance_paid_amount ? Number(order?.pricing?.advance_paid_amount) : 0;
  };

  const getRemainingCod = (order) => {
    return order?.pricing?.remaining_cod_amount ? Number(order?.pricing?.remaining_cod_amount) : 0;
  };

  const isCodOrder = (order) => {
    return order.payment?.mode === "cod";
  };

  const handleViewDetails = (e, orderId) => {
    e.stopPropagation();
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 text-amber-600 hover:underline mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Orders</h1>

        <div className="space-y-4">
          {orders.map((order, idx) => {
            const subtotal = getSubtotal(order);
            const shipping = getShipping(order);
            const discount = getDiscount(order);
            const total = getTotal(order);
            const isCod = isCodOrder(order);
            const codCharge = getCodCharge(order);
            const remainingCod = getRemainingCod(order);
            const advancepaid = getAdvancepaid(order);


            return (
              <div
                key={idx}
                className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition"
                onClick={() => navigate(`/orders/${order.order_id}`)}
              >
                {/* Order Header */}
                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-wrap justify-between items-center gap-3">
                  <div>
                    {/* <p className="text-sm text-gray-500">Order Number : #{order.order_number}</p> */}
                    {order.timestamps?.created_at && (
                      <p className="text-sm text-gray-500 mt-1">
                        Order On :{" "}
                        {new Date(
                          order.timestamps.created_at,
                        ).toLocaleDateString("en-IN")}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100"}`}
                    >
                      {order.status?.toUpperCase() || "PENDING"}
                    </span>
                    <span className="font-base text-xs text-gray-900">
                      {order.payment?.mode.toUpperCase() || order.payment_method}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6 space-y-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-coverrounded-sm md:rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-800">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
                          {item.ratti && (
                            <p className="text-sm text-gray-500">
                              Ratti: {item.ratti}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            ₹{item.price} each
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">
                            ₹{item.price * item.quantity}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No items found</p>
                  )}

                  {/* Order Summary with both buttons */}
                  <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-start sm:items-center gap-4">
                    {/* Buttons - Left side */}
                    <div className="flex sm:flex-row flex-col gap-3">
                      <button
                        onClick={(e) => handleViewDetails(e, order.order_id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-all duration-200 cursor-pointer"
                      >
                        View Details <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => handleTrackOrder(e, order.order_id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all duration-200 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" /> Track Order
                      </button>
                    </div>

                    {/* Price Summary - Right side */}
                    <div className="text-right">
                      {/* <p className="text-sm text-gray-500">
                        Subtotal: ₹{subtotal.toLocaleString()}
                      </p> */}
                      <p className="text-sm text-gray-500">
                        Shipping: ₹{shipping.toLocaleString()}
                      </p>
                      {isCod && codCharge > 0 && (
                        <p className="text-sm text-gray-500">
                          COD Charge: ₹{codCharge.toLocaleString()}
                        </p>
                      )}
                      {discount > 0 && (
                        <p className="text-sm text-green-600">
                          Discount: -₹{discount.toLocaleString()}
                        </p>
                      )}
                      {advancepaid > 0 && (
                        <p className="text-sm text-green-600">
                          Advance Paid: -₹{advancepaid.toLocaleString()}
                        </p>
                      )}
                      {remainingCod > 0 && <p className="text-lg font-bold text-gray-900 mt-1">
                        Total: ₹{remainingCod.toLocaleString()}
                      </p>}
                      {/* {!isCod && <p className="text-lg font-bold text-gray-900 mt-1">
                        Total: ₹{total.toLocaleString()}
                      </p>} */}
                      <p className="text-lg font-bold text-gray-900 mt-1">
                        Total: ₹{total.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
