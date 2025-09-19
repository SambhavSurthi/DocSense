import express from 'express';
import { 
  getPendingRequests, 
  approveUser, 
  rejectUser, 
  getAllUsers,
  updateUserRole,
  deleteUser,
  toggleUserApproval
} from '../controllers/adminController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { superuserOnly } from '../middleware/roleMiddleware.js';
import { validate } from '../utils/validators.js';
import { updateUserRoleSchema } from '../utils/validators.js';

const router = express.Router();

// All admin routes require authentication and superuser role
router.use(authMiddleware);
router.use(superuserOnly);

// Admin routes
router.get('/requests', getPendingRequests);
router.get('/users', getAllUsers);
router.post('/requests/:userId/approve', approveUser);
router.post('/requests/:userId/reject', rejectUser);

// User management routes
router.put('/users/:userId/role', validate(updateUserRoleSchema), updateUserRole);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/toggle-approval', toggleUserApproval);

export default router;
