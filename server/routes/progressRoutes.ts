import { Router } from 'express';
import {
  createProgressRecord,
  getPatientProgress,
  getPatientProgressSummary,
  getPatientProgressMetrics,
  getProgressRecordById,
} from '../controllers/progressController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/role.js';

const router = Router();

router.use(authenticateJWT);

// Doctor posts new progress review (CRITICAL: append-only)
router.post('/', authorizeRole('doctor'), createProgressRecord);

// Patient, Doctor, Admin can view progress
router.get('/patient/:patientId', getPatientProgress);
router.get('/patient/:patientId/summary', getPatientProgressSummary);
router.get('/patient/:patientId/metrics', getPatientProgressMetrics);
router.get('/:id', getProgressRecordById);

export default router;
