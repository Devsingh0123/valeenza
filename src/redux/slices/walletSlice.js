// src/redux/slices/walletSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../baseApi';

// ---------- Fetch wallet balance ----------
export const fetchWallet = createAsyncThunk(
  'wallet/fetchWallet',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/store-wallet');
      // console.log("wallet fetch", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wallet');
    }
  }
);

// ---------- Fetch transaction history (all) ----------
export const fetchWalletHistory = createAsyncThunk(
  'wallet/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/store-wallet/history');
      // console.log("wallet history", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch history');
    }
  }
);

// ---------- Fetch wallet summary ----------
export const fetchWalletSummary = createAsyncThunk(
  'wallet/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/store-wallet/summary');
      // console.log("wallet summary", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

// ---------- NEW: Fetch spend history (only debits) ----------
export const fetchSpendHistory = createAsyncThunk(
  'wallet/fetchSpendHistory',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/store-wallet/spend-history');
      // console.log("spend history", response.data.data);
      return response.data.data; // expects array of spend transactions
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch spend history');
    }
  }
);

// ---------- Create order for adding money ----------
export const createOrder = createAsyncThunk(
  'wallet/createOrder',
  async (amount, { rejectWithValue }) => {
    try {
      const response = await api.post('/wallet/topup/create-order', { amount });
      // console.log("add money to wallet", response.data.data);
      return response.data; // { order_id, amount, currency? }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order');
    }
  }
);

// ---------- Verify payment after successful transaction ----------
export const verifyPayment = createAsyncThunk(
  'wallet/verifyPayment',
  async ({ paymentData, amount }, { rejectWithValue, dispatch }) => {
    try {
      const response = await api.post('/wallet/topup/verify', {
        ...paymentData,
        amount,
      });
      await dispatch(fetchWallet());
      // console.log("verify wallet", response.data.data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Payment verification failed');
    }
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState: {
    balance: 0,
    transactions: [],      // all transactions (credits + debits)
    summary: null,         // summary data
    spendHistory: [],      // only spend/debit transactions
    loading: false,
    error: null,
  },
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchWallet
      .addCase(fetchWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.balance ?? action.payload?.data?.balance ?? 0;
      })
      .addCase(fetchWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchWalletHistory
      .addCase(fetchWalletHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.data ?? action.payload;
      })
      .addCase(fetchWalletHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchWalletSummary
      .addCase(fetchWalletSummary.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletSummary.fulfilled, (state, action) => {
        state.loading = false;
        state.summary = action.payload;
      })
      .addCase(fetchWalletSummary.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // fetchSpendHistory (new)
      .addCase(fetchSpendHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSpendHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.spendHistory = action.payload.data ?? action.payload;
      })
      .addCase(fetchSpendHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // createOrder
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // verifyPayment
      .addCase(verifyPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyPayment.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(verifyPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearWalletError } = walletSlice.actions;
export default walletSlice.reducer;