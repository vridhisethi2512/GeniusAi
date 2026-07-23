import { Router } from 'express';
import { 
    uploadResume, 
    getResumes, 
    getResumeById, 
    deleteResume, 
    analyzeResume 
} from '../controllers/resume.controller.js';
import { verifyJWT } from '../middlewares/auth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

// All resume routes require authentication
router.use(verifyJWT);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getResumes);

router.route('/:id')
    .get(getResumeById)
    .delete(deleteResume);

router.post('/:id/analyze', analyzeResume);

export default router;
