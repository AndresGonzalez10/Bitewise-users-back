import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secreto_por_defecto';

export const registerUserService = async (data: any) => {
  const { name, email, password, weekly_budget } = data;

  const userExists = await prisma.users.findUnique({ where: { email } });
  if (userExists) {
    throw new Error('El correo ya está registrado'); 
  }
  
  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  
  return await prisma.users.create({
    data: { 
      name, 
      email, 
      password: hashedPassword, 
      role: 'cliente',
      weekly_budget: weekly_budget ? Number(weekly_budget) : 0 
    },
    select: { id: true, name: true, email: true, role: true, weekly_budget: true, created_at: true }
  });
};

export const loginUserService = async (data: any) => {
  const { email, password } = data;

  const user = await prisma.users.findUnique({ where: { email } });
  if (!user) throw new Error('Credenciales inválidas');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw new Error('Credenciales inválidas');

  const token = jwt.sign(
    { userId: user.id, name: user.name, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  return { 
    token, 
    user: { 
      id: user.id, 
      name: user.name, 
      email: user.email, 
      role: user.role,
      weekly_budget: user.weekly_budget 
    } 
  };
};

export const getAdminStatsService = async () => {
  const totalUsers = await prisma.users.count({ where: { role: 'cliente' } });
  return totalUsers;
};


export const getUserProfileService = async (userId: string) => {
  const user = await prisma.users.findUnique({
    where: { id: userId },
    select: { 
      id: true, 
      name: true, 
      email: true, 
      weekly_budget: true, 
      role: true,
      created_at: true 
    }
  });

  if (!user) throw new Error('Usuario no encontrado');
  return user;
};

export const updateUserProfileService = async (userId: string, data: any) => {
  const { weekly_budget, name } = data;

  return await prisma.users.update({
    where: { id: userId },
    data: {
      name: name || undefined,
      weekly_budget: weekly_budget !== undefined ? Number(weekly_budget) : undefined
    },
    select: { id: true, name: true, weekly_budget: true }
  });
};