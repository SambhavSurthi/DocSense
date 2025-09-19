import express from 'express';
import { getDocuments, updatePersonalization } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { validate } from '../utils/validators.js';
import { updateUserSchema } from '../utils/validators.js';

const router = express.Router();

// All user routes require authentication
router.use(authMiddleware);

// User routes
router.get('/docs', getDocuments);
router.put('/personalize', validate(updateUserSchema), updatePersonalization);

export default router;
