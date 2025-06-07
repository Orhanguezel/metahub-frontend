import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Order, OrderItem } from "@/modules/order/types";

interface OrderState {
  orders: Order[];
  order: Order | null;
  orderDetails: Order | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: OrderState = {
  orders: [],
  order: null,
  orderDetails: null,
  loading: false,
  error: null,
  successMessage: null,
};

// POST /order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (
    data: { items: OrderItem[]; shippingAddress: any; totalPrice: number },
    thunkAPI
  ) => await apiCall("post", "/order", data, thunkAPI.rejectWithValue)
);

// GET /order/:orderId
export const getOrderById = createAsyncThunk(
  "orders/getOrderById",
  async (orderId: string, thunkAPI) =>
    await apiCall("get", `/order/${orderId}`, null, thunkAPI.rejectWithValue)
);

// PUT /order/:orderId/address
export const updateShippingAddress = createAsyncThunk(
  "orders/updateShippingAddress",
  async (
    { orderId, shippingAddress }: { orderId: string; shippingAddress: any },
    thunkAPI
  ) =>
    await apiCall(
      "put",
      `/order/${orderId}/address`,
      { shippingAddress },
      thunkAPI.rejectWithValue
    )
);

// GET /order/admin (admin)
export const getAllOrders = createAsyncThunk(
  "orders/getAllOrders",
  async (_, thunkAPI) =>
    await apiCall("get", "/order/admin", null, thunkAPI.rejectWithValue)
);

// PUT /order/admin/:orderId/status (admin)
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ orderId, status }: { orderId: string; status: string }, thunkAPI) =>
    await apiCall(
      "put",
      `/order/admin/${orderId}/status`,
      { status },
      thunkAPI.rejectWithValue
    )
);

// PUT /order/admin/:orderId/deliver (admin)
export const markOrderAsDelivered = createAsyncThunk(
  "orders/markOrderAsDelivered",
  async (orderId: string, thunkAPI) =>
    await apiCall(
      "put",
      `/order/admin/${orderId}/deliver`,
      null,
      thunkAPI.rejectWithValue
    )
);

// DELETE /order/admin/:orderId (admin)
export const deleteOrder = createAsyncThunk(
  "orders/deleteOrder",
  async (orderId: string, thunkAPI) =>
    await apiCall(
      "delete",
      `/order/admin/${orderId}`,
      null,
      thunkAPI.rejectWithValue
    )
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderMessages: (state) => {
      state.error = null;
      state.successMessage = null;
      state.orderDetails = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: OrderState) => {
      state.loading = true;
      state.error = null;
    };
    const failed = (state: OrderState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
    };

    // Create
    builder
      .addCase(createOrder.pending, loading)
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.orders.unshift(action.payload.data);
      })
      .addCase(createOrder.rejected, failed);

    // Get Order By ID
    builder.addCase(getOrderById.pending, loading);
    builder
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload.data;
      })

      .addCase(getOrderById.rejected, failed);

    // Update Address
    builder
      .addCase(updateShippingAddress.pending, loading)
      .addCase(updateShippingAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.orderDetails = action.payload.data;
      })
      .addCase(updateShippingAddress.rejected, failed);

    // Get All Orders (Admin)
    builder
      .addCase(getAllOrders.pending, loading)
      .addCase(getAllOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
      })
      .addCase(getAllOrders.rejected, failed);

    // Update Order Status (Admin)
    builder
      .addCase(updateOrderStatus.pending, loading)
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const updated = action.payload.data;
        state.orders = state.orders.map((o) =>
          o._id === updated._id ? updated : o
        );
      })
      .addCase(updateOrderStatus.rejected, failed);

    // Mark as Delivered (Admin)
    builder
      .addCase(markOrderAsDelivered.pending, loading)
      .addCase(markOrderAsDelivered.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const updated = action.payload.data;
        state.orders = state.orders.map((o) =>
          o._id === updated._id ? updated : o
        );
      })
      .addCase(markOrderAsDelivered.rejected, failed);

    // Delete Order (Admin)
    builder
      .addCase(deleteOrder.pending, loading)
      .addCase(deleteOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.orders = state.orders.filter((o) => o._id !== action.meta.arg);
      })
      .addCase(deleteOrder.rejected, failed);
  },
});

export const { clearOrderMessages } = ordersSlice.actions;
export default ordersSlice.reducer;
