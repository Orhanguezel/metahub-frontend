import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// Veri tipi
interface MonthlyStat {
  month: string;
  total: number;
}

// Slice state yapısı
interface ChartDataState {
  ordersByMonth: MonthlyStat[];
  revenueByMonth: MonthlyStat[];
  isLoadingOrders: boolean;
  isLoadingRevenue: boolean;
  error: string | null;
}

const initialState: ChartDataState = {
  ordersByMonth: [],
  revenueByMonth: [],
  isLoadingOrders: false,
  isLoadingRevenue: false,
  error: null,
};

// 🔄 Aylık sipariş verilerini çek
export const fetchMonthlyOrders = createAsyncThunk(
  "chartData/fetchMonthlyOrders",
  async (_, thunkAPI) =>
    await apiCall("get", "/dashboard/charts/orders", null, thunkAPI.rejectWithValue)
);

// 🔄 Aylık gelir verilerini çek
export const fetchMonthlyRevenue = createAsyncThunk(
  "chartData/fetchMonthlyRevenue",
  async (_, thunkAPI) =>
    await apiCall("get", "/dashboard/charts/revenue", null, thunkAPI.rejectWithValue)
);

// Slice
const chartDataSlice = createSlice({
  name: "chartData",
  initialState,
  reducers: {
    clearChartError: (state) => {
      state.error = null;
    },
    resetChartData: (state) => {
      state.ordersByMonth = [];
      state.revenueByMonth = [];
      state.isLoadingOrders = false;
      state.isLoadingRevenue = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 📈 Sipariş verileri
    builder.addCase(fetchMonthlyOrders.pending, (state) => {
      state.isLoadingOrders = true;
    });
    builder.addCase(fetchMonthlyOrders.fulfilled, (state, action: PayloadAction<MonthlyStat[]>) => {
      state.isLoadingOrders = false;
      state.ordersByMonth = action.payload;
    });
    builder.addCase(fetchMonthlyOrders.rejected, (state, action) => {
      state.isLoadingOrders = false;
      state.error = action.payload as string;
    });

    // 💰 Gelir verileri
    builder.addCase(fetchMonthlyRevenue.pending, (state) => {
      state.isLoadingRevenue = true;
    });
    builder.addCase(fetchMonthlyRevenue.fulfilled, (state, action: PayloadAction<MonthlyStat[]>) => {
      state.isLoadingRevenue = false;
      state.revenueByMonth = action.payload;
    });
    builder.addCase(fetchMonthlyRevenue.rejected, (state, action) => {
      state.isLoadingRevenue = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearChartError, resetChartData } = chartDataSlice.actions;
export default chartDataSlice.reducer;
