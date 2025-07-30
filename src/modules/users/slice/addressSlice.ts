// src/modules/users/slice/addressSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { Address } from "@/modules/users/types/address";

interface AddressState {
  addresses: Address[];
  currentAddress: Address | null;
  loading: boolean;
  status?: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: AddressState = {
  addresses: [],
  currentAddress: null,
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// 1️⃣ DİNAMİK - Kullanıcı/Şirket veya generic fetch (dinamik owner)
export const fetchAddresses = createAsyncThunk(
  "address/fetchAddresses",
  async (params: { companyId?: string } = {}, { rejectWithValue }) => {
    let url = "/address";
    if (params.companyId) url = `/address/company/${params.companyId}`;
    // Eğer user ise ya da parametre yoksa, "/address" veya "/address/user"
    return await apiCall("get", url, null, rejectWithValue);
  }
);

// 2️⃣ Kullanıcının kendi adresleri (her zaman login user)
export const fetchUserAddresses = createAsyncThunk(
  "address/fetchUserAddresses",
  async (_, { rejectWithValue }) =>
    await apiCall("get", "/address/user", null, rejectWithValue)
);

// 3️⃣ Şirketin adresleri
export const fetchCompanyAddresses = createAsyncThunk(
  "address/fetchCompanyAddresses",
  async (companyId: string, { rejectWithValue }) =>
    await apiCall("get", `/address/company/${companyId}`, null, rejectWithValue)
);

// 4️⃣ Tekli adres ekle (user veya company, backend'de owner tespit ediyor)
export const createAddress = createAsyncThunk(
  "address/createAddress",
  async (data: Omit<Address, "_id" | "createdAt" | "updatedAt">, { rejectWithValue }) =>
    await apiCall("post", "/address", data, rejectWithValue)
);

// 5️⃣ Tekli adres güncelle
export const updateAddress = createAsyncThunk(
  "address/updateAddress",
  async (
    { id, data }: { id: string; data: Omit<Address, "_id" | "createdAt" | "updatedAt"> },
    { rejectWithValue }
  ) =>
    await apiCall("put", `/address/${id}`, data, rejectWithValue)
);

// 6️⃣ Tekli adres sil
export const deleteAddress = createAsyncThunk(
  "address/deleteAddress",
  async (id: string, { rejectWithValue }) =>
    await apiCall("delete", `/address/${id}`, null, rejectWithValue)
);

// 7️⃣ Adresleri topluca güncelle (user veya company için dinamik)
export const updateAllAddresses = createAsyncThunk(
  "address/updateAllAddresses",
  async (
    params: { addresses: Address[]; companyId?: string },
    { rejectWithValue }
  ) => {
    let url = "/address/all/replace";
    const payload = { addresses: params.addresses };
    if (params.companyId) {
      url = `/address/company/${params.companyId}/all/replace`;
    }
    return await apiCall("put", url, payload, rejectWithValue);
  }
);

// 8️⃣ Kullanıcının adreslerini topluca güncelle
export const updateAllUserAddresses = createAsyncThunk(
  "address/updateAllUserAddresses",
  async (addresses: Address[], { rejectWithValue }) =>
    await apiCall("put", "/address/user/all/replace", { addresses }, rejectWithValue)
);

// 9️⃣ Şirket adreslerini topluca güncelle
export const updateAllCompanyAddresses = createAsyncThunk(
  "address/updateAllCompanyAddresses",
  async (
    { companyId, addresses }: { companyId: string; addresses: Address[] },
    { rejectWithValue }
  ) =>
    await apiCall("put", `/address/company/${companyId}/all/replace`, { addresses }, rejectWithValue)
);

// 10️⃣ Tekli adres getir
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
      state.status = "idle"; // resetlerken idle yap
    },
    resetCurrentAddress: (state) => {
      state.currentAddress = null;
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: AddressState) => {
      state.loading = true;
      state.status = "loading";
      state.error = null;
    };
    const setFailed = (state: AddressState, action: PayloadAction<any>) => {
      state.loading = false;
      state.status = "failed";
      state.error = action.payload?.message || "An error occurred";
      state.successMessage = null;
    };

    // --- FETCH ---
    builder
      .addCase(fetchAddresses.pending, setLoading)
      .addCase(fetchAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.addresses = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAddresses.rejected, setFailed);

    builder
      .addCase(fetchUserAddresses.pending, setLoading)
      .addCase(fetchUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.addresses = action.payload.data;
        state.error = null;
      })
      .addCase(fetchUserAddresses.rejected, setFailed);

    builder
      .addCase(fetchCompanyAddresses.pending, setLoading)
      .addCase(fetchCompanyAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.addresses = action.payload.data;
        state.error = null;
      })
      .addCase(fetchCompanyAddresses.rejected, setFailed);

    // --- CREATE ---
    builder
      .addCase(createAddress.pending, setLoading)
      .addCase(createAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        state.error = null;
        if (action.payload.data) {
          state.addresses.push(action.payload.data);
        }
      })
      .addCase(createAddress.rejected, setFailed);

    // --- UPDATE ---
    builder
      .addCase(updateAddress.pending, setLoading)
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        state.error = null;
        const updated = action.payload.data;
        state.addresses = state.addresses.map((addr) =>
          addr._id === updated._id ? updated : addr
        );
      })
      .addCase(updateAddress.rejected, setFailed);

    // --- DELETE ---
    builder
      .addCase(deleteAddress.pending, setLoading)
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        state.error = null;
        const deletedId = action.meta.arg;
        state.addresses = state.addresses.filter((addr) => addr._id !== deletedId);
      })
      .addCase(deleteAddress.rejected, setFailed);

    // --- BULK UPDATE ---
    builder
      .addCase(updateAllAddresses.pending, setLoading)
      .addCase(updateAllAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        state.error = null;
        state.addresses = action.payload.data;
      })
      .addCase(updateAllAddresses.rejected, setFailed);

    builder
      .addCase(updateAllUserAddresses.pending, setLoading)
      .addCase(updateAllUserAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        state.error = null;
        state.addresses = action.payload.data;
      })
      .addCase(updateAllUserAddresses.rejected, setFailed);

    builder
      .addCase(updateAllCompanyAddresses.pending, setLoading)
      .addCase(updateAllCompanyAddresses.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.successMessage = action.payload.message;
        state.error = null;
        state.addresses = action.payload.data;
      })
      .addCase(updateAllCompanyAddresses.rejected, setFailed);

    // --- GET BY ID ---
    builder
      .addCase(fetchAddressById.pending, setLoading)
      .addCase(fetchAddressById.fulfilled, (state, action) => {
        state.loading = false;
        state.status = "succeeded";
        state.currentAddress = action.payload.data;
        state.error = null;
      })
      .addCase(fetchAddressById.rejected, setFailed);
  },
});

export const { clearAddressMessages, resetCurrentAddress } = addressSlice.actions;
export default addressSlice.reducer;
