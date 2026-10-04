import jwt, {type SignOptions} from "jsonwebtoken";
import bcrypt from "bcryptjs";
import {config} from "../config";
import type {AuthTokenPayload} from "../types/auth";

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export function signAccessToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.accessTtl as SignOptions["expiresIn"],
    issuer: "waylo-api",
    audience: "waylo-web",
  };
  return jwt.sign(payload, config.jwt.accessSecret, options);
}

export function signRefreshToken(payload: AuthTokenPayload): string {
  const options: SignOptions = {
    expiresIn: config.jwt.refreshTtl as SignOptions["expiresIn"],
    issuer: "waylo-api",
    audience: "waylo-web",
  };
  return jwt.sign(payload, config.jwt.refreshSecret, options);
}

export function verifyAccessToken(token: string): AuthTokenPayload {
  return jwt.verify(token, config.jwt.accessSecret, {
    issuer: "waylo-api",
    audience: "waylo-web",
  }) as AuthTokenPayload;
}

export function verifyRefreshToken(token: string): AuthTokenPayload {
  return jwt.verify(token, config.jwt.refreshSecret, {
    issuer: "waylo-api",
    audience: "waylo-web",
  }) as AuthTokenPayload;
}

export function initialsFromName(fullName: string): string {
  return fullName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}