import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ISkill } from "@/modules/skill";

interface SkillState {
  skill: ISkill[];
  skillAdmin: ISkill[];
  selected: ISkill | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: SkillState = {
  skill: [],
  skillAdmin: [],
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

export const fetchSkill = createAsyncThunk<ISkill[]>(
  "skill/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/skill`, null, thunkAPI.rejectWithValue);
    // response: { success, message, data }
    return res.data;
  }
);

export const fetchAllSkillAdmin = createAsyncThunk<ISkill[]>(
  "skill/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/skill/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createSkill = createAsyncThunk(
  "skill/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/skill/admin",
      formData,
      thunkAPI.rejectWithValue
    );
    // return: { success, message, data }
    return { ...res, data: res.data };
  }
);

export const updateSkill = createAsyncThunk(
  "skill/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/skill/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const deleteSkill = createAsyncThunk(
  "skill/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/skill/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    // return: { success, message }
    return { id, message: res.message };
  }
);

export const togglePublishSkill = createAsyncThunk(
  "skill/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/skill/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return { ...res, data: res.data };
  }
);

export const fetchSkillBySlug = createAsyncThunk(
  "skill/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/skill/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---
const skillSlice = createSlice({
  name: "skill",
  initialState,
  reducers: {
    clearSkillMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedSkill: (state, action: PayloadAction<ISkill | null>) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: SkillState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };

    const setError = (state: SkillState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = extractErrorMessage(action.payload);
    };

    // 🌐 Public
    builder
      .addCase(fetchSkill.pending, setLoading)
      .addCase(fetchSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.skill = action.payload;
      })
      .addCase(fetchSkill.rejected, setError);

    // 🔐 Admin List
    builder
      .addCase(fetchAllSkillAdmin.pending, setLoading)
      .addCase(fetchAllSkillAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.skillAdmin = action.payload;
      })
      .addCase(fetchAllSkillAdmin.rejected, setError);

    // ➕ Create
    builder
      .addCase(createSkill.pending, setLoading)
      .addCase(createSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.skillAdmin.unshift(action.payload.data);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(createSkill.rejected, setError);

    // 📝 Update
    builder
      .addCase(updateSkill.pending, setLoading)
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.skillAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.skillAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(updateSkill.rejected, setError);

    // 🗑️ Delete
    builder
      .addCase(deleteSkill.pending, setLoading)
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.skillAdmin = state.skillAdmin.filter((a) => a._id !== action.payload.id);
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(deleteSkill.rejected, setError);

    // 🌍 Toggle Publish
    builder
      .addCase(togglePublishSkill.pending, setLoading)
      .addCase(togglePublishSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload.data;
        const i = state.skillAdmin.findIndex((a) => a._id === updated._id);
        if (i !== -1) state.skillAdmin[i] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload.message; // 👈 BACKEND'DEN
      })
      .addCase(togglePublishSkill.rejected, setError);

    // 🔎 Single (Slug)
    builder
      .addCase(fetchSkillBySlug.pending, setLoading)
      .addCase(fetchSkillBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchSkillBySlug.rejected, setError);
  },
});

export const { clearSkillMessages, setSelectedSkill } = skillSlice.actions;
export default skillSlice.reducer;
