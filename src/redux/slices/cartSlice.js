import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../baseApi";

// ==================== HELPER FUNCTIONS FOR GUEST CART ====================
// These functions handle cart storage for non-logged-in users using localStorage

//  Get guest cart items from localStorage

const getGuestCart = () => {
  const cart = localStorage.getItem("guestCart");
  return cart ? JSON.parse(cart) : [];
};

// Save guest cart items to localStorage

const saveGuestCart = (items) => {
  localStorage.setItem("guestCart", JSON.stringify(items));
};

// Clear guest cart from localStorage (called after user logs in and merge is done)

const clearGuestCart = () => {
  localStorage.removeItem("guestCart");
};
// Remove specific item from guest cart by its unique id
const removeGuestCartItem = (itemId) => {
  const guestCart = getGuestCart();
  const filtered = guestCart.filter((item) => {
    const id = `guest_${item.product_id}_${item.ratti || ""}`;
    return id !== itemId;
  });
  saveGuestCart(filtered);
};

const updateGuestCartItem = (itemId, newQuantity) => {
  const guestCart = getGuestCart();
  const updated = guestCart.map((item) => {
    // Generate the ID the same way it was created in addToCart
    const id = `guest_${item.product_id}_${item.ratti || ""}`;
    if (id === itemId) {
      return { ...item, quantity: newQuantity };
    }
    return item;
  });
  saveGuestCart(updated);
};

// ==================== ASYNC THUNKS ====================

/**
 * FETCH CART - Get cart items (supports both guest and logged-in users)
 * - Guest user: Loads from localStorage
 * - Logged-in user: Fetches from API
 */
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { rejectWithValue, getState }) => {
    const { userAuth } = getState();

    //  GUEST USER - Load from localStorage
    if (!userAuth.isLoggedIn) {
      try {
        const guestCart = getGuestCart();
        return { items: guestCart, isGuest: true };
      } catch (error) {
        return rejectWithValue("Failed to load guest cart");
      }
    }

    //  LOGGED IN USER - Fetch from API
    try {
      const response = await api.get("/user/cart");
      // console.log("fetchcart", response.data.data);
      return { items: response.data.data.items, isGuest: false };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch cart",
      );
    }
  },
);

/**
 * ADD TO CART - Add product to cart (supports both guest and logged-in users)
 * - Guest user: Saves to localStorage
 * - Logged-in user: Sends API request
 */
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (
    { product_id, quantity = 1, ratti = null, name, price, image,stockAvilable },
    { rejectWithValue, getState },
  ) => {
    const { userAuth } = getState();

    // 🔥 GUEST USER - Save to localStorage (no login required)
    if (!userAuth.isLoggedIn) {
      try {
        const guestCart = getGuestCart();

        // Check if product already exists in guest cart
        const existingIndex = guestCart.findIndex(
          (item) => item.product_id === product_id && item.ratti === ratti,
        );

        if (existingIndex !== -1) {
          // Product exists -> increase quantity
          guestCart[existingIndex].quantity += quantity;
        } else {
          // New product -> add to cart
          guestCart.push({
            product_id,
            quantity,
            ratti,
            name,
            price,
            image,
            stockAvilable,
            item_id: `guest_${product_id}_${ratti || ""}`,
            addedAt: Date.now(),
          });
        }

        saveGuestCart(guestCart);
        return { success: true, isGuest: true };
      } catch (error) {
        return rejectWithValue("Failed to add to guest cart");
      }
    }

    // 🔥 LOGGED IN USER - API call
    try {
      const payload = { product_id, quantity };
      if (ratti) payload.ratti = ratti;
      await api.post("/user/cart/add", payload);
      return { success: true, isGuest: false };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to add to cart",
      );
    }
  },
);

/**
 * UPDATE CART ITEM - Update quantity of existing cart item
 * Only for logged-in users (guest carts are updated via addToCart)
 */
export const updateCartItem = createAsyncThunk(
  "cart/updateCartItem",
  async ({ item_id, quantity }, { rejectWithValue, getState }) => {
    const { userAuth } = getState();

    // GUEST USER – update localStorage
    if (!userAuth.isLoggedIn) {
      try {
        updateGuestCartItem(item_id, quantity);
        return { success: true, isGuest: true };
      } catch (error) {
        console.error("Update guest cart error:", error);
        return rejectWithValue("Failed to update guest cart");
      }
    }

    // LOGGED IN USER – API call
    try {
      await api.post("/user/cart/update", { item_id, quantity });
      return { success: true };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update cart",
      );
    }
  },
);

/**
 * REMOVE FROM CART - Remove item from cart
 * Only for logged-in users (guest carts are updated via localStorage directly)
 */
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (cart_id, { rejectWithValue, getState }) => {
    const { userAuth } = getState();

    //  GUEST USER – remove from localStorage only
    if (!userAuth.isLoggedIn) {
      try {
        removeGuestCartItem(cart_id);
        return { cart_id, isGuest: true };
      } catch (error) {
        return rejectWithValue("Failed to remove from guest cart");
      }
    }

    //  LOGGED IN USER – API call
    try {
      await api.delete(`/user/cart/remove/${cart_id}`);
      return { cart_id, isGuest: false };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove from cart",
      );
    }
  },
);

/**
 * MERGE GUEST CART - Merge localStorage cart with server cart after login
 * Called when user logs in
 */
export const mergeGuestCart = createAsyncThunk(
  "cart/mergeGuestCart",
  async (_, { rejectWithValue, getState }) => {
    const { userAuth } = getState();
    if (!userAuth.isLoggedIn) {
      return rejectWithValue("User not logged in");
    }

    let guestCart = getGuestCart();
    if (guestCart.length === 0) {
      return { success: true, merged: false };
    }

    const errors = []; // will store { message, count }
    const successItems = [];

    for (const item of guestCart) {
      try {
        await api.post("/user/cart/add", {
          product_id: item.product_id,
          quantity: item.quantity,
          ratti: item.ratti,
        });
        successItems.push(item);
      } catch (error) {
        const msg =
          error.response?.data?.message ||
          error.message ||
          "Failed to add item";
        // Group identical errors
        const existing = errors.find((e) => e.message === msg);
        if (existing) {
          existing.count++;
        } else {
          errors.push({ message: msg, count: 1 });
        }
      }
    }

    // Remove successfully merged items from guest cart
    if (successItems.length > 0) {
      const remainingItems = guestCart.filter(
        (item) =>
          !successItems.some(
            (success) =>
              success.product_id === item.product_id &&
              success.ratti === item.ratti,
          ),
      );
      if (remainingItems.length === 0) {
        clearGuestCart();
      } else {
        saveGuestCart(remainingItems);
      }
    }

    // If all items failed, reject with grouped error string
    if (successItems.length === 0) {
      let errorString = "";
      for (const err of errors) {
        if (err.count > 1) {
          errorString += `${err.message} (${err.count} items), `;
        } else {
          errorString += `${err.message}, `;
        }
      }
      errorString = errorString.replace(/, $/, "");
      return rejectWithValue(errorString || "Failed to merge cart");
    }

    // Partial success: return info about errors (grouped)
    const groupedErrors = errors.map((e) =>
      e.count > 1 ? `${e.message} (${e.count} items)` : e.message,
    );
    return {
      success: true,
      merged: true,
      partial: errors.length > 0,
      errors: groupedErrors,
    };
  },
);

// ==================== INITIAL STATE ====================
const initialState = {
  items: [], // Array of cart items
  loading: false, // Loading state for async operations
  error: null, // Error message if any
  isGuestCart: false, // Flag to indicate if current cart is from guest user
 
};

// ==================== SLICE ====================
const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartError: (state) => {
      state.error = null;
    },
    resetCart: () => initialState,
    clearCart: (state) => {
      state.items = [];
      clearGuestCart(); // Also clear guest cart from localStorage
    },
   
  },
  extraReducers: (builder) => {
    builder
      // ========== FETCH CART ==========
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.items || [];
        state.isGuestCart = action.payload.isGuest || false;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========== ADD TO CART ==========
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;

        // ---------- CRITEO ADD TO CART TRACKING (SIRF YEH 6 LINES) ----------
        const { product_id, quantity, name, price } = action.meta.arg;
        if (window.dataLayer) {
          window.dataLayer.push({
            event: "addToCart",
            ecommerce: {
             
              items: [
                {
                  item_id: String(product_id || ""),
                  item_name: name || "",
                  price: Number(price) || 0,
                  quantity: Number(quantity) || 1,
                },
              ],
            },
          });

          console.log("addToCart datalayer", window.dataLayer);
        }
        // If guest cart, update items from localStorage
        if (action.payload?.isGuest) {
          state.items = getGuestCart();
          state.isGuestCart = true;
        }
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========== UPDATE CART ITEM ==========
      .addCase(updateCartItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCartItem.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateCartItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========== REMOVE FROM CART ==========
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        // Remove item from state by item_id
        state.items = state.items.filter(
          (item) => item.item_id !== action.payload.cart_id,
        );
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ========== MERGE GUEST CART ==========
      .addCase(mergeGuestCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(mergeGuestCart.fulfilled, (state) => {
        state.loading = false;
        state.isGuestCart = false;
        // Cart will be refetched by component after merge
      })
      .addCase(mergeGuestCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ==================== EXPORTS ====================
export const {
  clearCartError,
  resetCart,
  clearCart,

} = cartSlice.actions;

export default cartSlice.reducer;
