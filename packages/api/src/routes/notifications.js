import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { notificationController } from '../controllers/notificationController.js';

const router = Router();

router.get('/me', authRequired, notificationController.getMyNotifications);
router.get('/me/unread-count', authRequired, notificationController.getUnreadCount);
router.put('/read-all', authRequired, notificationController.markAllAsRead);
router.put('/:id/read', authRequired, notificationController.markAsRead);

export default router;
