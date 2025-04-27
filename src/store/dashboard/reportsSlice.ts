// src/store/reportsSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// Veri tipi
interface ReportEntry {
  label: string;
  value: number;
}

// Store tipi
interface ReportsState {
  topProducts: ReportEntry[];
  userRoles: ReportEntry[];
  isLoadingTopProducts: boolean;
  isLoadingUserRoles: boolean;
  error: string | null;
}

const initialState: ReportsState = {
  topProducts: [],
  userRoles: [],
  isLoadingTopProducts: false,
  isLoadingUserRoles: false,
  error: null,
};

// 🔝 En çok satılan ürünler
export const fetchTopProducts = createAsyncThunk(
  "reports/fetchTopProducts",
  async (_, thunkAPI) =>
    await apiCall("get", "/dashboard/reports/top-products", null, thunkAPI.rejectWithValue)
);

// 👥 Kullanıcı rol dağılımı
export const fetchUserRoleStats = createAsyncThunk(
  "reports/fetchUserRoles",
  async (_, thunkAPI) =>
    await apiCall("get", "/dashboard/reports/user-roles", null, thunkAPI.rejectWithValue)
);

// Slice
const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {
    clearReportError: (state) => {
      state.error = null;
    },
    resetReports: (state) => {
      state.topProducts = [];
      state.userRoles = [];
      state.isLoadingTopProducts = false;
      state.isLoadingUserRoles = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // 📊 Top Products
    builder.addCase(fetchTopProducts.pending, (state) => {
      state.isLoadingTopProducts = true;
    });
    builder.addCase(fetchTopProducts.fulfilled, (state, action: PayloadAction<ReportEntry[]>) => {
      state.isLoadingTopProducts = false;
      state.topProducts = action.payload;
    });
    builder.addCase(fetchTopProducts.rejected, (state, action) => {
      state.isLoadingTopProducts = false;
      state.error = action.payload as string;
    });

    // 👥 User Roles
    builder.addCase(fetchUserRoleStats.pending, (state) => {
      state.isLoadingUserRoles = true;
    });
    builder.addCase(fetchUserRoleStats.fulfilled, (state, action: PayloadAction<ReportEntry[]>) => {
      state.isLoadingUserRoles = false;
      state.userRoles = action.payload;
    });
    builder.addCase(fetchUserRoleStats.rejected, (state, action) => {
      state.isLoadingUserRoles = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearReportError, resetReports } = reportsSlice.actions;
export default reportsSlice.reducer;
