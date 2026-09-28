import { Router } from 'express';
import {
  createPrescription,
  getPrescriptionsByPatient,
  getPrescriptionById,
} from '../controllers/prescriptionController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/role.js';

const router = Router();

router.use(authenticateJWT);

router.post('/', authorizeRole('doctor'), createPrescription);
router.get('/patient/:patientId', getPrescriptionsByPatient);
router.get('/:id', getPrescriptionById);

export default router;
