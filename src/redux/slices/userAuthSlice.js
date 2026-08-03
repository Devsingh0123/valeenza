import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { api } from "../baseApi";
import { success } from "zod";

export const userLogin = createAsyncThunk(
  "user/login",
  async ({mobile, country_code}, thunkApi) => {
    // mobile number as argument
    try {
      const res = await api.post("/user/login", { mobile,country_code });
      // No token returned now, just success
      // console.log("userLOgin", res.data);
      return res.data; // { message: "OTP sent", ... }
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

export const userVerifyLoginOtp = createAsyncThunk(
  "user/verifyLoginOtp",
  async ({ mobile, otp, country_code }, thunkApi) => {
    try {
      const res = await api.post("/user/verify-login-otp", { mobile, otp, country_code});
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("role_id", res.data.user?.role_id);
        return res.data.token;
      }
      return thunkApi.rejectWithValue("Invalid OTP");
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  },
);

export const userRegister = createAsyncThunk(
  "user/register",
  async (data, thunkApi) => {
    try {
      const res = await api.post("/user/register", data);
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);
export const userUpdate = createAsyncThunk(
  "user/updateuser",
  async (data, thunkApi) => {
    try {
      const res = await api.post("/user/update", data);
      // console.log(res.data);
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);
export const userLogout = createAsyncThunk(
  "user/logout",
  async (data, thunkApi) => {
    try {
      const res = await api.post("/user/logout", data);
      // console.log(res.data);
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);
export const userProfile = createAsyncThunk(
  "user/profile",
  async (data, thunkApi) => {
    try {
      const res = await api.get("/user/profile");
      // console.log("user profile", res.data);
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Registration failed",
      );
    }
  },
);

// ========== FORGOT PASSWORD FLOW FOR USER ==========
export const userForgotPasswordRequest = createAsyncThunk(
  "user/forgotPasswordRequest",
  async ({ email, type }, thunkApi) => {
    try {
      const res = await api.post(`/user/forgot-password`, { email, type });
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Failed to send OTP",
      );
    }
  },
);

export const userVerifyOtp = createAsyncThunk(
  "user/verifyOtp",
  async ({ email, otp, type }, thunkApi) => {
    try {
      const res = await api.post(`/user/verify-otp`, { email, otp, type });
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "OTP verification failed",
      );
    }
  },
);

export const userResetPassword = createAsyncThunk(
  "user/resetPassword",
  async ({ email, password, password_confirmation, type }, thunkApi) => {
    try {
      const res = await api.post(`/user/reset-password`, {
        email,
        password,
        password_confirmation,
        type,
      });
      return res.data;
    } catch (error) {
      return thunkApi.rejectWithValue(
        error.response?.data?.message || "Password reset failed",
      );
    }
  },
);

// delete account
export const userDeleteAccount = createAsyncThunk(
  "user/deleteAccount",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.delete("/user/delete");
      // optionally clear local storage
      localStorage.removeItem("token");
      localStorage.removeItem("role_id");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Account deletion failed",
      );
    }
  },
);

const tokenFromStorage = localStorage.getItem("token");

const initialState = {
  user: null,
  userWallet: null,
  token: tokenFromStorage,
  loading: false,
  isLoggedIn: !!tokenFromStorage,
  error: null,
};
const UserAuthSlice = createSlice({
  name: "userAuth",
  initialState,
  reducers: {
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isLoggedIn = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem("token");
    },
  },

  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(userLogin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isLoggedIn = false;
      })
      .addCase(userLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.isLoggedIn = false;
      })
      .addCase(userLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
      })

      //  VERIFY OTP LOGIN
      .addCase(userVerifyLoginOtp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userVerifyLoginOtp.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload; // token from thunk
        state.isLoggedIn = true;
      })
      .addCase(userVerifyLoginOtp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isLoggedIn = false;
      })

      // REGISTER
      .addCase(userRegister.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userRegister.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(userRegister.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // PROFILE

      .addCase(userProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.userWallet = action.payload.wallet;
      })
      .addCase(userProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // update user
      .addCase(userUpdate.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userUpdate.fulfilled, (state, action) => {
        state.loading = false;
      })
      .addCase(userUpdate.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
      })
      // logout user
      .addCase(userLogout.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userLogout.fulfilled, (state) => {
        state.token = null;
        state.user = null;
        state.isLoggedIn = false;
        state.loading = false;
        state.error = null;
        localStorage.removeItem("token");
        localStorage.removeItem("role_id");
      })
      .addCase(userLogout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
      })
      // delete user
      .addCase(userDeleteAccount.pending, (state) => {
        state.loading = true;
      })
      .addCase(userDeleteAccount.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isLoggedIn = false;
      })
      .addCase(userDeleteAccount.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout, clearError } = UserAuthSlice.actions;
export default UserAuthSlice.reducer;
