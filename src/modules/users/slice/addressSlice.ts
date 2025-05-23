import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

export interface Address {
  _id?: string;
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
}

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
  async (_, thunkAPI) => {
    return await apiCall("get", "/address", null, thunkAPI.rejectWithValue);
  }
);

// ➕ Create new address
export const createAddress = createAsyncThunk(
  "address/createAddress",
  async (data: Omit<Address, "_id">, thunkAPI) => {
    return await apiCall("post", "/address", data, thunkAPI.rejectWithValue);
  }
);

// ✏️ Update address
export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async ({ id, data }: { id: string; data: Omit<Address, "_id"> }, thunkAPI) => {
    return await apiCall("put", `/address/${id}`, data, thunkAPI.rejectWithValue);
  }
);

// 🗑 Delete address
export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id: string, thunkAPI) => {
    return await apiCall("delete", `/address/${id}`, null, thunkAPI.rejectWithValue);
  }
);

// 🔍 Get single address by ID (optional)
export const fetchAddressById = createAsyncThunk(
  "address/fetchAddressById",
  async (id: string, thunkAPI) => {
    return await apiCall("get", `/address/${id}`, null, thunkAPI.rejectWithValue);
  }
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

    const failed = (state: AddressState, action: PayloadAction<any>) => {
      state.loading = false;
      state.error = action.payload?.message || "An error occurred";
    };

    // 🔄 Fetch all
    builder
      .addCase(fetchAddresses.pending, loading)
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.addresses = action.payload.data;
      })
      .addCase(fetchAddresses.rejected, failed);

    // ➕ Create
    builder
      .addCase(createAddress.pending, loading)
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        state.addresses.push(action.payload.data);
      })
      .addCase(createAddress.rejected, failed);

    // ✏️ Update
    builder
      .addCase(updateAddress.pending, loading)
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const updated = action.payload.data;
        state.addresses = state.addresses.map((addr) =>
          addr._id === updated._id ? updated : addr
        );
      })
      .addCase(updateAddress.rejected, failed);

    // 🗑 Delete
    builder
      .addCase(deleteAddress.pending, loading)
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.successMessage = action.payload.message;
        const deletedId = action.meta.arg;
        state.addresses = state.addresses.filter((addr) => addr._id !== deletedId);
      })
      .addCase(deleteAddress.rejected, failed);

    // 🔍 Get by ID
    builder
      .addCase(fetchAddressById.pending, loading)
      .addCase(fetchAddressById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAddress = action.payload.data;
      })
      .addCase(fetchAddressById.rejected, failed);
  },
});

export const { clearAddressMessages, resetCurrentAddress } = addressSlice.actions;
export default addressSlice.reducer;
