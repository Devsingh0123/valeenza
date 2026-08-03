import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../baseApi";

// ---------- THUNKS ----------
export const fetchAllProducts = createAsyncThunk(
  "product/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/products");
      // console.log("all products", res.data.data);
      return res.data.data; // array of products
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch products",
      );
    }
  },
);
// fetch product by id or slug
export const fetchProductByIdorSlug = createAsyncThunk(
  "product/fetchOne",
  async ({id,slug}, { rejectWithValue }) => {
    try {

       const query = slug? `slug=${slug}` : `product_id=${id}`;
      const res = await api.get(`/products?${query}`);
      // API ka structure check karo – agar data array mein aa raha hai to pehla element lo

      console.log(res)
      const product = Array.isArray(res.data.data)
        ? res.data.data[0]
        : res.data.data;
      // console.log("object", product);
      return product;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch product",
      );
    }
  },
);

// ----------PRODUCT CATEGORY THUNKS ----------
export const fetchAllProductCategories = createAsyncThunk(
  "product/fetchAllProductCategories",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get("/categories");
      // console.log("all categories", res.data.data);
      return res.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch categories",
      );
    }
  },
);

export const fetchProductCategoryById = createAsyncThunk(
  "product/fetchProductCategoryById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/categories?id=${id}`);
      const category = Array.isArray(res.data.data)
        ? res.data.data[0]
        : res.data.data;
      // console.log("category", category);
      return category;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch category",
      );
    }
  },
);

// ---------- INITIAL STATE ----------
const initialState = {
  items: [], // all products
  selectedProduct: null, // single product for details page
  productCategories: [],
  selectedProductCategory: null,
  
  loading: true,
  error: null,
  filters: {
    category: "",
    minPrice: "",
    maxPrice: "",
    // aur filters jo bhi ho
  },
};

// ---------- SLICE ----------
const productSlice = createSlice({
  name: "product",
  initialState,
  reducers: {
    // Local filters ke liye (agar UI state alag rakhna ho to)
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearSelectedProduct: (state) => {
      state.selectedProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedProductCategory: (state) => {
      state.selectedProductCategory = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // ---------- FETCH ALL PRODUCTS ----------
      .addCase(fetchAllProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllProducts.fulfilled, (state, action) => {
        state.loading = false;
         if (action.payload && action.payload.length > 0) {
    state.items = action.payload;
  }
      })
      .addCase(fetchAllProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // ---------- FETCH SINGLE PRODUCT ----------
      .addCase(fetchProductByIdorSlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductByIdorSlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductByIdorSlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // ----------PRODUCT CATEGORIES ----------
      .addCase(fetchAllProductCategories.pending, (state) => {
      
        state.error = null;
      })
      .addCase(fetchAllProductCategories.fulfilled, (state, action) => {
       
        state.productCategories = action.payload;
      })
      .addCase(fetchAllProductCategories.rejected, (state, action) => {
        
        state.error = action.payload;
      })
      .addCase(fetchProductCategoryById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProductCategoryById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProductCategory = action.payload;
      })
      .addCase(fetchProductCategoryById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ---------- ACTIONS & REDUCER ----------
export const { setFilters, clearFilters, clearSelectedProduct, clearError } =
  productSlice.actions;
export default productSlice.reducer;
