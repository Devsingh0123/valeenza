import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../baseApi";

/**
 * Fetch all saved addresses
 */
export const fetchAddresses = createAsyncThunk(
  "address/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/addresses");

      return response.data?.data ?? [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch addresses",
      );
    }
  },
);

/**
 * Add new address
 */
export const addAddress = createAsyncThunk(
  "address/add",
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/addresses", addressData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add address",
      );
    }
  },
);

/**
 * Update existing address
 */
export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/user/addresses/${id}`, addressData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      return response.data?.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update address",
      );
    }
  },
);

/**
 * Delete address
 */
export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/user/addresses/${id}`);

      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete address",
      );
    }
  },
);

/**
 * Fetch pincode details
 *
 * API:
 * POST /user/get-pincode-data
 *
 * Body:
 * {
 *   pincode: "35143"
 * }
 */
export const fetchPincodeDetails = createAsyncThunk(
  "address/fetchPincode",
  async (pincode, { rejectWithValue }) => {
    try {
      const cleanPincode = String(pincode || "")
        .replace(/\D/g, "")
        .slice(0, 5);

      if (cleanPincode.length !== 5) {
        return rejectWithValue("Please enter a valid 5-digit pincode.");
      }

      const response = await api.post(
        "/get-pincode-data",
        {
          pincode: cleanPincode,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch pincode data",
      );
    }
  },
);

const initialState = {
  addresses: [],
  selectedAddressId: null,
  selectedAddress: null,

  // Address API loading only
  loading: false,

  error: null,
};

const addressSlice = createSlice({
  name: "address",
  initialState,

  reducers: {
    clearAddressError: (state) => {
      state.error = null;
    },

    setSelectedAddressId: (state, action) => {
      state.selectedAddressId = action.payload;
    },

    setSelectedAddress: (state, action) => {
      state.selectedAddress = action.payload;
    },

    clearSelectedAddress: (state) => {
      state.selectedAddressId = null;
      state.selectedAddress = null;
    },
  },

  extraReducers: (builder) => {
    builder

      // =========================================================
      // FETCH ADDRESSES
      // =========================================================
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = Array.isArray(action.payload) ? action.payload : [];

        // Keep selected address valid
        if (
          state.selectedAddressId &&
          !state.addresses.some(
            (address) => Number(address.id) === Number(state.selectedAddressId),
          )
        ) {
          state.selectedAddressId = null;
          state.selectedAddress = null;
        }
      })

      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to fetch addresses";
      })

      // =========================================================
      // ADD ADDRESS
      // =========================================================
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;

        if (action.payload) {
          state.addresses.push(action.payload);
        }
      })

      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to add address";
      })

      // =========================================================
      // UPDATE ADDRESS
      // =========================================================
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;

        if (!action.payload?.id) {
          return;
        }

        const index = state.addresses.findIndex(
          (address) => Number(address.id) === Number(action.payload.id),
        );

        if (index !== -1) {
          state.addresses[index] = action.payload;
        }

        if (Number(state.selectedAddressId) === Number(action.payload.id)) {
          state.selectedAddress = action.payload;
        }
      })

      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to update address";
      })

      // =========================================================
      // DELETE ADDRESS
      // =========================================================
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;

        const deletedId = action.payload;

        state.addresses = state.addresses.filter(
          (address) => Number(address.id) !== Number(deletedId),
        );

        if (Number(state.selectedAddressId) === Number(deletedId)) {
          state.selectedAddressId = null;
          state.selectedAddress = null;
        }
      })

      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Failed to delete address";
      })

      // =========================================================
      // PINCODE
      // =========================================================
      // IMPORTANT:
      // Pincode loading is handled locally inside the components.
      // Therefore it does NOT modify state.loading.
      .addCase(fetchPincodeDetails.rejected, (state, action) => {
        state.error = action.payload || "Failed to fetch pincode data";
      });
  },
});

export const {
  clearAddressError,
  setSelectedAddress,
  setSelectedAddressId,
  clearSelectedAddress,
} = addressSlice.actions;

export default addressSlice.reducer;
