import { Router } from 'express';
import { 
    register, 
    login, 
    logout, 
    refreshAccessToken, 
    changeCurrentPassword, 
    getCurrentUser 
} from '../controllers/auth.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshAccessToken);

// Secured routes
router.post('/logout', verifyJWT, logout);
router.post('/change-password', verifyJWT, changeCurrentPassword);
router.get('/me', verifyJWT, getCurrentUser);

export default router;
