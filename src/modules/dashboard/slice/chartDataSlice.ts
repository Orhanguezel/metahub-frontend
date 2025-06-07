import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface MonthlyStat {
  month: string;
  totalOrders?: number;
  totalRevenue?: number;
}

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

export const fetchMonthlyOrders = createAsyncThunk(
  "chartData/fetchMonthlyOrders",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/dashboard/charts/orders", null, thunkAPI.rejectWithValue);
    return res.data.data as MonthlyStat[]; // backend'den: [{month: "Jan", totalOrders: X}, ...]
  }
);

export const fetchMonthlyRevenue = createAsyncThunk(
  "chartData/fetchMonthlyRevenue",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/dashboard/charts/revenue", null, thunkAPI.rejectWithValue);
    return res.data.data as MonthlyStat[]; // backend'den: [{month: "Jan", totalRevenue: X}, ...]
  }
);

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
    builder
      .addCase(fetchMonthlyOrders.pending, (state) => {
        state.isLoadingOrders = true;
      })
      .addCase(fetchMonthlyOrders.fulfilled, (state, action: PayloadAction<MonthlyStat[]>) => {
        state.isLoadingOrders = false;
        state.ordersByMonth = action.payload;
      })
      .addCase(fetchMonthlyOrders.rejected, (state, action) => {
        state.isLoadingOrders = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMonthlyRevenue.pending, (state) => {
        state.isLoadingRevenue = true;
      })
      .addCase(fetchMonthlyRevenue.fulfilled, (state, action: PayloadAction<MonthlyStat[]>) => {
        state.isLoadingRevenue = false;
        state.revenueByMonth = action.payload;
      })
      .addCase(fetchMonthlyRevenue.rejected, (state, action) => {
        state.isLoadingRevenue = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearChartError, resetChartData } = chartDataSlice.actions;
export default chartDataSlice.reducer;
