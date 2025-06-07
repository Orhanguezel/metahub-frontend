// src/modules/cart/slice/cartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ICart } from "@/modules/cart/types"; 

interface CartState {
  cart: ICart | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
  stockWarning: string | null;
}

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  successMessage: null,
  stockWarning: null,
};

// Async Thunks
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, thunkAPI) =>
    await apiCall("get", "/cart/", null, thunkAPI.rejectWithValue, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY },
    })
);

export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async (payload: { productId: string; quantity: number }, thunkAPI) =>
    await apiCall("post", "/cart/add", payload, thunkAPI.rejectWithValue, {
      headers: {
        "x-api-key": process.env.NEXT_PUBLIC_API_KEY,
        // Authorization header otomatik ekleniyorsa kaldırabilirsin
      },
    })
);

export const increaseQuantity = createAsyncThunk(
  "cart/increaseQuantity",
  async (productId: string, thunkAPI) =>
    await apiCall(
      "patch",
      `/cart/increase/${productId}`,
      null,
      thunkAPI.rejectWithValue,
      {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY },
      }
    )
);

export const decreaseQuantity = createAsyncThunk(
  "cart/decreaseQuantity",
  async (productId: string, thunkAPI) =>
    await apiCall(
      "patch",
      `/cart/decrease/${productId}`,
      null,
      thunkAPI.rejectWithValue,
      {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY },
      }
    )
);

export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async (productId: string, thunkAPI) =>
    await apiCall(
      "delete",
      `/cart/remove/${productId}`,
      null,
      thunkAPI.rejectWithValue,
      {
        headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY },
      }
    )
);

export const clearCart = createAsyncThunk(
  "cart/clearCart",
  async (_, thunkAPI) =>
    await apiCall("delete", "/cart/clear", null, thunkAPI.rejectWithValue, {
      headers: { "x-api-key": process.env.NEXT_PUBLIC_API_KEY },
    })
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.stockWarning = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: CartState) => {
      state.loading = true;
      state.error = null;
      state.stockWarning = null;
    };

    const errorReducer = (state: CartState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Etwas ist schiefgelaufen!";
      state.stockWarning = null;
    };

    builder
      // 🛒 GET CART
      .addCase(fetchCart.pending, loadingReducer)
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // API'den gelen veri bazen data.cart bazen data olabiliyor.
        state.cart = action.payload.cart || action.payload.data || null;
      })
      .addCase(fetchCart.rejected, errorReducer)

      // ➕ ADD
      .addCase(addToCart.pending, loadingReducer)
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart || null;
        state.successMessage = "Produkt wurde zum Warenkorb hinzugefügt.";
        state.stockWarning = action.payload.warning || null;
      })
      .addCase(addToCart.rejected, errorReducer)

      // 🔼 INCREASE
      .addCase(increaseQuantity.pending, loadingReducer)
      .addCase(increaseQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart || null;
        state.stockWarning = action.payload.warning || null;
      })
      .addCase(increaseQuantity.rejected, errorReducer)

      // 🔽 DECREASE
      .addCase(decreaseQuantity.pending, loadingReducer)
      .addCase(decreaseQuantity.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart || null;
      })
      .addCase(decreaseQuantity.rejected, errorReducer)

      // ❌ REMOVE
      .addCase(removeFromCart.pending, loadingReducer)
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart || null;
        state.successMessage = "Produkt wurde aus dem Warenkorb entfernt.";
      })
      .addCase(removeFromCart.rejected, errorReducer)

      // 🧹 CLEAR
      .addCase(clearCart.pending, loadingReducer)
      .addCase(clearCart.fulfilled, (state, action) => {
        state.loading = false;
        state.cart = action.payload.cart || null;
        state.successMessage = "Warenkorb wurde geleert.";
      })
      .addCase(clearCart.rejected, errorReducer);
  },
});

export const { clearCartMessages } = cartSlice.actions;
export default cartSlice.reducer;
