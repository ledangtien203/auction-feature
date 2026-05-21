import { Router } from 'express';
import { auctionController } from '../controllers/auctionController.js';

const router = Router();

router.get('/', auctionController.getAll);
router.get('/featured', auctionController.getFeatured);
router.get('/trending', auctionController.getTrending);
router.get('/:id', auctionController.getById);
router.get('/:id/bids', auctionController.getBidHistory);

export default router;
