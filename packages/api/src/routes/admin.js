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
router.get('/categories', adminController.getCategories);
router.post('/categories', adminController.createCategory);
router.put('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// Products
router.get('/products', adminController.getProducts);
router.post('/products', adminController.createProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Settings
router.get('/settings', adminController.getSettings);
router.put('/settings', adminController.updateSettings);

// System
router.get('/reports/stats', adminController.getReportStats);

// Auction moderation (pending approval)
router.get('/auctions/pending', adminController.getPendingAuctions);
router.post('/auctions/:id/approve', adminController.approveAuction);
router.post('/auctions/:id/reject', adminController.rejectAuction);

export default router;
