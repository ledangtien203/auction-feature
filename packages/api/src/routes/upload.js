import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { uploadController, uploadMiddleware } from '../controllers/uploadController.js';

const router = Router();

router.post('/', authRequired, uploadMiddleware.single('image'), uploadController.uploadSingle);
router.post('/multiple', authRequired, uploadMiddleware.array('images', 10), uploadController.uploadMultiple);
router.use(uploadController.handleMulterError);

export default router;
