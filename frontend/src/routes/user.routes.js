import { Router } from 'express';
import { 
    getProfile, 
    updateProfile, 
    updateAvatar, 
    getInterviewStats, 
    deleteAccount 
} from '../controllers/user.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// All user routes require authentication
router.use(verifyJWT);

router.route('/profile')
    .get(getProfile)
    .patch(updateProfile);

router.patch('/avatar', upload.single('avatar'), updateAvatar);
router.get('/stats', getInterviewStats);
router.delete('/account', deleteAccount);

export default router;
