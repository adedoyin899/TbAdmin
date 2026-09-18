import type { UserRole } from './database.js';

export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  name?: string;
  email: string;
  role: UserRole;
  isOwner?: boolean;
  createdAt?: string;
  lastLogin?: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
