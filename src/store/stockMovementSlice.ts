import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { RootState } from ".";

interface StockMovement {
  _id?: string;
  product: string | { _id: string; name: string };
  type: "in" | "out";
  quantity: number;
  note?: string;
  createdBy?: { name: string; email: string };
  createdAt?: string;
}

interface StockMovementState {
  movements: StockMovement[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: StockMovementState = {
  movements: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 🧩 Hareket oluştur
export const createStockMovement = createAsyncThunk(
  "stockMovement/create",
  async (
    payload: {
      product: string;
      type: "in" | "out";
      quantity: number;
      note?: string;
    },
    thunkAPI
  ) =>
    await apiCall("post", "/stock-movements", payload, thunkAPI.rejectWithValue)
);

// 🧩 Hareketleri getir
export const fetchStockMovements = createAsyncThunk(
  "stockMovement/fetchAll",
  async (args: { productId?: string }, thunkAPI) => {
    const { productId } = args;
    return await apiCall(
      "get",
      `/stock-movements${productId ? `?product=${productId}` : ""}`,
      null,
      thunkAPI.rejectWithValue
    );
  }
);

// Slice
const stockMovementSlice = createSlice({
  name: "stockMovement",
  initialState,
  reducers: {
    clearStockMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    const loadingReducer = (state: StockMovementState) => {
      state.loading = true;
      state.error = null;
    };

    const errorReducer = (
      state: StockMovementState,
      action: PayloadAction<any>
    ) => {
      state.loading = false;
      state.error = action.payload;
    };

    builder
      .addCase(createStockMovement.pending, loadingReducer)
      .addCase(createStockMovement.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Stok hareketi başarıyla kaydedildi.";
        state.movements.unshift(action.payload.movement);
      })
      .addCase(createStockMovement.rejected, errorReducer);

    builder
      .addCase(fetchStockMovements.pending, loadingReducer)
      .addCase(fetchStockMovements.fulfilled, (state, action) => {
        state.loading = false;
        state.movements = action.payload;
      })
      .addCase(fetchStockMovements.rejected, errorReducer);
  },
});

export const { clearStockMessages } = stockMovementSlice.actions;

export const selectStockMovements = (state: RootState) =>
  state.stockMovement.movements;
export const selectStockLoading = (state: RootState) =>
  state.stockMovement.loading;
export const selectStockError = (state: RootState) => state.stockMovement.error;

export default stockMovementSlice.reducer;
