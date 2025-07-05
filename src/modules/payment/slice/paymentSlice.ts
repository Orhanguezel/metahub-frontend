import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IPayment, PaymentMethod } from "../types";

// -- State Tipi --
interface PaymentState {
  payments: IPayment[];
  myPayments: IPayment[];
  currentPayment: IPayment | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: PaymentState = {
  payments: [],
  myPayments: [],
  currentPayment: null,
  loading: false,
  error: null,
  successMessage: null,
};

// -- Thunks --

// 1. Create Payment
export const createPayment = createAsyncThunk<
  IPayment, // response
  Partial<IPayment>, // payload
  { rejectValue: string }
>("payment/createPayment", async (data, { rejectWithValue }) => {
  try {
    const res = await apiCall("post", "/payment", data, rejectWithValue);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Create failed");
  }
});

// 2. Get All Payments (Admin)
export const fetchAllPayments = createAsyncThunk<
  IPayment[],
  void,
  { rejectValue: string }
>("payment/fetchAllPayments", async (_, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", "/payment", null, rejectWithValue);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Fetch failed");
  }
});

// 3. Get Payment By Order ID
export const fetchPaymentByOrderId = createAsyncThunk<
  IPayment,
  string,
  { rejectValue: string }
>("payment/fetchPaymentByOrderId", async (orderId, { rejectWithValue }) => {
  try {
    const res = await apiCall(
      "get",
      `/payment/order/${orderId}`,
      null,
      rejectWithValue
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Fetch failed");
  }
});

// 4. Get My Payments (User)
export const fetchMyPayments = createAsyncThunk<
  IPayment[],
  void,
  { rejectValue: string }
>("payment/fetchMyPayments", async (_, { rejectWithValue }) => {
  try {
    const res = await apiCall("get", "/payment/user", null, rejectWithValue);
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Fetch failed");
  }
});

// 5. Get My Payment By Payment ID
export const fetchMyPaymentById = createAsyncThunk<
  IPayment,
  string,
  { rejectValue: string }
>("payment/fetchMyPaymentById", async (paymentId, { rejectWithValue }) => {
  try {
    const res = await apiCall(
      "get",
      `/payment/user/${paymentId}`,
      null,
      rejectWithValue
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Fetch failed");
  }
});

// 6. Mark Payment as Paid (Admin)
export const markPaymentAsPaid = createAsyncThunk<
  IPayment,
  string,
  { rejectValue: string }
>("payment/markPaymentAsPaid", async (paymentId, { rejectWithValue }) => {
  try {
    const res = await apiCall(
      "put",
      `/payment/${paymentId}/mark-paid`,
      null,
      rejectWithValue
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Mark as paid failed");
  }
});

// 7. Mark Payment as Failed (Admin)
export const markPaymentAsFailed = createAsyncThunk<
  IPayment,
  string,
  { rejectValue: string }
>("payment/markPaymentAsFailed", async (paymentId, { rejectWithValue }) => {
  try {
    const res = await apiCall(
      "put",
      `/payment/${paymentId}/mark-failed`,
      null,
      rejectWithValue
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Mark as failed failed");
  }
});

// 8. Update Payment Method (Admin)
export const updatePaymentMethod = createAsyncThunk<
  IPayment,
  { paymentId: string; method: PaymentMethod },
  { rejectValue: string }
>(
  "payment/updatePaymentMethod",
  async ({ paymentId, method }, { rejectWithValue }) => {
    try {
      const res = await apiCall(
        "put",
        `/payment/${paymentId}/update-method`,
        { method },
        rejectWithValue
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Update method failed");
    }
  }
);

// 9. Simulate Stripe Payment (Admin)
export const simulateStripePayment = createAsyncThunk<
  IPayment,
  void,
  { rejectValue: string }
>("payment/simulateStripePayment", async (_, { rejectWithValue }) => {
  try {
    const res = await apiCall(
      "post",
      "/payment/simulate/stripe",
      null,
      rejectWithValue
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "Stripe simulation failed");
  }
});

// 10. Simulate PayPal Payment (Admin)
export const simulatePayPalPayment = createAsyncThunk<
  IPayment,
  void,
  { rejectValue: string }
>("payment/simulatePayPalPayment", async (_, { rejectWithValue }) => {
  try {
    const res = await apiCall(
      "post",
      "/payment/simulate/paypal",
      null,
      rejectWithValue
    );
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err?.message || "PayPal simulation failed");
  }
});

// -- Slice --
const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    clearPaymentMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    resetCurrentPayment(state) {
      state.currentPayment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Create Payment ---
      .addCase(createPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Payment created.";
        state.payments.push(action.payload);
      })
      .addCase(createPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Payment create error.";
      })

      // --- Fetch All Payments ---
      .addCase(fetchAllPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.payments = action.payload || [];
      })
      .addCase(fetchAllPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch all payments error.";
      })

      // --- Fetch Payment By Order ID ---
      .addCase(fetchPaymentByOrderId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPaymentByOrderId.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload || null;
      })
      .addCase(fetchPaymentByOrderId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch payment by order error.";
      })

      // --- Fetch My Payments ---
      .addCase(fetchMyPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.myPayments = action.payload || [];
      })
      .addCase(fetchMyPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch my payments error.";
      })

      // --- Fetch My Payment By ID ---
      .addCase(fetchMyPaymentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPaymentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload || null;
      })
      .addCase(fetchMyPaymentById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Fetch my payment error.";
      })

      // --- Mark as Paid ---
      .addCase(markPaymentAsPaid.fulfilled, (state, action) => {
        state.successMessage = "Payment marked as paid.";
        state.loading = false;
        // Update payment status in array
        const idx = state.payments.findIndex(
          (p) => p.order === action.payload.order
        );
        if (idx !== -1) state.payments[idx] = action.payload;
      })
      .addCase(markPaymentAsPaid.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markPaymentAsPaid.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Mark as paid error.";
      })

      // --- Mark as Failed ---
      .addCase(markPaymentAsFailed.fulfilled, (state, action) => {
        state.successMessage = "Payment marked as failed.";
        state.loading = false;
        // Update payment status in array
        const idx = state.payments.findIndex(
          (p) => p.order === action.payload.order
        );
        if (idx !== -1) state.payments[idx] = action.payload;
      })
      .addCase(markPaymentAsFailed.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(markPaymentAsFailed.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Mark as failed error.";
      })

      // --- Update Payment Method ---
      .addCase(updatePaymentMethod.fulfilled, (state, action) => {
        state.successMessage = "Payment method updated.";
        state.loading = false;
        const idx = state.payments.findIndex(
          (p) => p.order === action.payload.order
        );
        if (idx !== -1) state.payments[idx] = action.payload;
      })
      .addCase(updatePaymentMethod.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePaymentMethod.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Update method error.";
      })

      // --- Simulate Stripe ---
      .addCase(simulateStripePayment.fulfilled, (state) => {
        state.successMessage = "Stripe payment simulated.";
        state.loading = false;
      })
      .addCase(simulateStripePayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(simulateStripePayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "Stripe simulate error.";
      })

      // --- Simulate PayPal ---
      .addCase(simulatePayPalPayment.fulfilled, (state) => {
        state.successMessage = "PayPal payment simulated.";
        state.loading = false;
      })
      .addCase(simulatePayPalPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(simulatePayPalPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || "PayPal simulate error.";
      });
  },
});

export const { clearPaymentMessages, resetCurrentPayment } =
  paymentSlice.actions;
export default paymentSlice.reducer;
