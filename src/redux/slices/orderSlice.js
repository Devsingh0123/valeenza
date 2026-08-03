// src/redux/slices/orderSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// ---------- THUNKS ----------
// create or place order
export const placeOrder = createAsyncThunk(
  'order/placeOrder',
  async (orderData, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) return rejectWithValue('Please login to place order');
      const response = await api.post('/user/order/place', orderData);
      // console.log("Place order",response.data.data)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to place order');
    }
  }
);
// fetch my all orders
export const fetchMyOrders = createAsyncThunk(
  'order/fetchMyOrders',
  async (_, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) return rejectWithValue('Please login to view orders');
      const response = await api.get('/user/orders');
      // console.log("my orders",response.data.data)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);
// fetch single order details
export const fetchOrderDetails = createAsyncThunk(
  'order/fetchOrderDetails',
  async (orderId, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) return rejectWithValue('Please login to view order details');
      const response = await api.get(`/user/orders/${orderId}`);
      // console.log("fetchOrderDetails",response.data.data)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order details');
    }
  }
);
// mark order delivered currently not in use
export const markOrderDelivered = createAsyncThunk(
  'order/markOrderDelivered',
  async (orderId, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) return rejectWithValue('Please login to update order');
      const response = await api.post(`/order/${orderId}/delivered`);
      return { orderId, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order');
    }
  }
);


// cancel cod order
export const cancelCodOrder = createAsyncThunk(
  'order/cancelCodOrder',
  async ({ orderId, cancel_reason }, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) return rejectWithValue('Please login to cancel order');
      const response = await api.post(`/store/cod/cancel/${orderId}`, { cancel_reason },  {
          headers: {
            'Content-Type': 'application/json', // Force JSON
          },
        });

      // console.log(response)
      if (response.data.status) {
        return { orderId, success: true };
      } else {
        // console.log(response.data)
        return rejectWithValue(response.data.message || 'Failed to cancel COD order');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel COD order');
    }
  }
);
// cancel online or prepaid order
export const cancelOrder = createAsyncThunk(
  'order/cancelOrder',
  async ({ orderId, cancel_reason }, { rejectWithValue, getState }) => {
    try {
      const { userAuth } = getState();
      if (!userAuth.isLoggedIn) return rejectWithValue('Please login to cancel order');
      const response = await api.post(`/store/order/cancel/${orderId}`, { cancel_reason },  {
          headers: {
            'Content-Type': 'application/json', // Force JSON
          },
        });
      // Backend only returns { status: true, message, refund, pricing }
      if (response.data.status) {
        // Return just the orderId – we will refetch details later
        return { orderId, success: true };
      } else {
        return rejectWithValue(response.data.message || 'Failed to cancel order');
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order');
    }
  }
);

// upload invoice to backend
export const uploadInvoice = createAsyncThunk(
  "order/uploadInvoice",
  async ({ order_id, pdf }, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/orders/upload-pdf", {
        order_id: order_id,
        pdf: pdf, // send without the data:application/pdf;base64, prefix
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Invoice upload failed");
    }
  }
);

// ---------- INITIAL STATE ----------
const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  placeOrderSuccess: false,
};

// ---------- SLICE ----------
const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrderError: (state) => {
      state.error = null;
    },
    resetPlaceOrderSuccess: (state) => {
      state.placeOrderSuccess = false;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Place Order
      .addCase(placeOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.placeOrderSuccess = false;
      })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.placeOrderSuccess = true;
        state.currentOrder = action.payload;
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.placeOrderSuccess = false;
      })

      // Fetch My Orders
      .addCase(fetchMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload;
      })
      .addCase(fetchMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Order Details
      .addCase(fetchOrderDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Mark Order Delivered
      .addCase(markOrderDelivered.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markOrderDelivered.fulfilled, (state, action) => {
        state.loading = false;
        const { orderId, data } = action.payload;
        const index = state.orders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          state.orders[index].status = 'delivered';
        }
        if (state.currentOrder?.id === orderId) {
          state.currentOrder.status = 'delivered';
        }
      })
      .addCase(markOrderDelivered.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Cancel Order – we only set loading false and do NOT update currentOrder (will refetch later)
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state) => {
        state.loading = false;
        // No state update here – we will call fetchOrderDetails separately
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(cancelCodOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelCodOrder.fulfilled, (state) => {
        state.loading = false;
        // No state update here – we will call fetchOrderDetails separately
      })
      .addCase(cancelCodOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export const { clearOrderError, resetPlaceOrderSuccess, clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;