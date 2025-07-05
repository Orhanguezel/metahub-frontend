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
  orders: IOrder[];
  myOrders: IOrder[];
  order: IOrder | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

// --- Initial State ---
const initialState: OrdersState = {
  orders: [],
  myOrders: [],
  order: null,
  loading: false,
  error: null,
  successMessage: null,
};

// --- Async Thunks ---

// PUBLIC: Sipariş oluştur
export const createOrder = createAsyncThunk<
  ApiResponse<IOrder>,
  Partial<IOrder>
>("orders/createOrder", async (data, thunkAPI) => {
  try {
    return await apiCall("post", "/order", data, thunkAPI.rejectWithValue);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.message ||
        err.message ||
        "Order could not be created."
    );
  }
});

// PUBLIC: Kendi siparişlerini getir
export const getMyOrders = createAsyncThunk<ApiResponse<IOrder[]>>(
  "orders/getMyOrders",
  async (_, thunkAPI) => {
    try {
      return await apiCall("get", "/order", null, thunkAPI.rejectWithValue);
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message ||
          err.message ||
          "Orders could not be fetched."
      );
    }
  }
);

// PUBLIC: Tek siparişi getir
export const getOrderById = createAsyncThunk<ApiResponse<IOrder>, string>(
  "orders/getOrderById",
  async (id, thunkAPI) => {
    try {
      return await apiCall(
        "get",
        `/order/${id}`,
        null,
        thunkAPI.rejectWithValue
      );
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message || err.message || "Order not found."
      );
    }
  }
);

// PUBLIC: Adres güncelle
export const updateShippingAddress = createAsyncThunk<
  ApiResponse<IOrder>,
  { id: string; shippingAddress: IShippingAddress }
>("orders/updateShippingAddress", async ({ id, shippingAddress }, thunkAPI) => {
  try {
    return await apiCall(
      "put",
      `/order/${id}/address`,
      { shippingAddress },
      thunkAPI.rejectWithValue
    );
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.message ||
        err.message ||
        "Shipping address could not be updated."
    );
  }
});

// ADMIN: Tüm siparişleri getir
export const getAllOrders = createAsyncThunk<ApiResponse<IOrder[]>>(
  "orders/getAllOrders",
  async (_, thunkAPI) => {
    try {
      return await apiCall(
        "get",
        "/order/admin",
        null,
        thunkAPI.rejectWithValue
      );
    } catch (err: any) {
      return thunkAPI.rejectWithValue(
        err?.response?.data?.message ||
          err.message ||
          "Orders could not be fetched."
      );
    }
  }
);

// ADMIN: Sipariş durumunu güncelle
export const updateOrderStatus = createAsyncThunk<
  ApiResponse<IOrder>,
  { id: string; status: OrderStatus }
>("orders/updateOrderStatus", async ({ id, status }, thunkAPI) => {
  try {
    return await apiCall(
      "put",
      `/order/admin/${id}/status`,
      { status },
      thunkAPI.rejectWithValue
    );
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.message ||
        err.message ||
        "Order status could not be updated."
    );
  }
});

// ADMIN: Siparişi teslim edildi olarak işaretle
export const markOrderAsDelivered = createAsyncThunk<
  ApiResponse<IOrder>,
  string
>("orders/markOrderAsDelivered", async (id, thunkAPI) => {
  try {
    return await apiCall(
      "put",
      `/order/admin/${id}/deliver`,
      null,
      thunkAPI.rejectWithValue
    );
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.message ||
        err.message ||
        "Order could not be marked as delivered."
    );
  }
});

// ADMIN: Siparişi sil
export const deleteOrder = createAsyncThunk<
  ApiResponse<{ id: string }>,
  string
>("orders/deleteOrder", async (id, thunkAPI) => {
  try {
    return await apiCall(
      "delete",
      `/order/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      err?.response?.data?.message ||
        err.message ||
        "Order could not be deleted."
    );
  }
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
      state.orders = [];
      state.myOrders = [];
      state.order = null;
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

    builder
      // PUBLIC
      .addCase(createOrder.pending, loading)
      .addCase(
        createOrder.fulfilled,
        (state, action: PayloadAction<ApiResponse<IOrder>>) => {
          state.loading = false;
          state.successMessage = action.payload?.message || "Order created.";
          if (action.payload?.data) {
            state.myOrders = [action.payload.data, ...state.myOrders];
          }
        }
      )
      .addCase(createOrder.rejected, failed)

      .addCase(getMyOrders.pending, loading)
      .addCase(
        getMyOrders.fulfilled,
        (state, action: PayloadAction<ApiResponse<IOrder[]>>) => {
          state.loading = false;
          state.myOrders = Array.isArray(action.payload?.data)
            ? action.payload.data
            : [];
          state.successMessage = action.payload?.message || "Orders fetched.";
        }
      )
      .addCase(getMyOrders.rejected, failed)

      .addCase(getOrderById.pending, loading)
      .addCase(
        getOrderById.fulfilled,
        (state, action: PayloadAction<ApiResponse<IOrder>>) => {
          state.loading = false;
          const orderData = action.payload?.data;
          state.order = orderData
            ? {
                ...orderData,
                items: orderData.items || [],
                shippingAddress: orderData.shippingAddress || {},
              }
            : null;
        }
      )
      .addCase(getOrderById.rejected, failed)

      .addCase(updateShippingAddress.pending, loading)
      .addCase(
        updateShippingAddress.fulfilled,
        (state, action: PayloadAction<ApiResponse<IOrder>>) => {
          state.loading = false;
          state.successMessage = action.payload?.message || "Shipping updated.";
          state.order = action.payload?.data || null;
        }
      )
      .addCase(updateShippingAddress.rejected, failed)

      // ADMIN
      .addCase(getAllOrders.pending, loading)
      .addCase(
        getAllOrders.fulfilled,
        (state, action: PayloadAction<ApiResponse<IOrder[]>>) => {
          state.loading = false;
          state.orders = Array.isArray(action.payload?.data)
            ? action.payload.data
            : [];
        }
      )
      .addCase(getAllOrders.rejected, failed)

      .addCase(updateOrderStatus.pending, loading)
      .addCase(
        updateOrderStatus.fulfilled,
        (state, action: PayloadAction<ApiResponse<IOrder>>) => {
          state.loading = false;
          state.successMessage = action.payload?.message || "Status updated.";
          const updated = action.payload?.data;
          if (updated && Array.isArray(state.orders)) {
            state.orders = state.orders.map((o) =>
              o._id === updated._id ? updated : o
            );
          }
        }
      )
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.loading = false;
        const err = action.payload as any; // veya as Record<string, any>
        if (typeof err === "string") {
          state.error = err;
        } else if (
          err &&
          typeof err === "object" &&
          "message" in err &&
          err.message
        ) {
          state.error = err.message;
        } else if (
          err &&
          typeof err === "object" &&
          "errors" in err &&
          Array.isArray(err.errors)
        ) {
          state.error = err.errors.map((e: any) => e.msg).join(", ");
        } else {
          state.error = "An error occurred";
        }
      })

      .addCase(markOrderAsDelivered.pending, loading)
      .addCase(
        markOrderAsDelivered.fulfilled,
        (state, action: PayloadAction<ApiResponse<IOrder>>) => {
          state.loading = false;
          state.successMessage = action.payload?.message || "Order delivered.";
          const updated = action.payload?.data;
          if (updated && Array.isArray(state.orders)) {
            state.orders = state.orders.map((o) =>
              o._id === updated._id ? updated : o
            );
          }
        }
      )
      .addCase(markOrderAsDelivered.rejected, failed)

      .addCase(deleteOrder.pending, loading)
      .addCase(
        deleteOrder.fulfilled,
        (state, action: PayloadAction<ApiResponse<{ id: string }>>) => {
          state.loading = false;
          state.successMessage = action.payload?.message || "Order deleted.";
          const id =
            action.payload?.id ||
            (action.payload?.data && action.payload.data.id);
          if (id) {
            state.orders = state.orders.filter((o) => o._id !== id);
          }
        }
      )
      .addCase(deleteOrder.rejected, failed);
  },
});

export const { clearOrderMessages, resetOrders } = ordersSlice.actions;
export default ordersSlice.reducer;
