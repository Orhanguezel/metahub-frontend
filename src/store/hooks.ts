// src/store/hooks.ts
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./index";

// useAppDispatch: AppDispatch tipinde dispatch
export const useAppDispatch = () => useDispatch<AppDispatch>();

// ✅ useAppSelector: RootState tipinde selector (Eksik olan bu!)
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
