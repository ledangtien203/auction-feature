import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { authController } from '../controllers/authController.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/me', authRequired, authController.me);
router.patch('/update-profile', authRequired, authController.updateProfile);

export default router;
