export enum UserRole {
  STAFF = 'staff',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  schoolAffiliation: string;
  departureDate: Date | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
  schoolAffiliation: string;
  role?: UserRole;
}

export interface UpdateUserData {
  name?: string;
  schoolAffiliation?: string;
  departureDate?: Date | null;
  emailVerified?: boolean;
}

export interface UserPublic {
  id: string;
  email: string;
  name: string;
  schoolAffiliation: string;
  departureDate: Date | null;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
}
