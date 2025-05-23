// src/store/bookingSlotSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
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
    return res.data.slots;
  }
);

// 🛠 Admin - Get Slot Rules
export const fetchSlotRules = createAsyncThunk(
  "bookingSlot/fetchSlotRules",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/admin/rule", null, rejectWithValue);
    return res.data.rules;
  }
);

// 🛠 Admin - Get Slot Overrides
export const fetchSlotOverrides = createAsyncThunk(
  "bookingSlot/fetchSlotOverrides",
  async (_, { rejectWithValue }) => {
    const res = await apiCall("get", "/bookingslot/admin/override", null, rejectWithValue);
    return res.data.overrides;
  }
);

// 🛠 Admin - Create Rule
export const createSlotRule = createAsyncThunk(
  "bookingSlot/createSlotRule",
  async (data: Partial<IBookingSlotRule>, { rejectWithValue }) => {
    const res = await apiCall("post", "/bookingslot/admin/rule", data, rejectWithValue);
    return res.data.rule;
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
    return res.data.override;
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

// 🛠 Admin - Update Slot Rule
export const updateSlotRule = createAsyncThunk(
  "bookingSlot/updateSlotRule",
  async ({ id, data }: { id: string; data: Partial<IBookingSlotRule> }, { rejectWithValue }) => {
    const res = await apiCall("patch", `/bookingslot/admin/rule/${id}`, data, rejectWithValue);
    return res.data.rule;
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
    const loading = (state: BookingSlotState) => {
      state.loading = true;
      state.error = null;
    };
    const error = (state: BookingSlotState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "Unknown error";
    };

    builder
      .addCase(fetchAvailableSlots.pending, loading)
      .addCase(fetchAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
      })
      .addCase(fetchAvailableSlots.rejected, error)

      .addCase(fetchSlotRules.pending, loading)
      .addCase(fetchSlotRules.fulfilled, (state, action) => {
        state.loading = false;
        state.rules = action.payload;
      })
      .addCase(fetchSlotRules.rejected, error)

      .addCase(fetchSlotOverrides.pending, loading)
      .addCase(fetchSlotOverrides.fulfilled, (state, action) => {
        state.loading = false;
        state.overrides = action.payload;
      })
      .addCase(fetchSlotOverrides.rejected, error)

      .addCase(createSlotRule.pending, loading)
      .addCase(createSlotRule.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule created.";
        state.rules.push(action.payload);
      })
      .addCase(createSlotRule.rejected, error)

      .addCase(deleteSlotRule.pending, loading)
      .addCase(deleteSlotRule.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule deleted.";
        state.rules = state.rules.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteSlotRule.rejected, error)

      .addCase(createSlotOverride.pending, loading)
      .addCase(createSlotOverride.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot override created.";
        state.overrides.push(action.payload);
      })
      .addCase(createSlotOverride.rejected, error)

      .addCase(deleteSlotOverride.pending, loading)
      .addCase(deleteSlotOverride.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot override deleted.";
        state.overrides = state.overrides.filter((r) => r._id !== action.payload);
      })
      .addCase(deleteSlotOverride.rejected, error)

    // Update Slot Rule
    .addCase(updateSlotRule.pending, loading)
      .addCase(updateSlotRule.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = "Slot rule updated.";
        const updated = action.payload;
        const index = state.rules.findIndex((r) => r._id === updated._id);
        if (index !== -1) state.rules[index] = updated;
      }
      )
  },
});

export const { clearSlotMessages } = bookingSlotSlice.actions;
export default bookingSlotSlice.reducer;
