// src/store/ordersSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface OrderItem {
  product: string;
  quantity: number;
  priceAtAddition?: number;
}

export interface Order {
  _id?: string;
  user: {
    _id?: string;
    name?: string;
    email?: string;
  } | string;
  items: OrderItem[];
  shippingAddress: any;
  totalPrice: number;
  isDelivered?: boolean;
  deliveredAt?: string;
  status?: string;
  createdAt?: string;
}

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: OrderState = {
  orders: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 📦 Create new order
export const createOrder = createAsyncThunk(
  "orders/createOrder",
  async (data: {
    items: OrderItem[];
    shippingAddress: any;
    totalPrice: number;
  }, thunkAPI) =>
    await apiCall("post", "/orders", data, thunkAPI.rejectWithValue)
);

// 📥 Get all orders (admin)
export const getAllOrders = createAsyncThunk(
  "orders/getAllOrders",
  async (_, thunkAPI) =>
    await apiCall("get", "/orders", null, thunkAPI.rejectWithValue)
);

// ✅ Mark order as delivered
export const markOrderAsDelivered = createAsyncThunk(
  "orders/markOrderAsDelivered",
  async (orderId: string, thunkAPI) =>
    await apiCall("put", `/orders/${orderId}/deliver`, null, thunkAPI.rejectWithValue)
);

// 🔄 Update order status
export const updateOrderStatus = createAsyncThunk(
  "orders/updateOrderStatus",
  async ({ id, data }: { id: string; data: Partial<Order> }, thunkAPI) =>
    await apiCall("put", `/orders/${id}/status`, data, thunkAPI.rejectWithValue)
);

const ordersSlice = createSlice({
  name: "orders",
  initialState,
  reducers: {
    clearOrderMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: OrderState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (state: OrderState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload;
    };

    // Create Order
    builder.addCase(createOrder.pending, loadingReducer);
    builder.addCase(createOrder.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = "Bestellung erfolgreich aufgegeben.";
      state.orders.unshift(action.payload.order);
    });
    builder.addCase(createOrder.rejected, errorReducer);

    // Get Orders
    builder.addCase(getAllOrders.pending, loadingReducer);
    builder.addCase(getAllOrders.fulfilled, (state, action) => {
      state.loading = false;
      state.orders = action.payload;
    });
    builder.addCase(getAllOrders.rejected, errorReducer);

    // Mark as Delivered
    builder.addCase(markOrderAsDelivered.pending, loadingReducer);
    builder.addCase(markOrderAsDelivered.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = "Bestellung wurde als geliefert markiert.";
      const id = action.meta.arg;
      const order = state.orders.find((o) => o._id === id);
      if (order) {
        order.isDelivered = true;
        order.deliveredAt = new Date().toISOString();
      }
    });
    builder.addCase(markOrderAsDelivered.rejected, errorReducer);

    // Update Order Status
    builder.addCase(updateOrderStatus.pending, loadingReducer);
    builder.addCase(updateOrderStatus.fulfilled, (state, action) => {
      state.loading = false;
      state.successMessage = "Bestellstatus wurde aktualisiert.";
      const updated = action.payload.order;
      const index = state.orders.findIndex((o) => o._id === updated._id);
      if (index !== -1) state.orders[index] = updated;
    });
    builder.addCase(updateOrderStatus.rejected, errorReducer);
  },
});

export const { clearOrderMessages } = ordersSlice.actions;
export default ordersSlice.reducer;
