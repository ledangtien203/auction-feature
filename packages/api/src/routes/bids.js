import { Router } from 'express';
import { authRequired } from '../middleware/auth.js';
import { bidController } from '../controllers/bidController.js';

const router = Router();

router.get('/me', authRequired, bidController.getMyBids);
router.post('/auctions/:auctionId', authRequired, bidController.placeBid);
router.get('/won', authRequired, bidController.getWonAuctions);

export default router;
