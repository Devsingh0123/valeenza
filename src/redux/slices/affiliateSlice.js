// src/redux/slices/affiliateSlice.js
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../baseApi";

export const affiliateRegister = createAsyncThunk(
  "affiliate/register",
  async (data, { rejectWithValue }) => {
    try {
      const response = await api.post("/affiliate/register", data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Registration failed");
    }
  }
);

const affiliateSlice = createSlice({
  name: "affiliate",
  initialState: { loading: false, error: null, success: false },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(affiliateRegister.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(affiliateRegister.fulfilled, (state) => { state.loading = false; state.success = true; })
      .addCase(affiliateRegister.rejected, (state, action) => { state.loading = false; state.error = action.payload; });
  },
});

export default affiliateSlice.reducer;