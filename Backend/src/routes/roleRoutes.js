import express from 'express';
import { 
  getAllRoles, 
  getActiveRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  getRoleStats 
} from '../controllers/roleController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { superuserOnly } from '../middleware/roleMiddleware.js';
import { validate } from '../utils/validators.js';
import { createRoleSchema, updateRoleSchema } from '../utils/validators.js';

const router = express.Router();

// Public route for getting active roles (for registration)
router.get('/active', getActiveRoles);

// All other routes require authentication and superuser role
router.use(authMiddleware);
router.use(superuserOnly);

// Role management routes
router.get('/', getAllRoles);
router.get('/stats', getRoleStats);
router.post('/', validate(createRoleSchema), createRole);
router.put('/:roleId', validate(updateRoleSchema), updateRole);
router.delete('/:roleId', deleteRole);

export default router;
