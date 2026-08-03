import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios"; // Ya jo bhi aapka api/axios instance config ho
import { api } from "../baseApi";

// =========================================================================
// 1. THUNK: Delivery Charge Calculate Karna (POST Request)
// =========================================================================
// Is thunk ko hum ek object bhejenge jisme address_id aur coupon_code dono honge
export const calculateDeliveryCharge = createAsyncThunk(
  "extraCheckoutCharge/calculateDeliveryCharge",
  async ({ address_id,coupon_code }, { rejectWithValue }) => {
    try {
      // Aapke reference ke hisab se POST call ho rahi hai yahan
      const response = await api.post("/store/calculate-summary", { 
        address_id,
        coupon_code, 
      });

      if (response?.data?.status) {
        // Reference ke mutabik breakdown.delivery_charge return kar rahe hain
        return response?.data?.breakdown?.delivery_charge; 
      }
      return 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Delivery charge calculation failed");
    }
  }
);

// =========================================================================
// 2. THUNK: COD Charge Calculate Karna (GET Request)
// =========================================================================
// Is thunk ko hum sirf address_id bhejenge
export const calculateCodCharge = createAsyncThunk(
  "extraCheckoutCharge/calculateCodCharge",
  async ({address_id}, { rejectWithValue }) => {
    try {
      // Aapke reference ke hisab se yeh GET request hai parameters ke sath
      const response = await api.get("/store/cod-charge", { 
        address_id,
      });

      if (response?.data?.status) {
        // Reference ke mutabik direct data.cod_charge return kar rahe hain
        return response?.data?.cod_charge;
      }
      return 0;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "COD charge calculation failed");
    }
  }
);

const extraCheckoutChargeSlice = createSlice({
  name: "extraCheckoutCharge",
  initialState: {
    deliveryCharge: 0,
    codCharge: 0,
    isDeliveryLoading: false,
    isCodLoading: false,
    error: null,
  },
  reducers: {
    // Jab user checkout se bahar jaye ya clear karna ho sab kuch
    resetCheckout: (state) => {
      state.deliveryCharge = 0;
      state.codCharge = 0;
      state.error = null;
    },
    // Jab user COD se hatkar Online Payment select kare toh sirf ise call karo
    clearCodCharge: (state) => {
      state.codCharge = 0;
    },
    // Agar address unselect ho jaye toh ise call karo
    clearDeliveryCharge: (state) => {
      state.deliveryCharge = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Delivery Charge Handlers ---
      .addCase(calculateDeliveryCharge.pending, (state) => { 
        state.isDeliveryLoading = true; 
        state.error = null;
      })
      .addCase(calculateDeliveryCharge.fulfilled, (state, action) => {
        state.isDeliveryLoading = false;
        // Thunk ne direct number return kiya hai, isliye action.payload hi direct charge hai
        state.deliveryCharge = action.payload; 
      })
      .addCase(calculateDeliveryCharge.rejected, (state, action) => {
        state.isDeliveryLoading = false;
        state.error = action.payload;
        state.deliveryCharge = 0;
      })
      
      // --- COD Charge Handlers ---
      .addCase(calculateCodCharge.pending, (state) => { 
        state.isCodLoading = true; 
        state.error = null;
      })
      .addCase(calculateCodCharge.fulfilled, (state, action) => {
        state.isCodLoading = false;
        // Thunk ne direct number return kiya hai, isliye action.payload hi direct charge hai
        state.codCharge = action.payload;
      })
      .addCase(calculateCodCharge.rejected, (state, action) => {
        state.isCodLoading = false;
        state.error = action.payload;
        state.deliveryCharge = 0;
      });
  },
});

export const { resetCheckout, clearCodCharge, clearDeliveryCharge } = extraCheckoutChargeSlice.actions;
export default extraCheckoutChargeSlice.reducer;