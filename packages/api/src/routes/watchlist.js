import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { watchlistController } from '../controllers/watchlistController.js';

const router = Router();

router.get('/', authRequired, watchlistController.getWatchlist);
router.post('/:auctionId', authRequired, watchlistController.addToWatchlist);
router.delete('/:auctionId', authRequired, watchlistController.removeFromWatchlist);
router.get('/check/:auctionId', authRequired, watchlistController.checkWatchlist);

export default router;
