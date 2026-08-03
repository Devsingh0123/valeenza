// redux/slices/uiSlice.js
import { createSlice } from "@reduxjs/toolkit";

const uiSlice = createSlice({
  name: "ui",
  initialState: {
    isLoginModalOpen: false,
    isCartDrawerOpen: false,
    isCheckoutOpen: false,
  },
  reducers: {
    // for login/signup pop-up
    openLoginModal: (state) => {
      state.isLoginModalOpen = true;
    },
    closeLoginModal: (state) => {
      state.isLoginModalOpen = false;
    },
    // for cart side drawer
    openCartDrawer: (state) => {
      state.isCartDrawerOpen = true;
    },

    closeCartDrawer: (state) => {
      state.isCartDrawerOpen = false;
    },
// for checkout pop-up
    openCheckout: (state) => {
      state.isCheckoutOpen = true;
    },

    closeCheckout: (state) => {
      state.isCheckoutOpen = false;
    },
  },
});

export const {
  openLoginModal,
  closeLoginModal,
  openCartDrawer,
  closeCartDrawer,
  openCheckout,
  closeCheckout,
} = uiSlice.actions;
export default uiSlice.reducer;
