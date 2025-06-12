import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchSettings } from "@/modules/settings/slice/settingSlice";
import { fetchCompanyInfo } from "@/modules/company/slice/companySlice";

export const usePublicLayoutInit = () => {
  const dispatch = useAppDispatch();

  const {
    loading: settingsLoading,
    error: settingsError,
    fetchedSettings,
  } = useAppSelector((state) => state.setting);

  const {
    company,
    status: companyStatus,
    error: companyError,
  } = useAppSelector((state) => state.company);

  useEffect(() => {
    if (!fetchedSettings) dispatch(fetchSettings());
    if (!company && companyStatus === "idle") dispatch(fetchCompanyInfo());
  }, [dispatch, fetchedSettings, company, companyStatus]);

  return {
    settingsLoading,
    settingsError,
    company,
    companyStatus,
    companyError,
  };
};
