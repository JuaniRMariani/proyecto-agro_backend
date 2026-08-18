export enum AccountRole {
  PRODUCER = 'producer',
  VETERINARIAN = 'veterinarian',
  PROFESSIONAL = 'professional',
}

export const PROFESSIONAL_ACCOUNT_ROLES = [
  AccountRole.VETERINARIAN,
  AccountRole.PROFESSIONAL,
] as const;

export function isProfessionalAccountRole(
  role: AccountRole,
): role is (typeof PROFESSIONAL_ACCOUNT_ROLES)[number] {
  return role === AccountRole.VETERINARIAN || role === AccountRole.PROFESSIONAL;
}
