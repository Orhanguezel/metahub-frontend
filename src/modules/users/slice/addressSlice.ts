import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Address } from "@/modules/users/types/address";

interface AddressState {
  addresses: Address[];
  currentAddress: Address | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: AddressState = {
  addresses: [],
  currentAddress: null,
  loading: false,
  error: null,
  successMessage: null,
};

// 📥 Fetch all addresses
export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (_, { rejectWithValue }) =>
    await apiCall("get", "/address", null, rejectWithValue)
);

// ➕ Create new address
export const createAddress = createAsyncThunk(
  "address/createAddress",
  async (data: Omit<Address, "_id" | "createdAt" | "updatedAt">, { rejectWithValue }) =>
    await apiCall("post", "/address", data, rejectWithValue)
);

// ✏️ Update address
export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, data }: { id: string; data: Omit<Address, "_id" | "createdAt" | "updatedAt"> }, { rejectWithValue }) =>
    await apiCall("put", `/address/${id}`, data, rejectWithValue)
);

// 🗑 Delete address
export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id: string, { rejectWithValue }) =>
    await apiCall("delete", `/address/${id}`, null, rejectWithValue)
);

// 🔍 Get single address by ID (optional)
export const fetchAddressById = createAsyncThunk(
  "address/fetchAddressById",
  async (id: string, { rejectWithValue }) =>
    await apiCall("get", `/address/${id}`, null, rejectWithValue)
);

const addressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    clearAddressMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    resetCurrentAddress: (state) => {
      state.currentAddress = null;
    },
  },
  extraReducers: (builder) => {
    const loading = (state: AddressState) => {
      state.loading = true;
      state.error = null;
    };

    // TYPE-SAFE error yakalama:
    const failed = (state: AddressState, action: PayloadAction<unknown>) => {
      state.loading = false;
      const payload = action.payload as { message?: string } | undefined;
      state.error = payload?.message || "An error occurred";
      state.successMessage = null;
    };

    builder
      // Fetch all
      .addCase(fetchAddresses.pending, loading)
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, failed);

    // Create
    builder
      .addCase(createAddress.pending, loading)
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.error = null;
        state.addresses.push(action.payload.data);
      })
      .addCase(createAddress.rejected, failed);

    // Update
    builder
      .addCase(updateAddress.pending, loading)
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.error = null;
        const updated = action.payload.data;
        state.addresses = state.addresses.map((addr) =>
          addr._id === updated._id ? updated : addr
        );
      })
      .addCase(updateAddress.rejected, failed);

    // Delete
    builder
      .addCase(deleteAddress.pending, loading)
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.error = null;
        const deletedId = action.meta.arg;
        state.addresses = state.addresses.filter((addr) => addr._id !== deletedId);
      })
      .addCase(deleteAddress.rejected, failed);

    // Get by ID
    builder
      .addCase(fetchAddressById.pending, loading)
      .addCase(fetchAddressById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAddress = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAddressById.rejected, failed);
  },
});

export const { clearAddressMessages, resetCurrentAddress } = addressSlice.actions;
export default addressSlice.reducer;
