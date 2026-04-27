import type { UserRole, UserStatus } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  phone: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
};

export type RequestWithUser = {
  user: AuthenticatedUser;
};
