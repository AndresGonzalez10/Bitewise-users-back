import { Request, Response } from 'express';
import { registerUserService, loginUserService, getAdminStatsService } from '../services/userService';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const newUser = await registerUserService(req.body);
    res.status(201).json({ message: 'Usuario registrado exitosamente', user: newUser });
  } catch (error: any) {
    if (error.message === 'El correo ya está registrado') {
      res.status(400).json({ error: error.message });
      return;
    }
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = await loginUserService(req.body);
    res.json({ message: 'Login exitoso', ...data });
  } catch (error: any) {
    if (error.message === 'Credenciales inválidas') {
      res.status(401).json({ error: error.message });
      return;
    }
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const getAdminStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    const totalUsers = await getAdminStatsService();

    res.json({
      message: 'Estadísticas obtenidas con éxito (Parcial en SOA)',
      stats: {
        total_clientes: totalUsers,
        listas_generadas: 0, 
        dinero_gestionado_mxn: 0 
      }
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al calcular las estadísticas' });
  }
};