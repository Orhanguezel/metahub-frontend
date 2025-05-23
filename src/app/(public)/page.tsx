"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAvailableProjects,
  fetchAdminModules,
  setSelectedProject,
} from "@/modules/adminmodules/slice/adminModuleSlice";
import {Loading,ErrorMessage} from "@/shared";
import HomePage from "@/modules/home/public/pages/HomePage";

export default function HomeRouterPage() {
  const dispatch = useAppDispatch();

  const {
    availableProjects,
    selectedProject,
    loading: projectsLoading,
    error: projectsError,
    fetchedAvailableProjects,
  } = useAppSelector((state) => state.admin);

  useEffect(() => {
    if (!fetchedAvailableProjects) {
      dispatch(fetchAvailableProjects());
    }
  }, [dispatch, fetchedAvailableProjects]);

  useEffect(() => {
    if (
      Array.isArray(availableProjects) &&
      availableProjects.length > 0 &&
      !selectedProject
    ) {
      dispatch(setSelectedProject(availableProjects[0]));
    }
  }, [availableProjects, selectedProject, dispatch]);

  useEffect(() => {
    if (selectedProject) {
      dispatch(fetchAdminModules(selectedProject));
    }
  }, [selectedProject, dispatch]);

  if (projectsLoading) return <Loading />;
  if (projectsError) return <ErrorMessage />;

  return (
    <main>
      <HomePage />
    </main>
  );
}
