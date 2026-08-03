import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../baseApi";

// ---------- THUNKS ----------
export const fetchWishlist = createAsyncThunk(
  "wishlist/fetchAll",
  async (_, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue("Please login to view wishlist");
    }
    try {
      const response = await api.get("/user/wishlist");
      return response.data.data; // assuming array of wishlist items
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch wishlist",
      );
    }
  },
);

export const addToWishlist = createAsyncThunk(
  "wishlist/add",
  async ({ product_id }, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue("Please login to add to wishlist");
    }
    try {
      const response = await api.post("/user/wishlist/add", { product_id });
      // API might return the updated wishlist item or success message
      return response.data.data; // could be the added item or updated wishlist
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to wishlist",
      );
    }
  },
);

export const removeFromWishlist = createAsyncThunk(
  "wishlist/remove",
  async ({ product_id }, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue("Please login to remove from wishlist");
    }
    try {
      const response = await api.post("/user/wishlist/remove", { product_id });
      // On success, return the product_id to remove from local state
      return { product_id };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from wishlist",
      );
    }
  },
);

// ---------- INITIAL STATE ----------
const initialState = {
  items: [], // array of wishlist items
  loading: false,
  error: null,
};

// ---------- SLICE ----------
const wishlistSlice = createSlice({
  name: "wishlist",
  initialState,
  reducers: {
    clearWishlistError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // addToWishlist
      .addCase(addToWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // If the API returns the added item, push it to the list
        if (action.payload && action.payload.id) {
          state.items.push(action.payload);
        } else {
          // Otherwise, we need to refetch (or handle accordingly)
          // We'll just mark success and let user refetch if needed
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // removeFromWishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.loading = false;
        // console.log('Full state before removal:', ...state);
        // console.log('Items before removal:', ...state.items);
        // Remove item by product_id from the local state
        state.items = state.items.filter(
          (item) => item.id !== action.payload.product_id,
        );
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWishlistError } = wishlistSlice.actions;
export default wishlistSlice.reducer;
