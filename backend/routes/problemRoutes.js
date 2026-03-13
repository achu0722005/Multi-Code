import { Router } from 'express';
import { getRandomProblem } from '../controllers/problemController.js';

const router = Router();

router.get('/random', getRandomProblem);

export default router;

