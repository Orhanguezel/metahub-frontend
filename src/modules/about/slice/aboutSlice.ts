import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IAbout } from "@/modules/about";

interface AboutState {
  about: IAbout[]; // Public (site) için
  aboutAdmin: IAbout[]; // Admin panel için
  selected: IAbout | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AboutState = {
  about: [],
  aboutAdmin: [],
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

export const fetchAbout = createAsyncThunk<IAbout[]>(
  "about/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/about`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

export const fetchAllAboutAdmin = createAsyncThunk<IAbout[]>(
  "about/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/about/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createAbout = createAsyncThunk(
  "about/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/about/admin",
      formData,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const updateAbout = createAsyncThunk(
  "about/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/about/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const deleteAbout = createAsyncThunk(
  "about/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/about/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const togglePublishAbout = createAsyncThunk(
  "about/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/about/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const fetchAboutBySlug = createAsyncThunk(
  "about/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/about/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---

const aboutSlice = createSlice({
  name: "about",
  initialState,
  reducers: {
    clearAboutMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedAbout(state, action: PayloadAction<IAbout | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: AboutState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: AboutState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    // --- Public List ---
    builder
      .addCase(fetchAbout.pending, startLoading)
      .addCase(fetchAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.about = action.payload;
      })
      .addCase(fetchAbout.rejected, setError);

    // --- Admin List ---
    builder
      .addCase(fetchAllAboutAdmin.pending, startLoading)
      .addCase(fetchAllAboutAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.aboutAdmin = action.payload;
      })
      .addCase(fetchAllAboutAdmin.rejected, setError);

    // --- Admin Create ---
    builder
      .addCase(createAbout.pending, startLoading)
      .addCase(createAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage =
          action.payload?.message;
        if (action.payload?.data) {
          state.aboutAdmin.unshift(action.payload.data);
        }
      })
      .addCase(createAbout.rejected, setError);

    // --- Admin Update ---
    builder
      .addCase(updateAbout.pending, startLoading)
      .addCase(updateAbout.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.aboutAdmin.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.aboutAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateAbout.rejected, setError);

    // --- Admin Delete ---
    builder
      .addCase(deleteAbout.pending, startLoading)
      .addCase(deleteAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.aboutAdmin = state.aboutAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteAbout.rejected, setError);

    // --- Admin Toggle Publish ---
    builder
      .addCase(togglePublishAbout.pending, startLoading)
      .addCase(togglePublishAbout.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.aboutAdmin.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.aboutAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishAbout.rejected, setError);

    // --- Single Fetch (slug) ---
    builder
      .addCase(fetchAboutBySlug.pending, startLoading)
      .addCase(fetchAboutBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchAboutBySlug.rejected, setError);
  },
});

export const { clearAboutMessages, setSelectedAbout } = aboutSlice.actions;
export default aboutSlice.reducer;
