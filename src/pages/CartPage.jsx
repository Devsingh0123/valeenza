import React, { useState, useEffect } from "react";
import {
  Plus,
  Minus,
  X,
  Image as ImageIcon,
  ArrowRight,
  Trash2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  clearCartError,
} from "../redux/slices/cartSlice";
import { toast } from "react-toastify";
import { closeCartDrawer, openCheckout } from "@/redux/slices/uiSlice";
import Loader from "@/components/common/Loader";

const CartPage = () => {
  const dispatch = useDispatch();
  const {
    items: cartItems,
    loading,
    error,
  } = useSelector((state) => state.cart);
  const [removingId, setRemovingId] = useState(null);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCartError());
    }
  }, [error, dispatch]);

  // ---------- GTM Tracking (View Basket) ----------
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "viewBasket",
        ecommerce: {
          items: cartItems.map((item) => ({
            item_id: String(item.product_id),
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      });
      console.log("viewBasket datalayer", window.dataLayer);
    }
  }, [cartItems]);

  const handleRemoveItem = (id) => {
    setRemovingId(id);
    setTimeout(() => {
      dispatch(removeFromCart(id));
      toast.error("Item removed");
    }, 300);
  };

  const handleIncreaseQuantity = (item) => {
    if (item.stockAvilable < item.quantity + 1)
      return toast.info(`${item?.stockAvilable} stock avilable only `);
    dispatch(
      updateCartItem({
        item_id: item.item_id,
        quantity: item.quantity + 1,
      }),
    ).then(() => {
      dispatch(fetchCart());
    });
  };

  const handleDecreaseQuantity = (item) => {
    if (item.quantity > 1) {
      dispatch(
        updateCartItem({
          item_id: item.item_id,
          quantity: item.quantity - 1,
        }),
      ).then(() => {
        dispatch(fetchCart());
      });
    }
  };

  const handleCheckout = () => {
    // ---------- add dataLayer for gtm tracking ----------
    if (cartItems && cartItems.length > 0) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "proceedToCheckout",
        ecommerce: {
          items: cartItems.map((item) => ({
            item_id: String(item.product_id),
            price: Number(item.price),
            quantity: Number(item.quantity),
          })),
        },
      });
      console.log("proceedToCheckout datalayer", window.dataLayer);
    }
    // ORIGINAL CHECKOUT OPEN
    dispatch(openCheckout());
  };

  // total calculation on api data
  const totalAmount = cartItems.reduce(
    (sum, item) => sum + parseFloat(item.price) * item.quantity,
    0,
  );

  if (loading && cartItems.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <Loader data="Loading cart.." />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white  selection:bg-gray-200">
      {/* Header Section */}
      <div className="flex items-center justify-between px-6 pt-6 pb-4">
        <h2 className="text-2xl  tracking-wide text-gray-900">Your cart</h2>
        <button
          className="text-gray-400 hover:text-gray-900 transition-colors cursor-pointer"
          onClick={() => dispatch(closeCartDrawer())}
          aria-label="Close cart"
        >
          <X size={24} strokeWidth={1.2} />
        </button>
      </div>

      {/* Table Sub-headers (PRODUCT / TOTAL) */}
      {cartItems.length > 0 && (
        <div className="flex justify-between px-6 text-[10px] tracking-widest text-amber-500 font-semibold uppercase border-b border-gray-100 pb-2">
          <span>Products ({cartItems.length})</span>
          <span>Total</span>
        </div>
      )}

      {/* Scrollable Cart Items Container */}
      <div className="flex-1 overflow-y-auto px-6 py-2 custom-scrollbar">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <h3 className="text-base font-medium text-stone-700 mb-1">
              Your cart is empty
            </h3>
            <p className="text-sm text-stone-400">
              Add some items to get started!
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {cartItems.map((item) => {
              const price = parseFloat(item.price);
              const quantity = item.quantity;
              const itemTotal = item.total ? item.total : price * quantity;

              return (
                <div
                  key={item.item_id}
                  className={`flex gap-4 py-5 transition-all duration-300 ${
                    removingId === item.item_id ? "opacity-0 scale-95" : ""
                  }`}
                >
                  {/* Product Image */}
                  <div className="w-30 h-30 bg-gray-50 flex-shrink-0 overflow-hidden border border-gray-100 flex items-center justify-center rounded-md">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain rounded-md"
                      />
                    ) : (
                      <div className="text-stone-300">
                        <ImageIcon size={24} strokeWidth={1.5} />
                      </div>
                    )}
                  </div>

                  {/* Product Meta & Actions */}
                  <div className="flex-1 flex flex-col min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="text-sm font-medium text-gray-800 leading-tight mb-1 break-words">
                          {item.name}
                        </h4>
                        {item.ratti && (
                          <p className="text-xs text-gray-600 mb-1">
                            Ratti: {item.ratti}
                          </p>
                        )}
                        <span className="text-xs text-gray-600">
                          ₹{price.toFixed(2)}
                        </span>
                      </div>
                      {/* Individual Item Total */}
                      <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        ₹{itemTotal.toLocaleString("en-IN")}
                      </span>
                    </div>

                    {/* Quantity Selector &  Trash Button */}
                    <div className="flex items-center gap-2 mt-3 ">
                      <div className="flex items-center bg-white border border-stone-300 h-9 rounded-md">
                        <button
                          className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 disabled:opacity-30 transition-colors cursor-pointer"
                          onClick={() => handleDecreaseQuantity(item)}
                          disabled={quantity <= 1}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="w-8 text-center text-xs font-medium text-stone-900">
                          {quantity}
                        </span>
                        <button
                          className="w-8 h-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                          onClick={() => handleIncreaseQuantity(item)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Exact Black Trash Box from Screenshot */}
                      <button
                        className="w-9 h-9 bg-red-700 text-white flex items-center justify-center hover:bg-red-800 transition-colors duration-200 cursor-pointer rounded-md"
                        onClick={() => handleRemoveItem(item.item_id)}
                        aria-label="Delete item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Checkout Block */}
      {cartItems.length > 0 && (
        <div className="border-t border-gray-300 px-6 py-5 space-y-4 bg-white">
          {/* Estimated Total Block */}
          <div className="flex justify-between items-baseline mb-1 ">
            <span className="text-md font-medium text-gray-900">
              Estimated total
            </span>
            <span className="text-md font-semibold text-gray-900">
              ₹{totalAmount.toLocaleString("en-IN")}
            </span>
          </div>
          <p className="text-xs text-gray-500 leading-normal mb-5">
            Taxes Included. Discounts, shipping and others calculated at
            checkout.
          </p>

          {/*"BUY NOW" Button with Arrow */}
          <button
            className="w-full py-4 bg-gray-900 text-white font-bold text-[13px] tracking-widest flex items-center justify-center gap-1.5 hover:bg-gray-800 transition-colors duration-200 uppercase cursor-pointer"
            onClick={handleCheckout}
          >
            <span>Buy Now</span>
            <span className="text-xs font-bold  ml-1">
              <ArrowRight size={18} />
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
