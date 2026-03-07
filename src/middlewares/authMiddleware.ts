import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_por_defecto';

export interface AuthRequest extends Request {
  user?: any;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];

  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Acceso denegado. No se proporcionó un token de seguridad.' });
    return;
  }


  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; 
    next(); 
  } catch (error) {
    res.status(403).json({ error: 'El token es inválido o ya expiró. Por favor, inicia sesión de nuevo.' });
  }
};

export const verifyAdmin = (req: AuthRequest, res: Response, next: NextFunction): void => {
 
  if (!req.user) {
    res.status(401).json({ error: 'No autorizado. Debes iniciar sesión primero.' });
    return;
  }

  if (req.user.role !== 'administrador') {
    res.status(403).json({ error: 'Acceso denegado. Solo los administradores pueden ver esta información.' });
    return;
  }

  next();
};