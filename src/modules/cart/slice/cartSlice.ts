import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ICart, ICartItem, CartLinePriceHint, CartLinePriceComponents } from "@/modules/cart/types";

/* ================== Types & Utils ================== */

type ProductType = ICartItem["productType"];

type ApiEnvelope<TData> = {
  success?: boolean;
  message?: string;
  data: TData;
  warning?: string;
  meta?: any;
};

interface PricingTotals {
  itemsTotal: number;
  deliveryFee: number;
  serviceFee: number;
  tipAmount: number;
  discount: number;
  grandTotal: number;
  currency: string;
}

interface CartState {
  cart: ICart | null;
  loading: boolean;
  status?: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
  stockWarning: string | null;
  totals?: PricingTotals | null;
  lastOrder?: any | null;
}

const getErr = (error: any, fallback = "Etwas ist schiefgelaufen!") => {
  if (error?.response?.status === 401) return "Not logged in";
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message) return error.message;
  return fallback;
};

/** Sunucu zarfını normalize et: axios resp / direkt data fark etmez */
async function callCartRaw<T>(
  method: "get" | "post" | "patch" | "delete",
  url: string,
  body: any,
  rejectWithValue: (v: string) => any
): Promise<ApiEnvelope<T>> {
  const res = await apiCall(method, url, body, rejectWithValue);
  const d = (res && (res as any).data !== undefined ? (res as any).data : res) || {};
  // d tipik: { success, message, data, warning, meta }  |  bazen direkt data olabilir
  if (d && typeof d === "object" && ("data" in d || "success" in d || "message" in d)) {
    return d as ApiEnvelope<T>;
  }
  return { data: d } as ApiEnvelope<T>;
}

/* ================== State ================== */

const initialState: CartState = {
  cart: null,
  loading: false,
  error: null,
  successMessage: null,
  stockWarning: null,
  totals: null,
  lastOrder: null,
  status: "idle",
};

export const EMPTY_CART: ICart = {
  items: [],
  totalPrice: 0,
  status: "open",
  isActive: true,
  couponCode: null,
  discount: 0,
  // dil/currency sunucudan yönetiliyor; FE’de null bırakmak güvenli
} as any;

const BASE = "/cart";

/* ================== Thunks (Legacy simple products) ================== */

export const fetchCart = createAsyncThunk<ApiEnvelope<ICart>, void, { rejectValue: string }>(
  "cart/fetchCart",
  async (_, thunkAPI) => {
    try {
      return await callCartRaw<ICart>("get", `${BASE}`, null, thunkAPI.rejectWithValue);
    } catch (error: any) {
      const msg = getErr(error);
      // Eski davranışla uyumlu: 404'te EMPTY_CART (beklenmez ama koruyalım)
      if (error?.response?.status === 404) return { data: EMPTY_CART };
      return thunkAPI.rejectWithValue(msg);
    }
  }
);

export const addToCart = createAsyncThunk<
  ApiEnvelope<ICart>,
  {
    productId: string;
    productType: ProductType;
    quantity: number;
    // menuitem için opsiyonel seçim:
    menu?: {
      variantCode?: string;
      modifiers?: Array<{ groupCode: string; optionCode: string; quantity?: number }>;
      depositIncluded?: boolean;
      notes?: string;
    };
    currency?: string;
  },
  { rejectValue: string }
>("cart/addToCart", async (payload, thunkAPI) => {
  try {
    return await callCartRaw<ICart>("post", `${BASE}/add`, payload, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Cart eklenemedi."));
  }
});

export const increaseQuantity = createAsyncThunk<
  ApiEnvelope<ICart>,
  { productId: string; productType: ProductType },
  { rejectValue: string }
>("cart/increaseQuantity", async (payload, thunkAPI) => {
  try {
    return await callCartRaw<ICart>("patch", `${BASE}/increase`, payload, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Quantity arttırılamadı."));
  }
});

export const decreaseQuantity = createAsyncThunk<
  ApiEnvelope<ICart>,
  { productId: string; productType: ProductType },
  { rejectValue: string }
>("cart/decreaseQuantity", async (payload, thunkAPI) => {
  try {
    return await callCartRaw<ICart>("patch", `${BASE}/decrease`, payload, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Quantity azaltılamadı."));
  }
});

export const removeFromCart = createAsyncThunk<
  ApiEnvelope<ICart>,
  { productId: string; productType: ProductType },
  { rejectValue: string }
>("cart/removeFromCart", async (payload, thunkAPI) => {
  try {
    return await callCartRaw<ICart>("patch", `${BASE}/remove`, payload, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Cart ürünü çıkarılamadı."));
  }
});

export const clearCart = createAsyncThunk<ApiEnvelope<ICart>, void, { rejectValue: string }>(
  "cart/clearCart",
  async (_, thunkAPI) => {
    try {
      return await callCartRaw<ICart>("delete", `${BASE}/clear`, null, thunkAPI.rejectWithValue);
    } catch (error: any) {
      return thunkAPI.rejectWithValue(getErr(error, "Cart temizlenemedi."));
    }
  }
);

/* ================== Thunks (Menu Cart Line) ================== */
/** Menü kalemi ekleme:
 *  - FE iki şekilde fiyat geçebilir:
 *    1) Düz alanlar: unitPrice, unitCurrency, priceComponents
 *    2) priceHint: { unitPrice, currency, priceComponents }
 *  Her ikisini de destekliyoruz; BE body’sine normalize ediyoruz.
 */
export const addCartLine = createAsyncThunk<
  ApiEnvelope<ICart>,
  {
    menuItemId: string;
    quantity?: number;
    variantCode?: string;
    modifiers?: Array<{ groupCode: string; optionCode: string; quantity?: number }>;
    depositIncluded?: boolean;
    notes?: string;
    currency?: string;
    /** ✅ opsiyonel: FE fiyat ipucu nesnesi */
    priceHint?: CartLinePriceHint;
    /** ✅ opsiyonel: düz alanlar (geriye dönük uyumluluk) */
    unitPrice?: number;
    unitCurrency?: string;
    priceComponents?: CartLinePriceComponents;
  },
  { rejectValue: string }
>("cart/addCartLine", async (payload, thunkAPI) => {
  try {
    const body: any = {
      menuItemId: payload.menuItemId,
      quantity: payload.quantity ?? 1,
      variantCode: payload.variantCode,
      modifiers: payload.modifiers ?? [],
      depositIncluded: payload.depositIncluded ?? true,
      notes: payload.notes,
    };

    // Currency: explicit > unitCurrency > priceHint.currency
    body.currency = payload.currency ?? payload.unitCurrency ?? payload.priceHint?.currency;

    // Unit price & components: explicit > priceHint
    const effUnitPrice = payload.unitPrice ?? payload.priceHint?.unitPrice;
    const effUnitCurrency = payload.unitCurrency ?? payload.priceHint?.currency;
    const effComponents = payload.priceComponents ?? payload.priceHint?.priceComponents;

    if (effUnitPrice != null) body.unitPrice = effUnitPrice;
    if (effUnitCurrency) body.unitCurrency = effUnitCurrency;
    if (effComponents) body.priceComponents = effComponents;

    return await callCartRaw<ICart>("post", `${BASE}/items`, body, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Menu ürünü eklenemedi."));
  }
});

/** Menü kalemi güncelleme (aynı esneklik) */
export const updateCartLine = createAsyncThunk<
  ApiEnvelope<ICart>,
  {
    lineId: string;
    changes: {
      quantity?: number;
      variantCode?: string;
      modifiers?: Array<{ groupCode: string; optionCode: string; quantity?: number }>;
      depositIncluded?: boolean;
      notes?: string;
      currency?: string;
      priceHint?: CartLinePriceHint;
      unitPrice?: number;
      unitCurrency?: string;
      priceComponents?: CartLinePriceComponents;
    };
  },
  { rejectValue: string }
>("cart/updateCartLine", async ({ lineId, changes }, thunkAPI) => {
  try {
    const body: any = {
      ...changes,
    };

    // Currency: explicit > unitCurrency > priceHint.currency
    body.currency = changes.currency ?? changes.unitCurrency ?? changes.priceHint?.currency;

    // Unit price & components: explicit > priceHint
    const effUnitPrice = changes.unitPrice ?? changes.priceHint?.unitPrice;
    const effUnitCurrency = changes.unitCurrency ?? changes.priceHint?.currency;
    const effComponents = changes.priceComponents ?? changes.priceHint?.priceComponents;

    if (effUnitPrice != null) body.unitPrice = effUnitPrice;
    if (effUnitCurrency) body.unitCurrency = effUnitCurrency;
    if (effComponents) body.priceComponents = effComponents;

    // BE priceHint alanını tanımıyorsa temiz tut
    delete body.priceHint;

    return await callCartRaw<ICart>("patch", `${BASE}/items/${lineId}`, body, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Menu kalemi güncellenemedi."));
  }
});

export const removeCartLine = createAsyncThunk<
  ApiEnvelope<ICart>,
  { lineId: string },
  { rejectValue: string }
>("cart/removeCartLine", async ({ lineId }, thunkAPI) => {
  try {
    return await callCartRaw<ICart>("delete", `${BASE}/items/${lineId}`, null, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Menu kalemi silinemedi."));
  }
});

/* ================== Thunks (Pricing & Checkout) ================== */

export const updateCartPricing = createAsyncThunk<
  ApiEnvelope<ICart>,
  { tipAmount?: number; deliveryFee?: number; serviceFee?: number; couponCode?: string; currency?: string },
  { rejectValue: string }
>("cart/updateCartPricing", async (payload, thunkAPI) => {
  try {
    return await callCartRaw<ICart>("patch", `${BASE}/pricing`, payload, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Pricing güncellenemedi."));
  }
});

export const checkoutCart = createAsyncThunk<
  ApiEnvelope<any>, // order döner
  {
    serviceType?: "delivery" | "pickup" | "dinein";
    branch?: string;
    addressId?: string;
    shippingAddress?: {
      name: string;
      phone: string;
      street: string;
      city: string;
      postalCode: string;
      country: string;
    };
    paymentMethod?: "cash_on_delivery" | "credit_card" | "paypal";
    currency?: string;
  },
  { rejectValue: string }
>("cart/checkoutCart", async (payload, thunkAPI) => {
  try {
    return await callCartRaw<any>("post", `${BASE}/checkout`, payload, thunkAPI.rejectWithValue);
  } catch (error: any) {
    return thunkAPI.rejectWithValue(getErr(error, "Checkout başarısız."));
  }
});

/* ================== Slice ================== */

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.stockWarning = null;
    },
    // İsteğe bağlı: Checkout sonrası ekranda order’ı temizlemek istersen
    clearLastOrder: (state) => {
      state.lastOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
        state.stockWarning = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false;
        state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || null;
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        const msg = (action.payload as string) || "Cart yüklenemedi!";
        state.error = msg;
        state.cart = msg === "Not logged in" ? null : { ...EMPTY_CART };
      })

      // addToCart
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
        state.status = "loading";
        state.error = null;
        state.stockWarning = null;
      })
      .addCase(addToCart.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false;
        state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || "Ürün sepete eklendi.";
        state.stockWarning = action.payload.warning || null;
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.status = "failed";
        state.error = (action.payload as string) || "Sepete eklenemedi!";
      })

      // increaseQuantity
      .addCase(increaseQuantity.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(increaseQuantity.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false; state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || null;
        state.stockWarning = action.payload.warning || null;
      })
      .addCase(increaseQuantity.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Arttırılamadı!";
      })

      // decreaseQuantity
      .addCase(decreaseQuantity.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(decreaseQuantity.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false; state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || null;
      })
      .addCase(decreaseQuantity.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Azaltılamadı!";
      })

      // removeFromCart
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(removeFromCart.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false; state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || "Sepetten çıkarıldı.";
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Çıkarılamadı!";
      })

      // clearCart
      .addCase(clearCart.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(clearCart.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false; state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || "Sepet temizlendi.";
      })
      .addCase(clearCart.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Temizlenemedi!";
      })

      /* ===== Menu Cart Line ===== */
      .addCase(addCartLine.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(addCartLine.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false; state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || "Menu kalemi eklendi.";
      })
      .addCase(addCartLine.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Menu kalemi eklenemedi!";
      })

      .addCase(updateCartLine.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(updateCartLine.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false; state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || "Menu kalemi güncellendi.";
      })
      .addCase(updateCartLine.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Menu kalemi güncellenemedi!";
      })

      .addCase(removeCartLine.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(removeCartLine.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false; state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || "Menu kalemi silindi.";
      })
      .addCase(removeCartLine.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Menu kalemi silinemedi!";
      })

      /* ===== Pricing ===== */
      .addCase(updateCartPricing.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(updateCartPricing.fulfilled, (state, action: PayloadAction<ApiEnvelope<ICart>>) => {
        state.loading = false; state.status = "succeeded";
        state.cart = action.payload.data;
        state.successMessage = action.payload.message || "Pricing güncellendi.";
        state.totals = action.payload.meta?.totals || null;
      })
      .addCase(updateCartPricing.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Pricing güncellenemedi!";
      })

      /* ===== Checkout ===== */
      .addCase(checkoutCart.pending, (state) => {
        state.loading = true; state.status = "loading"; state.error = null;
      })
      .addCase(checkoutCart.fulfilled, (state, action: PayloadAction<ApiEnvelope<any>>) => {
        state.loading = false; state.status = "succeeded";
        state.successMessage = action.payload.message || "Sipariş oluşturuldu.";
        state.lastOrder = action.payload.data; // order
        state.cart = { ...EMPTY_CART };       // backend de sepeti temizliyor
        state.totals = null;
      })
      .addCase(checkoutCart.rejected, (state, action) => {
        state.loading = false; state.status = "failed";
        state.error = (action.payload as string) || "Checkout başarısız!";
      });
  },
});

export const { clearCartMessages, clearLastOrder } = cartSlice.actions;
export default cartSlice.reducer;
