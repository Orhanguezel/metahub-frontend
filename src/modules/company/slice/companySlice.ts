// src/modules/company/slice/companySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { ICompany } from "@/modules/company/types";

interface CompanyFullState {
  company: ICompany | null;
  companyAdmin: ICompany | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  deleteStatus: "idle" | "loading" | "succeeded" | "failed";
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: CompanyFullState = {
  company: null,
  companyAdmin: null,
  status: "idle",
  updateStatus: "idle",
  createStatus: "idle",
  deleteStatus: "idle",
  loading: false,
  error: null,
  successMessage: null,
};

const BASE = "/company";

// -- form-data helper (nested obj/array/file destekler)
const appendFormData = (fd: FormData, data: Record<string, any>, parent?: string) => {
  Object.entries(data ?? {}).forEach(([key, value]) => {
    const name = parent ? `${parent}[${key}]` : key;
    if (value === undefined || value === null) return;

    if (value instanceof File) {
      fd.append(name, value);
    } else if (Array.isArray(value)) {
      value.forEach((v, i) => {
        if (v instanceof File) fd.append(name, v);
        else if (typeof v === "object" && v !== null) appendFormData(fd, v, `${name}[${i}]`);
        else fd.append(`${name}[${i}]`, String(v));
      });
    } else if (typeof value === "object") {
      appendFormData(fd, value, name);
    } else {
      fd.append(name, String(value));
    }
  });
};

// 🌍 GET: Public & Admin Company (aynı endpoint)
export const fetchCompanyInfo = createAsyncThunk<ICompany, void, { rejectValue: string }>(
  "company/fetchCompanyInfo",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiCall("get", `${BASE}`, null, rejectWithValue);
      // API bazı projelerde {data:{...}} döndürebildiği için ikisini de karşıla:
      const data = res?.data?.data ?? res?.data;
      return data as ICompany;
    } catch (err: any) {
      return rejectWithValue(err?.message || "No company data found.");
    }
  }
);

export const fetchCompanyAdmin = createAsyncThunk<ICompany, void, { rejectValue: string }>(
  "company/fetchCompanyAdmin",
  async (_, { rejectWithValue }) => {
    try {
      const res = await apiCall("get", `${BASE}`, null, rejectWithValue);
      const data = res?.data?.data ?? res?.data;
      return data as ICompany;
    } catch (err: any) {
      return rejectWithValue(err?.message || "No admin company data found.");
    }
  }
);

export const createCompanyAdmin = createAsyncThunk<ICompany, Record<string, any>, { rejectValue: string }>(
  "company/createCompanyAdmin",
  async (payload, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      appendFormData(fd, payload);
      const res = await apiCall("post", `${BASE}`, fd, rejectWithValue);
      const data = res?.data?.data ?? res?.data;
      return data as ICompany;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to create company.");
    }
  }
);

export const updateCompanyAdmin = createAsyncThunk<
  ICompany,
  { _id: string } & Record<string, any>,
  { rejectValue: string }
>(
  "company/updateCompanyAdmin",
  async ({ _id, images, removedImages, ...rest }, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      appendFormData(fd, rest);

      if (Array.isArray(images)) {
        images.forEach((f: File) => f instanceof File && fd.append("images", f));
      }
      if (removedImages?.length) {
        fd.append("removedImages", JSON.stringify(removedImages));
      }

      const res = await apiCall("put", `${BASE}/${_id}`, fd, rejectWithValue);
      const data = res?.data?.data ?? res?.data;
      return data as ICompany;
    } catch (err: any) {
      return rejectWithValue(err?.message || "Failed to update company.");
    }
  }
);

export const deleteCompanyAdmin = createAsyncThunk<
  { id: string; message?: string },
  string,
  { rejectValue: string }
>("company/delete", async (id, { rejectWithValue }) => {
  try {
    const res = await apiCall("delete", `${BASE}/${id}`, null, rejectWithValue);
    return { id, message: res?.data?.message ?? res?.message };
  } catch (err: any) {
    return rejectWithValue(err?.message || "Failed to delete company.");
  }
});

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    resetMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
    clearCompany(state) {
      state.company = null;
      state.companyAdmin = null;
      state.status = "idle";
      state.updateStatus = "idle";
      state.createStatus = "idle";
      state.deleteStatus = "idle";
      state.error = null;
      state.successMessage = null;
    },
    clearCompanyMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (b) => {
    // fetch public
    b.addCase(fetchCompanyInfo.pending, (s) => { s.status = "loading"; s.error = null; s.successMessage = null; });
    b.addCase(fetchCompanyInfo.fulfilled, (s, a: PayloadAction<ICompany>) => {
      s.status = "succeeded"; s.company = a.payload; s.companyAdmin = a.payload;
    });
    b.addCase(fetchCompanyInfo.rejected, (s, a) => { s.status = "failed"; s.error = (a.payload as string) || "Failed to fetch company data."; });

    // fetch admin
    b.addCase(fetchCompanyAdmin.pending, (s) => { s.loading = true; s.error = null; });
    b.addCase(fetchCompanyAdmin.fulfilled, (s, a: PayloadAction<ICompany>) => { s.loading = false; s.companyAdmin = a.payload; });
    b.addCase(fetchCompanyAdmin.rejected, (s, a) => { s.loading = false; s.error = (a.payload as string) || "Failed to fetch admin company data."; });

    // create
    b.addCase(createCompanyAdmin.pending, (s) => { s.createStatus = "loading"; s.error = null; s.successMessage = null; });
    b.addCase(createCompanyAdmin.fulfilled, (s, a: PayloadAction<ICompany>) => {
      s.createStatus = "succeeded"; s.companyAdmin = a.payload; s.successMessage = "Company created successfully.";
    });
    b.addCase(createCompanyAdmin.rejected, (s, a) => { s.createStatus = "failed"; s.error = (a.payload as string) || "Failed to create company."; });

    // update
    b.addCase(updateCompanyAdmin.pending, (s) => { s.updateStatus = "loading"; s.error = null; s.successMessage = null; });
    b.addCase(updateCompanyAdmin.fulfilled, (s, a: PayloadAction<ICompany>) => {
      s.updateStatus = "succeeded"; s.companyAdmin = a.payload; s.successMessage = "Company updated successfully.";
    });
    b.addCase(updateCompanyAdmin.rejected, (s, a) => { s.updateStatus = "failed"; s.error = (a.payload as string) || "Failed to update company."; });

    // delete
    b.addCase(deleteCompanyAdmin.pending, (s) => { s.deleteStatus = "loading"; s.error = null; s.successMessage = null; });
    b.addCase(deleteCompanyAdmin.fulfilled, (s, a: PayloadAction<{ id: string; message?: string }>) => {
      s.deleteStatus = "succeeded"; s.company = null; s.companyAdmin = null; s.successMessage = a.payload.message || "Company deleted successfully.";
    });
    b.addCase(deleteCompanyAdmin.rejected, (s, a) => { s.deleteStatus = "failed"; s.error = (a.payload as string) || "Failed to delete company."; });
  },
});

export const { resetMessages, clearCompany, clearCompanyMessages } = companySlice.actions;
export default companySlice.reducer;
