import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getAllUsersService = async () => {
  return await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      created_at: true
    }
  });
};