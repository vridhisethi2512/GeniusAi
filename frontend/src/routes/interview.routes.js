import { Router } from 'express';
import { 
    createInterviewSession, 
    getInterviewSessions, 
    getSessionById, 
    submitAnswer, 
    endInterviewSession 
} from '../controllers/interview.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// All interview routes require authentication
router.use(verifyJWT);

router.route('/sessions')
    .post(createInterviewSession)
    .get(getInterviewSessions);

router.get('/sessions/:id', getSessionById);
router.post('/sessions/:id/answers', submitAnswer);
router.post('/sessions/:id/end', endInterviewSession);

export default router;
