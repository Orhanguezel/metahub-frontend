// src/types/adminTypes.ts


export interface Label {
    tr: string;
    en: string;
    de: string;
  }
  
  // ✅ AdminModule tipi:
  export interface AdminModule {
    name: string;
    label: Label;
    icon: string;
    roles: string[];
    enabled: boolean;
    visibleInSidebar: boolean;
    useAnalytics: boolean;
    version: string;
    createdAt: string;
    updatedAt: string;
    order: number;
    statsKey?: string;         
    showInDashboard?: boolean; 
  }
  