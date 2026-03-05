import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_por_defecto';

export const registerUserService = async (data: any) => {
  const { name, email, password } = data;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    throw new Error('El correo ya está registrado'); 
  }
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);
  return await prisma.user.create({
    data: { name, email, password_hash, role: 'cliente' },
    select: { id: true, name: true, email: true, role: true, created_at: true }
  });
};

export const loginUserService = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('Credenciales inválidas');

  const isPasswordValid = await bcrypt.compare(password, user.password_hash);
  if (!isPasswordValid) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    { userId: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { token, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
};

export const getAdminStatsService = async () => {
  const totalUsers = await prisma.user.count({ where: { role: 'cliente' } });
  return totalUsers;
};