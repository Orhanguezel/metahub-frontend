// src/store/bookingSlotSlice.ts

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type {
  IBookingSlotRule,
  IBookingSlotOverride,
} from "@/modules/booking/types/types";

interface BookingSlotState {
  rules: IBookingSlotRule[];
  overrides: IBookingSlotOverride[];
  availableSlots: string[];
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: BookingSlotState = {
  rules: [],
  overrides: [],
  availableSlots: [],
  loading: false,
  error: null,
  successMessage: null,
};

// 🎯 Get Available Slots for a Date (Public)
export const fetchAvailableSlots = createAsyncThunk(
  "bookingSlot/fetchAvailableSlots",
  async (date: string, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot", { date }, rejectWithValue);
    return res.slots;
  }
);

// 🛠 Admin - Get Slot Rules
export const fetchSlotRules = createAsyncThunk(
  "bookingSlot/fetchSlotRules",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/admin/rule", null, rejectWithValue);
    // API: { success: true, data: [ ... ] }
    return res.data;
  }
);

// 🛠 Admin - Get Slot Overrides
export const fetchSlotOverrides = createAsyncThunk(
  "bookingSlot/fetchSlotOverrides",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/admin/override", null, rejectWithValue);
    return res.data;
  }
);

// 🛠 Admin - Create Rule
export const createSlotRule = createAsyncThunk(
  "bookingSlot/createSlotRule",
  async (data: Partial<IBookingSlotRule>, { rejectWithValue }) => {
    const res = await apiCall("post", "/bookingslot/admin/rule", data, rejectWithValue);
    return res.rule;
  }
);

// 🛠 Admin - Delete Rule
export const deleteSlotRule = createAsyncThunk(
  "bookingSlot/deleteSlotRule",
  async (id: string, { rejectWithValue }) => {
    await apiCall("delete", `/bookingslot/admin/rule/${id}`, null, rejectWithValue);
    return id;
  }
);

// 🛠 Admin - Create Override
export const createSlotOverride = createAsyncThunk(
  "bookingSlot/createSlotOverride",
  async (data: Partial<IBookingSlotOverride>, { rejectWithValue }) => {
    const res = await apiCall("post", "/bookingslot/admin/override", data, rejectWithValue);
    return res.override;
  }
);

// 🛠 Admin - Delete Override
export const deleteSlotOverride = createAsyncThunk(
  "bookingSlot/deleteSlotOverride",
  async (id: string, { rejectWithValue }) => {
    await apiCall("delete", `/bookingslot/admin/override/${id}`, null, rejectWithValue);
    return id;
  }
);

// 🛠 Admin - Update Slot Rule (Opsiyonel, backend’de PATCH varsa)
export const updateSlotRule = createAsyncThunk(
  "bookingSlot/updateSlotRule",
  async ({ id, data }: { id: string; data: Partial<IBookingSlotRule> }, { rejectWithValue }) => {
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
      // Available Slots
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

      // Slot Rules
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

      // Slot Overrides
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

      // Create Rule
      .addCase(createSlotRule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSlotRule.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule created.";
        state.rules.push(action.payload);
      })
      .addCase(createSlotRule.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not create slot rule.";
      })

      // Delete Rule
      .addCase(deleteSlotRule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSlotRule.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule deleted.";
        state.rules = state.rules.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteSlotRule.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not delete slot rule.";
      })

      // Create Override
      .addCase(createSlotOverride.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createSlotOverride.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot override created.";
        state.overrides.push(action.payload);
      })
      .addCase(createSlotOverride.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not create slot override.";
      })

      // Delete Override
      .addCase(deleteSlotOverride.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteSlotOverride.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot override deleted.";
        state.overrides = state.overrides.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteSlotOverride.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not delete slot override.";
      })

      // Update Rule (Opsiyonel)
      .addCase(updateSlotRule.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateSlotRule.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule updated.";
        const updated = action.payload;
        const index = state.rules.findIndex((r) => r._id === updated._id);
        if (index !== -1) state.rules[index] = updated;
      })
      .addCase(updateSlotRule.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as any)?.message || "Could not update slot rule.";
      });
  },
});

export const { clearSlotMessages } = bookingSlotSlice.actions;
export default bookingSlotSlice.reducer;
