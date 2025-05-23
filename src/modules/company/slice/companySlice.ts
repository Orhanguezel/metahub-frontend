import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";

interface CompanyState {
  company: any | null;
  status: "idle" | "loading" | "succeeded" | "failed";
  updateStatus: "idle" | "loading" | "succeeded" | "failed";
  createStatus: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}

const initialState: CompanyState = {
  company: null,
  status: "idle",
  updateStatus: "idle",
  createStatus: "idle",
  error: null,
  successMessage: null,
};

// Yardımcı: Nested objeler ve birden fazla dosya desteği!
const appendFormData = (formData: FormData, data: any) => {
  Object.entries(data).forEach(([key, value]) => {
    if (key === "logos" && Array.isArray(value)) {
      // Çoklu logo dosyası
      value.forEach((file) => {
        if (file instanceof File) {
          formData.append("logos", file);
        }
      });
    } else if (key === "removedLogos" && Array.isArray(value)) {
      // Silinecek logoları JSON.stringify olarak ekle!
      formData.append("removedLogos", JSON.stringify(value));
    } else if (typeof value === "object" && value !== null && !(value instanceof File)) {
      // Nested object'ler için recursive (ör: address, bankDetails, socialLinks)
      Object.entries(value).forEach(([nestedKey, nestedValue]) => {
        formData.append(`${key}[${nestedKey}]`, nestedValue ?? "");
      });
    } else if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });
};

// 📥 Get company info
export const fetchCompanyInfo = createAsyncThunk(
  "company/fetchCompanyInfo",
  async (_, { rejectWithValue }) => {
    const result = await apiCall("get", "/company", null, rejectWithValue);
    if (result?.data) {
      return result.data;
    }
    return rejectWithValue(result?.message || "No company data found.");
  }
);

// ➕ Create new company (çoklu logo)
export const createCompany = createAsyncThunk(
  "company/createCompany",
  async (newCompany: any, { rejectWithValue }) => {
    const formData = new FormData();
    appendFormData(formData, newCompany);

    const result = await apiCall(
      "post",
      "/company",
      formData,
      rejectWithValue
    );

    if (result?.data) {
      return result.data;
    }
    return rejectWithValue(result?.message || "Failed to create company.");
  }
);

// ✏️ Update company info (çoklu logo + silme desteği)
export const updateCompanyInfo = createAsyncThunk(
  "company/updateCompanyInfo",
  async (updatedData: any, { rejectWithValue }) => {
    const formData = new FormData();
    appendFormData(formData, updatedData);

    const result = await apiCall(
      "put",
      `/company/${updatedData._id}`,
      formData,
      rejectWithValue
    );

    if (result?.data) {
      return result.data;
    }
    return rejectWithValue(result?.message || "Failed to update company.");
  }
);

// (Opsiyonel: DELETE ile silmek için thunk yazabilirsin)

const companySlice = createSlice({
  name: "company",
  initialState,
  reducers: {
    resetMessages(state) {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // 📥 Fetch
      .addCase(fetchCompanyInfo.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchCompanyInfo.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.company = action.payload;
      })
      .addCase(fetchCompanyInfo.rejected, (state, action) => {
        state.status = "failed";
        state.error =
          (action.payload as any)?.message || "Failed to fetch company data.";
      })

      // ✏️ Update
      .addCase(updateCompanyInfo.pending, (state) => {
        state.updateStatus = "loading";
        state.error = null;
      })
      .addCase(updateCompanyInfo.fulfilled, (state, action) => {
        state.updateStatus = "succeeded";
        state.company = action.payload;
        state.successMessage = "Company updated successfully.";
      })
      .addCase(updateCompanyInfo.rejected, (state, action) => {
        state.updateStatus = "failed";
        state.error =
          (action.payload as any)?.message || "Failed to update company.";
      })

      // ➕ Create
      .addCase(createCompany.pending, (state) => {
        state.createStatus = "loading";
        state.error = null;
      })
      .addCase(createCompany.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.company = action.payload;
        state.successMessage = "Company created successfully.";
      })
      .addCase(createCompany.rejected, (state, action) => {
        state.createStatus = "failed";
        state.error =
          (action.payload as any)?.message || "Failed to create company.";
      });
  },
});

export const { resetMessages } = companySlice.actions;
export default companySlice.reducer;
