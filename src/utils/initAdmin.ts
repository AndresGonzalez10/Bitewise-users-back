import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const initAdmin = async () => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.warn('⚠️ No se encontraron credenciales de administrador en el .env');
    return;
  }

  try {
    const adminExists = await prisma.user.findUnique({
      where: { email: adminEmail }
    });

    if (!adminExists) {
      const saltRounds = 10;
      const password_hash = await bcrypt.hash(adminPassword, saltRounds);

      await prisma.user.create({
        data: {
          name: 'Admin',
          email: adminEmail,
          password_hash: password_hash,
          role: 'administrador'
        }
      });
      console.log('🛡️ Cuenta de Administrador creada de forma 100% segura desde el .env');
    } else {
       console.log('🛡️ La cuenta de Administrador ya estaba inicializada.');
    }
  } catch (error) {
    console.error('Error al inicializar el administrador:', error);
  }
};