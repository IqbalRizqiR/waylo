import type {Role} from "@waylo/shared";

export type AuthTokenPayload = {
  sub: string;
  role: Role;
  companyId?: string;
};

export type AuthenticatedUser = {
  id: string;
  email: string;
  role: Role;
  companyId?: string;
};