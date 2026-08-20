import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { api } from "../baseApi";

export const searchProducts = createAsyncThunk(
  "search/searchProducts",
  async (query, { rejectWithValue }) => {
    try {
      const { data } = await api.get(`/v1/search?q=${encodeURIComponent(query)}`,
      );

      // Agar API response ka structure alag ho to yaha change kar dena
      console.log("search",data)
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Search failed");
    }
  },
);

const initialState = {
  results: [],
  loading: false,
  error: null,
};

const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    clearSearch(state) {
      state.results = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(searchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(searchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload;
      })

      .addCase(searchProducts.rejected, (state, action) => {
        state.loading = false;
        state.results = [];
        state.error = action.payload;
      });
  },
});

export const { clearSearch } = searchSlice.actions;

export default searchSlice.reducer;
