import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IAbout } from "@/modules/about";

interface AboutState {
  about: IAbout[];
  aboutAdmin: IAbout[];
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

const BASE = "/about";

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
    const res = await apiCall("get", `${BASE}`, null, thunkAPI.rejectWithValue);
    // response: { success, message, data }
    return res.data;
  }
);

export const fetchAllAboutAdmin = createAsyncThunk<IAbout[]>(
  "about/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/admin`,
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
      `${BASE}/admin`,
      formData,
      thunkAPI.rejectWithValue
    );
    // return: { success, message, data }
    return { ...res, data: res.data };
  }
);

export const updateAbout = createAsyncThunk(
  "about/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `${BASE}/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const deleteAbout = createAsyncThunk(
  "about/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `${BASE}/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    // return: { success, message }
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
      `${BASE}/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const fetchAboutBySlug = createAsyncThunk(
  "about/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `${BASE}/slug/${slug}`,
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
    clearAboutMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedAbout: (state, action: PayloadAction<IAbout | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: AboutState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: AboutState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchAbout.pending, setLoading)
      .addCase(fetchAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.about = action.payload;
      })
      .addCase(fetchAbout.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllAboutAdmin.pending, setLoading)
      .addCase(fetchAllAboutAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.aboutAdmin = action.payload;
      })
      .addCase(fetchAllAboutAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createAbout.pending, setLoading)
      .addCase(createAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.aboutAdmin.unshift(action.payload.data);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(createAbout.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateAbout.pending, setLoading)
      .addCase(updateAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.aboutAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.aboutAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(updateAbout.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteAbout.pending, setLoading)
      .addCase(deleteAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.aboutAdmin = state.aboutAdmin.filter((a) => a._id !== action.payload.id);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(deleteAbout.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishAbout.pending, setLoading)
      .addCase(togglePublishAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.aboutAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.aboutAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(togglePublishAbout.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchAboutBySlug.pending, setLoading)
      .addCase(fetchAboutBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchAboutBySlug.rejected, setError);
  },
});

export const { clearAboutMessages, setSelectedAbout } = aboutSlice.actions;
export default aboutSlice.reducer;
