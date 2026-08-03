// src/redux/slices/paymentSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../baseApi";

// ==========================================
// ---------- ASYNC THUNKS (PAYMENT) ----------
// ==========================================

// 1. Standard COD Order Creation
export const createStandardCodOrder = createAsyncThunk(
  "payment/createStandardCodOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/store/cod/create-order", payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "COD order failed");
    }
  }
);

// 2. COD with Advance Payment Setup (coddd)
export const createAdvanceCodOrder = createAsyncThunk(
  "payment/createAdvanceCodOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/store/cod/create-order", payload);
      console.log(data)
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Advance order creation failed");
    }
  }
);

// 3. Verify COD Advance Payment
export const verifyAdvanceCodPayment = createAsyncThunk(
  "payment/verifyAdvanceCodPayment",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/store/cod/verify-payment", payload);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Advance payment verification failed");
    }
  }
);

// 4. Standard Online Order Initiation
export const createOnlineOrder = createAsyncThunk(
  "payment/createOnlineOrder",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/store/create-order", payload);
      // console.log("create-order ",data)
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Online order initiation failed");
    }
  }
);

// 5. Verify Online Gateway Payment (Handles regular & wallet-only cases)
export const verifyOnlinePayment = createAsyncThunk(
  "payment/verifyOnlinePayment",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/store/verify-payment", payload);
      // console.log("verify-payment",data)
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Online payment verification failed");
    }
  }
);

// ==========================================
// ---------- INITIAL STATE ----------
// ==========================================
const initialState = {
  // Zero-Props Checkout Architecture
  selectedPaymentMethod: "online", 
  deliveryCharge: 0,
  codCharge: 49,
  grandTotal: 0,
  
  loading: false,
  error: null,
  paymentSuccess: false,
};

// ==========================================
// ---------- SLICE CONFIGURATION ----------
// ==========================================
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    setPaymentMethod: (state, action) => {
      state.selectedPaymentMethod = action.payload;
    },

    updateCheckoutAmounts: (state, action) => {
      const { grandTotal, deliveryCharge, codCharge } = action.payload;
      if (grandTotal !== undefined) state.grandTotal = grandTotal;
      if (deliveryCharge !== undefined) state.deliveryCharge = deliveryCharge;
      if (codCharge !== undefined) state.codCharge = codCharge;
    },
    clearPaymentError: (state) => {
      state.error = null;
    },
    resetPaymentState: (state) => {
      state.selectedPaymentMethod = "online";
      state.loading = false;
      state.error = null;
      state.paymentSuccess = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // 1. Create Standard COD Order
      .addCase(createStandardCodOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(createStandardCodOrder.fulfilled, (state) => {
        state.loading = false;
        state.paymentSuccess = true;
      })
      .addCase(createStandardCodOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paymentSuccess = false;
      })

      // 2. Create Advance COD Order (coddd)
      .addCase(createAdvanceCodOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdvanceCodOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createAdvanceCodOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 3. Verify COD Advance Payment
      .addCase(verifyAdvanceCodPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(verifyAdvanceCodPayment.fulfilled, (state) => {
        state.loading = false;
        state.paymentSuccess = true;
      })
      .addCase(verifyAdvanceCodPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paymentSuccess = false;
      })

      // 4. Create Online Order
      .addCase(createOnlineOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOnlineOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createOnlineOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // 5. Verify Online Payment
      .addCase(verifyOnlinePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.paymentSuccess = false;
      })
      .addCase(verifyOnlinePayment.fulfilled, (state) => {
        state.loading = false;
        state.paymentSuccess = true;
      })
      .addCase(verifyOnlinePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.paymentSuccess = false;
      });
  },
});

export const { 
  setPaymentMethod, 
  setCheckoutAddress, 
  updateCheckoutAmounts, 
  clearPaymentError, 
  resetPaymentState 
} = paymentSlice.actions;

export default paymentSlice.reducer;