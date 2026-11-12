export interface SuperAdmin {
  id: number;
  email: string;
  name: string;
  passwordHash: string;
  isActive: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export type PublicSuperAdmin = Omit<SuperAdmin, 'passwordHash'>;

export function toPublicAdmin({
  passwordHash: _passwordHash,
  ...admin
}: SuperAdmin): PublicSuperAdmin {
  return admin;
}

export const normalizeEmail = (email: string): string => email.trim().toLowerCase();
