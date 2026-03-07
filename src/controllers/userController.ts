import { Request, Response } from 'express';
import { registerUserService, loginUserService, getAdminStatsService,getUserProfileService,updateUserProfileService} from '../services/userService';

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  const { name, email, password, weekly_budget } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Nombre, correo y contraseña son obligatorios.' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'El formato del correo electrónico no es válido.' });
    return;
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  if (!passwordRegex.test(password)) {
    res.status(400).json({ 
      error: 'La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula y un número.' 
    });
    return;
  }

  if (weekly_budget !== undefined && isNaN(Number(weekly_budget))) {
    res.status(400).json({ error: 'El presupuesto debe ser un número válido.' });
    return;
  }

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

export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string; 

  try {
    const user = await getUserProfileService(id);
    res.json({ message: 'Perfil obtenido con éxito', user });
  } catch (error: any) {
    if (error.message === 'Usuario no encontrado') {
      res.status(404).json({ error: error.message });
      return;
    }
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const id = req.params.id as string; 
  const { weekly_budget } = req.body;

  if (weekly_budget !== undefined && isNaN(Number(weekly_budget))) {
    res.status(400).json({ error: 'El presupuesto debe ser un número válido.' });
    return;
  }

  try {
    const updatedUser = await updateUserProfileService(id, req.body);
    res.json({ 
      message: 'Perfil actualizado exitosamente', 
      user: updatedUser 
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar los datos en el servidor' });
  }
};