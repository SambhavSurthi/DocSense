import express from 'express';
import { register, login, refresh, logout, getMe } from '../controllers/authController.js';
import { validate } from '../utils/validators.js';
import { registerSchema, loginSchema } from '../utils/validators.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected routes
router.get('/me', authMiddleware, getMe);

export default router;
