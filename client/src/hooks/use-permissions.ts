import { useQuery } from "@tanstack/react-query";
import { useAuth } from "./use-auth";

export interface PermissionDefinition {
  id: number;
  code: string;
  name: string;
  description: string | null;
  module: string;
  category: string | null;
  isActive: boolean | null;
  sortOrder: number | null;
  createdAt: Date | null;
}

export interface CompanyRole {
  id: number;
  companyId: number | null;
  code: string;
  name: string;
  description: string | null;
  color: string | null;
  permissions: string[] | null;
  isSystem: boolean | null;
  isActive: boolean | null;
  sortOrder: number | null;
  createdBy: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface UserRoleAssignment {
  id: number;
  userId: string;
  companyId: number;
  roleId: number;
  assignedBy: string | null;
  assignedAt: Date | null;
  expiresAt: Date | null;
  isActive: boolean | null;
  createdAt: Date | null;
  role: CompanyRole;
}

export function usePermissions() {
  const { user, isLoading: authLoading } = useAuth();

  const { data: permissions = [], isLoading: permissionsLoading } = useQuery<string[]>({
    queryKey: ["/api/my-permissions"],
    enabled: !!user,
  });

  const { data: allPermissions = [], isLoading: allPermissionsLoading } = useQuery<PermissionDefinition[]>({
    queryKey: ["/api/permissions"],
    enabled: !!user,
  });

  const { data: roles = [], isLoading: rolesLoading } = useQuery<CompanyRole[]>({
    queryKey: ["/api/roles"],
    enabled: !!user,
  });

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role === "admin_mcg") return true;
    if (user.fullAccessGranted) return true;
    if (user.role === "admin") {
      const adminPerms = ["admin.users", "admin.roles", "admin.settings", "admin.billing"];
      if (adminPerms.includes(permissionCode)) return true;
    }
    return permissions.includes(permissionCode);
  };

  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => hasPermission(code));
  };

  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => hasPermission(code));
  };

  const hasModuleAccess = (module: string): boolean => {
    if (!user) return false;
    if (user.role === "admin_mcg") return true;
    if (user.fullAccessGranted) return true;
    return permissions.some(p => p.startsWith(`${module}.`));
  };

  const canView = (module: string): boolean => hasPermission(`${module}.view`);
  const canCreate = (module: string): boolean => hasPermission(`${module}.create`);
  const canEdit = (module: string): boolean => hasPermission(`${module}.edit`);
  const canDelete = (module: string): boolean => hasPermission(`${module}.delete`);
  const canExport = (module: string): boolean => hasPermission(`${module}.export`);
  const canApprove = (module: string): boolean => hasPermission(`${module}.approve`);
  const canManage = (module: string): boolean => hasPermission(`${module}.manage`);

  const getPermissionsByModule = (module: string): PermissionDefinition[] => {
    return allPermissions.filter(p => p.module === module);
  };

  const getAvailableModules = (): string[] => {
    const modules = new Set(allPermissions.map(p => p.module));
    return Array.from(modules);
  };

  return {
    permissions,
    allPermissions,
    roles,
    isLoading: authLoading || permissionsLoading,
    allPermissionsLoading,
    rolesLoading,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasModuleAccess,
    canView,
    canCreate,
    canEdit,
    canDelete,
    canExport,
    canApprove,
    canManage,
    getPermissionsByModule,
    getAvailableModules,
  };
}

export function useRoles() {
  const { data: roles = [], isLoading } = useQuery<CompanyRole[]>({
    queryKey: ["/api/roles"],
  });

  return { roles, isLoading };
}

export function useUserRoles(userId: string) {
  const { data: assignments = [], isLoading } = useQuery<UserRoleAssignment[]>({
    queryKey: ["/api/users", userId, "roles"],
    enabled: !!userId,
  });

  return { assignments, isLoading };
}
