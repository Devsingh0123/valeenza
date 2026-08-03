import { configureStore } from "@reduxjs/toolkit";
import cartReducer from "./slices/cartSlice";
import userAuthReducer from "./slices/userAuthSlice";
import bannerReducer from "./slices/bannerSlice";
import productReducer from "./slices/productSlice";
import orderReducer from "./slices/orderSlice";
import couponReducer from "./slices/couponSlice";
import addressReducer from "./slices/addressSlice";
import walletReducer from "./slices/walletSlice";
import reviewReducer from "./slices/reviewSlice";
import wishlistReducer from "./slices/wishlistSlice";
import paymentReducer from "./slices/paymentSlice";
import extraCheckoutChargeReducer from "./slices/extraCheckoutChargeSlice";
import affiliateReducer from "./slices/affiliateSlice";

// import cartApiReducer from './slices/cartSlice';
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    cart: cartReducer,
    userAuth: userAuthReducer,
    banner: bannerReducer,
    product: productReducer,
    // cartApi: cartApiReducer,
    order: orderReducer,
    ui: uiReducer,
    coupon: couponReducer,
    address: addressReducer,
    wallet: walletReducer,
    review: reviewReducer,
    wishlist: wishlistReducer,
    payment: paymentReducer,
    extraCheckoutCharge: extraCheckoutChargeReducer,
    affiliate: affiliateReducer,
  },
  // for reduxdevtools
  devTools: {
    trace: true,        
    traceLimit: 25    
  }
});
