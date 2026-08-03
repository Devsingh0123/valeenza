import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// Fetch reviews for a specific product by product id
export const fetchProductReviews = createAsyncThunk(
  'review/fetchProductReviews',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`);
      // console.log("all reviews",response.data.data)
      return response.data.data; // array of reviews
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// Submit a new review by product id
export const submitReview = createAsyncThunk(
  'review/submitReview',
  async ({ product_id, rating, review }, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to submit a review');
    }
    try {
      const response = await api.post('/user/review', {
        product_id,
        rating,
        review,   // this matches the API field name
      });
      return response.data.data; // the new review
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);


// Fetch reviews for a specific product by product Category
export const fetchProductReviewsByCategory = createAsyncThunk(
  'review/fetchProductReviewsByCategory',
  async (catId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/categories/${catId}/reviews`);
      // console.log("all reviews",response.data.data)
      return response.data.data; // array of reviews
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reviews');
    }
  }
);

// Submit a new review by product Category
export const submitReviewByCategory = createAsyncThunk(
  'review/submitReviewByCategory',
  async ({ catId, rating, review }, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue('Please login to submit a review');
    }
    try {
      const response = await api.post('/user/category-review', {
        category:catId,
        rating,
        review,   // this matches the API field name
      });
      return response.data.data; // the new review
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to submit review');
    }
  }
);





const initialState = {
  reviews: [],        // for the current product view
  loading: false,
  error: null,
  submitLoading: false,
  submitError: null,
};

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearReviewError: (state) => {
      state.error = null;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetch product reviews
      .addCase(fetchProductReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchProductReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // submit review
      .addCase(submitReview.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(submitReview.fulfilled, (state, action) => {
        state.submitLoading = false;
        // prepend new review to the list
        state.reviews = [action.payload, ...state.reviews];
      })
      .addCase(submitReview.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
       // fetch product reviews by category
      .addCase(fetchProductReviewsByCategory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductReviewsByCategory.fulfilled, (state, action) => {
        state.loading = false;
        state.reviews = action.payload;
      })
      .addCase(fetchProductReviewsByCategory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // submit review by category
      .addCase(submitReviewByCategory.pending, (state) => {
        state.submitLoading = true;
        state.submitError = null;
      })
      .addCase(submitReviewByCategory.fulfilled, (state, action) => {
        state.submitLoading = false;
        // prepend new review to the list
        state.reviews = [action.payload, ...state.reviews];
      })
      .addCase(submitReviewByCategory.rejected, (state, action) => {
        state.submitLoading = false;
        state.submitError = action.payload;
      })
  },
});

export const { clearReviewError } = reviewSlice.actions;
export default reviewSlice.reducer;