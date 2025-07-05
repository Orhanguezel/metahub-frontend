import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSettings } from "@/modules/settings/slice/settingsSlice";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";

/**
 * Public layout için global init hook.
 * - Settings ve company sadece ilk mount’ta ve yoksa fetch edilir.
 * - Asla tekrar fetch yapılmaz.
 */
export const usePublicLayoutInit = () => {
  const dispatch = useAppDispatch();

  const {
    loading: settingsLoading,
    error: settingsError,
    fetchedSettings,
    settings,
  } = useAppSelector((state) => state.setting);

  const {
    company,
    status: companyStatus,
    error: companyError,
  } = useAppSelector((state) => state.company);

  // Sadece ilk mount'ta fetch (didInit ile koruma)
  const didInit = useRef(false);

  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;

    if (!fetchedSettings) {
      dispatch(fetchSettings());
    }
    if (!company && companyStatus === "idle") {
      dispatch(fetchCompanyInfo());
    }
    // Eğer ileride başka fetch’ler olursa buraya ekle (ör: tenant/public data)
  }, [dispatch]);
  // Dependency array'de sadece dispatch! didInit ve mevcut state, fetchleri tekrar tetiklemeyecek.

  return {
    settingsLoading,
    settingsError,
    fetchedSettings,
    settings,
    company,
    companyStatus,
    companyError,
  };
};
