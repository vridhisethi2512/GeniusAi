import { Router } from 'express';
import { 
    getDashboardSummary, 
    getActivityLogs 
} from '../controllers/dashboard.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All dashboard routes require authentication
router.use(verifyJWT);

router.get('/summary', getDashboardSummary);
router.get('/activity-logs', getActivityLogs);

export default router;
