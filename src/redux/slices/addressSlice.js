import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../baseApi";

// Fetch all addresses
export const fetchAddresses = createAsyncThunk(
  "address/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/user/addresses");
      // console.log("view address", response.data.data);
      return response.data.data; // assuming API returns { data: [...] }
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch addresses",
      );
    }
  },
);

export const addAddress = createAsyncThunk(
  "address/add",
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/addresses", addressData, {
        headers: { "Content-Type": "application/json" },
      });
      // console.log("add address", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add address",
      );
    }
  },
);

export const updateAddress = createAsyncThunk(
  "address/update",
  async ({ id, addressData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/user/addresses/${id}`, addressData, {
        headers: { "Content-Type": "application/json" },
      });
      // console.log("update address", response.data.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update address",
      );
    }
  },
);

// Delete an address
export const deleteAddress = createAsyncThunk(
  "address/delete",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/user/addresses/${id}`);
      // console.log("delete address", response.data);
      return id; // return the deleted id to remove from state
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete address",
      );
    }
  },
);

// Fetch pincode details
export const fetchPincodeDetails = createAsyncThunk(
  "address/fetchPincode",
  async (pincode, { rejectWithValue }) => {
    try {
      const response = await api.post("/user/get-pincode-data", { pincode });
      // console.log("Pincode API response:", response.data);
      return response.data; // full response data
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
      state.selectedAddressId = action.payload; // payload = address id
    },
    setSelectedAddress: (state, action) => {
    // action.payload is the full address object
    state.selectedAddress = action.payload;
   
  },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAddresses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload;
      })
      .addCase(fetchAddresses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        if (action.payload.length === 0) {
          state.selectedAddressId = null;
        }
      })
      // Add
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses.push(action.payload);
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update
      .addCase(updateAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.addresses.findIndex(
          (addr) => addr.id === action.payload.id,
        );
        if (index !== -1) state.addresses[index] = action.payload;
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete
      .addCase(deleteAddress.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        const deletedId = action.payload;
        state.addresses = state.addresses.filter(
          (addr) => addr.id !== action.payload,
        );
        if (state.selectedAddressId === deletedId) {
          state.selectedAddressId = null;
        }
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // inside extraReducers builder
      .addCase(fetchPincodeDetails.pending, (state) => {
        state.loading = true; // optional, you can have separate loading state
      })
      .addCase(fetchPincodeDetails.fulfilled, (state, action) => {
        state.loading = false;
        // You can store pincode data in a separate state if needed
        // console.log("Pincode fulfilled data:", action.payload);
      })
      .addCase(fetchPincodeDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error("Pincode rejected:", action.payload);
      });
  },
});

export const { clearAddressError, setSelectedAddress , setSelectedAddressId} = addressSlice.actions;
export default addressSlice.reducer;
