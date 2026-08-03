import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../baseApi";

// Fetch all active coupons
export const fetchCoupons = createAsyncThunk(
  "coupon/fetchCoupons",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/coupons");
      return response.data.data; // array of coupons
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch coupons",
      );
    }
  },
);

// Validate a single coupon by code
export const validateCoupon = createAsyncThunk(
  "coupon/validate",
  async (code, { rejectWithValue }) => {
    try {
      const response = await api.get(`/coupons?code=${code}`);
      return response.data.data; // returns the coupon object if valid
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Invalid coupon");
    }
  },
);

const couponSlice = createSlice({
  name: "coupon",
  initialState: {
    list: [],
    appliedCoupon: null, // Currently applied coupon
    couponDiscount: 0, // Discount amount from applied coupon
    loading: false,
    error: null,
  },
  reducers: {
    setAppliedCoupon: (state, action) => {
      state.appliedCoupon = action.payload.coupon;
      state.couponDiscount = action.payload.discount;
    },
    clearAppliedCoupon: (state) => {
      state.appliedCoupon = null;
      state.couponDiscount = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoupons.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCoupons.fulfilled, (state, action) => {
        state.list = action.payload;
        state.loading = false;
      })
      .addCase(fetchCoupons.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});
export const { setAppliedCoupon, clearAppliedCoupon } = couponSlice.actions;
export default couponSlice.reducer;
