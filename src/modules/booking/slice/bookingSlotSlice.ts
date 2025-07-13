// src/store/bookingSlotSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IBookingSlotRule,
  IBookingSlotOverride,
} from "@/modules/booking/types";

interface BookingSlotState {
  availableSlots: string[];                 // 🌍 Public: Kullanıcıya açık slotlar
  rulesAdmin: IBookingSlotRule[];           // 🛠 Admin: Slot kuralları
  overridesAdmin: IBookingSlotOverride[];   // 🛠 Admin: Slot override'lar
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BookingSlotState = {
  availableSlots: [],
  rulesAdmin: [],
  overridesAdmin: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 🌍 PUBLIC - Get Available Slots
export const fetchAvailableSlots = createAsyncThunk(
  "bookingSlot/fetchAvailableSlots",
  async (date: string, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot", { date }, rejectWithValue);
    return res.slots;
  }
);

// 🛠 ADMIN - Get Rules
export const fetchSlotRulesAdmin = createAsyncThunk(
  "bookingSlot/fetchSlotRulesAdmin",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/admin/rule", null, rejectWithValue);
    return res.data;
  }
);

// 🛠 ADMIN - Get Overrides
export const fetchSlotOverridesAdmin = createAsyncThunk(
  "bookingSlot/fetchSlotOverridesAdmin",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/admin/override", null, rejectWithValue);
    return res.data;
  }
);

// 🛠 ADMIN - Create Rule
export const createSlotRuleAdmin = createAsyncThunk(
  "bookingSlot/createSlotRuleAdmin",
  async (data: Partial<IBookingSlotRule>, { rejectWithValue }) => {
    const res = await apiCall("post", "/bookingslot/admin/rule", data, rejectWithValue);
    return res.rule;
  }
);

// 🛠 ADMIN - Delete Rule
export const deleteSlotRuleAdmin = createAsyncThunk(
  "bookingSlot/deleteSlotRuleAdmin",
  async (id: string, { rejectWithValue }) => {
    await apiCall("delete", `/bookingslot/admin/rule/${id}`, null, rejectWithValue);
    return id;
  }
);

// 🛠 ADMIN - Create Override
export const createSlotOverrideAdmin = createAsyncThunk(
  "bookingSlot/createSlotOverrideAdmin",
  async (data: Partial<IBookingSlotOverride>, { rejectWithValue }) => {
    const res = await apiCall("post", "/bookingslot/admin/override", data, rejectWithValue);
    return res.override;
  }
);

// 🛠 ADMIN - Delete Override
export const deleteSlotOverrideAdmin = createAsyncThunk(
  "bookingSlot/deleteSlotOverrideAdmin",
  async (id: string, { rejectWithValue }) => {
    await apiCall("delete", `/bookingslot/admin/override/${id}`, null, rejectWithValue);
    return id;
  }
);

// 🛠 ADMIN - Update Rule
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
    builder
      // 🌍 PUBLIC - Available Slots
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
      })

      // 🛠 ADMIN - Slot Rules
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
        state.error = (action.payload as any)?.message || "Could not fetch slot rules.";
      })

      // 🛠 ADMIN - Slot Overrides
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
        state.error = (action.payload as any)?.message || "Could not fetch slot overrides.";
      })

      // 🛠 ADMIN - Create Rule
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

      // 🛠 ADMIN - Delete Rule
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

      // 🛠 ADMIN - Create Override
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

      // 🛠 ADMIN - Delete Override
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

      // 🛠 ADMIN - Update Rule
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
