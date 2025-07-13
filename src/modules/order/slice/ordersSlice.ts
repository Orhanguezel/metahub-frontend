import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import { IOrder, IShippingAddress, OrderStatus } from "../types";

// --- Response Tipi ---
interface ApiResponse<T> {
  data: T;
  message?: string;
  id?: string;
  errors?: { msg: string }[];
}

// --- State ---
interface OrdersState {
  ordersAdmin: IOrder[];     // Admin paneldeki tüm siparişler
  myOrders: IOrder[];        // Giriş yapmış kullanıcının kendi siparişleri (public)
  selected: IOrder | null;   // Seçili sipariş (detay)
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: OrdersState = {
  ordersAdmin: [],
  myOrders: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

// --- Async Thunks ---

// 1️⃣ PUBLIC: Sipariş oluştur
export const createOrder = createAsyncThunk<ApiResponse<IOrder>, Partial<IOrder>>(
  "orders/createOrder",
  async (data, thunkAPI) => await apiCall("post", "/order", data, thunkAPI.rejectWithValue)
);

// 2️⃣ PUBLIC: Kendi siparişlerini getir
export const fetchMyOrders = createAsyncThunk<ApiResponse<IOrder[]>>(
  "orders/fetchMyOrders",
  async (_, thunkAPI) => await apiCall("get", "/order", null, thunkAPI.rejectWithValue)
);

// 3️⃣ PUBLIC: Tek siparişi getir
export const fetchOrderById = createAsyncThunk<ApiResponse<IOrder>, string>(
  "orders/fetchOrderById",
  async (id, thunkAPI) => await apiCall("get", `/order/${id}`, null, thunkAPI.rejectWithValue)
);

// 4️⃣ PUBLIC: Adres güncelle
export const updateShippingAddress = createAsyncThunk<
  ApiResponse<IOrder>,
  { id: string; shippingAddress: IShippingAddress }
>("orders/updateShippingAddress", async ({ id, shippingAddress }, thunkAPI) => {
  return await apiCall("put", `/order/${id}/address`, { shippingAddress }, thunkAPI.rejectWithValue);
});

// 5️⃣ ADMIN: Tüm siparişleri getir
export const fetchAllOrdersAdmin = createAsyncThunk<ApiResponse<IOrder[]>>(
  "orders/fetchAllOrdersAdmin",
  async (_, thunkAPI) => await apiCall("get", "/order/admin", null, thunkAPI.rejectWithValue)
);

// 6️⃣ ADMIN: Sipariş durumunu güncelle
export const updateOrderStatusAdmin = createAsyncThunk<
  ApiResponse<IOrder>,
  { id: string; status: OrderStatus }
>("orders/updateOrderStatusAdmin", async ({ id, status }, thunkAPI) => {
  return await apiCall("put", `/order/admin/${id}/status`, { status }, thunkAPI.rejectWithValue);
});

// 7️⃣ ADMIN: Siparişi teslim edildi olarak işaretle
export const markOrderAsDeliveredAdmin = createAsyncThunk<
  ApiResponse<IOrder>,
  string
>("orders/markOrderAsDeliveredAdmin", async (id, thunkAPI) => {
  return await apiCall("put", `/order/admin/${id}/deliver`, null, thunkAPI.rejectWithValue);
});

// 8️⃣ ADMIN: Siparişi sil
export const deleteOrderAdmin = createAsyncThunk<
  ApiResponse<{ id: string }>,
  string
>("orders/deleteOrderAdmin", async (id, thunkAPI) => {
  return await apiCall("delete", `/order/admin/${id}`, null, thunkAPI.rejectWithValue);
});

// --- Slice ---
const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetOrders: (state) => {
      state.ordersAdmin = [];
      state.myOrders = [];
      state.selected = null;
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: OrdersState) => {
      state.loading = true;
      state.error = null;
    };
    const failed = (state: OrdersState, action: PayloadAction<any>) => {
      state.loading = false;
      const err = action.payload;
      state.error =
        typeof err === "string"
          ? err
          : err && err.message
          ? err.message
          : "An error occurred";
    };

    // --- PUBLIC ---
    builder
      .addCase(createOrder.pending, loading)
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Order created.";
        if (action.payload?.data) {
          state.myOrders = [action.payload.data, ...state.myOrders];
        }
      })
      .addCase(createOrder.rejected, failed)

      .addCase(fetchMyOrders.pending, loading)
      .addCase(fetchMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.myOrders = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
        state.successMessage = action.payload?.message ?? null;

      })
      .addCase(fetchMyOrders.rejected, failed)

      .addCase(fetchOrderById.pending, loading)
      .addCase(fetchOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload?.data ?? null;
      })
      .addCase(fetchOrderById.rejected, failed)

      .addCase(updateShippingAddress.pending, loading)
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Shipping updated.";
        state.selected = action.payload?.data || null;
      })
      .addCase(updateShippingAddress.rejected, failed);

    // --- ADMIN ---
    builder
      .addCase(fetchAllOrdersAdmin.pending, loading)
      .addCase(fetchAllOrdersAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.ordersAdmin = Array.isArray(action.payload?.data)
          ? action.payload.data
          : [];
      })
      .addCase(fetchAllOrdersAdmin.rejected, failed)

      .addCase(updateOrderStatusAdmin.pending, loading)
      .addCase(updateOrderStatusAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Status updated.";
        const updated = action.payload?.data;
        if (updated && Array.isArray(state.ordersAdmin)) {
          state.ordersAdmin = state.ordersAdmin.map((o) =>
            o._id === updated._id ? updated : o
          );
        }
      })
      .addCase(updateOrderStatusAdmin.rejected, failed)

      .addCase(markOrderAsDeliveredAdmin.pending, loading)
      .addCase(markOrderAsDeliveredAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Order delivered.";
        const updated = action.payload?.data;
        if (updated && Array.isArray(state.ordersAdmin)) {
          state.ordersAdmin = state.ordersAdmin.map((o) =>
            o._id === updated._id ? updated : o
          );
        }
      })
      .addCase(markOrderAsDeliveredAdmin.rejected, failed)

      .addCase(deleteOrderAdmin.pending, loading)
      .addCase(deleteOrderAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message || "Order deleted.";
        const id =
          action.payload?.id ||
          (action.payload?.data && action.payload.data.id);
        if (id) {
          state.ordersAdmin = state.ordersAdmin.filter((o) => o._id !== id);
        }
      })
      .addCase(deleteOrderAdmin.rejected, failed);
  },
});

export const { clearOrderMessages, resetOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
