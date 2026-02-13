export type UserRole = 'ADMIN' | 'OWNER' | 'CLIENT';

export interface AuthUser {
  sub: string;
  name: string;
  email: string;
  role: UserRole;
}
