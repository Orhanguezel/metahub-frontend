import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ISkill } from "@/modules/skill";

type StatusType = "idle" | "loading" | "succeeded" | "failed";

interface SkillState {
  skill: ISkill[];
  skillAdmin: ISkill[];
  selected: ISkill | null;
  status: StatusType;           // <-- EKLENDİ
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
    const res = await apiCall(
      "get",
      `/skill`,
      null,
      thunkAPI.rejectWithValue
    );
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
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
  }
);

export const updateSkill = createAsyncThunk(
  "skill/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/skill/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
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
      thunkAPI.rejectWithValue,
      {
        headers: { "Content-Type": "multipart/form-data" },
      }
    );
    return res.data;
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
    clearSkillMessages(state) {
      state.error = null;
      state.successMessage = null;
      state.status = "idle";
    },
    setSelectedSkill(state, action: PayloadAction<ISkill | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: SkillState) => {
      state.loading = true;
      state.status = "loading";    // <-- EKLENDİ
      state.error = null;
      state.successMessage = null;
    };

    const setError = (state: SkillState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";     // <-- EKLENDİ
      state.error = extractErrorMessage(action.payload);
      state.successMessage = null;
    };

    builder
      // Public List
      .addCase(fetchSkill.pending, startLoading)
      .addCase(fetchSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.skill = action.payload;
      })
      .addCase(fetchSkill.rejected, setError)

      // Admin List
      .addCase(fetchAllSkillAdmin.pending, startLoading)
      .addCase(fetchAllSkillAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.skillAdmin = action.payload;
      })
      .addCase(fetchAllSkillAdmin.rejected, setError)

      // Create
      .addCase(createSkill.pending, startLoading)
      .addCase(createSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        if (action.payload?.data) {
          state.skillAdmin.unshift(action.payload.data);
          state.successMessage = action.payload?.message || null;
        }
      })
      .addCase(createSkill.rejected, setError)

      // Update
      .addCase(updateSkill.pending, startLoading)
      .addCase(updateSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload?.data || action.payload;
        const index = state.skillAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.skillAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message || null;
      })
      .addCase(updateSkill.rejected, setError)

      // Delete
      .addCase(deleteSkill.pending, startLoading)
      .addCase(deleteSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.skillAdmin = state.skillAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message || null;
      })
      .addCase(deleteSkill.rejected, setError)

      // Toggle Publish
      .addCase(togglePublishSkill.pending, startLoading)
      .addCase(togglePublishSkill.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        const updated = action.payload?.data || action.payload;
        const index = state.skillAdmin.findIndex(
          (a) => a._id === updated._id
        );
        if (index !== -1) state.skillAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message || null;
      })
      .addCase(togglePublishSkill.rejected, setError)

      // Single Fetch (slug)
      .addCase(fetchSkillBySlug.pending, startLoading)
      .addCase(fetchSkillBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.selected = action.payload;
      })
      .addCase(fetchSkillBySlug.rejected, setError);
  },
});

export const { clearSkillMessages, setSelectedSkill } =
  skillSlice.actions;
export default skillSlice.reducer;
