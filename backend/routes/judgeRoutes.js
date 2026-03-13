import { Router } from 'express';
import { runCode, submitSolution } from '../controllers/judgeController.js';

const router = Router();

router.post('/run', runCode);
router.post('/submit', submitSolution);

export default router;

