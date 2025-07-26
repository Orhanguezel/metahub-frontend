import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ITeam } from "@/modules/team";

interface TeamState {
  team: ITeam[]; // Public (site) için
  teamAdmin: ITeam[]; // Admin panel için
  selected: ITeam | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: TeamState = {
  team: [],
  teamAdmin: [],
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

export const fetchTeam = createAsyncThunk<ITeam[]>(
  "team/fetchAll",
  async (_, thunkAPI) => {
    const res = await apiCall("get", `/team`, null, thunkAPI.rejectWithValue);
    return res.data;
  }
);

export const fetchAllTeamAdmin = createAsyncThunk<ITeam[]>(
  "team/fetchAllAdmin",
  async (_, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/team/admin`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const createTeam = createAsyncThunk(
  "team/create",
  async (formData: FormData, thunkAPI) => {
    const res = await apiCall(
      "post",
      "/team/admin",
      formData,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const updateTeam = createAsyncThunk(
  "team/update",
  async ({ id, formData }: { id: string; formData: FormData }, thunkAPI) => {
    const res = await apiCall(
      "put",
      `/team/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const deleteTeam = createAsyncThunk(
  "team/delete",
  async (id: string, thunkAPI) => {
    const res = await apiCall(
      "delete",
      `/team/admin/${id}`,
      null,
      thunkAPI.rejectWithValue
    );
    return { id, message: res.message };
  }
);

export const togglePublishTeam = createAsyncThunk(
  "team/togglePublish",
  async (
    { id, isPublished }: { id: string; isPublished: boolean },
    thunkAPI
  ) => {
    const formData = new FormData();
    formData.append("isPublished", String(isPublished));
    const res = await apiCall(
      "put",
      `/team/admin/${id}`,
      formData,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

export const fetchTeamBySlug = createAsyncThunk(
  "team/fetchBySlug",
  async (slug: string, thunkAPI) => {
    const res = await apiCall(
      "get",
      `/team/slug/${slug}`,
      null,
      thunkAPI.rejectWithValue
    );
    return res.data;
  }
);

// --- Slice ---

const teamSlice = createSlice({
  name: "team",
  initialState,
  reducers: {
    clearTeamMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    setSelectedTeam(state, action: PayloadAction<ITeam | null>) {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    const startLoading = (state: TeamState) => {
      state.loading = true;
      state.error = null;
    };

    const setError = (state: TeamState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = extractErrorMessage(action.payload);
    };

    // --- Public List ---
    builder
      .addCase(fetchTeam.pending, startLoading)
      .addCase(fetchTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.team = action.payload;
      })
      .addCase(fetchTeam.rejected, setError);

    // --- Admin List ---
    builder
      .addCase(fetchAllTeamAdmin.pending, startLoading)
      .addCase(fetchAllTeamAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.teamAdmin = action.payload;
      })
      .addCase(fetchAllTeamAdmin.rejected, setError);

    // --- Admin Create ---
    builder
      .addCase(createTeam.pending, startLoading)
      .addCase(createTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload?.message;
        if (action.payload?.data) {
          state.teamAdmin.unshift(action.payload.data);
        }
      })
      .addCase(createTeam.rejected, setError);

    // --- Admin Update ---
    builder
      .addCase(updateTeam.pending, startLoading)
      .addCase(updateTeam.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.teamAdmin.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.teamAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(updateTeam.rejected, setError);

    // --- Admin Delete ---
    builder
      .addCase(deleteTeam.pending, startLoading)
      .addCase(deleteTeam.fulfilled, (state, action) => {
        state.loading = false;
        state.teamAdmin = state.teamAdmin.filter(
          (a) => a._id !== action.payload.id
        );
        state.successMessage = action.payload?.message;
      })
      .addCase(deleteTeam.rejected, setError);

    // --- Admin Toggle Publish ---
    builder
      .addCase(togglePublishTeam.pending, startLoading)
      .addCase(togglePublishTeam.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload?.data || action.payload;
        const index = state.teamAdmin.findIndex((a) => a._id === updated._id);
        if (index !== -1) state.teamAdmin[index] = updated;
        if (state.selected?._id === updated._id) state.selected = updated;
        state.successMessage = action.payload?.message;
      })
      .addCase(togglePublishTeam.rejected, setError);

    // --- Single Fetch (slug) ---
    builder
      .addCase(fetchTeamBySlug.pending, startLoading)
      .addCase(fetchTeamBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload;
      })
      .addCase(fetchTeamBySlug.rejected, setError);
  },
});

export const { clearTeamMessages, setSelectedTeam } = teamSlice.actions;
export default teamSlice.reducer;
