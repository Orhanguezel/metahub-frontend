import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IPortfolio } from "@/modules/portfolio";

interface PortfolioState {
  portfolio: IPortfolio[];
  portfolioAdmin: IPortfolio[];
  selected: IPortfolio | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: PortfolioState = {
  portfolio: [],
  portfolioAdmin: [],
  selected: null,
  status: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const extractErrorMessage = (payload: unknown): string => {
  if (typeof payload === "string") return payload;
  if (
    typeof payload === "object" &&
    payload !== null &&
    "message" in payload &&
    typeof (payload as any).message === "string"
  )
    return (payload as any).message;
  return "An error occurred.";
};

// --- Async Thunks ---

export const fetchPortfolio = createAsyncThunk<IPortfolio[]>(
  "portfolio/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/portfolio`, null, thunkAPI.rejectWithValue);
    // response: { success, message, data }
    return res.data;
  }
);

export const fetchAllPortfolioAdmin = createAsyncThunk<IPortfolio[]>(
  "portfolio/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/portfolio/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createPortfolio = createAsyncThunk(
  "portfolio/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/portfolio/admin",
      formData,
      thunkAPI.rejectWithValue
    );
    // return: { success, message, data }
    return { ...res, data: res.data };
  }
);

export const updatePortfolio = createAsyncThunk(
  "portfolio/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/portfolio/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const deletePortfolio = createAsyncThunk(
  "portfolio/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/portfolio/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    // return: { success, message }
    return { id, message: res.message };
  }
);

export const togglePublishPortfolio = createAsyncThunk(
  "portfolio/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/portfolio/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const fetchPortfolioBySlug = createAsyncThunk(
  "portfolio/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/portfolio/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---
const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    clearPortfolioMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedPortfolio: (state, action: PayloadAction<IPortfolio | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: PortfolioState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: PortfolioState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchPortfolio.pending, setLoading)
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.portfolio = action.payload;
      })
      .addCase(fetchPortfolio.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllPortfolioAdmin.pending, setLoading)
      .addCase(fetchAllPortfolioAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.portfolioAdmin = action.payload;
      })
      .addCase(fetchAllPortfolioAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createPortfolio.pending, setLoading)
      .addCase(createPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.portfolioAdmin.unshift(action.payload.data);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(createPortfolio.rejected, setError);

    // 📝 Update
    builder
      .addCase(updatePortfolio.pending, setLoading)
      .addCase(updatePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.portfolioAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.portfolioAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(updatePortfolio.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deletePortfolio.pending, setLoading)
      .addCase(deletePortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.portfolioAdmin = state.portfolioAdmin.filter((a) => a._id !== action.payload.id);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(deletePortfolio.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishPortfolio.pending, setLoading)
      .addCase(togglePublishPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.portfolioAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.portfolioAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(togglePublishPortfolio.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchPortfolioBySlug.pending, setLoading)
      .addCase(fetchPortfolioBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchPortfolioBySlug.rejected, setError);
  },
});

export const { clearPortfolioMessages, setSelectedPortfolio } = portfolioSlice.actions;
export default portfolioSlice.reducer;
