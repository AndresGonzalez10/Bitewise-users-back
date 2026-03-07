import { Router } from 'express';
import { registerUser, loginUser, getAdminStats,getUserProfile,updateUserProfile } from '../controllers/userController';
import { verifyToken, verifyAdmin } from '../middlewares/authMiddleware';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/stats',verifyToken,verifyAdmin, getAdminStats);
router.get('/:id',verifyToken, getUserProfile);
router.put('/:id',verifyToken, updateUserProfile);

export default router;