import { Router } from 'express';
import { authRequired, adminRequired } from '../middleware/auth.js';
import { adminController } from '../controllers/adminController.js';

const router = Router();

router.use(authRequired, adminRequired);

router.get('/dashboard', adminController.getDashboard);
router.get('/dashboard/charts/revenue', adminController.getRevenueChart);
router.get('/dashboard/charts/categories', adminController.getCategoriesChart);
router.get('/dashboard/charts/activity', adminController.getActivityChart);
router.get('/users', adminController.getUsers);
router.patch('/users/:id/status', adminController.updateUserStatus);
router.get('/auctions', adminController.getAuctions);
router.post('/auctions', adminController.createAuction);
router.put('/auctions/:id', adminController.updateAuction);
router.delete('/auctions/:id', adminController.deleteAuction);
router.post('/auctions/process-expired', adminController.processExpiredAuctions);
router.post('/auctions/:id/notify-winner', adminController.notifyWinner);
router.get('/transactions', adminController.getTransactions);
router.patch('/transactions/:id', adminController.updateTransactionStatus);

export default router;
