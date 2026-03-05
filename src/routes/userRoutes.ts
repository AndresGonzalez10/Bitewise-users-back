import { Router } from 'express';
import { registerUser, loginUser, getAdminStats } from '../controllers/userController';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/stats', getAdminStats);

export default router;