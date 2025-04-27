// src/modules/admin/adminModuleMap.ts

import UserManagementPage from "@/modules/admin/users/UserManagementPage";
import OrderManagementPage from "@/modules/admin/orders/OrderManagementPage";
import ProductManagementPage from "@/modules/admin/products/ProductManagementPage";
import BlogManagementPage from "@/modules/admin/blogs/BlogManagementPage";
// İleride admin modülleri geldikçe buraya ekleriz.

export const adminModuleMap: Record<string, React.FC<any>> = {
  "user-management": UserManagementPage,
  "order-management": OrderManagementPage,
  "product-management": ProductManagementPage,
  "blog-management": BlogManagementPage,
  // Diğer modüller...
};
