import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ICart } from "@/modules/cart/types";

interface CartState {
  cart: ICart | null;
  loading: boolean;
  status?: "idle" | "loading" | "succeeded" | "failed";
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
  status: "idle",
};

export const EMPTY_CART: ICart = {
  items: [],
  totalPrice: 0,
  status: "open",
  isActive: true,
  couponCode: null,
  discount: 0,
};

export const fetchCart = createAsyncThunk<ICart, void, { rejectValue: string }>(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      const response = await apiCall("get", "/cart", null, thunkAPI.rejectWithValue);
      if (response && response.data) {
        return response.data as ICart;
      }
      return EMPTY_CART;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return thunkAPI.rejectWithValue("Not logged in");
      }
      if (error.response?.status === 404) {
        return EMPTY_CART;
      }
      return thunkAPI.rejectWithValue(error.message || "Etwas ist schiefgelaufen!");
    }
  }
);

export const addToCart = createAsyncThunk<
  ICart,
  { productId: string; productType: "bike" | "ensotekprod" | "sparepart"; quantity: number },
  { rejectValue: string }
>("cart/addToCart", async (payload, thunkAPI) => {
  try {
    const response = await apiCall(
      "post",
      "/cart/add",
      payload,
      thunkAPI.rejectWithValue
    );
    if (response && response.data) {
      return response.data as ICart;
    }
    return thunkAPI.rejectWithValue("Cart eklenemedi.");
  } catch (error: any) {
    return thunkAPI.rejectWithValue(error.message || "Cart eklenemedi.");
  }
});

export const increaseQuantity = createAsyncThunk<
  ICart,
  { productId: string; productType: "bike" | "ensotekprod" | "sparepart" },
  { rejectValue: string }
>("cart/increaseQuantity", async (payload, thunkAPI) => {
  // PATCH body: { productId, productType }
  const response = await apiCall(
    "patch",
    "/cart/increase",
    payload,
    thunkAPI.rejectWithValue
  );
  if (response && response.data) return response.data as ICart;
  return thunkAPI.rejectWithValue("Quantity arttırılamadı.");
});

export const decreaseQuantity = createAsyncThunk<
  ICart,
  { productId: string; productType: "bike" | "ensotekprod" | "sparepart" },
  { rejectValue: string }
>("cart/decreaseQuantity", async (payload, thunkAPI) => {
  const response = await apiCall(
    "patch",
    "/cart/decrease",
    payload,
    thunkAPI.rejectWithValue
  );
  if (response && response.data) return response.data as ICart;
  return thunkAPI.rejectWithValue("Quantity azaltılamadı.");
});

export const removeFromCart = createAsyncThunk<
  ICart,
  { productId: string; productType: "bike" | "ensotekprod" | "sparepart" },
  { rejectValue: string }
>("cart/removeFromCart", async (payload, thunkAPI) => {
  const response = await apiCall(
    "patch",
    "/cart/remove",
    payload,
    thunkAPI.rejectWithValue
  );
  if (response && response.data) return response.data as ICart;
  return thunkAPI.rejectWithValue("Cart ürünü çıkarılamadı.");
});

export const clearCart = createAsyncThunk<ICart, void, { rejectValue: string }>(
  "cart/clearCart",
  async (_, thunkAPI) => {
    const response = await apiCall(
      "delete",
      "/cart/clear",
      null,
      thunkAPI.rejectWithValue
    );
    if (response && response.data) return response.data as ICart;
    return thunkAPI.rejectWithValue("Cart temizlenemedi.");
  }
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
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.stockWarning = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<ICart>) => {
        state.loading = false;
        state.cart = action.payload;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Cart yüklenemedi!";
        if (action.payload === "Not logged in") {
          state.cart = null;
        } else {
          state.cart = { ...EMPTY_CART };
        }
      })

      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.stockWarning = null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<ICart>) => {
        state.loading = false;
        state.cart = action.payload;
        state.successMessage = "Ürün sepete eklendi.";
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Sepete eklenemedi!";
      })

      .addCase(increaseQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        increaseQuantity.fulfilled,
        (state, action: PayloadAction<ICart>) => {
          state.loading = false;
          state.cart = action.payload;
        }
      )
      .addCase(increaseQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Arttırılamadı!";
      })
      .addCase(decreaseQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        decreaseQuantity.fulfilled,
        (state, action: PayloadAction<ICart>) => {
          state.loading = false;
          state.cart = action.payload;
        }
      )
      .addCase(decreaseQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Azaltılamadı!";
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        removeFromCart.fulfilled,
        (state, action: PayloadAction<ICart>) => {
          state.loading = false;
          state.cart = action.payload;
          state.successMessage = "Sepetten çıkarıldı.";
        }
      )
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Çıkarılamadı!";
      })
      .addCase(clearCart.fulfilled, (state, action: PayloadAction<ICart>) => {
        state.loading = false;
        state.cart = action.payload;
        state.successMessage = "Sepet temizlendi.";
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || "Temizlenemedi!";
      });
  },
});

export const { clearCartMessages } = cartSlice.actions;
export default cartSlice.reducer;
