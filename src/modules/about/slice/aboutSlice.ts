import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IAbout } from "@/modules/about/types/about";

interface AboutState {
  about: IAbout[];
  selected: IAbout | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AboutState = {
  about: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 🌐 Public - fetch by language
export const fetchAbout = createAsyncThunk(
  "about/fetchAll",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/about?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// ➕ Create About
export const createAbout = createAsyncThunk(
  "about/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/about/admin",
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

// ✏️ Update About
export const updateAbout = createAsyncThunk(
  "about/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/about/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

// ❌ Delete About
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

// 🛠 Admin - fetch all abouts
export const fetchAllAboutAdmin = createAsyncThunk(
  "about/fetchAllAdmin",
  async (lang: "tr" | "en" | "de", thunkAPI) => {
    const res = await apiCall(
      "get",
      `/about/admin?language=${lang}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// 🔁 Toggle Publish (isPublished)
// 🔁 Toggle Publish
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
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);



// 🌐 Fetch by Slug
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
      state.error = action.payload?.message || "An error occurred.";
    };

    builder
      .addCase(fetchAbout.pending, startLoading)
      .addCase(fetchAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.about = action.payload;
      })
      .addCase(fetchAbout.rejected, setError)

      .addCase(fetchAllAboutAdmin.pending, startLoading)
      .addCase(fetchAllAboutAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.about = action.payload;
      })
      .addCase(fetchAllAboutAdmin.rejected, setError)

      .addCase(createAbout.pending, startLoading)
      .addCase(createAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "About created successfully.";
        if (action.payload?._id) {
          state.about.unshift(action.payload);
        }
      })
      .addCase(createAbout.rejected, setError)

      .addCase(updateAbout.pending, startLoading)
      .addCase(updateAbout.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.about.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.about[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = "About updated successfully.";
      })
      .addCase(updateAbout.rejected, setError)

      .addCase(deleteAbout.pending, startLoading)
      .addCase(deleteAbout.fulfilled, (state, action) => {
        state.loading = false;
        state.about = state.about.filter((a) => a._id !== action.payload.id);
        state.successMessage = "About deleted successfully.";
      })
      .addCase(deleteAbout.rejected, setError)

      .addCase(togglePublishAbout.pending, startLoading)
      .addCase(togglePublishAbout.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        const index = state.about.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.about[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = updated.isPublished
          ? "About published."
          : "About unpublished.";
      })
      .addCase(togglePublishAbout.rejected, setError)

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
