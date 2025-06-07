import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

// /dashboard/reports/top-products -> { data: [{ productId, name, totalSold }] }
// /dashboard/reports/user-roles -> { data: [{ role, count }] }

interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
}

interface UserRole {
  role: string;
  count: number;
}

interface ReportsState {
  topProducts: TopProduct[];
  userRoles: UserRole[];
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

export const fetchTopProducts = createAsyncThunk(
  "reports/fetchTopProducts",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/dashboard/reports/top-products", null, thunkAPI.rejectWithValue);
    return res.data.data as TopProduct[];
  }
);

export const fetchUserRoleStats = createAsyncThunk(
  "reports/fetchUserRoles",
  async (_, thunkAPI) => {
    const res = await apiCall("get", "/dashboard/reports/user-roles", null, thunkAPI.rejectWithValue);
    return res.data.data as UserRole[];
  }
);

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
    builder
      .addCase(fetchTopProducts.pending, (state) => {
        state.isLoadingTopProducts = true;
      })
      .addCase(fetchTopProducts.fulfilled, (state, action: PayloadAction<TopProduct[]>) => {
        state.isLoadingTopProducts = false;
        state.topProducts = action.payload;
      })
      .addCase(fetchTopProducts.rejected, (state, action) => {
        state.isLoadingTopProducts = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserRoleStats.pending, (state) => {
        state.isLoadingUserRoles = true;
      })
      .addCase(fetchUserRoleStats.fulfilled, (state, action: PayloadAction<UserRole[]>) => {
        state.isLoadingUserRoles = false;
        state.userRoles = action.payload;
      })
      .addCase(fetchUserRoleStats.rejected, (state, action) => {
        state.isLoadingUserRoles = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearReportError, resetReports } = reportsSlice.actions;
export default reportsSlice.reducer;
