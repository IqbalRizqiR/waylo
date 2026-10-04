import type {AuthUser, ChangePasswordInput, LoginInput, RegisterInput} from "@waylo/shared";
import {authRepository} from "./auth.repository";
import {HttpError} from "../../lib/http";
import {hashPassword, initialsFromName, verifyPassword} from "../../lib/tokens";
import {signAccessToken, signRefreshToken} from "../../lib/tokens";

function toAuthUser(user: {
  id: string;
  email: string;
  fullName: string;
  role: AuthUser["role"];
  avatarInitials: string;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    avatarInitials: user.avatarInitials,
  };
}

export const authService = {
  async register(input: RegisterInput) {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw HttpError.conflict("Email sudah terdaftar.", "email_taken");
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createLearner({
      email: input.email,
      passwordHash,
      fullName: input.fullName,
      avatarInitials: initialsFromName(input.fullName),
    });

    return this.issueSession(user);
  },

  async login(input: LoginInput) {
    const user = await authRepository.findUserByEmail(input.email);
    // Same message for missing user and wrong password, to avoid account enumeration.
    const invalid = !user ? HttpError.unauthorized(
      "Email anda tidak terdaftar.",
      "invalid_email",
    ) : HttpError.unauthorized(
      "Email atau kata sandi salah.",
      "invalid_credentials",
    );

    if (!user) {
      throw invalid;
    }
    const matches = await verifyPassword(input.password, user.passwordHash);
    if (!matches) {
      throw invalid;
    }

    return this.issueSession(user);
  },

  async refresh(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw HttpError.unauthorized();
    }
    return this.issueSession(user);
  },

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw HttpError.notFound("Pengguna tidak ditemukan.");
    }
    return toAuthUser(user);
  },

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw HttpError.notFound("Pengguna tidak ditemukan.");
    }

    const matches = await verifyPassword(input.currentPassword, user.passwordHash);
    if (!matches) {
      throw HttpError.badRequest(
        "Kata sandi saat ini tidak sesuai.",
        "invalid_current_password",
      );
    }

    const newHash = await hashPassword(input.newPassword);
    await authRepository.updatePassword(userId, newHash);
    return {success: true};
  },

  issueSession(user: {
    id: string;
    email: string;
    fullName: string;
    role: AuthUser["role"];
    avatarInitials: string;
    memberships?: {companyId: string}[] | undefined;
  }) {
    const companyId = user.memberships?.[0]?.companyId;
    const payload = {sub: user.id, role: user.role, companyId};

    return {
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: toAuthUser(user),
    };
  },
};