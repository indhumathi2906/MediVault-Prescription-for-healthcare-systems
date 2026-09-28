import { Router } from 'express';
import { getDashboardStats, getUsers, updateUserStatus } from '../controllers/adminController.js';
import { authenticateJWT } from '../middleware/auth.js';
import { authorizeRole } from '../middleware/role.js';

const router = Router();

router.use(authenticateJWT, authorizeRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getUsers);
router.put('/users/:id/status', updateUserStatus);

export default router;
