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
      const response = await apiCall(
        "get",
        "/cart",
        null,
        thunkAPI.rejectWithValue
      );
      // Cart yoksa veya session yoksa, null yerine boş bir cart objesi dön
      if (response && response.data) {
        return response.data as ICart;
      }
      // Hiç data yoksa (yeni kullanıcı, başka browser, session sıfırlandı, vs.)
      return EMPTY_CART;
    } catch (error: any) {
      // Auth olmayan durum
      if (error.response?.status === 401) {
        return thunkAPI.rejectWithValue("Not logged in");
      }
      // Cart yoksa (404 veya benzeri)
      if (error.response?.status === 404) {
        return EMPTY_CART;
      }
      return thunkAPI.rejectWithValue(
        error.message || "Etwas ist schiefgelaufen!"
      );
    }
  }
);

export const addToCart = createAsyncThunk<
  ICart,
  { productId: string; quantity: number },
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

// Aynı mantık diğer thunklar için de geçerli!
export const increaseQuantity = createAsyncThunk<
  ICart,
  string,
  { rejectValue: string }
>("cart/increaseQuantity", async (productId, thunkAPI) => {
  const response = await apiCall(
    "patch",
    `/cart/increase/${productId}`,
    null,
    thunkAPI.rejectWithValue
  );
  if (response && response.data) return response.data as ICart;
  return thunkAPI.rejectWithValue("Quantity arttırılamadı.");
});

export const decreaseQuantity = createAsyncThunk<
  ICart,
  string,
  { rejectValue: string }
>("cart/decreaseQuantity", async (productId, thunkAPI) => {
  const response = await apiCall(
    "patch",
    `/cart/decrease/${productId}`,
    null,
    thunkAPI.rejectWithValue
  );
  if (response && response.data) return response.data as ICart;
  return thunkAPI.rejectWithValue("Quantity azaltılamadı.");
});

export const removeFromCart = createAsyncThunk<
  ICart,
  string,
  { rejectValue: string }
>("cart/removeFromCart", async (productId, thunkAPI) => {
  const response = await apiCall(
    "delete",
    `/cart/remove/${productId}`,
    null,
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

      // ...Diğer case'ler aynı şekilde (increaseQuantity, decreaseQuantity, vs.)
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
