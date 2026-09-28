import { Router } from 'express';
import {
  createConsultation,
  getConsultationsByPatient,
  getConsultationById,
} from '../controllers/consultationController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/role.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRole('doctor'), createConsultation);
router.get('/patient/:patientId', getConsultationsByPatient);
router.get('/:id', getConsultationById);

export default router;
