Süper — artık `apiCall` tek yerden **tenant**, **cookie**, **Accept-Language** ve (istersen) **X-API-KEY** yönetiyor. O yüzden slice/thunk yazarken “fazla header/config” taşıma. Aşağıya **net bir talimat** + **şablon** bıraktım; bizde yaşanan `res.data` kafa karışıklığını da özellikle düzelttim.

# MetaHub Slice/Thunk Yazım Talimatı

## 0) Temel prensipler

* **`apiCall` zaten `response.data` döndürür.**
  Yani **`const res = await apiCall(...);`** dönen şey doğrudan payload’dır.
  ➜ **Kesinlikle `res.data` kullanma.** (Yanlış: `res.data.something`)
* **Header/withCredentials ekleme**: `withCredentials`, `x-tenant`, `Content-Type` (JSON), `Accept-Language` **otomatik**.
  ➜ Sadece **FormData** yollarsan `Content-Type` otomatik kaldırılır, elle set etme.
* **Hata yakalama**: `try/catch` içinde `return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "…")`.
* **GET parametreleri**: `apiCall("get", "/path", paramsObj)` şeklinde **3. argüman**a ver; `apiCall` onları `params` olarak gönderir.
* **API key gerekiyorsa** (opsiyonel): Uygulama açılırken bir kere `setApiKey("...")` çağır; thunk içinde taşıma.
* Backend iki tip dönebilir:

  1. Düz veri: `IModule[]`, `IModule` vs.
  2. Zarf: `{ success, data, message }`
     Slice’ta buna göre **ya doğrudan `res`**, ya da `res.data ?? []` gibi normalize et.

## 1) State şeması (öneri)

```ts
interface SliceState<T> {
  list: T[];
  selected: T | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}
```

> İsimleri domain’e göre değiştir (örn. `modules`, `tenantModules` vs.).

## 2) Yardımcı (opsiyonel fakat faydalı)

Bazı endpoint’ler `{data: ...}` dönderdiğinde normalize etmek için:

```ts
const pickData = <T,>(res: any, fallback: T): T =>
  res && typeof res === "object" && "data" in res ? (res.data as T) : (res as T ?? fallback);
```

## 3) Thunk Şablonları

### LIST (GET)

```ts
export const fetchItems = createAsyncThunk<
  YourType[],           // fulfilled payload type
  void,                 // arg
  { rejectValue: string }
>("slice/fetch", async (_, thunkAPI) => {
  try {
    const res = await apiCall("get", "/your-endpoint");
    // res ya [] ya da { data: [] } olabilir:
    return pickData<YourType[]>(res, []) ?? [];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Fetch failed");
  }
});
```

### CREATE (POST)

```ts
export const createItem = createAsyncThunk<
  YourType,
  Partial<YourType>,
  { rejectValue: string }
>("slice/create", async (payload, thunkAPI) => {
  try {
    const res = await apiCall("post", "/your-endpoint", payload);
    return pickData<YourType>(res, {} as YourType);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Create failed");
  }
});
```

### UPDATE (PATCH/PUT)

```ts
export const updateItem = createAsyncThunk<
  YourType,
  { id: string; updates: Partial<YourType> },
  { rejectValue: string }
>("slice/update", async ({ id, updates }, thunkAPI) => {
  try {
    const res = await apiCall("patch", `/your-endpoint/${id}`, updates);
    return pickData<YourType>(res, {} as YourType);
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Update failed");
  }
});
```

### DELETE

```ts
export const deleteItem = createAsyncThunk<
  { id: string },
  string,
  { rejectValue: string }
>("slice/delete", async (id, thunkAPI) => {
  try {
    await apiCall("delete", `/your-endpoint/${id}`);
    return { id };
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err?.data?.message ?? err?.message ?? "Delete failed");
  }
});
```

## 4) Slice Şablonu

```ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "react-toastify";
import apiCall from "@/lib/apiCall";

interface YourType { /* ... */ }

interface YourSliceState {
  list: YourType[];
  selected: YourType | null;
  loading: boolean;
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  successMessage: string | null;
}
const initialState: YourSliceState = {
  list: [],
  selected: null,
  loading: false,
  status: "idle",
  error: null,
  successMessage: null,
};

// --- pickData helper (opsiyonel) ---
const pickData = <T,>(res: any, fallback: T): T =>
  res && typeof res === "object" && "data" in res ? (res.data as T) : (res as T ?? fallback);

// --- Thunks (yukarıdaki şablonları kullan) ---
// export const fetchItems = ...
// export const createItem = ...
// export const updateItem = ...
// export const deleteItem = ...

const slice = createSlice({
  name: "yourSlice",
  initialState,
  reducers: {
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    clearSelected: (state) => {
      state.selected = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // FETCH
      .addCase(fetchItems.fulfilled, (state, action: PayloadAction<YourType[]>) => {
        state.list = action.payload ?? [];
        state.loading = false;
        state.status = "succeeded";
      })

      // CREATE
      .addCase(createItem.fulfilled, (state, action: PayloadAction<YourType>) => {
        const item = action.payload;
        if (item) state.list.push(item);
        state.successMessage = "Created successfully.";
        toast.success(state.successMessage);
        state.loading = false;
        state.status = "succeeded";
      })

      // UPDATE
      .addCase(updateItem.fulfilled, (state, action: PayloadAction<YourType>) => {
        const updated = action.payload;
        const idx = state.list.findIndex((x) => x.id === (updated as any).id);
        if (idx !== -1) state.list[idx] = updated;
        state.successMessage = "Updated.";
        toast.success(state.successMessage);
        state.loading = false;
        state.status = "succeeded";
      })

      // DELETE
      .addCase(deleteItem.fulfilled, (state, action: PayloadAction<{ id: string }>) => {
        state.list = state.list.filter((x) => x.id !== action.payload.id);
        state.successMessage = "Deleted.";
        toast.success(state.successMessage);
        state.loading = false;
        state.status = "succeeded";
      })

      // --- GENEL MATCHERLAR ---
      .addMatcher(
        (action) => action.type.startsWith("yourSlice/") && action.type.endsWith("/pending"),
        (state) => {
          state.loading = true;
          state.status = "loading";
          state.error = null;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith("yourSlice/") && action.type.endsWith("/rejected"),
        (state, action: any) => {
          state.loading = false;
          state.status = "failed";
          state.error = action.payload?.message || action.payload || "Operation failed!";
          toast.error(state.error);
        }
      );
  },
});

export const { clearMessages, clearSelected } = slice.actions;
export default slice.reducer;
```

## 5) Kısa Kontrol Listesi

* [ ] **`res` kullan** (`res.data` değil).
* [ ] Thunk’larda **`apiCall`’a ekstra header/config verme**.
* [ ] Hataları `rejectWithValue(err?.data?.message ?? err?.message ?? "...")` ile normalize et.
* [ ] GET parametrelerini 3. argümana ver: `apiCall("get", "/p", { q: "..." })`.
* [ ] FormData varsa `new FormData()` kullan; header setleme.
* [ ] Array merge logic: update → index bul değiştir; delete → filtrele; create → push.
* [ ] `toast` sadece **fulfilled**’larda (veya gerekli kritik hata durumlarında) çağır.
* [ ] `clearMessages`/`clearSelected` gibi ufak yardımcı reducer’lar ekle.

Bunlara uyarak yazdığın tüm slice’lar, mevcut `api.ts + apiCall.ts + tenant.ts` mimarisiyle temiz şekilde çalışır; ayrıca “401/403”’lar interceptor ve `apiCall` tarafında zaten sakince yönetiliyor.
