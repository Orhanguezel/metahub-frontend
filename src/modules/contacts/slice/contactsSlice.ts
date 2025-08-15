import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import apiCall from "@/lib/apiCall";
import type { IContact, ContactListFilters } from "../types";

/* backend bazen { data: ... } döndürebilir */
const pickData = <T,>(res: any, fallback: T): T =>
  res && typeof res === "object" && "data" in res ? (res.data as T) : ((res as T) ?? fallback);

interface ContactsState {
  contactsAdmin: IContact[];
  selected: IContact | null;
  loading: boolean;
  error: string | null;
  successMessage: string | null;
}

const initialState: ContactsState = {
  contactsAdmin: [],
  selected: null,
  loading: false,
  error: null,
  successMessage: null,
};

const ADMIN_BASE = "/contacts/admin";

/* -------- Thunks (Admin) -------- */

/** LIST */
export const fetchAllContactsAdmin = createAsyncThunk<
  IContact[],
  ContactListFilters | void,
  { rejectValue: string }
>("contacts/fetchAllAdmin", async (filters, thunkAPI) => {
  try {
    const res = await apiCall("get", ADMIN_BASE, filters as any);
    return pickData<IContact[]>(res, []);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

/** GET BY ID */
export const fetchContactAdminById = createAsyncThunk<
  IContact,
  string,
  { rejectValue: string }
>("contacts/fetchById", async (id, thunkAPI) => {
  try {
    const res = await apiCall("get", `${ADMIN_BASE}/${id}`);
    return pickData<IContact>(res, {} as IContact);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});

/** CREATE */
export const createContact = createAsyncThunk<
  IContact,
  Partial<IContact>,
  { rejectValue: string }
>("contacts/create", async (payload, thunkAPI) => {
  try {
    const res = await apiCall("post", ADMIN_BASE, payload);
    return pickData<IContact>(res, {} as IContact);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(
      // 409 duplicate slug vb. backend already returns message
      err?.data?.message ?? err?.message ?? "Create failed"
    );
  }
});

/** UPDATE */
export const updateContact = createAsyncThunk<
  IContact,
  { id: string; changes: Partial<IContact> },
  { rejectValue: string }
>("contacts/update", async ({ id, changes }, thunkAPI) => {
  try {
    const res = await apiCall("put", `${ADMIN_BASE}/${id}`, changes);
    return pickData<IContact>(res, {} as IContact);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Update failed");
  }
});

/** DELETE */
export const deleteContact = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("contacts/delete", async (id, thunkAPI) => {
  try {
    await apiCall("delete", `${ADMIN_BASE}/${id}`);
    return { id };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Delete failed");
  }
});

/* -------- Slice -------- */
const slice = createSlice({
  name: "contacts",
  initialState,
  reducers: {
    clearContactMessages: (s) => {
      s.error = null;
      s.successMessage = null;
    },
    setSelectedContact: (s, a: PayloadAction<IContact | null>) => {
      s.selected = a.payload;
    },
  },
  extraReducers: (b) => {
    /* fulfilled */
    b.addCase(fetchAllContactsAdmin.fulfilled, (s, a) => {
      s.contactsAdmin = a.payload ?? [];
      s.loading = false; s.error = null;
    });
    b.addCase(fetchContactAdminById.fulfilled, (s, a) => {
      s.selected = a.payload ?? null;
      s.loading = false; s.error = null;
    });
    b.addCase(createContact.fulfilled, (s, a) => {
      if (a.payload?._id) s.contactsAdmin.unshift(a.payload);
      s.loading = false; s.successMessage = "Created.";
    });
    b.addCase(updateContact.fulfilled, (s, a) => {
      const updated = a.payload;
      const i = s.contactsAdmin.findIndex(x => x._id === updated._id);
      if (i !== -1) s.contactsAdmin[i] = updated;
      if (s.selected?._id === updated._id) s.selected = updated;
      s.loading = false; s.successMessage = "Updated.";
    });
    b.addCase(deleteContact.fulfilled, (s, a) => {
      s.contactsAdmin = s.contactsAdmin.filter(x => x._id !== a.payload.id);
      if (s.selected?._id === a.payload.id) s.selected = null;
      s.loading = false; s.successMessage = "Deleted.";
    });

    /* pending / rejected matchers (tek satırla tüm actions) */
    b.addMatcher(
      (ac) => ac.type.startsWith("contacts/") && ac.type.endsWith("/pending"),
      (s) => { s.loading = true; s.error = null; s.successMessage = null; }
    );
    b.addMatcher(
      (ac: any) => ac.type.startsWith("contacts/") && ac.type.endsWith("/rejected"),
      (s, ac: any) => { s.loading = false; s.error = ac.payload || "Operation failed"; }
    );
  },
});

export const { clearContactMessages, setSelectedContact } = slice.actions;
export default slice.reducer;
