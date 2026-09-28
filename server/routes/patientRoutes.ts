import { Router } from 'express';
import { getProfile, updateProfile, getDashboard, getHistory } from '../controllers/patientController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/role.js';

const router = Router();

router.use(authenticateJWT);

router.get('/profile', authorizeRole('patient'), getProfile);
router.put('/profile', authorizeRole('patient'), updateProfile);
router.get('/dashboard', authorizeRole('patient'), getDashboard);
router.get('/:id/history', authorizeRole('patient', 'doctor', 'admin'), getHistory);

export default router;
