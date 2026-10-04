import {prisma} from "../../lib/prisma";

export const authRepository = {
  findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {email},
      include: {memberships: true},
    });
  },

  createLearner(input: {
    email: string;
    passwordHash: string;
    fullName: string;
    avatarInitials: string;
  }) {
    return prisma.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        fullName: input.fullName,
        avatarInitials: input.avatarInitials,
        role: "learner",
        learnerProfile: {create: {}},
      },
    });
  },

  findUserById(id: string) {
    return prisma.user.findUnique({
      where: {id},
      include: {memberships: true},
    });
  },

  updatePassword(id: string, passwordHash: string) {
    return prisma.user.update({
      where: {id},
      data: {passwordHash},
    });
  },
};