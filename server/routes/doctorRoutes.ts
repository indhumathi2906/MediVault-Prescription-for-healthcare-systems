import { Router } from 'express';
import { getDoctors, getDoctorById, getDoctorDashboard, getDoctorPatients } from '../controllers/doctorController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/role.js';

const router = Router();

// Public doctor discovery or authenticated
router.get('/', getDoctors);
router.get('/dashboard', authenticateJWT, authorizeRole('doctor'), getDoctorDashboard);
router.get('/:id/patients', authenticateJWT, authorizeRole('doctor', 'admin'), getDoctorPatients);
router.get('/:id', getDoctorById);

export default router;
