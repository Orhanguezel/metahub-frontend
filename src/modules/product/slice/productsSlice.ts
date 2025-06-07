import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IProduct } from "@/modules/product/types/product";

interface ProductState {
  products: IProduct[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  selectedProduct: IProduct | null;
}

const initialState: ProductState = {
  products: [],
  loading: false,
  error: null,
  successMessage: null,
  selectedProduct: null,
};

// ✅ Get all products
export const fetchProducts = createAsyncThunk(
  "products/fetchAll",
  async (_, thunkAPI) =>
    await apiCall("get", "/products", null, thunkAPI.rejectWithValue)
);

// ✅ Get product by ID
export const fetchProductById = createAsyncThunk(
  "products/fetchById",
  async (id: string, thunkAPI) =>
    await apiCall("get", `/products/${id}`, null, thunkAPI.rejectWithValue)
);

// ➕ Create product (FormData)
export const createProduct = createAsyncThunk(
  "products/create",
  async (formData: FormData, thunkAPI) =>
    await apiCall("post", "/products", formData, thunkAPI.rejectWithValue, {
      headers: { "Content-Type": "multipart/form-data" },
    })
);

// ✏️ Update product
export const updateProduct = createAsyncThunk(
  "products/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) =>
    await apiCall(
      "put",
      `/products/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    )
);

// 🗑️ Delete product
export const deleteProduct = createAsyncThunk(
  "products/delete",
  async (id: string, thunkAPI) =>
    await apiCall("delete", `/products/${id}`, null, thunkAPI.rejectWithValue)
);

const productsSlice = createSlice({
  name: "products",
  initialState,
  reducers: {
    clearProductMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: ProductState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: ProductState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      // 🔄 Fetch All
      .addCase(fetchProducts.pending, loadingReducer)
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload;
      })
      .addCase(fetchProducts.rejected, errorReducer)

      // 🔄 Fetch Single
      .addCase(fetchProductById.pending, loadingReducer)
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, errorReducer)

      // ➕ Create
      .addCase(createProduct.pending, loadingReducer)
      .addCase(createProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Produkt wurde erfolgreich erstellt.";
        state.products.unshift(action.payload.product);
      })
      .addCase(createProduct.rejected, errorReducer)

      // ✏️ Update
      .addCase(updateProduct.pending, loadingReducer)
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Produkt wurde aktualisiert.";
        const updated = action.payload.product;
        const index = state.products.findIndex((p) => p._id === updated._id);
        if (index !== -1) state.products[index] = updated;
      })
      .addCase(updateProduct.rejected, errorReducer)

      // 🗑️ Delete
      .addCase(deleteProduct.pending, loadingReducer)
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Produkt wurde gelöscht.";
        state.products = state.products.filter(
          (p) => p._id !== action.payload._id
        );
      })
      .addCase(deleteProduct.rejected, errorReducer);
  },
});

export const { clearProductMessages } = productsSlice.actions;
export default productsSlice.reducer;
