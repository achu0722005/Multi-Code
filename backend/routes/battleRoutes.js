import { Router } from 'express';
import { getLeaderboard } from '../controllers/battleController.js';

const router = Router();

router.get('/leaderboard', getLeaderboard);

export default router;

