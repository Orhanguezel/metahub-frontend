
 import storage from "redux-persist/lib/storage";
 import { PersistConfig } from "redux-persist";
 import type { AccountState } from "@/modules/users/slice/accountSlice";
 import type { AuthState } from "@/modules/users/slice/authSlice";
 

 export const accountPersistConfig: PersistConfig<AccountState> = {
   key: "account",
   storage,
   whitelist: ["profile"],
 };
 export const authPersistConfig: PersistConfig<AuthState> = {
   key: "auth",
   storage,
   whitelist: ["user"],
 };