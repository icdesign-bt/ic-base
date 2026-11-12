import type { Acl, RoleId } from '@/types/knowledge';

/** Пустой ACL = доступно всем ролям демо. */
export function canView(acl: Acl, role: RoleId): boolean {
  if (acl.length === 0) return true;
  return acl.includes(role);
}
