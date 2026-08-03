import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrderDetails, clearOrderError, clearCurrentOrder } from '../redux/slices/orderSlice';
import { toast } from 'react-toastify';
import Loader from '@/components/common/Loader';
import { 
  ArrowLeft, 
  CheckCircle2, 
  Package, 
  Truck, 
  Home, 
  XCircle, 
  RotateCcw, 
  ShoppingBag,
  Copy,
  Check
} from 'lucide-react';

const STEPS = [
  { key: 'confirmed', label: 'Confirmed', icon: CheckCircle2, desc: 'Order placed' },
  { key: 'packed', label: 'Packed', icon: Package, desc: 'Item packed' },
  { key: 'shipped', label: 'Shipped', icon: Truck, desc: 'On the way' },
  { key: 'delivered', label: 'Delivered', icon: Home, desc: 'Delivered' },
];

const statusToActiveIndex = {
  confirmed: 0,
  packed: 1,
  shipped: 2,
  delivered: 3,
};

const TrackMyOrderPage = () => {
  const { orderId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentOrder, loading, error } = useSelector((state) => state.order);
  const { isLoggedIn } = useSelector((state) => state.userAuth);
  
  const [activeStep, setActiveStep] = useState(0);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isRto, setIsRto] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (orderId) {
      dispatch(fetchOrderDetails(orderId));
    }
    return () => {
      dispatch(clearCurrentOrder());
    };
  }, [dispatch, orderId, isLoggedIn, navigate]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearOrderError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (currentOrder && currentOrder.status) {
      const status = currentOrder.status.toLowerCase();
      const cancelled = status === 'cancelled';
      const rto = status === 'rto';
      
      setIsCancelled(cancelled);
      setIsRto(rto);

      if (cancelled || rto) {
        setActiveStep(-1);
        return;
      }

      const idx = statusToActiveIndex[status];
      setActiveStep(idx !== undefined ? idx : 0);
    }
  }, [currentOrder]);

  const handleCopyTracking = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success("Tracking ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isLoggedIn) return null;
  if (loading) return <Loader data="Loading tracking details..." />;
  if (!currentOrder) return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
      <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center mb-3 text-amber-600">
        <ShoppingBag className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-gray-800">Order Not Found</h3>
      <p className="text-xs text-gray-500 mt-1 mb-5">We couldn't find details for this order.</p>
      <button 
        onClick={() => navigate('/orders')} 
        className="px-4 py-2 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition cursor-pointer"
      >
        Back to Orders
      </button>
    </div>
  );

  const order = currentOrder;
  const items = order.items || [];
  const isTerminal = isCancelled || isRto;
  const trackingNumber = order.awb_code || order.tracking_number;
  const orderDate = order.timestamps?.created_at || order.created_at;

  return (
    <div className="min-h-screen bg-gray-50/50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-4">

        {/* Minimal Navigation & Header */}
        <div className="flex items-center justify-between">
          <button
                    onClick={() => navigate("/orders")}
                    className="flex items-center gap-2 text-amber-600 hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" /> Back to Orders
                  </button>
          
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide uppercase ${
            isCancelled 
              ? 'bg-red-50 text-red-600 border border-red-200' 
              : isRto 
              ? 'bg-amber-50 text-amber-700 border border-amber-200' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {order.status}
          </span>
        </div>

        {/* Lightweight Main Card */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          
          {/* Top Info Bar */}
          <div className="p-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-white">
            <div>
              <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                Order #{order.order_number}
              </h2>
              {orderDate && (
                <p className="text-xs text-gray-400 mt-0.5">
                  Placed on {new Date(orderDate).toLocaleDateString("en-IN", { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>

            {trackingNumber && (
              <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200/60">
                <span className="text-xs text-gray-400">Tracking ID:</span>
                <span className="text-xs font-semibold text-gray-800">{trackingNumber}</span>
                <button 
                  onClick={() => handleCopyTracking(trackingNumber)}
                  className="p-1 hover:bg-gray-200 rounded text-gray-500 transition cursor-pointer"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>

          <div className="p-5 sm:p-6 space-y-8">
            
            {/* TERMINAL STATUS (Cancelled / RTO) */}
            {isTerminal ? (
              <div className="p-6 rounded-xl bg-gray-50 border border-gray-200/80 text-center max-w-md mx-auto">
                <div className="w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-3 bg-white shadow-xs border border-gray-100">
                  {isCancelled ? (
                    <XCircle className="w-6 h-6 text-red-500" />
                  ) : (
                    <RotateCcw className="w-6 h-6 text-amber-500" />
                  )}
                </div>
                <h3 className="text-base font-bold text-gray-800">
                  {isCancelled ? 'Order Cancelled' : 'Returned To Origin (RTO)'}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  {isCancelled
                    ? `This order was cancelled on ${order.timestamps?.cancelled_at ? new Date(order.timestamps.cancelled_at).toLocaleDateString("en-IN") : 'N/A'}.`
                    : `This shipment was returned on ${order.timestamps?.returned_at ? new Date(order.timestamps.returned_at).toLocaleDateString("en-IN") : 'N/A'}.`
                  }
                </p>
              </div>
            ) : (
              
              /* TIMELINE TRACKER */
              <div className="py-2">
                
                {/* Horizontal Stepper (Desktop & Tablet) */}
                <div className="hidden sm:grid grid-cols-4 relative">
                  
                  {/* Background Track Line (Strictly starts at 1st circle center & ends at last circle center) */}
                  <div className="absolute top-4 left-[12.5%] right-[12.5%] h-0.5 bg-gray-200 -z-0" />
                  
                  {/* Active Progress Line */}
                  <div 
                    className="absolute top-4 left-[12.5%] h-0.5 bg-amber-500 transition-all duration-300 -z-0"
                    style={{ width: `${(activeStep / (STEPS.length - 1)) * 75}%` }}
                  />

                  {STEPS.map((step, idx) => {
                    const isCompleted = activeStep >= idx;
                    const IconComponent = step.icon;

                    let timeStamp = null;
                    if (step.key === 'confirmed' && order.timestamps?.confirmed_at) timeStamp = order.timestamps.confirmed_at;
                    if (step.key === 'packed' && order.timestamps?.packed_at) timeStamp = order.timestamps.packed_at;
                    if (step.key === 'shipped' && order.timestamps?.shipped_at) timeStamp = order.timestamps.shipped_at;
                    if (step.key === 'delivered' && order.timestamps?.delivered_at) timeStamp = order.timestamps.delivered_at;

                    return (
                      <div key={step.key} className="flex flex-col items-center text-center relative z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                          isCompleted 
                            ? 'bg-amber-600 text-white shadow-xs' 
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        
                        <p className={`text-xs font-semibold mt-2.5 ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.label}
                        </p>
                        
                        {timeStamp && (
                          <span className="text-[10px] text-gray-400 mt-0.5">
                            {new Date(timeStamp).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Vertical Stepper (Mobile Screens) */}
                <div className="sm:hidden space-y-6 relative pl-2">
                  
                  {/* Background Line */}
                  <div className="absolute left-[19px] top-4 bottom-4 w-0.5 bg-gray-200 -z-0" />
                  
                  {/* Active Line */}
                  <div 
                    className="absolute left-[19px] top-4 w-0.5 bg-amber-500 transition-all duration-300 -z-0"
                    style={{ height: `${(activeStep / (STEPS.length - 1)) * 100}%` }}
                  />

                  {STEPS.map((step, idx) => {
                    const isCompleted = activeStep >= idx;
                    const IconComponent = step.icon;

                    let timeStamp = null;
                    if (step.key === 'confirmed' && order.timestamps?.confirmed_at) timeStamp = order.timestamps.confirmed_at;
                    if (step.key === 'packed' && order.timestamps?.packed_at) timeStamp = order.timestamps.packed_at;
                    if (step.key === 'shipped' && order.timestamps?.shipped_at) timeStamp = order.timestamps.shipped_at;
                    if (step.key === 'delivered' && order.timestamps?.delivered_at) timeStamp = order.timestamps.delivered_at;

                    return (
                      <div key={step.key} className="flex items-start gap-3.5 relative z-10">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isCompleted 
                            ? 'bg-amber-600 text-white shadow-xs' 
                            : 'bg-white border-2 border-gray-300 text-gray-400'
                        }`}>
                          <IconComponent className="w-3.5 h-3.5" />
                        </div>
                        <div className="pt-0.5">
                          <p className={`text-xs font-semibold ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </p>
                          {timeStamp && (
                            <p className="text-[10px] text-gray-400">
                              {new Date(timeStamp).toLocaleDateString("en-IN", { month: 'short', day: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            )}

            {/* PRODUCT LIST SECTION (Strictly Image & Name Only) */}
            <div className="pt-5 border-t border-gray-100 space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Items In This Shipment ({items.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.length > 0 ? (
                  items.map((item, idx) => {
                    const image = item.image || item.product?.images?.[0] || null;
                    const name = item.name || item.product?.name || 'Product';

                    return (
                      <div 
                        key={idx} 
                        className="flex items-center gap-3 p-2.5 rounded-lg border border-gray-100 bg-white hover:border-gray-200 transition"
                      >
                        {/* Image */}
                        <div className="w-11 h-11 rounded-md bg-gray-50 border border-gray-100 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          {image ? (
                            <img src={image} alt={name} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-5 h-5 text-gray-300" />
                          )}
                        </div>

                        {/* Name Only */}
                        <p className="text-xs font-medium text-gray-800 line-clamp-2 leading-relaxed">
                          {name}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-xs text-gray-400">No products available.</p>
                )}
              </div>
            </div>

            {/* MINIMAL FOOTER SUMMARY */}
            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between text-xs text-gray-500 gap-2">
              <div>
                Payment: <span className="font-semibold text-gray-700 uppercase">{order.payment?.mode || order.payment?.method || 'Online'}</span>
              </div>
              <div>
                Total: <span className="font-bold text-gray-900">₹{parseFloat(order.pricing?.total_amount || order.total || 0).toFixed(2)}</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default TrackMyOrderPage;