import { useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAvailableProjects,
  fetchAdminModules,
  setSelectedProject,
} from "@/modules/adminmodules/slice/adminModuleSlice";
import * as MdIcons from "react-icons/md";

/* ---------------------------------------
 ✅ Admin Sayfa Başlatıcı (Router için)
---------------------------------------- */
export const useAdminPageInit = () => {
  const dispatch = useAppDispatch();
  const {
    availableProjects,
    selectedProject,
    loading,
    error,
    fetchedAvailableProjects,
  } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (!fetchedAvailableProjects) {
      dispatch(fetchAvailableProjects());
    }
  }, [dispatch, fetchedAvailableProjects]);

  useEffect(() => {
    if (availableProjects.length > 0 && !selectedProject) {
      dispatch(setSelectedProject(availableProjects[0]));
    }
  }, [availableProjects, selectedProject, dispatch]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchAdminModules(selectedProject));
    }
  }, [selectedProject, dispatch]);

  return { loading, error };
};

/* ---------------------------------------
 ✅ Sidebar Modülleri
---------------------------------------- */
export const useAdminSidebarModules = () => {
  const { modules, loading, error } = useAppSelector((state) => state.admin);

  const sidebarModules = useMemo(() => {
    return (
      modules
        ?.filter((mod) => mod.enabled && mod.visibleInSidebar)
        .map((mod) => ({
          key: mod.name,
          path: mod.name === "dashboard" ? "/admin" : `/admin/${mod.name}`,
          label: mod.label, // Çok dilli destekli label zaten backend'den geliyor
          icon: getDynamicIcon(mod.icon),
        })) || []
    );
  }, [modules]);

  return { sidebarModules, loading, error };
};

/* ---------------------------------------
 ✅ Admin Page Builder Modülleri
---------------------------------------- */
export const useGetAdminModules = () => {
  const { modules, loading, error } = useAppSelector((state) => state.admin);

  const transformedModules = useMemo(() => {
    return (
      modules?.map((mod) => ({
        id: mod.name,
        visible: mod.enabled !== false,
        props: {
          label: mod.label,
          icon: mod.icon,
          enabled: mod.enabled,
        },
      })) || []
    );
  }, [modules]);

  return {
    data: { modules: transformedModules },
    isLoading: loading,
    error,
  };
};

/* ---------------------------------------
 🎨 Dinamik İkon
---------------------------------------- */
const getDynamicIcon = (iconName?: string) => {
  if (!iconName) return MdIcons.MdSettings;
  const IconComponent = (MdIcons as Record<string, any>)[iconName];
  return IconComponent || MdIcons.MdSettings;
};
