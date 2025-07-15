import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IBookingSlotRule,
  IBookingSlotOverride,
} from "@/modules/booking/types";

// Net state: admin ve public alanları ayrı
interface BookingSlotState {
  // 🌍 Public
  availableSlots: string[];
  rules: IBookingSlotRule[];         // Çalışma saatleri (public)
  overrides: IBookingSlotOverride[]; // Tatil/kapatma (public)

  // 🛠️ Admin
  rulesAdmin: IBookingSlotRule[];
  overridesAdmin: IBookingSlotOverride[];

  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: BookingSlotState = {
  availableSlots: [],
  rules: [],
  overrides: [],
  rulesAdmin: [],
  overridesAdmin: [],
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// --- PUBLIC THUNKS ---

// 1️⃣ Public: Slot Kuralları (Çalışma saatleri)
export const fetchSlotRules = createAsyncThunk(
  "bookingSlot/fetchSlotRules",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/rules", null, rejectWithValue);
    return res.rules;
  }
);

// 2️⃣ Public: Slot Overrides (Tatil/kapatma)
export const fetchSlotOverrides = createAsyncThunk(
  "bookingSlot/fetchSlotOverrides",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/overrides", null, rejectWithValue);
    return res.overrides;
  }
);

// 3️⃣ Public: Mevcut Slotlar (Günlük)
export const fetchAvailableSlots = createAsyncThunk(
  "bookingSlot/fetchAvailableSlots",
  async (date: string, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot", { date }, rejectWithValue);
    return res.slots;
  }
);

// --- ADMIN THUNKS ---
// (Admin panelde kullanılacak endpointler. Public sayfada asla çağrılmaz!)

// Admin: Get Rules
export const fetchSlotRulesAdmin = createAsyncThunk(
  "bookingSlot/fetchSlotRulesAdmin",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/admin/rule", null, rejectWithValue);
    return res.data;
  }
);

// Admin: Get Overrides
export const fetchSlotOverridesAdmin = createAsyncThunk(
  "bookingSlot/fetchSlotOverridesAdmin",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/admin/override", null, rejectWithValue);
    return res.data;
  }
);

// Admin: Create Rule
export const createSlotRuleAdmin = createAsyncThunk(
  "bookingSlot/createSlotRuleAdmin",
  async (data: Partial<IBookingSlotRule>, { rejectWithValue }) => {
    const res = await apiCall("post", "/bookingslot/admin/rule", data, rejectWithValue);
    return res.rule;
  }
);

// Admin: Delete Rule
export const deleteSlotRuleAdmin = createAsyncThunk(
  "bookingSlot/deleteSlotRuleAdmin",
  async (id: string, { rejectWithValue }) => {
    await apiCall("delete", `/bookingslot/admin/rule/${id}`, null, rejectWithValue);
    return id;
  }
);

// Admin: Create Override
export const createSlotOverrideAdmin = createAsyncThunk(
  "bookingSlot/createSlotOverrideAdmin",
  async (data: Partial<IBookingSlotOverride>, { rejectWithValue }) => {
    const res = await apiCall("post", "/bookingslot/admin/override", data, rejectWithValue);
    return res.override;
  }
);

// Admin: Delete Override
export const deleteSlotOverrideAdmin = createAsyncThunk(
  "bookingSlot/deleteSlotOverrideAdmin",
  async (id: string, { rejectWithValue }) => {
    await apiCall("delete", `/bookingslot/admin/override/${id}`, null, rejectWithValue);
    return id;
  }
);

// Admin: Update Rule
export const updateSlotRuleAdmin = createAsyncThunk(
  "bookingSlot/updateSlotRuleAdmin",
  async (
    { id, data }: { id: string; data: Partial<IBookingSlotRule> },
    { rejectWithValue }
  ) => {
    const res = await apiCall("patch", `/bookingslot/admin/rule/${id}`, data, rejectWithValue);
    return res.rule;
  }
);

const bookingSlotSlice = createSlice({
  name: "bookingSlot",
  initialState,
  reducers: {
    clearSlotMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // --- PUBLIC ---
    builder
      .addCase(fetchSlotRules.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlotRules.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = action.payload;
      })
      .addCase(fetchSlotRules.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not fetch slot rules.";
      })

      .addCase(fetchSlotOverrides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlotOverrides.fulfilled, (state, action) => {
        state.loading = false;
        state.overrides = action.payload;
      })
      .addCase(fetchSlotOverrides.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not fetch slot overrides.";
      })

      .addCase(fetchAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not fetch available slots.";
      });

    // --- ADMIN ---
    builder
      .addCase(fetchSlotRulesAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlotRulesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.rulesAdmin = action.payload;
      })
      .addCase(fetchSlotRulesAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not fetch slot rules (admin).";
      })

      .addCase(fetchSlotOverridesAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSlotOverridesAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.overridesAdmin = action.payload;
      })
      .addCase(fetchSlotOverridesAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not fetch slot overrides (admin).";
      })

      .addCase(createSlotRuleAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSlotRuleAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule created.";
        state.rulesAdmin.push(action.payload);
      })
      .addCase(createSlotRuleAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not create slot rule.";
      })

      .addCase(deleteSlotRuleAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSlotRuleAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule deleted.";
        state.rulesAdmin = state.rulesAdmin.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteSlotRuleAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not delete slot rule.";
      })

      .addCase(createSlotOverrideAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSlotOverrideAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot override created.";
        state.overridesAdmin.push(action.payload);
      })
      .addCase(createSlotOverrideAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not create slot override.";
      })

      .addCase(deleteSlotOverrideAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSlotOverrideAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot override deleted.";
        state.overridesAdmin = state.overridesAdmin.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteSlotOverrideAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not delete slot override.";
      })

      .addCase(updateSlotRuleAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateSlotRuleAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule updated.";
        const updated = action.payload;
        const index = state.rulesAdmin.findIndex((r) => r._id === updated._id);
        if (index !== -1) state.rulesAdmin[index] = updated;
      })
      .addCase(updateSlotRuleAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not update slot rule.";
      });
  },
});

export const { clearSlotMessages } = bookingSlotSlice.actions;
export default bookingSlotSlice.reducer;
