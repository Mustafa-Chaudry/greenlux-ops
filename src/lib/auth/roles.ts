export const userRoles = ["guest", "manager", "admin", "super_admin"] as const;
export type UserRole = (typeof userRoles)[number];

export const managementRoles = ["manager", "admin", "super_admin"] as const satisfies readonly UserRole[];
export const staffGuestCreationRoles = ["admin", "super_admin"] as const satisfies readonly UserRole[];
export const superAdminRoles = ["super_admin"] as const satisfies readonly UserRole[];

export function hasAllowedRole(role: UserRole, allowedRoles: readonly UserRole[]) {
  return allowedRoles.includes(role);
}

export function canAccessManagement(role: UserRole) {
  return hasAllowedRole(role, managementRoles);
}

export function canAccessBusinessIntelligence(role: UserRole) {
  return hasAllowedRole(role, superAdminRoles);
}
